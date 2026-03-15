import { Injectable } from '@nestjs/common'
import { availableParallelism } from 'os'
import cluster from 'cluster'
import { IpcAuthMessage, DisabledCredential } from './booru/interfaces/auth-manager.interface'

const numCPUs = process.env.NODE_ENV === 'development' ? 1 : availableParallelism()

@Injectable()
export class AppClusterService {
  private static disabledCredentials = new Set<string>()

  static clusterize(callback: () => void): void {
    if (cluster.isPrimary) {
      console.log(`Primary ${process.pid} is running`)

      // Setup IPC message handling for credential management
      this.setupPrimaryIpcHandling()

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`)
        cluster.fork()
      })
    } else {
      console.log(`Worker ${process.pid} started`)
      callback()
    }
  }

  private static setupPrimaryIpcHandling(): void {
    cluster.on('message', (worker, message: IpcAuthMessage) => {
      if (message.type === 'DISABLE_CREDENTIAL') {
        const credential = message.payload as DisabledCredential
        const credentialKey = this.getCredentialKey(credential.domain, credential.user, credential.password)

        // Store in primary process
        this.disabledCredentials.add(credentialKey)

        // Broadcast to all other workers
        Object.values(cluster.workers || {}).forEach((w) => {
          if (w && w.id !== worker.id && w.process.pid !== worker.process.pid) {
            w.send(message)
          }
        })

        console.log(
          `🔄 Broadcasting disabled credential ${credentialKey} to ${Object.keys(cluster.workers || {}).length - 1} other workers`
        )
      }
    })
  }

  private static getCredentialKey(domain: string, user: string, password?: string): string {
    const encodedUser = encodeURIComponent(user)

    if (password === undefined) {
      return `${domain}:${encodedUser}`
    }

    const encodedPassword = encodeURIComponent(password)
    return `${domain}:${encodedUser}:${encodedPassword}`
  }

  static getDisabledCredentials(): Set<string> {
    return this.disabledCredentials
  }
}

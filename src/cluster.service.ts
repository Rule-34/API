import { Injectable } from '@nestjs/common'
import { availableParallelism } from 'os'
import cluster from 'cluster'
import { IpcAuthMessage } from './booru/interfaces/auth-manager.interface'
import { BooruAuthManagerService } from './booru/services/booru-auth-manager.service'

export function getWorkerCount(): number {
  if (process.env['NODE_ENV'] === 'development') {
    return 1
  }

  const configuredWorkerCount = Number.parseInt(process.env['WEB_CONCURRENCY'] ?? '', 10)

  if (Number.isFinite(configuredWorkerCount) && configuredWorkerCount > 0) {
    return configuredWorkerCount
  }

  return availableParallelism()
}

@Injectable()
export class AppClusterService {
  private static primaryAuthManager: BooruAuthManagerService | null = null

  static clusterize(callback: () => void | Promise<void>): void {
    if (cluster.isPrimary) {
      console.log(`Primary ${process.pid} is running`)

      // Setup IPC message handling for credential management
      this.setupPrimaryIpcHandling()

      for (let i = 0; i < getWorkerCount(); i++) {
        cluster.fork()
      }

      cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid ?? 'unknown'} died. Restarting...`)
        cluster.fork()
      })
    } else {
      console.log(`Worker ${process.pid} started`)
      void callback()
    }
  }

  private static setupPrimaryIpcHandling(): void {
    cluster.on('message', (worker, message: IpcAuthMessage) => {
      if (message.type === 'DISABLE_CREDENTIAL') {
        const credential = message.payload

        this.getPrimaryAuthManager().applyDisabledCredential(credential)

        // Broadcast to all other workers
        Object.values(cluster.workers ?? {}).forEach((w) => {
          if (w && w.id !== worker.id && w.process.pid !== worker.process.pid) {
            w.send(message)
          }
        })

        const scope = credential.password === undefined ? 'user-scoped' : 'password-scoped'

        console.log(
          `🔄 Broadcasting disabled ${scope} credential for ${credential.domain} to ${Object.keys(cluster.workers ?? {}).length - 1} other workers`
        )
        return
      }

      if (message.type === 'RESERVE_CREDENTIAL') {
        const payload = message.payload
        const reservation = this.getPrimaryAuthManager().reserveAvailableCredentialLocally(payload.domain)

        worker.send({
          type: 'RESERVE_CREDENTIAL_RESPONSE',
          payload: {
            requestId: payload.requestId,
            credential: reservation.credential,
            ...(reservation.retryAfterSeconds !== undefined ? { retryAfterSeconds: reservation.retryAfterSeconds } : {})
          }
        } satisfies IpcAuthMessage)
      }
    })
  }

  private static getPrimaryAuthManager(): BooruAuthManagerService {
    if (this.primaryAuthManager !== null) {
      return this.primaryAuthManager
    }

    this.primaryAuthManager = new BooruAuthManagerService({
      get: (key: string) => process.env[key]
    })
    this.primaryAuthManager.onModuleInit()

    return this.primaryAuthManager
  }
}

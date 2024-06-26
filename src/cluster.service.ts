import { Injectable } from '@nestjs/common'
import { availableParallelism } from 'os'
import cluster from 'cluster'

// TODO: Set to 1 for development
const numCPUs = availableParallelism()

@Injectable()
export class AppClusterService {
  static clusterize(callback: () => void): void {
    //

    if (cluster.isPrimary) {
      console.log(`Primary ${process.pid} is running`)

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`)
      })

      //
    } else {
      console.log(`Worker ${process.pid} started`)
      callback()
    }
  }
}

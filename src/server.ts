import dotenv from 'dotenv-safe'

// Load env config
dotenv.config()

import app from './app'
import { nodeEnv } from './util/environment'

// Start Express server
export default app.listen(app.get('port'), () => {
  console.log(`
Express server
Running on http://localhost:${app.get('port')}
In ${nodeEnv} mode
`)
})

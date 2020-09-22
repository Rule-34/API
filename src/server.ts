import app from './app'

// Start Express server
export default app.listen(app.get('port'), () => {
  console.log(`
Express server
Running on http://localhost:${app.get('port')}
In ${app.get('env')} mode
`)
})

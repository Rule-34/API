import { getWorkerCount } from './cluster.service'

describe('getWorkerCount', () => {
  const originalNodeEnv = process.env['NODE_ENV']
  const originalWebConcurrency = process.env['WEB_CONCURRENCY']

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env['NODE_ENV']
    } else {
      process.env['NODE_ENV'] = originalNodeEnv
    }

    if (originalWebConcurrency === undefined) {
      delete process.env['WEB_CONCURRENCY']
    } else {
      process.env['WEB_CONCURRENCY'] = originalWebConcurrency
    }
  })

  it('uses one worker in development', () => {
    process.env['NODE_ENV'] = 'development'
    process.env['WEB_CONCURRENCY'] = '8'

    expect(getWorkerCount()).toBe(1)
  })

  it('uses WEB_CONCURRENCY in production when configured', () => {
    process.env['NODE_ENV'] = 'production'
    process.env['WEB_CONCURRENCY'] = '3'

    expect(getWorkerCount()).toBe(3)
  })
})

import { readFileSync } from 'fs'
import { join } from 'path'

describe('main bootstrap instrumentation', () => {
  it('imports Sentry instrumentation before loading Nest modules', () => {
    const mainSource = readFileSync(join(__dirname, 'main.ts'), 'utf8')
    const firstImport = /^import .+$/m.exec(mainSource)?.[0]

    expect(firstImport).toBe("import './instrument'")
    expect(mainSource).not.toContain('Sentry.init')
  })
})

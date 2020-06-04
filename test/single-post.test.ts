// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../src/external/booru-list.json'

/* ---------------- SINGLE POST ---------------- */
describe.each(domains)('Single Post', (domain) => {
  const url = `/booru/${domain.type}/single-post?domain=${domain.domain}&id=100`

  // Sleep some seconds between route fetches
  beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 300))
  })

  test(`Route ${domain.domain} response's ID is the requested ID`, (done) => {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        if (res.body[0].id !== 100) {
          throw new Error('Response ID isnt 100: ' + res.body[0].id)
        }
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })
})

// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../external/r34-shared/booru-list.json'

/* ---------------- SINGLE POST ---------------- */
describe.each(domains)('Single Post', (domain) => {
  // Sleep some seconds between route fetches
  beforeEach(async () => {
    console.log('Waiting!')
    await new Promise((r) => setTimeout(r, 300))
  })

  test(`Route ${domain.short} response's ID is the requested ID`, (done) => {
    request(app)
      .get(`/${domain.short}/single-post/?id=100`)
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

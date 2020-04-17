// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../external/r34-shared/booru-list.json'

/* ---------------- SINGLE POST ---------------- */
describe.each(domains)('Single Post', (domain) => {
  // Valid response
  it(`Route ${domain.short} responds with same ID`, function (done) {
    request(app)
      .get(`/${domain.short}/single-post/?id=100`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        //   Array check
        if (res.body[0].id !== 100) {
          throw new Error('Response ID isnt 100')
        }
      })
      // End
      .end(function (err) {
        if (err) return done(err)
        done()
      })
  })
})

// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../external/r34-shared/booru-list.json'

/* ---------------- TAGS ---------------- */
describe.each(domains)('Tags', (domain) => {
  // Valid integer count
  it(`Route ${domain.short} responds with valid count`, function (done) {
    request(app)
      .get(`/${domain.short}/tags?tag=pok`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        // Check
        res.body.forEach((element: { count: number }) => {
          if (!Number.isInteger(element.count)) {
            throw new Error('Count is not an int')
          }
        })
      })
      // End
      .end(function (err) {
        if (err) return done(err)
        done()
      })
  })

  //  Array length
  it(`Route ${domain.short} responds with valid tag length`, function (done) {
    request(app)
      .get(`/${domain.short}/tags?tag=pok&limit=5`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        //   Array length check
        if (res.body.length !== 5) {
          throw new Error(
            'Response is longer than it should: ' + res.body.length
          )
        }
      })
      // End
      .end(function (err) {
        if (err) return done(err)
        done()
      })
  })
})

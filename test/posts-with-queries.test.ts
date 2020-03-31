// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import domains from '../external/r34-shared/booru-list.json'

/* ---------------- POSTS WITH QUERIES ---------------- */
describe.each(domains)('Posts', (domain) => {
  const url = `/${domain.short}/posts?limit=5`

  it(`Route ${domain.short} responds with valid post length`, function (done) {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        // Check
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

  //  Rating check
  it(`Route ${domain.short} responds with valid rating`, function (done) {
    request(app)
      .get(`${url}&rating=+safe`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        // Check
        res.body.forEach((element: { rating: string }) => {
          if (element.rating !== 'safe') {
            throw new Error('Rating isnt as expected: ' + element.rating)
          }
        })
      })
      // End
      .end(function (err) {
        if (err) return done(err)
        done()
      })
  })
})

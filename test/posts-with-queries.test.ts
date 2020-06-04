// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../src/external/booru-list.json'

/* ---------------- POSTS WITH QUERIES ---------------- */
describe.each(domains)('Posts', (domain) => {
  const url = `/booru/${domain.type}/posts?domain=${domain.domain}&limit=5`

  // Sleep some seconds between route fetches
  beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 300))
  })

  test(`Route ${domain.domain} responds with valid post length`, (done) => {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        if (res.body.length !== 5) {
          throw new Error(
            'Response is longer than it should: ' + res.body.length
          )
        }
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })

  test(`Route ${domain.domain} response's rating is safe`, (done) => {
    request(app)
      .get(`${url}&rating=safe`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        res.body.forEach((element: { rating: string }) => {
          if (element.rating !== 'safe') {
            throw new Error('Rating isnt as expected: ' + element.rating)
          }
        })
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })

  test(`Route ${domain.domain} response's rating is everything but safe`, (done) => {
    request(app)
      .get(`${url}&rating=-safe`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        res.body.forEach((element: { rating: string }) => {
          if (element.rating === 'safe') {
            throw new Error('Rating isnt as expected: ' + element.rating)
          }
        })
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })
})

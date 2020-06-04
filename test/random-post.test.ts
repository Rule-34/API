// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../src/external/booru-list.json'

/* ---------------- POSTS ---------------- */
describe.each(domains)('Random post', (domain) => {
  const url = `/booru/${domain.type}/random-post?domain=${domain.domain}`

  // Sleep some seconds between route fetches
  beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 300))
  })

  test(`Route ${domain.domain} response's length is adequate`, (done) => {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        if (res.body.length !== 1) {
          throw new Error('Response length is not adequate: ' + res.body.length)
        }
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })

  test(`Route ${domain.domain} response's score is adequate`, (done) => {
    request(app)
      .get(url + '&score=>=50')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        if (res.body[0].score < 50) {
          throw new Error(
            'Response score is not adequate: ' + res.body[0].score
          )
        }
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })
})

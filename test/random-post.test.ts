// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../external/r34-shared/booru-list.json'

/* ---------------- POSTS ---------------- */
describe.each(domains)('Random post', (domain) => {
  const url = `/${domain.short}/random-post`

  // Sleep some seconds between route fetches
  beforeEach(async () => {
    console.log('Waiting!')
    await new Promise((r) => setTimeout(r, 300))
  })

  test(`Route ${domain.short} response's length is adequate`, (done) => {
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

  test(`Route ${domain.short} response's score is adequate`, (done) => {
    request(app)
      .get(url + '?score=>=50')
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

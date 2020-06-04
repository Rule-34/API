// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../src/external/booru-list.json'

/* ---------------- TAGS ---------------- */
describe.each(domains)('Tags', (domain) => {
  const url = `/booru/${domain.type}/tags?domain=${domain.domain}`

  // Sleep some seconds between route fetches
  beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 300))
  })

  test(`Route ${domain.domain} response's is an integer`, (done) => {
    request(app)
      .get(`${url}&tag=pok`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        res.body.forEach((element: { count: number }) => {
          if (!Number.isInteger(element.count)) {
            throw new Error('Count is not an int: ' + element.count)
          }
        })
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })

  test(`Route ${domain.domain} response's length is valid`, (done) => {
    request(app)
      .get(`${url}&tag=pok&limit=5`)
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
})

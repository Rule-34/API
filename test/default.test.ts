// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../external/r34-shared/booru-list.json'

const DefaultKeys = ['message', 'posts', 'single-post', 'random-post', 'tags']

/* ---------------- POSTS ---------------- */
describe.each(domains)('Posts', (domain) => {
  const url = `/${domain.short}`

  test(`Route ${domain.short} responds with valid default response`, (done) => {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        // console.log(url)
        DefaultKeys.forEach((key) => {
          if (!res.body.hasOwnProperty(key)) {
            throw new Error('Response doesnt have key: ' + key)
          }
        })
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })
})

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

  it(`Route ${domain.short} responds with valid length`, function (done) {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        //   Array length check
        if (res.body.length !== 1) {
          throw new Error('Response length is not adequate: ' + res.body.length)
        }
      })
      // End
      .end(function (err) {
        if (err) return done(err)
        done()
      })
  })

  // it(`Route ${domain.short} responds with valid score`, function (done) {
  //   request(app)
  //     .get(url + '?score=10')
  //     .set('Accept', 'application/json')
  //     .expect('Content-Type', /json/)
  //     .expect(200)
  //     // Custom
  //     .expect(function (res) {
  //       //   Array length check
  //       res.body.forEach((element: { score: number }) => {
  //         if (element.score < 10) {
  //           throw new Error('Response score is not adequate: ' + element.score)
  //         }
  //       })
  //     })
  //     // End
  //     .end(function (err) {
  //       if (err) return done(err)
  //       done()
  //     })
  // })
})

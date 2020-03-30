// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
// import domains from '../external/r34-shared/booru-list.json'

const domains = [
  {
    name: 'danbooru.donmai.us',
    short: 'danbooru',
    // eslint-disable-next-line @typescript-eslint/camelcase
    max_count: 3806415,
    pid: 1,
    nsfw: true,
  },
]

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

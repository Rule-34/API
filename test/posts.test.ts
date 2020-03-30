// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import domains from '../external/r34-shared/booru-list.json'

/* ---------------- POSTS ---------------- */
describe.each(domains)('Posts', (domain) => {
  const url = `/${domain.short}/posts?limit=5`

  it(`Route ${domain.short} responds with valid post ID`, function (done) {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        // Check if digit exists
        res.body.forEach((element: { id: number }) => {
          if (!Number.isInteger(element.id)) {
            throw new Error('ID is not an int')
          }
        })
      })
      // End
      .end(function (err) {
        if (err) return done(err)
        done()
      })
  })

  it(`Route ${domain.short} responds with valid file URL`, function (done) {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        // Check if we can build an URL
        res.body.forEach((element: { high_res_file: string }) => {
          try {
            new URL(element.high_res_file)
          } catch (error) {
            throw new Error('URL is not a valid')
          }
        })
      })
      // End
      .end(function (err) {
        if (err) return done(err)
        done()
      })
  })

  it(`Route ${domain.short} responds with valid media type`, function (done) {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        res.body.forEach((element: { type: string }) => {
          switch (element.type) {
            case 'video':
            case 'image':
              break

            default:
              throw new Error('Type is not valid: ' + element.type)
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

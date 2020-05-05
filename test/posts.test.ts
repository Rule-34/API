// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../external/r34-shared/booru-list.json'

/* ---------------- POSTS ---------------- */
describe.each(domains)('Posts', (domain) => {
  const url = `/${domain.short}/posts?limit=5`

  // Sleep some seconds between route fetches
  beforeEach(async () => {
    console.log('Waiting!')
    await new Promise((r) => setTimeout(r, 300))
  })

  test(`Route ${domain.short} responds with valid post ID`, (done) => {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        res.body.forEach((element: { id: number }) => {
          if (!Number.isInteger(element.id)) {
            throw new Error('ID is not an int')
          }
        })
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })

  test(`Route ${domain.short} responds with valid file URL`, (done) => {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        res.body.forEach((element: { high_res_file: string }) => {
          try {
            new URL(element.high_res_file)
          } catch (error) {
            throw new Error('URL is not a valid')
          }
        })
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })

  test(`Route ${domain.short} responds with valid media type`, (done) => {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
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
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })
})

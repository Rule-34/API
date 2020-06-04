// Requirements
import dotenv from 'dotenv'
dotenv.config()

import 'module-alias/register'

import request from 'supertest'
import app from '../src/app'

import domains from '../src/external/booru-list.json'

/* ---------------- POSTS ---------------- */
describe.each(domains)('Posts', (domain) => {
  const url = `/booru/${domain.type}/posts?domain=${domain.domain}&limit=5`

  // Sleep some seconds between route fetches
  beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 300))
  })

  test(`Route ${domain.domain} responds with valid post ID`, (done) => {
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

  test(`Route ${domain.domain} responds with valid file URL`, (done) => {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        res.body.forEach((element: any) => {
          try {
            new URL(element.high_res_file.url)
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

  test(`Route ${domain.domain} responds with valid media type`, (done) => {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        res.body.forEach((element: { media_type: string }) => {
          switch (element.media_type) {
            case 'video':
            case 'image':
            case 'unknown':
              break

            default:
              throw new Error('Type is not valid: ' + element.media_type)
          }
        })
      })
      .end((err) => {
        if (err) return done(err)
        done()
      })
  })
})

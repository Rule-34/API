const request = require('supertest'),
  app = require('../server/config/express'),
  domains = require('../assets/lib/rule-34-shared-resources/booru-list.json')
/* ---------------- POSTS WITH QUERIES ---------------- */

describe.each(domains)('Posts', (domain) => {
  const url = `/${domain.short}/posts?limit=5`

  it(`Route ${domain.short} responds with valid post length`, function (done) {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        // Check
        if (res.body.length !== 5) {
          throw new Error('Response is longer than it should', res.body.length)
        }
      })
      // End
      .end(function (err) {
        if (err) return done(err)
        done()
      })
  })

  //  Rating check
  it(`Route ${domain.short} responds with valid rating`, function (done) {
    request(app)
      .get(`${url}&rating=+safe`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function (res) {
        // Check
        res.body.forEach((element) => {
          if (element.rating !== 'safe') {
            throw new Error('Rating isnt as expected', element.rating)
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

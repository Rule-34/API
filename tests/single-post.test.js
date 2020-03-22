const request = require('supertest'),
  app = require('../server/config/express'),
  domains = require('../assets/lib/rule-34-shared-resources/booru-list.json')

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
        if (!res.body[0].id === 100) {
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

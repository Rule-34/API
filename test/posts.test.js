const request = require('supertest'),
  app = require('../config/express'),
  domains = require('../assets/lib/rule-34-shared-resources/booru-list.json')

/* ---------------- POSTS ---------------- */
describe.each(domains)('Posts', (domain) => {
  const url = `/${domain.short}/posts?limit=5`

  it(`Route ${domain.short} responds with valid post ID`, function(done) {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function(res) {
        // Check if digit exists
        res.body.forEach((element) => {
          if (!Number.isInteger(element.id)) {
            throw new Error('ID is not an int')
          }
        })
      })
      // End
      .end(function(err) {
        if (err) return done(err)
        done()
      })
  })

  it(`Route ${domain.short} responds with valid file URL`, function(done) {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function(res) {
        // Check if we can build an URL
        res.body.forEach((element) => {
          try {
            new URL(element.high_res_file)
          } catch (error) {
            throw new Error('URL is not a valid', error)
          }
        })
      })
      // End
      .end(function(err) {
        if (err) return done(err)
        done()
      })
  })

  it(`Route ${domain.short} responds with valid media type`, function(done) {
    request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function(res) {
        res.body.forEach((element) => {
          switch (element.type) {
            case 'video':
            case 'image':
              break

            default:
              throw new Error('Type is not valid', element.type)
          }
        })
      })
      // End
      .end(function(err) {
        if (err) return done(err)
        done()
      })
  })
})

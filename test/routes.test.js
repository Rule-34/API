const request = require('supertest'),
  app = require('../config/express'),
  domains = [
    'xxx',
    'paheal',
    'danbooru',
    'gelbooru',
    'loli',
    'e621',
    'safebooru',
  ]

/* ---------------- POSTS ---------------- */
describe.each(domains)('Posts', domain => {
  // Valid response
  it(`Route ${domain} responds with valid JSON array`, function(done) {
    request(app)
      .get(`/${domain}/posts`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function(res) {
        //   Array check
        if (!Array.isArray(res.body)) {
          throw new Error('Response isnt an array')
        }
      })
      // End
      .end(function(err) {
        if (err) return done(err)
        done()
      })
  })

  // Post ID
  it(`Route ${domain} responds with valid post ID`, function(done) {
    request(app)
      .get(`/${domain}/posts`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function(res) {
        //   Check if digit exists
        if (!Number.isInteger(res.body[0].id)) {
          throw new Error('Response ID is not an integer')
        }
      })
      // End
      .end(function(err) {
        if (err) return done(err)
        done()
      })
  })

  // File URL
  it(`Route ${domain} responds with valid file URL`, function(done) {
    request(app)
      .get(`/${domain}/posts`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function(res) {
        //   Check if we can build an URL
        try {
          new URL(res.body[0].high_res_file)
        } catch (error) {
          throw new Error('Response URL is not a valid URL', error)
        }
      })
      // End
      .end(function(err) {
        if (err) return done(err)
        done()
      })
  })

  //  Media type
  it(`Route ${domain} responds with valid media type`, function(done) {
    request(app)
      .get(`/${domain}/posts`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function(res) {
        //   Check if we can build an URL
        switch (res.body[0].type) {
          case 'video':
          case 'image':
            break

          default:
            throw new Error('Response type is a string')
        }
      })
      // End
      .end(function(err) {
        if (err) return done(err)
        done()
      })
  })
})

/* ---------------- SINGLE POST ---------------- */
describe.each(domains)('Single Post', domain => {
  // Valid response
  it(`Route ${domain} responds with same ID`, function(done) {
    request(app)
      .get(`/${domain}/single-post/?id=100`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function(res) {
        //   Array check
        if (!res.body[0].id === 100) {
          throw new Error('Response ID isnt 100')
        }
      })
      // End
      .end(function(err) {
        if (err) return done(err)
        done()
      })
  })
})

/* ---------------- TAGS ---------------- */
describe.each(domains)('Tags', domain => {
  // Valid response
  it(`Route ${domain} responds with valid count`, function(done) {
    request(app)
      .get(`/${domain}/tags?tag=pok`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      // Custom
      .expect(function(res) {
        //   Array check
        if (!Number.isInteger(res.body[0].count)) {
          throw new Error('Response count is not an Integer')
        }
      })
      // End
      .end(function(err) {
        if (err) return done(err)
        done()
      })
  })
})

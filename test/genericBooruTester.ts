// Requirements
import { Express } from 'express'
import request from 'supertest'

// Types
import { Booru } from '../src/types/types'
import { BooruObj } from '../src/external/util/BooruUtils'

export type TestQueries = {
  // Post
  limit: number
  rating: string
  score: number

  // Single post
  id: number

  // Tag
  tag: string
}

export const genericQueries: TestQueries = {
  limit: 5,
  rating: 'safe',
  score: 10,

  id: 100,

  tag: 'mario',
}

export class GenericPostsTester {
  expressConfiguration: Express

  domainObj: BooruObj
  queryObj: TestQueries

  URLToFetch!: string
  fetchResponse: any

  constructor(
    expressConfiguration: Express,
    domainObj: BooruObj,
    queryObj: TestQueries
  ) {
    this.expressConfiguration = expressConfiguration

    this.domainObj = domainObj
    this.queryObj = queryObj

    this.craftURL()
  }

  protected craftURL(): void {
    this.URLToFetch = `/booru/${this.domainObj.type}/posts?domain=${this.domainObj.domain}&limit=${this.queryObj.limit}&rating=${this.queryObj.rating}&score=>=${this.queryObj.score}`
  }

  public testAll(): void {
    this.testAndSetURL()
    this.testPropTypes()
    this.testFileURLs()

    this.testLimitQuery()
    this.testRatingQuery()
    this.testScoreQuery()
  }

  protected testAndSetURL(): void {
    it('Makes a successful request', (done) => {
      request(this.expressConfiguration)
        .get(this.URLToFetch)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          this.fetchResponse = res.body

          if (err) return done(err)
          done()
        })
    })
  }

  protected testPropTypes(): void {
    it('Props are the expected types', () => {
      this.fetchResponse.forEach(
        (element: Booru.Structures.Data.Processed.Post) => {
          expect(element.id).toEqual(expect.any(Number))
          expect(element.score).toEqual(expect.any(Number))
          expect(element.high_res_file).toEqual(expect.any(Object))
          expect(element.low_res_file).toEqual(expect.any(Object))
          expect(element.preview_file).toEqual(expect.any(Object))
          expect(element.tags).toEqual(expect.any(Array))
          expect(element.rating).toEqual(expect.any(String))
          expect(element.media_type).toEqual(expect.any(String))
        }
      )
    })
  }

  protected testFileURLs(): void {
    it('Files have proper URLs', () => {
      this.fetchResponse.forEach(
        (element: Booru.Structures.Data.Processed.Post) => {
          expect(
            () => new URL(element.high_res_file.url as string)
          ).not.toThrowError()
        }
      )
    })
  }

  protected testLimitQuery(): void {
    it('Limit query works', () => {
      expect(this.fetchResponse.length).toBe(this.queryObj.limit)
    })
  }

  protected testRatingQuery(): void {
    it('Rating query works', () => {
      this.fetchResponse.forEach(
        (element: Booru.Structures.Data.Processed.Post) => {
          expect(element.rating).toBe(this.queryObj.rating)
        }
      )
    })
  }

  protected testScoreQuery(): void {
    it('Score query works', () => {
      this.fetchResponse.forEach(
        (element: Booru.Structures.Data.Processed.Post) => {
          expect(element.score).toBeGreaterThanOrEqual(this.queryObj.score)
        }
      )
    })
  }
}

export class GenericSinglePostTester extends GenericPostsTester {
  protected craftURL(): void {
    this.URLToFetch = `/booru/${this.domainObj.type}/single-post?domain=${this.domainObj.domain}&id=${this.queryObj.id}`
  }

  public testAll(): void {
    this.testAndSetURL()
    this.testPropTypes()
    this.testFileURLs()
    this.testIDQuery()
  }

  protected testIDQuery(): void {
    it('ID query works', () => {
      this.fetchResponse.forEach(
        (element: Booru.Structures.Data.Processed.Post) => {
          expect(element.id).toBe(this.queryObj.id)
        }
      )
    })
  }
}

export class GenericRandomPostTester extends GenericPostsTester {
  protected craftURL(): void {
    this.URLToFetch = `/booru/${this.domainObj.type}/random-post?domain=${this.domainObj.domain}`
  }

  public testAll(): void {
    this.testAndSetURL()
    this.testPropTypes()
    this.testFileURLs()
    //TODO test with score >= 50
  }
}

export class GenericRandomTagsTester extends GenericPostsTester {
  protected craftURL(): void {
    this.URLToFetch = `/booru/${this.domainObj.type}/tags?domain=${this.domainObj.domain}&tag=${this.queryObj.tag}&limit=${this.queryObj.limit}`
  }

  public testAll(): void {
    this.testAndSetURL()
    this.testPropTypes()
    this.testLimitQuery()
    this.testTagQuery()
  }

  protected testPropTypes(): void {
    it('Props are the expected types', () => {
      this.fetchResponse.forEach(
        (element: Booru.Structures.Data.Processed.Tag) => {
          expect(element.name).toEqual(expect.any(String))
          expect(element.count).toEqual(expect.any(Number))
        }
      )
    })
  }

  protected testTagQuery(): void {
    it('Tag query works', () => {
      const matchedTags = this.fetchResponse.filter(
        (tag: Booru.Structures.Data.Processed.Tag) =>
          tag.name.toLowerCase().includes(this.queryObj.tag)
      )

      expect(matchedTags.length).toBeGreaterThanOrEqual(1)
    })
  }
}

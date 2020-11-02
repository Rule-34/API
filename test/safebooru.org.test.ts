// Requirements
import dotenv from 'dotenv'
dotenv.config()

// Configuration
import app from '../src/app'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import domains from '../src/external/booru-list.json'

// Types
import {
  genericQueries,
  GenericPostsTester,
  GenericSinglePostTester,
  GenericRandomTagsTester,
} from './genericBooruTester'
import { Booru } from '../src/types/types'

import { BooruObj } from '../src/external/util/BooruUtils'

const configDomain: BooruObj = domains.filter(
  (booru) => booru['domain'] === 'safebooru.org'
)[0]

describe(`GET /posts from ${configDomain.domain}`, function () {
  class SafebooruPostsTester extends GenericPostsTester {
    public testAll(): void {
      this.testAndSetURL()
      this.testPropTypes()
      this.testFileURLs()

      this.testLimitQuery()
      this.testRatingQuery()
      // this.testScoreQuery() // For some reason it doesnt work
    }

    protected testPropTypes(): void {
      it('Props are the expected types', () => {
        this.fetchResponse.forEach(
          (element: Booru.Structures.Data.Processed.Post) => {
            expect(element.id).toEqual(expect.any(Number))
            // expect(element.score).toEqual(expect.any(Number)) // For some reason its empty ""
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
  }

  new SafebooruPostsTester(app, configDomain, genericQueries).testAll()
})

describe(`GET /single-post from ${configDomain.domain}`, function () {
  class SafebooruSinglePostTester extends GenericSinglePostTester {
    protected testPropTypes(): void {
      it('Props are the expected types', () => {
        this.fetchResponse.forEach(
          (element: Booru.Structures.Data.Processed.Post) => {
            expect(element.id).toEqual(expect.any(Number))
            // expect(element.score).toEqual(expect.any(Number)) // For some reason its empty ""
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
  }

  new SafebooruSinglePostTester(app, configDomain, genericQueries).testAll()
})

// describe(`GET /random-post from ${configDomain.domain}`, function () {
//   new GenericRandomPostTester(app, configDomain, genericQueries).testAll()
// })

describe(`GET /tags from ${configDomain.domain}`, function () {
  new GenericRandomTagsTester(app, configDomain, genericQueries).testAll()
})

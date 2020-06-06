// Requirements
import dotenv from 'dotenv'
import 'module-alias/register'
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

import { BooruObj } from '../src/external/util/BooruUtils'

const configDomain: BooruObj = domains.filter(
  (booru) => booru['domain'] === 'rule34.xxx'
)[0]

describe(`GET /posts from ${configDomain.domain}`, function () {
  new GenericPostsTester(app, configDomain, genericQueries).testAll()
})

describe(`GET /single-post from ${configDomain.domain}`, function () {
  new GenericSinglePostTester(app, configDomain, genericQueries).testAll()
})

// describe(`GET /random-post from ${configDomain.domain}`, function () {
//   new GenericRandomPostTester(app, configDomain, genericQueries).testAll()
// })

describe(`GET /tags from ${configDomain.domain}`, function () {
  new GenericRandomTagsTester(app, configDomain, genericQueries).testAll()
})

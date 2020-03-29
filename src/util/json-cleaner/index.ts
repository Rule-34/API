import postCleaner from './postCleaner'
import tagCleaner from './tagCleaner'

// Definitions
import { PassedData } from '@/types/passed-data'

/**
 * Cleans a JSON object according to its template and domain
 * @param {String} template Specific treatment for the Json Object (posts, tags, autocomplete)
 * @param {String} domain Domain specific quirk treatment
 * @param {Object} data Json Object to be cleaned
 * @param {Number} limit Number to limit how many tags should be processed
 * @param {Boolean} useCorsProxy Should response be proxied
 */
export default ({
  template,
  domain,
  data,
  limit,
  useCorsProxy,
}: PassedData): Array<object> => {
  // Define CORS Proxy URL
  let corsProxyUrl = ''

  if (useCorsProxy) {
    corsProxyUrl = 'https://cors-proxy.rule34app.workers.dev/?q='
  }

  // Clean json of unnecessary data
  switch (template) {
    case 'posts':
      return postCleaner({ data, domain, corsProxyUrl })

    case 'tags':
      return tagCleaner({ data, domain })

    case 'autocomplete':
      return tagCleaner({ data, domain, limit })
  }
}

import fetch from 'node-fetch'
import he from 'he'

// Init
import Debug from 'debug'
const debug = Debug('Server:util Fetch')

// Gets the content from the passed url and returns it
export default async (url: string): Promise<string> => {
  // Encode url
  // url = he.encode(url)

  debug(url)

  const data = await fetch(url, {
    headers: {
      'User-Agent':
        'Rule 34 API (https://github.com/VoidlessSeven7/Rule-34-API)',
    },
  })
    .then(async (res) => {
      // Check for HTTP status errors
      if (!res.ok) {
        throw new Error('Network response was not ok')
      }

      return he.decode(await res.text())
    })
    .catch((error) => {
      throw new Error(`Fetch: ${error}`)
    })

  // debug(data)

  return data
}

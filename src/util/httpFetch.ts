import fetch from 'node-fetch'
import he from 'he'

// Init
import Debug from 'debug'
const debug = Debug('Server:util Fetch')

// Gets the content from the passed url and returns it
export default async (url: string): Promise<string> => {
  // Encode url
  url = encodeURI(url)

  debug(url)

  const data = await fetch(url, {
    headers: {
      'User-Agent':
        'Rule 34 API (https://github.com/AlejandroAkbal/Rule-34-API)',
    },
  }).then(async (res) => {
    let tmpData
    // Check for HTTP status errors
    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    tmpData = await res.text()

    tmpData = he.decode(tmpData)

    return tmpData
  })

  // debug(data)

  return data
}

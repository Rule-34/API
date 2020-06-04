import fetch from 'node-fetch'
import he from 'he'

// Init
import Debug from 'debug'
const debug = Debug('Server:util Fetch')

export default async (URL: string): Promise<any> => {
  URL = encodeURI(URL)

  debug(URL)

  const options = {
    headers: {
      'User-Agent':
        'Rule 34 API (https://github.com/AlejandroAkbal/Rule-34-API)',
    },
  }

  let data = await fetch(URL, options)
    //
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(res.statusText)
      }

      return res.text()
    })

  // Decode HTML chars
  data = he.decode(data)

  return data
}

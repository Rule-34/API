// Defines defaults for domain
const domainConfig = {
  routeUrl: 'paheal/',
  baseUrl: 'http://rule34.paheal.net/',
  apiUrl: 'http://rule34.paheal.net/api/danbooru/',
  tagApiUrl: 'http://rule34.paheal.net/api/internal/autocomplete?',
}

// API help page --> It has no documentation at all

// Also, this is the only booru that doesnt use httpS, since it doesnt redirect we save data by not making the connection secure

module.exports = domainConfig

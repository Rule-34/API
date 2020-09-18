# Rule 34 JSON API

## What is this

A JSON API that acts as a wrapper for most Booru sites, taking the different structures of their API and returning a normalized JSON response that always has the same structure

> This API was created for and is used on the [Rule 34 App](https://r34.app/)

## Development

Read [DOCUMENTATION.md](DOCUMENTATION.md)

## Information

### Goals

It is being developed with the following goals

- Provide an universal JSON response independent of the site
- Have support for most boorus
- Be easy to use
- Be as fast as possible
- Using only necessary data transfers

### Support

The following booru types are supported and their API is fully working

- Gelbooru (New)
- Shimmie 2
- Danbooru
- Danbooru 2
- E621

> Public APIs are used for getting the data from the boorus

### Speed

Thanks to [camaro](https://www.npmjs.com/package/camaro) we transform XML to JSON as fast as possible, as its using C++ underneath to do the transformation

If the site API is already using JSON, we clean and transform the data into an universal and minimal reponse

Then when we get a client request, the information is processed and cached, making sequential requests very fast :')

### Credit

> This API was inspired by [Kurozenzen's API](https://github.com/kurozenzen/r34-json-api)

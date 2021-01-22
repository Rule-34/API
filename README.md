# Rule 34 API

A JSON API that acts as a wrapper for most Booru sites.

**_This API was created for, and is used on the [Rule 34 App](https://r34.app)._**

## Information

### Goals

Developed with the following goals:

- Provide a universal JSON response independent of the site.
- Support most Booru types.
- Be fast.

### Booru support

Thanks to `Universal Booru Manager` (UBW), _a utility package created by me_, the API supports the following Booru types:

- Gelbooru 0.2
- Paheal
- Danbooru
- Danbooru 2
- E621

### Booru standards

This API respects all the Boorus that it communicates with.

- Cache every request so that the original Booru site has less load.
- Use correct HTTP headers for better CDN cache.

## Development

If you are interested on modifying the API:

- Read [DOCUMENTATION.md](DOCUMENTATION.md).

## Credit

- Inspired by [Kurozenzen's API](https://github.com/kurozenzen/r34-json-api).
- With help from @tuananh.

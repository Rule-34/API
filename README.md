# Rule 34 JSON API

### What is this?

It's a JSON API that embraces the current XML being used on various danbooru sites like rule34.xxx or rule34.paheal.net.

> This API objective is to be used on the [Rule 34 app](https://r34.app/).

 If you have any suggestion please leave a request :')

### Goals
It is being developed with the following goals:
- Being as fast as possible
- Being as secure as it can be
- Wasting as little data as its needed
- Supporting various danbooru sites

For the initial version it has to have the same functionality as the currently used in [Rule 34 app](https://r34.app/).

The current API being used is from [Kurozenzen](https://github.com/kurozenzen/r34-json-api).

### Common usage

First you have to select from which site you want to use the API
- .../xxx/ for rule34.xxx
- .../paheal/ for rule34.paheal.xxx

Then you append what you want to get from the API
- .../posts 
- .../images
- .../tags
- .../comments

And that's it, you'll receive a JSON object with the latest data from the original site XML API

### Advanced usage 

If you need to tweak things a little you can use the following URL parameters

First start by adding a question mark 
```javascript
.../posts/?
```

And then you can append the following parameters
- limit 
- pid
- tags 
- score

> Use '&' to add more parameters.

Example
```javascript
.../posts/?limit=20&pid=5&tags=disney+-cars+score:>=10
```

##### Parameters explained

**Limit** : limit of posts to show per request, maximum and defaults to 100 posts.
**Pid** : page ID, in contrast to latest posts, defaults to 0.
**Tags** : show posts that include the listed tags, defaults to empty (adding a '-' forbids the tag to appear).
**Score** : show posts that have that score or more, defaults to 0.
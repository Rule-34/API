# Rule 34 JSON API

## What is this

It's a JSON API that embraces the current XML being used on various danbooru sites like rule34.xxx or rule34.paheal.net.

> This API is used on the [Rule 34 PWA app](https://r34.app/).

If you have any suggestion please leave a request :')

### Goals

It is being developed with the following goals:

- Being as fast as possible
- Being as secure as it can be
- Wasting as little data as its needed
- Supporting various danbooru sites

> This API was inspired by [Kurozenzen's API](https://github.com/kurozenzen/r34-json-api)

### Support

The following sites are supported and their API is fully working

- <https://rule34.xxx>
- <https://rule34.paheal.net>
- <https://lolibooru.moe>

> Site's public API is used for getting posts.
> Site's inner autocomplete API is used for getting tags.

### Information

As you may know this API transforms the original's API XML response to JSON, so it's more flexible.

#### Speed

Thanks to a utility package called Camaro we transform XML to JSON as fast as possible, as this package is using C++ underneath to do the transformation.

Then when we get a client request, the information is transformed and cached, making sequential requests very fast :')

### Common usage

First you have to select from which site you want to use the API

- .../xxx/ for rule34.xxx
- .../paheal/ for rule34.paheal.net
- .../loli/ for lolibooru.moe

Then you append what you want to get from the API

- .../posts
- .../tags (\*)

> (\*) Tags need query parameters, otherwise it will fail

And that's it, you'll receive a JSON object with the latest data from the original site XML API.

#### Good to know

When posts are returned you'll see the images urls are being replaced with a dynamic one, this is because most webpages dont offer CORS, this way we act as a middleman (proxy) that sets CORS and allows you to view proxy on any site without any hassle.

```javascript
.../proxy/?url=example.com/image.png
```

## Advanced usage

If you need to tweak things a little you can use the following URL parameters

### Posts

First start by adding a question mark

```javascript
.../posts/?
```

And then you can append the following parameters

- limit
- pid
- tags
- score

> Use & to add more parameters.

#### Examples

Show latest 50 posts

```javascript
.../posts/?limit=50
```

Show second page of latest posts

```javascript
.../posts/?pid=2
```

Show latest posts with 'robot' tag

```javascript
.../posts/?tags=robot
```

Show latest posts with 'robot' tag that doesn't have the 'human' tag

```javascript
.../posts/?tags=robot+-human
```

Show latest posts with a score higher or equal than 100

```javascript
.../posts/?score=100
```

Show the latest 20 posts of the fifth page that have the tag 'disney' but not 'cars' and the post's score have to be equal to 10 and higher

```javascript
.../posts/?limit=20&pid=5&tags=disney+-cars&score=10
```

##### Posts parameters explained

**Limit:** limit of posts to show per request, maximum and defaults to 100 posts.

**Pid:** page ID, in contrast to latest posts, defaults to 0.

**Tags:** show posts that include the listed tags, defaults to empty (adding a '-' forbids the tag to appear).

**Score:** show posts that have that score or more, defaults to 0.

### Tags

First start by adding a question mark

```javascript
.../tags/?
```

And then you can append the following parameters

- tag
- limit

> Use & to add more parameters.

#### Examples

Will show all tags related to 'robot' and their post count

```javascript
.../tags/?tag=robot
```

Will show the top 5 tags related to 'robot' and their post count

```javascript
.../tags/?tag=robot&limit=5
```

> By default the most popular tags are shown

##### Tags parameters explained

**Tag:** returns all similar tags and the total of posts with that tag, defaults to nothing.

**Limit:** limit of posts to show per request, defaults to 100 posts.

### Differences

You should know that every API is different, for example, danbooru and rule34xxx are nothing similar

This makes that some funtionality like getting a single post from its ID very difficult and on some cases, not possible.

#### Unsupported

- Only rule34xxx and rule34paheal have Posts from its ID

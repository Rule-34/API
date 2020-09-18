# Rule 34 JSON API - Documentation

_This info is mostly outdated as the API has seen major changes, will update on the future_

## Common usage

To start using the API, you have to select an endpoint

- .../safebooru/ for safebooru.org
- .../xxx/ for rule34.xxx
- .../paheal/ for rule34.paheal.net
- .../danbooru/ for danbooru.donmai.us
- .../gelbooru/ for gelbooru.com
- .../lolibooru/ for lolibooru.moe
- .../e621/ for e621.net

Then you append what you want to get from the API

- .../posts
- .../single-post (\*)
- .../random-post
- .../tags (\*)

> (\*) Needs query parameters, otherwise will return an HTTP 422 error

And that's it, you'll receive a clean JSON object with the latest data from the original site API

### Good to know

#### Rate limit

A rate limit is implemented so nobody abuses the API

> Requests are limited to 225 every 15 minutes ( about 15 per minute )

#### Differences

You should know that every site API is different, some have things in common but not most

For example, danbooru and xxx are very different, this makes some funtionality like getting a single post from its ID very difficult and on some cases (like loli), not possible

#### Unsupported

- Only danbooru, loli and e621 allow score, tags, and other common post queries in the `.../random-post/` route
- Only danbooru, loli and e621 allow limit, pid or order in the `.../tags/` route
- Loli doesn't allow `.../single-post/`
- Paheal doesn't allow to filter by rating

#### Cors

When posts are returned you'll see the images urls are being replaced with a dynamic one, this is because most sites dont offer CORS, this way we act as a middleman (proxy) that sets CORS and allows you to view proxy on any site without any hassle

You can enable this behaviour with the `corsProxy` query

```javascript
.../posts/?corsProxy=true
.../single-post/?corsProxy=true
```

## Advanced usage

If you need to tweak things you can add the following URL parameters

### Posts

First start by adding a question mark

```javascript
.../posts/?
```

And then you can append the following parameters

- **Limit:** limit of posts to show per request, maximum and defaults to 20 posts
- **Pid:** page number related to limit, defaults to the booru specific
- **Tags:** show posts that include the listed tags, defaults to empty (adding a '-' forbids the tag to appear)
- **Rating:** show posts including (+) or excluding (-) the rating, defaults to Undefined
- **Score:** show posts that have that score or more, defaults to 0

> Use & to add more parameters

#### Post examples

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

Show latest posts including safe rating

```javascript
.../posts/?rating=+safe
```

Show latest posts excluding questionable rating

```javascript
.../posts/?rating=-questionable
```

Show latest posts with a score higher or equal than 100

```javascript
.../posts/?score=100
```

Show the latest 20 posts of the fifth page that have the tag 'disney' but not 'cars', its rating must be explicit and the post's score have to be equal to 10 and higher

```javascript
.../posts/?limit=20&pid=0&tags=disney+-cars_(movie)&rating=+explicit&score=10
```

### Single post

First start by adding a question mark

```javascript
.../single-post/?
```

And then you can append the following parameters

- **ID:** the ID of the post

> Use & to add more parameters

#### Single post examples

Show the post with 100 as its ID

```javascript
.../single-post/?id=100
```

### Random post

First start by adding a question mark

```javascript
.../random-post/?
```

And then you can append the following parameters

- **Score:** show posts that have that score or more, defaults to 0
- **Rest of common post queries** (\*)

> (\*) Most post queries will work, depends on the original site API

#### Random post examples

Get a random post

```javascript
.../random-post/
```

Get a random post with score major or equal to 10

```javascript
.../random-post/?score=10
```

### Tags

First start by adding a question mark

```javascript
.../tags/?
```

And then you can append the following parameters

- **Tag:** returns similar tags and the post count
- **Limit:** limit of posts to show per request, defaults to 25 tags
- **Pid:** page number related to limit, defaults to the booru specific
- **Order:** self documenting, defaults to 'count'

> Use & to add more parameters

#### Tags examples

Will show the top tags related to 'robot'

```javascript
.../tags/?tag=robot
```

Will show the top 5 tags related to 'robot'

```javascript
.../tags/?tag=robot&limit=5
```

Will show the second page of the top 5 tags related to 'robot'

```javascript
.../tags/?tag=robot&limit=5&pid=1
```

Will show 5 tags related to 'robot', and will order them by date of upload

```javascript
.../tags/?tag=robot&limit=20&order=date
```

> By default the most popular tags are shown

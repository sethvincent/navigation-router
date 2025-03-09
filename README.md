# navigation-router

Client-side routing using the Navigation API.

This module relies on the experimental [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API) and [URLPattern API](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern_API).

These APIs are not available in all browsers! Yet!

Check browser support:

- [Navigation API](https://caniuse.com/mdn-api_navigation)
- [URLPattern API](https://caniuse.com/mdn-api_urlpattern)

## Usage

```js
import NavigationRouter from 'navigation-router'

const router = new NavigationRouter()

router.add('/', async (route) => {
    console.log('handling route', route)
})

router.add('/posts/:id', async (route) => {
    console.log('handling route', route.params.id, route)
})

router.on('change', (event) => {
    console.log('route changed', event.detail)
})

router.on('404', (event) => {
    console.log('404', event.detail)
})
```

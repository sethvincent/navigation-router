/**
 * A client-side router that uses the Navigation API.
 * @extends {EventTarget}
 */
export default class NavigationRouter extends EventTarget {
    /**
     * Static routes are direct path matches (e.g., "/about").
     * Maps a route to its handler function.
     * @type {Map<string, Function>}
     */
    #staticRoutes = new Map()

    /**
     * Dynamic routes use URLPattern for flexible matching (e.g., "/users/:id").
     *  Array of route objects with pattern and handler.
     * @type {Array<{ route: string, pattern: URLPattern, handler: Function }>}
     */
    #dynamicRoutes = []

    /**
     * Used to resolve the promise for the async iterator.
     * @type {Function|null}
     */
    #resolveRouteChange = null

    constructor () {
        super()

        if (
            typeof window === 'undefined'
            || typeof window.navigation === 'undefined'
        ) {
            throw new Error('Navigation API unavailable')
        }

        if (typeof URLPattern === 'undefined') {
            throw new Error('URLPattern API unavailable')
        }

        window.navigation.addEventListener('navigate', async (event) => {
            if (!event.canIntercept || event.hashChange || event.downloadRequest) {
                return
            }

            const url = new URL(event.destination.url)

            if (url.host !== location.host) {
                return
            }

            await this.match(url, event)
        })
    }

    /**
     * An async iterator that yields promises which resolve on route changes.
     * This allows you to react to route changes in an asynchronous manner.
     *
     * @async
     * @yields {Promise<{ value: { params: object, url: URL }, done: boolean }>} - A promise that resolves with the route parameters and URL, or indicates the iterator is done.
     */
    async *[Symbol.asyncIterator] () {
        try {
            while (true) {
                yield new Promise((resolve) => {
                    this.#resolveRouteChange = resolve
                })
            }
        } finally {
            this.#resolveRouteChange = null
        }
    }

    /**
     * Adds a route and its handler to the router.
     *
     * @param {string} route - The route path (e.g., "/about" or "/users/:id").
     * @param {Function} handler - The function to execute when the route is matched.  Receives a route object as an argument.
     */
    add (route, handler) {
        if (route.includes(':')) {
            const pattern = new URLPattern({ pathname: route })
            this.#dynamicRoutes.push({ route, pattern, handler })
            return
        }

        this.#staticRoutes.set(route, handler)
    }

    /**
     * Matches a URL to a registered route and executes the associated handler.
     *
     * @param {URL} url - The URL to match against the registered routes.
     * @param {NavigateEvent} event - The navigation event.
     * @emits {change} - Emits a 'change' event with the route data.
     * @emits {404} - Emits a '404' event with the URL if no route is matched.
     */
    async match (url, event) {
        const matchedRoute = this.#getRoute(url)

        if (!matchedRoute) {
            this.emit('404', url)
            return
        }

        const { match, handler } = matchedRoute
        const route = {
            params: match?.pathname?.groups,
            url,
        }

        event.intercept({
            handler: async () => {
                this.emit('change', route)

                if (this.#resolveRouteChange) {
                    this.#resolveRouteChange({ value: route, done: false })
                    this.#resolveRouteChange = null
                }

                return handler(route)
            },
        })
    }

    /**
     * Retrieves a route object (containing the handler and match data) for a given URL.
     *
     * @private
     * @param {URL} url - The URL to match.
     * @returns {{ handler: Function, match?: URLPatternResult }|undefined} - The route object if a match is found, otherwise undefined.  Returns undefined if no match.
     */
    #getRoute (url) {
        const staticRoute = this.#staticRoutes.get(url.pathname)

        if (staticRoute) {
            return { handler: staticRoute }
        }

        for (const { pattern, handler } of this.#dynamicRoutes) {
            if (pattern.test(url)) {
                const match = pattern.exec(url)
                return { match, handler }
            }
        }
    }

    /**
     * Adds an event listener to the router.  Syntactic sugar for `addEventListener`.
     *
     * @param {string} name - The name of the event to listen for.
     * @param {EventListenerOrEventListenerObject} handler - The event handler.
     */
    on (name, handler) {
        this.addEventListener(name, handler)
    }

    /**
     * Dispatches a custom event on the router.
     *
     * @param {string} name - The name of the event.
     * @param {any} data - The event data (passed as `event.detail`).
     * @emits {name} - Emits an event of type `name` with the provided `data`.
     */
    emit (name, data) {
        const event = RouterEvent.make(name, data)
        this.dispatchEvent(event)
    }
}

/**
 * A custom event class for router events.
 * @extends {CustomEvent}
 */
export class RouterEvent extends CustomEvent {
    /**
     * Creates a new RouterEvent instance.
     *
     * @param {string} name - The name of the event.
     * @param {any} data - The event data (passed as `event.detail`).
     * @returns {RouterEvent} - A new RouterEvent instance.
     */
    static make (name, data) {
        return new RouterEvent(name, data)
    }

    /**
     * Constructs a new RouterEvent.
     *
     * @param {string} name - The name of the event.
     * @param {any} data - The event data (passed as `event.detail`).
     */
    constructor (name, data) {
        super(name, { detail: data })
    }
}

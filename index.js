/**
 * A client-side router that uses the Navigation API.
 * @extends {EventTarget}
 */
export default class NavigationRouter extends EventTarget {
    /**
     * @type {Map<string, Function>}
     */
    #staticRoutes = new Map()
    /**
     * @type {Array<{ route: string, pattern: URLPattern, handler: Function }>}
     */
    #dynamicRoutes = []

    /**
     * @type {Function|null}
     */ #resolveRouteChange = null

    constructor () {
        super()

        if (
            typeof window === 'undefined'
            || typeof window.navigation === 'undefined'
        ) {
            throw new Error('navigation api unavailable')
        }

        if (typeof URLPattern === 'undefined') {
            throw new Error('URLPattern api unavailable')
        }

        window.navigation.addEventListener('navigate', async (event) => {
            if (!event.canIntercept || event.hashChange || event.downLoadRequest) {
                return
            }

            const url = new URL(event.destination.url)

            if (url.host !== location.host) {
                return
            }

            await this.match(url, event)
        })
    }

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
     * Add a route to the router.
     * @param {string} route
     * @param {Function} handler
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
     * Match a navigation event to a route.
     * @param {URL} url
     * @param {NavigateEvent} event
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
                // await handler(route);
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
     * Get a route from the router.
     * @param {URL} url
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
     * Add an event listener.
     * @param {string} name
     * @param {EventListenerOrEventListenerObject} handler
     */
    on (name, handler) {
        this.addEventListener(name, handler)
    }

    /**
     * Dispatch an event.
     * @param {string} name
     * @param {any} data
     * @param {object} [options]
     */
    emit (name, data, options = {}) {
        const event = RouterEvent.make(name, data, options)
        this.dispatchEvent(event)
    }
}

/**
 * A custom event for the router.
 * @extends {CustomEvent}
 */
export class RouterEvent extends CustomEvent {
    /**
     * Create a router event.
     * @param {string} name
     * @param {any} data
     * @param {object} [options]
     */
    static make (name, data, options) {
        return new RouterEvent(name, data, options)
    }

    /**
     * @param {string} name
     * @param {any} data
     * @param {object} [options]
     */
    constructor (name, data, options = {}) {
        super(name, { detail: data })
        this.options = options
    }
}

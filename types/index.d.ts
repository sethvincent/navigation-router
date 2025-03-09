/**
 * A client-side router that uses the Navigation API.
 * @extends {EventTarget}
 */
export default class NavigationRouter extends EventTarget {
    /**
     * Add a route to the router.
     * @param {string} route
     * @param {Function} handler
     */
    add (route: string, handler: Function): void
    /**
     * Match a navigation event to a route.
     * @param {URL} url
     * @param {NavigateEvent} event
     */
    match (url: URL, event: NavigateEvent): Promise<void>
    /**
     * Add an event listener.
     * @param {string} name
     * @param {EventListenerOrEventListenerObject} handler
     */
    on (name: string, handler: EventListenerOrEventListenerObject): void
    /**
     * Dispatch an event.
     * @param {string} name
     * @param {any} data
     * @param {object} [options]
     */
    emit (name: string, data: any, options?: object): void
    [Symbol.asyncIterator] (): AsyncGenerator<any, void, unknown>
    #private
}
/**
 * A custom event for the router.
 * @extends {CustomEvent}
 */
export class RouterEvent extends CustomEvent<any> {
    /**
     * Create a router event.
     * @param {string} name
     * @param {any} data
     * @param {object} [options]
     */
    static make (name: string, data: any, options?: object): RouterEvent
    /**
     * @param {string} name
     * @param {any} data
     * @param {object} [options]
     */
    constructor (name: string, data: any, options?: object)
    options: object
}

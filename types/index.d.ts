/**
 * A client-side router that uses the Navigation API.
 * @extends {EventTarget}
 */
export default class NavigationRouter extends EventTarget {
    /**
     * Adds a route and its handler to the router.
     *
     * @param {string} route - The route path (e.g., "/about" or "/users/:id").
     * @param {Function} handler - The function to execute when the route is matched.  Receives a route object as an argument.
     */
    add(route: string, handler: Function): void;
    /**
     * Matches a URL to a registered route and executes the associated handler.
     *
     * @param {URL} url - The URL to match against the registered routes.
     * @param {NavigateEvent} event - The navigation event.
     * @emits {change} - Emits a 'change' event with the route data.
     * @emits {404} - Emits a '404' event with the URL if no route is matched.
     */
    match(url: URL, event: NavigateEvent): Promise<void>;
    /**
     * Adds an event listener to the router.  Syntactic sugar for `addEventListener`.
     *
     * @param {string} name - The name of the event to listen for.
     * @param {EventListenerOrEventListenerObject} handler - The event handler.
     */
    on(name: string, handler: EventListenerOrEventListenerObject): void;
    /**
     * Dispatches a custom event on the router.
     *
     * @param {string} name - The name of the event.
     * @param {any} data - The event data (passed as `event.detail`).
     * @emits {name} - Emits an event of type `name` with the provided `data`.
     */
    emit(name: string, data: any): void;
    /**
     * An async iterator that yields promises which resolve on route changes.
     * This allows you to react to route changes in an asynchronous manner.
     *
     * @async
     * @yields {Promise<{ value: { params: object, url: URL }, done: boolean }>} - A promise that resolves with the route parameters and URL, or indicates the iterator is done.
     */
    [Symbol.asyncIterator](): AsyncGenerator<any, void, unknown>;
    #private;
}
/**
 * A custom event class for router events.
 * @extends {CustomEvent}
 */
export class RouterEvent extends CustomEvent<any> {
    /**
     * Creates a new RouterEvent instance.
     *
     * @param {string} name - The name of the event.
     * @param {any} data - The event data (passed as `event.detail`).
     * @returns {RouterEvent} - A new RouterEvent instance.
     */
    static make(name: string, data: any): RouterEvent;
    /**
     * Constructs a new RouterEvent.
     *
     * @param {string} name - The name of the event.
     * @param {any} data - The event data (passed as `event.detail`).
     */
    constructor(name: string, data: any);
}

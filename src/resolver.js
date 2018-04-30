import { isFunction } from 'lodash';
import { bind, getContainer } from '@globality/nodule-config';


/* Default mask function: just passes args.
 */
function defaultMask(obj, args) {
    return [args];
}


export class Resolver {
    constructor(
        {
            aggregate,
            authorize,
            transform,
            mask,
        },
    ) {
        this.aggregate = aggregate;
        this.authorize = authorize;
        this.transform = transform;
        this.mask = mask || defaultMask;
    }

    clone(resolver) {
        this.aggregate = this.aggregate || resolver.aggregate;
        this.authorize = this.authorize || resolver.authorize;
        this.transform = this.transform || resolver.transform;
        this.mask = this.mask || resolver.mask;
    }

    // NB: async class methods were added to node in v8.x
    async resolve(obj, args, context, info) {
        const masked = this.mask(obj, args, context, info);

        if (this.authorize) {
            await this.authorize(...masked);
        }

        // aggregate asynchronous requests over services.
        const aggregated = await this.aggregate(...masked);

        if (!this.transform) {
            return aggregated;
        }

        // transform aggregated service data into a resource
        return this.transform(aggregated, ...masked);
    }
}


export function createResolver(options) {
    return new Resolver(options);
}

export function cloneResolver(resolver, options) {
    return new Resolver(Object.assign({}, resolver, options));
}

/* Register a default 'null' resolver.
 */
bind('graphql.resolvers.null', () => createResolver({
    aggregate: async () => null,
    transform: () => null,
}));


/* Look up a resolver by key.
 *
 * Returns a resolver function that dynamically selects the resolver on invocation,
 * allow the resolver to definition to be injected (via bottle/@nodule-config).
 *
 * In the majority of cases, `key` will be a string that maps to the resolver name.
 *
 * For more complex uses cases, `key` may be a function; the keys return value will
 * be used as the resolver name.
 */
export function getResolver(key) {
    return (obj, args, context, info) => {
        const name = isFunction(key) ? key(obj, args, context, info) : key;
        const resolver = getContainer(`graphql.resolvers.${name}`);
        return resolver.resolve(obj, args, context, info);
    };
}

import { isNil, isFunction } from 'lodash';
import { bind, getContainer } from '@globality/nodule-config';


/* Default mask function: preserves standard arguments
 */
function defaultMask(obj, args, context, info) {
    return [obj, args, context, info];
}


/* A resolver is a structured abstraction around a GraphQL resolver function.
 *
 * It includes:
 *
 *  -  An async `aggregate` function, which queries/mutates data from one or more services.
 *  -  An async `authorize` function, which throws an error if the resolver should not run.
 *  -  A user-defined `authorizedData` payload, which is passed to the `authorize` function
 *     (if provided).
 *  -  A synchronous `transform` function, which presents the result of the aggregation in
 *     the expected shape of the upstream resource.
 *  -  A synchronous `mask` function, which manipulates the standard GraphQL resolver
 *     arguments into a form supported by the other functions.
 */
export class Resolver {
    constructor(
        {
            aggregate,
            authorize,
            authorizeData,
            transform,
            mask,
        },
    ) {
        this.aggregate = aggregate;
        this.authorize = authorize;
        this.authorizeData = authorizeData;
        this.transform = transform;
        this.mask = mask || defaultMask;
    }

    // NB: async class methods were added to node in v8.x
    async resolve(obj, args, context, info) {
        const masked = this.mask(obj, args, context, info);

        if (this.authorize) {
            if (isNil(this.authorizeData)) {
                await this.authorize(...masked);
            } else {
                await this.authorize(this.authorizeData, ...masked);
            }
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

/* Create a resolver.
 */
export function createResolver(options) {
    return new Resolver(options);
}


/* Create a strict resolver.
 *
 * A strict resolver must define an authorize and a mask function.
 */
export function createStrictResolver(options) {
    if (!options.aggregate) {
        throw new Error('Strict resolver must define an `aggregate` option');
    }
    if (!options.authorize) {
        throw new Error('Strict resolver must define an `authorize` option');
    }
    if (!options.transform) {
        throw new Error('Strict resolver must define a `transform` option');
    }
    return createResolver(options);
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

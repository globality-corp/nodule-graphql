import { getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { isFunction, isNil } from 'lodash';

/**
 * Default mask function: preserves standard arguments
 */
function defaultMask(obj: any, args: any, context: any, info: any) {
    return [obj, args, context, info];
}

/**
 * A resolver is a structured abstraction around a GraphQL resolver function.
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
 *  -  An async `preAggregate` function, which can be used to factor out some preliminary work,
 *     that requires a network call. It can alter the arguments passed to the `aggregate` function,
 *     but can't change their order. Note it gets arguments in the order they are returned by `mask`.
 */
export class Resolver {
    aggregate: any;

    authorize: any;

    authorizeData: any;

    mask: any;

    preAggregate: any;

    transform: any;

    constructor({ aggregate, authorize, authorizeData, transform, mask, preAggregate }: any) {
        this.aggregate = aggregate;
        this.authorize = authorize;
        this.authorizeData = authorizeData;
        this.transform = transform;
        this.mask = mask || defaultMask;
        this.preAggregate = preAggregate || null;
    }

    // NB: async class methods were added to node in v8.x
    async resolve(obj: any, args: any, context: any, info: any) {
        if (this.authorize) {
            // allow authorizer to be looked up by name
            const authorize = isFunction(this.authorize) ? this.authorize : getContainer(`graphql.authorizers.${this.authorize}`);

            // always invoke authorizers with standard resolver arguments
            if (isNil(this.authorizeData)) {
                await authorize(obj, args, context, info);
            } else {
                await authorize(this.authorizeData, obj, args, context, info);
            }
        }

        // apply mask function
        const masked = this.mask(obj, args, context, info);

        // apply preAggregate
        if (this.preAggregate) {
            await this.preAggregate(...masked);
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

/**
 * Create a resolver.
 */
export function createResolver(options: any) {
    return new Resolver(options);
}

/**
 * Create a strict resolver.
 *
 * A strict resolver must define an authorize and a mask function.
 */
export function createStrictResolver(options: any) {
    if (!options.aggregate) {
        throw new Error('Strict resolver must define an `aggregate` option');
    }
    if (!options.authorize) {
        throw new Error('Strict resolver must define an `authorize` option');
    }
    return createResolver(options);
}

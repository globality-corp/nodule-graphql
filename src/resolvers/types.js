import { getContainer } from '@globality/nodule-config';
import { isFunction, isNil } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

/**
 * A resolver is a structured abstraction around a GraphQL resolver function.
 *
 * @template T
 * @typedef {Object} Options
 * @prop {T} aggregate An async function, which queries/mutates data from one or more services.
 * @prop {(Function | string)=} authorize An async function, which throws an error if the resolver should not run.
 * @prop {Function=} authorizeData A user-defined payload, which is passed to the `authorize` function
 * (if provided).
 * @prop {Function=} transform A synchronous function, which presents the result of the aggregation in
 * the expected shape of the upstream resource.
 * @prop {Function=} mask A synchronous function, which manipulates the standard GraphQL resolver arguments
 * into a form supported by the other functions.
 * @prop {Function=} preAggregate An async function, which can be used to factor out some preliminary work,
 * that requires a network call. It can alter the arguments passed to the `aggregate` function, but can't change their order.
 * Note it gets arguments in the order they are returned by `mask`.
 * @prop {Number=} maxCallsPerRequest An integer, which specifies the number of times the resolver can be called
 * within a single request. More calls will rsult in logging a warning, that can be used for alerting. This is to prevent
 * overfetching by API clients, when it's known that a given resolver should be triggered only once, for a single parent object.
 */

/**
 * Default mask function: preserves standard arguments
 */
function defaultMask(obj, args, context, info) {
    return [obj, args, context, info];
}

/** @template T */
export class Resolver {
    /**
     * @constructor
     * @param {Options<T>}
     */
    constructor({ aggregate, authorize, authorizeData, transform, mask, preAggregate, maxCallsPerRequest }) {
        this.aggregate = aggregate;
        this.authorize = authorize;
        this.authorizeData = authorizeData;
        this.transform = transform;
        this.mask = mask || defaultMask;
        this.preAggregate = preAggregate || null;
        this.maxCallsPerRequest = maxCallsPerRequest || null;
        this.resolverId = uuidv4();
    }

    // NB: async class methods were added to node in v8.x
    async resolve(obj, args, context, info) {
        // enforce overfetching guard
        if (this.maxCallsPerRequest && !isNil(context)) {
            if (isNil(context.callCounts)) {
                context.callCounts = {};
            }
            if (isNil(context.callCounts[this.resolverId])) {
                context.callCounts[this.resolverId] = 0;
            }
            const callCount = ++context.callCounts[this.resolverId]; // eslint-disable-line no-plusplus
            if (callCount > this.maxCallsPerRequest) {
                const { logger } = getContainer();
                const msg = `Exceeded maximum number of resolver calls per request: ${this.maxCallsPerRequest}, called ${callCount} times.`;
                logger.warning(context, msg);
            }
        }

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
 * @template T
 * @param {Options<T>} options
 */
export function createResolver(options) {
    return new Resolver(options);
}

/**
 * Create a strict resolver.
 *
 * A strict resolver must define an authorize and a mask function.
 * @template T
 * @param {Options<T>} options
 */
export function createStrictResolver(options) {
    if (!options.aggregate) {
        throw new Error('Strict resolver must define an `aggregate` option');
    }
    if (!options.authorize) {
        throw new Error('Strict resolver must define an `authorize` option');
    }
    return createResolver(options);
}

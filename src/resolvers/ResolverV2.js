// @ts-check
import { getContainer } from '@globality/nodule-config';
import { v4 as uuidv4 } from 'uuid';

/**
 * A standard resolver function signature.
 * @typedef {(parent: any, args: any, context: any, info: any) => any} Aggregate
 */

/**
 * @template {Aggregate} T
 * @typedef {Object} Options
 * @prop {T} aggregate An async function which queries/mutates data from one or more services.
 * @prop {(Function | string)=} authorize An async function which throws an error if the resolver should not run.
 * @prop {Function=} authorizeData A user-defined payload which is passed to the `authorize` function (if provided).
 * @prop {T=} preAggregate An async function, which can be used to factor out some preliminary work,
 * that requires a network call. It can alter the arguments passed to the `aggregate` function, but can't change their order.
 * @prop {number=} maxCallsPerRequest An integer which specifies the number of times the resolver can be called
 * within a single request. More calls will result in logging a warning, that can be used for alerting. This is to prevent
 * overfetching by API clients, when it's known that a given resolver should be triggered only once, for a single parent object.
 */

/**
 * A resolver is a structured abstraction around a GraphQL resolver function.
 * @template {Aggregate} T
 */
export class ResolverV2 {
    /**
     * @constructor
     * @param {Options<T>} options
     */
    constructor({ aggregate, authorize, authorizeData, preAggregate, maxCallsPerRequest }) {
        this.aggregate = aggregate;
        this.authorize = authorize;
        this.authorizeData = authorizeData;
        this.preAggregate = preAggregate;
        this.maxCallsPerRequest = maxCallsPerRequest;
        this.resolverId = uuidv4();
    }

    async resolve(obj, args, context, info) {
        // enforce overfetching guard
        if (this.maxCallsPerRequest && !!context) {
            if (!context.callCounts) {
                context.callCounts = {};
            }

            if (!context.callCounts[this.resolverId]) {
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
            const authorize = typeof this.authorize === 'function' ? this.authorize : getContainer(`graphql.authorizers.${this.authorize}`);

            // always invoke authorizers with standard resolver arguments
            if (!this.authorizeData) {
                // @ts-ignore
                await authorize(obj, args, context, info);
            } else {
                // @ts-ignore
                await authorize(this.authorizeData, obj, args, context, info);
            }
        }

        // apply preAggregate
        if (this.preAggregate) {
            await this.preAggregate(obj, args, context, info);
        }

        return this.aggregate(obj, args, context, info);
    }
}

/**
 * Create a resolver.
 * @template {Aggregate} T
 * @param {Options<T>} options
 */
export function createResolverV2(options) {
    return new ResolverV2(options);
}

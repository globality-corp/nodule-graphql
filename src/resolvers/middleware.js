import { bind } from '@globality/nodule-config';
/* A resolver middleware is an abstraction around code meant to be
 * run before every resolver in the application, except for those explicitly excluded
 *
 */
export class ResolverMiddleware {
    constructor (
        {
            execute,
            excludedResolvers,
        },
    ) {
        this.execute = execute;
        this.excludedResolvers = excludedResolvers || [];
    }

    /* Maybe run `this.execute`
     *
     * `this.execute` receives all four resolver arguments
     * and is expected to return them as a list
     */
    async run (resolverKeys, obj, args, context, info) {
        if (!this.shouldIgnore(resolverKeys)) {
            return this.execute(obj, args, context, info);
        }
        return [obj, args, context, info];
    }

    /* If any of the keys in the resolver pipeline should be ignored, ignore the whole pipeline,
     * making the middleware the no-op for this request.
     *
     */
    shouldIgnore(resolverKeys) {
        return resolverKeys.reduce(
            (acc, key) => acc || this.excludedResolvers.includes(key),
            false,
        );
    }
}

export function createResolverMiddleware(options) {
    return new ResolverMiddleware(options);
}

/* Bind resolver middlewares to the graph, in the order in which they should be run
 *
 */
export function setupResolverMiddlewares(middlewares) {
    bind('graphql.resolverMiddlewares', () => middlewares);
}

import { flatten, indexOf, isFunction } from 'lodash';
import { getContainer } from '@globality/nodule-config';


/* Expand a key either into itself (if it's a string) or via a function call.
 *
 * Allowing keys to be functions allows resolver selection to be dynamic,
 * based on runtime arguments.
 */
function expandKey(key, ...args) {
    return isFunction(key) ? key(...args) : key;
}


/* Build a mapping from keys to DI members with the given type.
 */
function buildMapping(keys, type) {
    return keys.map(
        key => [key, getContainer(`graphql.${type}.${key}`)],
    ).filter(
        pair => !!pair[1],
    ).reduce(
        (acc, [key, value]) => Object.assign(
            acc,
            {
                [key]: value,
            },
        ),
        {},
    );
}


/* Execute a pipeline.
 */
async function executePipeline(pipeline, args) {
    // we expect exactly one resolver
    const resolverKey = Object.keys(pipeline.resolvers)[0];
    const resolverIndex = indexOf(pipeline.keys, resolverKey);
    const resolver = pipeline.resolvers[resolverKey];

    // apply masks to the input arguments
    const masked = pipeline.keys.filter(
        (key, index) => index < resolverIndex,
    ).reduce(
        (acc, key) => pipeline.masks[key](...acc),
        args,
    );

    // apply the resolver to the masked input
    const result = await resolver.resolve(...masked);

    // transform the result and the masked input
    return pipeline.keys.filter(
        (key, index) => index > resolverIndex,
    ).reduce(
        (acc, key) => pipeline.transforms[key](acc, ...masked),
        result,
    );
}


/* Validate a pipeline.
 */
function validatePipeline(pipeline) {
    // Ensure we have *exactly* one resolver
    if (Object.keys(pipeline.resolvers).length === 0) {
        throw new Error(`No resolver could be found for: ${pipeline.keys.join(', ')}`);
    }
    if (Object.keys(pipeline.resolvers).length !== 1) {
        throw new Error(`Multiple resolvers were found for: ${pipeline.keys.join(', ')}`);
    }

    const resolverKey = Object.keys(pipeline.resolvers)[0];
    const resolverIndex = indexOf(pipeline.keys, resolverKey);

    // Ensure all keys at the front of the pipeline are valid mask functions
    pipeline.keys.filter(
        (key, index) => index < resolverIndex,
    ).forEach(
        (key) => {
            if (!pipeline.masks[key]) {
                throw new Error(`No mask could be found for: ${key}`);
            }
        },
    );

    // Ensure that all keys at the back of the pipeline are valid transforms
    pipeline.keys.filter(
        (key, index) => index > resolverIndex,
    ).forEach(
        (key) => {
            if (!pipeline.transforms[key]) {
                throw new Error(`No transform could be found for: ${key}`);
            }
        },
    );
}

async function executeResolverMiddlewares(resolverKeys, args) {
    const middlewares = getContainer('graphql.resolverMiddlewares');
    if (middlewares) {
        // Middlewares are chained
        return middlewares.reduce(
            async (args, middleware) => await middleware.run(resolverKeys, ...args),
            args,
        )
    }
    return args;
}


/* Define a pipeline of functions that make up a single logical resolver.
 *
 * Exactly one of these functions is expected to be a proper resolver; the
 * other functions should be supplemental `mask` or `transform` functions,
 * allowing a single resolver instance to be reused in different contexts
 * without copying.
 *
 * Example resource definition:
 *
 *     resolve: getResolverPipeline('maskFunctionName', 'resolverName', 'transformName'),
 */
export function getResolverPipeline(...keys) {
    if (!keys.length) {
        throw new Error('Resolver pipeline requires a least one input');
    }

    return async (...args) => {
        const pipeline = {};

        // First, expand inputs keys in case they are actually functions
        pipeline.keys = flatten(keys.map(
            key => expandKey(key, ...args),
        ));

        // Next, map keys to resolvers, masks, and transfoms
        ['resolvers', 'masks', 'transforms'].forEach(
            (type) => {
                pipeline[type] = buildMapping(pipeline.keys, type);
            },
        );
        // Then, ensure we have a valid pipeline
        validatePipeline(pipeline);

        // Run resolver middlewares
        const postMiddlewareArgs = await executeResolverMiddlewares(pipeline.keys, args);
        // Finally, execute the pipeline
        return executePipeline(pipeline, postMiddlewareArgs);
    };
}


/* Look up a single resolver by key.
 */
export function getResolver(key) {
    // we just want a degenerate pipeline
    return getResolverPipeline(key);
}

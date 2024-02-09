import { getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { flatten, indexOf, isFunction } from 'lodash';

/**
 * Expand a key either into itself (if it's a string) or via a function call.
 *
 * Allowing keys to be functions allows resolver selection to be dynamic,
 * based on runtime arguments.
 */
function expandKey(key: any, ...args: any[]) {
    return isFunction(key) ? key(...args) : key;
}

/**
 * Build a mapping from keys to DI members with the given type.
 */
function buildMapping(keys: any, type: any) {
    return keys
        .map((key: any) => [key, getContainer(`graphql.${type}.${key}`)])
        .filter((pair: any) => !!pair[1])
        .reduce(
            // @ts-expect-error TS(7031): Binding element 'key' implicitly has an 'any' type... Remove this comment to see the full error message
            (acc: any, [key, value]) =>
                Object.assign(acc, {
                    [key]: value,
                }),
            {}
        );
}

/**
 * Execute a pipeline.
 */
async function executePipeline(pipeline: any, args: any) {
    // we expect exactly one resolver
    const resolverKey = Object.keys(pipeline.resolvers)[0];
    const resolverIndex = indexOf(pipeline.keys, resolverKey);
    const resolver = pipeline.resolvers[resolverKey];

    // apply masks to the input arguments
    const masked = pipeline.keys
        .filter((key: any, index: any) => index < resolverIndex)
        .reduce((acc: any, key: any) => pipeline.masks[key](...acc), args);

    // apply the resolver to the masked input
    const result = await resolver.resolve(...masked);

    // transform the result and the masked input
    return pipeline.keys
        .filter((key: any, index: any) => index > resolverIndex)
        .reduce((acc: any, key: any) => pipeline.transforms[key](acc, ...masked), result);
}

/**
 * Validate a pipeline.
 */
function validatePipeline(pipeline: any) {
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
    pipeline.keys
        .filter((key: any, index: any) => index < resolverIndex)
        .forEach((key: any) => {
            if (!pipeline.masks[key]) {
                throw new Error(`No mask could be found for: ${key}`);
            }
        });

    // Ensure that all keys at the back of the pipeline are valid transforms
    pipeline.keys
        .filter((key: any, index: any) => index > resolverIndex)
        .forEach((key: any) => {
            if (!pipeline.transforms[key]) {
                throw new Error(`No transform could be found for: ${key}`);
            }
        });
}

/**
 * Define a pipeline of functions that make up a single logical resolver.
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
export function getResolverPipeline(...keys: any[]) {
    if (!keys.length) {
        throw new Error('Resolver pipeline requires a least one input');
    }

    return async (...args: any[]) => {
        const pipeline = {};

        // First, expand inputs keys in case they are actually functions
        // @ts-expect-error TS(2339): Property 'keys' does not exist on type '{}'.
        pipeline.keys = flatten(keys.map((key) => expandKey(key, ...args)));

        // Next, map keys to resolvers, masks, and transfoms
        ['resolvers', 'masks', 'transforms'].forEach((type) => {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            pipeline[type] = buildMapping(pipeline.keys, type);
        });
        // Then, ensure we have a valid pipeline
        validatePipeline(pipeline);

        // Finally, execute the pipeline
        return executePipeline(pipeline, args);
    };
}

/**
 * Look up a single resolver by key.
 */
export function getResolver(key: any) {
    // we just want a degenerate pipeline
    return getResolverPipeline(key);
}

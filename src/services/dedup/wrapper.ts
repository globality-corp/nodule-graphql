/* Use DataLoader library for in-memory request deduplication.
 *
 * DataLoader consolidates all Promises for the same loader and input key
 * during a single node "clock-tick", removing the need to evaluation some
 * duplication requests.
 *
 * DataLoader does not do anything magic that spans multiple clock-ticks.
 * Our own batching and caching are necessary in many cases.
 */
import { getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module '@glo... Remove this comment to see the full error message
import { concurrentPaginate } from '@globality/nodule-openapi';
import DataLoader from 'dataloader';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get, set } from 'lodash';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'uuid... Remove this comment to see the full error message
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetch (and lazy-create) loaders by name.
 *
 * Loaders are cached on the request for re-use. Loaders are not shared
 * across requests because of potential to violate access control policies
 * between concurrent users.
 */
function getLoader(req: any, loaderId: any, loadMany: any, allowBatch: any) {
    const { createKey } = getContainer();
    let loader = get(req, `loaders.${loaderId}`);

    if (!loader) {
        loader = new DataLoader((argsList) => loadMany(req, argsList), {
            // key uses a json like representation of ordered keys
            // straight json would not work if parameters came in different order
            cacheKeyFn: (args) => createKey(args),
            batch: allowBatch,
        });
        set(req, `loaders.${loaderId}`, loader);
    }
    return loader;
}

/**
 * Is a response object from a DataLoader function an errror (vs a BE result).
 *
 * An error object is an object with:
 *   1. An error key (with Error as value)
 *   2. An (optional) id key (such as id, userId, etc) and value
 */
function isError(object: any) {
    return object.error && Object.keys(object).length <= 2;
}

/**
 * Wrapper that uses DataLoader for in-request de-duplication.
 */
export function dedupMany(loadMany: any, {
    loaderName,
    allowBatch = false
}: any) {
    const loaderId = loaderName || uuidv4();
    // Fetch the loader in call time - (and in the req init)
    return async (req: any, args: any) =>
        getLoader(req, loaderId, loadMany, allowBatch)
            .load(args)
            .then((res: any) => {
                // special case - batch wrapper can an object with an error key to raise
                if (isError(res)) {
                    throw res.error;
                }
                return res;
            });
}

/**
 * Wrapper that uses DataLoader for in-request de-duplication.
 */
export default function dedup(load: any, {
    loaderName
}: any) {
    const loadMany = async (req: any, argsList = []) => concurrentPaginate(argsList.map((args) => load(req, args)));

    return dedupMany(loadMany, { loaderName });
}

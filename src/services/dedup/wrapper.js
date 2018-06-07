/* Use DataLoader library for in-memory request deduplication.
 *
 * DataLoader consolidates all Promises for the same loader and input key
 * during a single node "clock-tick", removing the need to evaluation some
 * duplication requests.
 *
 * DataLoader does not do anything magic that spans multiple clock-ticks.
 * Our own batching and caching are necessary in many cases.
 */
import DataLoader from 'dataloader';
import uuidv4 from 'uuid/v4';
import { get } from 'lodash';
import { bind, getContainer } from '@globality/nodule-config';
import { concurrentPaginate } from '@globality/nodule-openapi';


/* Fetch (and lazy-create) loaders by name.
 *
 * Loaders are cached on the request for re-use. Loaders are not shared
 * across requests because of potential to violate access control policies
 * between concurrent users.
 */
function getLoader(req, loaderId, loadMany, allowBatch) {
    const { loaders } = getContainer();
    const { createKey } = getContainer();

    let loader = get(loaders, loaderId);
    if (!loader) {
        loader = new DataLoader(
            argsList => loadMany(req, argsList),
            {
                // key uses a json like representation of ordered keys
                // straight json would not work if parameters came in different order
                cacheKeyFn: args => createKey(args),
                batch: allowBatch,
            },
        );
        bind(`loaders.${loaderId}`, () => loader);
    }
    return loader;
}


/* Is a response object from a DataLoader function an errror (vs a BE result).
 *
 * An error object is an object with:
 *   1. An error key (with Error as value)
 *   2. An (optional) id key (such as id, userId, etc) and value
 */
function isError(object) {
    return (object.error && Object.keys(object).length <= 2);
}


/* Wrapper that uses DataLoader for in-request de-duplication.
 */
export function dedupMany(loadMany, { loaderName, allowBatch = false }) {
    const loaderId = loaderName || uuidv4();
    // Fetch the loader in call time - (and in the req init)
    return async (req, args) => getLoader(
        req,
        loaderId,
        loadMany,
        allowBatch,
    ).load(args).then((res) => {
        // special case - batch wrapper can an object with an error key to raise
        if (isError(res)) {
            throw res.error;
        }
        return res;
    });
}


/* Wrapper that uses DataLoader for in-request de-duplication.
 */
export default function dedup(load, { loaderName }) {
    const loadMany = async (req, argsList = []) => concurrentPaginate(
        argsList.map(args => load(req, args)),
    );

    return dedupMany(loadMany, { loaderName });
}

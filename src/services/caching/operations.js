/* Caching operations.
 */


/* Store a value at a key with a ttl.
 *
 * Uses memached `Add` operation, meaning that the styx will never overwrite
 * an existing key. This logic allows `lethe` to implement invalidation with
 * by writing a null value with a short TTL (e.g. 5s), thereby avoiding race
 * conditions where styx rewrites a stale value back into the cache after
 * cache invalidation but before reading the new one.
 */
// XXX - move to a utility
import { getContainer } from '@globality/nodule-config';

export async function saveToCache(req, key, value, ttl) {
    try {
        const { cache } = getContainer();
        await cache.add(key, value, ttl);
    } catch (error) {
        // Two cases here:
        //
        //  1. error.notStored => data was already present, either because
        //     of a concurrent write from another styx process or an
        //     invalidation from lethe.
        //
        //  2. !error.notStored => something actually went wrong
        if (!error.notStored) {
            const { logger } = getContainer();
            logger.warning(req, 'unable to add cache data', {
                error: error.message,
                key,
            });
        }
    }
    return value;
}


/* Fetch values from the cache by (multiple) keys.
 *
 * Returns an array of values; uses `undefined` for missing values.
 */
export async function getFromCache(req, keys) {
    try {
        const { cache } = getContainer();
        const values = await cache.getMulti(keys);
        return keys.map(key => values[key]);
    } catch (err) {
        const { logger } = getContainer();
        logger.warning(req, err.message, {
            error: err,
            keys,
        });
        return keys.map(() => undefined);
    }
}

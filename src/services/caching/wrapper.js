import Enum from 'enum';
import DataLoader from 'dataloader';
import { get, set } from 'lodash';
import { getContainer } from '@globality/nodule-config';
import { extractLoggingProperties } from '@globality/nodule-logging';
import dedup from '../dedup/wrapper';
import { getFromCache, saveToCache } from './operations';


/* Lazy create a single data loader for all cache requests.
 *
 * Using a data loader allows us to dedup and aggregate cache requests,
 * which is especially useful with memached's `Multi-Get` operation.
 */
export function getCacheLoader(req) {
    // Get a DataLoader for cache operations
    // Create it if it's the first use of it for the req.
    let loader = get(req, 'loaders.cache');
    if (!loader) {
        loader = new DataLoader(argsList => getFromCache(req, argsList));
        set(req, 'loaders.cache', loader);
    }
    return loader;
}


/* Trace a cache operation.
 *
 * Returned via local cacheUsage extension.
 */
function trace(spec, req, args, key, result, extra) {
    let cacheUsage = get(req, 'locals.extensions.cacheUsage');
    if (!cacheUsage) {
        cacheUsage = { keys: [] };
        set(req, 'locals.extensions.cacheUsage', cacheUsage);
    }
    cacheUsage.keys.push({
        resourceName: spec.resourceName,
        args,
        key,
        result: result.key,
        ...extra,
    });
}


/* Cache outcomes.
 */
export const CacheResult = new Enum({
    read: 'Fetched from cache',
    ignore: 'Ignored the cached data',
    write: 'Saved to cache',
    noop: 'No data',
    error: 'Cache error',
});

export function getCacheAction(req, cacheData, spec) {
    // not in cache - update the cache cache
    if (!cacheData) {
        return CacheResult.noop;
    }

    // in cache - but should ignore the cached value
    if (spec.shouldIgnoreCache(req, cacheData)) {
        return CacheResult.ignore;
    }

    // in cache - use cache data
    return CacheResult.read;
}

/* First fetch a resource from memached, then fallback to the service.
 */
async function getFromCacheThenService(wrapped, spec, req, args, key) {
    const { config, logger } = getContainer();
    try {
        const cacheData = await getCacheLoader(req).load(key);
        const cacheAction = getCacheAction(req, cacheData, spec);

        if (cacheAction === CacheResult.read) {
            trace(spec, req, args, key, cacheAction);
            return [cacheData, cacheAction];
        }
        const serviceData = await wrapped(req, args);
        // ignore false values - to avoid saving denied auth access
        if (serviceData) {
            if (cacheAction === CacheResult.ignore) {
                trace(spec, req, args, key, cacheAction);
                return [serviceData, cacheAction];
            }

            const result = CacheResult.write;
            const ttl = spec.cacheTTL || parseInt(get(config, 'cache.ttl', 0), 10);
            // don't await
            saveToCache(req, key, serviceData, ttl);
            trace(spec, req, args, key, result, { ttl });
            return [serviceData, result];
        }
        return [serviceData, CacheResult.noop];
    } catch (err) {
        const result = CacheResult.error;
        logger.warning(req, err.message, {
            error: err,
            key,
            args,
        });
        trace(spec, req, args, key, result);
        const res = await wrapped(req, args);
        return [res, result];
    }
}


function calculateExecuteTime(executeStartTime) {
    const executeTime = process.hrtime(executeStartTime);
    return (executeTime[0] * 1e3) + (executeTime[1] * 1e-6);
}


function logCacheUsage(spec, req, key, result, executeStartTime) {
    const { config, logger } = getContainer();
    if (!get(config, 'logger.cache.enabled', false)) {
        return;
    }

    const executeTime = calculateExecuteTime(executeStartTime);
    const logs = {
        serviceResponseTimeMs: executeTime,
        key,
        cacheMessage: result.value,
        cacheTTL: spec.cacheTTL,
        resourceName: spec.resourceName,
        ...(spec.requireArgs ? { serviceRequestArgs: Object.keys(spec.requireArgs) } : {}),
        ...extractLoggingProperties(
            { params: spec.requireArgs },
            get(config, 'logger.serviceRequestRules', []),
        ),
    };
    logger.info(req, 'CacheRequest', logs);
}


/* Wrap a service request so that it uses caching.
 *
 * `spec` is an instance of `CachingSpec`
 */
export default function wrap(wrapped, spec) {
    const wrapper = async (req, args) => {
        if (spec.shouldSkipCache(req, args)) {
            return wrapped(req, args);
        }
        const key = spec.createKey(args);
        const executeStartTime = process.hrtime();
        const [res, result] = await getFromCacheThenService(wrapped, spec, req, args, key);
        logCacheUsage(spec, req, key, result, executeStartTime);
        return res;
    };

    return dedup(wrapper, { loaderName: spec.loaderName });
}

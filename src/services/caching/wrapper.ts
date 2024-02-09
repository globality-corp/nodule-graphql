import { getContainer } from '@globality/nodule-config';
import DataLoader from 'dataloader';
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'enum... Remove this comment to see the full error message
import Enum from 'enum';
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get, set } from 'lodash';

import dedup from '../dedup/wrapper';

import logCacheUsage from './logging';
import traceCacheCall from './traceCacheCall';

/**
 * Cache outcomes.
 */
export const CacheResult = new Enum({
    read: 'Fetched from cache',
    ignore: 'Ignored the cached data',
    write: 'Saved to cache',
    noop: 'No data',
    error: 'Cache error',
});

/**
 * Lazy create a single data loader for all cache requests.
 *
 * Using a data loader allows us to dedup and aggregate cache requests,
 * which is especially useful with memached's `Multi-Get` operation.
 */
export function getCacheLoader(req: any, spec: any) {
    // Get a DataLoader for cache operations
    // Create it if it's the first use of it for the req.
    const { cache } = getContainer();
    let loader = get(req, 'loaders.cache');
    if (!loader) {
        loader = new DataLoader((argsList) =>
            cache.safeGet(req, argsList, {
                operation: spec.endpointName,
                objectType: spec.resourceName,
            })
        );
        set(req, 'loaders.cache', loader);
    }
    return loader;
}

export function getCacheAction(req: any, cacheData: any, spec: any) {
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

/**
 * First fetch a resource from memached, then fallback to the service.
 */
async function getFromCacheThenService(wrapped: any, spec: any, req: any, args: any, key: any) {
    const { config, logger, cache } = getContainer();
    try {
        const cacheData = await getCacheLoader(req, spec).load(key);
        const cacheAction = getCacheAction(req, cacheData, spec);

        if (cacheAction === CacheResult.read) {
            return [cacheData, cacheAction];
        }
        const serviceData = await wrapped(req, args);
        // ignore false values - to avoid saving denied auth access
        if (serviceData) {
            if (cacheAction === CacheResult.ignore) {
                return [serviceData, cacheAction];
            }

            const result = CacheResult.write;
            const ttl = spec.cacheTTL || parseInt(get(config, 'cache.ttl', 0), 10);
            // don't await
            cache.safeSave(req, key, serviceData, ttl, {
                operation: spec.endpointName,
                objectType: spec.resourceName,
            });
            return [serviceData, result];
        }
        return [serviceData, CacheResult.noop];
    } catch (err) {
        const result = CacheResult.error;
        // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
        logger.warning(req, err.message, {
            error: err,
            key,
            args,
        });
        // Theoretically, we might call the service twice,
        // but it should be covered by batching and dedup.
        const res = await wrapped(req, args);
        return [res, result];
    }
}

/**
 * Wrap a service request so that it uses caching.
 *
 * `spec` is an instance of `CachingSpec`
 */
export default function wrap(wrapped: any, spec: any, serviceName: any) {
    spec.setEndpointName(serviceName);
    const wrapper = async (req: any, args: any) => {
        if (spec.shouldSkipCache(req, args)) {
            return wrapped(req, args);
        }
        const key = spec.createKey(args);
        const executeStartTime = process.hrtime();
        const [res, result] = await getFromCacheThenService(wrapped, spec, req, args, key);
        // @ts-expect-error TS(2554) FIXME: Expected 6 arguments, but got 5.
        traceCacheCall(spec, req, args, key, result);
        logCacheUsage(spec, req, key, result, executeStartTime);
        return res;
    };

    return dedup(wrapper, { loaderName: spec.loaderName });
}

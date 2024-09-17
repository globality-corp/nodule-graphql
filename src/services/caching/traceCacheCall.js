import { get, set } from 'lodash-es';

/* Trace a cache operation.
 *
 * Returned via local cacheUsage extension.
 */
export default function traceCacheCall(spec, req, args, key, result, extra) {
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

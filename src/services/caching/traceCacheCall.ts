// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get, set } from 'lodash';

/* Trace a cache operation.
 *
 * Returned via local cacheUsage extension.
 */
export default function traceCacheCall(spec: any, req: any, args: any, key: any, result: any, extra: any) {
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

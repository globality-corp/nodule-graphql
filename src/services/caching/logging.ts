import { getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module '@glo... Remove this comment to see the full error message
import { extractLoggingProperties } from '@globality/nodule-logging';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get } from 'lodash';

import { calculateExecuteTime } from '../../logging';

export default function logCacheUsage(spec: any, req: any, key: any, result: any, executeStartTime: any) {
    const { config, logger } = getContainer();
    if (!get(config, 'logger.cache.enabled')) {
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
        ...extractLoggingProperties({ params: spec.requireArgs }, get(config, 'logger.serviceRequestRules', [])),
    };
    logger.info(req, 'CacheRequest', logs);
}

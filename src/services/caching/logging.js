import { getContainer } from '@globality/nodule-config';
import { extractLoggingProperties } from '@globality/nodule-logging';
import { get } from 'lodash';

import { calculateExecuteTime } from '../../logging';

export default function logCacheUsage(spec, req, key, result, executeStartTime) {
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

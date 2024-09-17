import { getContainer } from '@globality/nodule-config';
import { anyNonNil } from 'is-uuid';
import { get, includes, isArray, isEqual, isFunction, isNil, isUndefined } from 'lodash-es';

import createKey from '../core/keys.js';

import JSONStringify from './JSONStringify.js';
import spooky128 from './spooky128.js';

export const ANY_NOT_NULL = (value) => !isNil(value);
export const ANY_PARAMETER = (value) => !isUndefined(value);
export const ANY_SINGLE_ITEM_LIST = (value) => isArray(value) && value.length === 1;
export const ANY_UUID = (value) => anyNonNil(value);

export class CachingSpec {
    constructor({ cacheTTL = null, loaderName = null, resourceName, requireArgs = null, supportNoCache = false, endpointName }) {
        if (!resourceName) {
            throw new Error('resourceName is required');
        }
        this.cacheTTL = cacheTTL;
        this.resourceName = resourceName;

        if (requireArgs) {
            this.requireArgs = isArray(requireArgs) ? requireArgs : [requireArgs];
        } else {
            this.requireArgs = [];
        }

        this.supportNoCache = supportNoCache;
        this.loaderName = loaderName;
        this.endpointName = endpointName;
    }

    /* Should fetch from the cache
     */
    shouldSkipCache(req, args = {}) {
        const { config } = getContainer();
        const enabled = get(config, 'cache.enabled', false);
        const disableCache = get(req, 'cacheControl.disableCache');
        const supportNoCache = get(req, 'cacheControl.supportNoCache');

        if (!enabled) {
            return true;
        }

        if (disableCache) {
            return true;
        }

        if (this.supportNoCache === true && supportNoCache) {
            return true;
        }

        if (this.requireArgs.length) {
            return !this.requireArgs.some((reqArgs) => this.validateArgs(args, reqArgs));
        }
        return false;
    }

    /* validate that the returned etag matches the requested one
     */
    validateEtag(req, cacheData) {
        const requestedEtags = get(req, `cacheControl.etags.${this.resourceName}`);
        const { config } = getContainer();

        // etag validation not required
        if (!requestedEtags) {
            return true;
        }
        const { logger } = getContainer();
        logger.debug(req, 'Requested etags', requestedEtags);

        const cachedResourceString = JSONStringify(cacheData);
        // microcosm etag compatiable
        // see: https://github.com/globality-corp/microcosm-flask/blob/develop/microcosm_flask/formatting/base.py
        const cachedEtag = spooky128(cachedResourceString);
        // use weak validator sign
        const formttedEtag = `W/"${cachedEtag}"`;
        const etagMatch = includes(requestedEtags, formttedEtag);

        // if we will see many messages like that, we should consider optimization
        if (!etagMatch) {
            if (get(config, 'logger.cache.enabled', false)) {
                logger.debug(req, 'Etag mismatch', { resourceName: this.resourceName });
            }
        } else {
            logger.debug(req, 'Etag match', { resourceName: this.resourceName });
        }
        return etagMatch;
    }

    /* Should use/ignore cached resource - after they're fetched
     */
    shouldIgnoreCache(req, cacheData) {
        if (!this.validateEtag(req, cacheData)) {
            return true;
        }

        return false;
    }

    createKey(args = {}) {
        return createKey(args, this.resourceName);
    }

    validateArgs(args = {}, reqArgs = null) {
        const requireArgs = reqArgs || this.requireArgs[0];

        // every arg must in the required args
        if (!Object.keys(args).every((arg) => requireArgs[arg] !== undefined)) {
            return false;
        }

        // no required arg can be missing
        return Object.keys(requireArgs).every((key) => CachingSpec.validateArg(requireArgs, key, args[key]));
    }

    setEndpointName(endpointName) {
        this.endpointName = endpointName;
    }

    static validateArg(arg, key, value) {
        const requiredValue = arg[key];

        if (isFunction(requiredValue) && requiredValue(value)) {
            return true;
        }

        if (requiredValue === value) {
            return true;
        }

        if (isArray(requiredValue) && isArray(value) && isEqual(value.sort(), requiredValue.sort())) {
            return true;
        }

        return false;
    }
}

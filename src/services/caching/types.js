import { anyNonNil } from 'is-uuid';
import { get, includes, isArray, isEqual, isNil, isUndefined } from 'lodash';
import { getContainer } from '@globality/nodule-config';

import createKey from '../core/keys';
import spooky128 from './spooky128';
import JSONStringify from './JSONStringify';


export const ANY_NOT_NULL = Object();
export const ANY_PARAMETER = Object();
export const ANY_SINGLE_ITEM_LIST = Object();
export const ANY_UUID = Object();


/* Enumeration of cacheable object types.
 *
 * A subset of these type names are invalidable in `lethe`, so names should not be
 * changed without coordination.
 *
 * See: https://github.com/globality-corp/lethe/blob/develop/lethe/models/cached_object_type.py
 */


export class CachingSpec {
    constructor({
        cacheTTL = null,
        loaderName = null,
        resourceName,
        requireArgs = null,
        supportNoCache = false,
    }) {
        if (!resourceName) {
            throw new Error('resourceName is required');
        }
        this.cacheTTL = cacheTTL;
        this.resourceName = resourceName;
        this.requireArgs = requireArgs || {};
        this.supportNoCache = supportNoCache;
        this.loaderName = loaderName;
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

        if (Object.keys(this.requireArgs).length === 0) {
            return false;
        }

        return !this.validateArgs(args);
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
        logger.info(req, 'Requested etags', requestedEtags);

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
                logger.info(req, 'Etag mismatch', { resourceName: this.resourceName });
            }
        } else {
            logger.info(req, 'Etag match', { resourceName: this.resourceName });
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

    validateArgs(args = {}) {
        // every arg must in the required args
        if (!Object.keys(args).every(arg => this.requireArgs[arg] !== undefined)) {
            return false;
        }

        // no required arg can be missing
        return Object.keys(this.requireArgs).every(key => this.validateArg(key, args[key]));
    }

    validateArg(key, value) {
        const requiredValue = this.requireArgs[key];

        if (requiredValue === ANY_PARAMETER && !isUndefined(value)) {
            return true;
        }

        if (requiredValue === ANY_NOT_NULL && !isNil(value)) {
            return true;
        }

        if (requiredValue === ANY_UUID && anyNonNil(value)) {
            return true;
        }

        if (requiredValue === ANY_SINGLE_ITEM_LIST && isArray(value) && value.length === 1) {
            return true;
        }

        if (requiredValue === value) {
            return true;
        }

        if (isArray(requiredValue) &&
            isArray(value) &&
            isEqual(value.sort(), requiredValue.sort())) {
            return true;
        }

        return false;
    }
}

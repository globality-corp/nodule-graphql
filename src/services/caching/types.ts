import { getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'is-u... Remove this comment to see the full error message
import { anyNonNil } from 'is-uuid';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get, includes, isArray, isEqual, isFunction, isNil, isUndefined } from 'lodash';

import createKey from '../core/keys';

import JSONStringify from './JSONStringify';
import spooky128 from './spooky128';

export const ANY_NOT_NULL = (value: any) => !isNil(value);
export const ANY_PARAMETER = (value: any) => !isUndefined(value);
export const ANY_SINGLE_ITEM_LIST = (value: any) => isArray(value) && value.length === 1;
export const ANY_UUID = (value: any) => anyNonNil(value);

export class CachingSpec {
    cacheTTL: any;

    endpointName: any;

    loaderName: any;

    requireArgs: any;

    resourceName: any;

    supportNoCache: any;

    constructor({ cacheTTL = null, loaderName = null, resourceName, requireArgs = null, supportNoCache = false, endpointName }: any) {
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
    shouldSkipCache(req: any, args = {}) {
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
            return !this.requireArgs.some((reqArgs: any) => this.validateArgs(args, reqArgs));
        }
        return false;
    }

    /* validate that the returned etag matches the requested one
     */
    validateEtag(req: any, cacheData: any) {
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
    shouldIgnoreCache(req: any, cacheData: any) {
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
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Object.keys(requireArgs).every((key) => CachingSpec.validateArg(requireArgs, key, args[key]));
    }

    setEndpointName(endpointName: any) {
        this.endpointName = endpointName;
    }

    static validateArg(arg: any, key: any, value: any) {
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

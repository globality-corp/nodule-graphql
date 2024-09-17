/**
 * Wrap service calls by composing multiple wrapper functions.
 *
 * We support batching, caching, and (in-request) deduplication.
 */

import { getContainer } from '@globality/nodule-config';
import { flatten } from 'lodash-es';

import batched from './batching/wrapper.js';
import cached from './caching/wrapper.js';
import named from './core/named.js';
import deduped from './dedup/wrapper.js';

function buildWrappers() {
    const wrappers = [];
    const { serviceConfig } = getContainer();
    if (serviceConfig) {
        const { batch, cache, dedup, additionalWrappers } = serviceConfig;
        // NB: order matters here
        if (dedup) {
            wrappers.push([dedup, deduped]);
        }

        if (batch) {
            wrappers.push([batch, batched]);
        }

        if (cache) {
            wrappers.push([cache, cached]);
        }

        if (additionalWrappers) {
            wrappers.push(...additionalWrappers);
        }
    }
    return wrappers;
}

/**
 * Wrap a service call if args are defined.
 */
export function wrapIf(service, wrapper, args, serviceName) {
    return args ? wrapper(service, args, serviceName) : service;
}

/**
 * Wrap a single service call.
 */
function wrap(wrappers, name) {
    return wrappers.reduce((service, [config, wrapper]) => wrapIf(service, wrapper, config[name], name), named(name));
}

function getServiceWrappers() {
    const wrappers = buildWrappers();

    // calculate the full list of service names that are wrapped
    const wrappedServiceNames = Array.from(new Set(flatten(wrappers.map((value) => Object.keys(value[0])))));

    return Object.assign({}, ...wrappedServiceNames.map((name) => ({ [name]: wrap(wrappers, name) })));
}

export default getServiceWrappers;

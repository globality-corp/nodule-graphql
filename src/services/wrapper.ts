/**
 * Wrap service calls by composing multiple wrapper functions.
 *
 * We support batching, caching, and (in-request) deduplication.
 */

import { getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { flatten } from 'lodash';

import batched from './batching/wrapper';
import cached from './caching/wrapper';
import named from './core/named';
import deduped from './dedup/wrapper';

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
export function wrapIf(service: any, wrapper: any, args: any, serviceName: any) {
    return args ? wrapper(service, args, serviceName) : service;
}

/**
 * Wrap a single service call.
 */
function wrap(wrappers: any, name: any) {
    // @ts-expect-error TS(7031) FIXME: Binding element 'config' implicitly has an 'any' t... Remove this comment to see the full error message
    return wrappers.reduce((service: any, [config, wrapper]) => wrapIf(service, wrapper, config[name], name), named(name));
}

function getServiceWrappers() {
    const wrappers = buildWrappers();

    // calculate the full list of service names that are wrapped
    const wrappedServiceNames = Array.from(new Set(flatten(wrappers.map((value) => Object.keys(value[0])))));

    // @ts-expect-error TS(2464) FIXME: A computed property name must be of type 'string',... Remove this comment to see the full error message
    return Object.assign({}, ...wrappedServiceNames.map((name) => ({ [name]: wrap(wrappers, name) })));
}

export default getServiceWrappers;

/* Wrap service calls by composing multiple wrapper functions.
 *
 * We support batching, caching, and (in-request) deduplication.
 */
import { flatten } from 'lodash';
import { getContainer } from '@globality/nodule-config';

import batched from './batching/wrapper';
import deduped from './dedup/wrapper';
import named from './core/named';

function buildWrappers() {
    const wrappers = [];

    const dedupConfig = getContainer('dedupConfig');
    if (dedupConfig) {
        wrappers.append([dedupConfig, deduped]);
    }

    const batchConfig = getContainer('batchConfig');
    if (batchConfig) {
        wrappers.append([batchConfig, batched]);
    }

    const servicesWrappers = getContainer('serviceWrappers');
    if (servicesWrappers) {
        wrappers.extend(servicesWrappers);
    }
    return wrappers;
}

// NB: order matters here
export const WRAPPERS = buildWrappers();


// calculate the full list of service names that are wrapped
export const WRAPPED_SERVICE_NAMES = Array.from(new Set(
    flatten(
        WRAPPERS.map(value => Object.keys(value[0])),
    ),
));


/* Wrap a service call if args are defined.
 */
export function wrapIf(service, wrapper, args) {
    return args ? wrapper(service, args) : service;
}


/* Wrap a single service call.
 */
export function wrap(name) {
    return WRAPPERS.reduce(
        (service, [config, wrapper]) => wrapIf(service, wrapper, config[name]),
        named(name),
    );
}


const servicesWrappers = Object.assign(
    {},
    ...WRAPPED_SERVICE_NAMES.map(name => ({ [name]: wrap(name) })),
);


export default servicesWrappers;

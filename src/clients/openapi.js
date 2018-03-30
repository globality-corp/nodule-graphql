import { get } from 'lodash';

import { getConfig, getMetadata } from '@globality/nodule-config';
import OpenAPI from '@globality/nodule-openapi';


/* Inject mock and testing adapters.
 */
export function buildAdapter(context) {
    const { name, operationName } = context;
    const metadata = getMetadata();
    if (!metadata.testing) {
        return null;
    }

    const key = `clients.mock.${name}.${operationName}`;
    const mock = getConfig(key);

    if (mock) {
        return mock;
    }

    return () => {
        throw new Error(`OpenAPI operation ${name}.${operationName} is not mocked`);
    };
}


/* Inject standard headers.
 */
export function buildHeaders(context, req) {
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
    };

    // pass the current service's name
    const metadata = getMetadata();
    headers['X-Request-Service'] = metadata.name;

    // pass a unique identifier from the requestId middleware
    const requestId = get(req, 'id');
    if (requestId) {
        headers['X-Request-Id'] = requestId;
    }

    // pass the request start time (usually injected by the morgan library)
    const startTime = get(req, '_startTime', new Date());
    headers['X-Request-Started-At'] = startTime.toISOString();

    // pass the current user (if any)
    const userId = get(req, 'locals.user.id');
    if (userId) {
        headers['X-Request-User'] = userId;
    }

    return headers;
}


/* Create a new OpenAPI client using standard conventions:
 *
 *  - Expects `clients.${name}.baseUrl` to be defined
 *  - Automatically mocks requests
 *  - Injects useful headers
 */
export function createOpenAPIClient(name, spec) {
    const metadata = getMetadata();
    const config = getConfig(`clients.${name}`) || {};
    const { baseUrl } = config;

    if (!baseUrl && !metadata.testing && !metadata.debug) {
        throw new Error(`OpenAPI client ${name} does not have a configured baseUrl`);
    }

    const options = {
        baseUrl,
        buildAdapter,
        buildHeaders,
    };
    return OpenAPI(spec, name, options);
}

import { isFunction, set } from 'lodash';

import { OpenAPIError } from '@globality/nodule-openapi';


/* Mock a client (OpenAPI) response.
 */
export function mockResponse(name, operationId, data) {
    const obj = {};

    set(obj, `clients.mock.${name}.${operationId}`, jest.fn(async req => ({
        data: isFunction(data) ? data(req.params || JSON.parse(req.data || null)) : data,
    })));

    return obj;
}


/* Mock a client (OpenAPI) error.
 */
export function mockError(name, operationId, message, code, data = null) {
    const obj = {};

    set(obj, `clients.mock.${name}.${operationId}`, jest.fn(async () => {
        throw new OpenAPIError(message, code, data);
    }));

    return obj;
}

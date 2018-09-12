import { cloneDeepWith, set } from 'lodash';
import { bind, getContainer } from '@globality/nodule-config';
import getServiceWrappers from './wrapper';
import createKeyFunc from './core/keys';

export { default as named } from './core/named';

export function cloneClients(obj) {
    return cloneDeepWith(obj, node => (
        typeof node === 'function' ?
            async (req, args) => node(req, args) :
            Object.keys(node).reduce(
                (acc, key) => ({ ...acc, [key]: cloneClients(node[key]) }),
                {},
            )
    ));
}

/* Wraps clients with the configured services (batching, dedup, etc.)
 * We clone the clients to avoid modifying to the original clients
 */
function wrapClients(clients) {
    const servicesWrappers = getServiceWrappers();
    const services = cloneClients(clients);
    Object.keys(servicesWrappers).forEach((requestName) => {
        set(services, requestName, servicesWrappers[requestName]);
    });
    return services;
}

export default function bindServices() {
    const { createKey } = getContainer();
    if (!createKey) {
        bind('createKey', () => createKeyFunc);
    }
    const { clientsName } = getContainer();
    const clients = getContainer(clientsName || 'clients');
    const services = wrapClients(clients);
    Object.keys(services).forEach((clientName) => {
        bind(`services.${clientName}`, () => services[clientName]);
    });
}

import { get, set, cloneDeepWith } from 'lodash';
import { bind, getContainer } from '@globality/nodule-config';
import getServiceWrappers from './wrapper';

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

function optimizeServices(services) {
    const servicesWrappers = getServiceWrappers();
    Object.keys(servicesWrappers).forEach((requestName) => {
        const serviceRequest = servicesWrappers[requestName];
        if (get(services, requestName)) {
            set(services, requestName, serviceRequest);
        }
    });
}

export default function bindServices() {
    const { clientsName } = getContainer();
    const clients = getContainer(clientsName || 'clients');
    const services = cloneClients(clients);
    optimizeServices(services);
    Object.keys(services).forEach((clientName) => {
        bind(`services.${clientName}`, () => services[clientName]);
    });
}

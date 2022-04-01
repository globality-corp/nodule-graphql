import { getContainer } from '@globality/nodule-config';
import { InternalServerError } from '@globality/nodule-express';
import { get } from 'lodash';

/* Invoke a service via a named client.
 */
export default function named(serviceRequestName) {
    const { clientsName } = getContainer();
    const clients = getContainer(clientsName || 'clients');
    return (req, args) =>
        get(clients, `${serviceRequestName}`, () => {
            throw InternalServerError(`${serviceRequestName} not implemented`);
        })(req, args);
}

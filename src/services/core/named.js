import { get } from 'lodash';
import { getContainer } from '@globality/nodule-config';


/* Invoke a service via a named client.
 */
export default function named(serviceRequestName) {
    const clientName = getContainer('clientsName');
    const clients = getContainer(clientName || 'clients');
    return (req, args) => get(
        clients,
        `${serviceRequestName}`,
        (() => { throw Error(`${serviceRequestName} not implemented`); }),
    )(req, args);
}

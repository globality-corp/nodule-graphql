import { get } from 'lodash';
import { getContainer } from '@globality/nodule-config';


/* Invoke a service via a named client.
 */
export default function named(serviceRequestName) {
    const { clientsName } = getContainer();
    const clients = getContainer(clientsName || 'clients');
    return (req, args) => get(
        clients,
        `${serviceRequestName}`,
        (() => { throw Error(`${serviceRequestName} not implemented`); }),
    )(req, args);
}

import { getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module '@glo... Remove this comment to see the full error message
import { InternalServerError } from '@globality/nodule-express';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get } from 'lodash';

/* Invoke a service via a named client.
 */
export default function named(serviceRequestName: any) {
    const { clientsName } = getContainer();
    const clients = getContainer(clientsName || 'clients');
    return (req: any, args: any) =>
        get(clients, `${serviceRequestName}`, () => {
            throw new InternalServerError(`${serviceRequestName} not implemented`);
        })(req, args);
}

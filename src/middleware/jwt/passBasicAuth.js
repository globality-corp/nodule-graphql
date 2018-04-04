/* Middleware that allows passing JWT via Basic Auth header.
 *
 * Enabling basic auth pass through greatly simplifies graphiql usage.
 */
import basicAuth from 'basic-auth';
import { getConfig } from '@globality/nodule-config';

import sendUnauthorized from './errors';


export default function passBasicAuth(req, res, next) {
    const credentials = basicAuth(req);
    const realm = getConfig('middleware.jwt.realm');

    if (!credentials) {
        res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
        // XXX good log
        return sendUnauthorized(req, res, realm);
    }

    req.headers.authorization = `${credentials.name.trim()} ${credentials.pass.trim()}`; // eslint-disable-line

    return next();
}

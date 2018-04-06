/* Middleware that allows passing JWT via Basic Auth header.
 *
 * Enabling basic auth pass through greatly simplifies graphiql usage.
 */
import { getConfig } from '@globality/nodule-config';

import sendUnauthorized from './errors';


export default function passBasicAuth(req, res, next) {
    const realm = getConfig('middleware.jwt.realm');

    const { authorization } = req.headers;

    if (!authorization) {
        return sendUnauthorized(req, res, realm);
    }
    const [prefix, payload] = authorization.split(' ');

    if (!payload || prefix.toLowerCase() !== 'basic') {
        return sendUnauthorized(req, res, realm);
    }

    const credentials = Buffer.from(payload, 'base64').toString('utf-8').split(':');

    if (!credentials || credentials.length !== 2) {
        return sendUnauthorized(req, res, realm);
    }

    req.headers.authorization = `Bearer ${credentials[1].trim()}`;

    return next();
}

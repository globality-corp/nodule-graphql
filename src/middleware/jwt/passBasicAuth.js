/**
 * Middleware that allows passing JWT via Basic Auth header.
 *
 * Enabling basic auth pass through greatly simplifies graphiql usage.
 */

import { getConfig, getContainer } from '@globality/nodule-config';

import sendUnauthorized from './errors';

export default function passBasicAuth(req, res, next) {
    const { logger } = getContainer();

    const realm = getConfig('middleware.jwt.realm');

    const { authorization } = req.headers;

    if (!authorization) {
        logger.info(req, 'Unauthorized: missing auth');
        return sendUnauthorized(req, res, realm);
    }
    const [prefix, payload] = authorization.split(' ');

    if (!payload || prefix.toLowerCase() !== 'basic') {
        logger.info(req, 'Unauthorized: wrong scheme');
        return sendUnauthorized(req, res, realm);
    }

    const credentials = Buffer.from(payload, 'base64').toString('utf-8').split(':');

    if (!credentials || credentials.length !== 2) {
        logger.info(req, 'Unauthorized: wrong format');
        return sendUnauthorized(req, res, realm);
    }

    req.headers.authorization = `Bearer ${credentials[1].trim()}`;

    return next();
}

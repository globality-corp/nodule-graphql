import { StatusCodes } from 'http-status-codes';

/**
 * Add WWW-Authenticate header.
 *
 * Allows graphiql to return trigger a browser prompt.
 */
function addHeader(req, res, realm) {
    const { authorization } = req.headers;

    // don't add header if not configured
    if (!realm) {
        return res;
    }

    // don't add header for non-base auth
    if (authorization) {
        const type = authorization.split(' ')[0];

        if (type.toLowerCase() !== 'basic') {
            return res;
        }
    }

    // add header
    return res.set('WWW-Authenticate', `Basic realm="${realm}"`);
}

export default function sendUnauthorized(req, res, realm) {
    return addHeader(req, res.status(StatusCodes.UNAUTHORIZED), realm)
        .json({
            message: 'Unauthorized',
        })
        .end();
}

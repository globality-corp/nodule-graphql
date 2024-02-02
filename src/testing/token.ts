/**
 * Token generation functions (intended for testing).
 */

// @ts-expect-error TS(7016): Could not find a declaration file for module 'json... Remove this comment to see the full error message
import jwt from 'jsonwebtoken';

export function signSymmetric(assertions: any, key = 'secret', audience = 'audience', expiresIn = 36000) {
    const secret = Buffer.from(key, 'base64');
    return jwt.sign(assertions, secret, {
        algorithm: 'HS256',
        audience,
        expiresIn,
    });
}

export function signPrivate(assertions: any, key: any, audience = 'audience', expiresIn = 36000, keyid = 'kid') {
    return jwt.sign(assertions, key, {
        algorithm: 'RS256',
        audience,
        expiresIn,
        keyid,
    });
}

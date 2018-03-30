/* Token generation functions (intended for testing).
 */
import jwt from 'jsonwebtoken';


export function signSymmetric(audience, key, assertions, expiresIn = 36000) {
    const secret = Buffer.from(key, 'base64');
    return jwt.sign(
        assertions,
        secret,
        {
            algorithm: 'HS256',
            audience,
            expiresIn,
        },
    );
}


export function signPrivate(audience, key, assertions, expiresIn = 36000, keyid = 'kid') {
    return jwt.sign(
        assertions,
        key,
        {
            algorithm: 'RS256',
            audience,
            expiresIn,
            keyid,
        },
    );
}

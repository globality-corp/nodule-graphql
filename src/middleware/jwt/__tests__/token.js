import jwt from 'jsonwebtoken';


export function signSymmetric(audience, key, assertions) {
    const secret = Buffer.from(key, 'base64');
    return jwt.sign(
        assertions,
        secret,
        {
            algorithm: 'HS256',
            audience,
            expiresIn: 36000,
        },
    );
}


export function signPrivate(audience, key, assertions) {
    return jwt.sign(
        assertions,
        key,
        {
            algorithm: 'RS256',
            audience,
            expiresIn: 36000,
            keyid: 'kid',
        },
    );
}

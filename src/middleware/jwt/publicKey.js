import { readFileSync } from 'fs';

import { memoize } from 'lodash';

/**
 * Convert JWKS data to PEM format.
 *
 * Adapted from jwks-rsa (MIT License).
 *
 * See: https://github.com/auth0/node-jwks-rsa/blob/master/src/utils.js
 */
function prepadSigned(hexStr) {
    const msb = hexStr[0];
    if (msb < '0' || msb > '7') {
        return `00${hexStr}`;
    }
    return hexStr;
}

function toHex(number) {
    const nstr = number.toString(16);
    if (nstr.length % 2) {
        return `0${nstr}`;
    }
    return nstr;
}

function encodeLengthHex(n) {
    if (n <= 127) {
        return toHex(n);
    }
    const nHex = toHex(n);
    const lengthOfLengthByte = 128 + nHex.length / 2;
    return toHex(lengthOfLengthByte) + nHex;
}

/*
 * Source: http://stackoverflow.com/questions/18835132/xml-to-pem-in-node-js
 */
const rsaPublicKeyToPEM = (modulusB64, exponentB64) => {
    const modulus = Buffer.from(modulusB64, 'base64');
    const exponent = Buffer.from(exponentB64, 'base64');
    const modulusHex = prepadSigned(modulus.toString('hex'));
    const exponentHex = prepadSigned(exponent.toString('hex'));
    const modlen = modulusHex.length / 2;
    const explen = exponentHex.length / 2;

    const encodedModlen = encodeLengthHex(modlen);
    const encodedExplen = encodeLengthHex(explen);
    const totalLength = encodeLengthHex(modlen + explen + encodedModlen.length / 2 + encodedExplen.length / 2 + 2);
    const encodedPubkey = `30${totalLength}02${encodedModlen}${modulusHex}02${encodedExplen}${exponentHex}`;

    const der = Buffer.from(encodedPubkey, 'hex').toString('base64');

    let pem = '-----BEGIN RSA PUBLIC KEY-----\n';
    pem += `${der.match(/.{1,64}/g).join('\n')}`;
    pem += '\n-----END RSA PUBLIC KEY-----\n';
    return pem;
};

/**
 * Load public key from file and transform to PEM format (which express-jwt expects).
 *
 * Note that jwks-rsa wants to download the JWKS file at runtime.
 * Instead, we commit the JWKS data locally.
 *
 * Public keys are available in JWKS format at:
 *
 *    https://{domain}/auth0.com/.well-known/jwks.json
 */
export default function loadPublicKey(domain, kid, publicKeyRootPath) {
    const path = `${publicKeyRootPath}/${domain}.jwks`;
    // NB: don't load the file more than once
    const jwks = JSON.parse(memoize(readFileSync)(path));
    const signingKeys = jwks.keys.filter((key) => key.kid === kid);
    const signingKey = signingKeys[0];
    if (!signingKey) {
        throw new Error(`No key matches: ${kid}`);
    }
    return rsaPublicKeyToPEM(signingKey.n, signingKey.e);
}

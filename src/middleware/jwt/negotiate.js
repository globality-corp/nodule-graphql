import { get } from 'lodash';

import { getConfig } from '@globality/nodule-config';

import loadPublicKey from './publicKey';


export const ALGORITHMS = {
    HS256: ({ secret }) => {
        if (!secret) {
            throw new Error('HS256 signing requires `middleware.jwt.secret` to be configured');
        }
        return Buffer.from(secret, 'base64');
    },
    RS256: ({ domain, publicKeyRootPath }, { kid }) => {
        if (!domain) {
            throw new Error('RS256 signing requires `middleware.jwt.domain` to be configured');
        }
        if (!publicKeyRootPath) {
            throw new Error('RS256 signing requires `middleware.jwt.publicKeyRootPath` to be configured');
        }
        if (!kid) {
            throw new Error('RS256 signing requires `kid` to be defined');
        }
        return loadPublicKey(domain, kid, publicKeyRootPath);
    },
};


/* Negotiate the appropriate key for a specific JWT request.
 *
 * Implements an `express-jwt` secret callback.
 */
export default function negotiateKey(req, header, payload, next) {
    if (!header) {
        return next(new Error('Could not parse JWT header; token may be invalid or expired'));
    }

    const { alg } = header;

    const config = getConfig('middleware.jwt') || {};
    const algorithms = get(config, 'algorithms', 'HS256,RS256').split(',').filter(
        algorithm => !!algorithm,
    ).map(
        algorithm => algorithm.trim(),
    );

    if (algorithms.indexOf(alg) === -1) {
        return next(new Error(`Unsupported algorithm: ${alg}`));
    }

    const keyFunction = ALGORITHMS[alg];

    if (!keyFunction) {
        return next(new Error(`Unimplemented algorithm: ${alg}`));
    }

    try {
        const key = keyFunction(config, header);
        return next(null, key);
    } catch (error) {
        return next(error);
    }
}

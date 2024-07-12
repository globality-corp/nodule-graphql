import { getConfig, getMetadata } from '@globality/nodule-config';
import { get } from 'lodash';

import loadPublicKey from './publicKey';

export const ALGORITHMS = {
    HS256: ({ secret }) => {
        if (!secret) {
            const metadata = getMetadata();
            if (!metadata || !metadata.testing) {
                throw new Error('HS256 signing requires `middleware.jwt.secret` to be configured');
            }

            // simplify test by having a test-only default value
            secret = 'secret'; // eslint-disable-line no-param-reassign
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

/**
 * Negotiate the appropriate key for a specific JWT request.
 *
 * Implements an `express-jwt` secret callback.
 */
export default async function negotiateKey(req, token) {
    const { header } = token;
    if (!header) {
        throw new Error('Could not parse JWT header; token may be invalid or expired');
    }

    const { alg } = header;

    const config = getConfig('middleware.jwt') || {};
    const algorithms = get(config, 'algorithms', 'HS256,RS256')
        .split(',')
        .filter((algorithm) => !!algorithm)
        .map((algorithm) => algorithm.trim());

    if (algorithms.indexOf(alg) === -1) {
        throw new Error(`Unsupported algorithm: ${alg}`);
    }

    const keyFunction = ALGORITHMS[alg];

    if (!keyFunction) {
        throw new Error(`Unimplemented algorithm: ${alg}`);
    }

    const key = keyFunction(config, header);
    return key;
}

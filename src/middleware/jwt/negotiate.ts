import { getConfig, getMetadata } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get } from 'lodash';

import loadPublicKey from './publicKey';

export const ALGORITHMS = {
    HS256: ({ secret }: any) => {
        if (!secret) {
            const metadata = getMetadata();
            // @ts-expect-error TS(2571): Object is of type 'unknown'.
            if (!metadata || !metadata.testing) {
                throw new Error('HS256 signing requires `middleware.jwt.secret` to be configured');
            }

            // simplify test by having a test-only default value
            secret = 'secret'; // eslint-disable-line no-param-reassign
        }
        return Buffer.from(secret, 'base64');
    },
    RS256: ({ domain, publicKeyRootPath }: any, { kid }: any) => {
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
export default function negotiateKey(req: any, header: any, payload: any, next: any) {
    if (!header) {
        return next(new Error('Could not parse JWT header; token may be invalid or expired'));
    }

    const { alg } = header;

    const config = getConfig('middleware.jwt') || {};
    const algorithms = get(config, 'algorithms', 'HS256,RS256')
        .split(',')
        .filter((algorithm: any) => !!algorithm)
        .map((algorithm: any) => algorithm.trim());

    if (algorithms.indexOf(alg) === -1) {
        return next(new Error(`Unsupported algorithm: ${alg}`));
    }

    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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

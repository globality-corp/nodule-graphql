import { getConfig, getMetadata, getContainer } from '@globality/nodule-config';
import { expressjwt as jwt } from 'express-jwt';
import { StatusCodes } from 'http-status-codes';
import { get } from 'lodash-es';

import sendUnauthorized from './errors.js';
import negotiateKey from './negotiate.js';

export function chooseAudience(audience) {
    if (!audience) {
        const metadata = getMetadata();
        if (!metadata || !metadata.testing) {
            throw new Error('JWT middleware requires `middleware.jwt.audience` to be configured');
        }

        // simplify test by having a test-only default value
        return 'audience';
    }

    if (!Array.isArray(audience)) {
        return audience.split(',');
    }

    // the audience option of jwt.verify is a list or a string. If you pass a
    // list, jwt will automatically try to find at least one client id that
    // matches the audience in the token being verified
    return audience;
}

export default function createValidateJWTMiddleware(options = { jwtSource: 'header' }) {
    const { jwtSource } = options;

    return function middleware(req, res, next) {
        const config = getConfig('middleware.jwt') || {};
        const { audience, realm } = config;
        const matchingAudience = chooseAudience(audience);

        const algorithms = get(config, 'algorithms', 'HS256,RS256')
            .split(',')
            .filter((algorithm) => !!algorithm)
            .map((algorithm) => algorithm.trim());

        const jwtOptions = {
            secret: negotiateKey,
            audience: matchingAudience,
            requestProperty: 'locals.jwt',
            algorithms,
        };

        switch (jwtSource) {
            case 'body':
                if (!req.body.idToken) {
                    return res.status(StatusCodes.UNAUTHORIZED).end();
                }
                jwtOptions.getToken = (request) => request.body.idToken;
                break;
            case 'cookie':
                if (!req.cookies.idToken) {
                    return res.status(StatusCodes.UNAUTHORIZED).end();
                }
                jwtOptions.getToken = (request) => request.cookies.idToken;
                break;
            case 'header':
                if (!req.headers.authorization) {
                    return sendUnauthorized(req, res, realm);
                }
                break;
            default:
                throw new Error('invalid JWT source');
        }

        const validator = jwt(jwtOptions);

        return validator(req, res, (error) => {
            if (error) {
                const { logger } = getContainer();
                logger.info(req, `jwt validation failed: ${error.message}`, error);

                switch (jwtSource) {
                    case 'cookie':
                        return res.status(StatusCodes.UNAUTHORIZED).end();
                    case 'body':
                        return res.status(StatusCodes.UNAUTHORIZED).end();
                    case 'header':
                        return sendUnauthorized(req, res, realm);
                    default:
                        throw new Error('invalid JWT source');
                }
            }
            return next();
        });
    };
}

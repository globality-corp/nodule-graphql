import { getConfig, getMetadata, getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'expr... Remove this comment to see the full error message
import jwt from 'express-jwt';
import { StatusCodes } from 'http-status-codes';
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get } from 'lodash';

import sendUnauthorized from './errors';
import negotiateKey from './negotiate';

export function chooseAudience(audience: any) {
    if (!audience) {
        const metadata = getMetadata();
        // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
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

    return function middleware(req: any, res: any, next: any) {
        const config = getConfig('middleware.jwt') || {};
        // @ts-expect-error TS(2339) FIXME: Property 'audience' does not exist on type 'unknow... Remove this comment to see the full error message
        const { audience, realm } = config;
        const matchingAudience = chooseAudience(audience);

        const algorithms = get(config, 'algorithms', 'HS256,RS256')
            .split(',')
            .filter((algorithm: any) => !!algorithm)
            .map((algorithm: any) => algorithm.trim());

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
                // @ts-expect-error TS(2339) FIXME: Property 'getToken' does not exist on type '{ secr... Remove this comment to see the full error message
                jwtOptions.getToken = (request: any) => request.body.idToken;
                break;
            case 'cookie':
                if (!req.cookies.idToken) {
                    return res.status(StatusCodes.UNAUTHORIZED).end();
                }
                // @ts-expect-error TS(2339) FIXME: Property 'getToken' does not exist on type '{ secr... Remove this comment to see the full error message
                jwtOptions.getToken = (request: any) => request.cookies.idToken;
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

        return validator(req, res, (error: any) => {
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

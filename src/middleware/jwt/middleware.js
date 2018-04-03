import jwt from 'express-jwt';

import { getConfig, getMetadata } from '@globality/nodule-config';

import sendUnauthorized from './errors';
import negotiateKey from './negotiate';


function chooseAudience(audience) {
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


export default function middleware(req, res, next) {
    const config = getConfig('middleware.jwt') || {};
    const { audience, realm } = config;

    if (!req.headers.authorization) {
        sendUnauthorized(req, res, realm);
        return next(false);
    }

    const matchingAudience = chooseAudience(audience);

    const validator = jwt({
        secret: negotiateKey,
        audience: matchingAudience,
        requestProperty: 'locals.jwt',
    });

    return validator(req, res, (error) => {
        if (error) {
            // XXX log a warning here
            sendUnauthorized(req, res, realm);
            return next(false);
        }
        return next();
    });
}

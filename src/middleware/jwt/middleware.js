import { UNAUTHORIZED } from 'http-status-codes';
import jwt from 'express-jwt';

import { getConfig, getMetadata } from '@globality/nodule-config';

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
    if (!req.headers.authorization) {
        res.status(UNAUTHORIZED).json({
            message: 'Unauthorized',
        }).end();
        return next(false);
    }

    const config = getConfig('middleware.jwt') || {};
    const { audience, audiences } = config;
    const matchingAudience = chooseAudience(audience, audiences);

    const validator = jwt({
        secret: negotiateKey,
        audience: matchingAudience,
        requestProperty: 'locals.jwt',
    });

    return validator(req, res, (error) => {
        if (error) {
            // XXX log a warning here
            res.status(UNAUTHORIZED).json({
                message: 'Unauthorized',
            }).end();
            return next(false);
        }
        return next();
    });
}

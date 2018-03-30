import { UNAUTHORIZED } from 'http-status-codes';
import jwt from 'express-jwt';

import { getConfig, getMetadata } from '@globality/nodule-config';

import negotiateKey from './negotiate';

function chooseAudience(audience, audiences) {
    if (!audience && !audiences) {
        const metadata = getMetadata();
        if (!metadata || !metadata.testing) {
            throw new Error('JWT middleware requires `middleware.jwt.audience` to be configured');
        }

        // simplify test by having a test-only default value
        return 'audience';
    }

//    if (typeof audiences === 'string') {
//        return audience || audiences.split(',');
//    }

    // the audience option of jwt.verify is a list or a string. If you pass a
    // list, jwt will automatically try to find at least one client id that
    // matches the audience in the token being verified
    return audience || audiences;
}


export default function middleware(req, res, next) {
    if (!req.headers.authorization) {

        return res.status(UNAUTHORIZED).json({
            message: 'Unauthorized',
        }).end();
    }

    const config = getConfig('middleware.jwt') || {};
    const { audience, audiences } = config;
    const matchingAudience = chooseAudience(audience, audiences);
    console.log("matching audience", matchingAudience);

    const validator = jwt({
        secret: negotiateKey,
        audience: matchingAudience,
        requestProperty: 'locals.jwt',
    });

    return validator(req, res, (error) => {
        console.log("validation done");
        if (error) {
            // XXX log a warning here
            return res.status(UNAUTHORIZED).json({
                message: 'Unauthorized',
            }).end();
        }
        console.log("next gets called!!!");
        return next();
    });
}

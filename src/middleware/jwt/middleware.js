import { UNAUTHORIZED } from 'http-status-codes';
import jwt from 'express-jwt';

import { getConfig, getMetadata } from '@globality/nodule-config';

import negotiateKey from './negotiate';


export default function middleware(req, res, next) {
    if (!req.headers.authorization) {

        return res.status(UNAUTHORIZED).json({
            message: 'Unauthorized',
        }).end();
    }

    const config = getConfig('middleware.jwt') || {};
    let { audience } = config;

    if (!audience) {
        const metadata = getMetadata();
        if (!metadata || !metadata.testing) {
            throw new Error('JWT middleware requires `middleware.jwt.audience` to be configured');
        }

        // simplify test by having a test-only default value
        audience = 'audience';
    }

    const validator = jwt({
        secret: negotiateKey,
        audience,
        requestProperty: 'locals.jwt',
    });

    return validator(req, res, (error) => {
        if (error) {
            // XXX log a warning here
            return res.status(UNAUTHORIZED).json({
                message: 'Unauthorized',
            }).end();
        }
        return next();
    });
}

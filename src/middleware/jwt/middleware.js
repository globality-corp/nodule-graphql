import { UNAUTHORIZED } from 'http-status-codes';
import jwt from 'express-jwt';

import { getConfig } from '@globality/nodule-config';

import negotiateKey from './negotiate';


export default function middleware(req, res, next) {
    if (!req.headers.authorization) {

        return res.status(UNAUTHORIZED).json({
            message: 'Unauthorized',
        }).end();
    }

    const config = getConfig('middleware.jwt') || {};
    const { audience } = config;

    if (!audience) {
        throw new Error('JWT middleware requires `middleware.jwt.audience` to be configured');
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

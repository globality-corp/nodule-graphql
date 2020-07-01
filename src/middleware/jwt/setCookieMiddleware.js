import jwt from 'express-jwt';
import { getConfig, getContainer } from '@globality/nodule-config';
import sendUnauthorized from './errors';
import negotiateKey from './negotiate';
import { chooseAudience } from './middleware';

export default function setCookieMiddleware (req, res, next) {
    const config = getConfig('middleware.jwt') || {};
    const { audience, realm } = config;
    const matchingAudience = chooseAudience(audience);

    const validator = jwt({
        secret: negotiateKey,
        audience: matchingAudience,
        requestProperty: 'locals.jwt',
        getToken: request => request.body.idToken,
    });

    return validator(req, res, (error) => {
        if (error) {
            const { logger } = getContainer();
            logger.info(req, `jwt validation failed: ${error.message}`, error);
            return sendUnauthorized(req, res, realm);
        }
        return next();
    });
}

import { bind, setDefaults } from '@globality/nodule-config';

import createValidateJWTMiddleware from './middleware.js';
import passBasicAuth from './passBasicAuth.js';

/* Configure JWT-based authorization as a middleware.
 */
setDefaults('middleware.jwt', {
    /**
     * Comma-separated list of enabled signature algorithms.
     */
    algorithms: 'HS256,RS256',

    /**
     * The intended audience(s) (recipient) of the JWT. Required
     */
    audience: null,

    /**
     * Destination address to store the validated JWT in the input request.
     */
    resultProperty: 'locals.jwt',

    /**
     * Root path for storing public keys (locally).
     */
    // publicKeyRootPath: null,

    /**
     * A basic auth realm to generate WWW-Authenticate headers for.
     */
    realm: null,
});

bind('middleware.passBasicAuth', () => passBasicAuth);
bind('middleware.jwt', () => createValidateJWTMiddleware({ jwtSource: 'header' }));
bind('middleware.jwtBody', () => createValidateJWTMiddleware({ jwtSource: 'body' }));
bind('middleware.jwtCookie', () => createValidateJWTMiddleware({ jwtSource: 'cookie' }));
bind('middleware.jwtHeader', () => createValidateJWTMiddleware({ jwtSource: 'header' }));

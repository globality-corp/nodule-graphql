import { bind, setDefaults } from '@globality/nodule-config';

import middleware from './middleware';


/* Configure JWT-based authorization as a middleware.
 */
setDefaults('middleware.jwt', {
    /* Comma-separated list of enabled signature algorithms.
     */
    algorithms: 'HS256,RS256',

    /* The intended audience (recipient) of the JWT. At least one of
     * audience or audiences is required.
     */
    audience: null,

    /* The intended audiences of the JWT. At least one of audience or audiences
       is required.
    */
    audiences: null,

    /* Destination address to store the validated JWT in the input request.
     */
    resultProperty: 'locals.jwt',

    /* Root path for storing public keys (locally).
     */
    publicKeyRootPath: 'assets',
});

bind('middleware.jwt', () => middleware);

import { readFileSync } from 'fs';

import { getConfig, getContainer, Nodule } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'supe... Remove this comment to see the full error message
import request from 'supertest';
import '@globality/nodule-express';

// @ts-expect-error TS(2307): Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { signSymmetric, signPrivate } from 'index';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Configuring the middleware', () => {
    const audience = 'audience';
    const domain = 'example';
    const publicKeyRootPath = __dirname;
    const secret = 'secret';

    let app: any;

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(async () => {
        await Nodule.testing()
            .fromObject({
                middleware: {
                    jwt: {
                        audience,
                        domain,
                        publicKeyRootPath,
                        secret,
                    },
                },
            })
            .load();

        const { express, notFound } = getContainer('routes');
        const { jwt } = getContainer('middleware');

        app = express;
        app.use(jwt);
        app.use('/*', notFound);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns 401 on failed authorization', async () => {
        const response = await request(app).get('/');

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.statusCode).toBe(401);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.headers['www-authenticate']).not.toBeDefined();
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns 401 and WWW-Authenticate on failed authorization', async () => {
        const jwt = getConfig('middleware.jwt');

        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        jwt.realm = 'test';
        const response = await request(app).get('/');
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        delete jwt.realm;

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.statusCode).toBe(401);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.headers['www-authenticate']).toEqual('Basic realm="test"');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('handles HS256 authorization', async () => {
        const email = 'first.last@example.com';
        const token = signSymmetric({ email }, secret, audience);

        const response = await request(app).get('/').set('Authorization', `Bearer ${token}`);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.statusCode).toBe(404);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('handles RS256 authorization', async () => {
        const email = 'first.last@example.com';
        const key = readFileSync(`${__dirname}/example.key`, 'ascii');
        const token = signPrivate({ email }, key, audience);

        const response = await request(app).get('/').set('Authorization', `Bearer ${token}`);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.statusCode).toBe(404);
    });
});

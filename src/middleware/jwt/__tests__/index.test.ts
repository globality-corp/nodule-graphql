import { readFileSync } from 'fs';

import { getConfig, getContainer, Nodule } from '@globality/nodule-config';
import request from 'supertest';
import '@globality/nodule-express';

import { signSymmetric, signPrivate } from 'index';

describe('Configuring the middleware', () => {
    const audience = 'audience';
    const domain = 'example';
    const publicKeyRootPath = __dirname;
    const secret = 'secret';

    let app;

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

    it('returns 401 on failed authorization', async () => {
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(401);
        expect(response.headers['www-authenticate']).not.toBeDefined();
    });

    it('returns 401 and WWW-Authenticate on failed authorization', async () => {
        const jwt = getConfig('middleware.jwt');

        jwt.realm = 'test';
        const response = await request(app).get('/');
        delete jwt.realm;

        expect(response.statusCode).toBe(401);
        expect(response.headers['www-authenticate']).toEqual('Basic realm="test"');
    });

    it('handles HS256 authorization', async () => {
        const email = 'first.last@example.com';
        const token = signSymmetric({ email }, secret, audience);

        const response = await request(app).get('/').set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
    });

    it('handles RS256 authorization', async () => {
        const email = 'first.last@example.com';
        const key = readFileSync(`${__dirname}/example.key`, 'ascii');
        const token = signPrivate({ email }, key, audience);

        const response = await request(app).get('/').set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
    });
});

import request from 'supertest';

import { clearBinding, getContainer, Nodule } from '@globality/nodule-config';

import 'index';


describe('Health API', () => {

    beforeEach(() => {
        clearBinding('config');
    });

    it('returns basic information', async () => {
        const nodule = Nodule.testing();
        await nodule.load();

        const { express, health } = getContainer('routes');
        express.get('/api/health', health);

        const response = await request(express).get(
            '/api/health',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            message: 'OK',
            name: 'test',
            ok: true,
        });
    });

    it('may return build information', async () => {
        const nodule = Nodule.testing();
        await nodule.fromObject({
            buildInfoConvention: {
                buildNum: '42',
                sha1: 'SHA1',
            },
        }).load();

        const { express, health } = getContainer('routes');
        express.get('/api/health', health);

        const response = await request(express).get(
            '/api/health',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            message: 'OK',
            name: 'test',
            ok: true,
            buildNum: {
                message: '42',
                ok: true,
            },
            sha1: {
                message: 'SHA1',
                ok: true,
            },
        });
    });
});

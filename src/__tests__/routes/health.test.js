import request from 'supertest';

import { clearBinding, getContainer, Nodule } from '@globality/nodule-config';

import 'index';


describe('Health API', () => {
    let nodule;

    beforeEach(() => {
        nodule = Nodule.testing();
    });

    it('returns basic information', async () => {
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
        clearBinding('config');

        process.env.TEST__BUILD_INFO_CONVENTION__BUILD_NUM = '42';
        process.env.TEST__BUILD_INFO_CONVENTION__SHA1 = 'SHA1';
        await nodule.fromEnvironment().load();

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

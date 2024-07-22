import { clearBinding, Nodule } from '@globality/nodule-config';

import negotiateKey from '../negotiate';

describe('negotiateKey', () => {
    beforeEach(() => {
        clearBinding('config');
        clearBinding('metadata');
    });

    it('requires a payload header', () => {
        const req = {};
        const token = {};

        expect.assertions(1);
        negotiateKey(req, token).catch((err) => {
            expect(err.message).toMatch('Could not parse JWT header; token may be invalid or expired');
        });
    });

    it('requires a supported signing algorithm', () => {
        const req = {};
        const header = {
            alg: 'FOO256',
        };
        const token = { header };

        expect.assertions(1);
        negotiateKey(req, token).catch((err) => {
            expect(err.message).toMatch('Unsupported algorithm: FOO256');
        });
    });

    it('requires an implemented algorithm', async () => {
        await Nodule.testing()
            .fromObject({
                middleware: {
                    jwt: {
                        algorithms: 'FOO256,BAR256',
                    },
                },
            })
            .load();

        const req = {};
        const header = {
            alg: 'BAR256',
        };
        const token = { header };

        expect.assertions(1);
        negotiateKey(req, token).catch((err) => {
            expect(err.message).toMatch('Unimplemented algorithm: BAR256');
        });
    });

    it('returns a symmetric private key', async () => {
        await Nodule.testing()
            .fromObject({
                middleware: {
                    jwt: {
                        secret: 'secret',
                    },
                },
            })
            .load();

        const req = {};
        const header = {
            alg: 'HS256',
        };
        const token = { header };

        const key = await negotiateKey(req, token);
        expect(key).toBeInstanceOf(Buffer);
    });

    it('handles symmetric private key configuration errors', async () => {
        await new Nodule({ name: 'test' }).load();

        const req = {};
        const header = {
            alg: 'HS256',
        };
        const token = { header };

        expect.assertions(1);
        negotiateKey(req, token).catch((err) => {
            expect(err.message).toMatch('HS256 signing requires `middleware.jwt.secret` to be configured');
        });
    });

    it('handles public key lookup errors', async () => {
        const req = {};
        const header = {
            alg: 'RS256',
        };
        const token = { header };

        expect.assertions(1);
        negotiateKey(req, token).catch((err) => {
            expect(err.message).toMatch('RS256 signing requires `middleware.jwt.domain` to be configured');
        });
    });
});

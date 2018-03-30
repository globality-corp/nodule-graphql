import { clearBinding, Nodule } from '@globality/nodule-config';

import negotiateKey from '../negotiate';


describe('negotiateKey', () => {

    beforeEach(() => {
        clearBinding('config');
    });

    it('requires a payload header', () => {
        const req = {};
        const payload = {};
        const next = jest.fn();

        negotiateKey(req, null, payload, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(
            new Error('Could not parse JWT header; token may be invalid or expired'),
        );
    });

    it('requires a supported signing algorithm', () => {
        const req = {};
        const header = {
            alg: 'FOO256',
        };
        const payload = {};
        const next = jest.fn();

        negotiateKey(req, header, payload, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(
            new Error('Unsupported algorithm: FOO256'),
        );
    });

    it('requires an implemented algorithm', async () => {
        await Nodule.testing().fromObject({
            middleware: {
                jwt: {
                    algorithms: 'FOO256,BAR256',
                },
            },
        }).load();

        const req = {};
        const header = {
            alg: 'BAR256',
        };
        const payload = {};
        const next = jest.fn();

        negotiateKey(req, header, payload, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(
            new Error('Unimplemented algorithm: BAR256'),
        );
    });

    it('returns a symmetric private key', async () => {
        await Nodule.testing().fromObject({
            middleware: {
                jwt: {
                    secret: 'secret',
                },
            },
        }).load();

        const req = {};
        const header = {
            alg: 'HS256',
        };
        const payload = {};
        const next = jest.fn();

        negotiateKey(req, header, payload, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBe(null);
        expect(next.mock.calls[0][1]).toBeInstanceOf(Buffer);
    });

    it('handles symmetric private key configuration errors', async () => {
        const req = {};
        const header = {
            alg: 'HS256',
        };
        const payload = {};
        const next = jest.fn();

        negotiateKey(req, header, payload, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(
            new Error('HS256 signing requires `middleware.jwt.secret` to be configured'),
        );
    });

    it('handles public key lookup errors', async () => {
        const req = {};
        const header = {
            alg: 'RS256',
        };
        const payload = {};
        const next = jest.fn();

        negotiateKey(req, header, payload, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(
            new Error('RS256 signing requires `middleware.jwt.domain` to be configured'),
        );
    });
});

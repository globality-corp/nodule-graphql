import { clearBinding, Nodule } from '@globality/nodule-config';

import negotiateKey from '../negotiate';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('negotiateKey', () => {
    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
        clearBinding('config');
        clearBinding('metadata');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('requires a payload header', () => {
        const req = {};
        const payload = {};
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        const next = jest.fn();

        negotiateKey(req, null, payload, next);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledWith(new Error('Could not parse JWT header; token may be invalid or expired'));
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('requires a supported signing algorithm', () => {
        const req = {};
        const header = {
            alg: 'FOO256',
        };
        const payload = {};
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        const next = jest.fn();

        negotiateKey(req, header, payload, next);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledWith(new Error('Unsupported algorithm: FOO256'));
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        const payload = {};
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        const next = jest.fn();

        negotiateKey(req, header, payload, next);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledWith(new Error('Unimplemented algorithm: BAR256'));
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        const payload = {};
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        const next = jest.fn();

        negotiateKey(req, header, payload, next);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next.mock.calls[0][0]).toBe(null);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next.mock.calls[0][1]).toBeInstanceOf(Buffer);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('handles symmetric private key configuration errors', async () => {
        await new Nodule({ name: 'test' }).load();

        const req = {};
        const header = {
            alg: 'HS256',
        };
        const payload = {};
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        const next = jest.fn();

        negotiateKey(req, header, payload, next);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledWith(new Error('HS256 signing requires `middleware.jwt.secret` to be configured'));
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('handles public key lookup errors', async () => {
        const req = {};
        const header = {
            alg: 'RS256',
        };
        const payload = {};
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        const next = jest.fn();

        negotiateKey(req, header, payload, next);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(next).toHaveBeenCalledWith(new Error('RS256 signing requires `middleware.jwt.domain` to be configured'));
    });
});

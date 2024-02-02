import { clearBinding, Nodule } from '@globality/nodule-config';
import '@globality/nodule-logging'; // factory import

import passBasicAuth from '../passBasicAuth';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('passBasicAuth middleware', () => {
    let res: any;

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
        clearBinding('config');

        res = {};
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        res.status = jest.fn((code: any) => {
            res.code = code;
            return res;
        });
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        res.json = jest.fn(() => res);
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        res.set = jest.fn(() => res);
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        res.end = jest.fn(() => null);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sends unauthorized for missing auth', async () => {
        const realm = 'realm';

        await Nodule.testing()
            .fromObject({
                middleware: {
                    jwt: {
                        realm,
                    },
                },
            })
            .load();

        const req = {
            headers: {},
        };

        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        passBasicAuth(req, res);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(res.set).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', `Basic realm="${realm}"`);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(res.status).toHaveBeenCalledWith(401);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(res.json).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(res.end).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(res.end).toHaveBeenCalledWith();
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('turns basic auth into bearer auth', (done: any) => {
        const req = {
            headers: {
                authorization: `Basic ${Buffer.from('Bearer:asdf').toString('base64')}`,
            },
        };

        passBasicAuth(req, res, () => {
            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(req.headers.authorization).toEqual('Bearer asdf');
            done();
        });
    });
});

import { clearBinding, Nodule } from '@globality/nodule-config';
import '@globality/nodule-logging'; // factory import

import passBasicAuth from '../passBasicAuth';

describe('passBasicAuth middleware', () => {
    let res;

    beforeEach(() => {
        clearBinding('config');

        res = {};
        res.status = jest.fn((code) => {
            res.code = code;
            return res;
        });
        res.json = jest.fn(() => res);
        res.set = jest.fn(() => res);
        res.end = jest.fn(() => null);
    });

    it('sends unauthorized for missing auth', async () => {
        const realm = 'realm';

        await Nodule.testing().fromObject({
            middleware: {
                jwt: {
                    realm,
                },
            },
        }).load();

        const req = {
            headers: {
            },
        };

        passBasicAuth(req, res);

        expect(res.set).toHaveBeenCalledTimes(1);
        expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', `Basic realm="${realm}"`);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        expect(res.end).toHaveBeenCalledTimes(1);
        expect(res.end).toHaveBeenCalledWith();
    });

    it('turns basic auth into bearer auth', async (done) => {
        const req = {
            headers: {
                authorization: `Basic ${Buffer.from('Bearer:asdf').toString('base64')}`,
            },
        };

        passBasicAuth(req, res, () => {
            expect(req.headers.authorization).toEqual('Bearer asdf');
            done();
        });
    });
});

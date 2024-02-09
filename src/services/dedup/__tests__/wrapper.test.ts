// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { set as mockSet } from 'lodash';

import mockCreateKey from '../../core/keys';
import dedup from '../wrapper';

const mockConfig = {
    createKey: mockCreateKey,
};
jest.mock('@globality/nodule-config', () => ({
    bind: (key: any, value: any) => {
        mockSet(mockConfig, key, value());
        return mockConfig;
    },
    getContainer: () => mockConfig,
    getConfig: () => 10,
}));

let req: any;
let companyRetrieve: any;

describe('dataLoader wrapper', () => {
    beforeEach(() => {
        companyRetrieve = jest.fn(
            async (
                _,
                { id }: any
            ) => ({
                id,
            })
        );
        req = {
            app: {
                config: {},
            },
        };
    });

    it('should use in-req cache', async () => {
        const wrapper = dedup(companyRetrieve, {});
        let company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });

        company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);

        company = await wrapper(req, { id: 2 });
        expect(company.id).toBe(2);
        expect(companyRetrieve).toHaveBeenCalledTimes(2);
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 2,
        });
    });

    it('should allow to access the loader object', async () => {
        const wrapper = dedup(companyRetrieve, { loaderName: 'companyLoader' });
        let company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });

        // DataLoader api
        req.loaders.companyLoader.clearAll();

        company = await wrapper(req, { id: 1 });
        expect(companyRetrieve).toHaveBeenCalledTimes(2);
        expect(company.id).toBe(1);
    });
});

// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { set as mockSet } from 'lodash';

import mockCreateKey from '../../core/keys';
import dedup from '../wrapper';

const mockConfig = {
    createKey: mockCreateKey,
};
// @ts-expect-error TS(2304): Cannot find name 'jest'.
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

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('dataLoader wrapper', () => {
    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        companyRetrieve = jest.fn(async (
            // @ts-expect-error TS(7006): Parameter '_' implicitly has an 'any' type.
            _,
            {
                id
            }: any
        ) => ({
            id
        }));
        req = {
            app: {
                config: {},
            },
        };
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should use in-req cache', async () => {
        const wrapper = dedup(companyRetrieve, {});
        let company = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(company.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });

        company = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(company.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(1);

        company = await wrapper(req, { id: 2 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(company.id).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 2,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should allow to access the loader object', async () => {
        const wrapper = dedup(companyRetrieve, { loaderName: 'companyLoader' });
        let company = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(company.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });

        // DataLoader api
        req.loaders.companyLoader.clearAll();

        company = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(company.id).toBe(1);
    });
});

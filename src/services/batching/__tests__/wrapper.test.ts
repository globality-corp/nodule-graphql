// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get as mockGet, set as mockSet } from 'lodash';

import batched from '../wrapper';

// @ts-expect-error TS(2304): Cannot find name 'jest'.
jest.mock('@globality/nodule-config', () => {
    // NB: require here is necessary as scoping in jest 24 requires you to
    // import mocked functions in the same context where the mock is defined
    // and imports can only be used at the top level.
    // eslint-disable-next-line global-require
    const { default: createKey } = require('../../core/keys');

    const mockConfig = {
        config: {
            performance: {
                batchLimit: 3,
            },
        },
        createKey,
    };

    return {
        bind: (key: any, value: any) => {
            mockSet(mockConfig, key, value());
            return mockConfig;
        },
        getContainer: () => ({
            config: {
                performance: {
                    batchLimit: 3,
                },
                logger: {
                    level: 'INFO',
                    loggly: {
                        enabled: false,
                    },
                },
                cors: {
                    reflectOrigin: true,
                },
            },
            createKey,
            metadata: {},
        }),
        getConfig: (lookup: any) => {
            const config = {
                concurrency: {
                    limit: 10,
                },
            };
            return mockGet(config, lookup);
        },
        setDefaults: () => {},
    };
});

let req: any;
let companyRetrieve: any;
let companySearch: any;
let requestWrapper: any;
let searchWrapper: any;

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('dataLoader requestWrapper', () => {
    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        companyRetrieve = jest.fn(
            async (
                // @ts-expect-error TS(7006): Parameter '_' implicitly has an 'any' type.
                _,
                { id }: any
            ) => ({
                id,
            })
        );
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        companySearch = jest.fn(
            async (
                // @ts-expect-error TS(7006): Parameter '_' implicitly has an 'any' type.
                _,
                { companyIds }: any
            ) => ({
                items: companyIds.map((id: any) => ({
                    id,
                })),

                count: companyIds.length,
                offset: 0,
                limit: 20,
            })
        );
        req = {
            app: {},
        };
        requestWrapper = batched(companyRetrieve, {
            accumulateBy: 'id',
            accumulateInto: 'companyIds',
            batchSearchRequest: companySearch,
        });
        searchWrapper = batched(companySearch, {
            accumulateBy: 'companyIds',
            accumulateInto: 'companyIds',
            splitResponseBy: 'id',
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not batch 1 call', async () => {
        const companies = await Promise.all([requestWrapper(req, { id: 1 })]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should batch 2 calls', async () => {
        const companies = await Promise.all([requestWrapper(req, { id: 1 }), requestWrapper(req, { id: 2 })]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].id).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2],
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not batch 2 same call', async () => {
        const companies = await Promise.all([requestWrapper(req, { id: 1 }), requestWrapper(req, { id: 1 })]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should batch 2 same calls + another different', async () => {
        const companies = await Promise.all([
            requestWrapper(req, { id: 1 }),
            requestWrapper(req, { id: 2 }),
            requestWrapper(req, { id: 1 }),
        ]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].id).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[2].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2],
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should batch 5 calls to two batches', async () => {
        const companies = await Promise.all([
            requestWrapper(req, { id: 1 }),
            requestWrapper(req, { id: 2 }),
            requestWrapper(req, { id: 3 }),
            requestWrapper(req, { id: 4 }),
            requestWrapper(req, { id: 5 }),
        ]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].id).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[2].id).toBe(3);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[3].id).toBe(4);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[4].id).toBe(5);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [1, 2, 3],
            limit: 20,
            offset: 0,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [4, 5],
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should batch 4 calls to batch + retrieve', async () => {
        const companies = await Promise.all([
            requestWrapper(req, { id: 1 }),
            requestWrapper(req, { id: 2 }),
            requestWrapper(req, { id: 3 }),
            requestWrapper(req, { id: 4 }),
        ]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].id).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[2].id).toBe(3);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[3].id).toBe(4);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 4,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2, 3],
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should handle assignArgs', async () => {
        requestWrapper = batched(companyRetrieve, {
            accumulateBy: 'id',
            accumulateInto: 'companyIds',
            batchSearchRequest: companySearch,
            assignArgs: [{ includeGhosts: true }],
        });
        const companies = await Promise.all([requestWrapper(req, { id: 1 }), requestWrapper(req, { id: 2 })]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].id).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2],
            includeGhosts: true,
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should raise for too many results', async () => {
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        companySearch = jest.fn(
            async (
                // @ts-expect-error TS(7006): Parameter '_' implicitly has an 'any' type.
                _,
                { companyIds }: any
            ) => ({
                items: [
                    ...companyIds.map((id: any) => ({
                        id,
                    })),
                    { id: 999 },
                ],

                count: companyIds.length + 1,
                offset: 0,
                limit: 20,
            })
        );
        requestWrapper = batched(companyRetrieve, {
            accumulateBy: 'id',
            accumulateInto: 'companyIds',
            batchSearchRequest: companySearch,
        });
        let caughtError;
        try {
            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(await Promise.all([requestWrapper(req, { id: 999 }), requestWrapper(req, { id: 1 })])).toThrow();
        } catch (thrownError) {
            caughtError = thrownError;
        }
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(caughtError.message).toBe('Batching failed: expected to get one item but got too many results');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [999, 1],
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should raise for no results', async () => {
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        companySearch = jest.fn(
            async (
                // @ts-expect-error TS(7006): Parameter '_' implicitly has an 'any' type.
                _,
                { companyIds }: any
            ) => ({
                items: companyIds
                    .filter((id: any) => id !== -999)
                    .map((id: any) => ({
                        id,
                    })),

                count: companyIds.length - 1,
                offset: 0,
                limit: 20,
            })
        );
        requestWrapper = batched(companyRetrieve, {
            accumulateBy: 'id',
            accumulateInto: 'companyIds',
            batchSearchRequest: companySearch,
        });
        let caughtError;
        try {
            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(await Promise.all([requestWrapper(req, { id: -999 }), requestWrapper(req, { id: 1 })])).toThrow();
        } catch (thrownError) {
            caughtError = thrownError;
        }
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(caughtError.message).toBe('Batching failed: expected to get one item but got none');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [-999, 1],
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should handle splitResponseBy', async () => {
        requestWrapper = batched(companyRetrieve, {
            accumulateBy: 'idx',
            accumulateInto: 'companyIds',
            batchSearchRequest: companySearch,
            splitResponseBy: 'id',
        });
        const companies = await Promise.all([requestWrapper(req, { idx: 1 }), requestWrapper(req, { idx: 2 })]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].id).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2],
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should batch 2 search calls', async () => {
        const companies = await Promise.all([searchWrapper(req, { companyIds: [1, 2] }), searchWrapper(req, { companyIds: [2, 3] })]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].count).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].count).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].items[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].items[1].id).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].items[0].id).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].items[1].id).toBe(3);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2, 3],
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should handle many search results', async () => {
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        companySearch = jest.fn(
            async (
                // @ts-expect-error TS(7006): Parameter '_' implicitly has an 'any' type.
                _,
                { companyIds }: any
            ) => ({
                items: [
                    ...companyIds.map((id: any) => ({
                        id,
                    })),
                    { id: 999 },
                ],

                count: companyIds.length + 1,
                offset: 0,
                limit: 20,
            })
        );
        searchWrapper = batched(companySearch, {
            accumulateBy: 'companyIds',
            accumulateInto: 'companyIds',
            splitResponseBy: 'id',
        });
        const companies = await Promise.all([searchWrapper(req, { companyIds: [999] }), searchWrapper(req, { companyIds: [1] })]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].count).toBe(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].items[0].id).toBe(999);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].items[1].id).toBe(999);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].count).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].items[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [999, 1],
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should batch handle missing search call', async () => {
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        companySearch = jest.fn(
            async (
                // @ts-expect-error TS(7006): Parameter '_' implicitly has an 'any' type.
                _,
                { companyIds }: any
            ) => ({
                items: companyIds
                    .filter((id: any) => id !== -999)
                    .map((id: any) => ({
                        id,
                    })),

                count: companyIds.length - 1,
                offset: 0,
                limit: 20,
            })
        );
        searchWrapper = batched(companySearch, {
            accumulateBy: 'companyIds',
            accumulateInto: 'companyIds',
            splitResponseBy: 'id',
        });
        const companies = await Promise.all([searchWrapper(req, { companyIds: [1] }), searchWrapper(req, { companyIds: [-999] })]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].items[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].count).toBe(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, -999],
            limit: 20,
            offset: 0,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not batch with offset parameter', async () => {
        await Promise.all([searchWrapper(req, { companyIds: [1], offset: 1 }), searchWrapper(req, { companyIds: [2], offset: 1 })]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [1],
            offset: 1,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [2],
            offset: 1,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not batch with limit > 1 parameter', async () => {
        await Promise.all([searchWrapper(req, { companyIds: [1], limit: 2 }), searchWrapper(req, { companyIds: [2], limit: 2 })]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [1],
            limit: 2,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [2],
            limit: 2,
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should batch with limit = 1 parameter', async () => {
        const companies = await Promise.all([
            searchWrapper(req, { companyIds: [999], limit: 1 }),
            searchWrapper(req, { companyIds: [1], limit: 1 }),
        ]);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[0].items[0].id).toBe(999);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companies[1].items[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [999, 1],
            limit: 20,
            offset: 0,
        });
    });
});

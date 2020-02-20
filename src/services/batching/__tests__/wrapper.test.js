import { get as mockGet, set as mockSet } from 'lodash';
import batched from '../wrapper';

jest.mock('@globality/nodule-config', () => {
    // NB: require here is necessary as scoping in jest 24 requires you to
    // import mocked functions in the same context where the mock is defined
    // and imports can only be used at the top level.
    // eslint-disable-next-line
    const { default: createKey } = require('../../core/keys');

    const mockConfig = {};

    return {
        bind: (key, value) => {
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
                    serviceRequestRules: [
                        { path: 'id', name: 'id', type: 'number' },
                    ],
                },
            },
            createKey,
            metadata: {},
        }),
        getConfig: (lookup) => {
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

let req;
let companyRetrieve;
let companySearch;
let requestWrapper;
let searchWrapper;


describe('dataLoader requestWrapper', () => {
    beforeEach(() => {
        companyRetrieve = jest.fn(async (_, { id }) => ({ id }));
        companySearch = jest.fn(async (_, { companyIds }) => ({
            items: companyIds.map(id => ({ id })),
            count: companyIds.length,
            offset: 0,
            limit: 20,
        }));
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

    it('should not batch 1 call', async () => {
        const companies = await Promise.all([
            requestWrapper(req, { id: 1 }),
        ]);
        expect(companies[0].id).toBe(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });
        expect(companySearch).toHaveBeenCalledTimes(0);
    });

    it('should batch 2 calls', async () => {
        const companies = await Promise.all([
            requestWrapper(req, { id: 1 }),
            requestWrapper(req, { id: 2 }),
        ]);
        expect(companies[0].id).toBe(1);
        expect(companies[1].id).toBe(2);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2],
            limit: 20,
            offset: 0,
        });
    });

    it('should not batch 2 same call', async () => {
        const companies = await Promise.all([
            requestWrapper(req, { id: 1 }),
            requestWrapper(req, { id: 1 }),
        ]);
        expect(companies[0].id).toBe(1);
        expect(companies[1].id).toBe(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });
        expect(companySearch).toHaveBeenCalledTimes(0);
    });

    it('should batch 2 same calls + another different', async () => {
        const companies = await Promise.all([
            requestWrapper(req, { id: 1 }),
            requestWrapper(req, { id: 2 }),
            requestWrapper(req, { id: 1 }),
        ]);
        expect(companies[0].id).toBe(1);
        expect(companies[1].id).toBe(2);
        expect(companies[2].id).toBe(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2],
            limit: 20,
            offset: 0,
        });
    });

    it('should batch 5 calls to two batches', async () => {
        const companies = await Promise.all([
            requestWrapper(req, { id: 1 }),
            requestWrapper(req, { id: 2 }),
            requestWrapper(req, { id: 3 }),
            requestWrapper(req, { id: 4 }),
            requestWrapper(req, { id: 5 }),
        ]);
        expect(companies[0].id).toBe(1);
        expect(companies[1].id).toBe(2);
        expect(companies[2].id).toBe(3);
        expect(companies[3].id).toBe(4);
        expect(companies[4].id).toBe(5);

        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        expect(companySearch).toHaveBeenCalledTimes(2);
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [1, 2, 3],
            limit: 20,
            offset: 0,
        });
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [4, 5],
            limit: 20,
            offset: 0,
        });
    });

    it('should batch 4 calls to batch + retrieve', async () => {
        const companies = await Promise.all([
            requestWrapper(req, { id: 1 }),
            requestWrapper(req, { id: 2 }),
            requestWrapper(req, { id: 3 }),
            requestWrapper(req, { id: 4 }),
        ]);
        expect(companies[0].id).toBe(1);
        expect(companies[1].id).toBe(2);
        expect(companies[2].id).toBe(3);
        expect(companies[3].id).toBe(4);

        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 4,
        });
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2, 3],
            limit: 20,
            offset: 0,
        });
    });

    it('should handle assignArgs', async () => {
        requestWrapper = batched(companyRetrieve, {
            accumulateBy: 'id',
            accumulateInto: 'companyIds',
            batchSearchRequest: companySearch,
            assignArgs: [{ includeGhosts: true }],
        });
        const companies = await Promise.all([
            requestWrapper(req, { id: 1 }),
            requestWrapper(req, { id: 2 }),
        ]);
        expect(companies[0].id).toBe(1);
        expect(companies[1].id).toBe(2);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2],
            includeGhosts: true,
            limit: 20,
            offset: 0,
        });
    });

    it('should raise for too many results', async () => {
        companySearch = jest.fn(async (_, { companyIds }) => ({
            items: [...companyIds.map(id => ({ id })), { id: 999 }],
            count: companyIds.length + 1,
            offset: 0,
            limit: 20,
        }));
        requestWrapper = batched(companyRetrieve, {
            accumulateBy: 'id',
            accumulateInto: 'companyIds',
            batchSearchRequest: companySearch,
        });
        let caughtError;
        try {
            expect(await Promise.all([
                requestWrapper(req, { id: 999 }),
                requestWrapper(req, { id: 1 }),
            ])).toThrow();
        } catch (thrownError) {
            caughtError = thrownError;
        }
        expect(caughtError.message).toBe(
            'Batching failed: expected to get one item for args: [{"id":999},{"id":1}] but got too many results: [{"id":999},{"id":1},{"id":999}]',
        );
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [999, 1],
            limit: 20,
            offset: 0,
        });
    });

    it('should raise for no results', async () => {
        companySearch = jest.fn(async (_, { companyIds }) => ({
            items: companyIds.filter(id => id !== -999).map(id => ({ id })),
            count: companyIds.length - 1,
            offset: 0,
            limit: 20,
        }));
        requestWrapper = batched(companyRetrieve, {
            accumulateBy: 'id',
            accumulateInto: 'companyIds',
            batchSearchRequest: companySearch,
        });
        let caughtError;
        try {
            expect(await Promise.all([
                requestWrapper(req, { id: -999 }),
                requestWrapper(req, { id: 1 }),
            ])).toThrow();
        } catch (thrownError) {
            caughtError = thrownError;
        }
        expect(caughtError.message).toBe(
            'Batching failed: expected to get one item for args: [{"id":-999},{"id":1}] but got none',
        );
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [-999, 1],
            limit: 20,
            offset: 0,
        });
    });

    it('should handle splitResponseBy', async () => {
        requestWrapper = batched(companyRetrieve, {
            accumulateBy: 'idx',
            accumulateInto: 'companyIds',
            batchSearchRequest: companySearch,
            splitResponseBy: 'id',
        });
        const companies = await Promise.all([
            requestWrapper(req, { idx: 1 }),
            requestWrapper(req, { idx: 2 }),
        ]);
        expect(companies[0].id).toBe(1);
        expect(companies[1].id).toBe(2);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2],
            limit: 20,
            offset: 0,
        });
    });

    it('should batch 2 search calls', async () => {
        const companies = await Promise.all([
            searchWrapper(req, { companyIds: [1, 2] }),
            searchWrapper(req, { companyIds: [2, 3] }),
        ]);
        expect(companies[0].count).toBe(2);
        expect(companies[1].count).toBe(2);
        expect(companies[0].items[0].id).toBe(1);
        expect(companies[0].items[1].id).toBe(2);
        expect(companies[1].items[0].id).toBe(2);
        expect(companies[1].items[1].id).toBe(3);
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, 2, 3],
            limit: 20,
            offset: 0,
        });
    });

    it('should handle many search results', async () => {
        companySearch = jest.fn(async (_, { companyIds }) => ({
            items: [...companyIds.map(id => ({ id })), { id: 999 }],
            count: companyIds.length + 1,
            offset: 0,
            limit: 20,
        }));
        searchWrapper = batched(companySearch, {
            accumulateBy: 'companyIds',
            accumulateInto: 'companyIds',
            splitResponseBy: 'id',
        });
        const companies = await Promise.all([
            searchWrapper(req, { companyIds: [999] }),
            searchWrapper(req, { companyIds: [1] }),
        ]);
        expect(companies[0].count).toBe(2);
        expect(companies[0].items[0].id).toBe(999);
        expect(companies[0].items[1].id).toBe(999);
        expect(companies[1].count).toBe(1);
        expect(companies[1].items[0].id).toBe(1);
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [999, 1],
            limit: 20,
            offset: 0,
        });
    });

    it('should batch handle missing search call', async () => {
        companySearch = jest.fn(async (_, { companyIds }) => ({
            items: companyIds.filter(id => id !== -999).map(id => ({ id })),
            count: companyIds.length - 1,
            offset: 0,
            limit: 20,
        }));
        searchWrapper = batched(companySearch, {
            accumulateBy: 'companyIds',
            accumulateInto: 'companyIds',
            splitResponseBy: 'id',
        });
        const companies = await Promise.all([
            searchWrapper(req, { companyIds: [1] }),
            searchWrapper(req, { companyIds: [-999] }),
        ]);
        expect(companies[0].items[0].id).toBe(1);
        expect(companies[1].count).toBe(0);
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenLastCalledWith(req, {
            companyIds: [1, -999],
            limit: 20,
            offset: 0,
        });
    });

    it('should not batch with offset parameter', async () => {
        await Promise.all([
            searchWrapper(req, { companyIds: [1], offset: 1 }),
            searchWrapper(req, { companyIds: [2], offset: 1 }),
        ]);
        expect(companySearch).toHaveBeenCalledTimes(2);
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [1],
            offset: 1,
        });
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [2],
            offset: 1,
        });
    });

    it('should not batch with limit > 1 parameter', async () => {
        await Promise.all([
            searchWrapper(req, { companyIds: [1], limit: 2 }),
            searchWrapper(req, { companyIds: [2], limit: 2 }),
        ]);
        expect(companySearch).toHaveBeenCalledTimes(2);
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [1],
            limit: 2,
        });
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [2],
            limit: 2,
        });
    });

    it('should batch with limit = 1 parameter', async () => {
        const companies = await Promise.all([
            searchWrapper(req, { companyIds: [999], limit: 1 }),
            searchWrapper(req, { companyIds: [1], limit: 1 }),
        ]);
        expect(companies[0].items[0].id).toBe(999);
        expect(companies[1].items[0].id).toBe(1);
        expect(companySearch).toHaveBeenCalledTimes(1);
        expect(companySearch).toHaveBeenCalledWith(req, {
            companyIds: [999, 1],
            limit: 20,
            offset: 0,
        });
    });
});

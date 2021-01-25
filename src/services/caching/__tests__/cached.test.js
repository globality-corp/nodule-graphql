import Enum from 'enum';
import cached from '../wrapper';
import createKey from '../../core/keys';
import {
    ANY_NOT_NULL,
    ANY_PARAMETER,
    ANY_SINGLE_ITEM_LIST,
    ANY_UUID,
    CachingSpec,
} from '../types';

let req;
let plumbusRetrieve;
let dinglebopSearch;
const mockCacheGet = jest.fn();
const mockCacheAdd = jest.fn();
const mockCreateKey = jest.fn(createKey);

const CachedObjectType = new Enum([
    'plumbus',
    'dinglebop',
]);

jest.mock('@globality/nodule-config', () => ({
    getMetadata: () => ({
        testing: false,
    }),
    bind: () => {},
    setDefaults: () => {},
    getConfig: () => null,
    getContainer: () => ({
        cache: {
            safeGet: async () => mockCacheGet(),
            safeSave: mockCacheAdd,
        },
        createKey: mockCreateKey,
        config: {
            cache: {
                enabled: true,
                ttl: 10,
            },
            logging: {
                cache: {
                    enabled: false,
                },
            },
        },
        logger: {
            warning: () => {},
            debug: () => {},
        },
    }),
}));

describe('cache wrapper', () => {
    beforeEach(() => {
        plumbusRetrieve = jest.fn(async (_, { id, idx }) => ({ id: id || idx }));
        dinglebopSearch = jest.fn(async (_, { ids }) => ([{ id: ids[0] }]));
        req = {
            cacheControl: {},
        };
    });
    afterEach(() => {
        mockCacheGet.mockReset();
        mockCacheAdd.mockReset();
    });

    it('should try to fetch from cache', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should save to cache if missing', async () => {
        mockCacheGet.mockReturnValueOnce([undefined]);
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            loaderName: 'plumbusLoader',
        });
        const wrapper = cached(plumbusRetrieve, spec);
        let plumbus = await wrapper(req, { id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(mockCacheAdd).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });

        // DataLoader api - in req is clear
        req.loaders.plumbusLoader.clearAll();
        req.loaders.cache.clearAll();

        plumbus = await wrapper(req, { id: 1 });
        expect(mockCacheGet).toHaveBeenCalledTimes(2);
        expect(mockCacheAdd).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
        expect(plumbus.id).toBe(1);
    });

    it('should fetch from cache if have requireArgs - ANY_PARAMETER', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_PARAMETER },
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should fetch from cache if have requireArgs in a different order', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_PARAMETER, id2: ANY_PARAMETER },
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id2: 1, id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should skip cache if dont have requireArgs - ANY_PARAMETER', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_PARAMETER },
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { idx: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
    });

    it('should skip cache if have some requireArgs - ANY_PARAMETER', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_PARAMETER, id2: ANY_PARAMETER },
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { idx: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
    });

    it('should skip cache if dont have requireArgs - ANY_NOT_NULL', async () => {
        plumbusRetrieve = jest.fn(async (_, { id }) => ({ id: id || -1 }));
        mockCacheGet.mockReturnValueOnce({ id: 1 });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_NOT_NULL },
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: null });
        // expect -1 because the mock can't handle null
        expect(plumbus.id).toBe(-1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
    });

    it('should fetch from cache if have requireArgs - ANY_NOT_NULL', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_NOT_NULL },
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should skip cache if dont have requireArgs - ANY_UUID', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_UUID },
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
    });

    it('should fetch from cache if have requireArgs - ANY_UUID', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_UUID },
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: '0cffbd9f-d9bd-4dbb-88fa-327ebaec1a4b' });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should skip cache if dont have requireArgs - ANY_SINGLE_ITEM_LIST', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_SINGLE_ITEM_LIST },
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
    });

    it('should fetch from cache if have requireArgs - ANY_SINGLE_ITEM_LIST', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_SINGLE_ITEM_LIST },
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: [1] });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should skip cache if no-cache is used for a supported resource', async () => {
        req.cacheControl.supportNoCache = true;

        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.dinglebop.key,
            supportNoCache: true,
        });
        const wrapper = cached(dinglebopSearch, spec);
        const dinglebops = await wrapper(req, { ids: [1, 2] });
        expect(dinglebops[0].id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(dinglebopSearch).toHaveBeenCalledTimes(1);
    });

    it('should skip cache if disable-cache is used', async () => {
        req.cacheControl.disableCache = true;

        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.dinglebop.key,
        });
        const wrapper = cached(dinglebopSearch, spec);
        const dinglebops = await wrapper(req, { ids: [1, 2] });
        expect(dinglebops[0].id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(dinglebopSearch).toHaveBeenCalledTimes(1);
    });

    it('should ignore cached resource if etag mismatch', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 'old-value' }]);
        const id1Etag = 'W/"e24fad81bdf139b6f9db9f6b7a20d929"';

        req.cacheControl.etags = { plumbus: [id1Etag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
        // Skip writing to the cache, it is proably locked
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

    it('should use cached resource if etag match', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);
        const id1Etag = 'W/"e24fad81bdf139b6f9db9f6b7a20d929"';

        req.cacheControl.etags = { plumbus: [id1Etag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

    it('should support different etags', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);
        const id1Etag = 'W/"e24fad81bdf139b6f9db9f6b7a20d929"';
        const otherEtag = 'W/"1ce923ef2c98a1f7555e737b32070baa"';

        req.cacheControl.etags = { plumbus: [otherEtag, id1Etag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

    it('should use cached resource if etag resource type mismacah', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);
        const otherEtag = 'W/"1ce923ef2c98a1f7555e737b32070baa"';

        req.cacheControl.etags = { user: [otherEtag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
        });
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        expect(plumbus.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

});

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
let companyRetrieve;
let chatroomEventSearch;
const mockCacheGet = jest.fn();
const mockCacheAdd = jest.fn();
const mockCreateKey = jest.fn(createKey);

const CachedObjectType = new Enum([
    'company',
    'chatroomEvent',
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
            getMulti: mockCacheGet,
            add: mockCacheAdd,
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
            info: () => {},
        },
    }),
}));

// const noduleConfig = require.requireMock('@globality/nodule-config');

const COMPANY_ID1_KEY = 'a91c65de-1e47-57ee-9267-307d7be2d8e7';
const CHATROOM_EVENT_ID1_KEY = 'a91c65de-1e47-57ee-9267-307d7be2d8e8';


describe('cache wrapper', () => {
    beforeEach(() => {
        companyRetrieve = jest.fn(async (_, { id, idx }) => ({ id: id || idx }));
        chatroomEventSearch = jest.fn(async (_, { ids }) => ([{ id: ids[0] }]));
        req = {
            cacheControl: {},
        };
    });
    afterEach(() => {
        mockCacheGet.mockReset();
        mockCacheAdd.mockReset();
    });

    it('should try to fetch from cache', async () => {
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_KEY]: { id: 1 } });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should save to cache if missing', async () => {
        mockCacheGet.mockReturnValueOnce({});
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_KEY]: { id: 1 } });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            loaderName: 'companyLoader',
        });
        const wrapper = cached(companyRetrieve, spec);
        let company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(mockCacheAdd).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });

        // DataLoader api - in req is clear
        req.loaders.companyLoader.clearAll();
        req.loaders.cache.clearAll();

        company = await wrapper(req, { id: 1 });
        expect(mockCacheGet).toHaveBeenCalledTimes(2);
        expect(mockCacheAdd).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        expect(company.id).toBe(1);
    });

    it('should fetch from cache if have requireArgs - ANY_PARAMETER', async () => {
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_KEY]: { id: 1 } });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            requireArgs: { id: ANY_PARAMETER },
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should fetch from cache if have requireArgs in a different order', async () => {
        const COMPANY_ID1_ID2_KEY = '1dcb7c51-2dbd-54cc-b95f-64957becee5b';
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_ID2_KEY]: { id: 1 } });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            requireArgs: { id: ANY_PARAMETER, id2: ANY_PARAMETER },
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id2: 1, id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should skip cache if dont have requireArgs - ANY_PARAMETER', async () => {
        mockCacheGet.mockReturnValueOnce({ id: 1 });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            requireArgs: { id: ANY_PARAMETER },
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { idx: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
    });

    it('should skip cache if have some requireArgs - ANY_PARAMETER', async () => {
        mockCacheGet.mockReturnValueOnce({ id: 1 });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            requireArgs: { id: ANY_PARAMETER, id2: ANY_PARAMETER },
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { idx: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
    });

    it('should skip cache if dont have requireArgs - ANY_NOT_NULL', async () => {
        companyRetrieve = jest.fn(async (_, { id }) => ({ id: id || -1 }));
        mockCacheGet.mockReturnValueOnce({ id: 1 });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            requireArgs: { id: ANY_NOT_NULL },
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: null });
        // expect -1 because the mock can't handle null
        expect(company.id).toBe(-1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
    });

    it('should fetch from cache if have requireArgs - ANY_NOT_NULL', async () => {
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_KEY]: { id: 1 } });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            requireArgs: { id: ANY_NOT_NULL },
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should skip cache if dont have requireArgs - ANY_UUID', async () => {
        mockCacheGet.mockReturnValueOnce({ id: 1 });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            requireArgs: { id: ANY_UUID },
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
    });

    it('should fetch from cache if have requireArgs - ANY_UUID', async () => {
        const COMPANY_UUID_KEY = '64a9dfde-465b-51c4-95e2-090b8b962816';
        mockCacheGet.mockReturnValueOnce({ [COMPANY_UUID_KEY]: { id: 1 } });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            requireArgs: { id: ANY_UUID },
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: '0cffbd9f-d9bd-4dbb-88fa-327ebaec1a4b' });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should skip cache if dont have requireArgs - ANY_SINGLE_ITEM_LIST', async () => {
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_KEY]: { id: 1 } });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            requireArgs: { id: ANY_SINGLE_ITEM_LIST },
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
    });

    it('should fetch from cache if have requireArgs - ANY_SINGLE_ITEM_LIST', async () => {
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_KEY]: { id: 1 } });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
            requireArgs: { id: ANY_SINGLE_ITEM_LIST },
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: [1] });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
    });

    it('should skip cache if no-cache is used for a supported resource', async () => {
        req.cacheControl.supportNoCache = true;

        mockCacheGet.mockReturnValueOnce({ [CHATROOM_EVENT_ID1_KEY]: { id: 1 } });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.chatroomEvent.key,
            supportNoCache: true,
        });
        const wrapper = cached(chatroomEventSearch, spec);
        const chatroomEvents = await wrapper(req, { ids: [1, 2] });
        expect(chatroomEvents[0].id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(chatroomEventSearch).toHaveBeenCalledTimes(1);
    });

    it('should skip cache if disable-cache is used', async () => {
        req.cacheControl.disableCache = true;

        mockCacheGet.mockReturnValueOnce({ [CHATROOM_EVENT_ID1_KEY]: { id: 1 } });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.chatroomEvent.key,
        });
        const wrapper = cached(chatroomEventSearch, spec);
        const chatroomEvents = await wrapper(req, { ids: [1, 2] });
        expect(chatroomEvents[0].id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        expect(chatroomEventSearch).toHaveBeenCalledTimes(1);
    });

    it('should ignore cached resource if etag mismatch', async () => {
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_KEY]: { id: 'old-value' } });
        const id1Etag = 'W/"e24fad81bdf139b6f9db9f6b7a20d929"';

        req.cacheControl.etags = { company: [id1Etag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        // Skip writing to the cache, it is proably locked
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

    it('should use cached resource if etag match', async () => {
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_KEY]: { id: 1 } });
        const id1Etag = 'W/"e24fad81bdf139b6f9db9f6b7a20d929"';

        req.cacheControl.etags = { company: [id1Etag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

    it('should support different etags', async () => {
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_KEY]: { id: 1 } });
        const id1Etag = 'W/"e24fad81bdf139b6f9db9f6b7a20d929"';
        const otherEtag = 'W/"1ce923ef2c98a1f7555e737b32070baa"';

        req.cacheControl.etags = { company: [otherEtag, id1Etag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

    it('should use cached resource if etag resource type mismacah', async () => {
        mockCacheGet.mockReturnValueOnce({ [COMPANY_ID1_KEY]: { id: 1 } });
        const otherEtag = 'W/"1ce923ef2c98a1f7555e737b32070baa"';

        req.cacheControl.etags = { user: [otherEtag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.company.key,
        });
        const wrapper = cached(companyRetrieve, spec);
        const company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(0);
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

});

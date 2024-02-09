// @ts-expect-error TS(7016): Could not find a declaration file for module 'enum... Remove this comment to see the full error message
import Enum from 'enum';

import createKey from '../../core/keys';
import { ANY_NOT_NULL, ANY_PARAMETER, ANY_SINGLE_ITEM_LIST, ANY_UUID, CachingSpec } from '../types';
import cached from '../wrapper';

let req: any;
let plumbusRetrieve: any;
let dinglebopSearch: any;
// @ts-expect-error TS(2304): Cannot find name 'jest'.
const mockCacheGet = jest.fn();
// @ts-expect-error TS(2304): Cannot find name 'jest'.
const mockCacheAdd = jest.fn();
// @ts-expect-error TS(2304): Cannot find name 'jest'.
const mockCreateKey = jest.fn(createKey);

const CachedObjectType = new Enum(['plumbus', 'dinglebop']);

// @ts-expect-error TS(2304): Cannot find name 'jest'.
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

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('cache wrapper', () => {
    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        plumbusRetrieve = jest.fn(
            async (
                // @ts-expect-error TS(7006): Parameter '_' implicitly has an 'any' type.
                _,
                { id, idx }: any
            ) => ({
                id: id || idx,
            })
        );
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        dinglebopSearch = jest.fn(async (_: any, { ids }: any) => [{ id: ids[0] }]);
        req = {
            cacheControl: {},
        };
    });
    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
        mockCacheGet.mockReset();
        mockCacheAdd.mockReset();
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should try to fetch from cache', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
        });
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        const spy = jest.spyOn(spec, 'setEndpointName');

        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(spy).toHaveBeenCalledWith(undefined);
        const plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should save to cache if missing', async () => {
        mockCacheGet.mockReturnValueOnce([undefined]);
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            loaderName: 'plumbusLoader',
        });
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        const spy = jest.spyOn(spec, 'setEndpointName');

        const wrapper = cached(plumbusRetrieve, spec, 'plumbus_endpoint');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(spy).toHaveBeenCalledWith('plumbus_endpoint');

        let plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheAdd).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });

        // DataLoader api - in req is clear
        req.loaders.plumbusLoader.clearAll();
        req.loaders.cache.clearAll();

        plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(2);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheAdd).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should fetch from cache if have requireArgs - ANY_PARAMETER', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_PARAMETER },
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should fetch from cache if have requireArgs in a different order', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_PARAMETER, id2: ANY_PARAMETER },
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id2: 1, id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should skip cache if dont have requireArgs - ANY_PARAMETER', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_PARAMETER },
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { idx: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should skip cache if have some requireArgs - ANY_PARAMETER', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_PARAMETER, id2: ANY_PARAMETER },
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { idx: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should skip cache if dont have requireArgs - ANY_NOT_NULL', async () => {
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        plumbusRetrieve = jest.fn(
            async (
                // @ts-expect-error TS(7006): Parameter '_' implicitly has an 'any' type.
                _,
                { id }: any
            ) => ({
                id: id || -1,
            })
        );
        mockCacheGet.mockReturnValueOnce({ id: 1 });

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_NOT_NULL },
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: null });
        // expect -1 because the mock can't handle null
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(-1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should fetch from cache if have requireArgs - ANY_NOT_NULL', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_NOT_NULL },
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should skip cache if dont have requireArgs - ANY_UUID', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_UUID },
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should fetch from cache if have requireArgs - ANY_UUID', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_UUID },
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: '0cffbd9f-d9bd-4dbb-88fa-327ebaec1a4b' });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should skip cache if dont have requireArgs - ANY_SINGLE_ITEM_LIST', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_SINGLE_ITEM_LIST },
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should fetch from cache if have requireArgs - ANY_SINGLE_ITEM_LIST', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
            requireArgs: { id: ANY_SINGLE_ITEM_LIST },
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: [1] });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should skip cache if no-cache is used for a supported resource', async () => {
        req.cacheControl.supportNoCache = true;

        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.dinglebop.key,
            supportNoCache: true,
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(dinglebopSearch, spec);
        const dinglebops = await wrapper(req, { ids: [1, 2] });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(dinglebops[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(dinglebopSearch).toHaveBeenCalledTimes(1);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should skip cache if disable-cache is used', async () => {
        req.cacheControl.disableCache = true;

        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);

        const spec = new CachingSpec({
            resourceName: CachedObjectType.dinglebop.key,
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(dinglebopSearch, spec);
        const dinglebops = await wrapper(req, { ids: [1, 2] });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(dinglebops[0].id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(dinglebopSearch).toHaveBeenCalledTimes(1);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should ignore cached resource if etag mismatch', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 'old-value' }]);
        const id1Etag = 'W/"e24fad81bdf139b6f9db9f6b7a20d929"';

        req.cacheControl.etags = { plumbus: [id1Etag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(1);
        // Skip writing to the cache, it is proably locked
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should use cached resource if etag match', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);
        const id1Etag = 'W/"e24fad81bdf139b6f9db9f6b7a20d929"';

        req.cacheControl.etags = { plumbus: [id1Etag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should support different etags', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);
        const id1Etag = 'W/"e24fad81bdf139b6f9db9f6b7a20d929"';
        const otherEtag = 'W/"1ce923ef2c98a1f7555e737b32070baa"';

        req.cacheControl.etags = { plumbus: [otherEtag, id1Etag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should use cached resource if etag resource type mismacah', async () => {
        mockCacheGet.mockReturnValueOnce([{ id: 1 }]);
        const otherEtag = 'W/"1ce923ef2c98a1f7555e737b32070baa"';

        req.cacheControl.etags = { user: [otherEtag] };

        const spec = new CachingSpec({
            resourceName: CachedObjectType.plumbus.key,
        });
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        const wrapper = cached(plumbusRetrieve, spec);
        const plumbus = await wrapper(req, { id: 1 });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbus.id).toBe(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheGet).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(plumbusRetrieve).toHaveBeenCalledTimes(0);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockCacheAdd).toHaveBeenCalledTimes(0);
    });
});

// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module '@glo... Remove this comment to see the full error message
import { Forbidden } from '@globality/nodule-express';

// @ts-expect-error TS(2307) FIXME: Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { createResolver } from 'index';

describe('a resolver', () => {
    it('returns an aggregated value', async () => {
        const resolver = createResolver({
            aggregate: async () => 42,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('transforms an aggregated value', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            transform: (result: any) => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('authorizes successfully', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async () => true,
            transform: (result: any) => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('authorizes unsuccessfully', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async () => {
                throw new Forbidden();
            },
            transform: (result: any) => 2 * result,
        });
        await expect(resolver.resolve()).rejects.toThrow('Forbidden');
    });

    it('authorizes successfully based on authorize data', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async (authorizeData: any) => {
                if (authorizeData) {
                    return true;
                }
                throw new Forbidden();
            },
            authorizeData: true,
            transform: (result: any) => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('authorizes unsuccessfully based on authorize data', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async (authorizeData: any) => {
                if (authorizeData) {
                    return true;
                }
                throw new Forbidden();
            },
            authorizeData: false,
            transform: (result: any) => 2 * result,
        });
        await expect(resolver.resolve()).rejects.toThrow('Forbidden');
    });

    it('authorizes based on an authorizer name', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: 'null',
            transform: (result: any) => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });
});

import { Nodule } from '@globality/nodule-config';

import {
    createResolver,
    createStrictResolver,
    getResolver,
    Forbidden,
} from 'index';


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
            transform: result => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('authorizes successfully', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async () => true,
            transform: result => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('authorizes unsuccessfully', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async () => {
                throw new Forbidden();
            },
            transform: result => 2 * result,
        });
        await expect(resolver.resolve()).rejects.toThrow('Forbidden');
    });

    it('authorizes successfully based on authorize data', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async (authorizeData) => {
                if (authorizeData) {
                    return true;
                }
                throw new Forbidden();
            },
            authorizeData: true,
            transform: result => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('authorizes unsuccessfully based on authorize data', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async (authorizeData) => {
                if (authorizeData) {
                    return true;
                }
                throw new Forbidden();
            },
            authorizeData: false,
            transform: result => 2 * result,
        });
        await expect(resolver.resolve()).rejects.toThrow('Forbidden');
    });
});


describe('null resolver', () => {
    beforeEach(async () => {
        await Nodule.testing().load();
    });

    it('is available by name', async () => {
        const resolver = getResolver('null');
        expect(resolver).toBeDefined();

        const result = await resolver();
        expect(result).toBeNull();
    });

    it('is available by function call', async () => {
        const resolver = getResolver(() => 'null');
        expect(resolver).toBeDefined();

        const result = await resolver();
        expect(result).toBeNull();
    });
});


describe('a strict resolver', () => {
    it('requires an aggregate function', async () => {
        expect(
            () => createStrictResolver({
                authorize: () => true,
                transform: value => value,
            }),
        ).toThrow(
            'Strict resolver must define an `aggregate` option',
        );
    });

    it('requires an authorize function', async () => {
        expect(
            () => createStrictResolver({
                aggregate: async () => null,
                transform: value => value,
            }),
        ).toThrow(
            'Strict resolver must define an `authorize` option',
        );
    });

    it('requires a transform function', async () => {
        expect(
            () => createStrictResolver({
                aggregate: async () => null,
                authorize: () => true,
            }),
        ).toThrow(
            'Strict resolver must define a `transform` option',
        );
    });
});

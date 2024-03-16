import { Forbidden } from '@globality/nodule-express';

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
            transform: (result) => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('authorizes successfully', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async () => true,
            transform: (result) => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('authorizes unsuccessfully', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async () => {
                throw new Forbidden();
            },
            transform: (result) => 2 * result,
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
            transform: (result) => 2 * result,
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
            transform: (result) => 2 * result,
        });
        await expect(resolver.resolve()).rejects.toThrow('Forbidden');
    });

    it('authorizes based on an authorizer name', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: 'null',
            transform: (result) => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('maxCallsPerRequest not used when context not passed', async () => {
        const resolver = createResolver({
            aggregate: async () => 42,
            mask: () => [],
            maxCallsPerRequest: 0,
        });
        expect(await resolver.resolve()).toEqual(42);
    });

    it('maxCallsPerRequest not used when not directly enabled', async () => {
        const context = {};
        const resolver = createResolver({
            aggregate: async () => 42,
            mask: () => [],
        });
        expect(await resolver.resolve(undefined, undefined, context)).toEqual(42);
        expect(context.callCounts).toBeUndefined();
    });

    it('maxCallsPerRequest sets call counts in the context using resolver id', async () => {
        const context = {};
        const resolverA = createResolver({
            aggregate: async () => 42,
            mask: () => [],
            maxCallsPerRequest: 1,
        });
        const resolverB = createResolver({
            aggregate: async () => 34,
            mask: () => [],
            maxCallsPerRequest: 1,
        });
        expect(await resolverA.resolve(undefined, undefined, context)).toEqual(42);
        expect(await resolverB.resolve(undefined, undefined, context)).toEqual(34);
        expect(context.callCounts[resolverA.resolverId]).toEqual(1);
        expect(context.callCounts[resolverB.resolverId]).toEqual(1);
        expect(resolverA.resolverId === resolverB.resolverId).toBeFalsy();
    });

    it('maxCallsPerRequest triggers error when exceeded', async () => {
        const context = {};
        const resolver = createResolver({
            aggregate: async () => 42,
            mask: () => [],
            maxCallsPerRequest: 1,
        });
        expect(await resolver.resolve(undefined, undefined, context)).toEqual(42);
        await expect(resolver.resolve(undefined, undefined, context)).rejects.toThrow(
            'Exceeded maximum number of resolver calls per request: 1, called 2 times.'
        );
        expect(context.callCounts[resolver.resolverId]).toEqual(2);
    });
});

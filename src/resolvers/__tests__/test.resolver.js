import {
    createResolver,
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

    it('authorizes based on an authorizer name', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: 'null',
            transform: result => 2 * result,
        });
        expect(await resolver.resolve()).toEqual(42);
    });
});

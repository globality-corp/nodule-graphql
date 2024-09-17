import { createStrictResolver } from 'index.js';

describe('a strict resolver', () => {
    it('requires an aggregate function', async () => {
        expect(() =>
            createStrictResolver({
                // @ts-ignore
                authorize: () => true,
                transform: (value) => value,
            })
        ).toThrow('Strict resolver must define an `aggregate` option');
    });

    it('requires an authorize function', async () => {
        expect(() =>
            createStrictResolver({
                aggregate: async () => null,
                transform: (value) => value,
            })
        ).toThrow('Strict resolver must define an `authorize` option');
    });
});

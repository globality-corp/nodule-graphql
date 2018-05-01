import {
    createStrictResolver,
} from 'index';


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

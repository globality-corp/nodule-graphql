import createKey from '../keys';

describe('cacheKey', () => {
    it('generates expected values', async () => {
        expect(
            createKey('foo'),
        ).toEqual(
            '9eb7791d-8309-59c6-8372-e5b9622dbbd8',
        );

        expect(
            createKey('foo', 'bar'),
        ).toEqual(
            'd4d7b595-10bb-57f0-ad65-8e7fc9cea49b',
        );

        expect(
            createKey(['foo'], 'bar'),
        ).toEqual(
            'f8dab53c-ec03-5b1c-8bac-4925883069a2',
        );

        expect(
            createKey({ foo: 'bar' }, 'bar'),
        ).toEqual(
            '4c71c7bb-5c2b-5fab-9c73-571f1d07fc1d',
        );

        expect(
            createKey({ foo: { bar: 'baz', qux: 'foo' } }),
        ).toEqual(
            '2f81ca75-3eeb-5544-b806-6662a02ebf76',
        );
    });
});

import createKey from '../keys';

describe('cacheKey', () => {
    it('generates expected values', async () => {
        expect(
            createKey('foo'),
        ).toEqual(
            '9bf8a9db-8d02-5252-ab10-bb36d2cdd8b4',
        );

        expect(
            createKey('foo', 'bar'),
        ).toEqual(
            '5a662f98-e6c6-57b5-bc34-a4130357ba35',
        );

        expect(
            createKey(['foo'], 'bar'),
        ).toEqual(
            '958f1ae7-eb22-52a4-9a39-0d36a451f2b6',
        );

        expect(
            createKey({ foo: 'bar' }, 'bar'),
        ).toEqual(
            '63ac6f0b-fec8-57de-8133-f9e822af60b5',
        );

        expect(
            createKey({ foo: { bar: 'baz', qux: 'foo' } }),
        ).toEqual(
            '675e80b2-74d5-52b1-8523-05a0fa13c1d1',
        );
    });
});

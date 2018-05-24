import createKey from '../keys';

describe('cacheKey', () => {
    it('generates expected values', async () => {

        expect(
            createKey('foo'),
        ).toEqual(
            '8eadcea4-e7dc-5418-a8de-975fe703bfd4',
        );

        expect(
            createKey('foo', 'bar'),
        ).toEqual(
            '7729fb23-462f-5cdf-a8a3-ec9989b7dfb3',
        );

        expect(
            createKey(['foo'], 'bar'),
        ).toEqual(
            '8bcdfb19-8de4-5706-b724-8e0ea6acc028',
        );

        expect(
            createKey({ foo: 'bar' }, 'bar'),
        ).toEqual(
            '19f12efd-29dd-5395-992f-c5398ba5fe5e',
        );

        expect(
            createKey({ foo: { bar: 'baz', qux: 'foo' } }),
        ).toEqual(
            'cddeab82-584a-5ab4-b6c7-2e49de94d9b0',
        );
    });
});

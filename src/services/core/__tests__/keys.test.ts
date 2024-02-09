import createKey from '../keys';

describe('cacheKey', () => {
    it('generates expected values', async () => {
        expect(createKey('foo')).toEqual('1b942da9-3261-5084-a4cf-d80e559d5725');

        expect(createKey('foo', 'bar')).toEqual('d74933fb-4f19-5a8d-9942-fd40364fb867');

        expect(createKey(['foo'], 'bar')).toEqual('5cc43b5a-1786-5981-b43a-93471a491f71');

        expect(createKey({ foo: 'bar' }, 'bar')).toEqual('2ee8d61c-b1d3-5b17-915b-4a8554a134ff');

        expect(createKey({ foo: { bar: 'baz', qux: 'foo' } })).toEqual('859609d5-0bf2-5960-a2b1-13b16111c21e');
    });
});

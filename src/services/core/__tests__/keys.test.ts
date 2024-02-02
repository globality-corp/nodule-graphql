import createKey from '../keys';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('cacheKey', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('generates expected values', async () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(createKey('foo')).toEqual('1b942da9-3261-5084-a4cf-d80e559d5725');

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(createKey('foo', 'bar')).toEqual('d74933fb-4f19-5a8d-9942-fd40364fb867');

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(createKey(['foo'], 'bar')).toEqual('5cc43b5a-1786-5981-b43a-93471a491f71');

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(createKey({ foo: 'bar' }, 'bar')).toEqual('2ee8d61c-b1d3-5b17-915b-4a8554a134ff');

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(createKey({ foo: { bar: 'baz', qux: 'foo' } })).toEqual('859609d5-0bf2-5960-a2b1-13b16111c21e');
    });
});

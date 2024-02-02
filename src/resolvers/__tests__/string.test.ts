// @ts-expect-error TS(2307): Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { createStrictResolver } from 'index';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('a strict resolver', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('requires an aggregate function', async () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(() =>
            createStrictResolver({
                authorize: () => true,
                transform: (value: any) => value,
            })
        ).toThrow('Strict resolver must define an `aggregate` option');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('requires an authorize function', async () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(() =>
            createStrictResolver({
                aggregate: async () => null,
                transform: (value: any) => value,
            })
        ).toThrow('Strict resolver must define an `authorize` option');
    });
});

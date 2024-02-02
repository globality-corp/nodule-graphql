// @ts-expect-error TS(2307): Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { withArgs } from 'index';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('withArgs', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('replaces arguments', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(withArgs(0)(1, 2, 3, 4)).toEqual([1, 0, 3, 4]);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('replaces arguments with a function', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(withArgs((obj: any) => 8 * obj)(1, 2, 3, 4)).toEqual([1, 8, 3, 4]);
    });
});

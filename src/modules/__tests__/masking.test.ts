// @ts-expect-error TS(2307) FIXME: Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { withArgs } from 'index';

describe('withArgs', () => {
    it('replaces arguments', () => {
        expect(withArgs(0)(1, 2, 3, 4)).toEqual([1, 0, 3, 4]);
    });

    it('replaces arguments with a function', () => {
        expect(withArgs((obj: any) => 8 * obj)(1, 2, 3, 4)).toEqual([1, 8, 3, 4]);
    });
});

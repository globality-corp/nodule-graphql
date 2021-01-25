import { withArgs } from 'index';

describe('withArgs', () => {

    it('replaces arguments', () => {
        expect(withArgs(0)(1, 2, 3, 4)).toEqual([1, 0, 3, 4]);
    });

    it('replaces arguments with a function', () => {
        expect(withArgs((obj) => 8 * obj)(1, 2, 3, 4)).toEqual([1, 8, 3, 4]);
    });
});

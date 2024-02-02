import { Nodule } from '@globality/nodule-config';

// @ts-expect-error TS(2307): Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { getResolver } from 'index';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('null resolver', () => {
    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(async () => {
        await Nodule.testing().load();
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('is available by name', async () => {
        const resolver = getResolver('null');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(resolver).toBeDefined();

        const result = await resolver();
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(result).toBeNull();
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('is available by function call', async () => {
        const resolver = getResolver(() => 'null');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(resolver).toBeDefined();

        const result = await resolver();
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(result).toBeNull();
    });
});

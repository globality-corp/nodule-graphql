import { Nodule } from '@globality/nodule-config';

// @ts-expect-error TS(2307) FIXME: Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { getResolver } from 'index';

describe('null resolver', () => {
    beforeEach(async () => {
        await Nodule.testing().load();
    });

    it('is available by name', async () => {
        const resolver = getResolver('null');
        expect(resolver).toBeDefined();

        const result = await resolver();
        expect(result).toBeNull();
    });

    it('is available by function call', async () => {
        const resolver = getResolver(() => 'null');
        expect(resolver).toBeDefined();

        const result = await resolver();
        expect(result).toBeNull();
    });
});

import { Nodule } from '@globality/nodule-config';

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

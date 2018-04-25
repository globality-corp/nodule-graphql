import { Nodule } from '@globality/nodule-config';

import { getResolver } from 'index';


describe('resolvers', () => {
    beforeEach(async () => {
        await Nodule.testing().load();
    });

    it('returns the null resolver', async () => {
        const resolver = getResolver('null');
        expect(resolver).toBeDefined();

        const result = await resolver();
        expect(result).toBeNull();
    });

    it('returns the null resolver from a function', async () => {
        const resolver = getResolver(() => 'null');
        expect(resolver).toBeDefined();

        const result = await resolver();
        expect(result).toBeNull();
    });
});

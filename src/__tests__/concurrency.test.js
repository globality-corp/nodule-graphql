import { concurrentPaginate } from 'index';
import { range } from 'lodash';

describe('Concurrency', () => {
    it('test promises are called concurrently', async () => {
        const promises = range(100).map(id => Promise.resolve(id));
        const res = await concurrentPaginate(promises);
        expect(res).toEqual(range(100));
    });
});

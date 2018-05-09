import concurrentPaginate from '../concurrency';

describe('concurrentPaginate', () => {

    it('invokes all promises', async () => {
        const numbers = [1, 2, 3, 4];
        const promises = numbers.map(
            number => Promise.resolve(number),
        );
        const results = await concurrentPaginate(promises);
        expect(results).toEqual(numbers);
    });
});

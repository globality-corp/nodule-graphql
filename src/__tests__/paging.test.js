import { range } from 'lodash';
import { all, any, one, none, first } from 'index';

const items = range(100).map(id => ({ id }));
const req = {};
let searchRequest;
let searchRequestNone;
let searchRequestOne;
let searchRequestTwo;

describe('Pagination', () => {

    beforeEach(() => {
        searchRequest = jest.fn(async (_, { limit = 20, offset = 0 }) => ({
            count: items.length,
            items: items.slice(offset, offset + limit),
            limit,
            offset,
        }));
        searchRequestNone = jest.fn(async () => ({
            count: 0,
            items: [],
        }));
        searchRequestOne = jest.fn(async () => ({
            count: 1,
            items: [{ id: 1 }],
        }));
        searchRequestTwo = jest.fn(async () => ({
            count: 2,
            items: [{ id: 1 }, { id: 2 }],
        }));
    });

    it('test search all items', async () => {
        const res = await all(req, { searchRequest, args: { limit: 40 } });
        expect(res).toEqual(items);

        expect(searchRequest).toHaveBeenCalledTimes(3);
        expect(searchRequest).toHaveBeenCalledWith(req, {
            offset: 0,
            limit: 40,
        });
        expect(searchRequest).toHaveBeenCalledWith(req, {
            offset: 40,
            limit: 40,
        });
        expect(searchRequest).toHaveBeenCalledWith(req, {
            offset: 80,
            limit: 40,
        });
    });

    it('test search items passes params', async () => {
        const res = await all(req, { searchRequest, args: { limit: 200, param: 'eter' } });
        expect(res).toEqual(items);

        expect(searchRequest).toHaveBeenCalledTimes(1);
        expect(searchRequest).toHaveBeenCalledWith(req, {
            offset: 0,
            limit: 200,
            param: 'eter',
        });
    });

    it('test none', async () => {
        const res = await none(req, { searchRequest: searchRequestNone, args: { param: 'eter' } });
        expect(res).toEqual(null);

        expect(searchRequestNone).toHaveBeenCalledTimes(1);
        expect(searchRequestNone).toHaveBeenCalledWith(req, {
            param: 'eter',
        });
    });

    it('test none: too many results', async () => {
        let caughtError;
        try {
            expect(await none(req, { searchRequest: searchRequestTwo, args: { param: 'eter' } })).toThrow();
        } catch (thrownError) {
            caughtError = thrownError;
        }

        expect(caughtError.message).toBe('Too many results found for search: 2');

        expect(searchRequestTwo).toHaveBeenCalledTimes(1);
        expect(searchRequestTwo).toHaveBeenCalledWith(req, {
            param: 'eter',
        });
    });

    it('test one', async () => {
        const res = await one(req, { searchRequest: searchRequestOne, args: { param: 'eter' } });
        expect(res).toEqual({ id: 1 });

        expect(searchRequestOne).toHaveBeenCalledTimes(1);
        expect(searchRequestOne).toHaveBeenCalledWith(req, {
            param: 'eter',
        });
    });

    it('test one: no results', async () => {
        let caughtError;
        try {
            expect(await one(req, { searchRequest: searchRequestNone, args: { param: 'eter' } })).toThrow();
        } catch (thrownError) {
            caughtError = thrownError;
        }

        expect(caughtError.message).toBe('No results found for search');

        expect(searchRequestNone).toHaveBeenCalledTimes(1);
        expect(searchRequestNone).toHaveBeenCalledWith(req, {
            param: 'eter',
        });
    });

    it('test one: too many results', async () => {
        let caughtError;
        try {
            expect(await one(req, { searchRequest: searchRequestTwo, args: { param: 'eter' } })).toThrow();
        } catch (thrownError) {
            caughtError = thrownError;
        }

        expect(caughtError.message).toBe('Too many results found for search: 2');

        expect(searchRequestTwo).toHaveBeenCalledTimes(1);
        expect(searchRequestTwo).toHaveBeenCalledWith(req, {
            param: 'eter',
        });
    });

    it('test any: no results', async () => {
        const res = await any(req, { searchRequest: searchRequestNone, args: { param: 'eter' } });
        expect(res).toBe(false);
    });

    it('test any: some results', async () => {
        const res = await any(req, { searchRequest: searchRequestTwo, args: { param: 'eter' } });
        expect(res).toBe(true);
    });

    it('test first: some results', async () => {
        const res = await first(req, { searchRequest: searchRequestTwo, args: { param: 'eter' } });
        expect(res).toEqual({ id: 1 });
    });

    it('test first: some results', async () => {
        let caughtError;
        try {
            expect(await first(req, { searchRequest: searchRequestNone, args: { param: 'eter' } })).toThrow();
        } catch (thrownError) {
            caughtError = thrownError;
        }
        global.console.log(caughtError);

        expect(caughtError.message).toBe('No results found for search');

        expect(searchRequestNone).toHaveBeenCalledTimes(1);
        expect(searchRequestNone).toHaveBeenCalledWith(req, {
            param: 'eter',
        });
    });

});

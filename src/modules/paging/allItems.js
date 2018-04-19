import { flatten, range } from 'lodash';
import { MaxLimitReached } from '../../errors';
import concurrentPaginate from './concurrency';

export default async function allItems(
    req,
    { searchRequest, args = {}, maxLimit = null, concurrencyLimit = 1 },
) {
    const { limit, offset, ...searchArgs } = args;

    const params = {
        ...searchArgs,
        limit: limit || 20,
        offset: offset || 0,
    };
    const firstPage = await searchRequest(req, params);
    if (firstPage.offset + firstPage.limit >= firstPage.count) {
        return firstPage.items;
    }
    if (maxLimit && firstPage.count > maxLimit) {
        throw new MaxLimitReached('Count of items exceeds maximum limit');
    }

    const offsets = range(firstPage.offset + firstPage.limit, firstPage.count, firstPage.limit);
    const nextPages = await concurrentPaginate(
        offsets.map(pageOffset => searchRequest(req, { ...params, offset: pageOffset })),
        concurrencyLimit,
    );
    return flatten([firstPage, ...nextPages].map(page => page.items));
}

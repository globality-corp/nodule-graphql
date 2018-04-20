import { TooManyResults, NoResults } from '../../errors';

export default async function one(req, { searchRequest, args = {}, returnNullOnEmpty = false }) {
    const page = await searchRequest(req, args);
    if (page.items.length > 1) {
        throw new TooManyResults(`Too many results found for search: ${page.items.length}`);
    }
    if (page.items.length === 0) {
        if (returnNullOnEmpty) {
            return null;
        }
        throw new NoResults('No results found for search');
    }
    return page.items[0];
}

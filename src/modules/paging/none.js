import { TooManyResults } from '../../errors';

export default async function none(req, { searchRequest, args = {} }) {
    const page = await searchRequest(req, args);
    if (page.items.length > 0) {
        throw new TooManyResults(`Too many results found for search: ${page.items.length}`);
    }
    return null;
}

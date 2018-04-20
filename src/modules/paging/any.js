export default async function any(req, { searchRequest, args = {} }) {
    const page = await searchRequest(req, args);
    return page.items.length > 0;
}

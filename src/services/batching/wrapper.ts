import { dedupMany } from '../dedup/wrapper';

import batchRequests from './batchRequests';

/**
 * In-request caching and batching wrapper
 * accumulateBy: the request arg that can be batch (example: userId)
 * accumulateInto: the request arg that accumulateBy arg can be merged into (example: userIds)
 * splitResponseBy: how to split the response for the batched request (default: accumulateBy)
 * batchSearchRequest: another serviceRequest that is used for batching
 *                     used when batching retrieve requests
 *                     for example (serviceRequest: userRetrieve, batchSearchRequest: userSearch)
 * assignArgs: additional args that will be included in the search request
 *             (example: [{ addFoo: true }])
 * loaderName: allows to access the DataLoader loader object with req.loaders.{loaderName}
 */
export default function batched(
    serviceRequest: any,
    {
        accumulateBy,
        accumulateInto,
        splitResponseBy = null,
        assignArgs = [],
        batchSearchRequest = null,
        isSearchRequest = null,
        loaderName = null
    }: any
) {
    const fakeSearchResponse = isSearchRequest === null ? batchSearchRequest === null : isSearchRequest;
    const wrapper = (req: any, argsList: any) =>
        argsList.length === 1
            ? Promise.all([serviceRequest(req, argsList[0])])
            : batchRequests(req, {
                  argsList,
                  serviceRequest,
                  batchSearchRequest,
                  accumulateBy,
                  accumulateInto,
                  splitResponseBy,
                  assignArgs,
                  fakeSearchResponse,
              });
    return dedupMany(wrapper, { loaderName, allowBatch: true });
}

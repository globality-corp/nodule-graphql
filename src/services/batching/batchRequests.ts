/*
 *  Optimization for calling similar microcosm requests at the same time
 *  This utility will reduce the amount of queries that styx creates by batching similar queries
 */
import { getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module '@glo... Remove this comment to see the full error message
import { NotFound, InternalServerError } from '@globality/nodule-express';
// @ts-expect-error TS(7016): Could not find a declaration file for module '@glo... Remove this comment to see the full error message
import { concurrentPaginate, all } from '@globality/nodule-openapi';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { assign, chunk, chain, flatten, get, groupBy, omit, uniq } from 'lodash';

/* Checks that a service request can be batched:
 * 1. Contains an accumulateBy value (such as userId)
 * 2. Does not contain offset parameter
 * 3. Does not contain limit>1 parameter
 */
function canArgsBeBatched(args: any, accumulateBy: any) {
    return args[accumulateBy] !== undefined && args.offset === undefined && (args.limit === undefined || args.limit === 1);
}

/* Split argsList to two argsLists:
 * List of args that can be batched (based on canArgsBeBatched)
 * List of args that cannot be batched
 */
function filterArgsToBatch(argsList: any, accumulateBy: any) {
    const batchableArgsList: any = [];
    const unBatchableArgsList: any = [];
    argsList.forEach((args: any) => {
        if (canArgsBeBatched(args, accumulateBy)) {
            batchableArgsList.push(args);
        } else {
            unBatchableArgsList.push(args);
        }
    });
    return { batchableArgsList, unBatchableArgsList };
}

/* Separate argsList to chunks of argsList that can be batched.
 * Every group must:
 *     1. Contain no more than groupSize requests to batch
 *     2. Contain the same request args (except the batchArg arg)
 * Assumption: dont get the exact same args in the argsList
 * Example:
 * Input:
 *     argsList: [
 *         { userId: 1, event: FooEvent },
 *         { userId: 2, event: FooEvent },
 *         { userId: 2, event: BarEvent },
 *         { userId: 3, event: BarEvent },
 *     ]
 *     accumulateBy:   userId
 * Output:
 * [
 *     [
 *         { userId: 1, event: FooEvent },
 *         { userId: 2, event: FooEvent },
 *     ],
 *     [
 *         { userId: 2, event: BarEvent },
 *         { userId: 3, event: BarEvent },
 *     ],
 * ]
 */
function getArgsChunksList(req: any, argsList: any, accumulateBy: any) {
    const { createKey, config } = getContainer();
    const argsGroups = groupBy(argsList, (args: any) => createKey(omit(args, accumulateBy)));
    const batchLimit = get(config, 'performance.batchLimit', 30);
    return flatten(Object.keys(argsGroups).map((key) => chunk(argsGroups[key], batchLimit)));
}

/*  Returns a (key(args): response) object (with one key) based on serviceRequest call and args
 *  Example:
 *  Input:
 *      args: { userId: 1, event: FooEvent }
 *  Output:
 *      Promise() => {
 *          "{ userId: 1, event: FooEvent }": { count: 1, items: [...] }
 *          }
 */
async function resolveSimpleRequest(req: any, serviceRequest: any, args: any) {
    const { createKey } = getContainer();
    const key = createKey(args);
    const res = await serviceRequest(req, args).catch((error: any) => ({
        error
    }));
    return { [key]: res };
}

/*  Batch argsLists
 *  The input args must have the same request args (except the batchArg arg)
 *  Example:
 *  Input:
 *      argsList: [
 *          { userId: 1, event: FooEvent },
 *          { userId: 1, event: BarEvent },
 *          { userId: 2, event: FooEvent },
 *          { userId: [3], event: FooEvent },
 *          { userId: [1, 4], event: FooEvent },
 *      ]
 *      accumulateBy:   userId
 *      accumulateInto: userIds
 *      assignArgs: [{ sourceType: unknown }]
 *  Output:
 *      [
 *          { userIds: [1. 2, 3, 4], event: FooEvent, sourceType: unknown },
 *          { userIds: [1], event: BarEvent, sourceType: unknown },
 *      ]
 */
function batchRequestsArgs(argsList: any, {
    accumulateBy,
    accumulateInto,
    assignArgs = [{}]
}: any) {
    const batchedArgs = {
        [accumulateInto]: uniq(flatten(argsList.map((args: any) => args[accumulateBy]))),
        ...omit(argsList[0], [accumulateBy, 'limit']),
    };
    return assign(batchedArgs, ...assignArgs);
}

function fakeResponse(items: any, fakeSearchResponse: any) {
    if (fakeSearchResponse) {
        if (!items) {
            return {
                count: 0,
                items: [],
                offset: 0,
                limit: 0,
            };
        }
        return {
            count: items.length,
            items,
            offset: 0,
            limit: items.length,
        };
    }
    if (items.length === 0) {
        return {
            error: new NotFound('Batching failed: expected to get one item but got none'),
        };
    }
    if (items.length > 1) {
        return {
            error: new InternalServerError('Batching failed: expected to get one item but got too many results'),
        };
    }
    return items[0];
}

/**
 * Returns a (key(args): response) object (with more then key) based on batched searchRequest call
 * Example:
 * Input:
 *     argsList: [
 *         { userId: 1, event: FooEvent },
 *         { userId: 2, event: FooEvent },
 *     ]
 *     accumulateBy:   userId
 *     accumulateInto: userIds
 *     splitResponseBy: groupId
 * Output:
 *     Promise() => {
 *         "{ userId: 1, event: FooEvent }": { count: 1, items: [...] }
 *         "{ userId: 2, event: FooEvent }": { count: 3, items: [...] }
 *         }
 */
async function resolveBatchRequest(
    req: any,
    {
        requestsArgs,
        searchRequest,
        accumulateBy,
        accumulateInto,
        splitResponseBy,
        assignArgs,
        fakeSearchResponse
    }: any
) {
    /* Batch many requests to a single search request
     */
    const batchedArgs = batchRequestsArgs(requestsArgs, {
        accumulateBy,
        accumulateInto,
        assignArgs,
    });

    /* Resolve it
     * If error is raised, create many { error, id } items
     */
    const allResults = await all(req, { searchRequest, args: batchedArgs }).catch((error: any) => batchedArgs[accumulateInto].map((id: any) => ({
        error,
        [splitResponseBy]: id
    }))
    );
    // Split the response by 'splitResponseBy'
    const groupedResults = groupBy(allResults, splitResponseBy);
    const { createKey } = getContainer();
    // Match the response items to the requests
    const resultsBuckets = requestsArgs.reduce(
        // @ts-expect-error TS(7006): Parameter 'acc' implicitly has an 'any' type.
        (acc, requestArgs) => ({
            [createKey(requestArgs)]: chain([requestArgs[accumulateBy]])
                .flatten()
                .map((accumulateArg: any) => groupedResults[accumulateArg])
                .concat()
                .flatten()
                .compact()
                .value(),

            ...acc
        }),
        {}
    );
    // Fake a microcosm response for every matched result.
    return Object.keys(resultsBuckets).reduce(
        (acc, key) => ({
            [key]: fakeResponse(resultsBuckets[key], fakeSearchResponse),
            ...acc,
        }),
        {}
    );
}

/**
 * Resolve number of search requests at the same time can batch some search requests into one.
 *     argsList: list of search requests args (see caching.js)
 *     searchRequest: async function that can resolve search requests (see caching.js)
 *     accumulateBy: the request arg that can be batch (for example: userId)
 *     accumulateInto: the request arg that accumulateBy can be merged into (eg: userIds)
 *     splitResponseBy: split the response for the batched request (should be same accumulateBy)
 * Return value: list of service responses ordered the same way as the args in argsList
 * Responses that should raise a service error (such as 404) - replaced by and object with
 * error key and value that should be thrown.
 */
export default async function batchRequests(
    req: any,
    {
        argsList,
        serviceRequest,
        accumulateBy,
        accumulateInto,
        splitResponseBy = null,
        assignArgs = [],
        batchSearchRequest = null,
        fakeSearchResponse = false
    }: any
) {
    const { batchableArgsList, unBatchableArgsList } = filterArgsToBatch(argsList, accumulateBy);
    const argsChunksList = getArgsChunksList(req, batchableArgsList, accumulateBy);

    // Dont batch:
    // * Requests that cannot be batched
    // * Requests that can be batched but with length 1
    const argsListNotToBatch = [
        ...unBatchableArgsList,
        ...argsChunksList.filter((argsChunks: any) => argsChunks.length === 1).map((argsChunks: any) => argsChunks[0]),
    ];

    // Batch
    const argsListToBatch = argsChunksList.filter((argsChunks: any) => argsChunks.length > 1);

    /* Create a search request promises based on argsList.
     * Every promise will return an object with (str(args): response) items
     * Use two different promises:
     *  * simple search requests
     *  * batch search requests
     * (objects can have more then one key if the requsts are batched)
     */
    const requestPromises = [
        ...argsListNotToBatch.map((args) => resolveSimpleRequest(req, serviceRequest, args)),
        ...argsListToBatch.map((argsChunks: any) => resolveBatchRequest(req, {
            requestsArgs: argsChunks,
            searchRequest: batchSearchRequest || serviceRequest,
            accumulateBy,
            accumulateInto,
            splitResponseBy: splitResponseBy || accumulateBy,
            assignArgs,
            fakeSearchResponse,
        })
        ),
    ];

    const resonseObjects = await concurrentPaginate(requestPromises);
    const { createKey } = getContainer();
    // Merge all responses to one (str(args) => response) object and arrange the response
    // @ts-expect-error TS(2556): A spread argument must either have a tuple type or... Remove this comment to see the full error message
    const responsesObject = Object.assign(...resonseObjects);
    return argsList.map((args: any) => responsesObject[createKey(args)]);
}

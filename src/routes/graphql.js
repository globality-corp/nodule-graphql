import { get, merge, pickBy } from 'lodash';
import { ApolloServer } from 'apollo-server-express';

import { bind, getContainer } from '@globality/nodule-config';


/* Inject custom extensions in the graphql response.
 *
 * Includes extension data from `req.locals.extensions.foo` if requested.
 */
function injectExtensions(response, req) {
    // ensure that req.locals.extensions exists
    merge(req, { locals: { extensions: {} } });

    const requested = get(req, 'body.extensions', {});
    // merge in all local extensions that were requested
    const extensions = pickBy(
        req.locals.extensions,
        (value, key) => key in requested,
    );
    return Object.keys(extensions).length ? merge(response, { extensions }) : response;
}

/**
 * Format the given error before it is serialized and sent to the client
 */
function formatError(error) {
    const extensions = error.extensions || {};
    const originalError = error.originalError || {};
    const code = extensions.code || originalError.code;
    const headers = originalError.headers || {};
    const traceId = (
        extensions.traceId ||
        originalError.traceId ||
        headers['x-trace-id']
    );
    const requestId = (
        extensions.requestId ||
        originalError.requestId ||
        headers['x-request-id']
    );

    // Include the HTTP status code, trace ID and request ID if they exist. These can come from
    // the underlying HTTP library such as axios. Including this information in the error for the
    // benefit of the client that made the request.
    //
    // The `extensions` field conforms with the GraphQL format error specification, section 7.1.2
    // @see https://graphql.github.io/graphql-spec/June2018/#sec-Errors

    // N.B. Need to create a new error in order to avoid any potential read-only issue trying to
    // modify the given error
    const newError = new Error();

    // According to section 7.1.2 of the GraphQL specification, fields `message`, and `path` are
    // required. The `locations` field may be included.
    newError.message = error.message;
    newError.path = error.path;

    if (error.locations) {
        newError.locations = error.locations;
    }

    const newExts = {};
    newError.extensions = newExts;

    if (code) {
        newExts.code = code;
    }

    if (traceId) {
        newExts.traceId = traceId;
    }

    if (requestId) {
        newExts.requestId = requestId;
    }

    return newError;
}


function makeGraphqlOptions(config, graphql) {
    const { schema } = graphql;
    const { apolloEngine } = config;

    return {
        context: ({ req }) => req,
        formatError,
        formatResponse: injectExtensions,
        playground: false,
        rootValue: null,
        schema,
        engine: apolloEngine || false,
    };
}


function createGraphQLRoute (config = {}) {
    const { graphql, terminal } = getContainer();
    const options = makeGraphqlOptions(config, graphql);
    const server = new ApolloServer(options);

    terminal.enabled('graphql');

    return server.getMiddleware();
}


bind('routes.graphql', () => createGraphQLRoute());

/**
 * GraphQL route factory
 *
 * Use this when you want to have direct control over the creation
 * of the graphql route.
 *
 * Factory takes an optional config object with the following interface:
 *
 *   interface GraphQLRouteOptions {
 *       apolloEngine: {
 *           ...
 *       }
 *   }
 *
 * where `apolloEngine` is the configuration passed to the underlying
 * apollo server.
 *
 * see https://www.apollographql.com/docs/apollo-server/api/apollo-server/#enginereportingoptions
 */
bind('factories.routes.graphql', () => createGraphQLRoute);

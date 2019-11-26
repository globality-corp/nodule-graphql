import { get, merge, pickBy } from 'lodash';
import { ApolloServer } from 'apollo-server-express';

import { bind, getContainer, setDefaults } from '@globality/nodule-config';


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

const REDACTED_VALUE = '[REDACTED]';

function redactGQLVariables (vars) {
    return Object.keys(vars).reduce((acc, key) => {
        if (key === 'input') {
            acc[key] = redactGQLVariables(vars[key]);
        } else if (/(Id|Type)$/.test(key) || /^id$/.test(key)) {
            acc[key] = vars[key];
        } else {
            acc[key] = REDACTED_VALUE;
        }
        return acc;
    }, {});
}

function makeGraphqlOptions(config, graphql) {
    const { schema } = graphql;
    const apolloEngineConfig = config.routes.graphql.apolloEngine;
    const engine = {
        apiKey: apolloEngineConfig.apiKey,
        schemaTag: apolloEngineConfig.schemaTag,
        sendVariableValues: {
            transform: ({ variables }) => redactGQLVariables(variables),
        },
        sendHeaders: {
            onlyNames: [
                'user-agent',
                'X-Request-Id',
                'X-Request-User',
            ],
        },
    };

    return {
        context: ({ req }) => req,
        formatError,
        formatResponse: injectExtensions,
        playground: false,
        rootValue: null,
        schema,
        engine: apolloEngineConfig.enabled ? engine : false,
    };
}


setDefaults('routes.graphql.apolloEngine', {
    /* Disable tracing by default.
     *
     * Send GQL traces to Apollo Graph Manager. If enabled, API key must also
     * be provided.
     */
    enabled: false,

    /* API Key used to send metrics to Apollo Graph Manager.
     *
     * Refer to https://www.apollographql.com/docs/apollo-server/api/apollo-server/#enginereportingoptions
     * for details
     */
    apiKey: null,

    /** Tag for GQL schema used by Apollo Graph Manager.
     *
     * Refer to https://www.apollographql.com/docs/apollo-server/api/apollo-server/#enginereportingoptions
     * for details
     */
    schemaTag: null,
});


bind('routes.graphql', () => {
    const { config, graphql, terminal } = getContainer();

    const options = makeGraphqlOptions(config, graphql);
    const server = new ApolloServer(options);

    terminal.enabled('graphql');

    return server.getMiddleware();
});

import { get, merge, pickBy } from 'lodash';
import { graphqlExpress } from 'apollo-server-express';

import { bind, getContainer, setDefaults } from '@globality/nodule-config';


/* Inject custom extensions in the graphql response.
 *
 * Includes extension data from `req.locals.extensions.foo` if requested.
 */
function injectExtensions(req) {
    // ensure that req.locals.extensions exists
    merge(req, { locals: { extensions: {} } });

    return (result) => {
        const requested = get(req, 'body.extensions', {});
        // merge in all local extensions that were requested
        const extensions = pickBy(
            req.locals.extensions,
            (value, key) => key in requested,
        );
        return Object.keys(extensions).length ? merge(result, { extensions }) : result;
    };
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
        headers['x-trace-id'] ||
        headers['x-request-id']
    );

    // Include the HTTP status code and trace ID if they exist. These can come from the underlying
    // HTTP library such as axios. Including this information in the error for the benefit of the
    // client that made the request.
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

    return newError;
}

function makeGraphqlOptions(config, graphql) {
    const { schema } = graphql;

    // XXX need to add:
    //  - formatError
    //  - formatResponse/injectExtensions

    return function configure(req) {
        return {
            cacheControl: config.routes.graphql.cacheControl,
            context: req,
            // merge in response extensions
            formatResponse: injectExtensions(req),
            rootValue: null,
            schema,
            tracing: config.routes.graphql.cacheControl || req.headers['x-request-trace'],
            formatError,
        };
    };
}


setDefaults('routes.graphql', {
    /* Disable cache control.
     *
     * Apollo caching is resource-based, not service-based. Caching should occur as close
     * as possible to the source of truth (e.g. at service calls).
     */
    cacheControl: false,
    /* Disable tracing by default.
     *
     * Tracing is verbose and increases volume. Tracing should be enabled if apollo engine
     * is enabled (which shared tracing over the local network).
     */
    tracing: false,
});


bind('routes.graphql', () => {
    const { config, graphql, terminal } = getContainer();

    const options = makeGraphqlOptions(config, graphql);
    terminal.enabled('graphql');
    return graphqlExpress(options);
});

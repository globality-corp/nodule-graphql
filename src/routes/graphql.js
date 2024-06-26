import { ApolloServer } from '@apollo/server';
import { unwrapResolverError } from '@apollo/server/errors';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginUsageReportingDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginUsageReporting } from '@apollo/server/plugin/usageReporting';

import { bind, getContainer, setDefaults } from '@globality/nodule-config';
import { get, includes, merge, pickBy } from 'lodash';

/**
 * Inject custom extensions in the graphql response.
 *
 * Includes extension data from `req.locals.extensions.foo` if requested.
 */
function injectExtensions(response, req) {
    // ensure that req.locals.extensions exists
    merge(req, { locals: { extensions: {} } });

    const requested = get(req, 'body.extensions', {});
    // merge in all local extensions that were requested
    const extensions = pickBy(req.locals.extensions, (value, key) => key in requested);
    return Object.keys(extensions).length ? merge(response, { extensions }) : response;
}

/**
 * Check error message whitelist to determine which errors are safe to return
 */
function checkErrorMessageWhitelist(error) {
    return includes(
        [
            // Persisted queries require these specific error messages to function correctly
            // https://github.com/apollographql/apollo-link-persisted-queries/blob/master/src/index.ts
            'PersistedQueryNotFound',
            'PersistedQueryNotSupported',
        ],
        error.message
    );
}

/**
 * Determine whether or not to mask the returned error message
 *
 * Hides error messages based on a catch-all config.
 */
function determineErrorMessage(error) {
    const { config } = getContainer();
    const graphqlConfig = config.routes.graphql;
    const { hideErrors } = graphqlConfig;

    if (!hideErrors || checkErrorMessageWhitelist(error)) {
        return error.message;
    }

    return 'Gateway Error';
}

/**
 * Format the given error before it is serialized and sent to the client
 */
function formatError(formattedError, error) {
    const extensions = formattedError.extensions || {};
    const originalError = unwrapResolverError(error);
    const code = extensions.code || originalError.code;
    const headers = originalError.headers || {};
    const traceId = extensions.traceId || originalError.traceId || headers['x-trace-id'];
    const requestId = extensions.requestId || originalError.requestId || headers['x-request-id'];

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
    newError.message = determineErrorMessage(formattedError);
    newError.path = formattedError.path;

    if (formattedError.locations) {
        newError.locations = formattedError.locations;
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

/**
 * Creates apollo server initialization options.
 *
 * Allows to configure apollo engine options and plugins.
 */
function createApolloServerOptions() {
    const { config, graphql } = getContainer();
    const { schema } = graphql;
    const graphqlConfig = config.routes.graphql;

    if (graphqlConfig.tracing) {
        global.console.warn('DEPRECATED: config.routes.graphql.tracing. No longer used.');
    }

    if (graphqlConfig.cacheControl) {
        global.console.warn('DEPRECATED: config.routes.graphql.cacheControl. No longer used');
    }

    const { apolloEngine, apolloPlugins } = config.routes.graphql;
    const plugins = apolloPlugins ? Object.keys(apolloPlugins).map((key) => apolloPlugins[key]) : [];

    const { enabled: engineEnabled, schemaTag, graphVariant, apiKey, graphId, ...engineConfig } = apolloEngine;
    const enginePlugin = engineEnabled
        ? ApolloServerPluginUsageReporting({
              ...engineConfig,
          })
        : ApolloServerPluginUsageReportingDisabled();

    return {
        context: ({ req }) => req,
        formatError,
        formatResponse: injectExtensions,
        rootValue: null,
        // disable introspection for production styx environments
        introspection: process.env.STYX__ENVIRONMENT !== 'prod' && process.env.STYX__ENVIRONMENT !== 'prod_eu',
        schema,
        apollo: {
            key: apiKey,
            graphId,
            graphVariant: graphVariant || schemaTag || undefined,
        },
        plugins: [...plugins, enginePlugin],
    };
}

setDefaults('routes.graphql', {
    /**
     * Disable cache control.
     *
     * Apollo caching is resource-based, not service-based. Caching should occur as close
     * as possible to the source of truth (e.g. at service calls).
     *
     * @deprecated
     */
    cacheControl: false,

    /**
     * Disable tracing by default.
     *
     * Tracing is verbose and increases volume. Tracing should be enabled if apollo engine
     * is enabled (which shared tracing over the local network).
     *
     * @deprecated
     */
    tracing: false,

    /**
     * Suppress sending back full error messages back with responses
     */
    hideErrors: false,
});

/**
 * Apollo engine configs are applied to the Apollo Server instance used by the
 * graphql route.
 *
 * For details on various Apollo engine configuration options, please refer to
 * https://www.apollographql.com/docs/apollo-server/api/apollo-server/#enginereportingoptions
 */
setDefaults('routes.graphql.apolloEngine', {
    /**
     * Disable tracing by default.
     *
     * Send GQL traces to Apollo Graph Manager. If enabled, API key must also
     * be provided.
     */
    enabled: false,

    /**
     * API Key used to send metrics to Apollo Graph Manager.
     */
    apiKey: null,

    /**
     * Variant for GQL schema used by Apollo Graph Manager.
     */
    graphVariant: null,

    /**
     * DEPRECATED: Use graphVariant instead
     * Tag for GQL schema used by Apollo Graph Manager.
     */
    schemaTag: null,

    /**
     * Adjust what GQL operation variables are sent to Apollo Graph Manager when tracing.
     */
    sendVariableValues: null,

    /**
     * Adjust what HTTP headers are sent to Apollo Graph Manger when tracing.
     */
    sendHeaders: null,
});

bind('routes.graphql', async () => {
    const { terminal } = getContainer();
    const options = createApolloServerOptions();
    const server = new ApolloServer(options);
    await server.start();
    terminal.enabled('graphql');
    return expressMiddleware(server, {
        context: async ({ req }) => req,
    });
});

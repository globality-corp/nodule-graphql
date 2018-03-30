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

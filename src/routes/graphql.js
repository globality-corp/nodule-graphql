import { graphqlExpress } from 'apollo-server-express';

import { bind, getContainer, setDefaults } from '@globality/nodule-config';


function makeGraphqlOptions(config, graphql) {
    const { schema } = graphql;

    // XXX need to add:
    //  - formatError
    //  - formatResponse/injectExtensions

    return function configure(req) {
        return {
            cacheControl: config.routes.graphql.cacheControl,
            context: req,
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

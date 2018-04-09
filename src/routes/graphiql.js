import { graphiqlExpress } from 'apollo-server-express';

import { bind, getContainer, setDefaults } from '@globality/nodule-config';


function makeGraphiqlOptions(config) {
    return req => ({
        /* Connect GraphiQL to GraphQL.
         */
        endpointURL: config.routes.graphiql.endpointURL,
        /* Pass authorization from GraphiQL to GraphQL.
         *
         * This convention enables authenticated requests to GraphiQL to identify
         * correctly to GraphQL.
         */
        passHeader: `'Authorization': '${req.headers.authorization}'`,
    });
}


setDefaults('routes.graphiql', {
    endpointURL: '/graphql',
    enabled: false,
});


bind('routes.graphiql', () => {
    const { config, terminal } = getContainer();

    if (!config.routes.graphiql.enabled) {
        terminal.disabled('graphiql');
        return null;
    }

    const options = makeGraphiqlOptions(config);
    terminal.enabled('graphiql');
    return graphiqlExpress(options);
});

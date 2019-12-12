import expressPlayground from 'graphql-playground-middleware-express';
import { defaultPlaygroundOptions } from 'apollo-server-express';
import { bind, getContainer, setDefaults } from '@globality/nodule-config';


function createMiddleware(config) {
    // Wrapping expressPlayground in order to inject the authorization header
    // into the graphql playground app.
    // This was taken from https://github.com/apollographql/apollo-server/issues/1982
    return (req, res, next) => {
        const headers = encodeURIComponent(JSON.stringify({
            authorization: req.get('authorization'),
        }));
        const { endpointUrl } = config.routes.graphiql;
        expressPlayground({
            endpoint: `${endpointUrl}?headers=${headers}`,
            settings: {
                ...defaultPlaygroundOptions.settings,
                'request.credentials': 'include',
            },
        })(req, res, next);
    };
}


setDefaults('routes.graphiql', {
    endpointUrl: '/content/graphql',
    enabled: false,
});


bind('routes.graphiql', () => {
    const { config, terminal } = getContainer();

    if (!config.routes.graphiql.enabled) {
        terminal.disabled('graphiql');
        return null;
    }

    terminal.enabled('graphiql');

    return createMiddleware(config);
});

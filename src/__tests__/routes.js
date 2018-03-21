import bodyParser from 'body-parser';
import express from 'express';
import { graphqlExpress } from 'apollo-server-express';

import resolvers from './resolvers';
import schema from './schema';


export default function createApp() {
    const app = express();

    const graphql = graphqlExpress({
        context: {
            resolvers,
        },
        rootValue: null,
        schema,
    });

    app.use(
        '/graphql',
        bodyParser.json(),
        graphql,
    );

    return app;
}

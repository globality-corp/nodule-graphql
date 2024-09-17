import { getContainer } from '@globality/nodule-config';
import bodyParser from 'body-parser';
import '@globality/nodule-express';

import 'index.js';
// activate component bindings
import './services.js';
import './schema.js';

export default async function createApp() {
    const { express, graphql: graphqlRoute, health, notFound } = getContainer('routes');

    const graphql = await graphqlRoute;

    express.get('/health', health);

    // @ts-ignore
    if (process.NODE_ENV !== 'production') {
        express.use('/graphql', bodyParser.json(), graphql);
    } else {
        express.post('/graphql', bodyParser.json(), graphql);
    }

    express.all('/*', notFound);

    return express;
}

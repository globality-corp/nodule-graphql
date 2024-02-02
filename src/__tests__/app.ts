import { getContainer } from '@globality/nodule-config';
import bodyParser from 'body-parser';
import '@globality/nodule-express';

import 'index';
// activate component bindings
import './services';
import './schema';

export default async function createApp() {
    const { express, graphql: graphqlRoute, health, notFound } = getContainer('routes');

    const graphql = await graphqlRoute;

    express.get('/health', health);

    // @ts-expect-error TS(2339): Property 'NODE_ENV' does not exist on type 'Proces... Remove this comment to see the full error message
    if (process.NODE_ENV !== 'production') {
        express.use('/graphql', bodyParser.json(), graphql);
    } else {
        express.post('/graphql', bodyParser.json(), graphql);
    }

    express.all('/*', notFound);

    return express;
}

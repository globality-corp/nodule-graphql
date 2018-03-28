import bodyParser from 'body-parser';

import { getContainer } from '@globality/nodule-config';

import 'index';
// activate component bindings
import './services';
import './schema';


export default function createApp() {
    const {
        express,
        graphiql,
        graphql,
        health,
        notFound,
    } = getContainer('routes');

    express.get('/health', health);

    express.use(
        '/graphql',
        bodyParser.json(),
        graphql,
    );

    if (graphiql) {
        express.use(
            '/graphiql',
            bodyParser.json(),
            graphiql,
        );
    }

    express.all('/*', notFound);

    return express;
}

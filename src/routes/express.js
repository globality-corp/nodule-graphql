import express from 'express';

import { bind, getContainer } from '@globality/nodule-config';


function createExpress() {
    const { cors, helmet, requestId } = getContainer('middleware');

    const app = express();
    app.use(cors);
    app.use(helmet);
    app.use(requestId);

    return app;
}


bind('routes.express', () => createExpress());

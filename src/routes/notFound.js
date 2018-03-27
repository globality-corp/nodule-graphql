import { NOT_FOUND } from 'http-status-codes';

import { bind } from '@globality/nodule-config';


export default function notFound(req, res) {
    return res.status(NOT_FOUND).json({
        code: NOT_FOUND,
        message: 'Not Found',
    });
}

bind('routes.notFound', () => notFound);

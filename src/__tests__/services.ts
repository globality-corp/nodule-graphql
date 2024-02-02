import { bind } from '@globality/nodule-config';

import { NotFound } from '@globality/nodule-express';

async function retrieveCompany(companyId) {
    if (companyId && companyId !== 'GSW') {
        throw new NotFound('No such user');
    }

    return {
        id: 'GSW',
        name: 'Golden State Warriors',
    };
}

async function retrieveUser(userId) {
    if (userId && userId === '999') {
        const error = new Error('Custom error');
        error.code = 503;
        error.headers = {
            'x-request-id': '1234',
            'x-trace-id': '5432',
        };
        throw error;
    }

    if (userId && userId === '888') {
        throw new NotFound('PersistedQueryNotFound');
    }

    if (userId && userId !== '30') {
        throw new NotFound('No such user');
    }

    return {
        companyId: 'GSW',
        firstName: 'Steph',
        id: '30',
        lastName: 'Curry',
    };
}

bind('services.company.retrieve', () => retrieveCompany);
bind('services.user.retrieve', () => retrieveUser);

import { bind } from '@globality/nodule-config';

// @ts-expect-error TS(7016): Could not find a declaration file for module '@glo... Remove this comment to see the full error message
import { NotFound } from '@globality/nodule-express';

async function retrieveCompany(companyId: any) {
    if (companyId && companyId !== 'GSW') {
        throw new NotFound('No such user');
    }

    return {
        id: 'GSW',
        name: 'Golden State Warriors',
    };
}

async function retrieveUser(userId: any) {
    if (userId && userId === '999') {
        const error = new Error('Custom error');
        // @ts-expect-error TS(2339): Property 'code' does not exist on type 'Error'.
        error.code = 503;
        // @ts-expect-error TS(2339): Property 'headers' does not exist on type 'Error'.
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

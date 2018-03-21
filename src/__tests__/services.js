import { NotFound } from '..';


export async function retrieveCompany(companyId) {
    if (companyId && companyId !== 'GSW') {
        throw new NotFound('No such user');
    }

    return {
        id: 'GSW',
        name: 'Golden State Warriors',
    };
}


export async function retrieveUser(userId) {
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

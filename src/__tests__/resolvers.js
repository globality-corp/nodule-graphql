import { createResolver, Forbidden } from '..';
import { retrieveCompany, retrieveUser } from './services';


export default {
    company: {
        retrieveName: createResolver({
            aggregate: (context, { companyId }) => retrieveCompany(companyId),
            transform: company => company.name,
        }),
    },
    user: {
        retrieve: createResolver({
            aggregate: (context, { userId }) => retrieveUser(userId),
            authorize: (context, { userId }) => {
                if (userId === '23') {
                    throw new Forbidden('Not Authorized');
                }
                return true;
            },
            transform: user => ({ items: [user] }),
        }),
    },
};

import { bind, getContainer } from '@globality/nodule-config';

import { createResolver, Forbidden, cloneResolver } from 'index';


const retrieveCompanyName = createResolver({
    aggregate: ({ companyId }) => {
        const { services } = getContainer();
        return services.company.retrieve(companyId);
    },
    transform: company => company.name,
});


const retrieveUser = createResolver({
    aggregate: ({ userId }) => {
        const { services } = getContainer();
        return services.user.retrieve(userId);
    },
    authorize: ({ userId }) => {
        if (userId === '23') {
            throw new Forbidden('Not Authorized');
        }
        return true;
    },
    mask: (obj, { id }) => [{ userId: id }],
    transform: user => ({ items: [user] }),
});

const clonedRetrieveUser = cloneResolver(retrieveUser, {
    authorize: ({ userId }) => {
        if (userId === '34') {
            throw new Forbidden('Not Authorized');
        }
        return true;
    },
});

bind('graphql.resolvers.company.name.retrieve', () => retrieveCompanyName);
bind('graphql.resolvers.user.retrieve', () => retrieveUser);
bind('graphql.resolvers.user.retrieveClone', () => clonedRetrieveUser);

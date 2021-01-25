import { bind, getContainer } from '@globality/nodule-config';
import { Forbidden } from '@globality/nodule-express';
import { createResolver } from 'index';

const retrieveCompanyName = createResolver({
    aggregate: ({ companyId }) => {
        const { services } = getContainer();
        return services.company.retrieve(companyId);
    },
    transform: (company) => company.name,
});

const retrieveUser = createResolver({
    aggregate: ({ userId }) => {
        const { services } = getContainer();
        return services.user.retrieve(userId);
    },
    authorize: (obj, { id }) => {
        if (id === '23') {
            throw new Forbidden('Not Authorized');
        }
        return true;
    },
    mask: (obj, { id }) => [{ userId: id }],
    transform: (user) => ({ items: [user] }),
});

bind('graphql.resolvers.company.name.retrieve', () => retrieveCompanyName);
bind('graphql.resolvers.user.retrieve', () => retrieveUser);

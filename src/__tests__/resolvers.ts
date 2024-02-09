import { bind, getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module '@glo... Remove this comment to see the full error message
import { Forbidden } from '@globality/nodule-express';

// @ts-expect-error TS(2307): Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { createResolver } from 'index';

const retrieveCompanyName = createResolver({
    aggregate: ({ companyId }: any) => {
        const { services } = getContainer();
        return services.company.retrieve(companyId);
    },
    transform: (company: any) => company.name,
});

const retrieveUser = createResolver({
    preAggregate: () => {},
    aggregate: ({ userId }: any) => {
        const { services } = getContainer();
        return services.user.retrieve(userId);
    },
    authorize: (obj: any, { id }: any) => {
        if (id === '23') {
            throw new Forbidden('Not Authorized');
        }
        return true;
    },
    mask: (obj: any, { id }: any) => [{ userId: id }],
    transform: (user: any) => ({
        items: [user],
    }),
});

bind('graphql.resolvers.company.name.retrieve', () => retrieveCompanyName);
bind('graphql.resolvers.user.retrieve', () => retrieveUser);

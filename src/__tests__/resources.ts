import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

// @ts-expect-error TS(2307) FIXME: Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { getResolver } from 'index';

export const CompanyType = new GraphQLObjectType({
    name: 'CompanyType',
    description: 'Company',
    fields: {
        id: {
            type: GraphQLID,
        },
        name: {
            type: GraphQLString,
        },
    },
});

export const UserType = new GraphQLObjectType({
    name: 'UserType',
    description: 'User',
    fields: {
        companyId: {
            type: GraphQLString,
        },
        companyName: {
            type: GraphQLString,
            resolve: getResolver('company.name.retrieve'),
        },
        firstName: {
            type: GraphQLString,
        },
        id: {
            type: GraphQLID,
        },
        lastName: {
            type: GraphQLString,
        },
    },
});

export const UserListType = new GraphQLObjectType({
    name: 'UserListType',
    fields: {
        items: {
            type: new GraphQLList(UserType),
        },
    },
});

export const User = {
    user: {
        type: UserListType,
        args: {
            id: {
                type: GraphQLID,
            },
        },
        resolve: getResolver('user.retrieve'),
    },
};

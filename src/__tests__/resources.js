import {
    GraphQLID,
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

import { getContainer } from '@globality/nodule-config';


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
            resolve: (user, args, context) => {
                const { resolvers } = getContainer('graphql');
                return resolvers.company.name.retrieve({
                    companyId: user.companyId,
                }, context);
            },
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
            type: GraphQLList(UserType),
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
        resolve: (rootValue, args, context) => {
            const { resolvers } = getContainer('graphql');
            return resolvers.user.retrieve({
                userId: args.id,
            }, context);
        },
    },
};

import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { User } from './resources';


const QueryType = new GraphQLObjectType({
    name: 'QueryType',
    description: 'Top-level queries',
    fields: {
        ...User,
    },
});


export default new GraphQLSchema({
    query: QueryType,
});

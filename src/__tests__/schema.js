import { bind } from '@globality/nodule-config';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { User } from './resources';
// activate component bindings
import './resolvers';

const QueryType = new GraphQLObjectType({
    name: 'QueryType',
    description: 'Top-level queries',
    fields: {
        ...User,
    },
});

const schema = new GraphQLSchema({
    query: QueryType,
});

bind('graphql.schema', () => schema);

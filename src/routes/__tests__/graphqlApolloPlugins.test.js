import { bind, setDefaults, getContainer, Nodule } from '@globality/nodule-config';
import * as apolloServerExpress from 'apollo-server-express'; // eslint-disable-line import/first
import { GraphQLObjectType, GraphQLString, GraphQLSchema } from 'graphql';

jest.mock('apollo-server-express');

import '../graphql'; // eslint-disable-line import/first
import '../../terminal'; // eslint-disable-line import/first

const QueryType = new GraphQLObjectType({
    name: 'QueryType',
    description: 'Top-level queries',
    fields: {
        hello: {
            type: GraphQLString,
            resolve: () => 'world',
        },
    },
});

const schema = new GraphQLSchema({
    query: QueryType,
});

bind('graphql.schema', () => schema);

describe('routes.graphql', () => {
    it('will supply apollo plugins configs to apollo server instance', async () => {
        const mockApolloServer = jest.fn();
        apolloServerExpress.ApolloServer.mockImplementation(mockApolloServer.mockReturnThis());

        setDefaults('routes.graphql.apolloPlugins', [
            {
                requestDidStart: () => ({
                    didEncounterErrors: () => null,
                }),
            },
        ]);

        await Nodule.testing().load();

        getContainer('routes').graphql; // eslint-disable-line no-unused-expressions

        expect(mockApolloServer.mock.calls).toHaveLength(1);
        expect(mockApolloServer.mock.calls[0]).toHaveLength(1);
        expect(mockApolloServer.mock.calls[0][0]).toHaveProperty('plugins', [
            {
                requestDidStart: expect.any(Function),
            },
        ]);
    });
});

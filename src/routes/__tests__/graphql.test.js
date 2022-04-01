import { bind, setDefaults, getContainer, Nodule } from '@globality/nodule-config';
import * as apolloServerCore from 'apollo-server-core';
import * as apolloServerExpress from 'apollo-server-express';
import { GraphQLObjectType, GraphQLString, GraphQLSchema } from 'graphql';

jest.mock('apollo-server-express');
jest.mock('apollo-server-core');

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
    it('will supply apollo engine configs to apollo server instance', async () => {
        const mockApolloServer = jest.fn();
        apolloServerExpress.ApolloServer.mockImplementation(mockApolloServer.mockReturnThis());
        const mockApolloServerPluginUsageReporting = apolloServerCore.ApolloServerPluginUsageReporting.mockImplementation(
            () => 'ApolloServerPluginUsageReporting'
        );

        const config = {
            enabled: true,
            apiKey: 'mock-api-key',
            schemaTag: 'mock-schema-tag',
            sendVariableValues: {
                transform: (value) => value,
            },
            sendHeaders: {
                onlyNames: ['x-mock-header'],
            },
        };
        setDefaults('routes.graphql.apolloEngine', config);

        await Nodule.testing().load();

        getContainer('routes').graphql; // eslint-disable-line no-unused-expressions

        expect(mockApolloServer.mock.calls).toHaveLength(1);
        expect(mockApolloServer.mock.calls[0]).toHaveLength(1);
        expect(mockApolloServer.mock.calls[0][0]).toHaveProperty(
            'apollo',
            expect.objectContaining({
                key: config.apiKey,
                graphVariant: config.schemaTag,
            })
        );
        expect(mockApolloServerPluginUsageReporting).toHaveBeenCalledTimes(1);
        expect(mockApolloServerPluginUsageReporting).toHaveBeenCalledWith({
            sendVariableValues: config.sendVariableValues,
            sendHeaders: config.sendHeaders,
        });
        expect(mockApolloServer.mock.calls[0][0]).toHaveProperty('plugins', ['ApolloServerPluginUsageReporting']);
    });
});

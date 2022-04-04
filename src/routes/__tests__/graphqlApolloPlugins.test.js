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
    it('will supply apollo plugins configs to apollo server instance', async () => {
        const mockApolloServer = jest.fn();
        apolloServerExpress.ApolloServer.mockImplementation(mockApolloServer.mockReturnThis());
        const mockApolloServerPluginUsageReportingDisabled = apolloServerCore.ApolloServerPluginUsageReportingDisabled.mockImplementation(
            () => 'ApolloServerPluginUsageReportingDisabled'
        );
        apolloServerCore.ApolloServerPluginLandingPageDisabled.mockImplementation(() => 'ApolloServerPluginLandingPageDisabled');

        const plugins = [
            {
                requestDidStart: () => ({
                    didEncounterErrors: () => null,
                }),
            },
        ];
        setDefaults('routes.graphql.apolloPlugins', plugins);

        await Nodule.testing().load();

        getContainer('routes').graphql; // eslint-disable-line no-unused-expressions

        expect(mockApolloServer.mock.calls).toHaveLength(1);
        expect(mockApolloServer.mock.calls[0]).toHaveLength(1);
        expect(mockApolloServerPluginUsageReportingDisabled).toHaveBeenCalledTimes(1);
        expect(mockApolloServerPluginUsageReportingDisabled).toHaveBeenCalledWith();
        expect(mockApolloServer.mock.calls[0][0]).toHaveProperty('plugins', [
            'ApolloServerPluginLandingPageDisabled',
            plugins[0],
            'ApolloServerPluginUsageReportingDisabled',
        ]);
    });
});

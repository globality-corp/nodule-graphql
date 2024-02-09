import * as apolloServer from '@apollo/server';
import { ApolloServerPluginUsageReportingDisabled } from '@apollo/server/plugin/disabled';
import { bind, setDefaults, getContainer, Nodule } from '@globality/nodule-config';
import { GraphQLObjectType, GraphQLString, GraphQLSchema } from 'graphql';

jest.mock('@apollo/server');
jest.mock('@apollo/server/plugin/disabled');
jest.mock('@apollo/server/plugin/usageReporting');

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
        // @ts-expect-error TS(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
        apolloServer.ApolloServer.mockImplementation(mockApolloServer.mockReturnThis());
        // @ts-expect-error TS(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
        const mockApolloServerPluginUsageReportingDisabled = ApolloServerPluginUsageReportingDisabled.mockImplementation(
            () => 'ApolloServerPluginUsageReportingDisabled'
        );

        const plugins = [
            {
                requestDidStart: () => ({
                    didEncounterErrors: () => null,
                }),
            },
        ];
        setDefaults('routes.graphql.apolloPlugins', plugins);

        await Nodule.testing().load();

        // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
        getContainer('routes').graphql; // eslint-disable-line @typescript-eslint/no-unused-expressions

        expect(mockApolloServer.mock.calls).toHaveLength(1);
        expect(mockApolloServer.mock.calls[0]).toHaveLength(1);
        expect(mockApolloServerPluginUsageReportingDisabled).toHaveBeenCalledTimes(1);
        expect(mockApolloServerPluginUsageReportingDisabled).toHaveBeenCalledWith();
        expect(mockApolloServer.mock.calls[0][0]).toHaveProperty('plugins', [plugins[0], 'ApolloServerPluginUsageReportingDisabled']);
    });
});

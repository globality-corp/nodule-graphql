import * as apolloServer from '@apollo/server';
import { ApolloServerPluginUsageReporting } from '@apollo/server/plugin/usageReporting';
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
    it('will supply apollo engine configs to apollo server instance', async () => {
        const mockApolloServer = jest.fn();
        // @ts-expect-error TS(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
        apolloServer.ApolloServer.mockImplementation(mockApolloServer.mockReturnThis());
        // @ts-expect-error TS(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
        const mockApolloServerPluginUsageReporting = ApolloServerPluginUsageReporting.mockImplementation(
            () => 'ApolloServerPluginUsageReporting'
        );

        const config = {
            enabled: true,
            apiKey: 'mock-api-key',
            schemaTag: 'mock-schema-tag',
            sendVariableValues: {
                transform: (value: any) => value,
            },
            sendHeaders: {
                onlyNames: ['x-mock-header'],
            },
        };
        setDefaults('routes.graphql.apolloEngine', config);

        await Nodule.testing().load();

        // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
        getContainer('routes').graphql; // eslint-disable-line @typescript-eslint/no-unused-expressions

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

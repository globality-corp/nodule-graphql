import * as apolloServer from '@apollo/server';
import { ApolloServerPluginUsageReportingDisabled } from '@apollo/server/plugin/disabled';
import { bind, setDefaults, getContainer, Nodule } from '@globality/nodule-config';
import { GraphQLObjectType, GraphQLString, GraphQLSchema } from 'graphql';

// @ts-expect-error TS(2304): Cannot find name 'jest'.
jest.mock('@apollo/server');
// @ts-expect-error TS(2304): Cannot find name 'jest'.
jest.mock('@apollo/server/plugin/disabled');
// @ts-expect-error TS(2304): Cannot find name 'jest'.
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

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('routes.graphql', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('will supply apollo plugins configs to apollo server instance', async () => {
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        const mockApolloServer = jest.fn();
        // @ts-expect-error TS(2339): Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
        apolloServer.ApolloServer.mockImplementation(mockApolloServer.mockReturnThis());
        // @ts-expect-error TS(2339): Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
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

        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        getContainer('routes').graphql; // eslint-disable-line no-unused-expressions

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockApolloServer.mock.calls).toHaveLength(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockApolloServer.mock.calls[0]).toHaveLength(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockApolloServerPluginUsageReportingDisabled).toHaveBeenCalledTimes(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockApolloServerPluginUsageReportingDisabled).toHaveBeenCalledWith();
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(mockApolloServer.mock.calls[0][0]).toHaveProperty('plugins', [plugins[0], 'ApolloServerPluginUsageReportingDisabled']);
    });
});

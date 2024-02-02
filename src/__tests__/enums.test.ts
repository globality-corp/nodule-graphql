// @ts-expect-error TS(7016): Could not find a declaration file for module 'enum... Remove this comment to see the full error message
import Enum from 'enum';
import { GraphQLEnumType } from 'graphql';

import { createGraphQLEnumType } from '../enums';

const compareGraphQLAndGraphQL = (graphqlEnum1: any, graphqlEnum2: any) => {
    if (!(graphqlEnum1.name === graphqlEnum2.name && graphqlEnum1.description === graphqlEnum2.description)) {
        return false;
    }

    const gqlEnumValues1 = graphqlEnum1.getValues();
    const gqlEnumValues2 = graphqlEnum2.getValues();

    if (gqlEnumValues1.length !== gqlEnumValues2.length) {
        return false;
    }

    return gqlEnumValues1.every((item: any) => item.value === graphqlEnum2.getValue(item.name).value);
};

const compareStandardAndGraphQL = (standardEnum: any, graphqlEnum: any) => {
    const gqlEnumValues = graphqlEnum.getValues();

    if (standardEnum.enums.length !== gqlEnumValues.length) {
        return false;
    }

    return gqlEnumValues.every((item: any) => standardEnum[item.name].value === graphqlEnum.getValue(item.name).value);
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Enum utilities', () => {
    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('createGraphQLEnumType', () => {
        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
        it('should work as expected', () => {
            const standardEnum = new Enum({
                FOO: 'FOO',
                BAR: 'BAZ', // key and value need not be same
            });

            const graphqlEnum = new GraphQLEnumType({
                name: 'graphqlEnum',
                description: 'Foo and bar',
                values: {
                    FOO: { value: 'FOO' },
                    BAR: { value: 'BAZ' },
                },
            });

            const convertedEnum = createGraphQLEnumType(standardEnum, 'graphqlEnum', 'Foo and bar');

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(compareStandardAndGraphQL(standardEnum, graphqlEnum)).toBe(true);
            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(compareStandardAndGraphQL(standardEnum, convertedEnum)).toBe(true);
            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(compareGraphQLAndGraphQL(graphqlEnum, convertedEnum)).toBe(true);
        });
    });
});

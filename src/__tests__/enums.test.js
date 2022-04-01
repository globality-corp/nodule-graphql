import Enum from 'enum';
import { GraphQLEnumType } from 'graphql';

import { createGraphQLEnumType } from '../enums';

const compareGraphQLAndGraphQL = (graphqlEnum1, graphqlEnum2) => {
    if (!(graphqlEnum1.name === graphqlEnum2.name && graphqlEnum1.description === graphqlEnum2.description)) {
        return false;
    }

    const gqlEnumValues1 = graphqlEnum1.getValues();
    const gqlEnumValues2 = graphqlEnum2.getValues();

    if (gqlEnumValues1.length !== gqlEnumValues2.length) {
        return false;
    }

    return gqlEnumValues1.every((item) => item.value === graphqlEnum2.getValue(item.name).value);
};

const compareStandardAndGraphQL = (standardEnum, graphqlEnum) => {
    const gqlEnumValues = graphqlEnum.getValues();

    if (standardEnum.enums.length !== gqlEnumValues.length) {
        return false;
    }

    return gqlEnumValues.every((item) => standardEnum[item.name].value === graphqlEnum.getValue(item.name).value);
};

describe('Enum utilities', () => {
    describe('createGraphQLEnumType', () => {
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

            expect(compareStandardAndGraphQL(standardEnum, graphqlEnum)).toBe(true);
            expect(compareStandardAndGraphQL(standardEnum, convertedEnum)).toBe(true);
            expect(compareGraphQLAndGraphQL(graphqlEnum, convertedEnum)).toBe(true);
        });
    });
});

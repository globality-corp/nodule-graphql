import Enum from 'enum';
import { GraphQLEnumType } from 'graphql';
import { createGraphQLEnumType } from '../enums';

const compareGraphQLAndGraphQL = (graphqlEnum1, graphqlEnum2) => {
    if (!(
        graphqlEnum1.name === graphqlEnum2.name
        && graphqlEnum1.description === graphqlEnum2.description
    )) {
        return false;
    }

    // need to access "private" member
    /* eslint-disable no-underscore-dangle */
    const gqlEnums1 = graphqlEnum1._enumConfig.values;
    const gqlEnums2 = graphqlEnum2._enumConfig.values;
    /* eslint-enable no-underscore-dangle */

    const gqlEnums1Keys = Object.keys(gqlEnums1);
    const gqlEnums2Keys = Object.keys(gqlEnums2);

    if (gqlEnums1Keys.length !== gqlEnums2Keys.length) return false;

    return gqlEnums1Keys.every(item => gqlEnums1[item].value === gqlEnums2[item].value);
};

const compareStandardAndGraphQL = (standardEnum, graphqlEnum) => {
    // need to access "private" member
    // eslint-disable-next-line no-underscore-dangle
    const gqlEnums = graphqlEnum._enumConfig.values;
    const gqlEnumsKeys = Object.keys(gqlEnums);

    if (standardEnum.enums.length !== gqlEnumsKeys.length) return false;

    return gqlEnumsKeys.every(item => standardEnum[item].value === gqlEnums[item].value);
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

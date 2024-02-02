import { GraphQLEnumType } from 'graphql';

// converts an Enum type created using the 'enum' package to a GraphQLEnumType
const createGraphQLEnumType = (standardEnum: any, name: any, description = '') =>
    new GraphQLEnumType({
        name,
        description,
        values: standardEnum.enums.reduce((acc: any, enum_: any) => {
            acc[enum_.key] = { value: enum_.value };
            return acc;
        }, {}),
    });

export { createGraphQLEnumType };

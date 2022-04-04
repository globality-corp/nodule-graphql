import { GraphQLEnumType } from 'graphql';

// converts an Enum type created using the 'enum' package to a GraphQLEnumType
const createGraphQLEnumType = (standardEnum, name, description = '') =>
    new GraphQLEnumType({
        name,
        description,
        values: standardEnum.enums.reduce((acc, enum_) => {
            acc[enum_.key] = { value: enum_.value };
            return acc;
        }, {}),
    });

export { createGraphQLEnumType };

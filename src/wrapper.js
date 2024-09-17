import { get, set, values } from 'lodash-es';

/**
 * Safely fetch fields from a type.
 */
export function safeGetFields(type) {
    try {
        return type.getFields();
    } catch (error) {
        return {};
    }
}

/**
 * Wrap *all* resolvers in a schema.
 */
export function wrapResolvers(schema, wrapper) {
    values(schema.getTypeMap()).forEach((type) => {
        values(safeGetFields(type)).forEach((field) => {
            const resolve = get(field, 'resolve');
            if (resolve) {
                set(field, 'resolve', wrapper(resolve));
            }
        });
    });
    return schema;
}

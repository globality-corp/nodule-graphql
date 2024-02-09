// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get, set, values } from 'lodash';

/**
 * Safely fetch fields from a type.
 */
export function safeGetFields(type: any) {
    try {
        return type.getFields();
    } catch (error) {
        return {};
    }
}

/**
 * Wrap *all* resolvers in a schema.
 */
export function wrapResolvers(schema: any, wrapper: any) {
    values(schema.getTypeMap()).forEach((type: any) => {
        values(safeGetFields(type)).forEach((field: any) => {
            const resolve = get(field, 'resolve');
            if (resolve) {
                set(field, 'resolve', wrapper(resolve));
            }
        });
    });
    return schema;
}

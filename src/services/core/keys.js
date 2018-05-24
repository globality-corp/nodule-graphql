import { isObject, toPairs, get } from 'lodash';
import { getContainer } from '@globality/nodule-config';
import uuidv5 from 'uuid/v5';

const DEFAULT_UNIQUE_ID = '00000000-0000-0000-0000-000000000000';
const { serviceConfig } = getContainer();
const uniqueId = get(serviceConfig, 'uniqueId') || DEFAULT_UNIQUE_ID;


function valueToString(value) {
    if (Array.isArray(value)) {
        return value.sort().join(',');
    }

    if (isObject(value)) {
        // returns a string like: "bar:baz,qux:foo"
        return toPairs(value).map(pair => pair.join(':')).join(',');
    }

    return value;

}


/* Generate a hashable key for a specific service request.
 *
 * Used for batching, and deduplication.
 *
 */
export default (args, strategyName = '') => {
    const argsString = Object.keys(args).sort().map(
        key => `${key}=${valueToString(args[key])}`,
    ).join('&');
    const keyString = `${strategyName}?${argsString}`;
    return uuidv5(keyString, uniqueId);
};

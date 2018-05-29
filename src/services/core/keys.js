import { isObject, toPairs } from 'lodash';
import uuidv5 from 'uuid/v5';

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
const createKey = (args, keyName = '') => {
    const argsString = Object.keys(args).sort().map(
        key => `${key}=${valueToString(args[key])}`,
    ).join('&');
    const keyString = `${keyName}?${argsString}`;
    return uuidv5(keyString, uuidv5.URL);
};

export default createKey;

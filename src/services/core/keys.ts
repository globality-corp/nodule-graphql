import { getContainer } from '@globality/nodule-config';
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { get, isObject, toPairs } from 'lodash';
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'uuid... Remove this comment to see the full error message
import { v5 as uuidv5 } from 'uuid';

function valueToString(value: any) {
    if (Array.isArray(value)) {
        return value.sort().join(',');
    }

    if (isObject(value)) {
        // returns a string like: "bar:baz,qux:foo"
        return toPairs(value)
            .map((pair: any) => pair.join(':'))
            .join(',');
    }

    return value;
}

/**
 * Generate a hashable key for a specific service request.
 *
 * Used for batching, caching and deduplication.
 *
 */
const createKey = (args: any, keyName = '') => {
    const namespace = get(getContainer('config.cache'), 'namespace', uuidv5.URL);
    const argsString = Object.keys(args)
        .sort()
        .map((key) => `${key}=${valueToString(args[key])}`)
        .join('&');
    const keyString = `${keyName}?${argsString}`;
    return uuidv5(keyString, namespace);
};

export default createKey;

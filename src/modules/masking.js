/**
 * Masking short cut functions.
 */

import { isFunction } from 'lodash-es';

export default function withArgs(value) {
    return (obj, args, ...rest) => [obj, isFunction(value) ? value(obj, args, ...rest) : value, ...rest];
}

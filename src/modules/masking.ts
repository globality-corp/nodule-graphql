/**
 * Masking short cut functions.
 */

// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { isFunction } from 'lodash';

export default function withArgs(value: any) {
    return (obj: any, args: any, ...rest: any[]) => [obj, isFunction(value) ? value(obj, args, ...rest) : value, ...rest];
}

/* Masking short cut functions.
 */


export default function withArgs(args) {
    return (obj, discard, context, info) => [obj, args, context, info];
}

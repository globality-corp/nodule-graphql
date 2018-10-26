/* Stringify an object
   Comatabile to the BE services swagger (Should return the exact same string)
   based on flask with JSONIFY_PRETTYPRINT_REGULAR turned on
   see: https://github.com/pallets/flask/blob/master/flask/json/__init__.py
*/
export default function JSONStringify(obj) {
    return `${JSON.stringify(obj, null, 2).replace(/,/g, ', ')}\n`;
}

/* Stringify an object
   Compatible to microcosm-flask's services swagger (Should return the exact same string)
   based on flask with JSONIFY_PRETTYPRINT_REGULAR turned on
   see: https://github.com/pallets/flask/blob/master/flask/json/__init__.py
*/
export default function JSONStringify(obj: any) {
    // JSON.stringify API: (value, replacer, spaces)
    // we don't need a replacer, and two spaces for tabs
    return `${JSON.stringify(obj, null, 2).replace(/,/g, ', ')}\n`;
}

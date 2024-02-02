import { hash128 } from 'spookyhash';

/**
 * Computes the 128-bit hash of a string.
 * @param {string} str  Input string to hash.
 * @returns {string}  Hash value, formatted as a 32-digit hex string.
 */
const getHash = (str) => hash128(Buffer.from(str)).toString('hex');

export default getHash;

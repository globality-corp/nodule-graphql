import Spooky from 'spookyhash';

// compatibility to python-spooky
// see spooky_hash128 https://github.com/DomainTools/spooky/blob/master/spookymodule.cpp
const emptyBuffer = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]);

export default function getHash(str) {
    return Spooky.hash128(Buffer.from(str), emptyBuffer, emptyBuffer).toString('hex');
}

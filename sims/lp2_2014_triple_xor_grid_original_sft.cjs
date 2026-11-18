'use strict';
// Windows Node 22, CommonJS. Original 2014 Stage03 archived binary positive controls.
// Historical source: https://github.com/micheloosterhof/cicada-2014/tree/master/stage03
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @type {readonly string[]} */
const historicalNames = ["onion1.bin","onion2.bin","onion3.bin"];
/** @type {readonly string[]} */
const historicalBase64 = ["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"];

/**
 * XOR equal-length source streams. The original 2014 operation has three 991-byte operands.
 * @param {readonly Buffer[]} streams
 * @returns {Buffer}
 */
function xorSameLength(streams) {
  assert(streams.length >= 2);
  const length = streams[0].length;
  for (const stream of streams) assert.equal(stream.length, length);
  const out = Buffer.alloc(length);
  for (const stream of streams) {
    for (let i = 0; i < length; i++) out[i] ^= stream[i];
  }
  return out;
}

/**
 * Three original physical table pages, left-to-right row-major.
 * @param {readonly number[][]} pages
 * @param {'prefix'|'zero-pad'} clock
 * @returns {Buffer}
 */
function xorPages(pages, clock) {
  assert.equal(pages.length, 3);
  const length = clock === 'prefix'
    ? Math.min(...pages.map(p => p.length))
    : Math.max(...pages.map(p => p.length));
  const out = Buffer.alloc(length);
  for (const page of pages) {
    for (let i = 0; i < Math.min(page.length, length); i++) out[i] ^= page[i];
  }
  return out;
}

/**
 * @param {Buffer} bytes
 * @returns {{printable: number, length: number, hex32: string, head32: string}}
 */
function describe(bytes) {
  let printable = 0;
  for (const value of bytes) {
    if (value === 9 || value === 10 || value === 13 || (value >= 32 && value <= 126)) printable++;
  }
  return {
    printable,
    length: bytes.length,
    hex32: bytes.subarray(0, 32).toString('hex'),
    head32: [...bytes.subarray(0, 32)].map(value => value >= 32 && value <= 126 ? String.fromCharCode(value) : '.').join('')
  };
}

const historical = historicalBase64.map(text => Buffer.from(text, 'base64'));
const original = xorSameLength(historical);
const ascii = original.toString('ascii');
assert.deepEqual(historical.map(x => x.length), [991, 991, 991]);
assert.equal(describe(original).printable, 991);
assert(ascii.startsWith('-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA1\n'));
assert(ascii.includes('-----BEGIN PGP SIGNATURE-----\n'));
assert(ascii.endsWith('-----END PGP SIGNATURE-----\n'));
console.log('HISTORICAL ORIGINAL POSITIVE: all three 991-byte archive operands XOR to a full 991/991-printable PGP-signed message');
console.log('HISTORICAL source filenames:', historicalNames.join(', '));
console.log('HISTORICAL message prefix:', JSON.stringify(ascii.slice(0, 110)));

const gridPath = path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json');
const grid = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
/** @type {number[][]} */
const pages = grid.pages.map(p => p.bytes);
assert.deepEqual(grid.pages.map(p => p.page), [49, 50, 51]);
assert.deepEqual(pages.map(p => p.length), [80, 104, 72]);
assert.equal(grid.bytes.length, 256);
for (const page of pages) {
  for (const value of page) assert(Number.isInteger(value) && value >= 0 && value <= 255);
}

const prefix = xorPages(pages, 'prefix');
const zeroPad = xorPages(pages, 'zero-pad');
const prefixResult = describe(prefix);
const zeroResult = describe(zeroPad);
assert.deepEqual([prefixResult.length, prefixResult.printable], [72, 28]);
assert.deepEqual([zeroResult.length, zeroResult.printable], [104, 38]);
assert.equal(prefixResult.hex32, 'c5417d2aea31bbd78fbec5b6ab23e6d8c9169647f720648c2e56b4fede6c56a2');
assert.equal(zeroResult.hex32, prefixResult.hex32);
const signatures = [
  Buffer.from('-----BEGIN PGP SIGNED MESSAGE-----'),
  Buffer.from('504b0304', 'hex'),
  Buffer.from('ffd8ff', 'hex'),
  Buffer.from('%PDF-'),
  Buffer.from('1f8b', 'hex'),
  Buffer.from('BZh')
];
for (const data of [prefix, zeroPad]) {
  assert(signatures.every(sig => !data.subarray(0, sig.length).equals(sig)));
}
console.log('LP2 SOURCE: physical p49–p51 original table lengths', pages.map(p => p.length));
console.log('LP2 PREFIX 72-byte triple XOR:', prefixResult);
console.log('LP2 ZERO-PAD 104-byte triple XOR:', zeroResult);
console.log('DECISION: direct historical operation has no author-selected clock on unequal 80/104/72-byte inputs; neither of these frozen conventions yields a typed opening.');

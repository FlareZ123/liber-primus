'use strict';

/**
 * Source-only 22/31 stem-gap reflection: p40..55 consume all source grid rows
 * once as ordered 16-byte records. The rune-free p50 record (index 10) is
 * hypothesized as an AES-128-ECB master key for the other fifteen records.
 *
 * This is a bounded decryption attempt. No primary Cicada instruction states
 * that flower bits denote AES, ECB, master-key selection or ASCII bytes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources/liber-primus/base60-grid.json'), 'utf8'));
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
const source = Buffer.from(grid.byte_rows.flat());
assert.equal(source.length, 256);
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} n */
const mod32 = (n) => ((n % 32) + 32) % 32;
/** @param {number} i */
function pair(i) {
  return [mod32(22 - 9 * i), mod32(31 + 9 * i)];
}
const pairs = Array.from({ length: 16 }, (_, i) => pair(i));
assert.equal(new Set(pairs.flat()).size, 32);
assert.deepEqual(pairs[0], [22,31]);
assert.deepEqual(pairs[10], [28,25]);
assert.deepEqual(pairs[15], [15,6]);
const records = pairs.map(([l, r]) => Buffer.concat([
  source.subarray(8*l, 8*l+8), source.subarray(8*r, 8*r+8)
]));
assert(records.every((x) => x.length === 16));
const key = records[10];
const ciphertext = Buffer.concat(records.filter((_, i) => i !== 10));
assert.equal(ciphertext.length, 240);

/** @param {Buffer} bytes @param {boolean} encrypt */
function ecb(bytes, encrypt) {
  const op = encrypt ? crypto.createCipheriv('aes-128-ecb', key, null) :
    crypto.createDecipheriv('aes-128-ecb', key, null);
  op.setAutoPadding(false);
  return Buffer.concat([op.update(bytes),op.final()]);
}
const candidate = ecb(ciphertext, false);
assert.deepEqual(ecb(candidate, true), ciphertext);
const ascii = Buffer.from(('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE '+
  'A PARABLE THE WORDS ARE A MAP AND THEIR NUMBERS ARE THE DIRECTION '+
  'SEEK AND YOU WILL BE FOUND ').repeat(3).slice(0,240), 'ascii');
assert.equal(ascii.length,240);
assert.deepEqual(ecb(ecb(ascii, true), false), ascii);

/** @param {Buffer} buf */
function metrics(buf) {
  let printable = 0, chars = 0, longest = 0, run = 0;
  for (const b of buf) {
    if (b >= 32 && b <= 126) { printable++; run++; longest = Math.max(longest,run); }
    else run=0;
    if (b===32 || (b>=65 && b<=90) || (b>=97 && b<=122)) chars++;
  }
  return {printable, chars, longest, prefixHex:buf.subarray(0,32).toString('hex')};
}
const obs = metrics(candidate);
const plant = metrics(ascii);
assert(obs.printable < 150 && obs.longest < 12);
assert(plant.printable === 240 && plant.longest === 240);
console.log(JSON.stringify({kind:'original-reflected-stem22-p50-master-key-AES128-ECB',
  sourceRows:32, pairs, p50MasterKeyHex:key.toString('hex'), dataBlocks:15,
  originalMetrics:obs, solvedSourceAsciiPlant:plant,
  outcome:'no original readable text', roundtrip:true}));
console.log('PASS exact original 256-byte reflection and p50-master AES inverse, ASCII positive plant, full forward replay');

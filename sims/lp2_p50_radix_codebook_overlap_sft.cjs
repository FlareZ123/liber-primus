'use strict';

/**
 * SFT: Original 256-cell table's two candidate byte alphabets.
 * Run from any directory: node sims/lp2_p50_radix_codebook_overlap_sft.cjs
 * This tests the printed tokens and decoder identifiability; no LP2 plaintext is claimed.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
const grid = JSON.parse(fs.readFileSync(source, 'utf8'));
const rows = grid.rows;
const printed = rows.flat();
const base60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const base59 = base60.replace('f', '');

assert.equal(rows.length, 32);
assert(rows.every(row => row.length === 8));
assert.deepEqual([rows.slice(0, 10).length, rows.slice(10, 23).length, rows.slice(23).length], [10, 13, 9]);
assert.equal(printed.length, 256);
assert.equal(grid.alphabet, base60);

/** @param {number} byte @param {string} alphabet @returns {string} */
function encode(byte, alphabet) {
  assert(Number.isInteger(byte) && byte >= 0 && byte <= 255);
  const radix = alphabet.length;
  return alphabet[Math.floor(byte / radix)] + alphabet[byte % radix];
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  assert.equal(token.length, 2);
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert(high >= 0 && low >= 0, `Invalid token ${token}`);
  const value = high * alphabet.length + low;
  assert(value <= 255, `Non-byte token ${token}`);
  return value;
}

/** @param {string} alphabet @returns {Set<string>} */
function support(alphabet) {
  return new Set(Array.from({ length: 256 }, (_, byte) => encode(byte, alphabet)));
}

const a = support(base60);
const b = support(base59);
const common = [...a].filter(token => b.has(token));
const exclusive60 = [...a].filter(token => !b.has(token));
const exclusive59 = [...b].filter(token => !a.has(token));
assert.equal(common.length, 252);
assert.deepEqual(exclusive60, ['0f', '1f', '2f', '3f']);
assert.deepEqual(exclusive59, ['4G', '4H', '4I', '4J']);
assert.equal(new Set(printed).size, 161);
assert(printed.every(token => a.has(token) && b.has(token)));
assert.equal(printed[0], '3N');
assert.equal(decode('3N', base60), 203);
assert.equal(decode('3N', base59), 200);

// A byte relabeling carries any source tape between both radix interpretations.
// First map the 252 shared spellings; then extend the map over the four unused bytes.
const permutation = new Map();
for (const token of common) {
  const input = decode(token, base59);
  const output = decode(token, base60);
  assert(!permutation.has(input));
  permutation.set(input, output);
}
const sourceRemainder = Array.from({ length: 256 }, (_, i) => i).filter(i => !permutation.has(i));
const outputSet = new Set(permutation.values());
const targetRemainder = Array.from({ length: 256 }, (_, i) => i).filter(i => !outputSet.has(i));
assert.equal(sourceRemainder.length, 4);
assert.equal(targetRemainder.length, 4);
for (let i = 0; i < 4; i++) permutation.set(sourceRemainder[i], targetRemainder[i]);
assert.equal(permutation.size, 256);
assert.equal(new Set(permutation.values()).size, 256);

for (const token of printed) {
  assert.equal(permutation.get(decode(token, base59)), decode(token, base60));
}
for (let byte = 0; byte < 256; byte++) {
  assert.equal(decode(encode(byte, base60), base60), byte);
  assert.equal(decode(encode(byte, base59), base59), byte);
}
for (const token of exclusive60) assert(!b.has(token));
for (const token of exclusive59) assert(!a.has(token));

const digest = crypto.createHash('sha256').update(rows.map(row => row.join(' ')).join('\n')).digest('hex');
const changedValues = printed.filter(token => decode(token, base59) !== decode(token, base60)).length;
const sampleLikelihoodRatio = 1; // (1/256)^256 / (1/256)^256, exact.
console.log('PASS: 256 original cells, 32x8 layout, split 10|13|9');
console.log(`source grid row-major SHA256: ${digest}`);
console.log(`distinct printed tokens: ${new Set(printed).size}; duplicate positions: ${printed.length - new Set(printed).size}`);
console.log(`shared byte-codeword support: ${common.length}/256; all original tokens in intersection: true`);
console.log('base60-only tokens: ' + exclusive60.join(', '));
console.log('base59-only tokens: ' + exclusive59.join(', '));
console.log(`original cells with different decoded numerical values: ${changedValues}/256`);
console.log('first printed token 3N: base60=203; base59=200');
console.log(`full observed tape likelihood ratio under iid uniform bytes: ${sampleLikelihoodRatio}`);
console.log('256-value bijection extension and both full alphabet roundtrips: PASS');

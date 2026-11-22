'use strict';

/** Source-only identifiability test for the two original p50 byte codecs. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const grid = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
const tokens = grid.rows.flat();

/** @param {string} alphabet */
function byteCodewords(alphabet) {
  return Array.from({ length: 256 }, (_, n) =>
    alphabet[Math.floor(n / alphabet.length)] + alphabet[n % alphabet.length]);
}

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

assert.equal(grid.alphabet, alphabet60);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.equal(grid.rows.length, 32);
for (const row of grid.rows) assert.equal(row.length, 8);
assert.equal(tokens.length, 256);

const set60 = new Set(byteCodewords(alphabet60));
const set59 = new Set(byteCodewords(alphabet59));
const shared = [...set60].filter(x => set59.has(x));
const only60 = [...set60].filter(x => !set59.has(x)).sort();
const only59 = [...set59].filter(x => !set60.has(x)).sort();
assert.equal(shared.length, 252);
assert.deepEqual(only60, ['0f', '1f', '2f', '3f']);
assert.deepEqual(only59, ['4G', '4H', '4I', '4J']);

for (const token of tokens) {
  assert.ok(set60.has(token), `Invalid base60 byte: ${token}`);
  assert.ok(set59.has(token), `Invalid drop-f base59 byte: ${token}`);
}
assert.equal(new Set(tokens).size, 161);
assert.deepEqual(tokens.map((t, i) => t === '00' ? i : -1).filter(i => i >= 0), [192, 229]);
assert.equal(tokens[65], '4F');

const values60 = tokens.map(t => decode(t, alphabet60));
const values59 = tokens.map(t => decode(t, alphabet59));
assert.equal(Math.max(...values60), 255);
assert.equal(Math.max(...values59), 251);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(values60)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const sourceCells = [47, 64, 65, 76, 169, 173, 201, 205, 252];
console.log('P50 original source: 256 cells; 161 distinct printed tokens');
console.log('Valid 8-bit codewords: B60=256, drop-f B59=256, overlap=252');
console.log('B60-only:', only60.join(' '), '  B59-only:', only59.join(' '));
console.log('Original cells in shared support: 256/256; exclusive hits: 0/256');
for (const i of sourceCells) {
  console.log(`cell ${i}: ${tokens[i]} -> B60 ${values60[i]} / B59 ${values59[i]}`);
}
// Under either independent-uniform-byte hypothesis, each exact observed
// token has probability 1/256. Therefore the *full* original sequence has
// likelihood (1/256)^256 in both hypotheses and Bayes factor exactly one.
// An 8-bit exclusive codeword would make one hypothesis impossible.
assert.ok(set60.has('0f') && !set59.has('0f'));
assert.ok(set59.has('4G') && !set60.has('4G'));
const overlapProbability = (252 / 256) ** 256;
console.log('Uniform-byte probability of 256/256 shared support under either:',
  overlapProbability.toFixed(12));
console.log('Exact-sequence likelihood ratio B60/B59 under uniform bytes: 1');
console.log('PASS: byte-legality and iid-uniform-byte evidence alone cannot select radix');

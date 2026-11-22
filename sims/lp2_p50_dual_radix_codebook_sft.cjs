'use strict';

/**
 * Exact, read-only p50 base60/base59 codebook ambiguity gate.
 * Run with Node.js 22 from any working directory.
 * Uses only source-verified table tokens and built-in modules.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'),
  'utf8',
));
const a60 = source.alphabet;
const a59 = a60.replace('f', '');
const tokens = source.pages.flatMap(page => page.tokens);
const abc25 = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';

assert.equal(a60.length, 60);
assert.equal(a59.length, 59);
assert.equal(tokens.length, 256);
assert.equal(new Set(tokens).size, 161);

 /** @param {number} radix @param {string} alphabet @param {number} value */
function encode(radix, alphabet, value) {
  return alphabet[Math.floor(value / radix)] + alphabet[value % radix];
}

/** @param {number} radix @param {string} alphabet @param {string} token */
function decode(radix, alphabet, token) {
  return radix * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
}

const b60Codebook = new Set(Array.from({ length: 256 }, (_, n) => encode(60, a60, n)));
const b59Codebook = new Set(Array.from({ length: 256 }, (_, n) => encode(59, a59, n)));
const overlap = new Set([...b60Codebook].filter(x => b59Codebook.has(x)));
const only60 = [...b60Codebook].filter(x => !b59Codebook.has(x)).sort();
const only59 = [...b59Codebook].filter(x => !b60Codebook.has(x)).sort();

assert.equal(overlap.size, 252);
assert.deepEqual(only60, ['0f', '1f', '2f', '3f']);
assert.deepEqual(only59, ['4G', '4H', '4I', '4J']);
assert(tokens.every(x => overlap.has(x)));

const values60 = tokens.map(x => decode(60, a60, x));
const values59 = tokens.map(x => decode(59, a59, x));
assert(values60.every(x => x >= 0 && x <= 255));
assert(values59.every(x => x >= 0 && x <= 255));
assert.equal(Math.max(...values60), 255);
assert.equal(Math.max(...values59), 251);
assert.equal(new Set(values60).size, 161);
assert.equal(new Set(values59).size, 161);

/** @param {number[]} values */
function sha256(values) {
  return crypto.createHash('sha256').update(Buffer.from(values)).digest('hex');
}
assert.equal(sha256(values60), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(sha256(values59), '511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79');

const differences = values60.map((n, i) => n - values59[i]);
const histogram = Array(5).fill(0);
differences.forEach(d => {
  assert(d >= 0 && d < 5);
  histogram[d]++;
});
assert.deepEqual(histogram, [36, 62, 62, 63, 33]);

 /** @param {number[]} digits */
function polybius(digits) {
  assert.equal(digits.length % 2, 0);
  let output = '';
  for (let i = 0; i < digits.length; i += 2) {
    output += abc25[5 * digits[i] + digits[i + 1]];
  }
  return output;
}
const columnOrder = Array.from({ length: 256 }, (_, i) => differences[8 * (i % 32) + Math.floor(i / 32)]);
const rowText = polybius(differences);
const columnText = polybius(columnOrder);
assert.equal(rowText.length, 128);
assert.equal(columnText.length, 128);
assert.equal(rowText.slice(0, 12), 'UTKOKPVTOANG');
assert.equal(columnText.slice(0, 12), 'RNMZOOXGQPZX');
assert.equal(rowText.includes('E'), false);
assert.equal(columnText.includes('E'), false);

const eventProbability = (252 / 256) ** 256;
console.log('Source tokens: 256, distinct tokens: 161, both byte decoders valid.');
console.log('Base60-only codes:', only60.join(','), 'Base59-only codes:', only59.join(','));
console.log('Shared codewords:', overlap.size);
console.log('P(all 256 shared | iid uniform bytes, either radix):', eventProbability);
console.log('Exact source-byte SHA256, base60:', sha256(values60));
console.log('Exact source-byte SHA256, base59:', sha256(values59));
console.log('Source dual-radix differences histogram 0..4:', histogram);
console.log('Direct 5x5 Polybius, original row-major:', rowText);
console.log('Direct 5x5 Polybius, column-major:', columnText);
console.log('PASS: exact codebook tie; direct source-layout Polybius does not reveal plaintext');

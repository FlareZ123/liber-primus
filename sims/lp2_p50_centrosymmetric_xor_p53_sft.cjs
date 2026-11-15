'use strict';

/**
 * Original-source antipodal XOR hypothesis:
 * 2014 magic-square centrosymmetry + LP1 OutGuess XOR precedent
 * -> p50's 32x8 table, 180-degree pairs
 * -> 128 bytes for the original p53 black 128-rune half.
 *
 * A fixed, zero-fitted key consumer is P[i]=(C[i]-(B[i]^B[255-i])) mod29.
 * This is a source-motivated exploratory test, not an authenticated cipher.
 *
 * Node.js 22, CommonJS, read-only SFT:
 * node sims/lp2_p50_centrosymmetric_xor_p53_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const squares = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/)
  .map(part => part.trim().split(/\s+/).map(Number));
assert.deepEqual(squares.map(square => square.length), [25, 49, 25]);
assert.deepEqual(squares.map(square => square[(square.length - 1) / 2]),
  [809, 331, 91]);
for (const square of squares) {
  for (let j = 0; j < square.length; j++)
    assert.equal(square[j], square[square.length - 1 - j]);
}
const html = read('resources/cicada2014-onion7-index.html');
assert.match(html, /<title>133<\/title>/i);
assert.match(html, /<div id="331">/i);
assert.equal(table.byte_rows.length, 32);
assert(table.byte_rows.every(row => row.length === 8));
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert(bytes.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
const black = corpus.pages[53].indices.slice(0, 128);
assert.equal(corpus.pages[53].indices.length, 179);
assert.equal(black.length, 128);
assert.equal(corpus.pages[57].indices.length, 95);

const key = Array.from({length: 128}, (_, i) =>
  bytes[i] ^ bytes[255 - i]);
assert.deepEqual(key.slice(0, 8), [155, 90, 131, 14, 135, 65, 224, 198]);
const mod = n => ((n % 29) + 29) % 29;
/** @param {number[]} data @returns {number} */
function coincidence(data) {
  const f = Array(29).fill(0);
  for (const value of data) f[value]++;
  return f.reduce((total, n) => total + n * (n - 1), 0)
    / (data.length * (data.length - 1));
}
const plainCandidate = black.map((c, i) => mod(c - key[i]));
const rawIoC = coincidence(black);
const candidateIoC = coincidence(plainCandidate);
assert(Math.abs(rawIoC - 0.03543307086614173) < 1e-13);
assert(Math.abs(candidateIoC - 0.03321850393700788) < 1e-13);
assert.equal(new Set(key).size, 97);
assert.equal(key.filter(x => x >= 32 && x <= 126).length, 44);

// Source-native planted positive: exact inverse at all 128 positions.
const native = Array.from({length: 128}, (_, i) =>
  corpus.pages[57].indices[i % 95]);
const planted = native.map((p, i) => mod(p + key[i]));
assert.deepEqual(planted.map((c, i) => mod(c - key[i])), native);

console.log(JSON.stringify({
  status: 'PASS',
  hypothesis: 'p50 antipodal XOR -> p53 black128, direct GP29 subtraction',
  sourceMagicSquareCentres: [809, 331, 91],
  sourceHtml: {title: 133, divId: 331},
  sourceByteCells: bytes.length,
  sourceBlackRunes: black.length,
  antipodalXorBytes: key.length,
  antipodalXorDistinctBytes: new Set(key).size,
  printableXorBytes: 44,
  originalBlackIoC: rawIoC,
  originalDecodedIoC: candidateIoC,
  candidatePrefix: plainCandidate.slice(0, 40)
    .map(i => corpus.translit[i]).join('.'),
  positive: {sourceNativeRunesRecovered: 128, exact: true},
  verdict: 'No readable original plaintext or identified key. The one fixed direct consumer fails.'
}, null, 2));

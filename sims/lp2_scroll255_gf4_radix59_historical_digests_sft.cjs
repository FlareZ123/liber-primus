'use strict';

/**
 * Source-fixed scroll-word cryptographic digest trial on the original
 * p3-p7 255 complete words -> original p8 255 runes GF4/radix59 receiver.
 * Historical candidates: SHA-1 (Cicada PGP signed messages),
 * SHA-256 and SHA-512 (Cicada's published digest practices).
 *
 * This code reports complete original 255-position matches and
 * positive-control round trips. It does not fit a secret key, cipher phase
 * or target plaintext. Node.js 22/CommonJS, read-only, Windows 11.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'resources', 'liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(dir, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(dir, 'lp2-grid-256.json'), 'utf8'));
const sections = fs.readFileSync(path.join(dir, 'lp2-transcription.txt'), 'utf8').split('%');
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const mod29 = x => ((x % 29) + 29) % 29;

const words = [];
let current = [];
for (let page = 3; page <= 7; page++) {
  for (const ch of sections[page]) {
    if (runeIndex.has(ch)) current.push(runeIndex.get(ch));
    else if ((ch === '-' || ch === '.') && current.length) {
      words.push(current);
      current = [];
    }
  }
}
if (current.length) words.push(current);
assert.equal(words.length, 255);
assert.equal(words.flat().length, 1145);

const p8 = gp.pages[8].indices;
assert.equal(p8.length, 255);
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const table = tokens.map(t =>
  59 * alphabet59.indexOf(t[0]) + alphabet59.indexOf(t[1]));
assert(table.every(x => x >= 0 && x <= 251));

/** @param {number} a GF(4) element @param {number} b GF(4) element */
function multiply4(a, b) {
  let result = 0;
  for (let k = 0; k < 2; k++) {
    if ((b >>> k) & 1) result ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return result;
}
const addresses = [];
let state = [2, 0, 0, 0];
for (let i = 0; i < 255; i++) {
  addresses.push(state.reduce((n, x) => n * 4 + x, 0));
  let feedback = 0;
  for (let j = 0; j < 4; j++) {
    feedback ^= multiply4(state[j], [3, 2, 0, 3][j]);
  }
  state = [state[1], state[2], state[3], feedback];
}
assert.equal(new Set(addresses).size, 255);
assert.deepEqual(state, [2, 0, 0, 0]);
const pad = addresses.map(x => table[x]);
const actual = p8.map((x, i) => mod29(x + pad[i]));
assert.deepEqual([47, 48, 235, 88].map(i => actual[i]), [20, 8, 2, 9]);
for (const [i, j] of [[47, 240], [48, 231], [235, 236], [88, 179]]) {
  assert.equal(actual[i], actual[j]);
}

/** @param {number[]} word GP29 rune indices @returns {bigint} */
function primeProduct(word) {
  return word.reduce((value, index) => value * BigInt(gp.prime[index]), 1n);
}

const encodings = {
  rune_utf8: w => Buffer.from(w.map(x => gp.runes[x]).join(''), 'utf8'),
  translit_latin: w => Buffer.from(w.map(x => gp.translit[x]).join(''), 'utf8'),
  ordinal_bytes: w => Buffer.from(w),
  prime_bytes: w => Buffer.from(w.map(x => gp.prime[x])),
  sorted_rune_utf8: w => Buffer.from(w.slice().sort((a, b) => a - b)
    .map(x => gp.runes[x]).join(''), 'utf8'),
  sorted_translit_latin: w => Buffer.from(w.slice().sort((a, b) => a - b)
    .map(x => gp.translit[x]).join(''), 'utf8'),
  sorted_ordinal_bytes: w => Buffer.from(w.slice().sort((a, b) => a - b)),
  sorted_prime_bytes: w => Buffer.from(w.slice().sort((a, b) => a - b)
    .map(x => gp.prime[x])),
  // GP prime-product is order independent. BigInt prevents precision loss.
  prime_product_decimal: w => Buffer.from(primeProduct(w).toString(10), 'ascii'),
  prime_product_hex: w => Buffer.from(primeProduct(w).toString(16), 'ascii'),
  prime_product_integer_be: w => {
    const hex = primeProduct(w).toString(16);
    return Buffer.from(hex.length % 2 ? '0' + hex : hex, 'hex');
  }
};

/** @param {Buffer} bytes Cryptographic hash bytes */
function residueWhole(bytes) {
  let value = 0;
  for (const byte of bytes) value = (value * 256 + byte) % 29;
  return value;
}
const algorithms = ['sha1', 'sha256', 'sha512'];
const results = [];
for (const [encoding, serialize] of Object.entries(encodings)) {
  const buffers = words.map(serialize);
  for (const algorithm of algorithms) {
    const hashes = buffers.map(bytes => crypto.createHash(algorithm).update(bytes).digest());
    for (const reduction of ['first_byte', 'whole_digest']) {
      const h = hashes.map(bytes => reduction === 'first_byte'
        ? bytes[0] % 29 : residueWhole(bytes));
      const hits = h.reduce((n, value, i) => n + Number(value === actual[i]), 0);
      const predictedAnagramEqual = h[88] === h[179];
      results.push({ encoding, algorithm, reduction, hits, predictedAnagramEqual });
    }
  }
}
results.sort((a, b) => b.hits - a.hits);
const best = results[0];
assert.equal(results.length, 66);
const productResults = results.filter(x => x.encoding.startsWith('prime_product_'));
assert.equal(productResults.length, 18);
assert.equal(Math.max(...productResults.map(x => x.hits)), 16);
assert.equal(productResults.filter(x => x.hits === 255).length, 0);

/** Known-value digest plant exactly reproduces a synthetic p8 full-length source. */
const plant = words.map(w => residueWhole(crypto.createHash('sha256')
  .update(encodings.sorted_ordinal_bytes(w)).digest()));
const plantCipher = plant.map((x, i) => mod29(x - pad[i]));
const plantRecovered = plantCipher.map((x, i) => mod29(x + pad[i]));
assert.deepEqual(plantRecovered, plant);
assert.deepEqual(plantCipher.map((x, i) => mod29(plantRecovered[i] - pad[i])), plantCipher);

console.log(JSON.stringify({
  source: 'Original physical LP2 p3-p7 complete printed words; original physical p8 GP29',
  originalWordCount: words.length,
  sourceRunes: words.flat().length,
  sourceP8Runes: p8.length,
  p7ProductGF4Radix59OriginalAddresses: addresses.length,
  testedLiteralDigestModels: results.length,
  sourcePrimeProductModels: productResults.length,
  bestSourcePrimeProduct: productResults.reduce((best, x) =>
    x.hits > best.hits ? x : best, productResults[0]),
  exactOriginalModelMatches: results.filter(x => x.hits === 255),
  bestOriginal: best,
  topTen: results.slice(0, 10),
  allOriginalResults: results,
  syntheticPositive: { correct: 255, total: 255 }
}, null, 2));

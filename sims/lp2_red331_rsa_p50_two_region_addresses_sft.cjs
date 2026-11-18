'use strict';
/**
 * Original 2014 HTML + opening red title -> two selected p50 cell coordinates.
 *
 * This is a reproducible, strictly descriptive clue. It does NOT decrypt
 * unknown LP2 runes or prove that Cicada authored RSA for this purpose.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const html = read('resources/cicada2014-onion7-index.html');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const transcript = read('resources/lp2-transcription.txt');

const e = Number(html.match(/<title>(\d+)<\/title>/)?.[1]);
const n = Number(html.match(/<div id="(\d+)">/)?.[1]);
assert.deepEqual([e, n], [133, 331]);

/** @param {number} a @param {number} m @returns {number} */
function inverse(a, m) {
  let [t, newT, r, newR] = [0, 1, m, a];
  while (newR) {
    const q = Math.floor(r / newR);
    [t, newT] = [newT, t - q * newT];
    [r, newR] = [newR, r - q * newR];
  }
  assert.equal(r, 1);
  return ((t % m) + m) % m;
}
/** @param {number} x @param {number} p @param {number} modulus @returns {number} */
function modPow(x, p, modulus) {
  let base = x % modulus, power = p, result = 1;
  while (power) {
    if (power % 2) result = (result * base) % modulus;
    base = (base * base) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}
/** @param {number} x @returns {boolean} */
function prime(x) {
  if (x < 2) return false;
  for (let t = 2; t * t <= x; t++) if (x % t === 0) return false;
  return true;
}
/** @param {number} x @returns {number} */
function primeRank(x) {
  let k = 0;
  for (let i = 2; i <= x; i++) if (prime(i)) k++;
  return k;
}
assert.equal(prime(n), true);
const d = inverse(e, n - 1);
assert.equal(d, 67);
assert.equal(primeRank(n), 67);

const titleMatch = transcript.split('%')[0].trim().match(/^([^-\.\r\n]+)-([^-\.\r\n]+)\./u);
assert.ok(titleMatch);
const runeIndices = new Map(corpus.runes.map((r, i) => [r, i]));
/** @param {string} word @returns {number} */
const gpPrimeSum = word => [...word].reduce((sum, rune) => sum + corpus.prime[runeIndices.get(rune)], 0);
const wordSums = [titleMatch[1], titleMatch[2]].map(gpPrimeSum);
assert.deepEqual(wordSums, [347, 315]);
assert.equal(wordSums[0] + wordSums[1], 2 * n);
const sourceRune = corpus.runes[15];
assert.equal(titleMatch[1][0], sourceRune);
assert.equal(titleMatch[2][0], sourceRune);
assert.equal(15 + 1, 16);

const addresses = wordSums.map(x => modPow(x, d, n));
assert.deepEqual(addresses, [83, 248]);
for (let i = 0; i < wordSums.length; i++) {
  assert.equal(modPow(addresses[i], e, n), wordSums[i] % n);
}
assert.equal(addresses[0] + addresses[1], n);
const tokens = grid.rows.flat();
const bytes = grid.byte_rows.flat();
assert.equal(tokens.length, 256);
assert.equal(bytes.length, 256);
const cells = addresses.map(i => ({
  address: i, row: Math.floor(i / 8), col: i % 8,
  originalToken: tokens[i], sourceByte: bytes[i]
}));
assert.deepEqual(cells, [
  {address: 83, row: 10, col: 3, originalToken:'3D', sourceByte:193},
  {address:248, row:31, col:0, originalToken:'1r', sourceByte:113}
]);
assert.equal(primeRank(bytes[83]), 44);
assert.equal(primeRank(bytes[248]), 30);
assert.equal(primeRank(bytes[248]), 32 - 2); // 30 interior grid rows
const base59 = grid.alphabet.replace('f', '');
assert.equal(base59.length, 59);
const readBase59 = token => base59.indexOf(token[0]) * 59 + base59.indexOf(token[1]);
assert.equal(readBase59(tokens[83]), 190);
assert.equal(readBase59(tokens[248]), 111);
assert.equal(prime(190), false);
assert.equal(prime(111), false);

const repeated193 = bytes.flatMap((v, i) => v === 193 ? [i] : []);
const repeated113 = bytes.flatMap((v, i) => v === 113 ? [i] : []);
assert.deepEqual(repeated193, [83, 127]);
assert.deepEqual(repeated113, [248]);
assert.equal(repeated193[1] - repeated193[0], primeRank(193));
assert.equal(127 - 83 - 1, 43);
const rim = 2 * (32 + 8) - 4, interior = 256 - rim;
assert.deepEqual([rim, interior], [76, 180]);
assert.equal(corpus.pages.find(x=>x.page===55).runic_count, rim);
assert.equal(corpus.pages.find(x=>x.page===56).runic_count +
  corpus.pages.find(x=>x.page===57).runic_count, interior);

// Adversarial scope check: the same source-fixed operation cannot be a
// universal 256-cell address for all marked red headings.
const annotations = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const otherRed = annotations.pages.filter(p => p.page > 0).flatMap(p =>
  (p.red_spans || []).map(span => ({
    page:p.page, start:span.start,
    sourceSum:gpPrimeSum(span.runes),
    address:modPow(gpPrimeSum(span.runes), d, n)
  }))
);
assert.equal(otherRed.length, 17);
const unreachable = otherRed.filter(x => x.address > 255);
assert.deepEqual(unreachable, [
  {page:6, start:71, sourceSum:661, address:330},
  {page:15, start:9, sourceSum:430, address:286}
]);

console.log(JSON.stringify({
  original_html: {publicExponent:e, primeModulus:n, inverseExponent:d},
  original_p0_red_prime_sums:wordSums,
  RSA_inverse_selected_addresses:cells,
  paired_193_cells:repeated193, primeOrdinal193:primeRank(193),
  other_red_headings_out_of_grid:unreachable,
  base59_selected_cells: [readBase59(tokens[83]), readBase59(tokens[248])],
  original_p55_runes:rim,
  solved_p56_plus_clear_p57_runes:interior,
  warning:'Exploratory postselected inter-artifact alignment, no recovered plaintext or author-selected cipher'
}, null, 2));
console.log('PASS: original source equality and source-selected p50 coordinate hypothesis');

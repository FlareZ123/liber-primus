'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));

const RUNIC = /[\u16A0-\u16FF]/u;
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const N = 1433;

/** @param {number} x @param {number} m */
const mod = (x, m) => ((x % m) + m) % m;

/** @param {number} a @param {number} exponent @param {number} m */
function modPow(a, exponent, m) {
  let out = 1;
  a = mod(a, m);
  while (exponent > 0) {
    if (exponent & 1) out = (out * a) % m;
    a = (a * a) % m;
    exponent = Math.floor(exponent / 2);
  }
  return out;
}

/** @param {number} a @param {number} m */
function inverse(a, m) {
  return modPow(a, m - 2, m);
}

/** @param {number} a @param {number} m */
function multiplicativeOrder(a, m) {
  let value = 1;
  for (let exponent = 1; exponent < m; exponent += 1) {
    value = (value * a) % m;
    if (value === 1) return exponent;
  }
  return null;
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}

/** @param {number} n */
function primeOrdinal(n) {
  let count = 0;
  for (let value = 2; value <= n; value += 1) if (isPrime(value)) count += 1;
  return count;
}

const section = [...transcription.split('$')[5]]
  .filter((ch) => RUNIC.test(ch))
  .map((rune) => runeToIndex.get(rune));

assert.equal(section.length, N);
assert.equal(isPrime(N), true);
assert.equal(section[0], 19);
assert.equal(multiplicativeOrder(19, N), 1432);

const h = modPow(19, 8, N);
assert.equal(h, 992);
assert.equal(multiplicativeOrder(h, N), 179);
assert.equal(mod(-inverse(h, N), N), 13);
assert.equal(modPow(h, 44, N), 31);
assert.equal(modPow(19, 8 * 44, N), 31);
assert.equal(primeOrdinal(193), 44);

const T = (x) => mod(31 * x + 13, N);
const fixedPoint = 525;
assert.equal(T(fixedPoint), fixedPoint);

const owner = new Int16Array(N).fill(-1);
const cycles = [];
for (let start = 0; start < N; start += 1) {
  if (owner[start] >= 0) continue;
  const cycle = [];
  let x = start;
  while (owner[x] < 0) {
    owner[x] = cycles.length;
    cycle.push(x);
    x = T(x);
  }
  cycles.push(cycle);
}
assert.deepEqual(
  cycles.map((cycle) => cycle.length).sort((a, b) => a - b),
  [1, 179, 179, 179, 179, 179, 179, 179, 179]
);

const canonicalStarts = Array.from(
  { length: 8 },
  (_, column) => mod(fixedPoint + modPow(19, column, N), N)
);
assert.deepEqual(canonicalStarts, [526, 544, 886, 219, 443, 400, 1016, 1256]);
assert.equal(new Set(canonicalStarts.map((x) => owner[x])).size, 8);
assert.ok(canonicalStarts.every((x) => cycles[owner[x]].length === 179));

const alphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} word */
function encodeEnglish(word) {
  const source = word.toLowerCase().replace(/v/g, 'u').replace(/k/g, 'c').replace(/z/g, 's');
  const indices = [];
  for (let offset = 0; offset < source.length;) {
    const hit = alphabet.find((entry) => source.startsWith(entry.token, offset));
    assert.ok(hit, `cannot encode ${word}`);
    indices.push(hit.index);
    offset += hit.token.length;
  }
  return indices;
}

/** @param {number[]} indices */
const primeSum = (indices) => indices.reduce((sum, index) => sum + corpus.prime[index], 0);

assert.equal(primeSum(encodeEnglish('words')), 179);
assert.equal(primeSum(encodeEnglish('Its')), 143);

const sourcePages = transcription.split('%');
function printedWords(pageText) {
  const joined = pageText.replaceAll('/', '').replaceAll('\n', '').replaceAll('\r', '');
  return joined
    .split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(/[ᚠ-᛿]+/gu) || []).join(''))
    .filter(Boolean);
}
const physicalPages = Array.from({ length: 58 }, (_, page) =>
  page === 50 ? [] : printedWords(sourcePages[page > 50 ? page - 1 : page])
);

const runeWordToIndices = (word) => [...word].map((rune) => runeToIndex.get(rune));
const runeWordPrimeSum = (word) => primeSum(runeWordToIndices(word));
const translit = (word) => runeWordToIndices(word).map((index) => corpus.translit[index]).join('');
const address = (sum) => ({ page: sum % 58, index: Math.floor(sum / 58) });

assert.deepEqual(address(143), { page: 27, index: 2 });
assert.equal(translit(physicalPages[27][2]), 'LSCP');

const twoHits = [];
for (let page = 0; page < 58; page += 1) {
  for (let index = 0; index < physicalPages[page].length; index += 1) {
    if (translit(physicalPages[page][index]) === 'TWO') {
      twoHits.push({ page, index, sum: runeWordPrimeSum(physicalPages[page][index]) });
    }
  }
}
assert.deepEqual(twoHits, [{ page: 54, index: 9, sum: 85 }]);
assert.deepEqual(address(85), { page: 27, index: 1 });
assert.equal(translit(physicalPages[27][1]), 'LSOAAEHLEEOIML');

assert.equal(grid.bytes[3], 193);

console.log(JSON.stringify({
  classification: 'exact structural relation; no plaintext recovered',
  selectedSection: { length: N, firstIndex: 19, phi: 1432 },
  width: 8,
  h,
  wordPrimeSumWORDS: 179,
  border: {
    left13: mod(-inverse(h, N), N),
    right31: modPow(h, 44, N)
  },
  page50Conditional: { byte3: grid.bytes[3], primeOrdinal: primeOrdinal(grid.bytes[3]) },
  affine: {
    formula: 'T(x)=31*x+13 mod 1433',
    fixedPoint,
    cycleLengths: cycles.map((cycle) => cycle.length).sort((a, b) => a - b),
    canonicalStarts
  },
  wordAddressConvergence: {
    Its: { sum: 143, target: 'p27 word2 LSCP' },
    TWO: { source: 'p54 word9', sum: 85, target: 'p27 word1 LSOAAEHLEEOIML' }
  }
}, null, 2));

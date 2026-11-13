'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const page32 = corpus.pages[32].indices;
const page33 = corpus.pages[33].indices;
const printed32 = read('resources/liber-primus/lp2-transcription.txt').split('%')[32];
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number} n @returns {number} The one-based nth prime. */
function nthPrime(n) {
  const found = [];
  for (let x = 2; found.length < n; x++) {
    if (found.every((prime) => prime * prime > x || x % prime !== 0)) {
      found.push(x);
    }
  }
  return found[n - 1];
}

/** @param {number[]} values @returns {number} */
function iocNumerator(values) {
  const bins = Array(29).fill(0);
  for (const x of values) bins[x]++;
  return bins.reduce((sum, n) => sum + n * (n - 1), 0);
}

/**
 * Source-printed page words. Slash and whitespace wrap text without
 * ending a lexical word; punctuation, notably hyphen, ends it.
 * @param {string} text
 * @returns {{start:number,end:number,values:number[]}[]}
 */
function originalWords(text) {
  const words = [];
  let start = 0;
  let values = [];
  let count = 0;
  const finish = () => {
    if (values.length > 0) words.push({start, end: count, values});
    values = [];
  };
  for (const ch of text) {
    const index = runeToIndex.get(ch);
    if (index !== undefined) {
      if (values.length === 0) start = count;
      values.push(index);
      count++;
    } else if (ch === '/' || /\s/u.test(ch)) {
      continue;
    } else {
      finish();
    }
  }
  finish();
  assert.equal(count, 121);
  return words;
}

/** @returns {[number,number][]} Center-out, first east then north. */
function eastNorthSpiral() {
  const positions = [[4, 4]];
  const directions = [[0, 1], [-1, 0], [0, -1], [1, 0]];
  let r = 4, c = 4, direction = 0, distance = 1;
  while (positions.length < 81) {
    for (let turn = 0; turn < 2 && positions.length < 81; turn++) {
      for (let step = 0; step < distance && positions.length < 81; step++) {
        r += directions[direction][0];
        c += directions[direction][1];
        assert(r >= 0 && r < 9 && c >= 0 && c < 9);
        positions.push([r, c]);
      }
      direction = (direction + 1) % 4;
    }
    distance++;
  }
  assert.equal(new Set(positions.map(([y, x]) => `${y},${x}`)).size, 81);
  assert.deepEqual(positions.slice(0, 3), [[4, 4], [4, 5], [3, 5]]);
  return positions;
}

assert.equal(page32.length, 121);
assert.equal(page33.slice(10, 91).length, 81);
const matrix = Array.from({length: 11}, (_, r) =>
  page32.slice(11 * r, 11 * r + 11));
const sumPrime = (values) => values.reduce((sum, x) => sum + corpus.prime[x], 0);
assert.equal(sumPrime(matrix[0]), 563);
assert.equal(sumPrime(matrix.map((row) => row[0])), 569);
assert.equal(nthPrime(103), 563);
assert.equal(nthPrime(104), 569);

const indexed = page32.slice(102, 106).map((x) => corpus.translit[x]).join('');
assert.equal(indexed, 'ENNW');
const words = originalWords(printed32);
const easternNorthernWord = words.filter((word) =>
  word.start === 102 && word.end === 104);
assert.equal(easternNorthernWord.length, 1);
assert.deepEqual(easternNorthernWord[0].values.map((x) => corpus.translit[x]), ['E', 'N']);
assert(words.some((word) => word.start === 104 &&
  corpus.translit[word.values[0]] === 'N' &&
  corpus.translit[word.values[1]] === 'W'));

// Condition only on the 21 already image-selected axis cells, fixing
// every other source rune multiset and all original word boundaries.
const free = [];
for (let r = 1; r < 11; r++)
  for (let c = 1; c < 11; c++) free.push(matrix[r][c]);
assert.equal(free.length, 100);
const count = (name) => free.filter((n) => corpus.translit[n] === name).length;
assert.deepEqual([count('E'), count('N'), count('W')], [3, 3, 8]);
const enChance = 3 * 3 / (100 * 99);
const ennwChance = 3 * 3 * 2 * 8 / (100 * 99 * 98 * 97);

// The original p32 inner nine-ring contains 81 positions, and the
// original p33 red-heading-delimited adjacent body has 81 runes.
const key = eastNorthSpiral().map(([r, c]) => matrix[r + 1][c + 1]);
const cipher = page33.slice(10, 91);
/** @param {number[]} c @param {number} sign @returns {number[]} */
function decode(c, sign) {
  return c.map((n, i) => (n + sign * key[i] + 29) % 29);
}
/** @param {number[]} p @param {number} sign @returns {number[]} */
function encode(p, sign) {
  return p.map((n, i) => (n - sign * key[i] + 29) % 29);
}
const minus = decode(cipher, -1);
const plus = decode(cipher, +1);
assert.equal(iocNumerator(minus), 200);
assert.equal(iocNumerator(plus), 250);
assert.equal(iocNumerator(cipher), 214);
for (const sign of [-1, 1]) {
  const recovered = decode(cipher, sign);
  assert.deepEqual(encode(recovered, sign), cipher);
  // Genuine solved independent GP language, artificially encrypted
  // under the entire frozen source key, must recover exactly.
  const plain = corpus.pages[57].indices.slice(0, 81);
  assert.deepEqual(decode(encode(plain, sign), sign), plain);
}
assert.equal(iocNumerator(corpus.pages[57].indices), 560);
console.log(JSON.stringify({
  status: 'PASS', imageSize: [563, 569], primeRanks: [103, 104],
  wordAtRanks: 'EN', nextWordPrefix: 'NW', frozenEdgeCounts: {E: 3, N: 3, W: 8},
  conditionalEN: enChance, conditionalENNW: ennwChance,
  spiral: 'east-then-north', keyLength: key.length,
  target: 'p33 [10,91)', originalIoC: 214 / 6480,
  minusIoC: 200 / 6480, plusIoC: 250 / 6480,
  solvedP57IoC: 560 / (95 * 94),
  originalMinus: minus.map((n) => corpus.translit[n]).join(''),
  originalPlus: plus.map((n) => corpus.translit[n]).join(''),
  plant: '81/81 exact, both signs'
}));

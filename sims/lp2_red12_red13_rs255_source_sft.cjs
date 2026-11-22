'use strict';

/**
 * Independent original-source Reed-Solomon checksum gate.
 * Test physical LP2 p8's red12/black243 runes and the adjacent p3-p7
 * red13/black242 whole-word register as complete RS(255,k) codewords.
 * Node.js 22, CommonJS, Windows 11; read-only single-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const scrollWords = transcript.split('%').slice(3, 8).join('')
  .replace(/[\n\/&$]/g, '').split(/[-.]/)
  .map((text) => [...text].filter((r) => runeIndex.has(r)).map((r) => runeIndex.get(r)))
  .filter((word) => word.length > 0);
assert.equal(scrollWords.length, 255);
assert.deepEqual(scrollWords.flat(), corpus.pages.slice(3, 8).flatMap((p) => p.indices));

const redRuneOffsets = new Set();
let total = 0;
for (let p = 3; p <= 7; p++) {
  const pageInk = ink.pages.find((x) => x.page === p);
  for (const span of pageInk?.red_spans || []) {
    for (let j = 0; j < span.length; j++) redRuneOffsets.add(total + span.start + j);
  }
  total += corpus.pages[p].indices.length;
}
assert.equal(total, 1145);
let cursor = 0;
const redWordIndices = [];
for (let i = 0; i < scrollWords.length; i++) {
  const flags = scrollWords[i].map((_, j) => redRuneOffsets.has(cursor + j));
  assert(flags.every(Boolean) || flags.every((v) => !v));
  if (flags.every(Boolean)) redWordIndices.push(i);
  cursor += scrollWords[i].length;
}
assert.deepEqual(redWordIndices, [0, 1, 2, 22, 176, 177, 178, 179, 250, 251, 252, 253, 254]);
assert.equal(cursor, total);
const page8 = corpus.pages[8].indices;
assert.equal(page8.length, 255);
assert.equal(ink.pages.find((x) => x.page === 8).red_spans[0].length, 12);

/** @param {number} a @param {number} b @param {number} polynomial @returns {number} */
function gfMultiply(a, b, polynomial) {
  let answer = 0;
  for (; b !== 0; b >>>= 1) {
    if (b & 1) answer ^= a;
    const carry = a & 128;
    a = (a << 1) & 255;
    if (carry) a ^= polynomial & 255;
  }
  return answer;
}

/** @param {number} a @param {number} exponent @param {number} polynomial @returns {number} */
function gfPower(a, exponent, polynomial) {
  let out = 1;
  for (; exponent > 0; exponent >>>= 1) {
    if (exponent & 1) out = gfMultiply(out, a, polynomial);
    a = gfMultiply(a, a, polynomial);
  }
  return out;
}

/** @param {number[]} bytes @param {number} polynomial @param {number} generator @returns {number[]} */
function allSyndromes(bytes, polynomial, generator) {
  const out = [];
  let x = 1;
  for (let root = 0; root < 255; root++) {
    let y = 0;
    for (const byte of bytes) y = gfMultiply(y, x, polynomial) ^ byte;
    out.push(y);
    x = gfMultiply(x, generator, polynomial);
  }
  assert.equal(x, 1, 'generator must be primitive of order 255');
  return out;
}

/** @param {number[]} values @returns {number} */
function maxCyclicZeroRun(values) {
  let best = 0;
  for (let start = 0; start < 255; start++) {
    let n = 0;
    while (n < 255 && values[(start + n) % 255] === 0) n++;
    best = Math.max(best, n);
  }
  return best;
}

/**
 * Determine source-shaped parity bytes by GF(256) elimination.
 * The parity-byte positions can be a contiguous title or distributed red words.
 * @param {number[]} data
 * @param {number[]} parityLocations
 * @param {number} polynomial
 * @param {number} generator
 * @returns {number[]}
 */
function plantCodeword(data, parityLocations, polynomial, generator) {
  const bytes = [...data];
  const length = parityLocations.length;
  for (const position of parityLocations) bytes[position] = 0;
  const rows = [];
  for (let root = 0; root < length; root++) {
    const x = gfPower(generator, root, polynomial);
    let remainder = 0;
    for (const byte of bytes) remainder = gfMultiply(remainder, x, polynomial) ^ byte;
    const row = parityLocations.map((position) => gfPower(x, 254 - position, polynomial));
    row.push(remainder);
    rows.push(row);
  }
  for (let col = 0; col < length; col++) {
    const pivot = rows.findIndex((row, index) => index >= col && row[col] !== 0);
    assert.notEqual(pivot, -1, 'expected invertible parity interpolation');
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    const inverse = gfPower(rows[col][col], 254, polynomial);
    for (let j = col; j <= length; j++)
      rows[col][j] = gfMultiply(rows[col][j], inverse, polynomial);
    for (let row = 0; row < length; row++) {
      if (row === col) continue;
      const scale = rows[row][col];
      for (let j = col; j <= length; j++)
        rows[row][j] ^= gfMultiply(scale, rows[col][j], polynomial);
    }
  }
  for (let j = 0; j < length; j++) bytes[parityLocations[j]] = rows[j][length];
  assert(allSyndromes(bytes, polynomial, generator).slice(0, length).every((x) => x === 0));
  return bytes;
}

const cases = [
  { family: 'p8', name: 'GP index', bytes: page8 },
  { family: 'p8', name: 'GP ordinal', bytes: page8.map((x) => x + 1) },
  { family: 'p8', name: 'GP prime', bytes: page8.map((x) => corpus.prime[x]) },
  { family: 'scroll', name: 'first', bytes: scrollWords.map((w) => w[0]) },
  { family: 'scroll', name: 'last', bytes: scrollWords.map((w) => w.at(-1)) },
  { family: 'scroll', name: 'length', bytes: scrollWords.map((w) => w.length) },
  { family: 'scroll', name: 'index sum', bytes: scrollWords.map((w) => w.reduce((a, b) => a + b, 0) % 256) },
  { family: 'scroll', name: 'prime sum', bytes: scrollWords.map((w) => w.reduce((a, b) => a + corpus.prime[b], 0) % 256) },
  { family: 'scroll', name: 'BASE29', bytes: scrollWords.map((w) => w.reduce((a, b) => (29 * a + b) % 256, 0)) },
  { family: 'scroll', name: 'reversed BASE29', bytes: scrollWords.map((w) => [...w].reverse().reduce((a, b) => (29 * a + b) % 256, 0)) },
  { family: 'scroll', name: 'rune XOR', bytes: scrollWords.map((w) => w.reduce((a, b) => a ^ b, 0)) }
];
const fields = [[0x11d, 0x02], [0x11b, 0x03]];
let evaluations = 0;
let maxObservedRun = 0;
let maxObservedRoots = 0;
for (const trial of cases) {
  assert.equal(trial.bytes.length, 255);
  for (const [polynomial, generator] of fields) {
    for (const reverse of [false, true]) {
      const bytes = reverse ? [...trial.bytes].reverse() : trial.bytes;
      const values = allSyndromes(bytes, polynomial, generator);
      const zeroRoots = values.filter((x) => x === 0).length;
      const run = maxCyclicZeroRun(values);
      maxObservedRun = Math.max(maxObservedRun, run);
      maxObservedRoots = Math.max(maxObservedRoots, zeroRoots);
      assert(run < 2, 'unexpected original two-consecutive-root codeword: ' + trial.name);
      evaluations++;
      console.log(JSON.stringify({
        family: trial.family,
        map: trial.name,
        field: '0x' + polynomial.toString(16),
        reverse,
        zeroRoots,
        longestConsecutiveRootRun: run
      }));
    }
  }
}
assert.equal(evaluations, 44);
assert.equal(maxObservedRun, 1);
assert.equal(maxObservedRoots, 3);

// Independently constructed genuine positives at the exact original red positions.
// These affirm the test can accept both 12/243 and 13/242 source-shaped RS codes.
const scrollData = cases.find((x) => x.name === 'index sum').bytes;
for (const [polynomial, generator] of fields) {
  for (const [label, data, positions, flip] of [
    ['p8 red12', page8, Array.from({ length: 12 }, (_, i) => i), 254],
    ['scroll red13', scrollData, redWordIndices, 5]
  ]) {
    const planted = plantCodeword(data, positions, polynomial, generator);
    const length = positions.length;
    assert.equal(maxCyclicZeroRun(allSyndromes(planted, polynomial, generator)) >= length, true);
    const damaged = [...planted];
    damaged[flip] ^= 1;
    assert.notEqual(allSyndromes(damaged, polynomial, generator)[0], 0);
    console.log('POSITIVE AND SINGLE-BYTE CORRUPTION PASS ' + label + ' GF(0x' + polynomial.toString(16) + ')');
  }
}
console.log('PASS: 44 original encodings, longest consecutive zero-syndrome run = ' +
  maxObservedRun + ', maximum zero roots = ' + maxObservedRoots +
  '; original p8 red12 and scroll red13 cannot be the tested unmodified conventional RS codewords.');

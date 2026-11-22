'use strict';
/**
 * Original LP2 255 printed scroll words -> 255 physical-p8 rune cells.
 * Complete all-secret GF(29) Horner/rolling-word-hash necessary-condition test.
 *
 * A word's ordered runes are folded at one fixed base b in GP29. All 29 input
 * symbol weights, all 29 output symbol labels, 12 word-length corrections,
 * five original source-page corrections and one red-ink correction are secret.
 * A true decoding requires an injective output labeling.
 *
 * For every b=0..28 and both literal source-page clocks, solve all 255
 * original linear relations. An output labeling forced constant for every
 * nullspace vector is an exact mathematical contradiction, irrespective of
 * the hidden weights and offsets. 29 synthetic positive plants independently
 * demonstrate recovery of a genuine reversible output alphabet.
 *
 * The p7 GF4 + proposed radix59 p50 correction is provisional; this SFT
 * rejects a precise Horner consumer CONDITIONAL on that frozen registration.
 * No unknown manuscript plaintext or authenticated cipher is claimed.
 *
 * Windows 11 / Node 22: node sims/lp2_scroll255_horner_allsecret_original_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const resourceDir = path.join(__dirname, '..', 'resources', 'liber-primus');

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(resourceDir, name), 'utf8');
}
/** @param {number} value @returns {number} */
function mod(value) {
  return (value % 29 + 29) % 29;
}
/** @param {number} value @returns {number} */
function inverse(value) {
  for (let n = 1; n < 29; n++) {
    if (mod(n * value) === 1) return n;
  }
  throw new Error('A nonzero GF29 pivot has no inverse');
}

const inputText = new Map([
  ['lp2-corpus.json', read('lp2-corpus.json')],
  ['lp2-transcription.txt', read('lp2-transcription.txt')],
  ['lp2-grid-256.json', read('lp2-grid-256.json')],
  ['lp2-ink-annotations.json', read('lp2-ink-annotations.json')]
]);
const corpus = JSON.parse(inputText.get('lp2-corpus.json'));
const grid = JSON.parse(inputText.get('lp2-grid-256.json'));
const ink = JSON.parse(inputText.get('lp2-ink-annotations.json'));
const sections = inputText.get('lp2-transcription.txt').split('%');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @type {number[][]} */
const words = [];
let pending = [];
for (let page = 3; page <= 7; page++) {
  for (const char of sections[page]) {
    if (runeIndex.has(char)) {
      pending.push(runeIndex.get(char));
    } else if ((char === '-' || char === '.') && pending.length) {
      words.push(pending);
      pending = [];
    }
  }
}
if (pending.length) words.push(pending);
assert.equal(words.length, 255);
assert.deepEqual(words.flat(), corpus.pages.slice(3, 8).flatMap(p => p.indices));
assert.equal(words.flat().length, 1145);
assert(words.every(w => w.length >= 1 && w.length <= 12));

const redFive = [
  [23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]
];
assert.deepEqual(corpus.pages[7].indices.slice(194), redFive.flat());
const products = redFive.map(w => w.reduce((acc, value) => mod(acc * value), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);

/** @param {number} a @param {number} b @returns {number} */
function gf4multiply(a, b) {
  let result = 0;
  for (let bit = 0; bit < 2; bit++) {
    if ((b >>> bit) & 1) result ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return result;
}
const state = [products[4] % 4, 0, 0, 0];
const addresses = [];
for (let position = 0; position < 255; position++) {
  addresses.push(state.reduce((acc, digit) => acc * 4 + digit, 0));
  let feedback = 0;
  for (let tap = 0; tap < 4; tap++) {
    feedback ^= gf4multiply(state[tap], products[tap] % 4);
  }
  state.splice(0, 4, state[1], state[2], state[3], feedback);
}
assert.equal(new Set(addresses).size, 255);
assert.deepEqual(addresses.slice(0, 8), [128, 1, 7, 30, 123, 236, 177, 199]);

const radix59 = grid.alphabet.replace('f', '');
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const table = tokens.map(token =>
  59 * radix59.indexOf(token[0]) + radix59.indexOf(token[1]));
assert(table.every(value => value >= 0 && value <= 251));
const originalCipher = corpus.pages[8].indices;
assert.equal(originalCipher.length, 255);
const corrected = originalCipher.map((value, i) =>
  mod(value + table[addresses[i]]));
const collisionPairs = [[47, 240], [48, 231], [235, 236], [88, 179]];
assert.deepEqual(collisionPairs.map(([a, b]) => [corrected[a], corrected[b]]),
  [[20, 20], [8, 8], [2, 2], [9, 9]]);
assert.equal(new Set(corrected).size, 29);

const pageCuts = [];
let total = 0;
for (let page = 3; page <= 7; page++) {
  total += corpus.pages[page].indices.length;
  pageCuts.push(total);
}
assert.equal(total, 1145);
const redOffsets = new Set();
let offset = 0;
for (let page = 3; page <= 7; page++) {
  for (const span of ink.pages.find(p => p.page === page)?.red_spans || []) {
    for (let k = 0; k < span.length; k++) {
      redOffsets.add(offset + span.start + k);
    }
  }
  offset += corpus.pages[page].indices.length;
}
assert.equal(offset, 1145);

const sourceWordPages = [];
const sourceWordRed = [];
let cursor = 0;
for (const word of words) {
  const first = pageCuts.findIndex(end => cursor < end);
  const last = pageCuts.findIndex(end => cursor + word.length - 1 < end);
  assert(first >= 0 && last >= 0);
  sourceWordPages.push([first, last]);
  sourceWordRed.push(redOffsets.has(cursor));
  cursor += word.length;
}
assert.equal(cursor, 1145);

/**
 * Create the complete 255 x 76 homogeneous GF29 relation matrix.
 *
 * Slots: secret input glyph weights [0..28], secret output labels [29..57],
 * secret per-length offsets [58..69], per-source-page [70..74], ink [75].
 * @param {number} base
 * @param {number[]} outputs
 * @param {'start'|'end'} pageClock
 * @returns {number[][]}
 */
function equations(base, outputs, pageClock) {
  const matrix = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const row = Array(76).fill(0);
    let power = 1;
    for (let j = word.length - 1; j >= 0; j--) {
      row[word[j]] = mod(row[word[j]] + power);
      power = mod(power * base);
    }
    row[29 + outputs[i]] = mod(row[29 + outputs[i]] - 1);
    row[58 + word.length - 1] = mod(row[58 + word.length - 1] + 1);
    row[70 + sourceWordPages[i][pageClock === 'start' ? 0 : 1]] = 1;
    if (sourceWordRed[i]) row[75] = 1;
    matrix.push(row);
  }
  return matrix;
}

/**
 * Exact reduced-row-echelon GF29 elimination and complete nullspace check.
 * @param {number[][]} sourceRows
 * @returns {{ rank:number, nullity:number, distinctOutputAllowed:boolean,
 *            pivots:number[], freeColumns:number[] }}
 */
function analyze(sourceRows) {
  const a = sourceRows.map(row => row.slice());
  const rows = a.length;
  const columns = a[0].length;
  const pivots = [];
  let rank = 0;
  for (let col = 0; col < columns; col++) {
    let p = rank;
    while (p < rows && a[p][col] === 0) p++;
    if (p === rows) continue;
    [a[rank], a[p]] = [a[p], a[rank]];
    const q = inverse(a[rank][col]);
    for (let j = col; j < columns; j++) a[rank][j] = mod(a[rank][j] * q);
    for (let row = 0; row < rows; row++) {
      if (row === rank || a[row][col] === 0) continue;
      const factor = a[row][col];
      for (let j = col; j < columns; j++) {
        a[row][j] = mod(a[row][j] - factor * a[rank][j]);
      }
    }
    pivots.push(col);
    rank++;
  }

  const pivotSet = new Set(pivots);
  const freeColumns = [];
  for (let col = 0; col < columns; col++) {
    if (!pivotSet.has(col)) freeColumns.push(col);
  }

  // The homogeneous system admits a nonconstant secret output labeling
  // only if at least one nullspace basis vector has unequal output labels.
  let distinctOutputAllowed = false;
  for (const free of freeColumns) {
    const v = Array(columns).fill(0);
    v[free] = 1;
    for (let i = 0; i < rank; i++) v[pivots[i]] = mod(-a[i][free]);
    for (const sourceRow of sourceRows) {
      assert.equal(mod(sourceRow.reduce(
        (sum, coeff, j) => sum + coeff * v[j], 0)), 0);
    }
    if (v.slice(30, 58).some(value => value !== v[29])) {
      distinctOutputAllowed = true;
    }
  }
  return { rank, nullity: columns - rank, distinctOutputAllowed,
    pivots, freeColumns };
}

/**
 * Genuine independent inverse test: generate all 255 outputs under a fully
 * secret 29-symbol input table, a 29-way affine output permutation and
 * source-shaped length/page/ink offsets at one declared Horner base.
 * @param {number} base
 * @param {'start'|'end'} clock
 * @returns {number[]}
 */
function plant(base, clock) {
  const inputLabels = Array.from({ length: 29 }, (_, r) =>
    mod(5 + 7 * r + 11 * r * r));
  const wordLengthOffsets = Array.from({ length: 12 }, (_, j) =>
    mod(4 * (j + 1) + 3));
  const pageOffsets = Array.from({ length: 5 }, (_, j) =>
    mod(9 * j + 5));
  const redOffset = 17;
  const outputLabels = Array.from({ length: 29 }, (_, y) => mod(7 * y + 11));
  assert.equal(new Set(outputLabels).size, 29);
  const result = words.map((word, i) => {
    let sum = 0;
    for (const r of word) sum = mod(base * sum + inputLabels[r]);
    sum = mod(sum + wordLengthOffsets[word.length - 1]
      + pageOffsets[sourceWordPages[i][clock === 'start' ? 0 : 1]]
      + (sourceWordRed[i] ? redOffset : 0));
    return mod((sum - 11) * inverse(7));
  });
  const secret = [...inputLabels, ...outputLabels, ...wordLengthOffsets,
    ...pageOffsets, redOffset];
  assert.equal(secret.length, 76);
  for (const row of equations(base, result, clock)) {
    assert.equal(mod(row.reduce((sum, coeff, i) =>
      sum + coeff * secret[i], 0)), 0);
  }
  return result;
}

console.log('ORIGINAL_SOURCE ' + JSON.stringify({
  pages: 'p3-p7 source -> p8 receiver', wholeWords: words.length,
  originalWordRunes: total, originalP8Runes: originalCipher.length,
  provisionalFullPeriodGF4States: new Set(addresses).size,
  fixedCollisionPairs: collisionPairs.map(([a, b]) => [corrected[a], corrected[b]]),
  originalCorrectedOutputAlphabet: new Set(corrected).size,
  sourceHashes: Object.fromEntries([...inputText].map(([name, contents]) =>
    [name, crypto.createHash('sha256').update(contents).digest('hex')]))
}));

for (const clock of ['start', 'end']) {
  for (let base = 0; base < 29; base++) {
    const original = analyze(equations(base, corrected, clock));
    assert.equal(original.rank, 73);
    assert.equal(original.nullity, 3);
    assert.equal(original.distinctOutputAllowed, false);
    const positive = analyze(equations(base, plant(base, clock), clock));
    assert.equal(positive.distinctOutputAllowed, true);
    console.log('HORNERRANK ' + JSON.stringify({
      clock, base, originalRank: original.rank,
      originalNullity: original.nullity,
      originalDistinctOutputAlphabetPossible: original.distinctOutputAllowed,
      originalFreeColumns: original.freeColumns,
      nativeCompatiblePlantOutputAlphabetPossible: positive.distinctOutputAllowed
    }));
  }
}
console.log('PASS: all 58 source-original 255-word Horner families force the 29 output glyphs to one label.');
console.log('PASS: all 58 independently encoded source-shaped positives retain a valid nonconstant output alphabet.');
console.log('CONCLUSION: No source-registered stationary Horner GF29 word checksum, irrespective of 29 secret input/output labels, 12 true-length keys, five page keys, one red key, any base 0..28 or either page clock. The proposed GF4/radix59 registration itself remains unverified; zero unknown LP2 plaintext.');

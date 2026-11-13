/**
 * Source-color Hill-square hypothesis on original LP2, one runnable test file.
 *
 * The 225 red GP29 runes on 58 original pages supply exactly a 15x15 matrix.
 * This tests a frozen, reversible 15-rune linear transform on either all
 * unsolved runes or only black runes. Matrix rows are original source order.
 *
 * From repository root, execute with Node.js:
 *   node sims/lp2_red225_hill_square_sft.cjs
 *
 * This is a bounded hypothesis, not a claimed decipherment.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));
const p = 29;
const width = 15;

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % p) + p) % p;
}

/** @param {number} x @returns {number} */
function reciprocal(x) {
  for (let j = 1; j < p; j += 1) {
    if (mod(x * j) === 1) return j;
  }
  throw new Error('Noninvertible pivot');
}

/** @param {number[][]} input @returns {number[][] | null} */
function invert(input) {
  const n = input.length;
  const m = input.map((row, i) => row.concat(Array.from({ length: n }, (_, j) => Number(i === j))));
  for (let k = 0; k < n; k += 1) {
    let pivot = k;
    while (pivot < n && m[pivot][k] === 0) pivot += 1;
    if (pivot === n) return null;
    [m[k], m[pivot]] = [m[pivot], m[k]];
    const mul = reciprocal(m[k][k]);
    for (let j = 0; j < 2 * n; j += 1) m[k][j] = mod(m[k][j] * mul);
    for (let i = 0; i < n; i += 1) {
      if (i === k) continue;
      const factor = m[i][k];
      for (let j = 0; j < 2 * n; j += 1) m[i][j] = mod(m[i][j] - factor * m[k][j]);
    }
  }
  return m.map((row) => row.slice(n));
}

/** @param {number[][]} a @returns {number[][]} */
function transpose(a) {
  return a[0].map((_, j) => a.map((row) => row[j]));
}

/** @param {number[][]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  return a.map((row) => mod(row.reduce((sum, v, j) => sum + v * b[j], 0)));
}

/** @param {number[][]} a @param {number[]} data @returns {number[]} */
function blocks(a, data) {
  const answer = [];
  const step = a.length;
  for (let i = 0; i + step <= data.length; i += step) {
    answer.push(...multiply(a, data.slice(i, i + step)));
  }
  return answer;
}

/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const frequency = new Array(p).fill(0);
  for (const value of values) frequency[value] += 1;
  return frequency.reduce((sum, count) => sum + count * (count - 1), 0) / (values.length * (values.length - 1));
}

const red = [];
const unknown = [];
const black = [];
for (const page of corpus.pages) {
  const annotations = ink.pages.find((item) => item.page === page.page);
  const redPositions = new Set();
  for (const span of annotations?.red_spans || []) {
    const source = Array.from(span.runes);
    assert.equal(source.length, span.length);
    for (let j = 0; j < span.length; j += 1) {
      const at = span.start + j;
      assert.equal(corpus.runes[page.indices[at]], source[j], 'Source ink/transcription disagreement');
      assert.equal(redPositions.has(at), false, 'Overlapping red spans');
      redPositions.add(at);
      red.push(page.indices[at]);
    }
  }
  if (page.page < 56) {
    unknown.push(...page.indices);
    for (let j = 0; j < page.indices.length; j += 1) {
      if (!redPositions.has(j)) black.push(page.indices[j]);
    }
  }
}
assert.equal(red.length, 225);
assert.equal(unknown.length, 12956);
assert.equal(black.length, 12743);
assert.equal(corpus.pages[57].indices.length, 95);
const plant = corpus.pages[57].indices.slice(0, 90);
assert.equal(plant.length % width, 0);

const results = [];
for (const { label, make } of [
  { label: 'GP29 index', make: (v) => v },
  { label: 'GP prime mod29', make: (v) => corpus.prime[v] % p }
]) {
  const key = Array.from({ length: width }, (_, i) => red.slice(i * width, (i + 1) * width).map(make));
  const inverse = invert(key);
  assert.ok(inverse, 'Original 15x15 red matrix must be nonsingular');
  assert.deepEqual(blocks(inverse, blocks(key, plant)), plant, 'Source-native planted 90-rune inverse');
  assert.deepEqual(blocks(key, blocks(inverse, plant)), plant, 'Source-native planted 90-rune forward');
  for (const [transform, matrix] of [
    ['key', key],
    ['inverse', inverse],
    ['transpose', transpose(key)],
    ['inverse transpose', transpose(inverse)]
  ]) {
    for (const [target, ciphertext] of [['black only', black], ['all unknown', unknown]]) {
      const plaintext = blocks(matrix, ciphertext);
      results.push({
        source: label,
        transform,
        target,
        runes: plaintext.length,
        ioc: Number(coincidence(plaintext).toFixed(8)),
        first15: plaintext.slice(0, 15).map((i) => corpus.translit[i]).join('-')
      });
    }
  }
}

/**
 * A second source-specific architecture: nine 5x5 red submatrices,
 * allocated to the nine original visual chapters in manuscript order.
 */
const chapterRanges = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];
const chapters = chapterRanges.map(([first, last]) => {
  const full = [];
  const blackOnly = [];
  for (let n = first; n <= last; n += 1) {
    const page = corpus.pages[n];
    const marked = new Set();
    const record = ink.pages.find((item) => item.page === n);
    for (const span of record?.red_spans || []) {
      for (let j = span.start; j < span.start + span.length; j += 1) marked.add(j);
    }
    full.push(...page.indices);
    blackOnly.push(...page.indices.filter((_, i) => !marked.has(i)));
  }
  return { full, blackOnly };
});
assert.deepEqual(chapters.map((chapter) => chapter.full.length), [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

const chapterModels = [];
for (const { label, make } of [
  { label: 'GP29 index', make: (v) => v },
  { label: 'GP prime mod29', make: (v) => corpus.prime[v] % p }
]) {
  const squareKeys = Array.from({ length: 9 }, (_, j) =>
    Array.from({ length: 5 }, (_, r) => red.slice(25 * j + 5 * r, 25 * j + 5 * r + 5).map(make)));
  const squareInverses = squareKeys.map(invert);
  const validCount = squareInverses.filter((item) => item !== null).length;
  assert.equal(validCount, label === 'GP29 index' ? 9 : 8);
  for (let j = 0; j < 9; j += 1) {
    if (!squareInverses[j]) continue;
    assert.deepEqual(blocks(squareInverses[j], blocks(squareKeys[j], plant)), plant, 'Nine-square positive plant');
  }
  for (const [transform, matrices] of [
    ['key', squareKeys],
    ['inverse', squareInverses],
    ['transpose', squareKeys.map(transpose)],
    ['inverse transpose', squareInverses.map((item) => item && transpose(item))]
  ]) {
    for (const [target, field] of [['black only', 'blackOnly'], ['all unknown', 'full']]) {
      const candidate = [];
      const chaptersUsed = [];
      const chapterIocs = [];
      for (let j = 0; j < 9; j += 1) {
        // A singular 5x5 matrix cannot be a reversible Hill key.
        if (!squareInverses[j]) continue;
        const out = blocks(matrices[j], chapters[j][field]);
        candidate.push(...out);
        chaptersUsed.push(j + 1);
        chapterIocs.push(Number(coincidence(out).toFixed(8)));
      }
      chapterModels.push({
        source: label,
        transform,
        target,
        chaptersUsed,
        runes: candidate.length,
        ioc: Number(coincidence(candidate).toFixed(8)),
        chapterIocRange: [Math.min(...chapterIocs), Math.max(...chapterIocs)]
      });
    }
  }
}
const fiveExtrema = chapterModels.map((item) => item.ioc);

const extrema = results.map((x) => x.ioc);
console.log(JSON.stringify({
  original: { red: red.length, unknown: unknown.length, black: black.length },
  originalIoc: { black: Number(coincidence(black).toFixed(8)), unknown: Number(coincidence(unknown).toFixed(8)), solvedP57: Number(coincidence(corpus.pages[57].indices).toFixed(8)) },
  originalDecodedIocRange: [Math.min(...extrema), Math.max(...extrema)],
  plantedGPNativeRunesRecoveredPerKey: 90,
  models: results,
  nineFiveByFive: { iocRange: [Math.min(...fiveExtrema), Math.max(...fiveExtrema)], models: chapterModels }
}, null, 2));

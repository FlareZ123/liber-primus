'use strict';

/**
 * LP2 p36–38, complete 553-rune five-lane principal-minor square inverse.
 *
 * Five printed red labels 1..5 select lanes. The independently documented
 * 2014 Stage10 order-five squares provide two fixed public matrices. At
 * each rune ordinal, remove rows and columns of finished lanes rather than
 * inventing a 98-symbol padding stream. Both full numeric matrices and their
 * inverses are tested as operators; no ciphertext-derived keys or phases.
 *
 * Read-only Windows 11 / Node.js 22 single-file test:
 * node sims/lp2_cuneiform_fiveunit_variable_active_hill_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {originalParagraphs} = require('./lp2_pp36_38_numbered_aphorism_crib_sft.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const matrices = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\n\s*\n/).map(block => block.trim().split(/\s+/).map(Number));
const words = originalParagraphs(read('resources/liber-primus/lp2-transcription.txt'));
const lens = words.map(w => w.reduce((s, n) => s + n, 0));
assert.deepEqual(lens, [139, 91, 98, 96, 129]);
assert.equal(lens.reduce((s, n) => s + n, 0), 553);
assert.equal(words.reduce((s, w) => s + w.length, 0), 122);
assert.deepEqual(matrices.map(x => x.length), [25, 49, 25]);
assert.deepEqual(solved.runes, corpus.runes);

const p = corpus.pages;
const original = [
  p[36].indices.slice(99, 238),
  p[37].indices.slice(0, 91),
  p[37].indices.slice(91, 189),
  p[37].indices.slice(189, 228).concat(p[38].indices.slice(0, 57)),
  p[38].indices.slice(57, 186),
];
assert.deepEqual(original.map(x => x.length), lens);

const MOD = 29;
/** @param {number} x @returns {number} */
const mod = x => (x % MOD + MOD) % MOD;
/** @param {number[][]} rows @returns {number[][]} */
function inverse(rows) {
  const n = rows.length;
  const a = rows.map((row, i) => row.map(mod).concat(
    Array.from({length: n}, (_, j) => Number(i === j))));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    assert(pivot < n, 'source matrix has a singular active principal submatrix');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const inv = Array.from({length: MOD}, (_, j) => j)
      .find(x => mod(x * a[col][col]) === 1);
    assert.notEqual(inv, undefined);
    for (let k = 0; k < 2 * n; k++) a[col][k] = mod(a[col][k] * inv);
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const v = a[row][col];
      for (let k = 0; k < 2 * n; k++) a[row][k] = mod(a[row][k] - v * a[col][k]);
    }
  }
  return a.map(row => row.slice(n));
}
/** @param {number[][]} a @param {number[]} v @returns {number[]} */
function mul(a, v) {
  return a.map(row => mod(row.reduce((s, x, j) => s + x * v[j], 0)));
}
/** @param {number[]} cells @returns {number[][]} */
function fiveMatrix(cells) {
  assert.equal(cells.length, 25);
  return Array.from({length: 5}, (_, i) => cells.slice(5 * i, 5 * i + 5));
}
/** @param {number[][]} square @param {number[][]} streams @param {boolean} invert @returns {number[][]} */
function transform(square, streams, invert) {
  assert.deepEqual(streams.map(x => x.length), lens);
  const out = lens.map(() => []);
  for (let j = 0; j < Math.max(...lens); j++) {
    const active = lens.map((n, i) => n > j ? i : -1).filter(i => i >= 0);
    const key = active.map(i => active.map(k => square[i][k]));
    const operator = invert ? inverse(key) : key;
    const inputs = active.map(i => streams[i][j]);
    const outputs = mul(operator, inputs);
    active.forEach((i, k) => out[i].push(outputs[k]));
  }
  return out;
}
/** @param {number[]} tape @returns {number} */
function ioc(tape) {
  const counts = Array(MOD).fill(0);
  for (const x of tape) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (tape.length * (tape.length - 1));
}
/** @param {number[][]} streams @returns {number} */
function runeDoublets(streams) {
  return streams.reduce((sum, row) => sum + row.reduce(
    (s, x, i) => s + Number(i > 0 && x === row[i - 1]), 0), 0);
}
/** @param {number[]} tape @returns {number[][]} */
function splitFive(tape) {
  let i = 0;
  return lens.map(n => {const row = tape.slice(i, i + n); i += n; return row;});
}
const glyphValues = new Map(corpus.runes.map((r, i) => [r, i]));
const known = solved.sections.flatMap(section =>
  [...section.source_text].map(r => glyphValues.get(r)).filter(v => v !== undefined));
assert(known.length >= 553);
const knownPlant = splitFive(known.slice(0, 553));
assert.deepEqual(knownPlant.map(x => x.length), lens);

const clockSegments = [0, 91, 96, 98, 129, 139];
const expectedActive = [5, 4, 3, 2, 1];
const activeLengths = expectedActive.map((n, j) =>
  (clockSegments[j + 1] - clockSegments[j]) * n);
assert.deepEqual(activeLengths, [455, 20, 6, 62, 10]);
assert.equal(activeLengths.reduce((s, n) => s + n, 0), 553);
assert.equal(runeDoublets(original), 1, 
  'only one adjacent original equal pair across all five printed units');
const sourceControlIoc = ioc(knownPlant.flat());
assert(sourceControlIoc > 0.05);

const results = [];
for (const [index, label] of [[0, '3301'], [2, '1033']]) {
  const square = fiveMatrix(matrices[index]);
  const expectedMinors = label === '3301' ? [10, 6, 6, 7, 28] : [3, 17, 7, 27, 11];
  // Nonzero determinants are checked by inverse() at every exact active column.
  for (const invert of [true, false]) {
    const decoded = transform(square, original, invert);
    const replay = transform(square, decoded, !invert);
    assert.deepEqual(replay, original, 'original 553-rune replay failed');
    const plantedCipher = transform(square, knownPlant, !invert);
    const recoveredPlant = transform(square, plantedCipher, invert);
    assert.deepEqual(recoveredPlant, knownPlant, 'authentic source-native 553-rune control failed');
    const value = ioc(decoded.flat());
    assert(value < 0.041, 'candidate requires review against independent native language');
    results.push({
      square: label, operator: invert ? 'inverse' : 'direct',
      preservedRunes: decoded.flat().length,
      overallIoC: Number(value.toFixed(11)),
      unitIoCs: decoded.map(row => Number(ioc(row).toFixed(8))),
      outputFirst24: decoded.map(row => row.slice(0, 24).map(x => corpus.translit[x]).join(' ')),
      sourceNativePositiveIoC: Number(sourceControlIoc.toFixed(11)),
      allOriginalReplay: true, allKnownPlantRecovery: true,
      activeMinorDeterminantsMod29: expectedMinors,
    });
  }
}
assert.deepEqual(results.map(r => r.overallIoC),
  [0.03391251933, 0.03553738501, 0.03398458998, 0.03433183951]);
console.log(JSON.stringify({
  classification: 'FOUR COMPLETE FROZEN ORIGINAL-INPUT INVERSES; NO PLAINTEXT',
  numberedLens: lens, activeClockSegments: clockSegments, activeRuneCounts: activeLengths,
  fullInputRunes: 553, solvedNativeSampleIoC: sourceControlIoc, results,
}, null, 2));

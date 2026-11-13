'use strict';

/**
 * Source-original all-secret key-reuse bound across nine visual chapters.
 * Run: node sims/lp2_chapteroffset_allsecret_reuse_gate.cjs
 * Node.js 20+, CommonJS, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(root, filename), 'utf8').replace(/\r\n/g, '\n');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const cuts = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const chapters = cuts.map(([start, end]) =>
  corpus.pages.slice(start, end + 1).flatMap(page => page.indices));
const lengths = chapters.map(page => page.length);
const originalTotal = lengths.reduce((sum, n) => sum + n, 0);
assert.deepEqual(lengths,
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.equal(originalTotal, 12956);
assert.equal(corpus.pages[50].indices.length, 0);

/**
 * Any arbitrary unknown bijection reused at a given chapter-local rune
 * offset preserves equality for each pair of chapters at that offset.
 *
 * @param {number[][]} rows
 * @returns {{ matches:number, comparisons:number, rate:number }}
 */
function equalities(rows) {
  let matches = 0;
  let comparisons = 0;
  for (let offset = 0; offset < Math.max(...rows.map(r => r.length)); offset++) {
    const counts = new Uint16Array(29);
    let present = 0;
    for (const row of rows) {
      if (offset < row.length) {
        assert(Number.isInteger(row[offset]) && row[offset] >= 0 &&
          row[offset] <= 28);
        counts[row[offset]]++;
        present++;
      }
    }
    comparisons += present * (present - 1) / 2;
    for (const count of counts) matches += count * (count - 1) / 2;
  }
  return { matches, comparisons, rate: matches / comparisons };
}

/** @param {number[]} full @param {number} origin @returns {number[][]} */
function overlay(full, origin) {
  let offset = origin;
  return lengths.map(length => {
    const piece = full.slice(offset, offset + length);
    assert.equal(piece.length, length);
    offset += length;
    return piece;
  });
}

/** Arbitrary secret alphabet per chapter-local rune position. */
function secretAlphabet(rows) {
  return rows.map(row => row.map((x, offset) =>
    (x * 11 + offset * 7 + 5) % 29));
}

const original = equalities(chapters);
assert.deepEqual([original.matches, original.comparisons], [1161, 35551]);
assert.deepEqual(equalities(secretAlphabet(chapters)), original);

// Source-native GP transliteration is calibrated independently to actual
// solved LP1 and verifies all 95 original printed clear p57 runes.
const p57 = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split('### 57\n')[1];
assert.equal(typeof p57, 'string');
assert.deepEqual(encodeSourceNativeGP(p57), corpus.pages[57].indices);

const controls = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 1608, 1944],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 391, 2024],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 2429, 2014]
].map(([name, file, expectedWindows, expectedMinimumMatches]) => {
  const source = encodeSourceNativeGP(read(file));
  let windows = 0;
  let minMatches = Infinity;
  let atOrBelow = 0;
  for (let start = 0; start + originalTotal <= source.length; start += 127) {
    const candidate = equalities(overlay(source, start));
    assert.equal(candidate.comparisons, original.comparisons);
    minMatches = Math.min(minMatches, candidate.matches);
    if (candidate.matches <= original.matches) atOrBelow++;
    windows++;
  }
  assert.equal(windows, expectedWindows, name + ' window count');
  assert.equal(minMatches, expectedMinimumMatches, name + ' fixed minimum');
  assert.equal(atOrBelow, 0, name + ' all windows above source-original');
  const plant = overlay(source, 0);
  assert.deepEqual(equalities(secretAlphabet(plant)), equalities(plant));
  return { name, sourceRunes: source.length, windows,
    minimumMatches: minMatches,
    minimumRate: minMatches / original.comparisons, atOrBelow };
});

assert.equal(controls.reduce((n, x) => n + x.windows, 0), 4428);
console.log(JSON.stringify({
  status: 'conditional all-secret chapter-offset reuse exclusion; no plaintext',
  chapterLengths: lengths, unknownRunes: originalTotal,
  original, sourceNativeSolvedP57Exact: 95,
  positiveSecretBijectionPlant: true,
  nativeControlWindowStride: 127, controls
}, null, 2));

'use strict';

/**
 * Exact source-level cross-chapter LPAD alignment test for the 2014 Liber Primus.
 * Classification: exploratory alignment and bounded negative original inverses.
 * Node.js 22, CommonJS, no external dependencies. Run from repository root:
 *   node sims/lp2_lpad255_flora3315_crosschapter_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const source = name => fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8');
const corpus = JSON.parse(source('lp2-corpus.json'));
const ink = JSON.parse(source('lp2-ink-annotations.json'));
const physicalPages = source('lp2-transcription.txt').replace(/\r/g, '').split('%');
const GP = 29;
const WIDTH = 13;

/** @param {number} n @returns {number} */
const mod29 = n => ((n % GP) + GP) % GP;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(GP).fill(0);
  for (const v of a) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a @returns {string} */
function multiplicitySignature(a) {
  const counts = new Map();
  for (const v of a) counts.set(v, (counts.get(v) || 0) + 1);
  return [...counts.values()].sort((x, y) => y - x).join(',');
}
/** @param {number[]} a @returns {string} */
const render = a => a.map(n => corpus.translit[n]).join('');

const body = physicalPages.slice(3, 8).join('')
  .replace(/[\/\r\n]/g, '').replace(/[&$]/g, '.');
const words = body.split(/[.-]/).filter(Boolean)
  .map(word => [...word].map(r => corpus.runes.indexOf(r)));
assert(words.every(w => w.length > 0 && w.every(n => n >= 0)));
assert.equal(words.length, 255);
assert.equal(words.flat().length, 1145);
assert.equal(Math.max(...words.map(w => w.length)), 12);
assert.deepEqual(words.flat(), corpus.pages.slice(3, 8).flatMap(p => p.indices));

const redStarts = ink.pages.filter(p => p.page >= 3 && p.page <= 7)
  .flatMap(p => (p.red_spans || []).map(span =>
    corpus.translit[corpus.pages[p.page].indices[span.start]]));
assert.equal(redStarts.join(''), 'LPAD');
const p40Ink = ink.pages.find(p => p.page === 40);
assert.equal(p40Ink.red_spans[0].start, 0);
assert.equal(p40Ink.red_spans[0].length, 8);
assert.equal(corpus.pages[40].indices[0], 0);
assert.equal(corpus.runes[0], 'ᚠ');

const rows = words.map(w => Array(WIDTH - w.length).fill(0).concat(w));
const pad = rows.flat();
assert.equal(rows.length, 255);
assert.equal(pad.length, 3315);
const originalRunes = corpus.pages.filter(p => p.page >= 40 && p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(originalRunes.length, 3316);
assert.equal(originalRunes[0], 0);
const target = originalRunes.slice(1);
assert.equal(target.length, pad.length);

const matches = target.filter((v, i) => v === pad[i]).length;
assert.equal(matches, 109);
assert.equal(pad.filter(x => x === 0).length, 2196);
const observed = [];
const native = corpus.pages[57].indices;
assert.equal(native.length, 95);

for (const sign of [-1, 1]) {
  const plaintext = target.map((v, i) => mod29(v + sign * pad[i]));
  assert.deepEqual(plaintext.map((v, i) => mod29(v - sign * pad[i])), target);
  const planted = target.map((_, i) => native[i % native.length]);
  const plantedCipher = planted.map((v, i) => mod29(v - sign * pad[i]));
  assert.deepEqual(plantedCipher.map((v, i) => mod29(v + sign * pad[i])), planted);
  observed.push({
    direction: sign < 0 ? 'subtract' : 'add',
    ioc: ioc(plaintext),
    nativePositive: planted.length,
    first80: render(plaintext.slice(0, 80))
  });
}
assert(Math.abs(observed[0].ioc - 0.034401155662116295) < 1e-12);
assert(Math.abs(observed[1].ioc - 0.03439259924758167) < 1e-12);

// This test is stronger than testing a few shifts. Any fixed permutation of
// a row's 13 positions and any bijection of its 29-symbol alphabet preserve
// the multiset of symbol multiplicities in that row. Both may be independently
// secret and different in every row. Failing equality excludes that whole
// row-local permutation+substitution family under this specific alignment.
let partitionMatches = 0;
let directRowMatches = 0;
let maxBestCaesarMatch = 0;
let sumBestCaesarMatches = 0;
let paddedRowsWithAtLeastFiveCopies = 0;
for (let row = 0; row < rows.length; row++) {
  const x = rows[row];
  const y = target.slice(row * WIDTH, (row + 1) * WIDTH);
  assert.equal(y.length, WIDTH);
  if (multiplicitySignature(x) === multiplicitySignature(y)) partitionMatches++;
  if (x.every((v, j) => v === y[j])) directRowMatches++;
  const mostCommon = Math.max(...Array.from(new Set(x), v =>
    x.filter(w => w === v).length));
  if (mostCommon >= 5) paddedRowsWithAtLeastFiveCopies++;
  let best = 0;
  for (let k = 0; k < GP; k++) {
    best = Math.max(best, x.filter((v, j) => mod29(v + k) === y[j]).length);
  }
  maxBestCaesarMatch = Math.max(maxBestCaesarMatch, best);
  sumBestCaesarMatches += best;
}
assert.equal(partitionMatches, 0);
assert.equal(directRowMatches, 0);
assert.equal(maxBestCaesarMatch, 4);
assert.equal(sumBestCaesarMatches, 557);
assert.equal(paddedRowsWithAtLeastFiveCopies, 241);


// More physical-boundary-constrained competitor: p3–7 excludes its five
// terminal RED colophon words; p40–53 excludes its whole eight-RED title.
// Each side then has a natural 250×12 record shape, without deleting
// individual runes from inside a colored span. The original 51-red-rune
// passage on p53 remains INSIDE this target; that is a major ambiguity.
const colophon = ink.pages.find(p => p.page === 7).red_spans[0];
assert.equal(colophon.start, 194);
assert.equal(colophon.length, 14);
assert.deepEqual(words.slice(-5).map(w => w.length), [2, 4, 3, 2, 3]);
assert.deepEqual(words.slice(-5).flat(),
  [...colophon.runes].map(r => corpus.runes.indexOf(r)));
const bodyWords = words.slice(0, -5);
assert.equal(bodyWords.length, 250);
assert.equal(bodyWords.flat().length, 1131);
assert.equal(Math.max(...bodyWords.map(w => w.length)), 12);
const ROW12 = 12;
const rows12 = bodyWords.map(w => Array(ROW12 - w.length).fill(0).concat(w));
const pad12Row = rows12.flat();
const pad12Column = Array.from({length: ROW12}, (_, j) =>
  rows12.map(row => row[j])).flat();
const floral = corpus.pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
assert.equal(floral.length, 3008);
assert.deepEqual(floral.slice(0, 8),
  [...p40Ink.red_spans[0].runes].map(r => corpus.runes.indexOf(r)));
const red53 = ink.pages.find(p => p.page === 53).red_spans[0];
assert.equal(red53.length, 51);
const floralBody = floral.slice(8);
assert.equal(floralBody.length, 3000);
assert.equal(pad12Row.length, floralBody.length);
assert.equal(pad12Column.length, floralBody.length);
assert.equal(pad12Row.filter(v => v === 0).length, 1895);
assert.equal(floralBody.filter((v, i) => v === pad12Row[i]).length, 110);
assert(Math.abs(ioc(floralBody) - 0.03454440369011893) < 1e-12);

const width12Inverses = [];
for (const [order, key] of [['row-major', pad12Row], ['column-major', pad12Column]]) {
  for (const sign of [-1, 1]) {
    const plain = floralBody.map((v, i) => mod29(v + sign * key[i]));
    assert.deepEqual(plain.map((v, i) => mod29(v - sign * key[i])), floralBody);
    const plant = floralBody.map((_, i) => native[i % native.length]);
    const plantedCipher = plant.map((v, i) => mod29(v - sign * key[i]));
    assert.deepEqual(plantedCipher.map((v, i) => mod29(v + sign * key[i])), plant);
    width12Inverses.push({
      order, sign, ioc: ioc(plain), nativePositive: plant.length,
      prefix: render(plain.slice(0, 75))
    });
  }
}
assert(Math.abs(width12Inverses[0].ioc - 0.03447727020117817) < 1e-12);
assert(Math.abs(width12Inverses[1].ioc - 0.034589974435923085) < 1e-12);
assert(Math.abs(width12Inverses[2].ioc - 0.034491497165721904) < 1e-12);
assert(Math.abs(width12Inverses[3].ioc - 0.03457619206402134) < 1e-12);
let width12RowPartitionMatches = 0;
let width12RowMaxCaesar = 0;
for (let i = 0; i < rows12.length; i++) {
  const x = rows12[i], y = floralBody.slice(i * ROW12, (i + 1) * ROW12);
  if (multiplicitySignature(x) === multiplicitySignature(y)) {
    width12RowPartitionMatches++;
  }
  let best = 0;
  for (let shift = 0; shift < GP; shift++) {
    best = Math.max(best, x.filter((v, j) => mod29(v + shift) === y[j]).length);
  }
  width12RowMaxCaesar = Math.max(width12RowMaxCaesar, best);
}
assert.equal(width12RowPartitionMatches, 5);
assert.equal(width12RowMaxCaesar, 4);

// Key-independent PAD-only capacity. At each inserted cell, a fixed
// position-independent bijection of the GP29 alphabet preserves all
// top-k histogram counts, regardless of which secret substitution is used
// and irrespective of whether the fixed pad rune is F or another rune.
// Native solved Cicada text supplies a control distribution at the SAME
// 1869 mask positions over 60 independent cyclic starting offsets.
const padMask12 = bodyWords.flatMap(w =>
  Array(ROW12 - w.length).fill(true).concat(Array(w.length).fill(false)));
assert.equal(padMask12.length, 3000);
assert.equal(padMask12.filter(Boolean).length, 1869);
const onlyPadTarget = floralBody.filter((_, i) => padMask12[i]);
const solvedControl = JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'external', 'relikd-solved-gp29-native-v1.json'
), 'utf8'));
assert.equal(solvedControl.sections.length, 9);
const allNative = solvedControl.sections.flatMap(section =>
  [...section.source_text].filter(glyph =>
    corpus.runes.includes(glyph)).map(glyph => corpus.runes.indexOf(glyph)));
assert.equal(allNative.length, 2979);
/** @param {number[]} items @returns {[number, number, number]} */
function topKFrequency(items) {
  const counts = Array(GP).fill(0);
  for (const value of items) counts[value]++;
  counts.sort((x, y) => y - x);
  return [counts[0], counts[0] + counts[1],
    counts.slice(0, 5).reduce((sum, count) => sum + count, 0)];
}
const originalPadTopK = topKFrequency(onlyPadTarget);
assert.deepEqual(originalPadTopK, [85, 164, 394]);
assert.deepEqual(topKFrequency(onlyPadTarget.map(v => mod29(v + 17))),
  originalPadTopK);
const padNativeControls = [];
for (let offset = 0; offset < allNative.length; offset += 50) {
  const matched = [];
  for (let i = 0; i < padMask12.length; i++) {
    if (padMask12[i]) matched.push(allNative[(offset + i) % allNative.length]);
  }
  assert.equal(matched.length, 1869);
  padNativeControls.push(topKFrequency(matched));
}
assert.equal(padNativeControls.length, 60);
const nativeMinTopK = [0, 1, 2].map(j =>
  Math.min(...padNativeControls.map(row => row[j])));
assert.deepEqual(nativeMinTopK, [219, 376, 767]);
const padOnlyCapacity = {
  hypothesis: 'any one fixed bijective 29-symbol substitution at all artificial pad cells',
  artificialPadCells: onlyPadTarget.length,
  originalTopK: originalPadTopK,
  nativeGpControlRunes: allNative.length,
  nativeGpControlOffsets: padNativeControls.length,
  minimumNativeTopK: nativeMinTopK,
  gate: 'original has at most 85 in top1, controls require at least 219',
  nativeTextRecovered: false
};

const width12Evidence = {
  sourceWords: bodyWords.length,
  sourceRoughRunes: bodyWords.flat().length,
  paddedWidth: ROW12,
  paddedCells: pad12Row.length,
  targetRegion: 'p40-53 after whole eight-red-rune p40 title',
  targetRunes: floralBody.length,
  targetContainsP53Red51: true,
  rawIoc: ioc(floralBody),
  rowPartitionMatches: width12RowPartitionMatches,
  rowCaesarMaximum: width12RowMaxCaesar,
  padOnlyCapacity,
  inverses: width12Inverses
};

console.log(JSON.stringify({
  source: {
    p3to7Words: words.length,
    p3to7Runes: words.flat().length,
    redInitials: redStarts.join(''),
    padWidth: WIDTH,
    padRune: 'F',
    paddedCells: pad.length,
    authenticSourceZerosIncludingPads: pad.filter(x => x === 0).length,
    p40to55Runes: originalRunes.length,
    p40FirstRune: corpus.translit[originalRunes[0]]
  },
  original: {
    suffixLength: target.length,
    originalSuffixIoc: ioc(target),
    exactAlignedRuneMatches: matches,
    additiveInverses: observed
  },
  rowLocalAnySecretBijectiveAlphabetAndPermutation: {
    comparedRows: rows.length,
    invariantMultiplicityMatches: partitionMatches,
    exactMatchingRows: directRowMatches,
    maxSingleRowCaesarMatches: maxBestCaesarMatch,
    sumBestRowCaesarMatches: sumBestCaesarMatches,
    sourceRowsWithAtLeastFiveEqualSymbols: paddedRowsWithAtLeastFiveCopies
  },
  width12ToFloral3000: width12Evidence,
  status: 'No unknown plaintext or author-selected cross-chapter decoder'
}, null, 2));

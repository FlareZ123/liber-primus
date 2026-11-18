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
  status: 'No unknown plaintext or author-selected cross-chapter decoder'
}, null, 2));

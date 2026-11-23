'use strict';

/**
 * Original-image source-typed SFT: horizontal physical fold of 12 p13 lines
 * into six overlapping pairs, compared with the next original p14 137-rune
 * recipient, bypassing only p14's explicit F in whole word FOLD.
 *
 * This is a key-independent equality-pattern obstruction for any stationary
 * function from a horizontal-folded ordered GP29 pair to a p14 GP29 rune.
 *
 * Runs from repository root:
 * node sims/lp2_p13_p14_physical_fold_pair_invariant_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const transcribed = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);
const gpMap = new Map(corpus.runes.map((r, i) => [r, i]));
const partPages = corpus.pages.filter((p) => p.indices.length > 0);
const parts = transcribed.split('%');
assert.equal(parts.length, partPages.length, 'Transcription/corpus page map diverged');

/** @param {string} text @returns {number[]} */
function indices(text) {
  return Array.from(text).filter((x) => gpMap.has(x)).map((x) => gpMap.get(x));
}

/** @param {number} page @returns {number[][]} */
function physicalLines(page) {
  const pagePos = partPages.findIndex((p) => p.page === page);
  const lines = parts[pagePos].split('/').map(indices).filter((x) => x.length > 0);
  assert.deepEqual(lines.flat(), corpus.pages.find((p) => p.page === page).indices);
  return lines;
}

/** @param {number[]} data @returns {string} */
function gp(data) {
  return data.map((x) => corpus.translit[x]).join('');
}

const source = physicalLines(13);
const recipient = corpus.pages.find((p) => p.page === 14).indices;
assert.deepEqual(source.map((line) => line.length), [
  24, 21, 23, 23, 22, 23, 22, 25, 21, 22, 22, 24
]);
assert.equal(source.length, 12);
assert.equal(recipient.length, 137);
assert.equal(corpus.translit[recipient[2]], 'F');
const body = recipient.filter((_, i) => i !== 2);
assert.equal(body.length, 136);

const folded = [];
const topOverhang = [];
const bottomOverhang = [];
const rowSummary = [];
for (let r = 0; r < 6; r += 1) {
  const top = source[r];
  const bottom = source[11 - r];
  const shared = Math.min(top.length, bottom.length);
  rowSummary.push([top.length, bottom.length, shared]);
  for (let x = 0; x < top.length; x += 1) {
    folded.push({ top: top[x], bottom: x < bottom.length ? bottom[x] : null });
    if (x >= bottom.length) topOverhang.push(top[x]);
  }
  for (let x = top.length; x < bottom.length; x += 1) {
    bottomOverhang.push(bottom[x]);
  }
}
assert.equal(folded.length, 136);
assert.equal(folded.filter((x) => x.bottom !== null).length, 132);
assert.equal(topOverhang.length, 4);
assert.equal(bottomOverhang.length, 4);
assert.equal(gp(topOverhang), 'WAFX');
assert.equal(gp(bottomOverhang), 'FJEI');

/**
 * Repeated identical *source* ordered pairs must have identical target runes
 * under every stationary pair->rune map, regardless of secret map contents.
 *
 * @param {number[]} outputs
 */
function stationaryPairObstruction(outputs) {
  const seen = new Map();
  let duplicatePairs = 0;
  let contradictoryOutputs = 0;
  for (let i = 0; i < folded.length; i += 1) {
    const { top, bottom } = folded[i];
    if (bottom === null) continue;
    const sourcePair = top * 29 + bottom;
    if (seen.has(sourcePair)) {
      duplicatePairs += 1;
      if (seen.get(sourcePair) !== outputs[i]) contradictoryOutputs += 1;
    } else {
      seen.set(sourcePair, outputs[i]);
    }
  }
  return { distinctPairs: seen.size, duplicatePairs, contradictoryOutputs };
}

// Mathematical positive control: a true stationary map must have no mismatch.
const plant = folded.map(({ top, bottom }) => bottom === null
  ? (top + 17) % 29
  : (top * 17 + bottom * 13 + 7) % 29);
assert.equal(stationaryPairObstruction(plant).contradictoryOutputs, 0);

const forward = stationaryPairObstruction(body);
const reverse = stationaryPairObstruction(body.slice().reverse());
assert.deepEqual(forward, { distinctPairs: 122, duplicatePairs: 10, contradictoryOutputs: 10 });
assert.deepEqual(reverse, { distinctPairs: 122, duplicatePairs: 10, contradictoryOutputs: 8 });

// Compare natural-page specificity across all *12-line* original LP2 pages.
const twelveLinePages = partPages.filter((p) => p.page <= 55).map((p) => ({
  page: p.page,
  lines: physicalLines(p.page)
})).filter((x) => x.lines.length === 12);
const exactlyHalf = twelveLinePages.map(({ page, lines }) => {
  const first = lines.slice(0, 6).reduce((a, b) => a + b.length, 0);
  const last = lines.slice(6).reduce((a, b) => a + b.length, 0);
  return { page, first, last };
}).filter((x) => x.first === x.last);
assert.equal(twelveLinePages.length, 35);
assert.deepEqual(exactlyHalf.map((x) => x.page), [13, 24, 42]);

console.log('Original p13 physical 6-line fold', JSON.stringify(rowSummary));
console.log('One-sided unpaired runes', JSON.stringify({
  topOverhang: gp(topOverhang), bottomOverhang: gp(bottomOverhang)
}));
console.log('p14 after original F in FOLD omitted:', body.length, 'runes');
console.log('Source pair -> original p14 rune, same order', JSON.stringify(forward));
console.log('Source pair -> reverse p14 rune', JSON.stringify(reverse));
console.log('Exact 12-line half-balanced pages:', JSON.stringify(exactlyHalf));
/**
 * Separately: a human could notice the eight unpaired, literally exposed
 * GP runes as a short Vigenere key. Freeze the unique reading convention:
 * four upper-right overhangs from top row downward, then four lower-right
 * overhangs from upper row downward. Standard subtractive GP29 encryption,
 * repeat from the beginning on each new physical page. The isolated p14 F
 * in the literal FOLD word is the one candidate bypass.
 */
const exposedKey = topOverhang.concat(bottomOverhang);
assert.equal(gp(exposedKey), 'WAFXFJEI');
assert.equal(exposedKey.length, 8);

/** @param {number[]} values @param {boolean} inverse @returns {number[]} */
function eightRuneVigenere(values, inverse) {
  return values.map((v, i) => (v + (inverse ? -1 : 1) * exposedKey[i % 8] + 29) % 29);
}

/** @param {number[]} values @returns {number} */
function symbolIoc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}

const p14Inverse = eightRuneVigenere(body, true);
const p15Original = corpus.pages.find((p) => p.page === 15).indices;
const p15Inverse = eightRuneVigenere(p15Original, true);
assert.deepEqual(eightRuneVigenere(p14Inverse, false), body);
assert.deepEqual(eightRuneVigenere(p15Inverse, false), p15Original);
const solvedNative = corpus.pages.find((p) => p.page === 57).indices;
const controlCipher = eightRuneVigenere(solvedNative, false);
assert.deepEqual(eightRuneVigenere(controlCipher, true), solvedNative);
assert.ok(Math.abs(symbolIoc(p14Inverse) - 0.0355119825708061) < 1e-12);
assert.ok(Math.abs(symbolIoc(p15Inverse) - 0.03590478465090359) < 1e-12);
console.log('Human-readable exposed-key candidate', gp(exposedKey),
  'p14-with-source-F-bypass IoC', symbolIoc(p14Inverse),
  'independent p15 IoC', symbolIoc(p15Inverse),
  'authentic native solved-p57 positive IoC', symbolIoc(solvedNative));
console.log('Exposed-key original p14 decipherment prefix:', gp(p14Inverse.slice(0, 72)));
console.log('PASSED original physical pair invariant, native-positive and full-packet 8-rune key replay.');

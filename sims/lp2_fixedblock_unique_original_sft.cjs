'use strict';
/**
 * Exact source-original necessary-condition gate for fixed-size blocks of
 * pairwise-distinct GP29 ciphertext symbols. Windows-compatible Node.js 22.
 * Source is read-only. No plaintext, cipher key, or stego assumption is made.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);

/**
 * All same-rune pairs separated by 1 through 28 source positions.
 * @param {number[]} values
 * @returns {[number, number][]}
 */
function equalPairs(values) {
  /** @type {[number, number][]} */
  const pairs = [];
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length && j <= i + 28; j++) {
      if (values[i] === values[j]) pairs.push([i, j]);
    }
  }
  return pairs;
}

/**
 * Number of forbidden within-block equalities for each possible phase.
 * The source model is a constant block width and a phase chosen independently
 * for each original physical page. It does not assume shared phase or key.
 * @param {[number, number][]} pairs
 * @param {number} width
 * @returns {{minimum:number, validPhases:number[]}}
 */
function phaseResult(pairs, width) {
  let minimum = Infinity;
  /** @type {number[]} */
  const validPhases = [];
  for (let phase = 0; phase < width; phase++) {
    let forbidden = 0;
    for (const [i, j] of pairs) {
      if (j - i < width &&
          Math.floor((i + phase) / width) ===
          Math.floor((j + phase) / width)) {
        forbidden++;
      }
    }
    if (forbidden < minimum) minimum = forbidden;
    if (forbidden === 0) validPhases.push(phase);
  }
  return { minimum, validPhases };
}

const originals = pages.map(p => ({ page: p.page, pairs: equalPairs(p.indices) }));
const byWidth = [];
for (let width = 2; width <= 29; width++) {
  const decisions = originals.map(p => ({
    page: p.page, ...phaseResult(p.pairs, width)
  }));
  const compatiblePages = decisions.filter(x => x.validPhases.length > 0)
    .map(x => x.page);
  const minimumForbiddenTotal = decisions.reduce((s, x) => s + x.minimum, 0);
  byWidth.push({ width, compatiblePages, minimumForbiddenTotal });

  // A genuine fixed-width, without-replacement planted tape must be accepted.
  for (const page of pages) {
    const planted = Array.from({ length: page.indices.length }, (_, i) =>
      (page.page + 7 * Math.floor(i / width) + 3 * (i % width)) % 29);
    const positive = phaseResult(equalPairs(planted), width);
    assert.ok(positive.validPhases.includes(0));
    assert.equal(positive.minimum, 0);
  }
}

const whole = pages.flatMap(p => p.indices);
/** @param {number[]} values @param {number} lag */
const collisionCount = (values, lag) => {
  let count = 0;
  for (let i = lag; i < values.length; i++) {
    if (values[i] === values[i-lag]) count++;
  }
  return count;
};
assert.equal(collisionCount(whole, 1), 86);
assert.equal(collisionCount(whole, 2), 441);
const pins = [
  [2, 41, 17], [3, 3, 125], [4, 1, 278],
  [5, 0, 436], [29, 0, 5073]
];
for (const [width, compatible, minimum] of pins) {
  const d = byWidth.find(x => x.width === width);
  assert.equal(d.compatiblePages.length, compatible);
  assert.equal(d.minimumForbiddenTotal, minimum);
}
assert.ok(byWidth.every(x => x.compatiblePages.length < pages.length));

console.log(JSON.stringify({
  pages: pages.length,
  originalRunes: whole.length,
  ciphertextEqualitiesAtLag1: 86,
  ciphertextEqualitiesAtLag2: 441,
  allFixedBlockWidths2To29Excluded: true,
  sourceModel: 'fixed width, any per-page phase, 29-symbol without-replacement',
  byWidth,
  syntheticDistinctBlockPositive: 'all widths 2..29, all pages PASS'
}, null, 2));

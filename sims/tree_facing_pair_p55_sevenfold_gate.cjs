'use strict';

// Bounded, source-directed LP2 original-cipher test.
// Original physical pp10/11 carry facing mirrored tree artwork and 263/273
// GP29 runes. Removing the four terminal runes of p10 leaves
// 259+273 = 76*7, matching the 76 runes of the terminal tree page p55.
// The marked source-field root 24 has exact multiplicative order seven.
// This tests whether a seven-rune fold can directly produce p55 through
// even a completely unknown stationary 29-input to 29-output codebook.
// It is an intentionally finite negative gate, not an LP2 decoder.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} base @param {number} exponent @returns {number} */
function power(base, exponent) {
  let out = 1;
  for (let i = 0; i < exponent; i++) out = mod(out * base);
  return out;
}

/** @param {number} page @returns {number[]} */
function runes(page) {
  const item = corpus.pages.find((row) => row.page === page);
  assert.ok(item && Array.isArray(item.indices), 'Expected original page ' + page);
  return item.indices;
}

/**
 * Sevenfold reduction of source glyphs with a page-aligned clock.
 * @param {number[]} source A page-contiguous multiple of 7 symbols.
 * @param {'contiguous'|'strided'} layout
 * @param {number} base
 * @returns {number[]}
 */
function fold(source, layout, base) {
  assert.equal(source.length % 7, 0);
  const columns = source.length / 7;
  const result = [];
  for (let j = 0; j < columns; j++) {
    let sum = 0;
    for (let k = 0; k < 7; k++) {
      const sourceIndex = layout === 'contiguous' ? j * 7 + k : k * columns + j;
      sum = mod(sum + source[sourceIndex] * power(base, k));
    }
    result.push(sum);
  }
  return result;
}

/**
 * Globally optimal number of symbol matches for every stationary,
 * possibly non-injective secret mapping from 29 input residues to 29 glyphs.
 * @param {number[]} input
 * @param {number[]} target
 * @returns {number}
 */
function bestStationaryMatches(input, target) {
  assert.equal(input.length, target.length);
  /** @type {Map<number, Map<number, number>>} */
  const counts = new Map();
  for (let i = 0; i < input.length; i++) {
    if (!counts.has(input[i])) counts.set(input[i], new Map());
    const hist = counts.get(input[i]);
    hist.set(target[i], (hist.get(target[i]) || 0) + 1);
  }
  return Array.from(counts.values()).reduce(
    (sum, hist) => sum + Math.max(...hist.values()), 0
  );
}

const left = runes(10);
const right = runes(11);
const target = runes(55);
assert.deepEqual([left.length, right.length, target.length], [263, 273, 76]);
assert.equal(left.length + right.length, 7 * target.length + 4);
assert.deepEqual(Array.from({length: 7}, (_, k) => power(24, k)),
  [1, 24, 25, 20, 16, 7, 23]);
assert.equal(power(24, 7), 1);

const results = [];
for (let leftTrim = 0; leftTrim <= 4; leftTrim++) {
  const trimmedLeft = left.slice(leftTrim, left.length - 4 + leftTrim);
  assert.equal(trimmedLeft.length, 259);
  for (const swap of [false, true]) {
    const pieces = swap ? [right, trimmedLeft] : [trimmedLeft, right];
    for (const layout of ['contiguous', 'strided']) {
      for (const base of [1, 24, 23]) {
        const candidate = pieces.flatMap((piece) => fold(piece, layout, base));
        assert.equal(candidate.length, target.length);
        const bestMatches = bestStationaryMatches(candidate, target);
        const literalMatches = candidate.reduce(
          (sum, val, i) => sum + Number(val === target[i]), 0);
        results.push({ leftTrim, swap, layout, base,
          bestMatches, forcedErrors: target.length - bestMatches, literalMatches });
      }
    }
  }
}
assert.equal(results.length, 60);
const bestSecret = Math.max(...results.map((entry) => entry.bestMatches));
const bestLiteral = Math.max(...results.map((entry) => entry.literalMatches));
assert.equal(bestSecret, 34);
assert.equal(bestLiteral, 7);

// Source-shaped positive control with independent known solved p57 plaintext:
// encode 76 authentic solved GP runes through a hidden affine lookup while
// retaining the 37+39 page-local sevenfold packet shape.
const native = runes(57).slice(0, target.length);
assert.equal(native.length, 76);
const secretForward = (x) => mod(7 * x + 11);
const secretInverse = (x) => mod(25 * (x - 11)); // 7*25 = 1 mod 29.
const plantedLeft = Array(263).fill(0);
const plantedRight = Array(273).fill(0);
for (let j = 0; j < native.length; j++) {
  const value = secretInverse(native[j]);
  if (j < 37) plantedLeft[7 * j] = value;
  else plantedRight[7 * (j - 37)] = value;
}
const foldedPlant = [
  ...fold(plantedLeft.slice(0, 259), 'contiguous', 1),
  ...fold(plantedRight, 'contiguous', 1)
];
assert.deepEqual(foldedPlant.map(secretForward), native);
assert.equal(bestStationaryMatches(foldedPlant, native), 76);

if (require.main === module) {
  console.log(JSON.stringify({
    hypothesis: 'facing-tree pp10/11 sevenfold fold to terminal tree p55',
    originalLengths: [263, 273, 76],
    orderSevenRoot: 24,
    originalFamilies: results.length,
    maximumOriginalCorrectWithAnyStationarySecretCodebook: bestSecret,
    minimumOriginalForcedMismatches: target.length - bestSecret,
    maximumLiteralMatches: bestLiteral,
    nativeGPPositiveControlMatches: 76,
    bestCandidates: results.filter((item) => item.bestMatches === bestSecret),
    conclusion: 'NO original p55 direct sevenfold/stationary-codebook decoder'
  }, null, 2));
}
module.exports = {fold, bestStationaryMatches};

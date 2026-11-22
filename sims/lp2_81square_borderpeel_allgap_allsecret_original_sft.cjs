'use strict';
/**
 * Original LP2 81x81 -> 80x80 border-peel all-gap, all-secret output-map gate.
 * Source: first 6,561 original unknown GP29 runes, remainder 6,395.
 * Decode candidate: delete one external row and column, optionally D4-rotate,
 * apply any secret 29-to-29 rune mapping, and delete five consecutive cells.
 * The maximum under an arbitrary map is an all-key upper bound for any
 * reversible monoalphabetic substitution (and arbitrary GP29 affine key).
 *
 * Windows Node.js 22, no extra dependencies.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(source.length, 12956);
const first = source.slice(0, 6561);
const second = source.slice(6561);
assert.equal(first.length, 81 * 81);
assert.equal(second.length, 80 * 80 - 5);
const ALPHABET = 29;

/**
 * @param {number[]} input Flat 81x81 GP29 runes.
 * @param {number} rowStart 0 drops bottom row, 1 drops top row.
 * @param {number} colStart 0 drops right column, 1 drops left column.
 * @param {number} transpose 0 or 1.
 * @param {number} reverseX 0 or 1.
 * @param {number} reverseY 0 or 1.
 * @returns {number[]} Flat 80x80 oriented crop.
 */
function crop(input, rowStart, colStart, transpose, reverseX, reverseY) {
  /** @type {number[]} */
  const output = [];
  for (let row = 0; row < 80; row++) {
    for (let col = 0; col < 80; col++) {
      let x = reverseX ? 79 - col : col;
      let y = reverseY ? 79 - row : row;
      if (transpose) [x, y] = [y, x];
      output.push(input[(y + rowStart) * 81 + (x + colStart)]);
    }
  }
  assert.equal(output.length, 6400);
  return output;
}

/**
 * For every possible location of five consecutive omitted source cells,
 * find the maximum original matches under any secret symbol lookup.
 * No S-box is fitted from a proposed dictionary plaintext.
 * @param {number[]} candidate 6,400 source GP29 symbols.
 * @param {number[]} target 6,395 printed GP29 ciphertext symbols.
 * @returns {{score: number, gap: number}}
 */
function bestUnknownGap(candidate, target) {
  assert.equal(candidate.length, target.length + 5);
  const table = Array.from({length: ALPHABET}, () => new Int32Array(ALPHABET));
  const maxima = new Int16Array(ALPHABET);
  // Start with five source symbols omitted at the front. Moving the gap
  // one cell right changes only one target alignment and two histogram rows.
  for (let j = 0; j < target.length; j++) table[candidate[j + 5]][target[j]]++;
  for (let x = 0; x < ALPHABET; x++) maxima[x] = Math.max(...table[x]);
  let score = maxima.reduce((sum, n) => sum + n, 0);
  let best = {score, gap: 0};
  for (let j = 0; j < target.length; j++) {
    const oldValue = candidate[j + 5];
    const newValue = candidate[j];
    const seen = target[j];
    table[oldValue][seen]--;
    table[newValue][seen]++;
    const oldMaximum = Math.max(...table[oldValue]);
    score += oldMaximum - maxima[oldValue];
    maxima[oldValue] = oldMaximum;
    if (newValue !== oldValue) {
      const newMaximum = Math.max(...table[newValue]);
      score += newMaximum - maxima[newValue];
      maxima[newValue] = newMaximum;
    }
    if (score > best.score) best = {score, gap: j + 1};
  }
  return best;
}

/** @param {number[]} data @param {number} gap @returns {number[]} */
function removeFive(data, gap) {
  return data.slice(0, gap).concat(data.slice(gap + 5));
}

const records = [];
for (let rowStart = 0; rowStart <= 1; rowStart++)
  for (let colStart = 0; colStart <= 1; colStart++)
    for (let transpose = 0; transpose <= 1; transpose++)
      for (let reverseX = 0; reverseX <= 1; reverseX++)
        for (let reverseY = 0; reverseY <= 1; reverseY++) {
          const candidate = crop(first, rowStart, colStart, transpose,
            reverseX, reverseY);
          records.push({rowStart, colStart, transpose, reverseX, reverseY,
            ...bestUnknownGap(candidate, second)});
        }
records.sort((a, b) => b.score - a.score);
assert.equal(records.length, 32);
assert.deepEqual(records[0], {
  rowStart: 1, colStart: 1, transpose: 0, reverseX: 0,
  reverseY: 1, score: 424, gap: 5054
});
assert.equal(records[records.length - 1].score, 400);

// Planted, unseen-key positive: nontrivial D4 transform, field affine output
// relabeling, and unknown 5-cell removal at a locked interior gap. Exact gap registration\n// can be one rune ambiguous when the adjacent source input glyphs coincide.
const plantedCandidate = crop(first, 1, 1, 1, 1, 0);
const plantedOutput = removeFive(plantedCandidate.map(x => (7*x + 11) % 29), 1234);
const plantedResult = bestUnknownGap(plantedCandidate, plantedOutput);
assert.equal(plantedResult.score, plantedOutput.length);
assert.ok([1233, 1234].includes(plantedResult.gap), 'Equivalent one-rune gap must be recovered');

console.log(JSON.stringify({
  source: 'LP2 full original 12956-runed unsolved source',
  firstBlock: first.length,
  secondBlock: second.length,
  candidateCropsAndOrientations: records.length,
  fiveSymbolContiguousGapPositions: second.length + 1,
  testedSecretMaps: 'all possible deterministic 29-to-29 lookups per candidate',
  originalBest: records[0],
  necessaryMismatches: second.length - records[0].score,
  originalTopFive: records.slice(0, 5),
  planted: plantedResult,
  status: 'PASS; original border-peel lookup requires 5971 mismatches',
}, null, 2));

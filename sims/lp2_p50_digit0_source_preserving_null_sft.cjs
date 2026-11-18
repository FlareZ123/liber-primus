'use strict';

/**
 * Director #1500 source-preserving null test for the LP2 p50 literal-leading-zero
 * mask and original adjacent equal-ciphertext events.
 *
 * Windows Node.js 22, CommonJS, standard library only.
 *
 * Primary statistic:
 *   count of original same-rune adjacent events whose first rune lands on a
 *   literal-leading-zero p50 table cell under the natural global 256-cell clock.
 *
 * The source value is 33 of 86 events. All nulls preserve the original event
 * sites and the global clock. The fixed-margin switch null also preserves every
 * printed table row sum and column sum of the 32x8 binary leading-zero mask.
 */

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const PAGES = corpus.pages.filter((page) => page.page <= 55);

assert.equal(TOKENS.length, 256);
assert.equal(PAGES.reduce((sum, page) => sum + page.indices.length, 0), 12956);

/**
 * @typedef {{
 *   hits:number,
 *   positiveChapters:number,
 *   excess:number,
 *   selectedOpportunities:number[],
 *   selectedRepeats:number[]
 * }} MaskStat
 */

/**
 * Build chapter-by-phase opportunity and repeat inventories.
 * Cross-page pairs are excluded while page turns remain in the global clock.
 * @returns {{
 *   opportunities:Int32Array[],
 *   repeats:Int32Array[],
 *   chapterOpportunities:Int32Array,
 *   chapterRepeats:Int32Array
 * }}
 */
function buildInventory() {
  const opportunities = Array.from({ length: 9 }, () => new Int32Array(256));
  const repeats = Array.from({ length: 9 }, () => new Int32Array(256));
  const chapterOpportunities = new Int32Array(9);
  const chapterRepeats = new Int32Array(9);
  let globalRune = 0;

  for (const page of PAGES) {
    const chapter = CHAPTERS.findIndex(
      ([first, last]) => first <= page.page && page.page <= last
    );
    assert.ok(chapter >= 0);

    for (let i = 0; i + 1 < page.indices.length; i++) {
      const phase = (globalRune + i) & 255;
      opportunities[chapter][phase]++;
      chapterOpportunities[chapter]++;
      const hit = Number(page.indices[i] === page.indices[i + 1]);
      repeats[chapter][phase] += hit;
      chapterRepeats[chapter] += hit;
    }
    globalRune += page.indices.length;
  }

  assert.equal(globalRune, 12956);
  assert.equal(
    Array.from(chapterOpportunities).reduce((sum, value) => sum + value, 0),
    12901
  );
  assert.equal(
    Array.from(chapterRepeats).reduce((sum, value) => sum + value, 0),
    86
  );

  return { opportunities, repeats, chapterOpportunities, chapterRepeats };
}

const inventory = buildInventory();
const sourceMask = Uint8Array.from(TOKENS, (token) => Number(token[0] === '0'));
assert.equal(Array.from(sourceMask).reduce((sum, value) => sum + value, 0), 60);

/**
 * @param {Uint8Array} mask
 * @returns {MaskStat}
 */
function assessMask(mask) {
  const selectedOpportunities = new Int32Array(9);
  const selectedRepeats = new Int32Array(9);

  for (let phase = 0; phase < 256; phase++) {
    if (!mask[phase]) continue;
    for (let chapter = 0; chapter < 9; chapter++) {
      selectedOpportunities[chapter] += inventory.opportunities[chapter][phase];
      selectedRepeats[chapter] += inventory.repeats[chapter][phase];
    }
  }

  let hits = 0;
  let positiveChapters = 0;
  let excess = 0;
  for (let chapter = 0; chapter < 9; chapter++) {
    const selected = selectedOpportunities[chapter];
    const selectedHits = selectedRepeats[chapter];
    const total = inventory.chapterOpportunities[chapter];
    const totalHits = inventory.chapterRepeats[chapter];

    hits += selectedHits;
    positiveChapters += Number(selectedHits * total > totalHits * selected);
    excess += selectedHits - (totalHits * selected) / total;
  }

  return {
    hits,
    positiveChapters,
    excess,
    selectedOpportunities: Array.from(selectedOpportunities),
    selectedRepeats: Array.from(selectedRepeats)
  };
}

/**
 * @param {Uint8Array} mask
 * @returns {{rowSums:number[], columnSums:number[]}}
 */
function marginSums(mask) {
  const rowSums = Array.from({ length: 32 }, (_, row) => {
    let sum = 0;
    for (let column = 0; column < 8; column++) sum += mask[row * 8 + column];
    return sum;
  });
  const columnSums = Array.from({ length: 8 }, (_, column) => {
    let sum = 0;
    for (let row = 0; row < 32; row++) sum += mask[row * 8 + column];
    return sum;
  });
  return { rowSums, columnSums };
}

const source = assessMask(sourceMask);
const sourceMargins = marginSums(sourceMask);

assert.equal(source.hits, 33);
assert.equal(source.positiveChapters, 9);
assert.ok(Math.abs(source.excess - 12.824025109002077) < 1e-12);
assert.deepEqual(source.selectedOpportunities, [169, 266, 403, 447, 240, 333, 392, 701, 74]);
assert.deepEqual(source.selectedRepeats, [1, 3, 3, 5, 4, 5, 5, 6, 1]);
assert.deepEqual(sourceMargins.columnSums, [4, 4, 9, 10, 8, 11, 7, 7]);

/**
 * Heap-style recursive permutation generator.
 * @param {number[]} values
 * @param {number} index
 * @returns {Generator<number[]>}
 */
function* permutations(values, index = 0) {
  if (index === values.length) {
    yield values.slice();
    return;
  }
  for (let i = index; i < values.length; i++) {
    [values[index], values[i]] = [values[i], values[index]];
    yield* permutations(values, index + 1);
    [values[index], values[i]] = [values[i], values[index]];
  }
}

/**
 * Exact 8! shared-column permutations. All 32 rows receive the same column
 * permutation, preserving every row's zero count and the source row order.
 * @returns {{
 *   candidates:number, primaryTail:number, maximumHits:number,
 *   allNinePositive:number, allNineAtLeastSourceExcess:number,
 *   primaryTailAndAllNine:number, chapterTail:number[]
 * }}
 */
function exactSharedColumnNull() {
  let candidates = 0;
  let primaryTail = 0;
  let maximumHits = -1;
  let allNinePositive = 0;
  let allNineAtLeastSourceExcess = 0;
  let primaryTailAndAllNine = 0;
  const chapterTail = new Int32Array(9);

  for (const permutation of permutations([0, 1, 2, 3, 4, 5, 6, 7])) {
    const mask = new Uint8Array(256);
    for (let row = 0; row < 32; row++) {
      for (let column = 0; column < 8; column++) {
        mask[row * 8 + column] =
          sourceMask[row * 8 + permutation[column]];
      }
    }

    const stat = assessMask(mask);
    candidates++;
    primaryTail += Number(stat.hits >= source.hits);
    allNinePositive += Number(stat.positiveChapters === 9);
    allNineAtLeastSourceExcess += Number(
      stat.positiveChapters === 9 && stat.excess >= source.excess - 1e-12
    );
    primaryTailAndAllNine += Number(
      stat.hits >= source.hits && stat.positiveChapters === 9
    );
    maximumHits = Math.max(maximumHits, stat.hits);
    for (let chapter = 0; chapter < 9; chapter++) {
      chapterTail[chapter] += Number(
        stat.selectedRepeats[chapter] >= source.selectedRepeats[chapter]
      );
    }
  }

  return {
    candidates,
    primaryTail,
    maximumHits,
    allNinePositive,
    allNineAtLeastSourceExcess,
    primaryTailAndAllNine,
    chapterTail: Array.from(chapterTail)
  };
}

/**
 * Deterministic xorshift32 generator returning values in [0, 1).
 * @param {number} seed
 * @returns {() => number}
 */
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Monte Carlo intact-row permutation null.
 * @param {number} samples
 * @param {number} seed
 * @returns {{
 *   samples:number, primaryTail:number, meanHits:number, maximumHits:number,
 *   allNinePositive:number, allNineAtLeastSourceExcess:number,
 *   primaryTailAndAllNine:number, chapterTail:number[]
 * }}
 */
function rowPermutationNull(samples, seed) {
  const random = makeRandom(seed);
  let primaryTail = 0;
  let sumHits = 0;
  let maximumHits = -1;
  let allNinePositive = 0;
  let allNineAtLeastSourceExcess = 0;
  let primaryTailAndAllNine = 0;
  const chapterTail = new Int32Array(9);

  for (let sample = 0; sample < samples; sample++) {
    const rows = Array.from({ length: 32 }, (_, index) => index);
    for (let i = 31; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [rows[i], rows[j]] = [rows[j], rows[i]];
    }

    const mask = new Uint8Array(256);
    for (let row = 0; row < 32; row++) {
      for (let column = 0; column < 8; column++) {
        mask[row * 8 + column] = sourceMask[rows[row] * 8 + column];
      }
    }

    const stat = assessMask(mask);
    sumHits += stat.hits;
    primaryTail += Number(stat.hits >= source.hits);
    allNinePositive += Number(stat.positiveChapters === 9);
    allNineAtLeastSourceExcess += Number(
      stat.positiveChapters === 9 && stat.excess >= source.excess - 1e-12
    );
    primaryTailAndAllNine += Number(
      stat.hits >= source.hits && stat.positiveChapters === 9
    );
    maximumHits = Math.max(maximumHits, stat.hits);
    for (let chapter = 0; chapter < 9; chapter++) {
      chapterTail[chapter] += Number(
        stat.selectedRepeats[chapter] >= source.selectedRepeats[chapter]
      );
    }
  }

  return {
    samples,
    primaryTail,
    meanHits: sumHits / samples,
    maximumHits,
    allNinePositive,
    allNineAtLeastSourceExcess,
    primaryTailAndAllNine,
    chapterTail: Array.from(chapterTail)
  };
}

/**
 * Enumerate every one-step 2x2 checkerboard switch from the source mask.
 * Every switch preserves all 32 row sums and all 8 column sums exactly.
 * This is an exact local sensitivity census, not a global uniform null.
 * @returns {{
 *   neighbors:number, primaryTail:number, minimumHits:number, maximumHits:number,
 *   allNinePositive:number, allNineAtLeastSourceExcess:number,
 *   primaryTailAndAllNine:number
 * }}
 */
function exactOneSwitchNeighborhood() {
  let neighbors = 0;
  let primaryTail = 0;
  let minimumHits = Infinity;
  let maximumHits = -Infinity;
  let allNinePositive = 0;
  let allNineAtLeastSourceExcess = 0;
  let primaryTailAndAllNine = 0;

  for (let row1 = 0; row1 < 32; row1++) {
    for (let row2 = row1 + 1; row2 < 32; row2++) {
      for (let column1 = 0; column1 < 8; column1++) {
        for (let column2 = column1 + 1; column2 < 8; column2++) {
          const a = row1 * 8 + column1;
          const b = row1 * 8 + column2;
          const c = row2 * 8 + column1;
          const d = row2 * 8 + column2;
          const x = sourceMask[a];
          const y = sourceMask[b];
          const u = sourceMask[c];
          const v = sourceMask[d];

          if (x !== v || y !== u || x === y) continue;

          const mask = sourceMask.slice();
          mask[a] ^= 1;
          mask[b] ^= 1;
          mask[c] ^= 1;
          mask[d] ^= 1;

          assert.deepEqual(marginSums(mask), sourceMargins);
          const stat = assessMask(mask);
          neighbors++;
          primaryTail += Number(stat.hits >= source.hits);
          allNinePositive += Number(stat.positiveChapters === 9);
          allNineAtLeastSourceExcess += Number(
            stat.positiveChapters === 9 && stat.excess >= source.excess - 1e-12
          );
          primaryTailAndAllNine += Number(
            stat.hits >= source.hits && stat.positiveChapters === 9
          );
          minimumHits = Math.min(minimumHits, stat.hits);
          maximumHits = Math.max(maximumHits, stat.hits);
        }
      }
    }
  }

  return {
    neighbors,
    primaryTail,
    minimumHits,
    maximumHits,
    allNinePositive,
    allNineAtLeastSourceExcess,
    primaryTailAndAllNine
  };
}

/**
 * Fixed-margin 2x2 switch-chain Monte Carlo.
 *
 * Predeclared for Director #1500:
 *   seed 0xC1CADA33
 *   50,000 accepted-switch burn-in
 *   100,000 samples
 *   32 accepted switches between recorded samples
 *
 * @param {number} samples
 * @param {number} seed
 * @returns {{
 *   samples:number, primaryTail:number, plusOneTail:number, meanHits:number,
 *   minimumHits:number, maximumHits:number, allNinePositive:number,
 *   allNineAtLeastSourceExcess:number, primaryTailAndAllNine:number,
 *   chapterTail:number[]
 * }}
 */
function fixedMarginSwitchChain(samples, seed) {
  const random = makeRandom(seed);
  const mask = sourceMask.slice();

  function acceptedSwitch() {
    while (true) {
      const row1 = Math.floor(random() * 32);
      let row2 = Math.floor(random() * 31);
      if (row2 >= row1) row2++;

      const column1 = Math.floor(random() * 8);
      let column2 = Math.floor(random() * 7);
      if (column2 >= column1) column2++;

      const a = row1 * 8 + column1;
      const b = row1 * 8 + column2;
      const c = row2 * 8 + column1;
      const d = row2 * 8 + column2;
      const x = mask[a];
      const y = mask[b];
      const u = mask[c];
      const v = mask[d];

      if (x !== v || y !== u || x === y) continue;

      mask[a] ^= 1;
      mask[b] ^= 1;
      mask[c] ^= 1;
      mask[d] ^= 1;
      return;
    }
  }

  for (let i = 0; i < 50000; i++) acceptedSwitch();
  assert.deepEqual(marginSums(mask), sourceMargins);

  let primaryTail = 0;
  let sumHits = 0;
  let minimumHits = Infinity;
  let maximumHits = -Infinity;
  let allNinePositive = 0;
  let allNineAtLeastSourceExcess = 0;
  let primaryTailAndAllNine = 0;
  const chapterTail = new Int32Array(9);

  for (let sample = 0; sample < samples; sample++) {
    for (let i = 0; i < 32; i++) acceptedSwitch();

    const stat = assessMask(mask);
    sumHits += stat.hits;
    primaryTail += Number(stat.hits >= source.hits);
    allNinePositive += Number(stat.positiveChapters === 9);
    allNineAtLeastSourceExcess += Number(
      stat.positiveChapters === 9 && stat.excess >= source.excess - 1e-12
    );
    primaryTailAndAllNine += Number(
      stat.hits >= source.hits && stat.positiveChapters === 9
    );
    minimumHits = Math.min(minimumHits, stat.hits);
    maximumHits = Math.max(maximumHits, stat.hits);

    for (let chapter = 0; chapter < 9; chapter++) {
      chapterTail[chapter] += Number(
        stat.selectedRepeats[chapter] >= source.selectedRepeats[chapter]
      );
    }
  }

  assert.deepEqual(marginSums(mask), sourceMargins);

  return {
    samples,
    primaryTail,
    plusOneTail: (primaryTail + 1) / (samples + 1),
    meanHits: sumHits / samples,
    minimumHits,
    maximumHits,
    allNinePositive,
    allNineAtLeastSourceExcess,
    primaryTailAndAllNine,
    chapterTail: Array.from(chapterTail)
  };
}

/**
 * Minimal source-shaped positive control. Preserve the source opportunities and
 * chapter repeat totals, but place each chapter's synthetic repeat events on
 * source-leading-zero phases that have available pair opportunities.
 *
 * @returns {number}
 */
function plantedSourceMaskHits() {
  let plantedHits = 0;
  for (let chapter = 0; chapter < 9; chapter++) {
    let remaining = inventory.chapterRepeats[chapter];
    for (let phase = 0; phase < 256 && remaining > 0; phase++) {
      if (!sourceMask[phase]) continue;
      const available = inventory.opportunities[chapter][phase];
      const placed = Math.min(available, remaining);
      plantedHits += placed;
      remaining -= placed;
    }
    assert.equal(remaining, 0);
  }
  return plantedHits;
}

assert.equal(plantedSourceMaskHits(), 86);

const exactColumns = exactSharedColumnNull();
const rows100k = rowPermutationNull(100000, 0x3301);
const exactOneSwitch = exactOneSwitchNeighborhood();
const fixedMargins = fixedMarginSwitchChain(100000, 0xC1CADA33);

assert.deepEqual(exactColumns, {
  candidates: 40320,
  primaryTail: 26,
  maximumHits: 34,
  allNinePositive: 57,
  allNineAtLeastSourceExcess: 6,
  primaryTailAndAllNine: 6,
  chapterTail: [32664, 5880, 18378, 2362, 6064, 3576, 3638, 7762, 28800]
});

assert.deepEqual(rows100k, {
  samples: 100000,
  primaryTail: 878,
  meanHits: 21.07943,
  maximumHits: 43,
  allNinePositive: 417,
  allNineAtLeastSourceExcess: 167,
  primaryTailAndAllNine: 177,
  chapterTail: [60079, 28411, 31484, 8613, 18043, 14572, 21476, 25786, 66588]
});

assert.deepEqual(exactOneSwitch, {
  neighbors: 916,
  primaryTail: 487,
  minimumHits: 26,
  maximumHits: 37,
  allNinePositive: 728,
  allNineAtLeastSourceExcess: 403,
  primaryTailAndAllNine: 459
});

assert.deepEqual(fixedMargins, {
  samples: 100000,
  primaryTail: 382,
  plusOneTail: 0.003829961700382996,
  meanHits: 20.71855,
  minimumHits: 5,
  maximumHits: 40,
  allNinePositive: 319,
  allNineAtLeastSourceExcess: 111,
  primaryTailAndAllNine: 112,
  chapterTail: [71718, 22994, 42752, 8408, 8919, 9805, 18502, 20518, 78717]
});

console.log(JSON.stringify({
  source: {
    events: 86,
    leadingZeroEvents: source.hits,
    positiveChapters: source.positiveChapters,
    chapterSummedExcess: source.excess,
    chapterLeadingZeroEvents: source.selectedRepeats,
    rowSums: sourceMargins.rowSums,
    columnSums: sourceMargins.columnSums
  },
  exactSharedColumnNull: {
    ...exactColumns,
    primaryTailFraction: exactColumns.primaryTail / exactColumns.candidates
  },
  intactRowPermutationNull: {
    ...rows100k,
    plusOnePrimaryTail: (rows100k.primaryTail + 1) / (rows100k.samples + 1)
  },
  exactFixedMarginOneSwitchNeighborhood: exactOneSwitch,
  fixedMarginSwitchChain: fixedMargins,
  positiveControl: {
    plantedSourceMaskHits: plantedSourceMaskHits()
  }
}, null, 2));

'use strict';

/**
 * LP2 original-source lag-five delimiter oracle: exhaustive local Boolean
 * classifier over five- and ten-flag echo neighborhoods.
 *
 * Run: node sims/lp2_lag5_local_delimiter_allsecret_sft.cjs
 *
 * Every secret lookup table is optimized EXACTLY: each observed mask can
 * independently emit BREAK or CONTINUE. The oracle is more permissive than a
 * source-fixed lookup and makes no guesses about the unknown key.
 *
 * Scope: local five-back equality flags ONLY; arbitrary nonlocal state,
 * ciphertext rune values, extra external keys and other cipher layers
 * are deliberately NOT excluded by this test.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');

const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const printed = read('resources/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const runicWord = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const words = (printed.match(runicWord) || [])
  .map(word => [...word].map(glyph => gp.runes.indexOf(glyph)));
const original = words.flat();
const source = gp.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(original, source);
const N = original.length;

const trueBreak = new Uint8Array(N);
let cursor = 0;
for (let i = 0; i + 1 < words.length; i++) {
  cursor += words[i].length;
  assert(cursor > 0 && cursor < N);
  trueBreak[cursor] = 1;
}
assert.equal(cursor + words.at(-1).length, N);

const pageAt = gp.pages.slice(0, 56).flatMap(page =>
  page.indices.map(() => page.page));
assert.equal(pageAt.length, N);
const pageCounts = new Map();
for (const id of pageAt) pageCounts.set(id, (pageCounts.get(id) || 0) + 1);
assert.equal(pageCounts.size, 55);

/** @param {number} index @param {boolean} pageReset @returns {0|1} */
function echo(index, pageReset) {
  if (index < 5 || index >= N) return 0;
  if (pageReset && pageAt[index] !== pageAt[index - 5]) return 0;
  return original[index] === original[index - 5] ? 1 : 0;
}

/**
 * @param {number} gap
 * @param {number[]} offsets
 * @param {boolean} pageReset
 * @returns {number}
 */
function mask(gap, offsets, pageReset) {
  let bits = 0;
  for (let k = 0; k < offsets.length; k++) {
    bits |= echo(gap + offsets[k], pageReset) << k;
  }
  return bits;
}

/**
 * @param {number[]} offsets
 * @param {boolean} pageReset
 * @param {'global'|'previous-page'|'next-page'} scope
 * @param {Uint8Array} labels
 * @returns {{groups:number, errors:number, zeroBreaks:number, zeroContinues:number,
 *   incompatibleGroups:number}}
 */
function classify(offsets, pageReset, scope, labels) {
  const observed = new Map();
  for (let gap = 1; gap < N; gap++) {
    const signature = mask(gap, offsets, pageReset);
    const group = scope === 'global'
      ? String(signature)
      : String(pageAt[scope === 'previous-page' ? gap - 1 : gap]) + ':' + signature;
    const counts = observed.get(group) || [0, 0];
    counts[labels[gap] ? 0 : 1]++;
    observed.set(group, counts);
  }
  let errors = 0, incompatibleGroups = 0;
  let truePositives = 0, falsePositives = 0;
  let falseNegatives = 0, trueNegatives = 0;
  for (const [breaks, continues] of observed.values()) {
    errors += Math.min(breaks, continues);
    incompatibleGroups += Number(breaks > 0 && continues > 0);
    // Oracle chooses the majority label; ties resolve to CONTINUE.
    if (breaks > continues) {
      truePositives += breaks;
      falsePositives += continues;
    } else {
      falseNegatives += breaks;
      trueNegatives += continues;
    }
  }
  const empty = observed.get('0') || [0, 0];
  return {
    groups: observed.size,
    errors,
    zeroBreaks: scope === 'global' ? empty[0] : 0,
    zeroContinues: scope === 'global' ? empty[1] : 0,
    incompatibleGroups,
    truePositives, falsePositives, falseNegatives, trueNegatives
  };
}

const WINDOWS = [
  ['five-forward', [0, 1, 2, 3, 4]],
  ['five-centered', [-2, -1, 0, 1, 2]],
  ['ten-around', [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5]]
];

const expected = {
  continuous: {
    'five-forward': [23, 2895, 2839, 2838, 2427, 8340],
    'five-centered': [23, 2895, 2842, 2841, 2411, 8356],
    'ten-around': [114, 2886, 2719, 2717, 2006, 6965]
  },
  'page-reset': {
    'five-forward': [23, 2895, 2835, 2835, 2444, 8392],
    'five-centered': [23, 2895, 2844, 2844, 2428, 8408],
    'ten-around': [106, 2888, 2722, 2722, 2029, 7040]
  }
};

const experiments = [];
for (const [mode, pageReset] of [['continuous', false], ['page-reset', true]]) {
  for (const [name, offsets] of WINDOWS) {
    const global = classify(offsets, pageReset, 'global', trueBreak);
    const previous = classify(offsets, pageReset, 'previous-page', trueBreak);
    const next = classify(offsets, pageReset, 'next-page', trueBreak);
    assert.deepEqual([
      global.groups, global.errors, previous.errors, next.errors,
      global.zeroBreaks, global.zeroContinues
    ], expected[mode][name]);

    if (mode === 'continuous' && name === 'ten-around') {
      assert.deepEqual([
        next.truePositives, next.falsePositives,
        next.falseNegatives, next.trueNegatives
      ], [224, 46, 2671, 10014]);
    }

    // A deliberately artificial source-dependent delimiter rule:
    // "break if the current five-back echo bit is set".
    // Because its labels are an EXACT deterministic function of a mask,
    // all-secret classification must recover the invented rule with zero errors.
    const plant = new Uint8Array(N);
    for (let g = 1; g < N; g++) {
      plant[g] = mask(g, offsets, pageReset) & 1;
    }
    const plantedCount = plant.reduce((sum, bit) => sum + bit, 0);
    assert(plantedCount > 100 && plantedCount < 2000);
    assert.equal(classify(offsets, pageReset, 'global', plant).errors, 0);
    assert.equal(classify(offsets, pageReset, 'previous-page', plant).errors, 0);

    // Delimiter-only "encryption" / inverse is lossless on the plant.
    // Splitting on exactly the synthetic predicted gaps and concatenating
    // returns EVERY source rune, including real cross-page carried words.
    const segments = [];
    let start = 0;
    for (let g = 1; g < N; g++) {
      if (plant[g]) {
        segments.push(original.slice(start, g));
        start = g;
      }
    }
    segments.push(original.slice(start));
    assert.deepEqual(segments.flat(), original);
    assert.equal(segments.length, plantedCount + 1);

    experiments.push({
      clock: mode,
      mask: name,
      observedMasks: global.groups,
      exactMinimumErrors: global.errors,
      independentPreviousPageLookupMinErrors: previous.errors,
      independentNextPageLookupMinErrors: next.errors,
      zeroMaskBreaks: global.zeroBreaks,
      zeroMaskNonbreaks: global.zeroContinues,
      plantedRuleErrors: 0
    });
  }
}
const minPageErrors = Math.min(...experiments.flatMap(e =>
  [e.independentPreviousPageLookupMinErrors, e.independentNextPageLookupMinErrors]));
assert.equal(minPageErrors, 2717);
console.log(JSON.stringify({
  input: 'original unchanged LP2 p0-p55 rune stream and semantic printed breaks',
  sourceRunes: N,
  sourceWords: words.length,
  sourceGaps: N - 1,
  originalBreaks: words.length - 1,
  sourcePageCount: pageCounts.size,
  sixOriginalModelFamilies: experiments,
  bestEvenWithIndependentSecretPageTables: minPageErrors,
  meaning: 'Local lag-five echo masks alone cannot reconstruct actual delimiters.'
}, null, 2));

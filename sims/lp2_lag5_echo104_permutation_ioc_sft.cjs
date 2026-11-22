'use strict';

/**
 * Source-specific all-order transposition barrier for the 104 five-back
 * echo runes and the middle-page 104-cell LP2 numerical receiver.
 *
 * A pure reordering of all 104 runes preserves the 29-symbol histogram,
 * and therefore the index of coincidence and the exact 424 ordered
 * same-symbol pairs. This SFT compares that invariant against every
 * 104-rune contiguous window of three pinned native-GP English controls.
 *
 * Node.js 22:
 *   node sims/lp2_lag5_echo104_permutation_ioc_sft.cjs
 *
 * This bound does not apply to substitutions, affine masks, nulls, or
 * genuine author prose not represented in the external reference corpora.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const byRune = new Map(gp.runes.map((r, i) => [r, i]));
const original = parseSharedCorpus();
assert.equal(original.words.length, 2896);
assert.equal(original.runeCount, 12956);
assert.equal(original.crossPageWords, 32);

const events = [];
for (const word of original.words) {
  const symbols = Array.from(word.runes, ch => byRune.get(ch));
  for (let j = 5; j < symbols.length; j++) {
    if (symbols[j] === symbols[j - 5]) events.push(symbols[j]);
  }
}
assert.equal(events.length, 104);
const length = events.length;
const denominator = length * (length - 1);

/** @param {number[]} symbols @returns {number} */
function pairNumerator(symbols) {
  const counts = new Array(29).fill(0);
  for (const s of symbols) counts[s]++;
  return counts.reduce((sum, c) => sum + c * (c - 1), 0);
}
const numerator = pairNumerator(events);
assert.equal(numerator, 424);

/**
 * An exact rolling window engine; compare integer ordered pair
 * numerators, so there are no floating point decisions.
 * @param {number[]} stream
 * @returns {{runes:number,windows:number,minimumPairs:number,
 *            maximumPairs:number,meanIoC:number,atOrBelowOriginal:number}}
 */
function windows(stream) {
  assert(stream.length >= length);
  const counts = new Array(29).fill(0);
  for (let i = 0; i < length; i++) counts[stream[i]]++;
  let pairs = counts.reduce((s, c) => s + c * (c - 1), 0);
  let minimumPairs = pairs;
  let maximumPairs = pairs;
  let sumPairs = 0;
  let atOrBelowOriginal = 0;
  for (let start = 0; start <= stream.length - length; start++) {
    if (start) {
      const removed = stream[start - 1];
      pairs -= 2 * (counts[removed] - 1);
      counts[removed]--;
      const added = stream[start + length - 1];
      pairs += 2 * counts[added];
      counts[added]++;
    }
    minimumPairs = Math.min(minimumPairs, pairs);
    maximumPairs = Math.max(maximumPairs, pairs);
    sumPairs += pairs;
    if (pairs <= numerator) atOrBelowOriginal++;
  }
  return {
    runes: stream.length,
    windows: stream.length - length + 1,
    minimumPairs, maximumPairs,
    meanIoC: sumPairs / ((stream.length - length + 1) * denominator),
    atOrBelowOriginal
  };
}
const names = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
const controls = names.map(([name, file]) => {
  const runes = (read(file).match(/[A-Za-z]+/g) || [])
    .flatMap(word => encodeSourceNativeGP(word));
  return {name, ...windows(runes)};
});
assert.deepEqual(controls.map(c => c.runes), [62492, 217106, 321327]);
assert.deepEqual(controls.map(c => c.minimumPairs), [480, 442, 444]);
assert.deepEqual(controls.map(c => c.atOrBelowOriginal), [0, 0, 0]);
const fullWindowCount = controls.reduce((s, c) => s + c.windows, 0);
assert.equal(fullWindowCount, 600616);

// A true source-native clear rune window, scrambled by an arbitrary
// deterministic 104-permutation, retains its exact pair numerator;
// its inverse can recover the original unencrypted 104-rune passage.
const clearLP1 = read('resources/transcriptions/lp1_wulfic_canonical.txt')
  .split('%')[3].match(/[\u16A0-\u16FF]/gu)
  .slice(0, 104).map(ch => byRune.get(ch));
const clearPairs = pairNumerator(clearLP1);
const permuted = [...clearLP1].reverse();
assert.equal(pairNumerator(permuted), clearPairs);
assert.deepEqual([...permuted].reverse(), clearLP1);
assert(clearPairs > numerator);

console.log(JSON.stringify({
  originalEchoes: length,
  originalOrderedEqualPairs: numerator,
  originalIoC: numerator / denominator,
  sameCountsUnderEveryPermutation: true,
  controls,
  evaluatedEnglishWindows: fullWindowCount,
  controlsWithAsFewEqualPairsAsOriginal: 0,
  sourceNativeReversalPositive: true,
  noUnknownPlaintextOrKey: true
}, null, 2));

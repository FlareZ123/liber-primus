'use strict';

/**
 * Original-input no-go for direct same-passage transfer from the known
 * 2013 PARABLE text (clear LP2 p57) into unsolved LP2 p55.
 *
 * Run from any directory with Node.js 22:
 *   node sims/lp2_p55_parable_suffix76_allsecret_sft.cjs
 *
 * No external dependencies or writes. The key-free 19-phase certificate
 * grants an arbitrary independent, non-injective GP29 substitution at
 * each phase; a planted source-native 19-phase positive must pass.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const transcript = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'),
  'utf8'
);
const page55 = corpus.pages.find((page) => page.page === 55).indices;
const page57 = corpus.pages.find((page) => page.page === 57).indices;
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const lastPage = transcript.split('%').at(-1);
const nativeWords = lastPage.split(/[-.]/).map((part) =>
  [...part].filter((rune) => runeToIndex.has(rune))
    .map((rune) => runeToIndex.get(rune))
).filter((word) => word.length > 0);
const prefix = nativeWords.slice(0, 4).flat();
const suffix = nativeWords.slice(4).flat();

assert.equal(page55.length, 76);
assert.equal(page57.length, 95);
assert.equal(nativeWords.length, 20);
assert.deepEqual(nativeWords.flat(), page57);
assert.equal(prefix.length, 19);
assert.equal(suffix.length, 76);
assert.deepEqual(prefix, page57.slice(0, 19));
assert.deepEqual(suffix, page57.slice(19));

/** @param {number[]} values */
function spectrum(values) {
  const counts = Array(29).fill(0);
  for (const symbol of values) counts[symbol] += 1;
  return {
    used: counts.filter((number) => number > 0).length,
    equalPairs: counts.reduce((sum, number) =>
      sum + number * (number - 1) / 2, 0),
    sortedCounts: [...counts].sort((a, b) => a - b),
  };
}

const target = spectrum(page55);
const knownSuffix = spectrum(suffix);
const entireParable = spectrum(page57);
assert.deepEqual([target.used, target.equalPairs], [25, 108]);
assert.deepEqual([knownSuffix.used, knownSuffix.equalPairs], [20, 180]);
assert.equal(entireParable.used, 22);
assert.ok(target.used > entireParable.used);
assert.notDeepEqual(target.sortedCounts, knownSuffix.sortedCounts);

// ANY fixed deterministic symbol map and arbitrary rearrangement of
// source symbols can use at most as many distinct symbols as its source.
// This applies even if an arbitrary 76 of all 95 p57 runes are selected.
for (let start = 0; start <= page57.length - 76; start += 1) {
  assert.ok(spectrum(page57.slice(start, start + 76)).used < 25);
}

/**
 * Exact minimum number of target changes required for source[i] to
 * map to target[i] through an independent stationary function
 * f_(i mod period): GF29 -> GF29.
 * @param {number[]} source
 * @param {number[]} targetValues
 * @param {number} period
 * @returns {{changes:number,contradictions:Array<{phase:number,input:number,positions:number[],outputs:number[]}>}}
 */
function phaseMapLowerBound(source, targetValues, period) {
  assert.equal(source.length, targetValues.length);
  const contradictions = [];
  let changes = 0;
  for (let phase = 0; phase < period; phase += 1) {
    const byInput = new Map();
    for (let pos = phase; pos < source.length; pos += period) {
      const symbol = source[pos];
      if (!byInput.has(symbol)) byInput.set(symbol, []);
      byInput.get(symbol).push({ pos, out: targetValues[pos] });
    }
    for (const [input, observations] of byInput) {
      const outputCounts = new Map();
      for (const obs of observations) {
        outputCounts.set(obs.out, (outputCounts.get(obs.out) || 0) + 1);
      }
      const maximum = Math.max(...outputCounts.values());
      changes += observations.length - maximum;
      if (outputCounts.size > 1) {
        contradictions.push({
          phase,
          input,
          positions: observations.map((obs) => obs.pos),
          outputs: observations.map((obs) => obs.out),
        });
      }
    }
  }
  return { changes, contradictions };
}

const actual = phaseMapLowerBound(suffix, page55, 19);
assert.equal(actual.changes, 2);
assert.deepEqual(
  actual.contradictions.map((item) => [
    item.phase, corpus.translit[item.input],
    item.positions, item.outputs.map((out) => corpus.translit[out])
  ]),
  [
    [1, 'M', [20, 39], ['U', 'IA']],
    [15, 'E', [53, 72], ['G', 'U']]
  ]
);

// An independent whole-source positive, not fitted to ciphertext.
// Each of the 19 phases has its own arbitrary fixed bijection.
const planted = suffix.map((letter, index) =>
  (7 * letter + 13 + (index % 19)) % 29);
assert.equal(phaseMapLowerBound(suffix, planted, 19).changes, 0);

console.log(JSON.stringify({
  p55: { runes: page55.length, distinct: target.used, equalPairs: target.equalPairs },
  p57: { runes: page57.length, distinct: entireParable.used },
  p57Prefix19: prefix.map((index) => corpus.translit[index]).join(''),
  p57Suffix76: { runes: suffix.length, distinct: knownSuffix.used, equalPairs: knownSuffix.equalPairs },
  allSecretPhase19MinimumChanges: actual.changes,
  contradictions: actual.contradictions,
  syntheticPhase19Changes: 0,
  outcome: 'Direct same-passage stationary and phase19 symbol-only transfers fail; no p55 plaintext or key recovered.'
}, null, 2));

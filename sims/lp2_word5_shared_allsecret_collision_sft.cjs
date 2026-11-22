'use strict';

/**
 * Source-native, all-secret five-phase shared-alphabet gate for original LP2.
 * A word resets its phase to zero. C[i] = S[i % 5](P[i]), with five
 * independent and completely unknown GP29 bijections shared by ALL words.
 * Equality counts within each phase are exactly invariant to all 29!^5 keys.
 * Run: node sims/lp2_word5_shared_allsecret_collision_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const runeRegex = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const printed = read('resources/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const original = (printed.match(runeRegex) || [])
  .map(word => Array.from(word, r => runeMap.get(r)));
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
const inventory = new Map();
for (const w of original) inventory.set(w.length, (inventory.get(w.length) || 0) + 1);

/**
 * Per-phase unordered-symbol collision counts. Arbitrary independent
 * secret bijections at each of the five phases preserve each numerator.
 * @param {number[][]} words
 */
function phaseStats(words) {
  const counts = Array.from({length:5}, () => new Uint32Array(29));
  for (const word of words) word.forEach((r, i) => counts[i % 5][r]++);
  const phases = counts.map(row => {
    const n = row.reduce((a, b) => a + b, 0);
    const equalOrderedPairs = row.reduce((a, b) => a + b * (b - 1), 0);
    return {n, equalOrderedPairs, ioc: equalOrderedPairs / (n * (n - 1))};
  });
  const num = phases.reduce((n, p) => n + p.equalOrderedPairs, 0);
  const den = phases.reduce((n, p) => n + p.n * (p.n - 1), 0);
  return {phases, num, den, pooledIoC: num / den};
}

/** @param {number[][]} native @returns {Map<number,number[][]>} */
function byLength(native) {
  const map = new Map();
  for (const word of native) {
    if (!map.has(word.length)) map.set(word.length, []);
    map.get(word.length).push(word);
  }
  return map;
}

/** @param {Map<number,number[][]>} pools @param {number} replicate */
function matchedNative(pools, replicate) {
  const out = [];
  for (const [length, number] of inventory) {
    const pool = pools.get(length);
    assert(pool && pool.length, 'missing source-native length '+length);
    for (let j = 0; j < number; j++) {
      out.push(pool[(replicate * 157 + j * 59 + (j >> 4) * 127) % pool.length]);
    }
  }
  assert.equal(out.length, original.length);
  assert.equal(out.flat().length, 12956);
  return out;
}
const actual = phaseStats(original);
assert.deepEqual(actual.phases.map(x => x.n), [3768, 3397, 2715, 1835, 1241]);
assert.deepEqual(actual.phases.map(x => x.equalOrderedPairs),
  [488716,397022,252930,115544,53088]);
assert.equal(actual.num, 1307300);
assert.equal(actual.den, 38003008);
const corpora = [
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt']
];
const controls = [];
let planted = false;
for (const [name, file] of corpora) {
  const native = (read(file).match(/[A-Za-z]+/g) || [])
    .map(word => encodeSourceNativeGP(word));
  const pools = byLength(native);
  const values = [];
  for (let replicate = 0; replicate < 20; replicate++) {
    const sample = matchedNative(pools, replicate);
    const observed = phaseStats(sample);
    values.push(observed.pooledIoC);
    assert(observed.pooledIoC > 0.0685, name + ' native-GP lower bound');
    if (!planted) {
      // Five independent, secret, shared GP29 bijections.
      const cipher = sample.map(word => word.map(
        (plain, i) => (11 * plain + (i % 5) * 7 + 3) % 29));
      const after = phaseStats(cipher);
      assert.deepEqual(after.phases.map(p => p.equalOrderedPairs),
        observed.phases.map(p => p.equalOrderedPairs));
      assert.deepEqual(after.phases.map(p => p.n),
        observed.phases.map(p => p.n));
      const decoded = cipher.map(word => word.map((c, i) =>
        (8 * ((c - ((i % 5) * 7 + 3) + 29) % 29)) % 29));
      assert.deepEqual(decoded, sample);
      assert.equal(decoded.flat().length, 12956);
      planted = true;
    }
  }
  controls.push({name, samples:values.length,
    minimum:Math.min(...values), maximum:Math.max(...values),
    mean:values.reduce((a,b)=>a+b,0)/values.length});
}
assert.equal(controls.length,3);
assert(planted);
console.log(JSON.stringify({
  result:'No source-native GP29 original plaintext under a globally shared five-phase bijective word-local substitution',
  exactOriginalWordCount:original.length, exactOriginalRunes:12956,
  original:actual, sourceNativeLengthMatchedControls:controls,
  positivePlantExactRunes:12956, distinctSecretKeysGranted:'(29!)^5',
  scope:'One global five-phase secret; all words phase-zero; authentic breaks including cross-page carries; native-English controls only',
  unknownPlaintextRecovered:0
},null,2));

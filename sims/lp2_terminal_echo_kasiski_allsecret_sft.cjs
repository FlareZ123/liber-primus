"use strict";

/**
 * Kasiski-distance four-divisor, all-secret, original-input gate.
 *
 * node sims/lp2_terminal_echo_kasiski_allsecret_sft.cjs
 *
 * For each divisor of the unique six-rune repeated phrase's global distance,
 * tests the exact same-phase collision invariant of an arbitrary secret,
 * stationary GP29 substitution for every phase. No secret alphabet is
 * fitted. The source-native control encoder is independently calibrated
 * against solved original LP1 runes and solved LP2 p57.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const original = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const unknown = original.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(unknown.length, 12956);

// Source-original repeated six-rune words, at the two locations discovered
// without using a candidate plaintext or a periodic cipher.
const positions = [6555, 12950];
const phrase = [23, 11, 1, 17, 18, 10];
for (const start of positions) {
  assert.deepEqual(unknown.slice(start, start + 6), phrase);
}
const distance = positions[1] - positions[0];
assert.equal(distance, 6395);
const periods = [];
for (let p = 1; p <= distance; p++)
  if (distance % p === 0) periods.push(p);
assert.deepEqual(periods, [1, 5, 1279, 6395]);

/**
 * A position-wise cipher C[i] = pi_{i mod period}(P[i]) with an
 * arbitrary independent GP29 permutation pi for every key phase
 * preserves the exact count of same-symbol pairs within each phase.
 * @param {number[]} sequence
 * @param {number} period
 * @returns {{equal:number,pairs:number,rate:number}}
 */
function collisionStat(sequence, period) {
  const buckets = Array.from({length: period}, () => new Uint16Array(29));
  for (let i = 0; i < sequence.length; i++)
    buckets[i % period][sequence[i]]++;
  let equal = 0;
  let pairs = 0;
  for (const bucket of buckets) {
    let count = 0;
    for (const n of bucket) {
      count += n;
      equal += n * (n - 1) / 2;
    }
    pairs += count * (count - 1) / 2;
  }
  return {equal, pairs, rate: equal / pairs};
}

const observed = periods.map(period => collisionStat(unknown, period));
assert.deepEqual(observed.map(x => [x.equal, x.pairs]), [
  [2893513, 83922490],
  [578999, 16779316],
  [2095, 59215],
  [203, 6727]
]);

const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const samples = [];
const firstControl = {};
for (const [name, file] of controls) {
  const native = encodeSourceNativeGP(read(file));
  for (let offset = 0; offset + unknown.length <= native.length;
    offset += unknown.length) {
    const window = native.slice(offset, offset + unknown.length);
    if (!firstControl[name]) firstControl[name] = window;
    samples.push({
      name, offset,
      statistics: periods.map(period => collisionStat(window, period))
    });
  }
}
assert.equal(samples.length, 44);
const summary = periods.map((period, k) => {
  const rates = samples.map(x => x.statistics[k].rate);
  const minimum = Math.min(...rates);
  assert(minimum > observed[k].rate);
  return {
    period,
    ciphertext: observed[k],
    nativeControlMin: minimum,
    nativeControlMax: Math.max(...rates),
    minNativeEqualPairs: Math.min(...samples.map(x => x.statistics[k].equal)),
    controlWindows: samples.length
  };
});
assert(Math.abs(summary[2].nativeControlMin - 0.056489065270624) < 1e-12);
assert(Math.abs(summary[3].nativeControlMin - 0.051583172290768545) < 1e-12);

// Positive-control inverse for the non-affine, all-secret construction:
// independent Fisher-Yates GP29 alphabets at every phase, then decrypt.
let state = 0x12793301;
/** @returns {number} */
function rand32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const plaintext = firstControl.Shakespeare;
for (const period of [1279, 6395]) {
  const forward = [];
  const inverse = [];
  for (let phase = 0; phase < period; phase++) {
    const permutation = Array.from({length:29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = rand32() % (i + 1);
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    const undo = [];
    for (let i = 0; i < 29; i++) undo[permutation[i]] = i;
    forward.push(permutation);
    inverse.push(undo);
  }
  const ciphertext = plaintext.map((v, i) => forward[i % period][v]);
  assert.deepEqual(
    ciphertext.map((v, i) => inverse[i % period][v]),
    plaintext
  );
  const before = collisionStat(plaintext, period);
  const after = collisionStat(ciphertext, period);
  assert.deepEqual(after, before);
}

console.log(JSON.stringify({
  originalUnknownRunes: unknown.length,
  repeatedWordPairStartOffsets: positions,
  distance,
  candidatePeriods: periods,
  sourceNativeControlWindows: samples.length,
  sourceNativeControlNames: controls.map(x => x[0]),
  results: summary,
  syntheticNonAffineSecretPermutationPlants: [1279, 6395],
  status: "all four direct-period models source-native GP-English negative; no key or unknown plaintext"
}, null, 2));

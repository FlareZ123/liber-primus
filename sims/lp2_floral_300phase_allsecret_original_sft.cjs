"use strict";

/**
 * Source-registered original 3,000-rune floral chapter as ten 300-rune
 * blocks. A fixed GP29 bijection at each of 300 phases, even 300 unrelated
 * fully secret 29! alphabets, preserves aligned-block equality.
 *
 * Reproduce with Windows Node 22:
 *   node sims/lp2_floral_300phase_allsecret_original_sft.cjs
 *
 * Source: original LP2 physical p40..53 and p54..55, original printed
 * red headings, source-attested GP orthography calibrated against solved
 * LP1 and p57; independent Gibran/Emerson natural-language controls.
 *
 * Scope: a stationary, phase-aligned per-rune substitution after exactly
 * the eight p40 red heading runes. A changing clock, F-transparent skip,
 * ciphertext-dependent state or different plaintext alphabet is untested.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const corpus = gp.pages.slice(40, 54);
assert.deepEqual(corpus.map(p => p.page), Array.from({length: 14}, (_, i) => i + 40));
const full = corpus.flatMap(p => p.indices);
const terminal = gp.pages.slice(54, 56).flatMap(p => p.indices);
assert.equal(full.length, 3008);
assert.equal(terminal.length, 308);
const body = full.slice(8);
assert.equal(body.length, 3000);
assert.equal(terminal.slice(9).length, 299);
const BLOCK = 300;
const BLOCKS = 10;
const mod = x => (x % 29 + 29) % 29;

const train = encodeSourceNativeGP(read("resources/control/shakespeare_first300k.txt"));
const gibran = encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"));
const emerson = encodeSourceNativeGP(read("resources/control/emerson_essays_2944.txt"));
assert.equal(train.length, 217106);

const hist = new Float64Array(29);
for (const v of train) hist[v]++;
const freq = Array.from(hist, n => n / train.length);
const q = Array.from({length: 29}, (_, difference) =>
  freq.reduce((sum, f, i) => sum + f * freq[mod(i - difference)], 0));
assert(Math.abs(q.reduce((a, b) => a + b, 0) - 1) < 1e-12);

/**
 * 45 aligned 300-rune block pairs, 13,500 comparisons.
 * Both measures are additive-pad invariant. The equality count is also
 * invariant under EVERY bijection chosen independently for each phase.
 *
 * @param {number[]} a
 */
function aligned(a) {
  assert.equal(a.length, BLOCKS * BLOCK);
  let same = 0, logDifference = 0;
  for (let i = 0; i < BLOCK; i++) {
    for (let left = 0; left < BLOCKS; left++) {
      const x = a[left * BLOCK + i];
      for (let right = left + 1; right < BLOCKS; right++) {
        const d = mod(x - a[right * BLOCK + i]);
        same += Number(d === 0);
        logDifference += Math.log(29 * q[d]);
      }
    }
  }
  return {same, logDifference};
}
const original = aligned(body);
assert.equal(original.same, 455);
assert(Math.abs(original.logDifference + 266.039080937268) < 1e-7);

const reference = {};
for (const [name, source] of [["Gibran", gibran], ["Emerson", emerson]]) {
  const values = [];
  for (let k = 0; k < 300; k++) {
    const at = (137 + 7919 * k) % (source.length - 3000);
    values.push(aligned(source.slice(at, at + 3000)));
  }
  const sortedSame = values.map(x => x.same).sort((a, b) => a - b);
  const sortedScore = values.map(x => x.logDifference).sort((a, b) => a - b);
  reference[name] = {
    windows: values.length,
    minimumAlignedEquals: sortedSame[0],
    medianAlignedEquals: sortedSame[150],
    minimumLogEvidence: sortedScore[0],
    medianLogEvidence: sortedScore[150],
    windowsAtOrBelowOriginal: values.filter(v => v.same <= original.same).length
  };
}
assert.equal(reference.Gibran.minimumAlignedEquals, 721);
assert.equal(reference.Emerson.minimumAlignedEquals, 742);
assert.equal(reference.Gibran.windowsAtOrBelowOriginal, 0);
assert.equal(reference.Emerson.windowsAtOrBelowOriginal, 0);

// Genuine 300-independent-secret-alphabet positive plant.
let rng = 0x3301f10a >>> 0;
function next32() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
const permutation = Array.from({length: BLOCK}, () => {
  const p = Array.from({length: 29}, (_, i) => i);
  for (let j = p.length - 1; j > 0; j--) {
    const k = next32() % (j + 1);
    [p[j], p[k]] = [p[k], p[j]];
  }
  return p;
});
const inverse = permutation.map(p => {
  const inv = Array(29);
  p.forEach((v, i) => {inv[v] = i;});
  return inv;
});
const native = gibran.slice(113, 3113);
const encrypted = native.map((p, i) => permutation[i % BLOCK][p]);
const recovered = encrypted.map((c, i) => inverse[i % BLOCK][c]);
assert.deepEqual(recovered, native);
assert.equal(aligned(encrypted).same, aligned(native).same);

// The stricter reused-additive-key model also preserves the difference law.
const key = Array.from({length: BLOCK}, () => next32() % 29);
const masked = native.map((p, i) => mod(p + key[i % BLOCK]));
assert.deepEqual(masked.map((c, i) => mod(c - key[i % BLOCK])), native);
assert.equal(aligned(masked).same, aligned(native).same);
assert(Math.abs(aligned(masked).logDifference - aligned(native).logDifference) < 1e-8);

console.log(JSON.stringify({
  originalSource: {floralChapterPages: "40..53", redRunes: 8,
    originalBodyLength: body.length, blocks: BLOCKS,
    blockLength: BLOCK, possibleAlignedPairs: 13500},
  original, nativeControls: reference,
  positiveSecretPermutationPlant: {alphabets: BLOCK, recoveredRunes: 3000,
    sameBefore: aligned(native).same, sameAfter: aligned(encrypted).same},
  positiveAdditiveKeyPlant: {period: BLOCK, recoveredRunes: 3000},
  decision: "Source-fixed phase-300 stationary GP29 bijections fail native-GP equality, even with 300 independently secret 29! phase maps; no original plaintext."
}, null, 2));

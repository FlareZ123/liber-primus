"use strict";
/**
 * Agent7, 23 Nov 2026. Source-frozen, complete GP29 original-cipher test.
 * p15 authentic centered spiral supplies 3299,3298 modulo29 = 22,21.
 * Test C_i = P_i + sign*K_i (mod29);
 * K_(i+2) = K_i + K_(i+1) + C_i (mod29).
 * Continuous runic stream p16..p55, including original page crossings.
 * Plaintext-feedback is independently investigated in Director #2374;
 * THIS test uses preceding C, so it is a distinct deterministic architecture.
 *
 * Run: node sims/lp2_p15_fibonacci_cipherfeedback_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const originalPages = corpus.pages.filter(p => p.page >= 16 && p.page <= 55 && p.indices.length);
const source = originalPages.flatMap(p => p.indices);
assert.equal(source.length, 9194);
const starts = new Map();
for (let i = 0, offset = 0; i < originalPages.length; i++) {
  const p = originalPages[i];
  starts.set(p.page, offset);
  offset += p.indices.length;
}
const trainStop = starts.get(22);
const holdStart = starts.get(40);
const holdStop = starts.get(54);
assert.equal(trainStop, 1613);
assert.equal(holdStop - holdStart, 3008);
const mod = v => (v % 29 + 29) % 29;

/**
 * @param {number[]} cipher original/plant GP29 cipher runes
 * @param {number} initial0 modulo29
 * @param {number} initial1 modulo29
 * @param {1|-1} sign cipher orientation
 * @returns {number[]} decrypted GP29 plaintext runes
 */
function decode(cipher, initial0, initial1, sign) {
  let k0 = initial0, k1 = initial1;
  const out = [];
  for (const c of cipher) {
    out.push(mod(c - sign * k0));
    const next = mod(k0 + k1 + c);
    k0 = k1;
    k1 = next;
  }
  return out;
}

/**
 * @param {number[]} plain GP29 plaintext runes
 * @param {number} initial0 modulo29
 * @param {number} initial1 modulo29
 * @param {1|-1} sign cipher orientation
 * @returns {number[]} encrypted GP29 runes
 */
function encode(plain, initial0, initial1, sign) {
  let k0 = initial0, k1 = initial1;
  const out = [];
  for (const p of plain) {
    const c = mod(p + sign * k0);
    out.push(c);
    const next = mod(k0 + k1 + c);
    k0 = k1;
    k1 = next;
  }
  return out;
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
function sampleStats(plain) {
  return {
    train: ioc(plain.slice(0, trainStop)),
    hold: ioc(plain.slice(holdStart, holdStop)),
    all: ioc(plain)
  };
}
const seed0 = 3299 % 29, seed1 = 3298 % 29;
assert.deepEqual([seed0, seed1], [22, 21]);
const results = [];
for (const sign of [1, -1]) {
  let bestTrain = { ioc: -1 }, bestHold = { ioc: -1 };
  let authenticSeed;
  for (let x = 0; x < 29; x++) for (let y = 0; y < 29; y++) {
    const plain = decode(source, x, y, sign);
    const score = sampleStats(plain);
    assert.deepEqual(encode(plain, x, y, sign), source);
    if (score.train > bestTrain.ioc) bestTrain = { x, y, ioc: score.train, hold: score.hold };
    if (score.hold > bestHold.ioc) bestHold = { x, y, ioc: score.hold, train: score.train };
    if (x === seed0 && y === seed1) authenticSeed = score;
  }
  results.push({ sign, bestTrain, bestHold, authenticSeed });
}
assert(Math.max(...results.map(r => r.bestTrain.ioc)) < 0.036);
assert(Math.max(...results.map(r => r.bestHold.ioc)) < 0.036);
// All 841 seed differences are period14: F_14=377=13*29, F_15=610=21*29+1.
// Check the homogeneous recurrence of two independently chosen IVs on original input.
const base = decode(source, 0, 0, 1);
const shifted = decode(source, 22, 21, 1);
for (let i = 0; i < source.length - 14; i++)
  assert.equal(mod(shifted[i] - base[i]), mod(shifted[i + 14] - base[i + 14]));

// Authentic solved p57 is already plaintext in this very GP29 alphabet.
const clearP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(clearP57.length, 95);
for (const sign of [1, -1]) {
  for (const [a, b] of [[22, 21], [0, 0], [19, 3]]) {
    const plant = encode(clearP57, a, b, sign);
    assert.deepEqual(decode(plant, a, b, sign), clearP57);
  }
}
const textToGP = s => {
  const terms = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const words = s.toUpperCase().match(/[A-Z]+/g) || [];
  const sequence = [];
  for (const raw of words) {
    const word = raw.replace(/QU/g, "CW").replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
    for (let j = 0; j < word.length;) {
      if (word.startsWith("ING", j)) { sequence.push(21); j += 3; continue; }
      if (word.startsWith("IO", j)) { sequence.push(27); j += 2; continue; }
      const match = terms.find(t => word.startsWith(t.s, j));
      assert(match, "Cannot GP-encode token " + word + " at " + j);
      sequence.push(match.i);
      j += match.s.length;
    }
  }
  return sequence;
};
const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
].map(([name, file]) => {
  const values = textToGP(fs.readFileSync(path.join(root, file), "utf8"));
  assert(values.length >= source.length);
  const witness = values.slice(0, source.length);
  for (const sign of [1, -1]) {
    const plant = encode(witness, seed0, seed1, sign);
    assert.deepEqual(decode(plant, seed0, seed1, sign), witness);
  }
  return { name, native: sampleStats(witness), originalLength: witness.length };
});
console.log(JSON.stringify({
  experiment: "p15-source-seeded-ciphertext-feedback-fibonacci-GP29",
  recurrence: "C=P+sign*K, nextK=K0+K1+C (mod29)",
  sourceLength: source.length, originalTrainingRunes: trainStop,
  originalHoldoutRunes: holdStop - holdStart, originalSeed: [seed0, seed1],
  all841SeedsBothSigns: results, nativeGPControls: controls,
  authenticClearP57PlantLength: clearP57.length,
  status: "Finite direct model negative: no unknown plaintext/key identified."
}, null, 2));
console.log("PASS");

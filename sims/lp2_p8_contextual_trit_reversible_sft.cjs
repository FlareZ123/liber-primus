"use strict";

/**
 * Original LP2 p8 contextual ternary-register inversion gate.
 *
 * Purpose: test exactly two ciphertext-recoverable, value-changing innovation
 * streams for whether the 243 black p8 runes hide a full order-five ternary
 * de Bruijn orbit. Both streams are invertible given the emitted GF29
 * innovations and five visibly preceding p8 heading runes. The trit is the
 * innovation modulo 3; its accompanying quotient preserves information.
 *
 * Windows 11 / Node.js 22 CommonJS:
 *   node sims/lp2_p8_contextual_trit_reversible_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const page7 = corpus.pages[7].indices;
const page8 = corpus.pages[8].indices;
const page9 = corpus.pages[9].indices;

assert.equal(page7.length, 208);
assert.equal(page8.length, 255);
assert.equal(page9.length, 268);
assert.deepEqual(page7.slice(194), [23, 3, 22, 16, 2, 25, 5, 7, 11, 14, 28, 6, 28, 19]);
assert.deepEqual(page8.slice(0, 12), [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);

const sourceWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
const p7Products = sourceWords.map(word => word.reduce((p, r) => p * r % 29, 1));
assert.deepEqual(p7Products, [11, 26, 8, 15, 2]);
const models = [
  { name: "one-back modulo-29 difference", coefficients: [1] },
  { name: "source p7 five-product GF29 feedback", coefficients: p7Products }
];

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/**
 * Compute lossless GF29 innovations at the specified positions.
 * @param {number[]} ciphertext
 * @param {number} start
 * @param {number} count
 * @param {number[]} coefficients
 * @returns {number[]}
 */
function innovations(ciphertext, start, count, coefficients) {
  assert(start >= coefficients.length);
  assert(start + count <= ciphertext.length);
  const result = [];
  for (let i = start; i < start + count; i++) {
    let x = ciphertext[i];
    for (let k = 0; k < coefficients.length; k++) {
      x -= coefficients[k] * ciphertext[i - 1 - k];
    }
    result.push(mod29(x));
  }
  return result;
}

/**
 * Reconstruct the exact GP29 ciphertext from innovations and a source prefix.
 * @param {number[]} prefix
 * @param {number[]} newInnovations
 * @param {number[]} coefficients
 * @returns {number[]}
 */
function reconstruct(prefix, newInnovations, coefficients) {
  assert(prefix.length >= coefficients.length);
  const result = prefix.slice();
  for (const d of newInnovations) {
    let x = d;
    for (let k = 0; k < coefficients.length; k++) {
      x += coefficients[k] * result[result.length - 1 - k];
    }
    result.push(mod29(x));
  }
  return result;
}

/**
 * Count distinct cyclic five-trit windows. Exactly 243 is necessary for B(3,5).
 * @param {number[]} residues GF29 innovations in [0,28].
 * @returns {number}
 */
function distinctFive(residues) {
  assert.equal(residues.length, 243);
  const seen = new Uint8Array(243);
  for (let i = 0; i < 243; i++) {
    let code = 0;
    for (let j = 0; j < 5; j++) {
      code = 3 * code + (residues[(i + j) % 243] % 3);
    }
    seen[code] = 1;
  }
  return seen.reduce((n, x) => n + x, 0);
}

/**
 * Fixed FKM construction of cyclic B(alphabet, order).
 * @param {number} alphabet
 * @param {number} order
 * @returns {number[]}
 */
function deBruijn(alphabet, order) {
  const a = Array(alphabet * order + 1).fill(0);
  const output = [];
  /** @param {number} t @param {number} p */
  function walk(t, p) {
    if (t > order) {
      if (order % p === 0) {
        for (let i = 1; i <= p; i++) output.push(a[i]);
      }
      return;
    }
    a[t] = a[t - p];
    walk(t + 1, p);
    for (let j = a[t - p] + 1; j < alphabet; j++) {
      a[t] = j;
      walk(t + 1, t);
    }
  }
  walk(1, 1);
  return output;
}

const positive = deBruijn(3, 5);
assert.equal(positive.length, 243);
assert.equal(distinctFive(positive), 243);

const results = [];
for (const model of models) {
  // Original experiment: precisely the printed red12→black243 transition on p8.
  const original = innovations(page8, 12, 243, model.coefficients);
  assert.deepEqual(
    reconstruct(page8.slice(0, 12), original, model.coefficients),
    page8
  );

  // Original disjoint holdout: p9 first243, carrying real last-five p8 states.
  const p9Context = [...page8.slice(-5), ...page9.slice(0, 243)];
  const holdout = innovations(p9Context, 5, 243, model.coefficients);
  assert.deepEqual(
    reconstruct(p9Context.slice(0, 5), holdout, model.coefficients),
    p9Context
  );

  // A positive ciphertext plant generated with precisely the real p8 red
  // heading prefix and the SAME recurrence, not a free map or sampled decoder.
  const plantedCipher = reconstruct(page8.slice(0, 12), positive, model.coefficients);
  assert.deepEqual(innovations(plantedCipher, 12, 243, model.coefficients), positive);
  assert.equal(distinctFive(innovations(plantedCipher, 12, 243, model.coefficients)), 243);

  const p8Distinct = distinctFive(original);
  const p9Distinct = distinctFive(holdout);
  const p8TritCounts = [0, 1, 2].map(t => original.filter(d => d % 3 === t).length);
  const p9TritCounts = [0, 1, 2].map(t => holdout.filter(d => d % 3 === t).length);
  const expected = model.coefficients.length === 1
    ? { p8Distinct: 164, p9Distinct: 160, p8TritCounts: [74, 83, 86], p9TritCounts: [83, 84, 76] }
    : { p8Distinct: 155, p9Distinct: 153, p8TritCounts: [104, 69, 70], p9TritCounts: [87, 87, 69] };
  assert.deepEqual({ p8Distinct, p9Distinct, p8TritCounts, p9TritCounts }, expected);
  results.push({ name: model.name, coefficients: model.coefficients, ...expected, positiveDistinct: 243, originalRoundTrip: 243, holdoutRoundTrip: 243 });
}

console.log(JSON.stringify({
  source: "unchanged physical p7 final red14, p8 red12+black243, p9 first243",
  operation: "GF29 innovation = C_i - sum(a_k * C_(i-k)); trit = innovation mod3; quotient retained",
  requiredDeBruijnUniqueFiveTuples: 243,
  verdict: "neither two typed contextual maps yields a complete ternary B(3,5); no LP2 plaintext/key",
  results
}, null, 2));

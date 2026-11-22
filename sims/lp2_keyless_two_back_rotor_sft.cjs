"use strict";

/**
 * Source-native, exact GP29 counterexample to uniquely inferring an aperiodic
 * 28-symbol running key from LP2's low-doublet first-order fingerprint.
 *
 * Run from repository root: node sims/lp2_keyless_two_back_rotor_sft.cjs
 * Source data: resources/external/relikd-solved-gp29-native-v1.json
 * Actual LP2 source: resources/liber-primus/lp2-corpus.json
 *
 * Scientific status: countermodel to an exclusive statistical interpretation;
 * decoded unknown LP2 text is nonlinguistic, and no Cicada-authored opcode is known.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const solved = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "external", "relikd-solved-gp29-native-v1.json"), "utf8"));
const original = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const alphabet = original.runes;
assert.equal(alphabet.length, 29);
assert.deepEqual(solved.runes, alphabet);

const runeIndex = new Map(alphabet.map((rune, index) => [rune, index]));
const mod = (value, modulus) => (value % modulus + modulus) % modulus;

/**
 * The 29-symbol state transition is a permutation for each fixed prior state.
 * With u=C[i-1] and v=C[i-2], a rare literal EA (index28) yields step zero;
 * every other 0..27 plaintext index maps bijectively to a step in 1..28:
 *   s=0 if P=28 else 1 + ((P+v) mod 28)
 *   C=(u+s) mod 29
 * Both u and v begin at zero at every independently framed section/page.
 * The model has no secret key, running key, lookup table, or hidden exceptions.
 *
 * @param {readonly number[]} plaintext
 * @returns {number[]}
 */
function encrypt(plaintext) {
  let u = 0;
  let v = 0;
  const out = [];
  for (const p of plaintext) {
    assert.ok(Number.isInteger(p) && p >= 0 && p < 29);
    const step = p === 28 ? 0 : 1 + mod(p + v, 28);
    const c = mod(u + step, 29);
    out.push(c);
    v = u;
    u = c;
  }
  return out;
}

/**
 * Inverts all 29 possible original ciphertext glyphs in every prior state.
 * @param {readonly number[]} ciphertext
 * @returns {number[]}
 */
function decrypt(ciphertext) {
  let u = 0;
  let v = 0;
  const out = [];
  for (const c of ciphertext) {
    assert.ok(Number.isInteger(c) && c >= 0 && c < 29);
    const step = mod(c - u, 29);
    out.push(step === 0 ? 28 : mod(step - 1 - v, 28));
    v = u;
    u = c;
  }
  return out;
}

/** @param {readonly number[]} symbols @returns {number} */
function normalizedIoc(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  const n = symbols.length;
  return 29 * counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

/**
 * Chi-square of 28 nonzero step bins conditioned on the immediately prior
 * ciphertext rune. This is a descriptive sparse 29x28 contingency score,
 * not an asymptotically calibrated p-value at ~2,970 samples.
 *
 * @param {readonly number[][]} tapes
 */
function fingerprint(tapes) {
  const matrix = Array.from({ length: 29 }, () => Array(29).fill(0));
  let doublets = 0;
  let pairs = 0;
  const steps = [];
  for (const tape of tapes) {
    for (let i = 1; i < tape.length; i++) {
      const delta = mod(tape[i] - tape[i - 1], 29);
      matrix[tape[i - 1]][delta]++;
      doublets += Number(delta === 0);
      pairs++;
      steps.push(delta);
    }
  }
  let chi = 0;
  for (const row of matrix) {
    const total = row.slice(1).reduce((sum, count) => sum + count, 0);
    for (let step = 1; step < 29; step++) {
      const expectation = total / 28;
      if (expectation > 0) chi += (row[step] - expectation) ** 2 / expectation;
    }
  }
  const letters = tapes.flat();
  return {
    runes: letters.length,
    adjacent_pairs: pairs,
    repeated_adjacent_pairs: doublets,
    repeated_fraction: doublets / pairs,
    cipher_ioc: normalizedIoc(letters),
    nonzero_step_ioc: normalizedIoc(steps.filter(step => step !== 0)),
    chi2_nonzero_conditioned_prior_cipher: chi,
    chi2_nominal_df: 29 * 27,
  };
}

const plainTapes = solved.sections.map(section =>
  Array.from(section.source_text).filter(rune => runeIndex.has(rune)).map(rune => runeIndex.get(rune))
);
const nativePlain = plainTapes.flat();
assert.equal(nativePlain.length, 2979);
assert.equal(nativePlain.filter(rune => rune === 28).length, 20);
for (const plain of plainTapes) {
  assert.deepEqual(decrypt(encrypt(plain)), plain);
}
const encoded = plainTapes.map(encrypt);
const control = fingerprint(encoded);
assert.equal(control.repeated_adjacent_pairs, 20);
assert.ok(Math.abs(control.cipher_ioc - 0.9957161514077386) < 1e-10);
assert.ok(Math.abs(control.nonzero_step_ioc - 1.0369936376019449) < 1e-10);
assert.ok(Math.abs(control.chi2_nonzero_conditioned_prior_cipher - 797.8856467944341) < 1e-7);

const runePages = original.pages
  .filter(page => page.page >= 0 && page.page <= 55 && Array.isArray(page.indices) && page.indices.length > 0);
assert.equal(runePages.length, 55);
const sourceCount = runePages.reduce((n, page) => n + page.indices.length, 0);
assert.equal(sourceCount, 12956);
const sourceCipher = runePages.map(page => page.indices);
const observed = fingerprint(sourceCipher);
assert.equal(observed.repeated_adjacent_pairs, 86);
assert.equal(observed.adjacent_pairs, 12901);

let unknownDeciphered = 0;
let unknownEA = 0;
const beginnings = [];
for (const page of runePages) {
  const candidate = decrypt(page.indices);
  assert.equal(candidate.length, page.indices.length);
  assert.deepEqual(encrypt(candidate), page.indices);
  unknownDeciphered += candidate.length;
  unknownEA += candidate.filter(rune => rune === 28).length;
  if (page.page === 0) beginnings.push({ page: 0, first40_indices: candidate.slice(0, 40) });
}
assert.equal(unknownDeciphered, 12956);
assert.equal(unknownEA, 88); // Includes the first rune of two page-reset tapes.

const results = {
  model: "keyless lossless 29-symbol ciphertext-two-back rotor",
  formulas: "s=0 iff p=28, else s=1+((p+c_prev2)%28); c=(c_prev1+s)%29",
  solved_source_sections: solved.sections.length,
  solved_plain_runes: nativePlain.length,
  solved_plain_ea: 20,
  solved_plain_ioc: normalizedIoc(nativePlain),
  solved_control: control,
  original_unknown_ciphertext: observed,
  original_29_rune_roundtrip: unknownDeciphered,
  original_source_candidate_ea: unknownEA,
  original_candidate_first40: beginnings,
  conclusion: "Observed low doublet rate and near-flat one-back step statistics do not uniquely imply a long aperiodic key. The keyless model does not recover LP2 plaintext and is not source-selected."
};
console.log(JSON.stringify(results, null, 2));

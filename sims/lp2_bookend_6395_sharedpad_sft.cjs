"use strict";

/**
 * Source-fixed lag-6395 gate for the unique repeated LP2 two-word bookend.
 *
 * Hypothesis under test:
 *   C[i] = P[i] + K[i] (mod 29), with K[i + 6395] = K[i].
 *
 * Under that hypothesis, equality and differences at lag 6395 are
 * key-independent:
 *   C[i] === C[i+6395] iff P[i] === P[i+6395]
 *   C[i+6395]-C[i] === P[i+6395]-P[i] (mod 29).
 *
 * The lag is fixed by the two source-identical 3+3-rune word occurrences
 * beginning at global offsets 6555 and 12950.
 *
 * Run:
 *   node sims/lp2_bookend_6395_sharedpad_sft.cjs
 *
 * Dependencies: Node.js >=18 built-ins and checked-in repository resources.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {toGematria} = require("./previous_cipher_sbox_invariant.cjs");

const ROOT = path.resolve(__dirname, "..");
const MOD = 29;
const LAG = 6395;
const TOTAL = 12956;
const OVERLAP = TOTAL - LAG;
const ANCHOR_A = 6555;
const ANCHOR_B = 12950;
const ANCHOR_LENGTH = 6;

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const cipher = corpus.pages
  .filter((page) => page.status === "unsolved" && page.indices.length > 0)
  .flatMap((page) => page.indices);

assert.equal(cipher.length, TOTAL);
assert.equal(OVERLAP, 6561);
assert.deepEqual(
  cipher.slice(ANCHOR_A, ANCHOR_A + ANCHOR_LENGTH),
  cipher.slice(ANCHOR_B, ANCHOR_B + ANCHOR_LENGTH),
  "The source-fixed six-rune bookend must match exactly"
);
assert.equal(ANCHOR_B - ANCHOR_A, LAG);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % MOD) + MOD) % MOD;
}

/**
 * @param {number[]} source
 * @param {number} start
 * @returns {{equalities:number,differenceHistogram:number[]}}
 */
function lagProfile(source, start = 0) {
  assert.ok(start >= 0);
  assert.ok(start + TOTAL <= source.length);
  let equalities = 0;
  const differenceHistogram = Array(MOD).fill(0);
  for (let i = 0; i < OVERLAP; i++) {
    const left = source[start + i];
    const right = source[start + i + LAG];
    if (left === right) equalities++;
    differenceHistogram[mod29(right - left)]++;
  }
  assert.equal(differenceHistogram.reduce((sum, n) => sum + n, 0), OVERLAP);
  assert.equal(differenceHistogram[0], equalities);
  return {equalities, differenceHistogram};
}

/** @param {number} seed @returns {()=>number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * @param {number[]} values
 * @param {number} actual
 */
function distribution(values, actual) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, n) => sum + n, 0) / sorted.length;
  const variance = sorted.reduce((sum, n) => sum + (n - mean) ** 2, 0) /
    (sorted.length - 1);
  const at = (p) => sorted[Math.floor(p * (sorted.length - 1))];
  return {
    draws: sorted.length,
    min: sorted[0],
    q01: at(0.01),
    q05: at(0.05),
    median: at(0.5),
    q95: at(0.95),
    q99: at(0.99),
    max: sorted.at(-1),
    mean,
    sd: Math.sqrt(variance),
    atOrBelowActual: sorted.filter((n) => n <= actual).length,
    atOrAboveActual: sorted.filter((n) => n >= actual).length
  };
}

/**
 * @param {number[]} plaintext
 * @returns {{plainEqualities:number,cipherEqualities:number,exactDifferenceInvariant:boolean,exactRecovery:boolean}}
 */
function positivePlant(plaintext) {
  assert.ok(plaintext.length >= TOTAL);
  const plain = plaintext.slice(0, TOTAL);
  const random = xorshift32(0x63953301);
  const key = Array.from({length: LAG}, () => random() % MOD);
  const encrypted = plain.map((rune, i) => mod29(rune + key[i % LAG]));
  const recovered = encrypted.map((rune, i) => mod29(rune - key[i % LAG]));
  assert.deepEqual(recovered, plain);

  const p = lagProfile(plain);
  const c = lagProfile(encrypted);
  assert.equal(c.equalities, p.equalities);
  assert.deepEqual(c.differenceHistogram, p.differenceHistogram);
  return {
    plainEqualities: p.equalities,
    cipherEqualities: c.equalities,
    exactDifferenceInvariant: true,
    exactRecovery: true
  };
}

const observed = lagProfile(cipher);
let repeatedCipherSteps = 0;
let pairedCipherSteps = 0;
for (let i = 0; i + LAG + 1 < cipher.length; i++) {
  const leftStep = mod29(cipher[i + 1] - cipher[i]);
  const rightStep = mod29(cipher[i + LAG + 1] - cipher[i + LAG]);
  if (leftStep === rightStep) repeatedCipherSteps++;
  pairedCipherSteps++;
}
assert.equal(pairedCipherSteps, 6560);
assert.equal(repeatedCipherSteps, 255);
assert.notEqual(repeatedCipherSteps, pairedCipherSteps);
assert.equal(observed.equalities, 199);
assert.deepEqual(observed.differenceHistogram, [
  199,263,203,243,247,222,220,215,245,239,228,248,249,256,220,
  210,201,211,232,228,217,231,199,233,221,232,220,236,193
]);

const references = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 218800, 0x330100],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 63114, 0x330201],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 324630, 0x330302]
];

const referenceReports = [];
let shakespeare = null;
for (const [name, file, expectedRunes, seed] of references) {
  const source = toGematria(fs.readFileSync(path.join(ROOT, file), "utf8"));
  assert.equal(source.length, expectedRunes);
  if (name === "Shakespeare") shakespeare = source;

  const random = xorshift32(seed);
  const counts = [];
  for (let trial = 0; trial < 2000; trial++) {
    const start = random() % (source.length - TOTAL + 1);
    counts.push(lagProfile(source, start).equalities);
  }

  const frequency = Array(MOD).fill(0);
  for (const rune of source) frequency[rune]++;
  const collisionProbability = frequency.reduce(
    (sum, n) => sum + (n / source.length) ** 2, 0);

  const summary = distribution(counts, observed.equalities);
  assert.equal(summary.atOrBelowActual, 0);
  referenceReports.push({
    name,
    file,
    gpRunes: source.length,
    collisionProbability,
    lag6395: summary
  });
}

assert.ok(shakespeare);
const control = positivePlant(shakespeare);
assert.equal(control.plainEqualities, control.cipherEqualities);

const output = {
  classification:
    "Source-fixed negative for exact lag-6395 reused additive GP29 pad; no LP2 plaintext or key recovered",
  source: {
    unsolvedRunes: TOTAL,
    anchorA: ANCHOR_A,
    anchorB: ANCHOR_B,
    anchorLength: ANCHOR_LENGTH,
    lag: LAG,
    overlap: OVERLAP,
    anchorRunes: cipher.slice(ANCHOR_A, ANCHOR_A + ANCHOR_LENGTH)
  },
  invariant:
    "If C[i]=P[i]+K[i] mod29 and K[i+6395]=K[i], lag-6395 ciphertext equalities and difference values equal the corresponding plaintext quantities exactly.",
  original: {
    equalities: observed.equalities,
    equalityRate: observed.equalities / OVERLAP,
    differenceHistogram: observed.differenceHistogram,
    lagMatchedCipherSteps: repeatedCipherSteps,
    pairedCipherSteps,
    lagMatchedCipherStepRate: repeatedCipherSteps / pairedCipherSteps
  },
  nativeGpReferences: referenceReports,
  positiveControl: control,
  finding:
    "Every one of 6000 deterministic 12956-rune native-GP reference windows has more lag-6395 equalities than the original LP2 ciphertext. This rejects exact reused additive-pad state at the source-selected bookend lag for these native-GP registers. A literal repeated ciphertext-step keystream is also impossible because only 255 of 6560 paired steps match rather than all 6560.",
  scope:
    "Does not exclude plaintext-dependent rejection/key-skip consumption, nonlinear evolving state, a different language/register, non-GP intermediate symbols, or the possibility that the repeated bookend has no key-reset meaning."
};

console.log(JSON.stringify(output, null, 2));
module.exports = {lagProfile, distribution, positivePlant};

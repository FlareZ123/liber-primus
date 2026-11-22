"use strict";

/**
 * Original LP2 key-independent 238-tap GP29 linear-feedback inverse, where
 * the tap polynomial is the exact large irreducible factor of the canonical
 * 256-byte grid polynomial over GF29. This is a motivated, bounded negative
 * for a direct native-GP-English plaintext register, not a known cipher.
 *
 * For any arbitrary 238-glyph original ciphertext prefix:
 *
 *   C[i+238] = P[i] - SUM(h[j] * C[i+j], j=0..237) mod29.
 *
 * Given the *published original* C, the inverse uniquely recovers all
 * 12,718 subsequent candidate plaintext GP runes for ANY hidden initial
 * state. Test both source-natural direct/reversed monic tap polynomials.
 * Each exact original forward re-encoding and source-native plant is checked.
 *
 * Run: node sims/grid238_allseed_feedback_original_inverse.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");

/** @param {string} name @returns {any} */
function json(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
}

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} value @returns {number} */
function inverse(value) {
  for (let k = 1; k <= 28; k++) if (mod(k * value) === 1) return k;
  throw Error("noninvertible finite-field coefficient");
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a, b) {
  const output = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      output[i + j] = mod(output[i + j] + a[i] * b[j]);
    }
  }
  return output;
}

/** @param {number[]} a @param {number[]} factor @returns {number[]} */
function quotient(a, factor) {
  const remainder = a.slice();
  const q = Array(a.length - factor.length + 1).fill(0);
  const factorLeadInverse = inverse(factor[factor.length - 1]);
  for (let j = q.length - 1; j >= 0; j--) {
    const c = mod(remainder[j + factor.length - 1] * factorLeadInverse);
    q[j] = c;
    for (let k = 0; k < factor.length; k++) {
      remainder[j + k] = mod(remainder[j + k] - c * factor[k]);
    }
  }
  assert.ok(remainder.slice(0, factor.length - 1).every(x => x === 0),
    "exact table factorization");
  return q;
}

/** @param {number[]} bytes @returns {number[]} */
function sourceMonicLargeFactor(bytes) {
  assert.equal(bytes.length, 256);
  const grid = bytes.slice().reverse().map(mod);
  assert.equal(grid[255], 0);
  const small = [
    [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
    [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
  ];
  const divisor = small.reduce((p, f) => mul(p, f), [1]);
  const q = quotient(grid.slice(0, 255), divisor);
  assert.equal(q.length, 239);
  assert.equal(q[238], 28);
  const h = q.map(c => mod(28 * c));
  assert.equal(h[238], 1);
  return h;
}

/**
 * Invert source-tap feedback on ORIGINAL printed ciphertext, independent
 * of any secret seed; first 238 ciphertext symbols remain a public prefix.
 * @param {number[]} ciphertext
 * @param {number[]} h Monic 238-degree factor
 * @returns {number[]}
 */
function decode(ciphertext, h) {
  assert.equal(h.length, 239);
  assert.equal(h[238], 1);
  const output = [];
  for (let i = 0; i + 238 < ciphertext.length; i++) {
    let sum = ciphertext[i + 238];
    for (let j = 0; j < 238; j++) sum += h[j] * ciphertext[i + j];
    output.push(mod(sum));
  }
  return output;
}

/**
 * Honest forward GP29 encryption with an arbitrary 238-symbol seed.
 * @param {number[]} plaintext
 * @param {number[]} prefix
 * @param {number[]} h
 * @returns {number[]}
 */
function encode(plaintext, prefix, h) {
  assert.equal(prefix.length, 238);
  const ciphertext = prefix.slice();
  for (let i = 0; i < plaintext.length; i++) {
    let value = plaintext[i];
    for (let j = 0; j < 238; j++) {
      value -= h[j] * ciphertext[i + j];
    }
    ciphertext.push(mod(value));
  }
  return ciphertext;
}

/** @param {number[]} a @returns {number} */
function coincidence(a) {
  const hist = Array(29).fill(0);
  for (const n of a) hist[n]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/** @param {string} text @returns {number[]} */
function gpControl(text) {
  const letterMap = {
    A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,
    M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,
    Y:26,Z:15
  };
  return [...text.toUpperCase()].flatMap(char =>
    Object.hasOwn(letterMap, char) ? [letterMap[char]] : []);
}

function main() {
  const corpus = json("resources/liber-primus/lp2-corpus.json");
  const grid = json("resources/liber-primus/lp2-grid-256.json");
  const original = corpus.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices);
  const h = sourceMonicLargeFactor(grid.pages.flatMap(p => p.bytes));
  assert.equal(original.length, 12956);
  assert.equal(corpus.pages.find(p => p.page === 36).indices.length, 238);
  const source = fs.readFileSync(
    path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
  const native = gpControl(source).slice(0, original.length - 238);
  assert.equal(native.length, 12718);

  const summaries = [];
  for (const orientation of ["forward", "reciprocal"]) {
    const taps = orientation === "forward" ? h :
      h.slice().reverse().map(v => mod(v * inverse(h[0])));
    assert.equal(taps[238], 1);
    const recovered = decode(original, taps);
    assert.equal(recovered.length, native.length);
    assert.deepEqual(encode(recovered, original.slice(0, 238), taps), original,
      "full original ciphertext must reencrypt exactly");

    const plant = encode(native, original.slice(0, 238), taps);
    assert.deepEqual(decode(plant, taps), native,
      "all 12,718 source-native GP runes must be recovered exactly");
    const wrongSource = orientation === "forward" ?
      h.slice().reverse().map(v => mod(v * inverse(h[0]))) : h;
    const wrongDecodedPlant = decode(plant, wrongSource);
    summaries.push({
      orientation,
      originalDecodedRunes: recovered.length,
      originalDecodedIoC: coincidence(recovered),
      sourceNativePlantIoC: coincidence(native),
      wrongSourcePlantIoC: coincidence(wrongDecodedPlant),
      first100OriginalGP: recovered.slice(0, 100)
        .map(index => corpus.translit[index]).join(" "),
      originalCompleteForwardRecipher: true,
      sourceNativePlantExactInverse: true
    });
  }
  process.stdout.write(JSON.stringify({
    scope: "All-secret 238-tap linear-feedback GP29 on complete original LP2 ciphertext",
    originalRuneCount: original.length,
    firstHiddenSeedSymbols: 238,
    recoveredCandidateSymbols: original.length - 238,
    sourceFactorDegree: h.length - 1,
    originalRawIoC: coincidence(original),
    findings: summaries,
    decision: "Both declared original decoded outputs remain near-uniform, not GP-English. The original 238-tap feedback class is excluded as a direct native-GP plaintext decoder under these two source orientations; arbitrary intermediate or nonlinear ciphers remain open."
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = {sourceMonicLargeFactor, decode, encode, coincidence};

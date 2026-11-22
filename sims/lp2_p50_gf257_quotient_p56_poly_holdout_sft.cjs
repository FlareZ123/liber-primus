"use strict";

/**
 * Source-frozen p50 GF(257) polynomial quotient to p56 known-plaintext gate.
 *
 * Hypothesis: B(213)=0 and original p50 256 cells imply Q=B/(x-213)
 * with exactly 255 coefficients, split as three 85-symbol shares.
 * Historical Cicada three-share XOR folds Q into an 85-tap GP29 polynomial.
 * Test the simplest causal multiplication C(x)=K(x)*P(x) (mod x^84,29)
 * on the 84 non-F positions of original p56.
 *
 * The authentic known P56 F at physical offset56 is copied transparently
 * and does not advance the clock, exactly as established for p56. Its
 * location is a known-control mask, NOT an inferred mask for unknown LP2.
 * K(0)=22 has inverse4 mod29, so the active-stream operation is reversible.
 * No key, phase, sign, traversal, mask or other parameter is fitted on p56.
 *
 * Run (Windows 11 / Node22): node sims/lp2_p50_gf257_quotient_p56_poly_holdout_sft.cjs
 * Full original-corpus input, no third-party dependencies, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const M = 257;
const mod29 = v => (v % 29 + 29) % 29;
const cipher56 = gp.pages.find(p => p.page === 56).indices;

function evaluate(a, x) {
  let v = 0;
  for (const coefficient of a) v = (v * x + coefficient) % M;
  return v;
}

function quotient(a, r) {
  const q = [a[0]];
  for (let i = 1; i < a.length; i++) {
    q.push((a[i] + r * q[q.length - 1]) % M);
  }
  assert.equal(q.pop(), 0, "authenticated root exact division");
  return q;
}

const B = grid.bytes;
assert.equal(B.length, 256);
assert.equal(grid.pages.reduce((n, p) => n + p.rows, 0), 32);
assert(grid.pages.every(p => p.cols === 8));
assert.equal(cipher56.length, 85);
assert.equal(evaluate(B, 213), 0);
const Q = quotient(B, 213);
assert.equal(Q.length, 255);

const shares = [Q.slice(0, 85), Q.slice(85, 170), Q.slice(170)];
assert.deepEqual(shares.map(a => a.length), [85, 85, 85]);
// First-party 2014 three-share XOR; GP29 projection happens only after XOR.
const K = Array.from({length: 85}, (_, i) =>
  mod29(shares[0][i] ^ shares[1][i] ^ shares[2][i]));
assert.equal(K[0], 22);
const inverseLead = Array.from({length: 29}, (_, n) => n)
  .find(n => mod29(n * K[0]) === 1);
assert.equal(inverseLead, 4);

const plaintextReference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const section56 = plaintextReference.split("### 56\n")[1]
  .split("### 57\n")[0];
const prose56 = section56.split("\n")
  .filter(s => !/^[0-9a-f]{25,}$/i.test(s.trim())).join(" ");
const known56 = encodeSourceNativeGP(prose56);
assert.equal(known56.length, 85);
const transparentF = known56.flatMap((v, i) => v === 0 ? [i] : []);
assert.deepEqual(transparentF, [56]);
assert.equal(cipher56[56], 0, "source-known F transparency");

// Reproduce authentic p56 prime-totient encryption, consuming the next
// prime only on non-F plaintext. Original ciphertext zeros elsewhere are
// ordinary encrypted glyphs and MUST NOT be treated as transparent-F tags.
let prime = 1;
function nextPrime() {
  while (true) {
    prime++;
    let isPrime = true;
    for (let d = 2; d * d <= prime; d++) {
      if (prime % d === 0) { isPrime = false; break; }
    }
    if (isPrime) return prime;
  }
}
const authenticReplay = known56.map(p => p === 0 ? 0 :
  mod29(p + nextPrime() - 1));
assert.deepEqual(authenticReplay, cipher56,
  "known plaintext and true p56 cipher with F-skip reproduce exactly");

function removeTaggedF(a, positions) {
  const tags = new Set(positions);
  return a.filter((_, i) => !tags.has(i));
}
function reinsertTaggedF(a, positions) {
  const result = a.slice();
  for (const pos of positions) result.splice(pos, 0, 0);
  return result;
}

/** C(x)=K(x)P(x) mod x^84 over GF29; lead K0 is invertible.
 * @param {number[]} plain
 * @returns {number[]}
 */
function forward(plain) {
  return plain.map((_, t) => {
    let sum = 0;
    for (let j = 0; j <= t; j++) sum += K[t - j] * plain[j];
    return mod29(sum);
  });
}

/** Exact triangular inverse on an arbitrary native-GP 84-symbol payload.
 * @param {number[]} ciphertext
 * @returns {number[]}
 */
function inverse(ciphertext) {
  const out = [];
  for (let t = 0; t < ciphertext.length; t++) {
    let value = ciphertext[t];
    for (let j = 0; j < t; j++) value -= K[t - j] * out[j];
    out.push(mod29(value * inverseLead));
  }
  return out;
}

const native84 = removeTaggedF(known56, transparentF);
const cPlant84 = forward(native84);
assert.equal(native84.length, 84);
assert.deepEqual(inverse(cPlant84), native84,
  "planted original native-GP message recovers 84/84");

const candidateC56 = reinsertTaggedF(cPlant84, transparentF);
assert.equal(candidateC56.length, 85);
const originalRecovered = reinsertTaggedF(
  inverse(removeTaggedF(cipher56, transparentF)), transparentF);
assert.deepEqual(reinsertTaggedF(
  forward(removeTaggedF(originalRecovered, transparentF)), transparentF),
  cipher56, "original p56 ciphertext also has exact forward replay");

function matches(a, b, start, end) {
  let hits = 0;
  for (let i = start; i < end; i++) if (a[i] === b[i]) hits++;
  return hits;
}
const calibration = matches(candidateC56, cipher56, 0, 42);
const holdout = matches(candidateC56, cipher56, 42, 85);
const holdoutNonMarker = matches(candidateC56, cipher56, 42, 56) +
  matches(candidateC56, cipher56, 57, 85);
assert.deepEqual([calibration, holdout, holdoutNonMarker], [0, 3, 2]);
assert.notDeepEqual(originalRecovered, known56);
assert.equal(candidateC56.findIndex((v, i) => v !== cipher56[i]), 0);

console.log(JSON.stringify({
  hypothesis: "GF257 root213 quotient; 3x85 XOR; reversible causal GP29 polynomial",
  keySource: "unchanged original p50 256 base60 tokens, field GF257",
  actualInput: "original encrypted p56 with authentic known plaintext",
  root: 213,
  quotientLength: Q.length,
  threeShares: shares.map(a => a.length),
  keyLead: K[0],
  keyLeadInverse: inverseLead,
  transparentFPhysicalOffsets: transparentF,
  originalP56PrimeTotientReplay: "85/85 including genuine plaintext-F skip",
  split: {calibration: [0, 42], holdout: [42, 85]},
  calibrationMatches: calibration,
  untouchedHoldoutMatches: holdout,
  holdoutNonFMatches: holdoutNonMarker,
  plaintextPlantRoundTrip: "84/84",
  originalCipherForwardRoundTrip: "85/85 with known typed F mask",
  firstMismatchPhysicalOffset: 0,
  recoveredUnknownPagePlaintext: false,
  decision: "REJECT this source-frozen polynomial mechanism; no p55 transfer",
  caveat: "F mask is known only for solved p56; no unknown-page mask is inferred"
}, null, 2));

"use strict";

/**
 * Single-file falsifier of a reversible source-prime-residue GP29 delta cipher.
 * Reproduces all facts from unchanged authentic manuscript reference files.
 * Run from repository root with Node.js 22:
 *   node sims/lp2_prime29_feedback_injectivity_original_sft.cjs
 *
 * Hypothesis: C_i = C_(i-1) + a_i * prime(P_i) (mod 29),
 * with ANY nonzero private multiplier a_i in 1..28, global predecessor state.
 *
 * Even if all a_i were supplied, prime(P_i) mod29 fails to identify P_i.
 * This mathematical failure does not depend on fitting a ciphertext key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repo = path.resolve(__dirname, "..");
/** @param {string} f Repository-relative input. */
function read(f) { return fs.readFileSync(path.join(repo, f), "utf8"); }

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const gp = corpus.translit;
const primes = corpus.prime;
assert.equal(gp.length, 29);
assert.equal(primes.length, 29);

const buckets = new Map();
for (let i = 0; i < primes.length; i++) {
  const residue = primes[i] % 29;
  if (!buckets.has(residue)) buckets.set(residue, []);
  buckets.get(residue).push(gp[i]);
}
assert.equal(buckets.size, 24);
const duplicates = [...buckets.entries()].filter(([_, v]) => v.length > 1);
assert.deepEqual(duplicates, [
  [2, ["F", "I", "D"]],
  [3, ["U", "B"]],
  [13, ["C", "M"]],
  [14, ["P", "AE"]]
]);
const absent = Array.from({length:29}, (_, i) => i)
  .filter((i) => !buckets.has(i));
assert.deepEqual(absent, [4, 6, 26, 27, 28]);
assert.deepEqual(buckets.get(0), ["N"]);
console.log("29 GP prime values => 24 distinct residues, collisions:",
  JSON.stringify(duplicates), "; missing residues:", absent.join(","));

/**
 * Exhaust all 28 nonzero secret coefficients. A collision survives any
 * nonzero multiplication, and N is the only source rune yielding zero.
 */
for (let coefficient = 1; coefficient < 29; coefficient++) {
  for (const [residue, names] of duplicates) {
    const results = new Set(names.map((name) =>
      (primes[gp.indexOf(name)] * coefficient) % 29));
    assert.deepEqual([...results], [(residue * coefficient) % 29]);
  }
  const zeros = gp.filter((name) =>
    (primes[gp.indexOf(name)] * coefficient) % 29 === 0);
  assert.deepEqual(zeros, ["N"]);
}
console.log("ALL 28 nonzero secret multipliers preserve indistinguishable",
  "F/I/D, U/B, C/M and P/AE; zero step uniquely forces N");

/** Exact unchanged physical p0-p55 inclusive, ignoring empty numerical p50. */
const original = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(original.length, 12956);

// Source-original table has 256 printed 2-character base60 tokens.
// This entire 512-character register cannot carry enough side information
// to restore all GP29 inputs from a 24-residue mapping over 12956 runes.
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
assert.equal([...grid.alphabet].length, 60);
const cells = grid.pages.flatMap((p) => p.tokens);
assert.equal(cells.length, 256);
assert.ok(cells.every((t) => [...t].length === 2 &&
  [...t].every((ch) => grid.alphabet.includes(ch))));
const completeGridBits = cells.length * 2 * Math.log2(60);
const allPlaintextSideBits = original.length * Math.log2(29 / buckets.size);
assert.ok(completeGridBits < allPlaintextSideBits);
console.log("SOURCE CAPACITY entire base60² p50 table:",
  completeGridBits.toFixed(6), "bits <", "full-book GP29-to-24 inverse need",
  allPlaintextSideBits.toFixed(6), "bits");

let equal = 0;
for (let i = 1; i < original.length; i++)
  if (original[i] === original[i - 1]) equal++;
assert.equal(equal, 86);
console.log("Authentic unknown LP2 ciphertext contiguous equal-delta:",
  equal, "/", original.length - 1);

/** Original printed-clear LP1 p3, p8-p11 and p14 native-GP control. */
const runeIndex = new Map([...corpus.runes].map((r, i) => [r, i]));
const originalLP1 = read("resources/transcriptions/lp1_wulfic_canonical.txt")
  .split("%");
const plain = [3, 8, 9, 10, 11, 14]
  .flatMap((p) => [...originalLP1[p]]
    .filter((r) => runeIndex.has(r)).map((r) => runeIndex.get(r)));
assert.equal(plain.length, 1001);
const n = plain.filter((v) => gp[v] === "N").length;
assert.equal(n, 64);
console.log("Original authenticated clear-LP1 N count:", n, "/",
  plain.length, "(6.3936%, versus implied 86 / 12956 in proposed decoder)");

/** Two different plaintexts of arbitrary lengths encrypt identically. */
function encrypt(plaintext, coefficients) {
  let prior = 0;
  return plaintext.map((v, i) => {
    prior = (prior + coefficients[i] * primes[v]) % 29;
    return prior;
  });
}
const allF = [0, 0, 0, 0, 0, 0, 0];
const allI = Array(7).fill(gp.indexOf("I"));
const secret = [1, 2, 3, 5, 8, 13, 21];
const fc = encrypt(allF, secret);
const ic = encrypt(allI, secret);
assert.deepEqual(fc, ic);
assert.notDeepEqual(allF, allI);
console.log("NONINJECTIVITY constructive seven-rune F-vs-I witness:",
  fc.join(","), "under nonzero private multipliers:", secret.join(","));
console.log("PASS: direct GP prime-residue predecessor feedback cannot be",
  "a standalone reversible full-alphabet cipher, for ANY secret multipliers.");

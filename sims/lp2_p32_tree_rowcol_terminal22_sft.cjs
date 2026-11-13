"use strict";
/**
 * SFT: one source-motivated, prospective-looking but still conditional
 * 22-value GP29 row/column checksum key applied to LP2 pp54-55.
 *
 * Source: 2016 PGP-signed tree image 563 x 569, same tree on original
 * p32 (121 runes) and terminal p55; page32 first row/column GP-prime
 * sums are 563/569 in its natural 11 x 11 row-major array.
 * Interleave the 11 row sums and 11 column sums (one-based r1,c1,...).
 * Full terminal p54-55 chapter is 308 runes, exactly 14 x 22.
 *
 * This is a bounded key-consumer hypothesis, not a source-authenticated
 * author instruction. No plaintext was found. Node 22+; no dependencies,
 * no writes, uses canonical repo corpus without embedded copies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));

/** @param {number} n @returns {number[]} */
function page(n) {
  const match = corpus.pages.find((p) => p.page === n);
  assert.ok(match, "Missing physical LP2 page " + n);
  return match.indices;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * @param {number[]} vals Original GP29 rune indices
 * @param {number[]} schedule 22 derived rune shifts
 * @param {-1|1} direction
 * @returns {number[]}
 */
function shift(vals, schedule, direction) {
  return vals.map((v, i) => (v + 29 + direction * schedule[i % 22]) % 29);
}

const original32 = page(32);
const terminal54 = page(54);
const terminal55 = page(55);
assert.equal(original32.length, 121);
assert.equal(terminal54.length, 232);
assert.equal(terminal55.length, 76);
const cipher = terminal54.concat(terminal55);
assert.equal(cipher.length, 308);

const grid = Array.from({ length: 11 }, (_, row) =>
  original32.slice(row * 11, (row + 1) * 11).map((index) => corpus.prime[index])
);
const rows = grid.map((r) => r.reduce((a, b) => a + b, 0));
const cols = Array.from({ length: 11 }, (_, col) =>
  grid.reduce((sum, r) => sum + r[col], 0)
);
assert.deepEqual(rows, [563,617,287,540,743,513,577,579,603,537,486]);
assert.deepEqual(cols, [569,429,641,669,518,611,463,690,378,578,499]);

// Source-axis natural x/y order: (row1,col1), ..., (row11,col11).
const key = rows.flatMap((r, i) => [r % 29, cols[i] % 29]);
assert.equal(key.length, 22);
assert.deepEqual(key,
  [12,18,8,23,26,3,18,2,18,25,20,2,26,28,28,23,23,1,15,27,22,6]);

const baseline = ioc(cipher);
assert.ok(Math.abs(baseline - 0.03382122763230255) < 1e-12);
console.log("Original terminal p54+p55", cipher.length, "runes; raw IoC", baseline);
console.log("Image-derived row sums:", rows);
console.log("Image-derived column sums:", cols);
console.log("Interleaved GP29 22-shift key:", key);

for (const direction of /** @type {const} */ ([-1, 1])) {
  const decoded = shift(cipher, key, direction);
  const restored = shift(decoded, key, /** @type {-1|1} */ (-direction));
  assert.deepEqual(restored, cipher, "Full original inverse/forward mismatch");
  const result = ioc(decoded);
  console.log("Inverse direction", direction, "IoC", result);
  console.log("First 40 decoded GP runes:",
    decoded.slice(0, 40).map((index) => corpus.translit[index]).join(" "));
  assert.ok(result < 0.04, "Unexpected language-like index concentration");
}

// Source-native positive control: GP plaintext from solved p57, repeated
// only to test reversible full-length implementation. The repetition is a
// *synthetic plant*, never a putative original terminal plaintext.
const known = page(57);
assert.equal(known.length, 95);
const planted = Array.from({ length: 308 }, (_, i) => known[i % known.length]);
const encrypted = shift(planted, key, 1);
assert.deepEqual(shift(encrypted, key, -1), planted);
assert.notDeepEqual(shift(encrypted, key.slice(1).concat(key[0]), -1), planted);
console.log("Synthetic planted control recovered 308/308 GP runes.");
console.log("Native solved page57 IoC", ioc(known));
console.log("PASS: both original directions exact-roundtrip but remain ciphertext-like.");

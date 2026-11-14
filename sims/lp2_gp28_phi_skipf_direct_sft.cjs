"use strict";

/**
 * Exact original LP2 inverse for a source-motivated, but unauthenticated,
 * 28-choice predecessor-exclusion cipher with p56's prime-totient clock.
 *
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_gp28_phi_skipf_direct_sft.cjs
 *
 * All data come from the pinned canonical corpus. This script writes no files.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const sourcePath = path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json");
const corpus = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const pages = corpus.pages.filter((page) => page.page < 56 && page.indices.length > 0);
const clear = corpus.pages.find((page) => page.page === 57).indices;

assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, page) => n + page.indices.length, 0), 12956);
assert.equal(clear.length, 95);
assert.equal(corpus.translit.length, 29);

/** Generate consecutive ordinary primes; for a prime p, Euler phi(p)=p-1. */
function primes(count) {
  const values = [];
  for (let candidate = 2; values.length < count; candidate++) {
    let isPrime = true;
    for (let factor = 2; factor * factor <= candidate; factor++) {
      if (candidate % factor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) values.push(candidate);
  }
  return values;
}

const prime = primes(12956);

/** Return the canonical representative in 0...modulus-1. */
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

/**
 * @param {readonly number[]} ciphertext
 * @param {"cyclic"|"sorted"} order
 * @param {-1|1} sign
 * @returns {number[]}
 */
function decode(ciphertext, order, sign) {
  let previous = 0; // the imaginary preceding GP F from the 2015 historical witness
  let keyIndex = 0;
  const output = [];
  for (const current of ciphertext) {
    if (current === previous) {
      output.push(0); // literal plaintext F; do not advance the phi(prime) clock
    } else {
      const rank = order === "cyclic"
        ? mod(current - previous - 1, 29)
        : current < previous ? current : current - 1;
      output.push(1 + mod(rank + sign * (prime[keyIndex] - 1), 28));
      keyIndex++;
    }
    previous = current;
  }
  return output;
}

/**
 * Reverse the complete hypothetical cipher, including every literal F.
 * @param {readonly number[]} plaintext
 * @param {"cyclic"|"sorted"} order
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encode(plaintext, order, sign) {
  let previous = 0;
  let keyIndex = 0;
  const output = [];
  for (const rune of plaintext) {
    let current = previous;
    if (rune !== 0) {
      const rank = mod(rune - 1 - sign * (prime[keyIndex] - 1), 28);
      current = order === "cyclic"
        ? (previous + 1 + rank) % 29
        : rank < previous ? rank : rank + 1;
      keyIndex++;
    }
    output.push(current);
    previous = current;
  }
  return output;
}

/** Source-native GP symbol coincidence, no language model fitted to ciphertext. */
function ioc(runes) {
  const histogram = Array(29).fill(0);
  for (const rune of runes) histogram[rune]++;
  const n = runes.length;
  return histogram.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

const fixedExpectations = [
  { order: "cyclic", sign: -1, ioc: 0.03529040904291567, e: 480 },
  { order: "cyclic", sign: 1, ioc: 0.03525080106655558, e: 441 },
  { order: "sorted", sign: -1, ioc: 0.03527209452436409, e: 455 },
  { order: "sorted", sign: 1, ioc: 0.0352593684958585, e: 475 },
];

const original = pages.flatMap((page) => page.indices);
assert.equal(original.length, 12956);

for (const model of fixedExpectations) {
  const recovered = [];
  for (const page of pages) {
    const plaintext = decode(page.indices, model.order, model.sign);
    assert.deepEqual(encode(plaintext, model.order, model.sign), page.indices);
    recovered.push(...plaintext);
  }
  assert.equal(recovered.length, original.length);
  assert.equal(recovered.filter((rune) => rune === 0).length, 88);
  assert.equal(recovered.filter((rune) => rune === 18).length, model.e);
  assert.ok(Math.abs(ioc(recovered) - model.ioc) < 1e-12);

  // Independently known, source-native plaintext: p57 as printed, repeated into
  // an original-length p0 page. This is a *planted* positive, not LP2 recovery.
  const plant = Array.from({ length: pages[0].indices.length }, (_, index) =>
    clear[index % clear.length]);
  const encryptedPlant = encode(plant, model.order, model.sign);
  assert.deepEqual(decode(encryptedPlant, model.order, model.sign), plant);

  console.log(JSON.stringify({
    model: model.order + "/" + model.sign,
    runes: recovered.length,
    ioc: ioc(recovered),
    e: model.e,
    skipF: 88,
    head: recovered.slice(0, 32).map((rune) => corpus.translit[rune]).join(" "),
    nativePlantIoC: ioc(plant),
    ciphertextForwardRoundTrip: true,
    nativePlaintextRecovery: true,
  }));
}

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"
), "utf8"));

// The source-visible p15 4x4 Fibonacci-indexed prime spiral starts at red 3299.
// These literal 16 values are the human-transcribed physical square in outward order.
const printed = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
const distinctFibonacci = [0, 1, 2, 3, 5, 8, 13, 21,
  34, 55, 89, 144, 233, 377, 610, 987];

/** @param {number} n */
function firstPrimes(n) {
  const ps = [];
  for (let x = 2; ps.length < n; x++) {
    if (ps.every((p) => p * p > x || x % p !== 0)) ps.push(x);
  }
  return ps;
}

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * Source-proposed original cipher inverse. Page-relative prime number
 * position starts at the corresponding p15 Fibonacci prime ordinal.
 * @param {number[]} values
 * @param {number} startRank Zero-indexed prime index.
 * @param {1|-1} sign
 * @param {number[]} primes
 */
function transform(values, startRank, sign, primes) {
  return values.map((v, i) => {
    const phiPrime = primes[startRank + i] - 1;
    return (v + sign * phiPrime % 29 + 29) % 29;
  });
}

assert.equal(printed.length, 16);
assert.equal(distinctFibonacci.length, 16);
const pages = corpus.pages.slice(40, 56);
assert.deepEqual(pages.map((p) => p.page), Array.from(
  { length: 16 }, (_, j) => 40 + j));
assert.equal(pages[10].page, 50);
assert.equal(pages[10].indices.length, 0); // physical grid, keep its square assignment
const primes = firstPrimes(988 + 275);
for (let j = 0; j < 16; j++) {
  assert.equal(Math.abs(3301 - primes[distinctFibonacci[j]]), printed[j]);
}
const original = pages.flatMap((p) => p.indices);
assert.equal(original.length, 3316);

const outcomes = {};
for (const sign of [-1, 1]) {
  const decPages = pages.map((p, j) => transform(
    p.indices, distinctFibonacci[j], /** @type {1|-1} */ (sign), primes));
  for (let j = 0; j < 16; j++) {
    assert.deepEqual(transform(decPages[j], distinctFibonacci[j],
      /** @type {1|-1} */ (-sign), primes), pages[j].indices);
  }
  const values = decPages.flat();
  outcomes[String(sign)] = {
    pooledIoC: ioc(values),
    first40: values.slice(0, 40).map((v) => corpus.translit[v]).join("-"),
    pageIoC: decPages.map((x) => x.length > 1 ? ioc(x) : null)
  };
}

/* Independently solved p57 plain-text source gives an exact forward/inverse
 * control for all 16 page-specific prime phases, including p50's zero length. */
const plaintext = corpus.pages[57].indices;
assert.equal(plaintext.length, 95);
const planted = Array.from({length: original.length}, (_, i) =>
  plaintext[i % plaintext.length]);
let pos = 0;
for (let j = 0; j < 16; j++) {
  const word = planted.slice(pos, pos + pages[j].indices.length);
  const cipher = transform(word, distinctFibonacci[j], 1, primes);
  assert.deepEqual(transform(cipher, distinctFibonacci[j], -1, primes), word);
  pos += word.length;
}
assert.equal(pos, original.length);
const raw = ioc(original);
assert.ok(Math.abs(raw - 0.03446282660786315) < 1e-12);
assert.ok(Math.abs(outcomes["-1"].pooledIoC - 0.034540697600372615) < 1e-12);
assert.ok(Math.abs(outcomes["1"].pooledIoC - 0.034543972548655724) < 1e-12);
console.log(JSON.stringify({length: original.length, rawIoC: raw,
  sourceIndices: distinctFibonacci.map((n) => n + 1),
  printed, outcomes}, null, 2));

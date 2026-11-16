"use strict";
/**
 * LP2 original p0 title-marker reset versus historical 2015 prime/delta transform.
 * Node.js 22; execute: node sims/lp2_p0_marker13_prime_delta_reset_sft.cjs
 * Requires original checked-in resources/liber-primus/lp2-corpus.json.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const list = [];
  for (let candidate = 2; list.length < n; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime) list.push(candidate);
  }
  return list;
}
const prime = firstPrimes(731);

/**
 * The historical F-at-minus-one convention consumes prime[0]=2 before
 * original first rune, and the first actual rune consumes prime[1]=3.
 * @param {number[]} ciphertext
 * @param {-1|1} direction
 * @returns {number[]}
 */
function decode(ciphertext, direction) {
  const difference = [];
  let previous = mod(direction * prime[0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const shifted = mod(ciphertext[i] + direction * prime[i + 1]);
    difference.push(mod(shifted - previous));
    previous = shifted;
  }
  return difference;
}

/**
 * Exact inverse for every GP29 tape, irrespective of language.
 * @param {number[]} differences
 * @param {-1|1} direction
 * @returns {number[]}
 */
function encode(differences, direction) {
  const ciphertext = [];
  let shifted = mod(direction * prime[0]);
  for (let i = 0; i < differences.length; i++) {
    shifted = mod(shifted + differences[i]);
    ciphertext.push(mod(shifted - direction * prime[i + 1]));
  }
  return ciphertext;
}

/** @param {number[]} values @returns {number} */
function equalNeighbors(values) {
  let count = 0;
  for (let i = 1; i < values.length; i++) if (values[i] === values[i - 1]) count++;
  return count;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const v of values) count[v]++;
  return count.reduce((a, v) => a + v * (v - 1), 0) / (values.length * (values.length - 1));
}

/**
 * Exhaustive body-circular phase sensitivity under one fixed prime clock.
 * @param {number[]} body
 * @param {-1|1} direction
 */
function rotationDistribution(body, direction) {
  const repetitions = [];
  for (let k = 0; k < body.length; k++) {
    const rotated = body.slice(k).concat(body.slice(0, k));
    repetitions.push(equalNeighbors(decode(rotated, direction)));
  }
  const mean = repetitions.reduce((a, b) => a + b, 0) / body.length;
  const actual = repetitions[0];
  return {
    source: actual,
    atLeastSource: repetitions.filter((v) => v >= actual).length,
    mean,
    minimum: Math.min(...repetitions),
    maximum: Math.max(...repetitions)
  };
}
const firstChapter = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
assert.deepEqual(corpus.pages.slice(0, 3).map((p) => p.indices.length), [262, 266, 201]);
assert.equal(firstChapter.length, 729);
assert.deepEqual(firstChapter.slice(0, 13), [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
const body = firstChapter.slice(13);
assert.equal(body.length, 716);
assert.equal(equalNeighbors(body), 4);
const historical = decode(firstChapter, -1);
assert.deepEqual(encode(historical, -1), firstChapter);
assert.equal(equalNeighbors(historical), 40);
const minus = decode(body, -1);
const plus = decode(body, 1);
assert.deepEqual(encode(minus, -1), body);
assert.deepEqual(encode(plus, 1), body);
assert.equal(equalNeighbors(minus), 23);
assert.equal(equalNeighbors(plus), 24);
assert(Math.abs(ioc(minus) - 0.03508223619955463) < 1e-12);
assert(Math.abs(ioc(plus) - 0.034464976364417706) < 1e-12);
const negativeRotations = rotationDistribution(body, -1);
const positiveRotations = rotationDistribution(body, 1);
assert.equal(negativeRotations.source, 23);
assert.equal(negativeRotations.atLeastSource, 500);
assert.equal(negativeRotations.maximum, 38);
assert.equal(positiveRotations.source, 24);
assert.equal(positiveRotations.atLeastSource, 428);
assert.equal(positiveRotations.maximum, 41);
const solved = corpus.pages[57].indices;
assert(solved.length === 95);
const clearControl = Array.from({length: 716}, (_, i) => solved[i % solved.length]);
for (const dir of [-1, 1]) {
  assert.deepEqual(encode(decode(clearControl, dir), dir), clearControl);
}
console.log(JSON.stringify({
  conclusion: "Original marker13 F/prime3 clock reset does not preserve the historical exceptional original phase; no plaintext",
  originalMarkerRoi: 13,
  historical729Repeats: 40,
  body716RawRepeats: 4,
  markerResetNegative: {repeats: 23, ioc: ioc(minus), rotations: negativeRotations},
  markerResetPositive: {repeats: 24, ioc: ioc(plus), rotations: positiveRotations},
  control: "positive exact inverse on original GP solved p57 repeated to 716 runes",
}, null, 2));

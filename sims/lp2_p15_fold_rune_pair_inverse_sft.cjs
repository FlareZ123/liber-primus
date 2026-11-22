'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));
const pages = new Map(corpus.pages.map((page) => [page.page, page.indices]));
const left = Array.from({ length: 8 }, (_, index) => index + 7);
const right = Array.from({ length: 8 }, (_, index) => 23 - index);
const modulus = 29;

/**
 * Pair two original physical-page rune streams without fitting a key or phase.
 * @param {number[]} a Source-order left page.
 * @param {number[]} b Source-order right page.
 * @param {boolean} reverseRight Whether the second stream is read from bottom to top.
 * @param {1 | -1} sign Addition or subtraction over GP29.
 * @returns {{ count: number, histogram: Int32Array, symbols: number[] }}
 */
function combine(a, b, reverseRight, sign) {
  const count = Math.min(a.length, b.length);
  const histogram = new Int32Array(modulus);
  const symbols = [];
  for (let index = 0; index < count; index += 1) {
    const value = (a[index] + sign * b[reverseRight ? b.length - 1 - index : index] + modulus) % modulus;
    histogram[value] += 1;
    symbols.push(value);
  }
  return { count, histogram, symbols };
}

/**
 * @param {number} count
 * @param {Int32Array} histogram
 * @returns {number}
 */
function coincidence(count, histogram) {
  let equalOrderedPairs = 0;
  for (const n of histogram) equalOrderedPairs += n * (n - 1);
  return equalOrderedPairs / (count * (count - 1));
}

/**
 * @param {{ count: number, histogram: Int32Array }[][]} cross
 * @param {number[]} permutation
 * @returns {{ count: number, ioc: number }}
 */
function evaluate(cross, permutation) {
  let count = 0;
  const histogram = new Int32Array(modulus);
  for (let index = 0; index < 8; index += 1) {
    const pair = cross[index][permutation[index]];
    count += pair.count;
    for (let letter = 0; letter < modulus; letter += 1) histogram[letter] += pair.histogram[letter];
  }
  return { count, ioc: coincidence(count, histogram) };
}

/**
 * Exact null over all 8! matchings of original pages 7..14 against 23..16.
 * Page orientation, modular operator and local alignment remain frozen.
 * @param {{ count: number, histogram: Int32Array }[][]} cross
 * @param {number} target
 * @returns {{ total: number, upperTail: number, mean: number, min: number, max: number }}
 */
function exactNull(cross, target) {
  const permutation = new Array(8);
  let total = 0;
  let upperTail = 0;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  /** @param {number} index @param {number} used */
  function visit(index, used) {
    if (index === 8) {
      const score = evaluate(cross, permutation).ioc;
      total += 1;
      upperTail += Number(score >= target - 1e-14);
      sum += score;
      min = Math.min(min, score);
      max = Math.max(max, score);
      return;
    }
    for (let partner = 0; partner < 8; partner += 1) {
      if ((used & (1 << partner)) === 0) {
        permutation[index] = partner;
        visit(index + 1, used | (1 << partner));
      }
    }
  }
  visit(0, 0);
  return { total, upperTail, mean: sum / total, min, max };
}

/** @type {[boolean, 1 | -1, number, number][]} */
const variants = [
  [true, -1, 0.03450824453545654, 18461],
  [true, 1, 0.03433538263257072, 32696],
  [false, -1, 0.03426147347974676, 37812],
  [false, 1, 0.034259641021412275, 39064],
];
for (const [reverseRight, sign, expected, expectedTail] of variants) {
  const cross = left.map((leftPage) => right.map((rightPage) =>
    combine(pages.get(leftPage), pages.get(rightPage), reverseRight, sign)));
  const observed = evaluate(cross, [0, 1, 2, 3, 4, 5, 6, 7]);
  const nullDistribution = exactNull(cross, observed.ioc);
  assert.equal(observed.count, 1810);
  assert.ok(Math.abs(observed.ioc - expected) < 1e-12);
  assert.equal(nullDistribution.total, 40320);
  assert.equal(nullDistribution.upperTail, expectedTail);
  console.log(JSON.stringify({
    orientation: reverseRight ? 'mirrored second page' : 'printed second page',
    formula: sign === -1 ? '(A-B) mod 29' : '(A+B) mod 29',
    observed, ...nullDistribution,
    upperTailFraction: nullDistribution.upperTail / nullDistribution.total,
  }));
}

// Implementation-only planted control. Reversal and GP29 subtraction are exact,
// even though they do not recover native-language plaintext from the originals.
const plaintext = Array.from({ length: 208 }, (_, index) => (index * 7 + Math.floor(index / 3)) % 29);
const pad = Array.from({ length: 208 }, (_, index) => (index * 11 + 17) % 29);
const plantedA = plaintext.map((value, index) => (value + pad[index]) % 29);
const plantedB = pad.slice().reverse();
assert.deepEqual(combine(plantedA, plantedB, true, -1).symbols, plaintext);
console.log('PASS: exact synthetic 208-rune mirrored-pair inverse, original source tests and all 40,320 page matchings');

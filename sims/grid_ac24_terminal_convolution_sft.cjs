"use strict";

/** Source-locked 128×127 polynomial convolution and Ac=24 quotient-key gate. */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const grid = require("../resources/liber-primus/lp2-grid-256.json");

const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
    }
  }
  return result;
}

/** Divide a descending-coefficient polynomial by X-root in GF(29). */
function divideLinear(coeff, root) {
  const quotient = [];
  for (let i = 0; i < coeff.length - 1; i++) {
    quotient.push(mod(coeff[i] + root * (quotient[i - 1] || 0)));
  }
  return { quotient, remainder: mod(coeff[coeff.length - 1] + root * quotient[quotient.length - 1]) };
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const frequencies = Array(29).fill(0);
  for (const value of values) frequencies[value]++;
  return frequencies.reduce((sum, count) => sum + count * (count - 1), 0) / (values.length * (values.length - 1));
}

assert.deepEqual(multiply([1, 2], [3, 4]), [3, 10, 8]);
assert.equal(grid.bytes.length, 256);
const sourceA = corpus.pages[53].indices.slice(0, 128);
const sourceB = corpus.pages[53].indices.slice(128).concat(corpus.pages[55].indices);
assert.equal(sourceA.length, 128);
assert.equal(sourceB.length, 127);
assert.equal(corpus.pages[54].indices[0], 24);
const original = grid.bytes.map((value) => value % 29);
const first = divideLinear(original, 24);
const second = divideLinear(first.quotient, 24);
assert.equal(first.remainder, 0);
assert.equal(second.remainder, 0);
assert.equal(second.quotient.length, 254);

const acSquare = [1, mod(-48), mod(24 * 24)]; // (X-24)^2
const plantedProduct = multiply(multiply(sourceA, sourceB), acSquare);
const plantedFirst = divideLinear(plantedProduct, 24);
const plantedSecond = divideLinear(plantedFirst.quotient, 24);
assert.equal(plantedFirst.remainder, 0);
assert.equal(plantedSecond.remainder, 0);
assert.deepEqual(plantedSecond.quotient, multiply(sourceA, sourceB));
let bestMatch = { matched: -1 };
for (const reverseA of [false, true]) {
  for (const reverseB of [false, true]) {
    const a = reverseA ? [...sourceA].reverse() : sourceA;
    const b = reverseB ? [...sourceB].reverse() : sourceB;
    const product = multiply(multiply(a, b), acSquare);
    assert.equal(product.length, 256);
    for (const reverseOutput of [false, true]) {
      const candidate = reverseOutput ? [...product].reverse() : product;
      for (let scalar = 1; scalar < 29; scalar++) {
        const matched = candidate.filter((value, i) => mod(scalar * value) === original[i]).length;
        if (matched > bestMatch.matched) {
          bestMatch = { matched, reverseA, reverseB, reverseOutput, scalar };
        }
      }
    }
  }
}
assert.equal(bestMatch.matched, 17);

const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
const baseline = ioc(pages.flatMap((page) => page.indices));
const results = [];
for (const reverse of [false, true]) {
  for (const clock of ["book", "page"]) {
    for (const sign of [-1, 1]) {
      for (const lane of ["whole", "even", "odd"]) {
        const raw = second.quotient;
        const pad = (lane === "whole" ? raw : raw.filter((_, i) => i % 2 === (lane === "even" ? 0 : 1)));
        const key = reverse ? [...pad].reverse() : pad;
        const decoded = [];
        let phase = 0;
        for (const page of pages) {
          if (clock === "page") phase = 0;
          for (const symbol of page.indices) {
            decoded.push(mod(symbol + sign * key[phase % key.length]));
            phase++;
          }
        }
        results.push({ reverse, clock, sign, lane, ioc: ioc(decoded) });
      }
    }
  }
}
/** Exact best possible total for an arbitrary secret GP29-to-GP29 lookup. */
function maxLookupMatches(source, target) {
  const counts = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (let i = 0; i < source.length; i++) counts[source[i]][target[i]]++;
  return counts.reduce((sum, row) => sum + Math.max(...row), 0);
}
const sourceTest = sourceB.map((value) => mod(value * 7 + 3));
assert.equal(maxLookupMatches(sourceB, sourceTest), 127);
let bestLaneLookup = { matches: -1 };
for (const trim of ["first", "last"]) {
  for (const layout of ["halves", "even-odd"]) {
    for (const reverseA of [false, true]) {
      for (const reverseB of [false, true]) {
        for (const reverseQ of [false, true]) {
          const a0 = trim === "first" ? sourceA.slice(1) : sourceA.slice(0, 127);
          const a = reverseA ? a0.reverse() : a0;
          const b = reverseB ? [...sourceB].reverse() : sourceB;
          const q = reverseQ ? [...second.quotient].reverse() : second.quotient;
          const qA = layout === "halves" ? q.slice(0, 127) : q.filter((_, i) => i % 2 === 0);
          const qB = layout === "halves" ? q.slice(127) : q.filter((_, i) => i % 2 === 1);
          const matches = maxLookupMatches(a, qA) + maxLookupMatches(b, qB);
          if (matches > bestLaneLookup.matches) {
            bestLaneLookup = { matches, trim, layout, reverseA, reverseB, reverseQ };
          }
        }
      }
    }
  }
}
assert.equal(bestLaneLookup.matches, 81);

results.sort((a, b) => b.ioc - a.ioc);
assert.equal(results.length, 24);
console.log(JSON.stringify({
  originalRuneCount: pages.reduce((n, p) => n + p.indices.length, 0),
  sourceSizes: [sourceA.length, sourceB.length],
  acRoot: 24,
  rootRemainders: [first.remainder, second.remainder],
  quotientLength: second.quotient.length,
  highestConvolutionMatch: bestMatch,
  bestTwoLaneArbitraryLookup: bestLaneLookup,
  originalIoc: baseline,
  highestDirectQuotientPadIoc: results[0],
  lowestDirectQuotientPadIoc: results[results.length - 1]
}, null, 2));

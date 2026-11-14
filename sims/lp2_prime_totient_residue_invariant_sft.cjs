'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

/**
 * Return all ordinary primes at most limit.
 * @param {number} limit
 * @returns {number[]}
 */
function primesThrough(limit) {
  const composite = new Uint8Array(limit + 1);
  const primes = [];
  for (let p = 2; p <= limit; p++) {
    if (composite[p]) continue;
    primes.push(p);
    if (p * p <= limit) {
      for (let n = p * p; n <= limit; n += p) composite[n] = 1;
    }
  }
  return primes;
}

/**
 * Count matching symbols at a fixed positive lag across original page boundaries.
 * @param {readonly {indices: number[]}[]} pages
 * @param {number} lag
 * @returns {{matches: number, opportunities: number}}
 */
function lagEqual(pages, lag) {
  let matches = 0;
  let opportunities = 0;
  for (const page of pages) {
    for (let i = lag; i < page.indices.length; i++) {
      matches += Number(page.indices[i] === page.indices[i - lag]);
      opportunities++;
    }
  }
  return { matches, opportunities };
}

const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
const count = pages.reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(pages.length, 55);
assert.equal(count, 12956);
assert.equal(Math.max(...pages.map((page) => page.indices.length)), 277);

const coverage = pages.map((page) => ({
  page: page.page,
  symbols: new Set(page.indices).size,
  missing: Array.from({ length: 29 }, (_, i) => i)
    .filter((i) => !page.indices.includes(i)),
}));
assert.equal(coverage.filter((item) => item.symbols === 29).length, 53);
assert.deepEqual(coverage.filter((item) => item.symbols < 29), [
  { page: 49, symbols: 28, missing: [3] },
  { page: 55, symbols: 25, missing: [3, 9, 16, 26] },
]);

const adjacent = lagEqual(pages, 1);
const lag2 = lagEqual(pages, 2);
assert.deepEqual(adjacent, { matches: 86, opportunities: 12901 });
assert.deepEqual(lag2, { matches: 435, opportunities: 12846 });

const primeList = primesThrough(150000);
const primeStream = primeList.slice(0, 12956);
assert.equal(primeStream.length, count);
assert.equal(primeStream.at(-1), 139387);
const primeResidues = primeStream.map((p) => (p - 1) % 29);
const primeLag = (lag) => primeResidues.slice(lag).reduce(
  (matches, value, i) => matches + Number(value === primeResidues[i]), 0
);
assert.equal(primeLag(1), 4);

const first277 = primeResidues.slice(0, 277);
assert.equal(first277.slice(1).filter((v, i) => v === first277[i]).length, 0);

// The first 277 prime keys can include p=29 but cannot produce a repeated
// adjacent GP rune, under any fixed per-page bijection of the symbol labels.
const sourcePageResetRepeats = pages.reduce((total, page) => {
  const n = page.indices.length;
  const residual = primeResidues.slice(0, n);
  return total + residual.slice(1).filter((v, i) => v === residual[i]).length;
}, 0);
assert.equal(sourcePageResetRepeats, 0);

// Every prime except p=29 is nonzero modulo 29. A whole-book monotone
// prime stream contains the exceptional p=29 once, so at most one physical
// page can use all 29 GP rune labels under per-page bijections.
assert.equal(primeList.filter((p) => p === 29).length, 1);

console.log(JSON.stringify({
  original: { pages: pages.length, runes: count, all29Pages: 53,
    adjacent, lag2, exceptionalPages: coverage.filter((item) => item.symbols < 29) },
  consecutivePrimes: { source: 'p-1 modulo 29', firstPrime: primeStream[0],
    lastPrime: primeStream.at(-1), wholeBookLag1: primeLag(1),
    eachPageResetAtPrime2Lag1: sourcePageResetRepeats,
    exceptionalPrime29CanAppearOnlyOnce: true },
  decision: 'Direct prime/totient residue stream under arbitrary per-page fixed alphabet bijections cannot generate original LP2.',
}, null, 2));

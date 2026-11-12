'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @template T @param {string} name @returns {T} */
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const book = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const title = [2, 18, 10, 9, 15, 16, 24, 4, 18, 19, 18, 4, 6, 18, 9, 5, 18];
const original = [19, 13, 26, 20, 15, 3, 24, 25, 8, 20, 18, 12, 10, 19, 20, 20, 15, 5, 13];

/** @param {number[]} xs @returns {number} */
const primeSum = (xs) => xs.reduce((sum, i) => sum + book.prime[i], 0);
/** @param {number[]} xs @returns {Map<number, number>} */
const counts = (xs) => {
  const result = new Map();
  for (const x of xs) result.set(x, (result.get(x) || 0) + 1);
  return result;
};
/** @param {number[]} a @param {number[]} b @returns {number} */
const maxFixedAlphabetOverlap = (a, b) => {
  const x = counts(a), y = counts(b);
  return [...x].reduce((sum, [r, n]) => sum + Math.min(n, y.get(r) || 0), 0);
};
/** @param {number[]} a @param {number[]} b @returns {boolean} */
const possibleUnrestrictedBijectionAndTwoShell = (a, b) => {
  if (b.length !== a.length + 2) return false;
  const capacities = [...counts(b).values()].sort((x, y) => y - x);
  const demand = [...counts(a).values()].sort((x, y) => y - x);
  return demand.every((size, j) => capacities[j] >= size);
};
/** @param {number} n @returns {boolean} */
const isPrime = (n) => {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
};

const p27 = book.pages[27];
const red27 = ink.pages.find(p => p.page === 27).red_spans[0];
assert.equal(p27.runic_count, 234);
assert.equal(red27.start, 0);
assert.equal(red27.length, 19);
assert.deepEqual(p27.indices.slice(0, 19), original);
assert.deepEqual([...red27.runes].map(r => book.runes.indexOf(r)), original);
assert.equal(title.length, 17);
assert.equal(primeSum(title), 761); // Original 2013 ID3 title, independently source-audited.
assert.equal(primeSum(original), 1109);
assert.equal((1109 - 761) / 29, 12);
assert.equal(primeSum(original) % 29, primeSum(title) % 29);
assert.equal(maxFixedAlphabetOverlap(title, original), 6);
assert.equal(Math.max(...counts(title).values()), 5); // E appears five times.
assert.equal(Math.max(...counts(original).values()), 4);
assert.equal(possibleUnrestrictedBijectionAndTwoShell(title, original), false);

// Positive controls: nonidentity static bijection, shuffled order and two extra runes.
const planted = [28, ...title.map(i => (i + 7) % 29).reverse(), 27];
assert.equal(possibleUnrestrictedBijectionAndTwoShell(title, planted), true);
const unkeyed = [28, ...title.slice().reverse(), 27];
assert.equal(maxFixedAlphabetOverlap(title, unkeyed), 17);

const spans = ink.pages.flatMap(p => (p.red_spans || []).map(s => ({
  page: p.page,
  length: s.length,
  sum: primeSum([...s.runes].map(r => book.runes.indexOf(r)))
})));
assert.equal(spans.length, 18);
assert.deepEqual(spans.filter(s => s.sum % 29 === 7).map(s => s.page), [27]);
let windows = 0, sameResidue = 0, primeAndResidue = 0;
for (const p of book.pages.filter(p => p.page <= 55)) {
  let sum = 0;
  for (let i = 0; i < p.indices.length; i++) {
    sum += book.prime[p.indices[i]];
    if (i >= 19) sum -= book.prime[p.indices[i - 19]];
    if (i < 18) continue;
    windows++;
    if (sum % 29 === 7) {
      sameResidue++;
      if (isPrime(sum)) primeAndResidue++;
    }
  }
}
assert.deepEqual([windows, sameResidue, primeAndResidue], [11966, 428, 104]);
console.log(JSON.stringify({
  originalPage: 27,
  titleGP: title.length,
  headingGP: original.length,
  titlePrimeSum: 761,
  headingPrimeSum: 1109,
  sharedMod29: 7,
  fixedAlphabetMaxOverlap: 6,
  forcedRuneChangesEvenWithArbitraryReorderingAndTwoShellRunes: 11,
  staticBijectionPlusTwoShellPossible: false,
  matchingRedHeadingCount: 1,
  redSpans: 18,
  unrelatedOriginal19WindowsMatchingResidue: sameResidue,
  unrelatedOriginal19WindowsTotal: windows,
  residueAndPrimeWindowCount: primeAndResidue,
  nativePositivePlants: 2
}, null, 2));

"use strict";

/**
 * Original p3/p39 isolated red three-rune headings:
 * GP prime-weight sum, historical Stage11 title 133, and chapter targets.
 *
 * Windows 11, Node.js 22, CommonJS, standard library only.
 * SFT: node sims/lp2_red119_gpprime_page133_bridge_sft.cjs
 *
 * All 18 source annotated red spans are included as a control for the
 * natural prime-index address rule. This documents a candidate page
 * reference rather than decryption or an authenticated operator.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const html = read("resources/external/cicada2014-stage11-onion7-original-index.html");
assert.match(html, /<title>133<\/title>/);
const reference = 133;
assert.equal(ink.pages.length, 58);
assert.equal(book.pages.length, 58);
assert.deepEqual(book.prime.slice(0, 3), [2, 3, 5]);
const weights = new Map(book.runes.map((r, i) => [r, book.prime[i]]));

/** @param {number} x */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {string} runes */
const primeSum = runes => [...runes].reduce((s, c) => {
  const v = weights.get(c);
  assert.notEqual(v, undefined, "Unknown GP rune " + c);
  return s + v;
}, 0);

/** @param {number} count */
function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let isPrime = true;
    for (let k = 2; k * k <= n; k++) {
      if (n % k === 0) { isPrime = false; break; }
    }
    if (isPrime) out.push(n);
  }
  return out;
}
const positivePrimes = primes(1000);
assert.equal(positivePrimes[32], 137);
assert.equal(positivePrimes[39], 173);
assert.equal(positivePrimes[463], 3301);
const finitePagePrimeIndex = new Map(
  positivePrimes.slice(0, 58).map((v, i) => [v, i + 1])
);
const red = ink.pages.flatMap(p => p.red_spans.map(s => ({
  page: p.page, start: s.start, length: s.length,
  runes: s.runes, prime_sum: primeSum(s.runes)
})));
assert.equal(red.length, 18);
const short = red.filter(s => s.length === 3);
assert.deepEqual(short.map(s => [s.page, s.start, s.prime_sum]), [
  [3, 119, 137], [39, 119, 173]
]);
for (const item of short) {
  const annotations = ink.pages.find(p => p.page === item.page).large_punctuation;
  for (const off of [119, 122]) {
    assert(annotations.some(p => p[0] === off && p[1] === 13 && p[2] === "red"));
  }
  assert.equal(item.prime_sum - (item.page + 1), reference);
}
assert.deepEqual(short.map(s => finitePagePrimeIndex.get(s.prime_sum)), [33, 40]);
const redWithInBookPrimeSum = red.filter(s => finitePagePrimeIndex.has(s.prime_sum));
assert.deepEqual(redWithInBookPrimeSum.map(s => s.page), [3, 39]);
// The source's physical original chapter openings, confirmed by image frames.
const chapterStarts = [0, 3, 8, 15, 23, 27, 33, 40, 54];
assert([33, 40].every(p => chapterStarts.includes(p)));
assert.equal(book.pages.find(p => p.page === 33).indices.length, 214);
assert.equal(book.pages.find(p => p.page === 40).indices.length, 231);

/**
 * Authentic solved p56 prime-totient key and F-pass-through model.
 * Investigates the direct hypothesis: the red prime ordinal starts
 * a page-local prime clock on each indicated chapter opening.
 *
 * @param {number[]} ciphertext
 * @param {number} firstPrimeIndex Zero-based prime rank.
 * @param {-1|1} sign
 */
function feasible(ciphertext, firstPrimeIndex, sign) {
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const consumed of states) {
      const c = ciphertext[i];
      if (c === 0) next.add(consumed); // literal plaintext F, no key used
      const shift = (positivePrimes[firstPrimeIndex + consumed] - 1) % 29;
      const p = mod29(c - sign * shift);
      if (p !== 0) next.add(consumed + 1);
    }
    states = next;
    if (!states.size) return {ok: false, firstFail: i};
  }
  return {ok: true, firstFail: null, histories: states.size};
}
const p33 = book.pages.find(p => p.page === 33).indices;
const p40 = book.pages.find(p => p.page === 40).indices;
const p56 = book.pages.find(p => p.page === 56).indices;
const positive = feasible(p56, 0, 1);
assert(positive.ok);
const inversion = [
  {page: 33, primeOrdinal: 33, originalLength: p33.length,
   plus: feasible(p33, 32, 1), minus: feasible(p33, 32, -1)},
  {page: 40, primeOrdinal: 40, originalLength: p40.length,
   plus: feasible(p40, 39, 1), minus: feasible(p40, 39, -1)}
];
assert.deepEqual(inversion.map(x => [x.plus.firstFail, x.minus.firstFail]), [
  [3, 74], [106, 35]
]);
// A small deterministic p56-native positive plant, using actual clear GP
// runes from solved p57 and a first-prime-rank of 32/39.
const plain = book.pages.find(p => p.page === 57).indices.slice(0, 45);
const planted = [];
for (const initial of [32, 39]) {
  let consumed = 0;
  const cipher = plain.map(p => p === 0 ? 0 :
    mod29(p + positivePrimes[initial + consumed++] - 1));
  assert(feasible(cipher, initial, 1).ok);
  planted.push({firstPrimeRank: initial + 1, nativeRunes: plain.length, legal: true});
}
console.log(JSON.stringify({
  physical_pages: 58, originalRedSpans: red.length,
  selectedRedTriplets: short.map(s => ({
    sourcePage: s.page, originalRuneOffset: s.start,
    GPindices: [...s.runes].map(r => book.runes.indexOf(r)),
    primeSum: s.prime_sum,
    sourceHtmlTitle: reference,
    sourcePageOrdinal: s.page + 1,
    primeIndexedDestination: finitePagePrimeIndex.get(s.prime_sum)
  })),
  onlyTwoWholeRedSpansSummingToInBookPrimes: true,
  markedDestinationsAreSeparateChapterStarts: true,
  authenticatedSolvedP56Control: positive,
  directPrimeTotientOriginalPageInversions: inversion,
  plantedSourceNativeControls: planted,
  status: "Source-exact numerical crosslink; author intention and cipher unproven"
}, null, 2));

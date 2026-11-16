'use strict';

/**
 * The 20 original p57 PARABLE words contain 55 strict interior GP runes.
 * Source-specific table split: 19 body words -> 50 interiors; PARABLE
 * title -> 5 interiors. LP2 has 50 rune-bearing p0..49 and 5 p51..55.
 * This tests a single exact prime-totient page-seed reading, while
 * preserving all 12,956 original ciphertext runes and all F exceptions.
 *
 * SFT: node sims/lp2_parable55_pagekey_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = read('resources/lp2-transcription.txt');
const p57Original = original.split('%').slice(-1)[0]
  .replace(/\/\r?\n/g, '').replace(/\r?\n/g, '');
const runeToNumber = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const runeRegex = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const p57Words = (p57Original.match(runeRegex) || []).map(word =>
  Array.from(word, char => runeToNumber.get(char)));
assert.equal(p57Words.length, 20);
assert.equal(p57Words.flat().length, 95);
assert.deepEqual(p57Words[0],
  [13, 24, 4, 24, 17, 20, 18], 'literal PARABLE GP29 title');
assert.equal(p57Words.slice(1).flat().length, 88);
assert(p57Words.every(word => word.length >= 2));

const interior = word => word.slice(1, -1);
const titleFive = interior(p57Words[0]);
const bodyFifty = p57Words.slice(1).flatMap(interior);
assert.equal(titleFive.length, 5);
assert.equal(bodyFifty.length, 50);
assert.equal(p57Words.reduce((sum, w) => sum + interior(w).length, 0), 55);
const unknownPages = corpus.pages.filter(page => page.page < 56 && page.indices.length);
assert.equal(unknownPages.length, 55);
assert.equal(unknownPages.slice(0, 50).length, 50);
assert.deepEqual(unknownPages.slice(-5).map(page => page.page), [51, 52, 53, 54, 55]);
assert.equal(corpus.pages[50].indices.length, 0);
assert.equal(unknownPages.reduce((n, page) => n + page.indices.length, 0), 12956);

/** @param {number} a */
const mod = a => ((a % 29) + 29) % 29;
/** @param {number} count */
function firstPrimes(count) {
  /** @type {number[]} */
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(n);
  }
  return primes;
}
const primes = firstPrimes(400);

/**
 * All-path exact reachability for solved-page plaintext-F bypass.
 * A current ciphertext F can either be literal plaintext F (no clock
 * advance) or result from a decoded non-F (clock advances).
 * Other ciphertext runes cannot decrypt to plaintext F.
 * @param {number[]} cipher
 * @param {number} seedIndex
 * @returns {number} first impossible offset, or -1 if fully reachable
 */
function firstContradiction(cipher, seedIndex) {
  let positions = new Set([seedIndex]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const primeIndex of positions) {
      const letter = mod(cipher[i] - (primes[primeIndex] - 1));
      if (letter !== 0) next.add(primeIndex + 1);
      if (cipher[i] === 0) next.add(primeIndex);
    }
    if (next.size === 0) return i;
    positions = next;
  }
  return -1;
}
assert.equal(firstContradiction(corpus.pages[56].indices, 0), -1,
  'authentic 85-rune p56 original prime/F positive');

const results = {};
for (const [label, keyTape] of [
  ['printed_title_first', [...titleFive, ...bodyFifty]],
  ['table_split_body_then_title', [...bodyFifty, ...titleFive]]
]) {
  const runs = unknownPages.map((page, i) => ({
    page: page.page, seed: keyTape[i],
    firstImpossibleOffset: firstContradiction(page.indices, keyTape[i])
  }));
  const reachable = runs.filter(item => item.firstImpossibleOffset < 0);
  results[label] = {
    reachablePages: reachable.map(item => item.page),
    impossiblePages: 55 - reachable.length,
    failuresWithin20: runs.filter(item =>
      item.firstImpossibleOffset >= 0 && item.firstImpossibleOffset <= 20).length,
    p0FailureOffset: runs[0].firstImpossibleOffset,
    p55FailureOffset: runs[54].firstImpossibleOffset
  };
}
assert.deepEqual(results.printed_title_first.reachablePages, [43]);
assert.deepEqual(results.table_split_body_then_title.reachablePages, []);

// Key-independent upper bound for every static bijection of GP29 on
// each unaltered page. Any one plaintext rune has at most the highest
// ciphertext-rune frequency of each page, no matter the page keys.
let allKeyMaximumSingleRuneCount = 0;
for (const page of unknownPages) {
  const histogram = Array(29).fill(0);
  for (const v of page.indices) histogram[v]++;
  allKeyMaximumSingleRuneCount += Math.max(...histogram);
}
assert.equal(allKeyMaximumSingleRuneCount, 767);
console.log(JSON.stringify({
  structural: {p57TitleInterior: titleFive.length,
    p57BodyInterior: bodyFifty.length,
    unknownPagesBeforeTable: 50, unknownPagesAfterTable: 5},
  directPrimeTotientPageSeeds: results,
  anyStaticPageAlphabetSingleRuneCeiling:
    {count: allKeyMaximumSingleRuneCount, outOf: 12956,
      proportion: allKeyMaximumSingleRuneCount / 12956},
  conclusion: 'Exact 55-rune key tape; no direct prime/F per-page inverse'
}, null, 2));

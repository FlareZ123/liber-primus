'use strict';

/**
 * SFT: p0's source-first red word through the provisional 2016 GP-prime
 * quotient/remainder map, including *continuation past* the solved p57 word TO.
 * Read-only Node.js 22, from any working directory. This is a candidate
 * navigation route, NOT an authenticated LP2 decipherment.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const chunks = read('resources/liber-primus/lp2-transcription.txt').split('%');
assert.equal(chunks.length, 57);
const weights = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));

/** @param {string} input @returns {string[]} */
function printedSegments(input) {
  const words = [];
  let word = '';
  for (const ch of input) {
    if (weights.has(ch)) word += ch;
    else if (ch === '/' || /\s/u.test(ch)) continue;
    else if (word) { words.push(word); word = ''; }
  }
  if (word) words.push(word);
  return words;
}
const pages = Array.from({ length: 58 }, (_, page) => page === 50
  ? grid.pages.find((p) => p.page === 50).tokens
  : printedSegments(chunks[page >= 51 ? page - 1 : page]));
assert.equal(pages[50].length, 104);
assert.equal(pages[55].length, 17);
assert.equal(pages.slice(0, 56).reduce((n, words, i) =>
  n + (i === 50 ? 0 : words.length), 0), 2928);

/** @param {string} runeWord @returns {number} */
function primeSum(runeWord) {
  return [...runeWord].reduce((n, ch) => n + weights.get(ch), 0);
}
assert.equal(pages[0][0], 'ᛋᚻᛖᚩᚷᛗᛡᚠ');
assert.equal(primeSum(pages[0][0]), 347);

/**
 * Deterministically follow the hypothesis for one frozen starting source.
 * @param {number[][]} sums source word prime sums per page
 * @returns {{type:string, length?:number, preperiod?:number, steps:Array<{page:number,wi:number,n:number}>}}
 */
function walk(sums) {
  let n = 347;
  const seen = new Map();
  const steps = [];
  for (let i = 0; i < 2000; i++) {
    const page = n % 58;
    const wi = Math.floor(n / 58);
    const node = page + ':' + wi;
    if (seen.has(node)) return {
      type: 'cycle', length: steps.length - seen.get(node),
      preperiod: seen.get(node), steps
    };
    if (page === 50 || wi >= sums[page].length) return {
      type: 'sink', steps
    };
    seen.set(node, steps.length);
    steps.push({ page, wi, n });
    n = sums[page][wi];
  }
  assert.fail('Unbounded path');
}
const sums = pages.map((words, page) =>
  page === 50 ? [] : words.map(primeSum));
const actual = walk(sums);
assert.equal(actual.type, 'cycle');
assert.equal(actual.preperiod, 1);
assert.equal(actual.length, 33);
assert.equal(actual.steps.length, 34);
assert.deepEqual(actual.steps[0], { page: 57, wi: 5, n: 347 });
assert.equal(pages[57][5], 'ᛏᚩ'); // Authentically clear: TO.
assert.deepEqual(actual.steps[1], { page: 8, wi: 1, n: 66 });
const cycle = actual.steps.slice(1);
assert.equal(cycle.length, 33);
const derivedKey = cycle.map(({ page, wi }) => sums[page][wi] % 29);
assert.equal(derivedKey.length, 33);
const cipher55 = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(cipher55.length, 76);
/** @param {number[]} text @returns {number} */
function ioc(text) {
  const hist = Array(29).fill(0);
  text.forEach((v) => hist[v]++);
  return hist.reduce((n, v) => n + v * (v - 1), 0) /
    (text.length * (text.length - 1));
}
/** @param {number[]} source @param {number} sign @returns {number[]} */
function inverse(source, sign) {
  return source.map((value, i) => (value + sign * derivedKey[i % 33] + 29) % 29);
}
const plus = inverse(cipher55, 1);
const minus = inverse(cipher55, -1);
assert.ok(Math.abs(ioc(plus) - 0.034035087719298245) < 1e-12);
assert.ok(Math.abs(ioc(minus) - 0.03263157894736842) < 1e-12);
const originalKnown = corpus.pages.find((p) => p.page === 57).indices;
const planted = originalKnown.map((v, i) => (v + derivedKey[i % 33]) % 29);
assert.deepEqual(inverse(planted, -1), originalKnown);

// Explicitly exploratory, *post-observation* comparison only.
// Shuffle complete encrypted source-word prime-sums WITHIN their printed pages;
// keep p0 red first sum=347 and p56/p57, so first TO hop is fixed.
// The 33-cycle was noticed after observing it; the Monte Carlo frequency
// must not be reported as a pre-registered discovery probability.
let state = 0x33012016;
/** @returns {number} */
function random() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 0x100000000;
}
const trials = 4000;
let cycles = 0;
let exact33 = 0;
let atLeast33 = 0;
for (let trial = 0; trial < trials; trial++) {
  const shuffled = sums.map((xs, page) => {
    const copy = xs.slice();
    if (page === 50 || page >= 56) return copy;
    const first = page === 0 ? 1 : 0;
    for (let i = copy.length - 1; i > first; i--) {
      const j = first + Math.floor(random() * (i - first + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  });
  const result = walk(shuffled);
  if (result.type === 'cycle') {
    cycles++;
    if (result.length === 33) exact33++;
    if (result.length >= 33) atLeast33++;
  }
}
assert.equal(cycles, 2560);
assert.equal(exact33, 19);
assert.equal(atLeast33, 94);
console.log(JSON.stringify({
  start: 'physical p0 first red 8-runic word, sum 347',
  firstHop: 'p57:w5 TO', nextHop: 'p8:w1',
  distinctCycleNodes: cycle.length, transientSolvedNodes: actual.preperiod,
  cycleAddresses: cycle.map(({ page, wi }) => 'p' + page + ':w' + wi),
  derived33Key: derivedKey, originalP55IoC: ioc(cipher55),
  fixedDirectVigenereP55: { plusIoC: ioc(plus), minusIoC: ioc(minus) },
  seed: '0x33012016', shuffledTrials: trials,
  shuffledCycles: cycles, shuffledExactly33: exact33,
  shuffledAtLeast33: atLeast33,
  decision: 'Interesting conditional navigation path; no plaintext or authenticated codebook.'
}, null, 2));

'use strict';

/**
 * Agent12 / Director #2333. Read-only Windows Node22 CommonJS SFT.
 * Reproduce the original boundary-vs-interior 29-step comparison, then test
 * exactly one frozen, reversible source-symbol rotor candidate.
 *
 * The rotor is a deliberately UNAUTHENTICATED hypothesis, not a Cicada key.
 * Run: node sims/lp2_crossword_continuous_28step_rotor_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const source = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const blocks = source.split('%');
const alphabet = new Map(corpus.runes.map((symbol, index) => [symbol, index]));
assert.equal(blocks.length, 57);
assert.equal(alphabet.size, 29);

/** @type {number[]} */
const cipher = [];
/** @type {number[]} 0=no separator, 1='-', 2='.' before this symbol */
const separator = [];
/** @type {{page:number,start:number,end:number}[]} */
const pages = [];
let pendingSeparator = 0;

for (let page = 0; page <= 55; page++) {
  const start = cipher.length;
  if (page !== 50) {
    const record = page < 50 ? page : page - 1;
    /** @type {number[]} */
    const originalPage = [];
    for (const char of blocks[record]) {
      if (alphabet.has(char)) {
        const rune = alphabet.get(char);
        cipher.push(rune);
        originalPage.push(rune);
        separator.push(pendingSeparator);
        pendingSeparator = 0;
      } else if (char === '-') pendingSeparator = 1;
      else if (char === '.') pendingSeparator = 2;
    }
    assert.deepEqual(originalPage, corpus.pages[page].indices, 'physical p' + page);
  }
  pages.push({ page, start, end: cipher.length });
}
assert.equal(cipher.length, 12956);
assert.equal(separator.length, cipher.length);

const inside = Array(29).fill(0);
const boundary = Array(29).fill(0);
let withinEqual = 0;
let acrossEqual = 0;
let hyphenCount = 0;
let hyphenEqual = 0;
let periodCount = 0;
let periodEqual = 0;

for (const { page, start, end } of pages) {
  if (page === 50) continue;
  for (let i = start + 1; i < end; i++) {
    const delta = (cipher[i] - cipher[i - 1] + 29) % 29;
    const mark = separator[i];
    if (mark) {
      boundary[delta]++;
      if (!delta) acrossEqual++;
      if (mark === 1) {
        hyphenCount++;
        if (!delta) hyphenEqual++;
      } else {
        periodCount++;
        if (!delta) periodEqual++;
      }
    } else {
      inside[delta]++;
      if (!delta) withinEqual++;
    }
  }
}
assert.equal(inside.reduce((a, b) => a + b, 0), 10028);
assert.equal(boundary.reduce((a, b) => a + b, 0), 2873);
assert.equal(withinEqual, 63);
assert.equal(acrossEqual, 23);
assert.deepEqual([hyphenCount, hyphenEqual, periodCount, periodEqual],
  [2713, 22, 160, 1]);

let pageLinks = 0;
let pageLinksEqual = 0;
let lastPage;
for (const page of pages) {
  if (page.start === page.end) continue;
  if (lastPage) {
    pageLinks++;
    if (cipher[lastPage.end - 1] === cipher[page.start]) pageLinksEqual++;
  }
  lastPage = page;
}
assert.deepEqual([pageLinks, pageLinksEqual], [54, 0]);

/** Pearson 2-by-29 chi-square with empirically pooled columns. */
function chiSquare(left, right) {
  const nLeft = left.reduce((a, b) => a + b, 0);
  const nRight = right.reduce((a, b) => a + b, 0);
  let value = 0;
  for (let i = 0; i < 29; i++) {
    const pooled = left[i] + right[i];
    const eLeft = pooled * nLeft / (nLeft + nRight);
    const eRight = pooled * nRight / (nLeft + nRight);
    value += (left[i] - eLeft) ** 2 / eLeft;
    value += (right[i] - eRight) ** 2 / eRight;
  }
  return value;
}

/** Exact survival function for chi-squared with 28 degrees of freedom. */
function chi28Survival(value) {
  const x = value / 2;
  let term = 1, sum = term;
  for (let j = 1; j <= 13; j++) {
    term *= x / j;
    sum += term;
  }
  return Math.exp(-x) * sum;
}
const chi2 = chiSquare(inside, boundary);
const tail = chi28Survival(chi2);
assert(Math.abs(chi2 - 25.83466949897499) < 1e-9);
assert(Math.abs(tail - 0.5821319649430854) < 1e-10);
console.log('Original 55 rune-bearing pages, symbols:', cipher.length);
console.log('Within printed units: 63/10028 equal; across printed units: 23/2873');
console.log('Boundary marks: hyphens 22/2713, periods 1/160');
console.log('Physical page links: 0/54 adjacent equal, with 32 known word carries');
console.log('Full mod29 delta homogeneity: chi2=', chi2.toFixed(9),
  'df=28 upper-tail=', tail.toFixed(9));

/**
 * A single frozen, purely exploratory one-symbol GP29 rotor:
 *
 * - keep C0=P0 as the initial state;
 * - F (GP0) consumes zero step; all 28 other GP runes consume one of 1..28;
 * - at each subsequent rune i, step_i=0 for F or
 *       1+((P_i-1+state) mod28) for other GP symbols;
 * - C_i=C_(i-1)+step_i mod29;
 * - state=(state+C_i+mark_i) mod28; mark_i: 0 none, 1 '-', 2 '.'.
 *
 * Ciphertext state CONTINUES across every word and physical-page edge.
 * Complete inverse is defined from C_{i-1}, C_i, mark_i and state.
 * Historical Cicada material does not select this rotor, its F pivot,
 * its update law, the sign, or the initialization. It is a negative
 * example of a candidate that matches the repeat mechanism but fails
 * actual original plaintext tests.
 */
const mod = (value, m) => ((value % m) + m) % m;
/**
 * @param {number[]} ciphertext
 * @param {number[]} marks
 * @returns {number[]}
 */
function decode(ciphertext, marks) {
  let state = 0;
  const result = [ciphertext[0]];
  for (let i = 1; i < ciphertext.length; i++) {
    const delta = mod(ciphertext[i] - ciphertext[i - 1], 29);
    result.push(delta === 0 ? 0 : 1 + mod(delta - 1 - state, 28));
    state = mod(state + ciphertext[i] + marks[i], 28);
  }
  return result;
}
/**
 * @param {number[]} plaintext
 * @param {number[]} marks
 * @returns {number[]}
 */
function encode(plaintext, marks) {
  let state = 0;
  const result = [plaintext[0]];
  for (let i = 1; i < plaintext.length; i++) {
    const delta = plaintext[i] === 0 ? 0 : 1 + mod(plaintext[i] - 1 + state, 28);
    const value = mod(result[i - 1] + delta, 29);
    result.push(value);
    state = mod(state + value + marks[i], 28);
  }
  return result;
}
const plaintext = decode(cipher, separator);
assert.deepEqual(encode(plaintext, separator), cipher);
const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
const encodedKnown = encode(known, separator.slice(0, known.length));
assert.deepEqual(decode(encodedKnown, separator.slice(0, known.length)), known);
assert.equal(plaintext.filter(n => n === 0).length, 86);

/** @param {number} firstPage @param {number} lastPage */
function evaluate(firstPage, lastPage) {
  const part = plaintext.slice(pages[firstPage].start, pages[lastPage].end);
  const histogram = Array(29).fill(0);
  for (const rune of part) histogram[rune]++;
  const IoC = histogram.reduce((sum, n) => sum + n * (n - 1), 0) /
    (part.length * (part.length - 1));
  const text = part.slice(0, 100).map(n => corpus.translit[n]).join('');
  return { range: 'p' + firstPage + '-p' + lastPage,
    runes: part.length, E: histogram[18], F: histogram[0],
    IoC: IoC, candidateFirst100: text };
}
const main = evaluate(16, 21), holdout = evaluate(40, 53);
assert.equal(main.runes, 1613);
assert.equal(holdout.runes, 3008);
assert.equal(main.E, 56);
assert.equal(holdout.E, 80);
console.log('Rotor original 12956/12956 forward replay PASS');
console.log('Authentic solved p57 GP native 95/95 planted roundtrip PASS');
console.log('Main original receiver:', JSON.stringify(main));
console.log('Disjoint original holdout:', JSON.stringify(holdout));
console.log('RESULT: No contiguous plaintext, author key, or historical cipher established.');

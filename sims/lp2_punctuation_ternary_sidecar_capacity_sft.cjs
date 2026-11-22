'use strict';

/**
 * Original-source, single-file test of a punctuation-only ternary sidecar for
 * an LP2 fixed-length, universally low-repeat GP29 transport.
 *
 * Runtime: Node.js 22, CommonJS. Reads existing repository reference files.
 * The test is a cardinality obstruction, not a guessed decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const transcript = fs.readFileSync(
  path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8'
);

const originalPages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const runeBearingSegments = transcript.split('%').slice(0, 55);
const runeMap = new Map(corpus.runes.map((rune, i) => [rune, i]));

assert.equal(originalPages.length, 55);
assert.equal(runeBearingSegments.length, 55);

let totalRunes = 0;
let totalWithinPagePairs = 0;
let originalDoubles = 0;
let pagewiseMissingBits = 0;
const punctuationCounts = { '.': 0, '&': 0, '$': 0 };
const numericGlyphs = [];

for (let pageIndex = 0; pageIndex < originalPages.length; pageIndex++) {
  const canonical = originalPages[pageIndex].indices;
  const segment = runeBearingSegments[pageIndex];
  const actual = [];
  for (const character of segment) {
    if (runeMap.has(character)) {
      actual.push(runeMap.get(character));
    } else if (Object.hasOwn(punctuationCounts, character)) {
      punctuationCounts[character]++;
    } else if (/^[0-9]$/.test(character)) {
      numericGlyphs.push(character);
    }
  }
  assert.deepEqual(actual, canonical, `transcription mismatch at rune-bearing page ${pageIndex}`);
  totalRunes += canonical.length;
  totalWithinPagePairs += canonical.length - 1;
  let pageDoublets = 0;
  for (let i = 1; i < canonical.length; i++) {
    if (canonical[i] === canonical[i - 1]) {
      originalDoubles++;
      pageDoublets++;
    }
  }
  pagewiseMissingBits -= Math.log2(uniformGpRepeatTail(canonical.length - 1, pageDoublets));
}

assert.equal(totalRunes, 12956);
assert.equal(totalWithinPagePairs, 12901);
assert.equal(originalDoubles, 86);
assert.deepEqual(punctuationCounts, { '.': 175, '&': 17, '$': 8 });
assert.deepEqual(numericGlyphs, ['7', '1', '2', '3', '4', '5']);

const punctuationPositions = Object.values(punctuationCounts).reduce((a, b) => a + b, 0);
assert.equal(punctuationPositions, 200);

/**
 * P(K <= observed) under a uniform GP29 output with independently chosen
 * successor runes, retaining all actual page starts and page lengths.
 *
 * For Binomial(N, 1/29), the exact probability recurrence is:
 * p(k+1) = p(k) * (N-k) / ((k+1)*28).
 * All terms remain representable in IEEE-754 for the original N and k.
 *
 * @param {number} n Within-page transitions.
 * @param {number} maxRepeat Maximum same-rune transitions.
 * @returns {number} Lower-tail probability.
 */
function uniformGpRepeatTail(n, maxRepeat) {
  let term = Math.pow(28 / 29, n);
  let tail = term;
  for (let k = 0; k < maxRepeat; k++) {
    term *= (n - k) / ((k + 1) * 28);
    tail += term;
  }
  return tail;
}

/** @param {number} n Nonnegative integer. @returns {bigint} */
function factorial(n) {
  let out = 1n;
  for (let i = 2; i <= n; i++) out *= BigInt(i);
  return out;
}

/**
 * Exact base-3 injection/dejection control for the full punctuation register.
 * This validates that treating marker identities as independent trits yields
 * precisely 3^200 distinguishable sidecar configurations, not some hidden
 * larger register.
 *
 * @param {bigint} value Nonnegative integer below 3^slots.
 * @param {number} slots Number of ternary locations.
 * @returns {number[]} Source-order digit array.
 */
function encodeTrits(value, slots) {
  assert(value >= 0n && value < 3n ** BigInt(slots));
  let remaining = value;
  const digits = [];
  for (let i = 0; i < slots; i++) {
    digits.push(Number(remaining % 3n));
    remaining /= 3n;
  }
  assert.equal(remaining, 0n);
  return digits;
}

/** @param {number[]} digits Digits 0,1,2. @returns {bigint} */
function decodeTrits(digits) {
  let value = 0n;
  for (let i = digits.length - 1; i >= 0; i--) {
    assert(digits[i] >= 0 && digits[i] <= 2);
    value = value * 3n + BigInt(digits[i]);
  }
  return value;
}

const testValues = [0n, 1n, 0x3301n, (3n ** BigInt(punctuationPositions)) - 1n];
for (const value of testValues) {
  const trits = encodeTrits(value, punctuationPositions);
  assert.equal(decodeTrits(trits), value);
}

const repeatTail = uniformGpRepeatTail(totalWithinPagePairs, originalDoubles);
const minMissingBits = -Math.log2(repeatTail);
const ternaryCapacity = punctuationPositions * Math.log2(3);
const unrestrictedGap = minMissingBits - ternaryCapacity;
const additionalTritsRequired = Math.ceil(unrestrictedGap / Math.log2(3));
const fourStateCapacity = punctuationPositions * 2;
const fourStatePagewiseDeficit = pagewiseMissingBits - fourStateCapacity;
const additionalFourStatePositionsRequired = Math.ceil(fourStatePagewiseDeficit / 2);

const counts = Object.values(punctuationCounts);
const fixedInventoryCases = factorial(punctuationPositions) /
  counts.map((count) => factorial(count)).reduce((a, b) => a * b, 1n);
const fixedInventoryBits = Math.log2(Number(fixedInventoryCases));
const fixedInventoryGap = minMissingBits - fixedInventoryBits;

assert(Math.abs(minMissingBits - 325.450254) < 0.00001);
assert.equal(Math.ceil(minMissingBits), 326);
assert(ternaryCapacity < minMissingBits);
assert.equal(additionalTritsRequired, 6);
assert(Math.abs(pagewiseMissingBits - 430.561201) < 0.00001);
assert.equal(fourStateCapacity, 400);
assert.equal(additionalFourStatePositionsRequired, 16);
assert(fixedInventoryBits < ternaryCapacity);

console.log('[source] GP29 rune-bearing unknown pages:', originalPages.length);
console.log('[source] original GP29 ciphertext runes:', totalRunes);
console.log('[source] within-page transitions:', totalWithinPagePairs);
console.log('[source] within-page original adjacent doubles:', originalDoubles);
console.log('[source] physical punctuation register:', JSON.stringify(punctuationCounts));
console.log('[source] fixed nonpunctuation digits, excluded from model:', numericGlyphs.join(','));
console.log('[positive] four full-length base-3 register codec roundtrips: 4/4');
console.log('[theorem] uniform-GP29 <= 86-repeat fraction:', repeatTail.toExponential(12));
console.log('[theorem] universal no-extra-ciphertext sidecar lower bound bits:', minMissingBits.toFixed(9));
console.log('[theorem] independent ternary states at 200 unchanged positions bits:', ternaryCapacity.toFixed(9));
console.log('[theorem] unrestricted ternary marker deficit bits:', unrestrictedGap.toFixed(9));
console.log('[theorem] additional independent ternary markers minimally needed:', additionalTritsRequired);
console.log('[theorem] per-page exact observed repeat budgets: required side bits:', pagewiseMissingBits.toFixed(9));
console.log('[theorem] 200 independent four-state mark positions: maximum bits:', fourStateCapacity);
console.log('[theorem] pagewise four-state mark deficit bits:', fourStatePagewiseDeficit.toFixed(9));
console.log('[theorem] extra independent four-state positions required:', additionalFourStatePositionsRequired);
console.log('[theorem] fixed punctuation-histogram rearrangement bits:', fixedInventoryBits.toFixed(9));
console.log('[theorem] fixed punctuation-histogram deficit bits:', fixedInventoryGap.toFixed(9));
console.log('PASS: ternary/global and four-state/pagewise fixed-position punctuation capacity gates both exclude universal fixed-shape anti-repeat encoding.');

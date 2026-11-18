'use strict';

/**
 * Original-source line-reset gate for LP2.
 * A memoryless, uniform GP29 restart at each printed line start predicts a
 * preceding-rune match with probability 1/29, independently across starts.
 * This is a targeted rejection test, not an attempted unknown-page decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
function resource(name) {
  return fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8');
}

/** @param {number} n @param {number} k @param {number} probability */
function binomialCdf(n, k, probability) {
  let term = (1 - probability) ** n;
  let sum = term;
  for (let i = 1; i <= k; i++) {
    term *= ((n - i + 1) / i) * (probability / (1 - probability));
    sum += term;
  }
  return sum;
}

/**
 * Hypergeometric P(X=x) for x=0..min(K,B); here all original pages have B<=N-K.
 * @param {number} n Original page-internal transitions
 * @param {number} k Printed line starts within this page
 * @param {number} b Observed repeats on this page
 */
function hypergeometric(n, k, b) {
  assert.ok(b <= n - k);
  let p0 = 1;
  for (let i = 0; i < b; i++) p0 *= (n - k - i) / (n - i);
  const distribution = [p0];
  let term = p0;
  for (let x = 0; x < Math.min(k, b); x++) {
    term *= ((k - x) * (b - x)) / ((x + 1) * (n - k - b + x + 1));
    distribution.push(term);
  }
  return distribution;
}

/** @param {number[]} left @param {number[]} right */
function convolve(left, right) {
  const next = new Array(left.length + right.length - 1).fill(0);
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) next[i + j] += left[i] * right[j];
  }
  return next;
}

const corpus = JSON.parse(resource('lp2-corpus.json'));
const punctuation = JSON.parse(resource('lp2-punctuation-identity.json'));
const sourceText = resource('lp2-transcription.txt');
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const cipher = pages.flatMap((p) => p.indices);
assert.equal(cipher.length, 12956);

const alphabet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((r, index) => [r, index]));
const reconstructed = [];
const lineStarts = [];
let followingPrintedLine = false;
for (const line of sourceText.split(/\r?\n/)) {
  if (line.trim() === '%') {
    followingPrintedLine = false;
    continue;
  }
  const runes = Array.from(line).filter((r) => alphabet.has(r));
  if (runes.length === 0) continue;
  if (followingPrintedLine && reconstructed.length > 0 && reconstructed.length < cipher.length) {
    lineStarts.push(reconstructed.length);
  }
  for (const rune of runes) reconstructed.push(runeIndex.get(rune));
  followingPrintedLine = line.trimEnd().endsWith('/');
}
assert.deepEqual(reconstructed.slice(0, cipher.length), cipher);
assert.equal(reconstructed.length, 13136);
assert.equal(lineStarts.length, 539);

const equality = new Set();
for (let i = 1; i < cipher.length; i++) {
  if (cipher[i] === cipher[i - 1]) equality.add(i);
}
assert.equal(equality.size, 86);

const lineHits = lineStarts.filter((i) => equality.has(i)).length;
assert.equal(lineHits, 4);
const lineResetTail = binomialCdf(lineStarts.length, lineHits, 1 / 29);
assert.ok(lineResetTail < 0.00005);

// Conditional on each original physical page's actual number of repeat sites,
// randomly place those sites among that page's eligible internal transitions.
// This asks whether printed line starts have *extra* suppression beyond the
// existing manuscript-wide anti-repeat effect.
let offset = 0;
let expectedGivenPages = 0;
let conditional = [1];
const observedPages = [];
for (const page of pages) {
  const length = page.indices.length;
  const internalTransitions = length - 1;
  let pageRepeats = 0;
  for (let j = 1; j < length; j++) {
    if (page.indices[j] === page.indices[j - 1]) pageRepeats++;
  }
  const startIndices = lineStarts.filter((i) => i > offset && i < offset + length);
  const pageHits = startIndices.filter((i) => equality.has(i)).length;
  expectedGivenPages += pageRepeats * startIndices.length / internalTransitions;
  conditional = convolve(conditional, hypergeometric(
    internalTransitions, startIndices.length, pageRepeats,
  ));
  if (pageHits) observedPages.push({ page: page.page, repeatsAtLineStart: pageHits });
  offset += length;
}
assert.equal(offset, 12956);
const conditionedLowerTail = conditional.slice(0, lineHits + 1).reduce((a, b) => a + b, 0);
assert.ok(Math.abs(conditional.reduce((a, b) => a + b, 0) - 1) < 1e-12);

// Distinguish source-audited genuine punctuation from four transcription-only
// p15 numeric-row full stops. Deduplicate shared rune offsets of physical marks.
const editorial = new Set(punctuation.source_audit.audited_scope.excluded_editorial_stop_indices);
const visiblePunctuation = [...new Set(punctuation.events
  .filter((e) => !editorial.has(e.index) && e.rune_offset > 0 && e.rune_offset < cipher.length)
  .map((e) => e.rune_offset))];
const punctuationHits = visiblePunctuation.filter((i) => equality.has(i)).length;
assert.equal(visiblePunctuation.length, 172);
assert.equal(punctuationHits, 1);
const punctuationResetTail = binomialCdf(visiblePunctuation.length, punctuationHits, 1 / 29);

// A deterministic planted 19-match example verifies the test has its expected
// non-rejecting response for typical independent GP29 line-start draws.
assert.ok(binomialCdf(539, 19, 1 / 29) > 0.5);

console.log(JSON.stringify({
  source: 'unchanged canonical LP2 pp0-55, original printed rune lines',
  runes: cipher.length,
  totalAdjacentEquals: equality.size,
  originalWithinPageLineStarts: lineStarts.length,
  originalLineStartEquals: lineHits,
  uniformResetExpected: lineStarts.length / 29,
  uniformResetLowerTail: lineResetTail,
  sourcePageConditionedExpected: expectedGivenPages,
  sourcePageConditionedLowerTail: conditionedLowerTail,
  pagesWithLineStartRepeats: observedPages,
  genuineDistinctPunctuationOffsets: visiblePunctuation.length,
  punctuationEquals: punctuationHits,
  independentPunctuationResetLowerTail: punctuationResetTail,
  interpretation: 'Reject only an independent uniform rune restart at each line or punctuation; existing anti-repeat continues across line starts; no plaintext/key.',
}, null, 2));

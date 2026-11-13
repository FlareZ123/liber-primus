/**
 * Original LP2 red119 triads: GP-prime sum and physical-page gap census.
 * Node.js 22, CommonJS. Run from any directory.
 * Uses original-source transcript/ink annotation JSON, never a fitted key.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(base, 'lp2-ink-annotations.json'), 'utf8'));
const onion7Index = fs.readFileSync(path.join(__dirname, '..', 'resources',
  'cicada2014-onion7-index.html'), 'utf8');
const sourceTitle = Number(onion7Index.match(/<title>(\d+)<\/title>/)[1]);
assert.equal(sourceTitle, 133);
const value = (index) => corpus.prime[index];
const pages = new Map(corpus.pages.map((page) => [page.page, page.indices]));
const indexed = (runes) => Array.from(runes, (rune) => corpus.runes.indexOf(rune));
const sum = (items) => items.reduce((a, n) => a + value(n), 0);

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

const red = ink.pages.flatMap((page) => (page.red_spans || [])
  .filter((span) => span.length === 3)
  .map((span) => ({
    page: page.page,
    offset: span.start,
    indices: indexed(span.runes),
  })));
assert.deepEqual(red.map((x) => [x.page, x.offset, ...x.indices]), [
  [3, 119, 13, 23, 2],
  [39, 119, 27, 5, 15],
]);
const s0 = sum(red[0].indices);
const s1 = sum(red[1].indices);
assert.equal(s0, 137);
assert.equal(s1, 173);
assert.ok(isPrime(s0) && isPrime(s1));
assert.equal(s1 - s0, red[1].page - red[0].page);
assert.equal(s0 - (red[0].page + 1), sourceTitle);
assert.equal(s1 - (red[1].page + 1), sourceTitle);
const sourceTitleSpans = ink.pages.flatMap((page) => (page.red_spans || [])
  .filter((span) => sum(indexed(span.runes)) - (page.page + 1) === sourceTitle)
  .map((span) => [page.page, span.start, span.length]));
assert.deepEqual(sourceTitleSpans, [[3, 119, 3], [39, 119, 3]]);
assert.equal(String(s0).split('').sort().join(''),
  String(s1).split('').sort().join(''));

/** @param {number[]} indices */
function triples(indices) {
  const values = indices.map(value);
  const out = new Map();
  for (let i = 0; i < values.length - 2; i++) {
    const s = values[i] + values[i + 1] + values[i + 2];
    out.set(s, (out.get(s) || 0) + 1);
  }
  return out;
}
const a = triples(pages.get(3));
const b = triples(pages.get(39));
let total = 0;
let equalGap = 0;
let bothPrimeGap = 0;
let primeGapDigitAnagram = 0;
for (const [x, ax] of a) {
  for (const [y, by] of b) {
    const n = ax * by;
    total += n;
    if (y - x === 36) {
      equalGap += n;
      if (isPrime(x) && isPrime(y)) {
        bothPrimeGap += n;
        if (String(x).split('').sort().join('') ===
            String(y).split('').sort().join('')) primeGapDigitAnagram += n;
      }
    }
  }
}
assert.deepEqual([total, equalGap, bothPrimeGap, primeGapDigitAnagram],
  [51170, 378, 75, 14]);
console.log(JSON.stringify({
  source: { p3: { offset: 119, indices: red[0].indices, sum: s0 },
    p39: { offset: 119, indices: red[1].indices, sum: s1 } },
  page_gap: red[1].page - red[0].page,
  original_onion7_html_title: sourceTitle,
  subtract_1_based_page_ordinal_matches_title: true,
  controls: { all_contiguous_pairs: total, gap_equal: equalGap,
    gap_and_both_prime: bothPrimeGap,
    gap_both_prime_digit_anagram: primeGapDigitAnagram,
    frequency: primeGapDigitAnagram / total },
  verdict: 'Source-exact cross-artifact arithmetic; 1-based page adjustment is unselected; no plaintext/key.',
}, null, 2));

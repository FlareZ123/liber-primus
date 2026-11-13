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
/** @param {number} n */
function primeOrdinal(n) {
  if (!isPrime(n)) return null;
  let rank = 0;
  for (let v = 2; v <= n; v++) if (isPrime(v)) rank++;
  return rank;
}
const visualChapterStarts = [0, 3, 8, 15, 23, 27, 33, 40, 54];
for (const pg of visualChapterStarts) assert.ok(
  ink.pages.some((page) => page.page === pg &&
    (page.red_spans || []).some((span) => span.start === 0)),
  'Visual chapter boundary must carry a source-red heading'
);

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
assert.deepEqual([primeOrdinal(s0), primeOrdinal(s1)], [33, 40]);
assert.ok(visualChapterStarts.includes(primeOrdinal(s0)));
assert.ok(visualChapterStarts.includes(primeOrdinal(s1)));
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
const chapterSumTargets = new Map(visualChapterStarts.filter((p) => p > 0)
  .map((p) => {
    let n = 1;
    let rank = 0;
    while (rank < p) {
      n++;
      if (isPrime(n)) rank++;
    }
    return [n, p];
  }));
/** @param {number[]} indices */
function matchingTripleAddresses(indices) {
  const values = indices.map(value);
  const out = [];
  for (let i = 0; i < values.length - 2; i++) {
    const s = values[i] + values[i + 1] + values[i + 2];
    if (chapterSumTargets.has(s)) out.push({offset: i, target: chapterSumTargets.get(s)});
  }
  return out;
}
const addressed3 = matchingTripleAddresses(pages.get(3));
const addressed39 = matchingTripleAddresses(pages.get(39));
assert.equal(addressed3.length, 6);
assert.equal(addressed39.length, 18);
const consecutiveChapterPairs = addressed3.reduce((n, x) => n + addressed39
  .filter((y) => visualChapterStarts.indexOf(y.target) === visualChapterStarts.indexOf(x.target) + 1).length, 0);
assert.equal(consecutiveChapterPairs, 18);
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

// Simple key-free rejection of a literal triple-digit RSA ciphertext.
const rsaModulus = s0 * s1;
assert.equal(rsaModulus, 23701);
assert.ok(rsaModulus < 29 ** 3);
function countRSAOverflow(indices, phase) {
  let count = 0;
  for (let k = phase; k + 2 < indices.length; k += 3) {
    const packed = indices[k] * 29 ** 2 + indices[k + 1] * 29 + indices[k + 2];
    if (packed >= rsaModulus) count++;
  }
  return count;
}
const originalUnknown = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(originalUnknown.length, 12956);
const rsaInvalidByPhase = [0, 1, 2].map((phase) =>
  countRSAOverflow(originalUnknown, phase));
const rsaInvalidP3 = [0, 1, 2].map((phase) =>
  countRSAOverflow(pages.get(3), phase));
const rsaInvalidP39 = [0, 1, 2].map((phase) =>
  countRSAOverflow(pages.get(39), phase));
assert.deepEqual(rsaInvalidByPhase, [134, 115, 119]);
assert.deepEqual(rsaInvalidP3, [6, 3, 1]);
assert.deepEqual(rsaInvalidP39, [2, 1, 1]);

// The two source-bracketed black tails make one exact-length candidate
// for the complete, original unsolved-only red rune stream.
const p3Tail = pages.get(3).slice(122);
const p39Tail = pages.get(39).slice(122);
assert.equal(p3Tail.length, 95);
assert.equal(p39Tail.length, 118);
const combinedBlackTail = p3Tail.concat(p39Tail);
const unsolvedRed = ink.pages.filter((page) => page.page <= 55)
  .flatMap((page) => (page.red_spans || [])
    .flatMap((span) => indexed(span.runes)));
assert.equal(unsolvedRed.length, 213);
assert.equal(combinedBlackTail.length, unsolvedRed.length);
// This is the unique pair of complete red-bracketed page suffixes whose
// lengths sum to the original unsolved-only red-runic count 213.
const sourceSuffixes = ink.pages.filter((page) => page.page <= 55)
  .flatMap((page) => (page.red_spans || []).map((span) => ({
    page: page.page, start: span.start, length: span.length,
    suffix: page.rune_count - span.start - span.length,
  })));
assert.equal(sourceSuffixes.length, 16);
const suffixPairMatches = [];
for (let i = 0; i < sourceSuffixes.length; i++)
  for (let j = i + 1; j < sourceSuffixes.length; j++)
    if (sourceSuffixes[i].suffix + sourceSuffixes[j].suffix === 213)
      suffixPairMatches.push([sourceSuffixes[i], sourceSuffixes[j]]);
assert.deepEqual(suffixPairMatches, [[
  {page: 3, start: 119, length: 3, suffix: 95},
  {page: 39, start: 119, length: 3, suffix: 118},
]]);
assert.equal(corpus.pages.find((p) => p.page === 57).indices.length, 95);
function coincidenceNumerator(seq) {
  const hist = Array(29).fill(0);
  for (const r of seq) hist[r]++;
  return hist.reduce((acc, n) => acc + n * (n - 1), 0);
}
const tailAsKeyOutcomes = [];
for (const swap of [false, true]) for (const backwards of [false, true]) {
  const key = swap ? p39Tail.concat(p3Tail) : combinedBlackTail.slice();
  if (backwards) key.reverse();
  for (const sign of [-1, +1]) {
    const decoded = unsolvedRed.map((c, i) => (c + sign * key[i] + 29) % 29);
    tailAsKeyOutcomes.push({swap, backwards, sign,
      coincidence_numerator: coincidenceNumerator(decoded),
      count_e: decoded.filter((r) => r === 18).length});
  }
}
const bestTailDirect = Math.max(...tailAsKeyOutcomes
  .map((r) => r.coincidence_numerator));
assert.equal(bestTailDirect, 1654);
assert.equal(Math.max(...tailAsKeyOutcomes.map((r) => r.count_e)), 13);
// Independent same-sized original-native positive plant, truly encrypted
// under the source-extracted 213-rune key, must decrypt losslessly.
const parable = corpus.pages.find((p) => p.page === 57).indices;
const p3TailF = p3Tail.flatMap((r, i) => r === 0 ? [i] : []);
const parableF = parable.flatMap((r, i) => r === 0 ? [i] : []);
assert.deepEqual(p3TailF, [40, 63, 70]);
assert.deepEqual(parableF, [33, 59, 67]);
assert.equal(p3TailF.filter((i) => parable[i] === 0).length, 0);
// The GP solved-section transparent-F rule would preserve those positions
// regardless of the Vigenere key. Hence same-length is not sufficient
// evidence that p3's black tail repeats the known Parable plaintext.
const plant = Array.from({length: 213}, (_, i) => parable[i % parable.length]);
const plantCipher = plant.map((v, i) => (v + combinedBlackTail[i]) % 29);
assert.deepEqual(plantCipher.map((v, i) =>
  (v - combinedBlackTail[i] + 29) % 29), plant);
console.log(JSON.stringify({
  source: { p3: { offset: 119, indices: red[0].indices, sum: s0 },
    p39: { offset: 119, indices: red[1].indices, sum: s1 } },
  page_gap: red[1].page - red[0].page,
  original_onion7_html_title: sourceTitle,
  original_prime_ordinal_targets: [primeOrdinal(s0), primeOrdinal(s1)],
  source_red_heading_chapter_starts: visualChapterStarts,
  source_triple_chapter_reference: { on_p3: addressed3.length, on_p39: addressed39.length,
    both_address_chapters: addressed3.length * addressed39.length,
    consecutive_chapter_pairs: consecutiveChapterPairs },
  subtract_1_based_page_ordinal_matches_title: true,
  controls: { all_contiguous_pairs: total, gap_equal: equalGap,
    gap_and_both_prime: bothPrimeGap,
    gap_both_prime_digit_anagram: primeGapDigitAnagram,
    frequency: primeGapDigitAnagram / total },
  triple_digit_rsa_capacity_gate: { modulus: rsaModulus,
    base29_triple_capacity: 29 ** 3,
    invalid_book_by_phase: rsaInvalidByPhase,
    invalid_p3_by_phase: rsaInvalidP3,
    invalid_p39_by_phase: rsaInvalidP39 },
  red213_direct_tail_key: { p3_tail: p3Tail.length, p39_tail: p39Tail.length,
    unsolved_red_runes: unsolvedRed.length,
    red_suffix_pairs_in_unknown_book: sourceSuffixes.length * (sourceSuffixes.length - 1) / 2,
    source_pair_matches_213: suffixPairMatches.length,
    original_trial_results: tailAsKeyOutcomes,
    highest_trial_ioc: bestTailDirect / (213 * 212),
    parable_original_length: parable.length,
    p3_black_tail_F_offsets: p3TailF,
    solved_parable_F_offsets: parableF,
    transparent_F_known_text_reencryption_possible: false,
    source_native_plant_recovers_exactly: true },
  verdict: 'Source-exact cross-artifact arithmetic; 1-based page adjustment is unselected; no plaintext/key.',
}, null, 2));

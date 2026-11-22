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

/**
 * Reported historical 2013 NUMBER operation: reverse decimal digits,
 * then factor. Its exact implementation is a later reconstruction,
 * and its proposed reuse here is not authenticated.
 * @param {number} n
 * @returns {number}
 */
function reverseDigits(n) {
  return Number(String(n).split('').reverse().join(''));
}
/** @param {number} n @returns {number[]} */
function factor(n) {
  const out = [];
  for (let p = 2; p * p <= n; p++) {
    while (n % p === 0) {
      out.push(p);
      n /= p;
    }
  }
  if (n > 1) out.push(n);
  return out;
}
const reversed = [reverseDigits(s0), reverseDigits(s1)];
assert.deepEqual(reversed, [731, 371]);
const factored = reversed.map(factor);
assert.deepEqual(factored, [[17, 43], [7, 53]]);
assert.ok(factored.every((a) => a.length === 2 && a[0] + a[1] === 60));
assert.equal(factored[0][1], value(red[0].indices[0]));
assert.equal(factored[1][1], value(red[1].indices[2]));
const factorGlyphs = factored.map((a) => a.map((prime) =>
  corpus.translit[corpus.prime.indexOf(prime)]));
assert.deepEqual(factorGlyphs, [['G', 'P'], ['O', 'S']]);
const goldbach60 = [];
for (let p = 2; p < 30; p++) {
  const q = 60 - p;
  if (p < q && isPrime(p) && isPrime(q)) goldbach60.push([p, q]);
}
assert.deepEqual(goldbach60, [[7,53], [13,47], [17,43],
  [19,41], [23,37], [29,31]]);
const reachable3 = goldbach60.map(([p, q]) => reverseDigits(p * q))
  .filter((v) => v >= 6 && v <= 3 * Math.max(...corpus.prime))
  .sort((a, b) => a - b);
assert.deepEqual(reachable3, [116,137,158,173]);
const sourceThreeSums = new Map(reachable3.map((x) => [x, 0]));
let originalTripleCount = 0;
for (const page of corpus.pages.filter((p) => p.page <= 55)) {
  for (let i = 0; i + 2 < page.indices.length; i++) {
    originalTripleCount++;
    const s = sum(page.indices.slice(i, i + 3));
    if (sourceThreeSums.has(s)) sourceThreeSums.set(s,
      sourceThreeSums.get(s) + 1);
  }
}
assert.equal(originalTripleCount, 12846);
assert.deepEqual([...sourceThreeSums.entries()],
  [[116,36],[137,172],[158,25],[173,186]]);
const matching60Red = ink.pages.flatMap((p) => (p.red_spans || []).filter((s) => {
  const f = factor(reverseDigits(sum(indexed(s.runes))));
  return f.length === 2 && f[0] + f[1] === 60;
}).map((s) => [p.page, s.start, s.length]));
assert.deepEqual(matching60Red, [[3,119,3], [39,119,3]]);
const base60 = JSON.parse(fs.readFileSync(path.join(base, 'base60-grid.json'), 'utf8'));
assert.equal(base60.alphabet.length, 60);
const payload = base60.byte_rows.flat();
assert.equal(payload.length, 256);
const printCount = (values) => values.filter((x) => x >= 32 && x <= 126).length;
assert.equal(printCount(payload), 103);
assert.deepEqual([17,43,7,53].map((i) => payload[i]),
  [202,73,183,171]);
assert.deepEqual([17,43,7,53].map((i) => payload[i - 1]),
  [121,28,126,86]);

const asciiKey = factorGlyphs.flat().map((glyph) => glyph.charCodeAt(0));
const primeKey = factored.flat();
assert.equal(printCount(payload.map((x, i) => x ^ asciiKey[i % 4])), 92);
assert.equal(printCount(payload.map((x, i) => x ^ primeKey[i % 4])), 89);

assert.deepEqual([primeOrdinal(s0), primeOrdinal(s1)], [33, 40]);
assert.ok(visualChapterStarts.includes(primeOrdinal(s0)));
assert.ok(visualChapterStarts.includes(primeOrdinal(s1)));
// The original archive has all 75 physical JPGs 00..74:
// archive position is 1-based, so for LP2 page p, original file is p+17.jpg.
// A single consistent 1-based archive-ordinal reading instead sends
// triad sums to source files 32.jpg/p15 and 39.jpg/p22, which bracket
// the original p15..22 Fibonacci chapter; p33 red heading gives file74/p57.
const archiveFirstLP2 = 17;
const ordinalToLP2 = (n) => n - 1 - archiveFirstLP2;
const redHeading33 = ink.pages.find((p) => p.page === 33)
  .red_spans.find((span) => span.start === 0);
const sum33 = sum(indexed(redHeading33.runes));
assert.equal(sum33, 379);
assert.equal(primeOrdinal(sum33), 75);
assert.deepEqual([primeOrdinal(s0), primeOrdinal(s1), primeOrdinal(sum33)],
  [33, 40, 75]);
assert.deepEqual([s0, s1, sum33]
  .map((n) => ordinalToLP2(primeOrdinal(n))), [15, 22, 57]);
assert.equal(corpus.pages.find((p) => p.page === 57).indices.length, 95);
const allRedSpans = ink.pages.flatMap((page) => (page.red_spans || [])
  .map((span) => ({
    page: page.page,
    start: span.start,
    length: span.length,
    ordinal: primeOrdinal(sum(indexed(span.runes))),
  })));
assert.equal(allRedSpans.length, 18, 'all source-red spans, including solved pages');
const inArchive = allRedSpans.filter((x) => x.ordinal !== null &&
  x.ordinal >= 1 && x.ordinal <= 75);
assert.deepEqual(inArchive.map((x) => [x.page, x.start, x.length, x.ordinal]),
  [[3, 119, 3, 33], [33, 0, 10, 75], [39, 119, 3, 40]]);

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

/**
 * Fixed original red-factor 2x2 GF(29) Hill inverse, with exact
 * source-native positive. No key or phase fitted to ciphertext.
 * @param {number[]} input length-even GP29 indices
 * @param {number[][]} M full-rank 2x2 matrix
 * @returns {number[]}
 */
function transformHill2(input, M) {
  assert.equal(input.length % 2, 0);
  const out = [];
  for (let i = 0; i < input.length; i += 2) {
    const x = input[i], y = input[i + 1];
    out.push((M[0][0] * x + M[0][1] * y) % 29);
    out.push((M[1][0] * x + M[1][1] * y) % 29);
  }
  return out;
}
/** @param {number[]} input */
function gpIoc(input) {
  const counts = Array(29).fill(0);
  for (const x of input) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}
const hillFactorKey = factored.map((row) => row.slice());
assert.deepEqual(hillFactorKey, [[17, 43], [7, 53]]);
assert.equal((17 * 53 - 43 * 7) % 29, 20);
const hillFactorInverse = [[7, 8], [4, 11]];
assert.deepEqual(transformHill2(originalUnknown, hillFactorInverse).length,
  originalUnknown.length);
assert.deepEqual(transformHill2(
  transformHill2(originalUnknown, hillFactorInverse), hillFactorKey),
originalUnknown);
const hillOriginalIoC = gpIoc(originalUnknown);
const hillInverseIoC = gpIoc(transformHill2(originalUnknown,
  hillFactorInverse));
assert.ok(Math.abs(hillOriginalIoC - 0.03447839786450569) < 1e-15);
assert.ok(Math.abs(hillInverseIoC - 0.034476789237306946) < 1e-15);
const solvedP57First94 = pages.get(57).slice(0, 94);
assert.equal(solvedP57First94.length, 94);
assert.deepEqual(transformHill2(
  transformHill2(solvedP57First94, hillFactorKey), hillFactorInverse),
solvedP57First94);
assert.ok(Math.abs(gpIoc(solvedP57First94) -
  0.060855639441775335) < 1e-15);

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

/**
 * Extract full original printed words from the rune transcription.
 * Printed / and newline only wrap lines; punctuation ends a word.
 * @param {number} pageNumber physical LP2 page index
 * @returns {string[]}
 */
function originalPrintedWords(pageNumber) {
  const nonempty = corpus.pages.filter((p) => p.indices.length > 0);
  const chunks = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8')
    .trim().split(/\n%\n/);
  assert.equal(chunks.length, nonempty.length);
  const p = nonempty.findIndex((item) => item.page === pageNumber);
  assert.ok(p >= 0);
  const allowed = new Set(corpus.runes);
  const words = [];
  let word = '';
  for (const character of chunks[p]) {
    if (allowed.has(character)) word += character;
    else if ('-.assert.equal(p39Tail.length, 118);'.includes(character) && word.length) {
      words.push(word);
      word = '';
    }
  }
  if (word.length) words.push(word);
  assert.deepEqual(Array.from(words.join(''), (c) => corpus.runes.indexOf(c)),
    pages.get(pageNumber));
  return words;
}
const allP3Words = originalPrintedWords(3);
const allP57Words = originalPrintedWords(57);
const p3PrefixLengths = allP3Words.map((word) => word.length);
let p3TailStart = 0;
for (const length of p3PrefixLengths) {
  if (p3TailStart >= 122) break;
  p3TailStart += length;
}
assert.equal(p3TailStart, 122, 'red 13-dot closes at a printed word break');
let cumulative = 0;
const p3WordTailLengths = allP3Words.flatMap((word) => {
  const start = cumulative;
  cumulative += word.length;
  return start >= 122 ? [word.length] : [];
});
const p57WordLengths = allP57Words.map((word) => word.length);
assert.equal(p3WordTailLengths.reduce((n, len) => n + len, 0), 95);
assert.equal(p57WordLengths.reduce((n, len) => n + len, 0), 95);
assert.equal(p3WordTailLengths.length, 21);
assert.equal(p57WordLengths.length, 20);
assert.deepEqual(p3WordTailLengths.slice(0, 6), [3, 3, 2, 2, 5, 6]);
assert.deepEqual(p57WordLengths.slice(0, 6), [7, 4, 2, 6, 7, 2]);

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
// Exhaust the entire hidden-slope GF29 linear mixer family with one global
// secret output alphabet. If P = sigma(a*C+b*K+d), a != 0, then unknown
// a, d and arbitrary 29! sigma preserve the IoC of C+(b/a)*K.
// Thus only the 29 ratios times four source-direction pairs are needed.
const allSecretLinear = [];
for (const swap of [false, true]) for (const backwards of [false, true]) {
  const key = swap ? p39Tail.concat(p3Tail) : combinedBlackTail.slice();
  if (backwards) key.reverse();
  for (let ratio = 0; ratio < 29; ratio++) {
    const decoded = unsolvedRed.map((c, i) => (c + ratio * key[i]) % 29);
    allSecretLinear.push({
      swap, backwards, ratio,
      coincidence_numerator: coincidenceNumerator(decoded)
    });
  }
}
assert.equal(allSecretLinear.length, 116);
const allSecretMax = allSecretLinear.reduce((a, b) =>
  a.coincidence_numerator > b.coincidence_numerator ? a : b);
assert.deepEqual(allSecretMax, {
  swap: false, backwards: false, ratio: 17,
  coincidence_numerator: 1692
});
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
const slopePlantCipher = plant.map((v, i) =>
  (v - 17 * combinedBlackTail[i] + 29 * 17) % 29);
assert.deepEqual(slopePlantCipher.map((v, i) =>
  (v + 17 * combinedBlackTail[i]) % 29), plant);
assert.ok(coincidenceNumerator(plant) / (213 * 212) >
  allSecretMax.coincidence_numerator / (213 * 212));
console.log(JSON.stringify({
  source: { p3: { offset: 119, indices: red[0].indices, sum: s0 },
    p39: { offset: 119, indices: red[1].indices, sum: s1 } },
  page_gap: red[1].page - red[0].page,
  original_onion7_html_title: sourceTitle,
  original_prime_ordinal_targets: [primeOrdinal(s0), primeOrdinal(s1)],
  complete_archive_one_based_prime_ordinal_crosswalk: {
    source_red_p3_p39_p33_sums: [s0, s1, sum33],
    prime_ordinals: [primeOrdinal(s0), primeOrdinal(s1), primeOrdinal(sum33)],
    archive_source_jpeg_files: [32, 39, 74],
    lp2_pages: [15, 22, 57],
    interpretations: 'p15-p22 native visual chapter endpoints, solved p57 PARABLE'
  },
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
    all_secret_affine_mixer: { source_orientations: 4, coefficients: 29,
      models: allSecretLinear.length,
      arbitrary_output_substitution_also_covered: true,
      maximal_original_coincidence_numerator: allSecretMax.coincidence_numerator,
      maximal_original_ioc: allSecretMax.coincidence_numerator / (213 * 212),
      maximizing_parameters: {swap: allSecretMax.swap,
        backwards: allSecretMax.backwards, ratio: allSecretMax.ratio},
      native_solved_parable_plant_ioc: coincidenceNumerator(plant) / (213 * 212) },
    parable_original_length: parable.length,
    p3_black_tail_F_offsets: p3TailF,
    solved_parable_F_offsets: parableF,
    transparent_F_known_text_reencryption_possible: false,
    source_native_plant_recovers_exactly: true },
  verdict: 'Source-exact cross-artifact arithmetic; 1-based page adjustment is unselected; no plaintext/key.',
}, null, 2));

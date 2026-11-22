'use strict';

/**
 * Original LP1 warning nine-prime-sums -> nine LP2 visual chapter starts.
 * Frozen source-proposed transfer of the authentic p56 prime-totient subtractor.
 * Run from repository root: node sims/lp1_warning_nine_chapter_prime_totient_sft.cjs
 * This is a negative original-input test, NOT a recovered key or cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const PAGE_RANGES = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const CHAPTER_RUNE_LENGTHS = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const LP1_WARNING_LINE_PRIMES = [757, 1009, 691, 353, 769, 911, 1051, 859, 677];

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

/** @param {number[]} values */
function coincidence(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * @param {number[]} stream
 * @param {number} startIndex
 * @param {number[]} primes
 * @param {-1|1} sign
 */
function applyPrimeTotient(stream, startIndex, primes, sign) {
  return stream.map((value, position) =>
    ((value + sign * ((primes[startIndex + position] - 1) % 29)) % 29 + 29) % 29
  );
}

const pages = new Map(source.pages.map((page) => [page.page, page.indices]));
const chapters = PAGE_RANGES.map(([first, last], i) => {
  /** @type {number[]} */
  const indices = [];
  for (let page = first; page <= last; page++) indices.push(...pages.get(page));
  assert.equal(indices.length, CHAPTER_RUNE_LENGTHS[i], 'Source physical chapter mismatch');
  return indices;
});
const original = chapters.flat();
assert.equal(original.length, 12956);

const primes = firstPrimes(3300);
const decoded = [];
const wrongOrder = [];
let startPosition = 0;
console.log('LP1 warning primes as nine source-visible LP2 chapter totient start primes');
console.log('chapter\tpages\tlength\tstart-prime\tprime-ordinal\toriginal-IoC\tdecoded-IoC');
for (let i = 0; i < chapters.length; i++) {
  const sum = LP1_WARNING_LINE_PRIMES[i];
  const start = primes.indexOf(sum);
  const wrongStart = primes.indexOf(LP1_WARNING_LINE_PRIMES[8 - i]);
  assert.ok(start >= 0 && wrongStart >= 0, 'Published warning sums must be prime');
  assert.ok(start + chapters[i].length < primes.length);
  const result = applyPrimeTotient(chapters[i], start, primes, -1);
  const wrong = applyPrimeTotient(chapters[i], wrongStart, primes, -1);
  const replay = applyPrimeTotient(result, start, primes, 1);
  assert.deepEqual(replay, chapters[i], 'Implementation round-trip failed');
  decoded.push(...result);
  wrongOrder.push(...wrong);
  const testPlain = Array.from({ length: chapters[i].length },
    (_, j) => pages.get(57)[j % pages.get(57).length]);
  assert.deepEqual(
    applyPrimeTotient(applyPrimeTotient(testPlain, start, primes, 1), start, primes, -1),
    testPlain,
    'Source-native solved-p57 planted-control recovery failed'
  );
  console.log([i + 1, PAGE_RANGES[i].join('-'), chapters[i].length, sum,
    start + 1, coincidence(chapters[i]).toFixed(9), coincidence(result).toFixed(9)].join('\t'));
  startPosition += chapters[i].length;
}
assert.equal(startPosition, 12956);
assert.equal(decoded.length, original.length);
assert.ok(Math.abs(coincidence(original) - 0.03447839786450569) < 1e-12);
assert.ok(Math.abs(coincidence(decoded) - 0.03449932193384634) < 1e-12);
assert.ok(Math.abs(coincidence(wrongOrder) - 0.034505065328733694) < 1e-12);
const solvedControlIoC = coincidence(pages.get(57));
assert.ok(Math.abs(solvedControlIoC - 0.06270996640537514) < 1e-12);
console.log('global original IoC:', coincidence(original).toFixed(12));
console.log('global decoded  IoC:', coincidence(decoded).toFixed(12));
console.log('reversed-order   IoC:', coincidence(wrongOrder).toFixed(12));
console.log('solved p57       IoC:', solvedControlIoC.toFixed(12));
console.log('PASS: source matched, all rune inverses and plants recovered; no original plaintext.');

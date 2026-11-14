/**
 * Original LP2 p28–p31 prime-length and fixed-clock shared-key gate.
 * SFT: node sims/lp2_p28_p31_prime_length_sft.cjs
 * Requires only the checked-in source corpus and native LP1 transcription.
 *
 * Scope: structural prime-length observation and ONE source-fixed key-reuse
 * discriminator. This does not decipher or identify the historical key.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const paragraphs = read('resources/liber-primus/lp2-transcription.txt').split(/\r?\n%\r?\n/);
const originals = read('resources/transcriptions/lp1_wulfic_canonical.txt').split(/\r?\n%\r?\n/);
const pages = corpus.pages.slice(0, 56);

assert.equal(corpus.runes.length, 29);
assert.equal(pages.length, 56);
assert.equal(paragraphs.length, 57); // Text transcription omits the runeless physical p50.

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

function physicalLines(p) {
  if (p === 50) return 0;
  const textIndex = p > 50 ? p - 1 : p;
  return paragraphs[textIndex].split(/\r?\n/).filter((s) => s.endsWith('/')).length;
}

const data = pages.map((p, i) => ({
  p: i,
  n: p.indices.length,
  prime: isPrime(p.indices.length),
  lines: physicalLines(i),
}));

assert.deepEqual(data.slice(28, 32).map((x) => x.n), [269, 277, 263, 269]);
assert.deepEqual(data.slice(28, 32).map((x) => x.lines), [12, 12, 12, 12]);
const primeFour = data.filter((x, i) => i <= 52 && data.slice(i, i + 4).every((y) => y.prime)).map((x) => x.p);
assert.deepEqual(primeFour, [28]);

const eligible = data.filter((x) => x.lines === 12);
const N = eligible.length;
const K = eligible.filter((x) => x.prime).length;
assert.equal(N, 35);
assert.equal(K, 11);
const eligiblePages = new Set(eligible.map((x) => x.p));

/**
 * Exact combinatorial count of 11 prime-count labels placed among 35
 * eligible twelve-line pages, with no all-prime run of four consecutive
 * *physical* pages. This null preserves the 12-line page locations.
 */
const memo = new Map();
function withoutFour(p, used, streak) {
  if (p === 56) return Number(used === K);
  const state = [p, used, streak].join(':');
  if (memo.has(state)) return memo.get(state);
  let result;
  if (!eligiblePages.has(p)) {
    result = withoutFour(p + 1, used, 0);
  } else {
    result = withoutFour(p + 1, used, 0);
    if (used < K && streak < 3) result += withoutFour(p + 1, used + 1, streak + 1);
  }
  memo.set(state, result);
  return result;
}
function choose(n, k) {
  let value = 1;
  for (let i = 1; i <= k; i++) value = value * (n - k + i) / i;
  return Math.round(value);
}
const total = choose(N, K);
const pAny = (total - withoutFour(0, 0, 0)) / total;
const pFixed = K * (K - 1) * (K - 2) * (K - 3) / (N * (N - 1) * (N - 2) * (N - 3));
assert.ok(Math.abs(pAny - 0.06394317802418306) < 1e-12);
assert.ok(Math.abs(pFixed - 0.0063025210084033615) < 1e-12);

const a = pages[28].indices;
const b = pages[31].indices;
assert.equal(a.length, b.length);
const same = a.flatMap((v, i) => v === b[i] ? [i] : []);
assert.deepEqual(same, [1, 7, 44, 96, 248, 253]);

// Direct cancellation under the frozen hypothesis C_i = (P_i + K_i) mod 29
// on BOTH full pages using the SAME per-rune K_i and no skipped symbols.
const delta = a.map((v, i) => (v - b[i] + 29) % 29);
const histogram = Array.from({ length: 29 }, (_, v) => delta.filter((d) => d === v).length);
assert.deepEqual(histogram, [6,10,6,5,8,11,13,6,10,14,7,8,9,12,12,10,10,8,10,9,6,9,8,16,3,9,11,11,12]);
const exp = a.length / 29;
const chi2 = histogram.reduce((s, o) => s + ((o - exp) ** 2) / exp, 0);
assert.ok(Math.abs(chi2 - 24.557620817843866) < 1e-10);

// First-party GP-native clear prose, with source-preserved ING/IO runes.
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const clear = [3, 8, 9, 10, 11, 14].flatMap(
  (section) => Array.from(originals[section]).flatMap((glyph) =>
    runeIndex.has(glyph) ? [runeIndex.get(glyph)] : [])
);
assert.equal(clear.length, 1001);
const f = Array.from({ length: 29 }, (_, v) => clear.filter((x) => x === v).length);
const pMatch = f.reduce((s, v) => s + v * v, 0) / (clear.length ** 2);
assert.ok(Math.abs(pMatch - 0.06023447082388143) < 1e-12);

function binomialLeftTail(n, observed, p) {
  let term = (1 - p) ** n;
  let cumulative = term;
  for (let k = 1; k <= observed; k++) {
    term *= (n - k + 1) / k * p / (1 - p);
    cumulative += term;
  }
  return cumulative;
}
const pLow = binomialLeftTail(a.length, same.length, pMatch);
assert.ok(Math.abs(pLow - 0.0028358499017279715) < 1e-10);

// Native-prose planted control: identical key cancels *exactly* and its
// two independent clear windows have 21 matched positions.
const pa = clear.slice(0, 269);
const pb = clear.slice(269, 538);
const key = Array.from({ length: 269 }, (_, i) => (17 * i + 3) % 29);
const ca = pa.map((v, i) => (v + key[i]) % 29);
const cb = pb.map((v, i) => (v + key[i]) % 29);
assert.deepEqual(ca.map((v, i) => (v - cb[i] + 29) % 29),
  pa.map((v, i) => (v - pb[i] + 29) % 29));
assert.equal(pa.filter((v, i) => v === pb[i]).length, 21);

console.log('Original LP2 p28–p31 runes:', data.slice(28, 32).map((x) => x.n));
console.log('Unique original four-page prime-length run:', primeFour);
console.log('Twelve-line permutation null N/K:', N, K);
console.log('Preselected run p:', pFixed.toFixed(9), '; any-run p:', pAny.toFixed(9));
console.log('Original p28/p31 equal clock positions:', same);
console.log('Original p28−p31 delta χ² (28 df):', chi2.toFixed(9));
console.log('Source-native clear GP collision:', pMatch.toFixed(9));
console.log('Frozen identical-key lower-tail (i.i.d. frequency benchmark):', pLow.toFixed(9));
console.log('Planted common-key native prose control equalities:', 21);
console.log('PASS: conditional structural observation; exact common-clock additive-key model disfavored.');
console.log('LIMIT: no plaintext, historical key, cipher selector, or destination was recovered.');

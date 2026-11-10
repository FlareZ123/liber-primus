#!/usr/bin/env node
'use strict';

/**
 * LP1 MOBIUS + LP2 page-40 red-heading source bridge to the six-back affine echo.
 * Source-first mathematical identity and exhaustive 812-map original-cipher ranking.
 * The association was discovered retrospectively; it is NOT a plaintext solution.
 * Run from any working directory: node sims/lp1_p40_cayley_t6_bridge_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus, physicalLP2Page} = require('./lp2_word_pages.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const byRune = new Map(corpus.runes.map((r, i) => [r, i]));
const p = 29;
const mod = x => ((x % p) + p) % p;

/** Modular exponentiation with integer exponents. */
function pow(a, n) {
  let v = 1;
  while (n) {
    if (n % 2) v = mod(v * a);
    a = mod(a * a);
    n = Math.floor(n / 2);
  }
  return v;
}
/** Inverse in the prime field F29, for nonzero elements only. */
function inv(a) {
  assert.notEqual(mod(a), 0);
  return pow(mod(a), 27);
}
/** Matrix multiplication in M2(F29). */
function multiply(A, B) {
  return [
    [mod(A[0][0] * B[0][0] + A[0][1] * B[1][0]),
      mod(A[0][0] * B[0][1] + A[0][1] * B[1][1])],
    [mod(A[1][0] * B[0][0] + A[1][1] * B[1][0]),
      mod(A[1][0] * B[0][1] + A[1][1] * B[1][1])]
  ];
}
/** Binary power of a 2-by-2 matrix over F29. */
function matrixPower(A, n) {
  let B = [[1, 0], [0, 1]];
  while (n) {
    if (n % 2) B = multiply(B, A);
    A = multiply(A, A);
    n = Math.floor(n / 2);
  }
  return B;
}
/** Matrix inverse for nonsingular 2-by-2 matrices. */
function matrixInverse(A) {
  const d = inv(mod(A[0][0] * A[1][1] - A[0][1] * A[1][0]));
  return [
    [mod(d * A[1][1]), mod(-d * A[0][1])],
    [mod(-d * A[1][0]), mod(d * A[0][0])]
  ];
}
/** PGL2 action; null represents projective infinity. */
function apply(A, x) {
  if (x === null) return A[1][0] === 0 ? null : mod(A[0][0] * inv(A[1][0]));
  const d = mod(A[1][0] * x + A[1][1]);
  return d === 0 ? null : mod((A[0][0] * x + A[0][1]) * inv(d));
}

/* Read the actual red annotation and GP prime table. */
const spans = ink.pages.flatMap(page => (page.red_spans || []).map(span => {
  const indices = [...span.runes].map(r => {
    assert.ok(byRune.has(r));
    return byRune.get(r);
  });
  const sum = indices.reduce((v, i) => v + corpus.prime[i], 0);
  const indexSum = indices.reduce((v, i) => v + i, 0);
  return {page: page.page, start: span.start, sum, indexSum,
    exponent: Math.floor(sum / p), remainder: sum % p,
    last: indices[indices.length - 1]};
}));
const selected = spans.filter(s => s.page === 40 && s.start === 0);
assert.equal(selected.length, 1);
const title = selected[0];
assert.equal(title.sum, 435);
assert.equal(title.indexSum, 116);
assert.equal(title.indexSum % p, 0);
assert.equal(title.remainder, 0);
assert.equal(title.exponent, 15);
assert.equal(title.last, 8);

/*
 * Original LP1 p05 square corners:
 *   [272,151]     modulo 29     [11,6]
 *   [151,272]                   [6,11]
 * The p05 central word is MOBIUS; hence diagonalize via the canonical
 * Cayley coordinate (x-1)/(x+1). Add the p40 red final H index as its center.
 */
const A = [[272, 151], [151, 272]].map(row => row.map(mod));
const A6 = matrixPower(A, 6);
const M16 = [[434, 966], [966, 434]].map(row => row.map(mod));
const scale = mod(M16[0][0] * inv(A6[0][0]));
assert.deepEqual(M16, A6.map(row => row.map(v => mod(v * scale))));
assert.equal(scale, 21);

const fixed = title.last;
const H = [[fixed + 1, fixed - 1], [1, 1]].map(row => row.map(mod));
const A15 = matrixPower(A, title.exponent);
assert.deepEqual(A15, [[23, 18], [18, 23]]);
const raw = multiply(multiply(H, A15), matrixInverse(H));
assert.deepEqual(raw, [[5, 27], [0, 12]]);
const unit = inv(raw[1][1]);
const normalized = raw.map(row => row.map(x => mod(x * unit)));
assert.deepEqual(normalized, [[27, 24], [0, 1]]);
assert.equal(pow(2, title.exponent), 27);
assert.equal(mod((1 - normalized[0][0]) * fixed), normalized[0][1]);

for (const x of [...Array(29).keys(), null]) {
  assert.equal(apply(H, apply(A15, x)),
    apply(normalized, apply(H, x)));
}
assert.equal(apply(normalized, fixed), fixed);

/* The original MOBIUS cell 226 gives a source-fixed 28-cycle seed. */
const seed = apply(H, mod(226));
assert.equal(seed, 21);
const orbit = [];
let point = seed;
for (let i = 0; i < 28; i++) {
  orbit.push(point);
  point = apply(normalized, point);
}
assert.equal(point, seed);
assert.deepEqual(orbit.slice().sort((x, y) => x - y),
  [...Array(29).keys()].filter(x => x !== fixed));

/* Original whole words, preserving source line/page word continuations. */
const parsed = parseSharedCorpus();
const words = parsed.words.map(word => [...word.runes].map(r => {
  assert.ok(byRune.has(r));
  return byRune.get(r);
}));
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
const hSingletons = parsed.words
  .map((word, ordinal) => ({
    ordinal, page: physicalLP2Page(word.startPage), runes: word.runes
  }))
  .filter(word => word.runes === corpus.runes[fixed]);
assert.deepEqual(hSingletons.map(w => [w.ordinal, w.page]),
  [[205, 4], [398, 7], [1688, 30], [2140, 39]]);

// Any product of the source-derived T powers fixes rune H exactly.
// It cannot turn English GP singleton A (24) or I (10) into H (8),
// no matter which secret exponent/clock is used on each plaintext symbol.
for (let exponent = 0; exponent < 28; exponent++) {
  const slope = pow(normalized[0][0], exponent);
  const intercept = mod((1 - slope) * fixed);
  for (let sourceSymbol = 0; sourceSymbol < 29; sourceSymbol++) {
    const encrypted = mod(slope * sourceSymbol + intercept);
    assert.equal(encrypted === fixed, sourceSymbol === fixed);
  }
  assert.notEqual(mod(slope * 24 + intercept), fixed);
  assert.notEqual(mod(slope * 10 + intercept), fixed);
}
const pairs = Array.from({length: 29}, () => new Uint16Array(29));
let eligible = 0;
for (const word of words) {
  for (let j = 6; j < word.length; j++) {
    pairs[word[j - 6]][word[j]]++;
    eligible++;
  }
}
assert.equal(eligible, 1290);
/** Exact original cipher coincidences for the affine map y=ax+b mod29. */
function score(a, b) {
  let n = 0;
  for (let x = 0; x < 29; x++) n += pairs[x][mod(a * x + b)];
  return n;
}
const candidates = [];
for (let a = 1; a < 29; a++) for (let b = 0; b < 29; b++) {
  candidates.push({a, b, hits: score(a, b)});
}
candidates.sort((a, b) => b.hits - a.hits || a.a - b.a || a.b - b.b);
assert.equal(candidates.length, 812);
assert.deepEqual(candidates[0], {a: 27, b: 24, hits: 80});
assert.equal(candidates[1].hits, 65);

const divisible = spans.filter(s => s.remainder === 0).map(s => {
  const a = pow(2, s.exponent);
  const b = mod((1 - a) * s.last);
  return {page: s.page, sum: s.sum, exponent: s.exponent,
    fixed: s.last, a, b, hits: score(a, b)};
});
assert.deepEqual(divisible.map(x => [x.page, x.hits]),
  [[15, 58], [40, 80], [53, 64]]);
const dualDivisible = spans.filter(s =>
  s.remainder === 0 && s.indexSum % p === 0);
assert.deepEqual(dualDivisible.map(s => s.page), [40]);
const result = {
  classification: 'exact cross-artifact algebra and retrospective ciphertext link; no plaintext/key',
  source: 'LP1 p05/p16 squares, LP2 page-40 red heading, GP primes',
  page40: {indexSum: title.indexSum, indexQuotient: title.indexSum / p,
    primeSum: title.sum, primeQuotient: title.exponent, lastRuneIndex: fixed},
  matrices: {A, A6, A15, H, rawConjugate: raw, normalizedConjugate: normalized},
  identity: 'h(A^15 x) = (24-2*h(x)) mod29, all 30 projective states',
  mobiusSeedCycle: orbit,
  fixedPointSingletonGate: {fixedRune: 'H', observedOriginalSingletons: hSingletons,
    sourceHypothesis: 'T-power-per-symbol GP-English A/I singletons',
    compatibleObservedSingletons: 0,
    eligibleOriginalSingletons: parsed.words.filter(w => w.length === 1).length,
    result: 'four forbidden fixed-H singleton outputs under every T exponent'},
  allOriginalLag6: {eligible, best: candidates[0], second: candidates[1],
    affineCandidates: candidates.length},
  allDivisibleRedSpans: divisible,
  uniqueDouble29RedSpanPage: dualDivisible[0].page,
  qualification: 'Operators and clues were associated after T6 was known; ranking is descriptive, not an independent significance level.'
};
console.log(JSON.stringify(result, null, 2));

module.exports = {matrixPower, apply, result};

"use strict";

/**
 * Source-only arithmetic link between the LP2 256-byte grid and p53 red ink.
 *
 * The 32x8 printed table is read in row-major base60; the 51 red GP runes
 * on physical p53 are read as a zero-based base29 integer. This script
 * checks exact shared factors, the alternative base59 / five-cell readings,
 * every other marked red span, and a source-multiset-preserving null.
 * No unknown plaintext or cipher key is inferred from divisibility.
 *
 * Runs with Node.js 22 built-in modules only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const table = load("resources/liber-primus/base60-grid.json");
const p53 = corpus.pages.find(p => p.page === 53);
const colored = ink.pages.find(p => p.page === 53);
assert.equal(p53.runic_count, 179);
assert.equal(colored.red_spans.length, 1);
assert.equal(colored.red_spans[0].start, 128);
assert.equal(colored.red_spans[0].length, 51);

const digits = Array.from(colored.red_spans[0].runes, rune => {
  const index = corpus.runes.indexOf(rune);
  assert.ok(index >= 0);
  return index;
});
assert.deepEqual(digits, p53.indices.slice(128));
const asInteger = (values, base) => values.reduce(
  (value, digit) => value * BigInt(base) + BigInt(digit), 0n);
const gcd = (a, b) => {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
};
const original = table.byte_rows.flat();
assert.equal(original.length, 256);
const standardAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const alternateAlphabet = standardAlphabet.replace("f", "");
const tokens = table.rows.flat();
assert.equal(tokens.length, 256);
assert.deepEqual(tokens.map(token =>
  standardAlphabet.indexOf(token[0]) * 60 + standardAlphabet.indexOf(token[1])), original);
const alt59 = tokens.map(token =>
  alternateAlphabet.indexOf(token[0]) * 59 + alternateAlphabet.indexOf(token[1]));
assert.ok(alt59.every(value => value >= 0 && value <= 255));
const corrected = original.slice();
for (const [index, value] of [[45, 81], [50, 21], [165, 47],
  [172, 174], [246, 224]]) corrected[index] = value;

const rowMajor = values => asInteger(values, 256);
const N = rowMajor(original);
const R = asInteger(digits, 29);
const p = 179n;
assert.equal(N % (p * p), 0n);
assert.notEqual(N % (p * p * p), 0n);
assert.equal(R % p, 0n);
assert.notEqual(R % (p * p), 0n);
assert.equal(gcd(N, R), 358n);
assert.notEqual(rowMajor(alt59) % p, 0n);
assert.notEqual(rowMajor(corrected) % p, 0n);

const allSpans = [];
for (const annotatedPage of ink.pages) {
  for (const span of annotatedPage.red_spans || []) {
    const page = corpus.pages.find(x => x.page === annotatedPage.page);
    const indices = Array.from(span.runes, rune => corpus.runes.indexOf(rune));
    assert.ok(indices.every(x => x >= 0));
    const value = asInteger(indices, 29);
    allSpans.push({
      page: page.page,
      length: indices.length,
      gcdWithGrid: gcd(N, value).toString(),
      divisibleByOwnPageLength: value % BigInt(page.runic_count) === 0n
    });
  }
}
assert.equal(allSpans.length, 18);
assert.deepEqual(allSpans.filter(x => x.divisibleByOwnPageLength)
  .map(x => [x.page, x.length]), [[53, 51]]);
assert.equal(Math.max(...allSpans.map(x => Number(x.gcdWithGrid))), 358);

const exactRotations = [];
for (let shift = 0; shift < digits.length; shift++) {
  const rotated = digits.slice(shift).concat(digits.slice(0, shift));
  let residue = 0;
  for (const value of rotated) residue = (residue * 29 + value) % 179;
  if (residue === 0) exactRotations.push(shift);
}
assert.deepEqual(exactRotations, [0]);

let randomState = 0x53179;
const nextUint32 = () => {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
};
const uniform = limit => {
  const cutoff = Math.floor(4294967296 / limit) * limit;
  let draw;
  do { draw = nextUint32(); } while (draw >= cutoff);
  return draw % limit;
};
let shuffledHits = 0;
const draws = 200000;
for (let t = 0; t < draws; t++) {
  const shuffled = digits.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = uniform(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let residue = 0;
  for (const value of shuffled) residue = (residue * 29 + value) % 179;
  if (residue === 0) shuffledHits++;
}
assert.equal(shuffledHits, 1110);
assert.equal(digits.reduce((a, b) => a + b, 0) % 2, 0);

// Trial division records source factorization up to 10^6. No assertion is
// made that the remaining 168-bit cofactor is proven prime.
const isPrime = new Uint8Array(1000001).fill(1);
isPrime[0] = isPrime[1] = 0;
for (let i = 2; i * i < isPrime.length; i++) {
  if (!isPrime[i]) continue;
  for (let j = i * i; j < isPrime.length; j += i) isPrime[j] = 0;
}
let residual = R;
const factors = [];
for (let i = 2; i < isPrime.length; i++) {
  if (!isPrime[i]) continue;
  let exponent = 0;
  while (residual % BigInt(i) === 0n) {
    residual /= BigInt(i);
    exponent++;
  }
  if (exponent) factors.push({prime: i, exponent});
}
assert.deepEqual(factors.map(x => x.prime),
  [2, 113, 179, 27241, 39901, 68909, 265541]);
assert.equal(factors.reduce((v, x) =>
  v * BigInt(x.prime) ** BigInt(x.exponent), 1n) * residual, R);


// The observed 51-rune integer has an unusually large smooth component.
// Keep the bound fixed at 300,000 and compare against permutations of the
// original digits. Of 18 red spans, only the 19- and 51-rune spans are long
// enough to reach the observed 79.4126 smooth bits at this cutoff.
const smallPrimes = [];
for (let i = 2; i <= 300000; i++) {
  if (isPrime[i]) smallPrimes.push([BigInt(i), Math.log2(i)]);
}
function smoothBits(sequence) {
  let remainder = asInteger(sequence, 29);
  let bits = 0;
  let primesAtLeast10000 = 0;
  for (const [prime, contribution] of smallPrimes) {
    if (remainder % prime !== 0n) continue;
    if (prime >= 10000n) primesAtLeast10000++;
    do {
      remainder /= prime;
      bits += contribution;
    } while (remainder % prime === 0n);
  }
  return {bits, primesAtLeast10000};
}
const p27Colored = ink.pages.find(page => page.page === 27);
assert.equal(p27Colored.red_spans.length, 1);
const p27Digits = Array.from(p27Colored.red_spans[0].runes,
  rune => corpus.runes.indexOf(rune));
assert.equal(p27Digits.length, 19);
const originalSmooth = smoothBits(digits);
assert.ok(Math.abs(originalSmooth.bits - 79.41260397552774) < 1e-10);
assert.equal(originalSmooth.primesAtLeast10000, 4);
for (const span of allSpans) {
  if (span.page !== 27 && span.page !== 53) {
    assert.ok(span.length <= 16);
  }
}
randomState = 0x53179;
const smoothDraws = 10000;
let p53SmoothHits = 0, p27SmoothHits = 0, familySmoothHits = 0;
let fourMediumPrimeHits = 0;
const shuffle = sequence => {
  const out = sequence.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = uniform(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
for (let t = 0; t < smoothDraws; t++) {
  const red53 = smoothBits(shuffle(digits));
  const red27 = smoothBits(shuffle(p27Digits));
  const hit53 = red53.bits >= originalSmooth.bits - 1e-9;
  const hit27 = red27.bits >= originalSmooth.bits - 1e-9;
  if (hit53) p53SmoothHits++;
  if (hit27) p27SmoothHits++;
  if (hit53 || hit27) familySmoothHits++;
  if (red53.primesAtLeast10000 >= 4) fourMediumPrimeHits++;
}
assert.deepEqual([p53SmoothHits, p27SmoothHits,
  familySmoothHits, fourMediumPrimeHits], [2, 3, 5, 6]);

console.log(JSON.stringify({
  originalGridBits: N.toString(2).length,
  page53RuneCount: p53.runic_count,
  page53RedRunes: digits.length,
  sharedFactor: gcd(N, R).toString(),
  grid179Valuation: 2,
  red179Valuation: 1,
  alternateBase59Shares179: rowMajor(alt59) % p === 0n,
  fiveCellAlternativeShares179: rowMajor(corrected) % p === 0n,
  redSpanCount: allSpans.length,
  redSpansDivisibleByOwnPageLength: allSpans.filter(x =>
    x.divisibleByOwnPageLength).map(x => ({page: x.page, length: x.length})),
  redSmallPrimeFactors: factors,
  observedSmallPrimeLog2Bits: originalSmooth.bits,
  observedMediumPrimeCount: originalSmooth.primesAtLeast10000,
  smoothnessNull: {cutoff: 300000, seed: "0x53179", samples: smoothDraws,
    p53Hits: p53SmoothHits, otherEligibleP27Hits: p27SmoothHits,
    selectionAwareFamilyHits: familySmoothHits,
    familyAddOneRate: (familySmoothHits + 1) / (smoothDraws + 1),
    fourMediumPrimeHits},
  redRemainingCofactor: residual.toString(),
  preservingRotationsDivisible179: exactRotations,
  sourceMultisetShuffle: {
    seed: "0x53179", samples: draws, divisible179: shuffledHits,
    addOneRate: (shuffledHits + 1) / (draws + 1)
  },
  interpretation: "Arithmetic candidate only; no plaintext/key recovered"
}, null, 2));

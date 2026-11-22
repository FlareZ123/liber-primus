'use strict';

/**
 * Exact original-source p48/base-60 grid common-factor test.
 * Run: node sims/page48_grid_common_factor_sft.cjs
 *
 * No dependencies beyond Node.js built-ins. Original data is read-only.
 * Nulls fix physical page 48's first/last GP glyphs and its entire
 * internal rune multiset; no ciphertext is fitted to the null.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const table = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'
));

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcdBig(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {number} a @param {number} b @returns {number} */
function gcdSmall(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {number[]} digits @param {number} radix @returns {bigint} */
function numeral(digits, radix) {
  return digits.reduce((a, digit) => a * BigInt(radix) + BigInt(digit), 0n);
}

/** @param {bigint} value @param {number} radix @returns {number[]} */
function digitsOf(value, radix) {
  /** @type {number[]} */
  const digits = [];
  const b = BigInt(radix);
  for (let n = value; n; n /= b) digits.push(Number(n % b));
  return digits.reverse();
}

/** @param {number[]} digits @param {number} symbolCount @returns {number} */
function indexOfCoincidence(digits, symbolCount) {
  const counts = Array(symbolCount).fill(0);
  for (const x of digits) counts[x]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (digits.length * (digits.length - 1));
}

const grid = table.bytes;
assert.equal(grid.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const N = numeral(grid, 256);
assert.equal(N.toString(2).length, 2048);
const smooth = 36528277968;
const factor = 81432;
assert.equal(N % BigInt(smooth), 0n);
assert.deepEqual([2 ** 3 * 3 ** 3 * 13 * 29, smooth / factor], [factor, 448574]);

const physical = corpus.pages.filter(p => p.page >= 0 && p.page <= 55 && p.indices.length);
assert.equal(physical.length, 55);
const p48 = physical.find(p => p.page === 48).indices;
assert.equal(p48.length, 271);
assert.equal(p48[0], 8);
assert.equal(p48.at(-1), 0);
const V = numeral(p48, 29);
assert.equal(gcdBig(V, N), BigInt(factor));
assert.equal(V % BigInt(factor), 0n);

// A distinct visible source interval has the same factor: the final
// eight-rune PRINTED FRAGMENT of p48, immediately before the next page.
// It is only a fragment, since the canonical word continues with p49's
// first IA rune. Do not describe it as an entire eight-rune cipher word.
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'
));
const red53 = ink.pages.find(p => p.page === 53).red_spans[0];
assert.equal(red53.start, 128);
assert.equal(red53.length, 51);
const redPrimeSum = corpus.pages.find(p => p.page === 53).indices
  .slice(red53.start, red53.start + red53.length)
  .reduce((sum, value) => sum + corpus.prime[value], 0);
assert.equal(redPrimeSum, 2262);
assert.equal(factor, 36 * redPrimeSum);

const transcript = fs.readFileSync(
  path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8'
).split('%').slice(0, 55);
const lastFragment = source => [...source.matchAll(/[\u16A0-\u16FF]+/gu)].at(-1)[0];
const p48LastRunes = lastFragment(transcript[48]);
assert.equal(p48LastRunes, 'ᛇᚠᚢᛞᚣᚪᛚᚠ');
assert.equal(transcript[49].match(/[\u16A0-\u16FF]/u)[0], 'ᛡ');
const glyphMap = new Map(corpus.runes.map((rune, index) => [rune, index]));
const fragmentDigits = [...p48LastRunes].map(rune => glyphMap.get(rune));
assert.deepEqual(fragmentDigits, p48.slice(-8));
const fragmentValue = numeral(fragmentDigits, 29);
assert.equal(fragmentValue, 207035949198n);
assert.equal(fragmentValue % BigInt(redPrimeSum), 0n);

// The three color-marked triangle intervals (red p40 heading, red p15
// heading, red p53 stanza) omit exactly one GP glyph: E, prime value67.
// That separately known source number also divides the printed fragment.
const triangleSymbols = [];
for (const page of [40, 15, 53]) {
  const source = ink.pages.find(p => p.page === page).red_spans[0];
  const indices = corpus.pages.find(p => p.page === page).indices;
  triangleSymbols.push(...indices.slice(source.start, source.start + source.length));
}
const missingSymbols = corpus.prime.flatMap((prime, index) =>
  triangleSymbols.includes(index) ? [] : [{ index, prime }]);
assert.deepEqual(missingSymbols, [{ index: 18, prime: 67 }]);
const missingPrime = missingSymbols[0].prime;
const crossDivisor = redPrimeSum * missingPrime;
assert.equal(fragmentValue % BigInt(crossDivisor), 0n);
const residualPrime = fragmentValue / BigInt(crossDivisor);
assert.equal(residualPrime, 1366087n);
// Elementary exact trial division suffices for this seven-digit integer.
for (let d = 2n; d * d <= residualPrime; d++)
  assert.notEqual(residualPrime % d, 0n, 'residual is composite');

// Exact 7! permutation test, preserving the final GP-F and the whole
// eight-rune printed fragment inventory, avoids using a random sample.
const perm = fragmentDigits.slice(0, -1);
let permutationCount = 0;
let sumDivisible = 0;
let sumAndMissingDivisible = 0;
function walk(start) {
  if (start === perm.length) {
    permutationCount++;
    const value = numeral([...perm, fragmentDigits.at(-1)], 29);
    if (value % BigInt(redPrimeSum) === 0n) sumDivisible++;
    if (value % BigInt(crossDivisor) === 0n) sumAndMissingDivisible++;
    return;
  }
  for (let j = start; j < perm.length; j++) {
    [perm[start], perm[j]] = [perm[j], perm[start]];
    walk(start + 1);
    [perm[start], perm[j]] = [perm[j], perm[start]];
  }
}
walk(0);
assert.deepEqual([permutationCount, sumDivisible, sumAndMissingDivisible],
  [5040, 132, 10]);

const matchingTerminalFragments = transcript.flatMap((page, i) => {
  const word = lastFragment(page);
  const value = numeral([...word].map(rune => glyphMap.get(rune)), 29);
  return value > 0n && value % BigInt(redPrimeSum) === 0n ? [i] : [];
});
assert.deepEqual(matchingTerminalFragments, [48]);

const highPageGcds = physical.map(p => ({
  page: p.page, gcd: gcdBig(numeral(p.indices, 29), N)
})).filter(x => x.gcd >= 100n).map(x => ({
  page: x.page, gcd: x.gcd.toString()
}));
assert.deepEqual(highPageGcds, [
  { page: 24, gcd: '108' },
  { page: 34, gcd: '126' },
  { page: 43, gcd: '351' },
  { page: 48, gcd: '81432' }
]);

const alternate = [
  ['reversed-GP29', numeral([...p48].reverse(), 29)],
  ['forward-one-based-GP30', numeral(p48.map(x => x + 1), 30)],
  ['reversed-one-based-GP30', numeral([...p48].reverse().map(x => x + 1), 30)],
  ['forward-prime-base110', numeral(p48.map(x => corpus.prime[x]), 110)],
  ['reversed-prime-base110', numeral([...p48].reverse().map(x => corpus.prime[x]), 110)]
].map(([mode, n]) => ({ mode, gcd: gcdBig(n, N).toString() }));
assert.deepEqual(alternate.map(x => x.gcd), ['24', '13', '117', '4', '1']);

const quotient = digitsOf(V / BigInt(factor), 29);
assert.equal(quotient.length, 268);
const quotientIoC = indexOfCoincidence(quotient, 29);
assert.ok(Math.abs(quotientIoC - 0.03398736653809604) < 1e-12);

// Only four trailing GP digits are required to enforce an arbitrary
// 81432 residue; enumerate every exact valid suffix after the original
// 267-symbol prefix, to make the checksum hypothesis explicit.
const width = 4;
const suffixCapacity = 29n ** BigInt(width);
const prefix = numeral(p48.slice(0, -width), 29);
const d = BigInt(factor);
const needed = ((-(prefix % d) * suffixCapacity) % d + d) % d;
const suffixes = [];
for (let n = needed; n < suffixCapacity; n += d) {
  const digits = digitsOf(n, 29);
  suffixes.push([...Array(width - digits.length).fill(0), ...digits]);
}
assert.equal(suffixes.length, 9);
assert.deepEqual(suffixes.at(-1), p48.slice(-width));

/** Xorshift32 generator for independently reproducible permutations. */
let seed = 0x15483301;
/** @returns {number} */
function randomUint32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @param {number} limitExclusive @returns {number} */
function uniformIndex(limitExclusive) {
  const limit = 4294967296 - (4294967296 % limitExclusive);
  let value;
  do { value = randomUint32(); } while (value >= limit);
  return value % limitExclusive;
}

const interior = p48.slice(1, -1);
const trials = 300000;
let divisible = 0;
let atLeast = 0;
let exact = 0;
let fragmentDivisible = 0;
let exactAndFragment = 0;
let atLeastAndFragment = 0;
for (let t = 0; t < trials; t++) {
  for (let j = interior.length - 1; j > 0; j--) {
    const k = uniformIndex(j + 1);
    [interior[j], interior[k]] = [interior[k], interior[j]];
  }
  // All intermediates are exact safe JS integers: smooth*29 < 2^53.
  let remainder = p48[0];
  let wordRemainder = 0;
  for (let j = 0; j < interior.length; j++) {
    remainder = (remainder * 29 + interior[j]) % smooth;
    if (j >= interior.length - 7)
      wordRemainder = (wordRemainder * 29 + interior[j]) % redPrimeSum;
  }
  remainder = (remainder * 29 + p48.at(-1)) % smooth;
  wordRemainder = (wordRemainder * 29 + p48.at(-1)) % redPrimeSum;
  const g = gcdSmall(remainder, smooth);
  const fragmentMatches = wordRemainder === 0;
  if (remainder % factor === 0) divisible++;
  if (g >= factor) atLeast++;
  if (g === factor) exact++;
  if (fragmentMatches) fragmentDivisible++;
  if (g === factor && fragmentMatches) exactAndFragment++;
  if (g >= factor && fragmentMatches) atLeastAndFragment++;
}
assert.deepEqual([divisible, atLeast, exact], [420, 1186, 214]);
assert.deepEqual([fragmentDivisible, exactAndFragment, atLeastAndFragment], [3918, 1, 15]);

console.log(JSON.stringify({
  corpusPages: physical.length,
  tableSha256: crypto.createHash('sha256').update(Buffer.from(grid)).digest('hex'),
  page48Glyphs: p48.length,
  page48NumeralBits: V.toString(2).length,
  originalGcd: factor,
  primePowers: '2^3 * 3^3 * 13 * 29',
  otherHighGcdPages: highPageGcds,
  alternativeReadings: alternate,
  directQuotient: {
    GP29Length: quotient.length,
    indexOfCoincidence: quotientIoC,
    prefix: quotient.slice(0, 100).map(x => corpus.translit[x]).join(' ')
  },
  fourGlyphChecksumOptions: suffixes.map(x => x.join(',')),
  sourceMarkedCrosslink: {
    p53RedGPPrimeSum: redPrimeSum,
    p48FinalPrintedFragment: p48LastRunes,
    originalWordContinuesNextPage: true,
    p48FragmentGP29: fragmentValue.toString(),
    fragmentQuotient2262: (fragmentValue / BigInt(redPrimeSum)).toString(),
    missingTriangleGP: 'E (index18, prime67)',
    fragmentDivisorRedSumTimesMissingPrime: crossDivisor,
    remainingPrime: residualPrime.toString(),
    terminalEightPermutations: {
      total: permutationCount, redSumDivisible: sumDivisible,
      redSumTimesMissingPrimeDivisible: sumAndMissingDivisible
    },
    allPageFinalNonzeroFragmentMatches: matchingTerminalFragments
  },
  conditionalShuffle: {
    trials,
    fixedFirst: p48[0],
    fixedLast: p48.at(-1),
    exactGcdMatches: exact,
    fragmentDivisibleMatches: fragmentDivisible,
    exactGcdAndFragmentMatches: exactAndFragment,
    atLeastGcdAndFragmentMatches: atLeastAndFragment,
    divisibleMatches: divisible,
    atLeastGcdMatches: atLeast,
    addOneDivisibilityTail: (divisible + 1) / (trials + 1),
    addOneAtLeastGcdTail: (atLeast + 1) / (trials + 1)
  },
  conclusion: 'A source-adjacent exact arithmetic lead, not a decoded key or plaintext'
}, null, 2));

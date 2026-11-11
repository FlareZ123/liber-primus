"use strict";

/**
 * Necessary GP-prime-sum parity constraint for a cipher that preserves
 * original rune count and every F/non-F position inside printed clauses.
 *
 * Source-visible hypothesis: LP2 plaintext might share LP1's deliberately
 * prime-summed short sentences. A literal F=2, all other GP primes odd,
 * fixes the parity of a clause under F-transparent substitution, even if
 * EVERY non-F rune has an independent unknown key/state.
 *
 * SFT: node sims/lp2_f_literal_clause_parity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
assert.equal(corpus.prime[0], 2);
assert.ok(corpus.prime.slice(1).every(p => p % 2 === 1));
/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
/**
 * Original punctuation '.' and paragraph '&' are independently printed
 * clause delimiters. Page '%', printed line '/', and word '-' are *not*.
 * Section markers '$' and chapter '§' are also hard boundaries.
 * @param {string} text
 * @returns {number[][]}
 */
function clauses(text) {
  return text.split(/[.&$§]/).map(unit => Array.from(unit)
    .filter(symbol => runeIndex.has(symbol))
    .map(symbol => /** @type {number} */ (runeIndex.get(symbol))))
    .filter(unit => unit.length > 0);
}
/**
 * @param {number[][]} units
 * @returns {{all:number,short:number,shortOdd:number,shortPrime:number,shortEven:number,long:number,longOdd:number,longPrime:number}}
 */
function statistics(units) {
  const short = units.filter(unit => unit.length <= 40);
  const long = units.filter(unit => unit.length > 40);
  /** @param {number[]} unit */
  const primeSum = unit => unit.reduce((s, i) => s + corpus.prime[i], 0);
  /** @param {number[]} unit */
  const oddSum = unit => unit.reduce((s, i) => s + (i === 0 ? 0 : 1), 0) % 2 === 1;
  for (const unit of units) {
    assert.equal(primeSum(unit) % 2 === 1, oddSum(unit));
  }
  const shortOdd = short.filter(oddSum).length;
  return {
    all: units.length,
    short: short.length,
    shortOdd,
    shortPrime: short.filter(unit => isPrime(primeSum(unit))).length,
    shortEven: short.length - shortOdd,
    long: long.length,
    longOdd: long.filter(oddSum).length,
    longPrime: long.filter(unit => isPrime(primeSum(unit))).length,
  };
}
const original = read("resources/lp2-transcription.txt");
// 55 rune-bearing unsolved physical LP2 pages precede the solved p56/p57
// in the page-separated canonical transcription (p50 has no runes).
const unsolved = original.split("%").slice(0, 55).join("%");
const unsolvedSymbols = Array.from(unsolved).filter(symbol => runeIndex.has(symbol));
assert.equal(unsolvedSymbols.length, 12956);
const actual = statistics(clauses(unsolved));
assert.deepEqual(actual, {
  all: 175, short: 70, shortOdd: 37, shortPrime: 17,
  shortEven: 33, long: 105, longOdd: 49, longPrime: 11,
});
const master = read("resources/transcriptions/liber_primus_master.txt");
const sections = master.slice(master.indexOf("\n\n") + 2)
  .split(/\s*\$\s*/).filter(section => Array.from(section).some(rune => runeIndex.has(rune)));
assert.equal(sections.length, 18);
const nativeSections = [
  ["0.2 SOME WISDOM", 2, [5, 4, 4]],
  ["0.4 A KOAN", 4, [17, 11, 9]],
  ["0.6 AN INSTRUCTION", 6, [6, 5, 5]],
  ["0.17 PARABLE", 17, [4, 4, 4]],
];
const nativeResults = nativeSections.map(([name, index, expected]) => {
  const st = statistics(clauses(sections[/** @type {number} */ (index)]));
  assert.deepEqual([st.short, st.shortOdd, st.shortPrime], expected);
  return { name, ...st };
});
const nativeShort = nativeResults.reduce((s, item) => s + item.short, 0);
const nativeOdd = nativeResults.reduce((s, item) => s + item.shortOdd, 0);
const nativePrime = nativeResults.reduce((s, item) => s + item.shortPrime, 0);
assert.deepEqual([nativeShort, nativeOdd, nativePrime], [32, 24, 22]);

// Seeded positive: a different unrestricted alphabet permutation at EACH
// position, subject ONLY to never creating/destroying the F symbol.
// This preserves every clause's prime-sum parity regardless of the
// amount of key/state complexity in the other 28 GP rune labels.
let seed = 0x33012016;
/** @returns {number} */
const rand = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
};
const input = clauses(unsolved);
const transformed = input.map(unit => unit.map(value => value === 0 ? 0 : 1 + rand() % 28));
const testStats = statistics(transformed);
assert.equal(testStats.shortOdd, actual.shortOdd);
assert.equal(testStats.longOdd, actual.longOdd);
assert.ok(transformed.some((unit, i) => unit.some((x, j) => x !== input[i][j])));
// Adding or deleting ONLY F runes also leaves every per-clause GP-prime
// parity unchanged: those runes have even GP prime weight 2. In particular
// treating source F as null/escape without changing non-F count cannot by
// itself rescue a clause whose original sum parity is even.
const fEdited = input.map(unit => [0, ...unit.filter((symbol, j) =>
  symbol !== 0 || j % 2 === 0), 0, 0]);
const clauseParity = unit => unit.filter(symbol => symbol !== 0).length % 2;
assert.deepEqual(fEdited.map(clauseParity), input.map(clauseParity));
assert.ok(fEdited.some((unit, i) => unit.length !== input[i].length));

// Parity alone fixes an upper bound on how many printed GP-prime-summed
// short clauses can be prime under the F-preserving model.
const nativePrimeTarget = Math.ceil(nativePrime / nativeShort * actual.short);
const nativeOddTarget = Math.ceil(nativeOdd / nativeShort * actual.short);
const necessaryFlipForPrimeShare = Math.max(0, nativePrimeTarget - actual.shortOdd);
const necessaryFlipForOddShare = Math.max(0, nativeOddTarget - actual.shortOdd);
assert.deepEqual(
  [nativePrimeTarget, nativeOddTarget, necessaryFlipForPrimeShare, necessaryFlipForOddShare],
  [49, 53, 12, 16]
);
console.log(JSON.stringify({
  model: "29-rune fixed printed clause layout and literal F=GP0 passthrough, completely secret arbitrary non-F substitution at every position",
  originalUnsolved: actual,
  independentUnencryptedCicadaSections: nativeResults,
  pooledNative: { short: nativeShort, shortOdd: nativeOdd, shortPrime: nativePrime },
  sourceRelativeThreshold: {
    nativePrimeShare: nativePrime / nativeShort,
    nativeOddShare: nativeOdd / nativeShort,
    maximumPrimeShareOfUnsolvedShortClausesWithFTransparent: actual.shortOdd / actual.short,
    minimumFParityFlipsToMatchNativePrimeShare: necessaryFlipForPrimeShare,
    minimumFParityFlipsToMatchNativeOddShare: necessaryFlipForOddShare,
  },
  positive: "every non-F rune independently randomized with source F fixed, and separately arbitrary source F-only insertion/removal; per-clause prime-sum parities exactly preserved",
  caveat: "Conditional on unknown LP2 plaintext sharing the short-clause prime-design habit of the sampled original Cicada plaintext; labels and very short texts retained uniformly; no original key or plaintext found.",
}, null, 2));

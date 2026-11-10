"use strict";
/**
 * Agent 36: source-original LP2 page-pair GCD / 2016 grid-remainder SFT.
 * A numerically unusual *candidate*, not an authenticated puzzle clue or key.
 * Uses the source's GP29 indices, 55 rune-bearing unknown physical pages,
 * and 32x8 printed-byte row-major interpretation.
 *
 * Run: node sims/lp2_crosspage_gcd2016_sft.cjs
 * Node.js 22, no external packages. Seeded null shuffles preserve each
 * original page's rune histogram and first/last glyph; all pairs refitted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/base60-grid.json");
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(pages.length, 55);

/** @param {number[]} digits @returns {bigint} */
function gpNumber(digits) {
  return digits.reduce((n, value) => 29n * n + BigInt(value), 0n);
}
/** @param {bigint} first @param {bigint} second @returns {bigint} */
function gcd(first, second) {
  let a = first, b = second;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}
/** @param {number[]} values @returns {bigint} */
function bigEndian256(values) {
  return values.reduce((n, byte) => 256n * n + BigInt(byte), 0n);
}

/** @param {number} n @returns {number} Prime at a one-based index. */
function primeAt(n) {
  const primes = [];
  for (let candidate = 2; primes.length < n; candidate++) {
    if (primes.every((x) => candidate % x !== 0)) primes.push(candidate);
  }
  return primes[n - 1];
}

const originalNums = pages.map((p) => gpNumber(p.indices));
let largest = 0n, largestPair = [];
for (let i = 0; i < pages.length; i++)
  for (let j = i + 1; j < pages.length; j++) {
    const d = gcd(originalNums[i], originalNums[j]);
    if (d > largest) {
      largest = d;
      largestPair = [pages[i].page, pages[j].page];
    }
  }
const num45 = gpNumber(corpus.pages.find((p) => p.page === 45).indices);
const num48 = gpNumber(corpus.pages.find((p) => p.page === 48).indices);
const N = bigEndian256(bytes);
const common = gcd(num45, num48);
assert.deepEqual(largestPair, [45, 48]);
assert.equal(largest, 16056n);
assert.equal(common, 8n * 9n * 223n);
assert.equal(primeAt(48), 223);
assert.equal(N % common, 2016n);
assert.equal((N / 72n) % 223n, 28n);
assert.equal(N % 72n, 0n);
assert.equal(8 * 9 * 28, 2016);
// Arithmetic witness: a synthetic pair with exactly the same gcd is detected.
assert.equal(gcd(16056n * 11n, 16056n * 13n), 16056n);
assert.equal(N % gcd(16056n * 11n, 16056n * 13n), 2016n);

const rows = grid.byte_rows;
const sourceTraversals = {
  rowMajor: rows.flat(),
  rowSerpentine: rows.flatMap((r, i) => i % 2 ? r.slice().reverse() : r),
  columnMajor: Array.from({length: 8}, (_, j) => rows.map((r) => r[j])).flat(),
  columnSerpentine: Array.from({length: 8}, (_, j) =>
    j % 2 ? rows.map((r) => r[j]).reverse() : rows.map((r) => r[j])).flat()
};
const altRemainders = {};
for (const [name, stream] of Object.entries(sourceTraversals))
  for (const direction of ["forward", "reverse"]) {
    const b = direction === "forward" ? stream : stream.slice().reverse();
    altRemainders[name + ":" + direction] = Number(bigEndian256(b) % common);
  }
assert.equal(Object.values(altRemainders).filter((x) => x === 2016).length, 1);
assert.equal(altRemainders["rowMajor:forward"], 2016);

// Conditional page-histogram null. The best GCD is freshly selected across
// all 1,485 pairs in each shuffle, preserving both endpoints on every page.
let seed = 0x3301223;
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const shuffles = 125;
let maxAtLeastObserved = 0;
let yearRemainderWitnessShuffles = 0;
let largestNullGcd = 0n;
for (let trial = 0; trial < shuffles; trial++) {
  const numbers = pages.map((page) => {
    const glyphs = page.indices.slice();
    for (let i = glyphs.length - 2; i > 1; i--) {
      const j = 1 + random32() % i;
      [glyphs[i], glyphs[j]] = [glyphs[j], glyphs[i]];
    }
    return gpNumber(glyphs);
  });
  let max = 0n, found2016 = false;
  for (let i = 0; i < pages.length; i++)
    for (let j = i + 1; j < pages.length; j++) {
      const d = gcd(numbers[i], numbers[j]);
      if (d > max) max = d;
      if (d > 2016n && N % d === 2016n) found2016 = true;
    }
  if (max >= common) maxAtLeastObserved++;
  if (found2016) yearRemainderWitnessShuffles++;
  if (max > largestNullGcd) largestNullGcd = max;
}
assert.equal(maxAtLeastObserved, 8);
assert.equal(yearRemainderWitnessShuffles, 0);


// Secondary source-conditioned null: hold page 48 fixed, shuffle every other
// physical page's interior glyphs; ask whether ANY other page supplies the
// original divisor. This is retrospective, not a discovery-wide p-value.
let seed48 = 0x31415926;
function random48() {
  seed48 ^= seed48 << 13;
  seed48 ^= seed48 >>> 17;
  seed48 ^= seed48 << 5;
  return seed48 >>> 0;
}
let nearby = 0, divisorWitness = 0, exactWitness = 0, page45Witness = 0;
let totalDivisibleCandidates = 0;
const page48Number = num48, D = Number(common);
for (let trial = 0; trial < 5000; trial++) {
  let any = false, exact = false, near = false;
  for (const page of pages) {
    if (page.page === 48) continue;
    const digits = page.indices.slice();
    for (let i = digits.length - 2; i > 1; i--) {
      const j = 1 + random48() % i;
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    let residue = 0;
    for (const digit of digits) residue = (29 * residue + digit) % D;
    if (residue !== 0) continue;
    any = true;
    totalDivisibleCandidates++;
    if (page.page === 45) page45Witness++;
    if (Math.abs(page.page - 48) <= 3) near = true;
    if (gcd(page48Number, gpNumber(digits)) === common) exact = true;
  }
  if (any) divisorWitness++;
  if (near) nearby++;
  if (exact) exactWitness++;
}
assert.equal(divisorWitness, 13);
assert.equal(exactWitness, 7);
assert.equal(nearby, 2);
assert.equal(page45Witness, 2);

console.log(JSON.stringify({
  status: "Original arithmetic correspondence; no authenticated key/plaintext",
  source: ["LP2 p45 270 runes", "LP2 p48 271 runes", "256 source grid bytes"],
  pairsSearched: 1485,
  maximumGcd: common.toString(),
  maximumPair: largestPair,
  factorization: "8 * 9 * 223",
  primeAtOneBased48: primeAt(48),
  mainGridRemainder: Number(N % common),
  quotientGridRemainder223: Number((N / 72n) % 223n),
  interpretation: "2016 = 8 * 9 * 28",
  alternativeByteOrders: altRemainders,
  shuffles: {
    count: shuffles, seed: "0x3301223",
    pageEndpointAndHistogramPreserving: true,
    nullMaximumGcdAtLeast16056: maxAtLeastObserved,
    nullAnyPairGcdOver2016WithGridRemainder2016: yearRemainderWitnessShuffles,
    largestNullGcd: largestNullGcd.toString()
  },
  page48ConditionedShuffles: {
    count: 5000, seed: "0x31415926",
    shuffledPageHistogramAndEndpointsPreserved: true,
    fixedOriginalPage48: true,
    anyOtherPageDivisibleBy16056: divisorWitness,
    anyOtherPageExactGcd16056WithPage48: exactWitness,
    near3PageDivisibleBy16056: nearby,
    specificPage45DivisibleBy16056: page45Witness,
    totalDivisiblePageCandidates: totalDivisibleCandidates
  },
  caveat: "page pair and number were found retrospectively; this is a small conditional null, not an authentication of intent"
}, null, 2));

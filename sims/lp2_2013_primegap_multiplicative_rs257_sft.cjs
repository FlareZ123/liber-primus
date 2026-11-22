/**
 * Source-locked 2013 telnet prime-gap / 2014 p50 interior experiments.
 *
 * A single-file test for Node.js 22 (Windows 11 compatible).
 * Run from the repository root: node sims/lp2_2013_primegap_multiplicative_rs257_sft.cjs
 * It is read-only and uses no third-party packages.
 *
 * The 2013 ISO prime_echo script includes all 180 primes that historical
 * telnet transcripts omit. The missing ordinal interval 21..200 maps
 * naturally to a 30x6 interior of p50's 32x8 original 256-cell table.
 * We test reversible multiplication with source-selected prime keys and
 * an erasure-code interpretation where the 180 inner cells fix a
 * degree-179 polynomial over GF(257), predicting the 76 perimeter cells.
 * Neither mechanism is asserted to be an instruction from Cicada.
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/** @param {string} relative @returns {string} */
const read = (relative) => fs.readFileSync(path.join(__dirname, "..", relative), "utf8");

/** @type {{alphabet: string, rows: string[][], byte_rows: number[][]}} */
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
/** @type {{pages: {page: number, indices: number[]}[]}} */
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const isoShell = read("resources/historical/cicada2013-os-original-prime-echo.sh");

const bytes = grid.byte_rows.flat();
assert.equal(grid.rows.length, 32);
assert.equal(bytes.length, 256);
assert(grid.byte_rows.every((row) => row.length === 8));
assert.equal(grid.alphabet.length, 60);
for (let r = 0; r < 32; r++) {
  for (let c = 0; c < 8; c++) {
    const token = grid.rows[r][c];
    assert.equal(token.length, 2);
    assert.equal(
      grid.alphabet.indexOf(token[0]) * 60 + grid.alphabet.indexOf(token[1]),
      grid.byte_rows[r][c]
    );
  }
}
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);

const isoPrimes = Array.from(
  isoShell.matchAll(/echo\s+(?:-n\s+)?"(\d+)\t"/g),
  (match) => Number(match[1])
);
assert.equal(isoPrimes.length, 464);
assert.equal(isoPrimes[0], 2);
assert.equal(isoPrimes.at(-1), 3301);
assert.equal(isoPrimes[19], 71);
assert.equal(isoPrimes[20], 73);
assert.equal(isoPrimes[199], 1223);
assert.equal(isoPrimes[200], 1229);
const missing = isoPrimes.slice(20, 200);
assert.equal(missing.length, 180);
assert(missing.every((prime) => prime % 2 === 1));

const core = grid.byte_rows.slice(1, 31).flatMap((row) => row.slice(1, 7));
const rim = [];
for (let c = 0; c < 8; c++) rim.push(grid.byte_rows[0][c]);
for (let r = 1; r < 32; r++) rim.push(grid.byte_rows[r][7]);
for (let c = 6; c >= 0; c--) rim.push(grid.byte_rows[31][c]);
for (let r = 30; r >= 1; r--) rim.push(grid.byte_rows[r][0]);
assert.equal(core.length, 180);
assert.equal(rim.length, 76);
assert.equal(core.length + rim.length, 256);

/** @param {number} x @param {number} modulus @returns {number} */
function mod(x, modulus) {
  return ((x % modulus) + modulus) % modulus;
}

/**
 * Small fixed modulus inverse; inputs are known coprime.
 * @param {number} x
 * @param {number} modulus
 * @returns {number}
 */
function inverse(x, modulus) {
  const value = mod(x, modulus);
  for (let n = 1; n < modulus; n++) {
    if (mod(value * n, modulus) === 1) return n;
  }
  throw new Error("Not invertible");
}

/** @param {number[]} values @returns {number} */
function printable(values) {
  return values.filter((b) => (b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13).length;
}

/** @param {number[]} values @returns {number} */
function longestPrintableRun(values) {
  let run = 0;
  let best = 0;
  for (const b of values) {
    if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

const primeTimesByte = core.map((b, i) => mod(b * missing[i], 256));
const primeDividedByte = core.map((b, i) => mod(b * inverse(missing[i], 256), 256));
assert(primeDividedByte.every((value, i) => mod(value * missing[i], 256) === core[i]));
assert(primeTimesByte.every((value, i) => mod(value * inverse(missing[i], 256), 256) === core[i]));
assert.equal(printable(core), 73);
assert.equal(printable(primeTimesByte), 68);
assert.equal(printable(primeDividedByte), 64);
assert.equal(longestPrintableRun(primeDividedByte), 3);

// Analogous complete source-prime inverses in the canonical 29-rune field.
const primeTimes29 = core.map((b, i) => mod((b % 29) * missing[i], 29));
const primeDivided29 = core.map((b, i) => mod((b % 29) * inverse(missing[i], 29), 29));
assert(primeDivided29.every((value, i) => mod(value * missing[i], 29) === core[i] % 29));
const clear57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(clear57.length, 95);
const p57Matches = (candidate) => clear57.filter((rune, i) => candidate[i + 85] === rune).length;
assert.equal(p57Matches(core.map((b) => b % 29)), 2);
assert.equal(p57Matches(primeTimes29), 0);
assert.equal(p57Matches(primeDivided29), 1);

// Proposed original-source erasure code: missing ordinal ranks 21..200
// act as the 180 inside evaluation sites over GF257; complementary
// coordinates 1..20 and 201..256 specify 76 outside values.
const FIELD = 257;
const factors = [1];
for (let i = 1; i < 180; i++) factors.push(mod(factors.at(-1) * i, FIELD));
const weights = Array.from({length: 180}, (_, i) =>
  mod(((179 - i) % 2 === 1 ? -1 : 1) *
    inverse(mod(factors[i] * factors[179 - i], FIELD), FIELD), FIELD)
);

/**
 * Lagrange barycentric interpolation at a coordinate outside [21,200].
 * @param {number} x
 * @param {number[]} innerValues
 * @returns {number}
 */
function evaluateOutside(x, innerValues) {
  assert.equal(innerValues.length, 180);
  assert(x >= 1 && x <= 256 && (x < 21 || x > 200));
  let product = 1;
  let sum = 0;
  for (let i = 0; i < 180; i++) {
    const delta = mod(x - (i + 21), FIELD);
    product = mod(product * delta, FIELD);
    sum = mod(sum + innerValues[i] * weights[i] * inverse(delta, FIELD), FIELD);
  }
  return mod(product * sum, FIELD);
}

const outsideCoordinates = [
  ...Array.from({length: 20}, (_, i) => i + 1),
  ...Array.from({length: 56}, (_, i) => i + 201)
];
const predictions = outsideCoordinates.map((x) => evaluateOutside(x, core));
assert.equal(predictions.length, 76);

/** @param {number[]} a @param {number[]} b @returns {number} */
function bestRingMatches(a, b) {
  assert.equal(a.length, 76);
  assert.equal(b.length, 76);
  let best = 0;
  for (let start = 0; start < 76; start++) {
    for (const direction of [-1, 1]) {
      let matches = 0;
      for (let i = 0; i < 76; i++) {
        if (a[i] === b[mod(start + direction * i, 76)]) matches++;
      }
      best = Math.max(best, matches);
    }
  }
  return best;
}

const rimMatches = bestRingMatches(predictions, rim);
assert.equal(rimMatches, 2);

// Synthetic positive: the exact interpolation decoder recovers *every*
// withheld symbol of a 180-coefficient GF257 polynomial without fitting.
const polyCoefficients = Array.from({length: 180}, (_, i) => mod(37 * i + 11, FIELD));
/** @param {number} x @returns {number} */
const polyValue = (x) => polyCoefficients.reduceRight(
  (accumulator, coefficient) => mod(accumulator * x + coefficient, FIELD), 0
);
const plant = Array.from({length: 180}, (_, i) => polyValue(i + 21));
assert(outsideCoordinates.every((x) => evaluateOutside(x, plant) === polyValue(x)));

console.log(JSON.stringify({
  source: "2013 ISO all-primes versus documented telnet rank21..200 gap; original p50 32x8 table",
  primeGap: {count: missing.length, first: missing[0], last: missing.at(-1)},
  interior: core.length,
  outerRing: rim.length,
  bytePrintable: {
    source: printable(core),
    multiplyByPrimeMod256: printable(primeTimesByte),
    divideByPrimeMod256: printable(primeDividedByte)
  },
  p57ClearExactMatchesOf95: {
    sourceMod29: p57Matches(core.map((b) => b % 29)),
    multiplyPrimeMod29: p57Matches(primeTimes29),
    dividePrimeMod29: p57Matches(primeDivided29)
  },
  reedSolomon257: {
    degreeLimit: 179,
    outerPredictions: 76,
    bestMatchesOverAll76RingOffsetsAndBothDirections: rimMatches,
    syntheticWithheldRecovery: "76/76"
  },
  recoveredOriginalPlaintext: false
}, null, 2));

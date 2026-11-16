'use strict';

/**
 * Source-order terminal 256-rune GP29 polynomial necessary tests.
 *
 * The 76 original p55 runes are withheld from all interpolation and degree
 * calculations. Genuine p56 plaintext and clear p57 are the only 180 inputs.
 * 180 source-known values occupy consecutive positions 76..255; the
 * independently unknown positions 0..75 are predicted afterward.
 *
 * Run: node sims/lp2_terminal256_allprime_difference_gf257_suffix_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));

/** @param {number} value @returns {number} */
function mod257(value) { return ((value % 257) + 257) % 257; }

/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }

/** @param {number} base @param {number} exponent @returns {number} */
function pow257(base, exponent) {
  let answer = 1;
  let b = mod257(base);
  for (let e = exponent; e > 0; e = Math.floor(e / 2)) {
    if (e % 2) answer = mod257(answer * b);
    b = mod257(b * b);
  }
  return answer;
}

/** @param {number} value @returns {number} */
function inv257(value) {
  assert.notEqual(mod257(value), 0, 'division by field zero');
  return pow257(value, 255);
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  /** @type {number[]} */
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    let isPrime = true;
    for (let j = 2; j * j <= n; j++) {
      if (n % j === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(n);
  }
  return primes;
}

/** @param {number[]} cipher @returns {number[]} */
function authenticP56(cipher) {
  assert.equal(cipher.length, 85);
  const primes = firstPrimes(84);
  let cursor = 0;
  const decoded = cipher.map((value, i) => {
    if (i === 56) {
      assert.equal(value, 0, 'original genuine nonconsuming F');
      return 0;
    }
    const shift = primes[cursor++] - 1;
    const plaintext = mod29(value - shift);
    assert.equal(mod29(plaintext + shift), value);
    return plaintext;
  });
  assert.equal(cursor, 84);
  assert.deepEqual(decoded.slice(0, 5), [24, 9, 18, 9, 23]);
  return decoded;
}

/**
 * @param {bigint} n
 * @returns {bigint}
 */
function absBig(n) { return n < 0n ? -n : n; }

/**
 * @param {bigint} a
 * @param {bigint} b
 * @returns {bigint}
 */
function gcdBig(a, b) {
  a = absBig(a);
  b = absBig(b);
  while (b !== 0n) {
    const rem = a % b;
    a = b;
    b = rem;
  }
  return a;
}

/**
 * Successive forward-difference first entries in exact integer arithmetic,
 * plus integer GCD across every order's complete difference row.
 * @param {number[]} values
 * @returns {{first: bigint[], gcdAtOrder: bigint[]}}
 */
function integerDifferences(values) {
  let row = values.map(value => BigInt(value));
  const first = [row[0]];
  const gcdAtOrder = [0n];
  while (row.length > 1) {
    row = row.slice(1).map((value, i) => value - row[i]);
    first.push(row[0]);
    gcdAtOrder.push(row.reduce((gcd, value) => gcdBig(gcd, value), 0n));
  }
  return {first, gcdAtOrder};
}

/**
 * Newton's exact forward-difference interpolation over GF257.
 * For base=76 and known count180, Δ^k y0 determines the unique polynomial
 * of degree <=179. At x=76+t, evaluate Σ Δ^k y0 * binomial(t,k).
 * Negative t is valid over GF257 because k<257.
 *
 * @param {bigint[]} differenceFirst
 * @param {number} x
 * @param {number} base
 * @returns {number}
 */
function interpolateAt(differenceFirst, x, base = 76) {
  const t = x - base;
  let binomial = 1;
  let sum = 0;
  for (let k = 0; k < differenceFirst.length; k++) {
    const difference = Number(((differenceFirst[k] % 257n) + 257n) % 257n);
    sum = mod257(sum + difference * binomial);
    if (k + 1 < differenceFirst.length) {
      binomial = mod257(binomial * (t - k) * inv257(k + 1));
    }
  }
  return sum;
}

const printed55 = corpus.pages[55].indices;
const printed56 = corpus.pages[56].indices;
const literal57 = corpus.pages[57].indices;
const solved56 = authenticP56(printed56);
assert.equal(printed55.length, 76);
assert.equal(literal57.length, 95);

const registers = [
  {name: 'solved p56 + literal p57',known:[...solved56, ...literal57],
    expectedGcd178:4n, expectedValid:5, expectedMatches:0},
  {name: 'printed p56 + literal p57',known:[...printed56, ...literal57],
    expectedGcd178:1n, expectedValid:14, expectedMatches:1}
];

for (const register of registers) {
  assert.equal(register.known.length, 180);
  const differences = integerDifferences(register.known);
  assert.equal(differences.gcdAtOrder[177], 1n);
  assert.equal(differences.gcdAtOrder[178], register.expectedGcd178);
  assert.equal(differences.first.length, 180);

  // A degree <=177 polynomial on all these consecutive original positions
  // must have every 178th difference zero in its field. The integer
  // 178th-difference GCD is 4 (or 1 for the as-printed control). No
  // prime p>=257 divides this GCD, so no such model can fit in a field
  // of prime characteristic >=257, independent of which p is selected.
  assert(register.expectedGcd178 < 257n);

  // GF257 interpolation is uniquely defined from the exact 180 positions.
  // It predicts every withheld slot before any comparison with p55.
  for (let i = 0; i < 180; i++) {
    assert.equal(interpolateAt(differences.first, 76 + i), register.known[i]);
  }
  const prediction = Array.from({length:76}, (_, i) =>
    interpolateAt(differences.first, i)
  );
  const validGP29 = prediction.filter(value => value <= 28).length;
  const printedMatches = prediction.filter((value, i) =>
    value === printed55[i]
  ).length;

  assert.equal(validGP29, register.expectedValid);
  assert.equal(printedMatches, register.expectedMatches);
  assert.equal(prediction.length, 76);
  assert(register.known.every(value => value <= 28));

  console.log(JSON.stringify({
    register:register.name,
    known:register.known.length,
    withheld:prediction.length,
    gcd178: String(differences.gcdAtOrder[178]),
    degreeBelow178PossibleForAnyPrimeCharacteristicAtLeast257:false,
    gf257PredictionsInGP29: validGP29,
    gf257PredictionsOutsideGP29:76-validGP29,
    comparisonToPrintedUnknownCipher:printedMatches,
    first12Predictions:prediction.slice(0,12)
  }));
}

// A 32-coefficient source-motivated degree31 polynomial must be
// correctly reconstructible when actually present. Plant a polynomial
// of degree31 over GF257, sample 180 known tail positions, and verify
// the exact 76-position recovery without using the withheld prefix.
const coefficients = Array.from({length:32}, (_, i) => (17 * i + 3) % 257);
/** @param {number} x @returns {number} */
function syntheticPoly(x) {
  return coefficients.reduceRight((value, coefficient) =>
    mod257(value * x + coefficient), 0);
}
const plantedKnown = Array.from({length:180}, (_, i) => syntheticPoly(76+i));
const plantedDifferences = integerDifferences(plantedKnown);
for (let i=0;i<76;i++) {
  assert.equal(interpolateAt(plantedDifferences.first, i), syntheticPoly(i));
}

console.log('PASS: all-prime degree<=177 original-register exclusion, GF257 original-suffix rejection, independent degree31 plant recovered.');

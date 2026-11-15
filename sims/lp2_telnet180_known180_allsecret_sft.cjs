'use strict';

/**
 * Independent historical-180 / known-180 source-gate SFT.
 * Run with Node.js 22 from any working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

const primeList = [];
for (let n = 2; n <= 1223; n++) if (isPrime(n)) primeList.push(n);
const gapPrimes = primeList.filter((n) => n >= 73 && n <= 1223);
assert.equal(gapPrimes.length, 180);
assert.equal(primeList.indexOf(73), 20);
assert.equal(primeList.indexOf(1223), 199);

assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
const p56 = [];
let clock = 0;
for (let i = 0; i < 85; i++) {
  const cipher = corpus.pages[56].indices[i];
  if (i === 56) {
    assert.equal(cipher, 0); // Authenticated nonconsuming plaintext-F position.
    p56.push(0);
  } else {
    p56.push(mod(cipher - (primeList[clock++] - 1)));
  }
}
assert.equal(clock, 84);
assert.equal(p56.map((i) => corpus.translit[i]).join('').startsWith('ANENDWITHINTHEDEEPWEB'), true);
const known = p56.concat(corpus.pages[57].indices);
assert.equal(known.length, 180);
assert.equal(grid.byte_rows.length, 32);
for (const row of grid.byte_rows) assert.equal(row.length, 8);
const interior = grid.byte_rows.slice(1, 31).flatMap((row) => row.slice(1, 7));
assert.equal(interior.length, 180);
assert.deepEqual(grid.byte_rows[0].slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);

/**
 * Best possible match count even for a non-injective freely secret GP29 lookup
 * applied identically at every position. Any secret bijection is no stronger.
 * @param {number[]} operands
 * @param {number[]} plaintext
 */
function arbitraryMapUpperBound(operands, plaintext) {
  assert.equal(operands.length, plaintext.length);
  const counts = Array.from({ length: 29 }, () => Array(29).fill(0));
  const first = new Map();
  let witness = null;
  let literal = 0;
  for (let i = 0; i < operands.length; i++) {
    const x = operands[i];
    const p = plaintext[i];
    assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
    assert.ok(Number.isInteger(p) && p >= 0 && p < 29);
    counts[x][p]++;
    if (x === p) literal++;
    if (!first.has(x)) first.set(x, { i, p });
    else if (witness === null && first.get(x).p !== p) {
      witness = { a: first.get(x).i, b: i, operand: x, pA: first.get(x).p, pB: p };
    }
  }
  const upper = counts.reduce((sum, row) => sum + Math.max(...row), 0);
  return { upper, literal, witness };
}

const schemes = {
  table: (b, q) => mod(b),
  table_minus_prime: (b, q) => mod(b - q),
  table_plus_prime: (b, q) => mod(b + q),
  table_minus_phi: (b, q) => mod(b - q + 1),
  table_plus_phi: (b, q) => mod(b + q - 1),
  table_xor_prime: (b, q) => mod(b ^ (q & 255))
};
const expected = {
  table: [50, 6],
  table_minus_prime: [49, 4],
  table_plus_prime: [48, 7],
  table_minus_phi: [49, 4],
  table_plus_phi: [48, 8],
  table_xor_prime: [50, 5]
};
for (const [name, transform] of Object.entries(schemes)) {
  const operands = interior.map((b, i) => transform(b, gapPrimes[i]));
  const result = arbitraryMapUpperBound(operands, known);
  assert.deepEqual([result.upper, result.literal], expected[name]);
  assert.ok(result.witness && result.upper <= 50);
  console.log(name, JSON.stringify(result));
}


// Original 2013 ISO prime_echo prints ten primes per line. The reported
// telnet gap occupies 18 whole ten-prime rows; grant natural row/column
// readings of its 18×10 array and of the LP2 30×6 numeric interior.
// Attempt exact key recovery P[i] = a*B[i] + z*Q[i] + c (mod29)
// for every one of 29^3 unknown affine parameter triples. An exact key
// must recover all 180 externally known original symbols.
const gridColumns = Array.from({ length: 6 }, (_, j) =>
  Array.from({ length: 30 }, (_, i) => grid.byte_rows[i + 1][j + 1])
).flat();
const primeColumns = Array.from({ length: 10 }, (_, j) =>
  Array.from({ length: 18 }, (_, i) => gapPrimes[i * 10 + j])
).flat();

/** @param {number[]} bytes @param {number[]} primeTape */
function affineKeyRecovery(bytes, primeTape) {
  const B = bytes.map(mod);
  const Q = primeTape.map(mod);
  let bestNonconstant = { hits: -1 };
  let bestConstant = { hits: -1 };
  for (let a = 0; a < 29; a++) {
    for (let z = 0; z < 29; z++) {
      const offsets = Array(29).fill(0);
      for (let i = 0; i < known.length; i++) {
        offsets[mod(known[i] - a * B[i] - z * Q[i])]++;
      }
      for (let c = 0; c < 29; c++) {
        const candidate = { a, z, c, hits: offsets[c] };
        if (a === 0 && z === 0) {
          if (candidate.hits > bestConstant.hits) bestConstant = candidate;
        } else if (candidate.hits > bestNonconstant.hits) {
          bestNonconstant = candidate;
        }
      }
    }
  }
  return { bestConstant, bestNonconstant };
}
const expectedAffine = [
  { grid: interior, primes: gapPrimes, max: 19 },
  { grid: interior, primes: primeColumns, max: 19 },
  { grid: gridColumns, primes: gapPrimes, max: 20 },
  { grid: gridColumns, primes: primeColumns, max: 18 }
];
for (const [orientation, item] of expectedAffine.entries()) {
  const result = affineKeyRecovery(item.grid, item.primes);
  assert.equal(result.bestConstant.hits, 31);
  assert.equal(result.bestNonconstant.hits, item.max);
  assert.ok(result.bestNonconstant.hits < known.length);
  console.log('affine orientation ' + orientation, JSON.stringify(result));
}

// Independently planted GP29 cipher with a shared invertible secret alphabet.
// π(x)=(7x+5) mod29, inverse 7^-1=25 mod29.
const syntheticBytes = known.map((p, i) => mod(25 * (p - 5) + gapPrimes[i]));
const syntheticOperands = syntheticBytes.map((b, i) => mod(b - gapPrimes[i]));
assert.equal(arbitraryMapUpperBound(syntheticOperands, known).upper, 180);
for (let i = 0; i < known.length; i++) assert.equal(mod(7 * syntheticOperands[i] + 5), known[i]);
console.log('PASS: original known GP29 180-rune gate, six exact secret-map ceilings, 180/180 planted recovery.');

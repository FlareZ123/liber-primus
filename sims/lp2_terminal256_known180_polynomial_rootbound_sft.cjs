'use strict';

/**
 * Universal degree lower bound for a direct polynomial-evaluation reading of
 * the 180 known GP29 runes on original LP2 physical pages 56 and 57.
 *
 * This test never reads page55. No field, evaluation-point order, root offset,
 * prime-vs-index representation, or secret coefficient is fitted to ciphertext.
 *
 * Run: node sims/lp2_terminal256_known180_polynomial_rootbound_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));

/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  /** @type {number[]} */
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime) primes.push(candidate);
  }
  return primes;
}

/** @param {number[]} symbols @returns {number[]} */
function histogram(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) {
    assert(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
    counts[symbol]++;
  }
  return counts;
}

/**
 * Authenticated LP2 p56 inverse. Only the literal plaintext F at position 56
 * skips its consecutive-prime key step. All remaining runes use prime-1.
 * @param {number[]} ciphertext
 * @returns {number[]}
 */
function decryptP56(ciphertext) {
  const keys = firstPrimes(85);
  let cursor = 0;
  const plain = ciphertext.map((cipher, position) => {
    if (position === 56) {
      assert.equal(cipher, 0);
      return 0;
    }
    const key = keys[cursor++] - 1;
    const decoded = mod29(cipher - key);
    assert.equal(mod29(decoded + key), cipher);
    return decoded;
  });
  assert.equal(cursor, 84);
  assert.deepEqual(plain.slice(0, 5), [24, 9, 18, 9, 23]);
  return plain;
}

const original56 = corpus.pages[56].indices;
const original57 = corpus.pages[57].indices;
assert.equal(original56.length, 85);
assert.equal(original57.length, 95);
const plaintext56 = decryptP56(original56);
const literal57 = original57;

const checks = [
  {name: 'p56 decrypted', positions: plaintext56, expectedE: 16},
  {name: 'p57 clear', positions: literal57, expectedE: 15},
  {name: 'p56 decrypted + p57 clear', positions: [...plaintext56, ...literal57], expectedE: 31},
  {name: 'p56 printed cipher + p57 clear', positions: [...original56, ...literal57], expectedE: 17}
];

const e = corpus.translit.indexOf('E');
assert.equal(e, 18);

for (const item of checks) {
  const h = histogram(item.positions);
  assert.equal(h[e], item.expectedE);
  assert(h.some((count, position) => position !== e && count > 0),
    'The sequence must contain another rune, so the polynomial cannot be constant.');
  const maximum = Math.max(...h);
  console.log(JSON.stringify({
    register: item.name,
    length: item.positions.length,
    E: h[e],
    maxMultiplicity: maximum,
    minimumNonconstantPolynomialDegree: maximum,
    degree15DirectEvaluationPossible: maximum <= 15
  }));
}

// A nonconstant polynomial of degree d over a field has at most d distinct
// roots. If it takes the same value at m distinct evaluation points, the
// polynomial minus that value has m distinct roots, so d >= m.
//
// This bound is invariant to:
//   * choice of field and characteristic,
//   * any permutation of distinct evaluation points,
//   * any injective and position-independent GP29 -> field embedding.
//
// Source p15's 4x4 = 16 visible numeric cells could supply at most 16
// coefficients of one conventional degree-at-most-15 polynomial.
// Both genuine 180-symbol registers violate the bound before examining p55.
assert(histogram([...plaintext56, ...literal57])[e] > 15);
assert(histogram([...original56, ...literal57])[e] > 15);

console.log('PASS: p55-unseen field-independent degree-15 polynomial exclusion; genuine solved p56/p57 and all 180 known positions preserved.');

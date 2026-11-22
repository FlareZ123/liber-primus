'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

/**
 * @param {number} count
 * @returns {number[]}
 */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

/**
 * Validate the literal-F rule for a reversed prime-totient key schedule.
 * sign=-1 is retrograde (same subtraction sign); sign=+1 is the
 * retrograde-inversion candidate (reversed schedule, inverted sign).
 *
 * We enumerate every possible total number of consumed prime keys consistent
 * with the number of ciphertext F runes. A ciphertext F may bypass and consume
 * no key, or may be an ordinary encrypted non-F rune. A non-F ciphertext rune
 * may never decrypt to plaintext F, because authentic p56 writes plaintext F
 * literally and skips the prime clock.
 *
 * @param {number[]} ciphertext
 * @param {-1|1} sign
 * @returns {{consumed:number,bypasses:number,firstEmpty:number|null,valid:boolean}[]}
 */
function reverseScheduleGate(ciphertext, sign) {
  const ciphertextF = ciphertext.filter((value) => value === 0).length;
  const rows = [];

  for (let consumed = ciphertext.length - ciphertextF;
    consumed <= ciphertext.length; consumed++) {
    const keys = firstPrimes(consumed)
      .map((prime) => (prime - 1) % 29)
      .reverse();
    let states = new Set([0]);
    let firstEmpty = null;

    for (let offset = 0; offset < ciphertext.length; offset++) {
      const next = new Set();
      for (const keyIndex of states) {
        if (ciphertext[offset] === 0) next.add(keyIndex);
        if (keyIndex < keys.length) {
          const plain = (ciphertext[offset] + sign * keys[keyIndex] + 290) % 29;
          if (plain !== 0) next.add(keyIndex + 1);
        }
      }
      states = next;
      if (states.size === 0) {
        firstEmpty = offset;
        break;
      }
    }

    rows.push({
      consumed,
      bypasses: ciphertext.length - consumed,
      firstEmpty,
      valid: firstEmpty === null && states.has(consumed),
    });
  }
  return rows;
}

/**
 * Decode authentic p56 as the positive control.
 * @returns {number[]}
 */
function decodeP56() {
  const ciphertext = corpus.pages.find((page) => page.page === 56).indices;
  const primes = firstPrimes(84);
  let keyIndex = 0;
  const plain = ciphertext.map((rune, offset) => {
    if (offset === 56) return 0;
    const value = (rune - (primes[keyIndex++] - 1) % 29 + 29) % 29;
    assert.notEqual(value, 0);
    return value;
  });
  assert.equal(keyIndex, 84);
  return plain;
}

const p56Plain = decodeP56();
const translit = (values) => values.map((value) => corpus.translit[value]).join('');
assert.equal(
  translit(p56Plain),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE'
);

// Native five-dot source geometry already establishes, relative to p23:
// p23 = prime, p7 = inversion, p56 = retrograde-inversion.
// Therefore relative to solved p56: p7 = retrograde, p23 = retrograde-inversion.
// The p23 vertical-rank contour is 3-1-5-2-4; its standard transforms are:
const contour = [3, 1, 5, 2, 4];
assert.deepEqual(contour.slice().reverse(), [4, 2, 5, 1, 3]);
assert.deepEqual(contour.map((rank) => 6 - rank), [3, 5, 1, 4, 2]);
assert.deepEqual(contour.map((rank) => 6 - rank).reverse(), [2, 4, 1, 5, 3]);

const candidates = [
  { page: 7, operation: 'retrograde', sign: -1 },
  { page: 23, operation: 'retrograde-inversion', sign: 1 },
].map(({ page, operation, sign }) => {
  const ciphertext = corpus.pages.find((entry) => entry.page === page).indices;
  const rows = reverseScheduleGate(ciphertext, sign);
  assert.equal(rows.some((row) => row.valid), false);
  return {
    page,
    operation,
    runes: ciphertext.length,
    ciphertextF: ciphertext.filter((value) => value === 0).length,
    rows,
  };
});

assert.deepEqual(candidates[0].rows, [
  { consumed: 207, bypasses: 1, firstEmpty: 81, valid: false },
  { consumed: 208, bypasses: 0, firstEmpty: 67, valid: false },
]);
assert.deepEqual(candidates[1].rows, [
  { consumed: 206, bypasses: 7, firstEmpty: 24, valid: false },
  { consumed: 207, bypasses: 6, firstEmpty: 36, valid: false },
  { consumed: 208, bypasses: 5, firstEmpty: 26, valid: false },
  { consumed: 209, bypasses: 4, firstEmpty: 88, valid: false },
  { consumed: 210, bypasses: 3, firstEmpty: 94, valid: false },
  { consumed: 211, bypasses: 2, firstEmpty: 9, valid: false },
  { consumed: 212, bypasses: 1, firstEmpty: 29, valid: false },
  { consumed: 213, bypasses: 0, firstEmpty: 70, valid: false },
]);

console.log(JSON.stringify({
  positiveControl: {
    page: 56,
    plaintextRecovered: true,
    consumedPrimeKeys: 84,
    literalFBypassOffset: 56,
  },
  sourceGeometry: {
    p23Contour: contour,
    relativeToP23: { p23: 'prime', p7: 'inversion', p56: 'retrograde-inversion' },
    relativeToP56: { p7: 'retrograde', p23: 'retrograde-inversion' },
  },
  candidates,
  decision: 'Both music-symmetry-selected reversed prime-totient consumers violate the authentic p56 literal-F rule under every possible skip count.',
}, null, 2));

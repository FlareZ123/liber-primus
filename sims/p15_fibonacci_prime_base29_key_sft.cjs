#!/usr/bin/env node
'use strict';

// Bounded test of one source-motivated p15 key derivation:
// recover the 16 Fibonacci-indexed primes around 3301 from the p15 spiral,
// encode each with the signed 2013 BASE29 operation, then use the numeric
// BASE29 digits as a repeating GP29 additive key. The last step (numeric
// BASE29 digits -> GP29 shifts, and Vigenere use) is explicitly a hypothesis,
// not an authenticated instruction.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');

const BASE29_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRS';
const ANCHOR = 3301;
const GRID_OFFSETS_IN_SPIRAL_ORDER = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const PRIME_ORDINALS = [
  1, 2, 3, 4, 6, 9, 14, 22, 35, 56, 90, 145, 234, 378, 611, 988
];
const FIBONACCI_VALUES = [
  1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987
];

function base29Digits(value) {
  assert(Number.isSafeInteger(value) && value >= 0);
  const digits = [];
  do {
    digits.push(value % 29);
    value = Math.floor(value / 29);
  } while (value > 0);
  return digits.reverse();
}
function base29String(value) {
  return base29Digits(value).map(d => BASE29_ALPHABET[d]).join('');
}
function primesThrough(limit) {
  const sieve = new Uint8Array(limit + 1);
  sieve.fill(1);
  sieve[0] = 0;
  sieve[1] = 0;
  for (let p = 2; p * p <= limit; p++) {
    if (!sieve[p]) continue;
    for (let n = p * p; n <= limit; n += p) sieve[n] = 0;
  }
  return Array.from({ length: limit - 1 }, (_, i) => i + 2).filter(p => sieve[p]);
}
function ioc(xs) {
  const counts = new Uint32Array(29);
  for (const x of xs) counts[x]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (xs.length * (xs.length - 1));
}
function transform(input, key, sign, skipF) {
  let consumed = 0;
  const output = input.map(value => {
    if (skipF && value === 0) return 0;
    const shifted = (value + sign * key[consumed % key.length]) % 29;
    consumed++;
    return (shifted + 29) % 29;
  });
  return { output, consumed };
}

function run() {
  assert.equal(BASE29_ALPHABET.length, 29);
  assert.equal(base29String(1033), '16I');
  assert.equal(base29String(3301), '3QO');

  const primeValues = GRID_OFFSETS_IN_SPIRAL_ORDER.map(offset =>
    offset <= ANCHOR ? ANCHOR - offset : ANCHOR + offset);
  const allPrimes = primesThrough(Math.max(...primeValues));
  const ordinal = new Map(allPrimes.map((prime, i) => [prime, i + 1]));
  assert.deepEqual(primeValues, [
    2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829,
    1481, 2593, 4507, 7817
  ]);
  assert.deepEqual(primeValues.map(p => ordinal.get(p)), PRIME_ORDINALS);
  assert.deepEqual(PRIME_ORDINALS.slice(1), FIBONACCI_VALUES.slice(1).map(f => f + 1));

  const key = primeValues.flatMap(base29Digits);
  const signedBase29Key = primeValues.map(base29String).join('');
  assert.equal(key.length, 30);
  assert.equal(signedBase29Key, '2357DN1E2L5492FSH1M23CM5AK98G');

  const cipher = corpus.pages.slice(0, 56).flatMap(page => page.indices);
  assert.equal(cipher.length, 12956);
  const referenceText = fs.readFileSync(
    path.join(__dirname, '../resources/control/emerson_essays_2944.txt'), 'utf8');
  const model = trainNativeGP(referenceText, corpus.translit);

  // Arithmetic positive control: the same key schedule must invert a planted
  // stream exactly, both with and without the literal-F skip convention.
  const positiveControls = [false, true].map(skipF => {
    // Use a planted stream that never maps a non-F symbol to F. For the
    // skip-F case, insert explicit F nulls and keep the key clock aligned.
    let consumed = 0;
    const planted = Array.from({ length: 4096 }, (_, i) => {
      if (skipF && i % 13 === 0) return 0;
      const value = (6 - key[consumed % key.length] + 29) % 29;
      consumed++;
      return value;
    });
    const encrypted = transform(planted, key, 1, skipF).output;
    const recovered = transform(encrypted, key, -1, skipF).output;
    assert.deepEqual(recovered, planted);
    return {
      skipF,
      exactRoundTrip: true,
      plantedLiteralFCount: planted.filter(value => value === 0).length
    };
  });

  const variants = [];
  for (const skipF of [false, true]) {
    for (const sign of [-1, 1]) {
      const result = transform(cipher, key, sign, skipF);
      variants.push({
        sign,
        skipF,
        keyLength: key.length,
        keySymbolsConsumed: result.consumed,
        outputRunes: result.output.length,
        ioc: ioc(result.output),
        emersonGpLanguageScore: languageScore(result.output, model),
        first240: result.output.slice(0, 240).map(i => corpus.translit[i]).join('')
      });
    }
  }

  return {
    hypothesis: 'p15 Fibonacci-indexed primes around 3301 -> signed BASE29 digits -> repeating GP29 additive key',
    sourceFacts: {
      p15Anchor: ANCHOR,
      p15SpiralOffsets: GRID_OFFSETS_IN_SPIRAL_ORDER,
      recoveredPrimeValues: primeValues,
      primeOrdinals: PRIME_ORDINALS,
      fibonacciValues: FIBONACCI_VALUES,
      signedBase29Vectors: { '1033': base29String(1033), '3301': base29String(3301) },
      signedBase29Key: signedBase29Key,
      numericKeyDigits: key
    },
    additionalAssumptions: [
      'The 2013 signed BASE29 numeric digits are reused as GP29 modular shift values; the signed output alphabet itself is alphanumeric, not Gematria Primus.',
      'The 30 digits are concatenated in p15 spiral order and repeated continuously across LP2.',
      'The operation is additive Vigenere; neither this cipher operation nor the GP29-shift interpretation is source-authenticated.'
    ],
    corpus: { physicalPages: 56, runes: cipher.length, rawIoc: ioc(cipher), rawEmersonGpLanguageScore: languageScore(cipher, model) },
    positiveControls,
    variants
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run, base29Digits, base29String, transform };

'use strict';

/**
 * Historical 2014 p55 23-rune plaintext guesses as a concrete known-plaintext
 * cryptanalysis of two source-motivated finite GF(29) keystream families.
 *
 * No original unknown plaintext is assumed to be real. The 2014 guesses are
 * conditional and source-authored by community participants, not Cicada.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const mod = (a) => ((a % 29) + 29) % 29;
const symbols = data.translit;
const tokens = symbols.slice().sort((a, b) => b.length - a.length);

/**
 * @param {string} phrase Native GP29 orthography phrase from historical source.
 * @returns {number[]} Plaintext rune indices, retaining original GP token splits.
 */
function encode(phrase) {
  const result = [];
  for (const word of phrase.toUpperCase().split(/\s+/)) {
    for (let i = 0; i < word.length;) {
      const tok = word.startsWith('ING', i) ? 'ING'
        : word.startsWith('IO', i) ? 'IO'
        : tokens.find((x) => word.startsWith(x, i));
      assert.ok(tok, 'Unknown GP rune in ' + word.slice(i));
      result.push(symbols.indexOf(tok));
      i += tok.length;
    }
  }
  return result;
}

/** @param {number} a Nonzero GF29 element. @returns {number} Multiplicative inverse. */
function inverse(a) {
  assert.ok(a > 0 && a < 29);
  let n = 27;
  let x = 1;
  while (n) {
    if (n & 1) x = mod(x * a);
    a = mod(a * a);
    n >>>= 1;
  }
  return x;
}

/**
 * @param {number[]} observations Fixed observed key-prefix over GF(29).
 * @returns {{ L: number, connection: number[] }} Minimal linear recurrence.
 */
function berlekampMassey(observations) {
  let C = [1];
  let B = [1];
  let L = 0;
  let m = 1;
  let b = 1;
  for (let n = 0; n < observations.length; n++) {
    let d = observations[n];
    for (let i = 1; i <= L; i++) {
      d = mod(d + (C[i] || 0) * observations[n - i]);
    }
    if (!d) {
      m++;
      continue;
    }
    const prior = C.slice();
    const factor = mod(d * inverse(b));
    while (C.length < m + B.length) C.push(0);
    for (let i = 0; i < B.length; i++) {
      C[m + i] = mod(C[m + i] - factor * B[i]);
    }
    if (2 * L <= n) {
      L = n + 1 - L;
      B = prior;
      b = d;
      m = 1;
    } else {
      m++;
    }
  }
  return { L, connection: C.slice(0, L + 1) };
}

/**
 * @param {number[]} initial Known key-prefix.
 * @param {{L:number,connection:number[]}} model Connection polynomial.
 * @param {number} target Key length.
 * @returns {number[]} Unique continuation dictated by this recurrence.
 */
function extrapolate(initial, model, target) {
  const output = initial.slice();
  assert.ok(output.length >= model.L);
  while (output.length < target) {
    const i = output.length;
    let digit = 0;
    for (let j = 1; j <= model.L; j++) {
      digit -= model.connection[j] * output[i - j];
    }
    output.push(mod(digit));
  }
  return output;
}

/** @param {number[]} key Known GP29 key fragment. @returns {number|null} */
function smallestPeriodAtMost16(key) {
  for (let period = 1; period <= 16; period++) {
    if (key.every((v, i) => i < period || v === key[i - period])) {
      return period;
    }
  }
  return null;
}

// Image-original p55: first rune of page is continuation from p54.
// Its zero-based words 7-9 occupy original local rune offsets 23..45.
const originalPage = data.pages[55].indices;
assert.equal(originalPage.length, 76);
const originalCipher = originalPage.slice(23, 46);
const firstPredecessor = originalPage[22];
assert.deepEqual(originalCipher.slice(0, 5), [17, 28, 0, 14, 10]);
assert.equal(originalCipher.length, 23);

const originalCases = [];
for (const phrase of [
  'ENLIGHTENMENT AWAITS THOSE',
  'MULTIBRANCHED AWAITS THOSE'
]) {
  const plain = encode(phrase);
  assert.equal(plain.length, 23);
  const keyTypes = [
    ['direct additive', plain.map((p, i) => mod(originalCipher[i] - p))],
    ['ciphertext difference additive', plain.map((p, i) =>
      mod(originalCipher[i] - (i ? originalCipher[i - 1] : firstPredecessor) - p))]
  ];
  for (const [kind, key] of keyTypes) {
    const minimal = berlekampMassey(key);
    const firstWord = berlekampMassey(key.slice(0, 13));
    const period = smallestPeriodAtMost16(key);
    assert.equal(firstWord.L, 7);
    assert.equal(minimal.L, 12);
    assert.equal(period, null);
    originalCases.push({ phrase, kind, first13Order: firstWord.L,
      total23Order: minimal.L, periodicKeyPeriodAtMost16: period });
  }
}

// Actual solved native GP p57 provides an independent 76-rune positive.
// Use a defined fifth-order linear key and recover the 53 held-out runes
// using only the first 23 known-plaintext positions.
const known = data.pages[57].indices.slice(0, 76);
assert.equal(known.length, 76);
const seed = [2, 3, 5, 7, 11];
const coefficients = [1, 3, 4, 2, 8];
const fullKey = seed.slice();
for (let i = 5; i < 76; i++) {
  let value = 0;
  for (let j = 1; j <= 5; j++) {
    value += coefficients[j - 1] * fullKey[i - j];
  }
  fullKey.push(mod(value));
}

const plants = [];
for (const mode of ['direct additive', 'ciphertext difference additive']) {
  const differential = mode === 'ciphertext difference additive';
  const cipher = [];
  for (let i = 0; i < known.length; i++) {
    cipher.push(mod(known[i] + fullKey[i]
      + (differential ? (i ? cipher[i - 1] : 0) : 0)));
  }
  const recoveredKey = known.slice(0, 23).map((p, i) =>
    mod(cipher[i] - p - (differential ? (i ? cipher[i - 1] : 0) : 0))
  );
  const model = berlekampMassey(recoveredKey);
  assert.equal(model.L, 5);
  const predictedKey = extrapolate(recoveredKey, model, 76);
  assert.deepEqual(predictedKey, fullKey);
  const deciphered = cipher.map((c, i) =>
    mod(c - predictedKey[i] - (differential ? (i ? cipher[i - 1] : 0) : 0))
  );
  assert.deepEqual(deciphered, known);
  plants.push({ mode, discoveredOrder: model.L, heldOutPlaintextRecovered: '53/53' });
}

console.log(JSON.stringify({
  originalInput: { page: 55, firstRuneOffset: 23, guessedKnownRunes: 23 },
  interpretation: 'All four historical-crib/stream relations have minimal linear complexity 12; none repeats with any period <=16. No original plaintext recovered.',
  originalCases,
  plantedNativeControl: plants
}, null, 2));

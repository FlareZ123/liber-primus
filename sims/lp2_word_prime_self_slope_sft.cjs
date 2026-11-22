'use strict';

/**
 * Original-input SFT: secret self-keyed word-slope GP29 cipher.
 *
 * Run: node sims/lp2_word_prime_self_slope_sft.cjs
 *
 * Source premise: authentic GP prime values measure each word's "number";
 * hypothesized GP29 Caesar direction equals the affine reduction of that
 * plaintext-word prime sum. Every cipher word must have at least one
 * internally consistent decoding key, regardless of whether the plaintext
 * is English. We exhaust every global affine reduction and every phase.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const text = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);

const alphabet = data.runes;
const primes = data.prime;
assert.equal(alphabet.length, 29);
assert.equal(primes.length, 29);

/**
 * Preserve words carried across page and line breaks. The derivative
 * transcription has 57 rune-bearing page records: 0..49, 51..57.
 * The first 55 records are exactly the unknown LP2 physical pp0..55.
 * '-' and '.' delimit complete printed words. The special transcription
 * marks %, &, $, § and slash-newline do not separate words.
 *
 * @param {string} source
 * @returns {number[][]}
 */
function parseWords(source) {
  const merged = source
    .replace(/\/\r?\n/g, '')
    .replace(/[\r\n%&$§/]/g, '');
  return merged.split(/[.-]/)
    .map(w => Array.from(w)
      .map(ch => alphabet.indexOf(ch))
      .filter(i => i >= 0))
    .filter(w => w.length > 0);
}

const records = text.split(/\r?\n%\r?\n/);
assert.equal(records.length, 57);
const unknown = parseWords(records.slice(0, 55).join(''));
const p0 = parseWords(records[0]);
const p57 = parseWords(records[56]);

assert.equal(unknown.length, 2896);
assert.equal(unknown.reduce((sum, w) => sum + w.length, 0), 12956);
assert.equal(p0.reduce((sum, w) => sum + w.length, 0), 262);
assert.equal(p57.reduce((sum, w) => sum + w.length, 0), 95);

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/**
 * Test all 29 possible slope keys under the equation
 *   k = a * sum(GPprime[p_i]) + b (mod 29)
 *   c_i = p_i + direction * (i+phase) * k (mod29).
 *
 * @param {number[]} cipher
 * @param {number} a
 * @param {number} b
 * @param {number} phase
 * @param {number} direction
 * @returns {Array<{key:number, plaintext:number[]}>}
 */
function possiblePlaintexts(cipher, a, b, phase, direction) {
  const options = [];
  for (let key = 0; key < 29; key++) {
    const plaintext = cipher.map(
      (c, i) => mod29(c - direction * (i + phase) * key)
    );
    const sum = plaintext.reduce((acc, p) => acc + primes[p], 0);
    if (mod29(a * sum + b) === key) {
      options.push({key, plaintext});
    }
  }
  return options;
}

/**
 * @param {number[]} plain
 * @param {number} a
 * @param {number} b
 * @param {number} phase
 * @param {number} direction
 * @returns {number[]}
 */
function encodeWord(plain, a, b, phase, direction) {
  const sum = plain.reduce((acc, p) => acc + primes[p], 0);
  const key = mod29(a * sum + b);
  return plain.map((p, i) => mod29(
    p + direction * (i + phase) * key
  ));
}

// Authentic solved p57 positive control, preserving its original word breaks.
const plantedParameters = {a: 13, b: 7, phase: 17, direction: 1};
let plantedRunes = 0;
for (const original of p57) {
  const cipher = encodeWord(original, plantedParameters.a,
    plantedParameters.b, plantedParameters.phase,
    plantedParameters.direction);
  const candidates = possiblePlaintexts(cipher, plantedParameters.a,
    plantedParameters.b, plantedParameters.phase,
    plantedParameters.direction);
  assert(candidates.some(c =>
    c.plaintext.length === original.length
    && c.plaintext.every((p, i) => p === original[i])
  ));
  plantedRunes += original.length;
}
assert.equal(plantedRunes, 95);
console.log('PASS source-native solved p57 plant: 95/95 plaintext runes');

const summary = [];
// Every nonzero a is an invertible secret multiplier mod29.
// Every b and phase is tested, with both slope directions.
for (const direction of [-1, 1]) {
  for (let phase = 0; phase < 29; phase++) {
    let bestPrefix = 0;
    let survivingFullP0 = 0;
    let bestA = null;
    let bestB = null;
    for (let a = 1; a < 29; a++) {
      for (let b = 0; b < 29; b++) {
        let prefix = 0;
        while (prefix < p0.length &&
          possiblePlaintexts(p0[prefix], a, b, phase, direction).length > 0) {
          prefix++;
        }
        if (prefix > bestPrefix) {
          bestPrefix = prefix;
          bestA = a;
          bestB = b;
        }
        if (prefix === p0.length) survivingFullP0++;
      }
    }
    assert.equal(survivingFullP0, 0);
    assert(bestPrefix <= 26);
    summary.push({phase, direction, bestPrefix, bestA, bestB});
  }
}
assert.equal(summary.length, 58);
assert.equal(summary.reduce((sum, s) =>
  sum + (s.bestPrefix === p0.length ? 1 : 0), 0), 0);
console.log('PASS 58 phase/direction families x 812 nonzero-a key pairs');
console.log('Every key rejected within 27 complete words of physical p0');
const highest = summary.reduce(
  (best, item) => item.bestPrefix > best.bestPrefix ? item : best
);
console.log('Latest initial-word contradiction:', highest);
for (const direction of [-1, 1]) {
  for (const phase of [0, 1]) {
    let noKeyWords = 0;
    let uniqueKeyWords = 0;
    let anyKeyWords = 0;
    for (const cipherWord of unknown) {
      const n = possiblePlaintexts(cipherWord, 1, 0, phase, direction).length;
      if (n === 0) noKeyWords++;
      if (n === 1) uniqueKeyWords++;
      if (n >= 1) anyKeyWords++;
    }
    console.log('Fixed k=sum(primes) original:',
      {direction, phase, noKeyWords, uniqueKeyWords, anyKeyWords});
    assert(noKeyWords >= 900);
  }
}
console.log('PASS: original ciphertext has no direct prime-sum self-slope inverse');

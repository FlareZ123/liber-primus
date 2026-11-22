#!/usr/bin/env node
'use strict';

// Bounded p55 receiver test: use the candidate DH scalar K=73 as a
// starting point for the already solved p56 prime-totient GP29 cipher.
// Run from the repository root:
//   node sims/lp2_p55_dh73_prime_totient_start_sft.cjs
// This is a falsification test, not a proposed general key search.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p55 = corpus.pages.find((page) => page.page === 55).indices;

function parseSegment(segment) {
  const indices = [];
  const words = [];
  let word = [];
  for (const character of segment) {
    if (runeIndex.has(character)) {
      const value = runeIndex.get(character);
      indices.push(value);
      word.push(value);
    } else if (character === '/' || /\s/u.test(character)) {
      // Original line wraps do not end a word.
    } else if (word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return { indices, words };
}
const pageMatches = transcription.split('%').map(parseSegment)
  .filter((segment) => segment.indices.length === p55.length &&
    segment.indices.every((value, index) => value === p55[index]));
assert.equal(pageMatches.length, 1, 'Find the exact original p55 page segment');
const { indices: cipher, words } = pageMatches[0];
const wordLengths = words.map((word) => word.length);
assert.equal(cipher.length, 76);
assert.deepEqual(wordLengths, [
  1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3
]);
assert.equal(corpus.translit[cipher[0]], 'NG',
  'The first p55 rune is a one-rune carry from p54');
const cipherFPositions = cipher.map((value, index) => value === 0 ? index : -1)
  .filter((index) => index >= 0);
assert.deepEqual(cipherFPositions, [15, 25, 41]);

const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) return false;
  }
  return true;
}
function primesFrom(start, count) {
  assert(isPrime(start), 'Prime stream must begin at a prime');
  const primes = [];
  for (let candidate = start; primes.length < count; candidate++) {
    if (isPrime(candidate)) primes.push(candidate);
  }
  return primes;
}
function nthPrime(ordinal) {
  let count = 0;
  for (let candidate = 2; ; candidate++) {
    if (isPrime(candidate) && ++count === ordinal) return candidate;
  }
}
function decodeWithMask(input, primes, mask) {
  const fPositions = input.map((value, index) => value === 0 ? index : -1)
    .filter((index) => index >= 0);
  let clock = 0;
  const plaintext = [];
  for (let index = 0; index < input.length; index++) {
    const fOrdinal = fPositions.indexOf(index);
    if (fOrdinal >= 0 && (mask & (1 << fOrdinal))) {
      plaintext.push(0); // literal F: transparent and does not consume a prime
      continue;
    }
    if (clock >= primes.length) return null;
    const value = mod(input[index] - (primes[clock] - 1), 29);
    clock++;
    if (value === 0) return null; // encrypted plaintext F is forbidden
    plaintext.push(value);
  }
  return { plaintext, consumedPrimes: clock };
}
function renderWords(indices, lengths) {
  const output = [];
  let offset = 0;
  for (const length of lengths) {
    output.push(indices.slice(offset, offset + length)
      .map((value) => corpus.translit[value]).join(''));
    offset += length;
  }
  assert.equal(offset, indices.length);
  return output.join(' ');
}
function allLegalMasks(input, primes, lengths) {
  const fCount = input.filter((value) => value === 0).length;
  const candidates = [];
  for (let mask = 0; mask < (1 << fCount); mask++) {
    const decoded = decodeWithMask(input, primes, mask);
    if (decoded) {
      candidates.push({
        mask,
        consumedPrimes: decoded.consumedPrimes,
        text: renderWords(decoded.plaintext, lengths),
        compact: decoded.plaintext.map((value) => corpus.translit[value]).join('')
      });
    }
  }
  return candidates;
}

// Native positive control: reproduce the solved p56 page with its established
// first-prime start and literal-F mask (the transparent F is at offset 56).
function toGpRunes(phrase) {
  const tokens = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const compact = phrase.replace(/[^A-Z]/g, '');
  const output = [];
  for (let offset = 0; offset < compact.length;) {
    const match = tokens.find(({ token }) => compact.startsWith(token, offset));
    assert(match, 'No GP spelling for ' + compact.slice(offset));
    output.push(match.index);
    offset += match.token.length;
  }
  return output;
}
const p56Cipher = corpus.pages.find((page) => page.page === 56).indices;
const p56FPositions = p56Cipher.map((value, index) => value === 0 ? index : -1)
  .filter((index) => index >= 0);
assert.deepEqual(p56FPositions, [35, 47, 51, 56, 74]);
const expectedP56 = toGpRunes(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT ' +
  'IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
);
const p56Positive = decodeWithMask(p56Cipher, primesFrom(2, 100), 8);
assert(p56Positive);
assert.deepEqual(p56Positive.plaintext, expectedP56);
assert.equal(expectedP56.length, 85);

// K=73 has two natural prime-stream readings: prime 73 itself or the 73rd
// prime (367). Test each on the full page and on the complete-word suffix.
const startSpecs = [
  { name: 'prime-value-73', start: 73 },
  { name: '73rd-prime', start: nthPrime(73) }
];
const results = [];
for (const startSpec of startSpecs) {
  const primes = primesFrom(startSpec.start, 120);
  for (const excludeCarry of [false, true]) {
    const input = excludeCarry ? cipher.slice(1) : cipher;
    const lengths = excludeCarry ? wordLengths.slice(1) : wordLengths;
    const candidates = allLegalMasks(input, primes, lengths);
    results.push({
      start: startSpec.name,
      firstPrime: startSpec.start,
      excludedLeadingCarry: excludeCarry,
      runeCount: input.length,
      wordLengths: lengths,
      ciphertextFPositions: input.map((value, index) => value === 0 ? index : -1)
        .filter((index) => index >= 0),
      legalMaskCount: candidates.length,
      candidates
    });
  }
}
const find = (start, excludeCarry) => results.find((result) =>
  result.start === start && result.excludedLeadingCarry === excludeCarry);
assert.equal(find('prime-value-73', false).legalMaskCount, 0);
assert.equal(find('prime-value-73', true).legalMaskCount, 0);
assert.equal(find('73rd-prime', false).legalMaskCount, 1);
assert.equal(find('73rd-prime', true).legalMaskCount, 3);

console.log(JSON.stringify({
  source: {
    p55Runes: 76,
    p55WordLengths: wordLengths,
    leadingCarry: 'NG',
    p55CiphertextFPositions: cipherFPositions
  },
  receiverHypothesis: {
    sourceScalar: 73,
    operation: 'p56 inverse: subtract phi(prime) mod29; literal F is transparent',
    primeStartReadings: startSpecs,
    noOtherStartsSignsOrOffsetsSearched: true
  },
  p56NativePositiveControl: {
    result: 'PASS',
    runeCount: p56Positive.plaintext.length,
    literalFMask: 8
  },
  p55Results: results,
  conclusion: 'No readable p55 plaintext under either direct K73 prime-start reading.'
}, null, 2));

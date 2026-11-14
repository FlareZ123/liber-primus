#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const mod29 = (value) => ((value % 29) + 29) % 29;

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const primeEcho = read('resources/historical/cicada2013-os-original-prime-echo.sh');
const primes = [...primeEcho.matchAll(/echo\s*(?:-n\s*)?"(\d+)\t";\s*sleep/g)]
  .map((match) => Number(match[1]));
assert.equal(primes.length, 464);
assert.equal(primes[173], 1033);
assert.equal(primes[174], 1039);
assert.equal(primes[463], 3301);

assert.match(reference, /THE TOTIENT FUNCTION IS SACRED\s+ALL THINGS SHOULD BE ENCRYPTED/);

const sortedTokens = corpus.translit
  .map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

function encodeSourceNativeGP(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const result = [];
  for (let offset = 0; offset < normalized.length;) {
    const match = sortedTokens.find(({ token }) => normalized.startsWith(token, offset));
    assert.ok(match, 'source-native phrase must encode in GP');
    result.push(match.index);
    offset += match.token.length;
  }
  return result;
}

const phrase = 'THE TOTIENT FUNCTION IS SACRED ALL THINGS';
const phraseWords = phrase.split(' ');
const plain = phraseWords.flatMap(encodeSourceNativeGP);
const p55 = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(p55.length, 76);
const cipher = p55.slice(46);
assert.equal(cipher.length, 30);
assert.deepEqual(phraseWords.map((word) => encodeSourceNativeGP(word).length),
  [2, 7, 7, 2, 6, 3, 3]);
assert.equal(plain.length, 30);

const plainFPositions = plain.flatMap((rune, index) => rune === 0 ? [index] : []);
const cipherFPositions = cipher.flatMap((rune, index) => rune === 0 ? [index] : []);
assert.deepEqual(plainFPositions, [9]);
assert.deepEqual(cipherFPositions, []);

const requiredSubtractivePad = cipher.map((cipherRune, index) =>
  mod29(cipherRune - plain[index]));

function scanAllRotations(block) {
  let bestMatches = -1;
  let bestStarts = [];
  const exactMatches = [];
  for (let start = 0; start < block.length; start++) {
    let matches = 0;
    for (let offset = 0; offset < requiredSubtractivePad.length; offset++) {
      const keyShift = mod29(block[(start + offset) % block.length] - 1);
      if (keyShift === requiredSubtractivePad[offset]) matches++;
    }
    if (matches > bestMatches) {
      bestMatches = matches;
      bestStarts = [start];
    } else if (matches === bestMatches) {
      bestStarts.push(start);
    }
    if (matches === requiredSubtractivePad.length) {
      exactMatches.push({
        start,
        firstPrime: block[start],
        lastPrime: block[(start + 29) % block.length]
      });
    }
  }
  return {
    period: block.length,
    phasesTested: block.length,
    exactMatches,
    bestMatches,
    bestStarts: bestStarts.map((start) => ({
      start,
      firstPrime: block[start],
      lastPrime: block[(start + 29) % block.length],
      matches: bestMatches
    }))
  };
}

const full464 = scanAllRotations(primes);
const first174 = scanAllRotations(primes.slice(0, 174));
const tail290 = scanAllRotations(primes.slice(174));
assert.deepEqual(full464, {
  period: 464, phasesTested: 464, exactMatches: [], bestMatches: 5,
  bestStarts: [
    { start: 44, firstPrime: 197, lastPrime: 373, matches: 5 },
    { start: 71, firstPrime: 359, lastPrime: 547, matches: 5 },
    { start: 264, firstPrime: 1697, lastPrime: 1931, matches: 5 }
  ]
});
assert.deepEqual(first174, {
  period: 174, phasesTested: 174, exactMatches: [], bestMatches: 5,
  bestStarts: [
    { start: 44, firstPrime: 197, lastPrime: 373, matches: 5 },
    { start: 71, firstPrime: 359, lastPrime: 547, matches: 5 }
  ]
});
assert.deepEqual(tail290, {
  period: 290, phasesTested: 290, exactMatches: [], bestMatches: 5,
  bestStarts: [
    { start: 90, firstPrime: 1697, lastPrime: 1931, matches: 5 }
  ]
});

console.log(JSON.stringify({
  source: {
    primeCount: primes.length,
    firstBlock: { length: 174, first: primes[0], last: primes[173] },
    secondBlock: { length: 290, first: primes[174], last: primes[463] }
  },
  provisionalCrib: {
    phrase,
    gpRunes: plain.map((index) => corpus.translit[index]).join(''),
    wordLengths: phraseWords.map((word) => encodeSourceNativeGP(word).length),
    runeCount: plain.length,
    plaintextFPositions: plainFPositions,
    ciphertextFPositions: cipherFPositions
  },
  p55CipherSuffix: {
    localStart: 46,
    gpRunes: cipher.map((index) => corpus.translit[index]).join(''),
    indices: cipher
  },
  requiredSubtractivePad: {
    definition: 'C - P modulo 29',
    indices: requiredSubtractivePad,
    gpRunes: requiredSubtractivePad.map((index) => corpus.translit[index]).join('')
  },
  primeTotientWindowSearch: {
    key: 'phi(p) = p - 1 modulo 29',
    sign: 'subtractive Vigenere; no plaintext-F bypass',
    rotationsTested: full464.phasesTested + first174.phasesTested + tail290.phasesTested,
    full464,
    first174,
    tail290
  },
  conclusion: 'No cyclic rotation of the full 464-prime stream, first 174-prime block, or final 290-prime block supplies the required 30-rune subtractive key. The provisional crib is not established or disproved by this key-family test.'
}, null, 2));

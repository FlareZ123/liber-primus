#!/usr/bin/env node
'use strict';

/**
 * LP2 printed-word checksum capacity gate, exact original-input SFT.
 *
 * Motivated by Cicada's signed 2016 "words ... numbers" wording and the
 * independently observed extra-rune word-length hypothesis. Tests a literal
 * same-word checksum symbol, which may be inserted at ANY position. It does
 * not assume a decryption key, a word position, an English dictionary, or a
 * source-unsupported cipher phase.
 *
 * Conditions:
 *   index checksum: c[k] = sum_{j!=k} c[j]                 mod 29
 *   prime checksum: GPprime(c[k]) = sum_{j!=k} GPprime(c[j]) mod 29
 * The all-position tests are exactly equivalent to 2*c[k]=sum(all) and
 * 2*GPprime(c[k])=sum(GPprime(all)). If no index is eligible, no such
 * checksum could be removed while retaining the other published runes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw = read('resources/liber-primus/lp2-transcription.txt');
const indices = new Map(corpus.runes.map((rune, i) => [rune, i]));
const words = raw.split('%').slice(0, 55).join('%')
  .replace(/[\r\n\t\/% ]/gu, '')
  .split(/[-.&$§0-9]+/u).filter(Boolean)
  .map((word) => [...word].map((rune) => {
    const id = indices.get(rune);
    assert.notEqual(id, undefined, 'unknown rune in source transcription');
    return id;
  }));
const printed = words.flat();
const canonical = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(words.length, 2896);
assert.equal(printed.length, 12956);
assert.deepEqual(printed, canonical, 'exact original source should match canonical page input');
assert.equal(corpus.prime.length, 29);

const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number[]} word @param {number[]} weights @returns {boolean} */
function containsChecksum(word, weights) {
  const total = mod29(word.reduce((n, symbol) => n + weights[symbol], 0));
  return word.some((symbol) => mod29(2 * weights[symbol]) === total);
}

/** @param {number[]} word @returns {number[]} */
function withIndexChecksumAsFinalRune(word) {
  assert.ok(word.length >= 2);
  const prefix = word.slice(0, -1);
  const checksum = mod29(prefix.reduce((sum, value) => sum + value, 0));
  const planted = [...prefix, checksum];
  assert.ok(containsChecksum(planted, indexWeights));
  return planted;
}

const indexWeights = Array.from({length: 29}, (_, i) => i);
const primeWeights = corpus.prime;
const multi = words.filter((word) => word.length >= 2);
const indexHits = multi.filter((word) => containsChecksum(word, indexWeights)).length;
const primeHits = multi.filter((word) => containsChecksum(word, primeWeights)).length;

assert.equal(multi.length, 2813);
assert.equal(indexHits, 382);
assert.equal(primeHits, 382);
assert.equal(words.filter((word) => containsChecksum(word, indexWeights)).length, 383);
assert.equal(words.filter((word) => containsChecksum(word, primeWeights)).length, 386);

// Same 2,813 word lengths and 1,181 checksum-bearing "extra rune" slots.
// Replacement rather than insertion keeps source word lengths unchanged.
const forced = Math.floor(0.42 * multi.length);
const positive = multi.map((word, i) => i < forced
  ? withIndexChecksumAsFinalRune(word) : word.slice());
const positiveHits = positive.filter((word) =>
  containsChecksum(word, indexWeights)).length;
assert.equal(forced, 1181);
assert.ok(positiveHits >= forced);
assert.ok(positiveHits > indexHits * 2);

console.log(JSON.stringify({
  originalPages: 'LP2 p0-p55, including p50 rune-free numeric table',
  originalWords: words.length,
  originalRunes: printed.length,
  multiRuneWords: multi.length,
  capacity: {
    GPIndexChecksumAnyPosition: indexHits,
    GPPrimeChecksumAnyPosition: primeHits,
    GPIndexPercentMaximum: 100 * indexHits / multi.length,
    GPPrimePercentMaximum: 100 * primeHits / multi.length,
    knownIndexChecksumPosition: 'unrestricted; any within printed word',
  },
  positivePlant: {
    sameLengthWords: positive.length,
    checksumBearingWordCount: forced,
    detectedEligibleWords: positiveHits,
    capacityPass: positiveHits >= forced
  },
  decision: 'Neither direct displayed-word modulo-29 checksum rule can account for an extra rune in 42% of words; no ciphertext was altered in the original test',
}, null, 2));

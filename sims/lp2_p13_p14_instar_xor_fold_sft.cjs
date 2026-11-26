#!/usr/bin/env node
"use strict";

// Source-gated test of the 2013 bytewise XOR operator on the p13/p14 fold.
// No guessed modulo, nearest-prime, or post-XOR alphabet repair is permitted.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));

const p13 = corpus.pages[13].indices;
const p14 = corpus.pages[14].indices;
const primes = corpus.prime;
const primeToRune = new Map(primes.map((value, index) => [value, index]));

assert.equal(p13.length, 272);
assert.equal(p14.length, 137);
assert.equal(p14[2], 0, "candidate transparent F at p14 offset 2 must be GP index 0");
assert.equal(corpus.runes[p14[2]], "ᚠ");
assert.equal(primes.length, 29);

// p13 is 136 + 136. Fold the second half back: p13[i] with p13[271-i].
const foldedPairs = Array.from({ length: 136 }, (_, i) => [p13[i], p13[271 - i]]);
const zeroBasedKey = foldedPairs.map(([a, b]) => a ^ b);
const oneBasedKey = foldedPairs.map(([a, b]) => (a + 1) ^ (b + 1));
const primeKey = foldedPairs.map(([a, b]) => primes[a] ^ primes[b]);

// Candidate F hold: omit only F at p14 page-local offset 2.
const p14Cipher = p14.filter((_, i) => i !== 2);
assert.equal(p14Cipher.length, 136);

function inspectByteStream(values, validValue) {
  const invalid = [];
  for (let i = 0; i < values.length; i++) {
    if (!validValue(values[i])) invalid.push({ offset: i, byte: values[i] });
  }
  return {
    valid: values.length - invalid.length,
    invalid: invalid.length,
    invalidPositions: invalid.map(x => x.offset),
    invalidValues: invalid.map(x => x.byte),
    completeRuneStream: invalid.length === 0
  };
}

const results = [];
for (const direction of ["printed", "reversed"]) {
  const cipher = direction === "printed" ? p14Cipher : [...p14Cipher].reverse();

  // Mapping A: GP29 zero-based ordinal is the byte value.
  const zeroBasedPlain = cipher.map((value, i) => value ^ zeroBasedKey[i]);
  results.push({
    encoding: "ordinal-zero-based",
    direction,
    ...inspectByteStream(zeroBasedPlain, value => value >= 0 && value < 29)
  });

  // Mapping B: GP29 one-based ordinal is the byte value.
  const oneBasedPlain = cipher.map((value, i) => (value + 1) ^ oneBasedKey[i]);
  results.push({
    encoding: "ordinal-one-based",
    direction,
    ...inspectByteStream(oneBasedPlain, value => value >= 1 && value <= 29)
  });

  // Mapping C: published Gematria prime is the byte value.
  const primeCipher = cipher.map(value => primes[value]);
  const primePlain = primeCipher.map((value, i) => value ^ primeKey[i]);
  results.push({
    encoding: "prime-byte",
    direction,
    ...inspectByteStream(primePlain, value => primeToRune.has(value))
  });
}

const compact = results.map(({ encoding, direction, valid, invalid, completeRuneStream }) => ({
  encoding, direction, valid, invalid, completeRuneStream
}));

assert.deepEqual(compact, [
  { encoding: "ordinal-zero-based", direction: "printed", valid: 122, invalid: 14, completeRuneStream: false },
  { encoding: "ordinal-one-based", direction: "printed", valid: 126, invalid: 10, completeRuneStream: false },
  { encoding: "prime-byte", direction: "printed", valid: 57, invalid: 79, completeRuneStream: false },
  { encoding: "ordinal-zero-based", direction: "reversed", valid: 124, invalid: 12, completeRuneStream: false },
  { encoding: "ordinal-one-based", direction: "reversed", valid: 126, invalid: 10, completeRuneStream: false },
  { encoding: "prime-byte", direction: "reversed", valid: 62, invalid: 74, completeRuneStream: false }
]);

assert.deepEqual(results[0].invalidPositions, [9, 21, 28, 30, 31, 35, 49, 60, 72, 74, 90, 95, 114, 135]);
assert.deepEqual(results[1].invalidPositions, [21, 23, 27, 28, 31, 40, 58, 95, 120, 135]);
assert.deepEqual(results[3].invalidPositions, [1, 18, 30, 35, 36, 39, 50, 59, 60, 63, 110, 133]);
assert.deepEqual(results[4].invalidPositions, [1, 25, 36, 39, 43, 88, 104, 117, 120, 132]);

console.log(JSON.stringify({
  source: "resources/liber-primus/lp2-corpus.json",
  p13Runes: p13.length,
  p13FoldedPairs: foldedPairs.length,
  p14Runes: p14.length,
  p14CandidateFHoldOffset: 2,
  p14CipherRunesAfterFHold: p14Cipher.length,
  results
}, null, 2));

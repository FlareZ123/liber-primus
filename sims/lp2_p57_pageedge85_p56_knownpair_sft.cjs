'use strict';

// Test the natural page-edge reading of p57's circumference instruction.
// p57 has 95 clear runes; removing five from each end leaves the 85-rune
// length of solved p56. This SFT tests that fixed inner sequence against
// p56's known plaintext, ciphertext and additive key, then as a direct pad.
// Run: node sims/lp2_p57_pageedge85_p56_knownpair_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const cipher = corpus.pages.find((page) => page.page === 56).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
const expectedWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';

/** @param {string} words @param {string[]} alphabet @returns {number[]} */
function toGpRunes(words, alphabet) {
  const sorted = alphabet.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const runes = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = sorted.find(({ token }) => word.startsWith(token, i));
      assert.ok(match, 'No GP spelling for ' + word.slice(i));
      runes.push(match.index);
      i += match.token.length;
    }
  }
  return runes;
}

/** @param {number[]} values */
function indexOfCoincidence(values) {
  const counts = new Array(29).fill(0);
  for (const value of values) counts[value]++;
  const pairs = counts.reduce((sum, n) => sum + n * (n - 1), 0);
  return pairs / (values.length * (values.length - 1));
}

/** @param {number[]} a @param {number[]} b */
function equalPositions(a, b) {
  return a.reduce((sum, value, i) => sum + (value === b[i] ? 1 : 0), 0);
}

const plaintext = toGpRunes(expectedWords, corpus.translit);
assert.equal(cipher.length, 85);
assert.equal(p57.length, 95);
assert.equal(plaintext.length, 85);

const inner = p57.slice(5, -5);
assert.equal(inner.length, 85);
const mod29 = (n) => ((n % 29) + 29) % 29;
const key = cipher.map((value, i) => mod29(value - plaintext[i]));
const subtract = cipher.map((value, i) => mod29(value - inner[i]));
const add = cipher.map((value, i) => mod29(value + inner[i]));

const matches = {
  plaintext: equalPositions(inner, plaintext),
  ciphertext: equalPositions(inner, cipher),
  derivedKey: equalPositions(inner, key)
};
assert.deepEqual(matches, { plaintext: 10, ciphertext: 2, derivedKey: 3 });
assert.notDeepEqual(inner, plaintext);
assert.notDeepEqual(inner, cipher);
assert.notDeepEqual(inner, key);

const ioc = {
  inner: indexOfCoincidence(inner),
  p56Plaintext: indexOfCoincidence(plaintext),
  p56Ciphertext: indexOfCoincidence(cipher),
  p56DerivedKey: indexOfCoincidence(key),
  subtractPad: indexOfCoincidence(subtract),
  addPad: indexOfCoincidence(add)
};
assert.ok(Math.abs(ioc.subtractPad - 0.03333333333333333) < 1e-12);
assert.ok(Math.abs(ioc.addPad - 0.03333333333333333) < 1e-12);

console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-corpus.json',
  operation: 'remove first and last five p57 GP29 runes',
  lengths: { p56Cipher: cipher.length, p57Clear: p57.length, p57Inner: inner.length },
  exactPositionMatches: matches,
  indexOfCoincidence: ioc,
  first20SubtractPad: subtract.slice(0, 20),
  first20AddPad: add.slice(0, 20),
  decision: 'The fixed page-edge peel is not p56 plaintext, ciphertext, key stream, or a readable direct additive pad.'
}, null, 2));

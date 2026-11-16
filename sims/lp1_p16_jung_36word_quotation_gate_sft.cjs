'use strict';

/**
 * Exact word-length fingerprint from a source-preselected Jung Red Book passage.
 * Original textual source: C. G. Jung, The Red Book (2009), Liber Primus,
 * chapter V ("Descent into Hell in the Future"), translation p. 239.
 * The source passage is the 36 consecutive words beginning "The blond hero ...",
 * ending "... of the night"; this code stores only derived GP29 word lengths.
 *
 * Tests whether a direct source quotation could survive an original LP2
 * word-preserving substitution. This is a necessary-condition test, not a
 * general rejection of Jung as a possible key source.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const GP = new Set(corpus.runes);
const sourceGPWordLengths = [
  2,5,4,3,5,2,5,6,2,2,3,3,2,9,3,7,3,2,8,1,3,3,6,2,3,2,2,5,4,2,7,1,3,2,2,5
];

assert.equal(corpus.pages.filter(p => p.page < 56)
  .reduce((s, p) => s + p.indices.length, 0), 12956);

/** @param {string} separators @returns {number[]} */
function originalWordLengths(separators) {
  const words = [];
  let length = 0;
  let seen = 0;
  for (const character of transcript) {
    if (seen >= 12956) break;
    if (GP.has(character)) {
      length++;
      seen++;
    } else if (separators.includes(character) && length) {
      words.push(length);
      length = 0;
    }
  }
  if (length) words.push(length);
  assert.equal(seen, 12956);
  return words;
}

/**
 * Longest exactly equal contiguous length sequence, regardless of alignment.
 * @param {number[]} source
 * @param {number[]} ciphertext
 * @returns {{length:number,matches:number}}
 */
function longestMatch(source, ciphertext) {
  let best = 0;
  let ties = 0;
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < ciphertext.length; j++) {
      let n = 0;
      while (i + n < source.length && j + n < ciphertext.length &&
          source[i + n] === ciphertext[j + n]) n++;
      if (n > best) {
        best = n;
        ties = 1;
      } else if (n === best) ties++;
    }
  }
  return { length: best, matches: ties };
}

// Punctuation dots may be treated as word separators, or as intra-word marks.
// Both predeclared treatments are tested; source-native GP ligatures were
// collapsed once in the fixed fingerprint before inspecting original LP2.
const splitDots = originalWordLengths('-.$%&');
const joinDots = originalWordLengths('-\$%&');
const result = {
  originalRunes: 12956,
  sourceWordLengths: sourceGPWordLengths.length,
  withDotsAsSeparators: {
    originalTokens: splitDots.length,
    ...longestMatch(sourceGPWordLengths, splitDots)
  },
  withDotsWithinWords: {
    originalTokens: joinDots.length,
    ...longestMatch(sourceGPWordLengths, joinDots)
  }
};
console.log(JSON.stringify(result, null, 2));
assert.equal(result.withDotsAsSeparators.originalTokens, 2928);
assert.equal(result.withDotsAsSeparators.length, 5);
assert.equal(result.withDotsAsSeparators.matches, 5);
assert.equal(result.withDotsWithinWords.originalTokens, 2775);
assert.equal(result.withDotsWithinWords.length, 5);
assert.equal(result.withDotsWithinWords.matches, 3);
console.log('PASS: no six-word contiguous literal Jung-quotation length signature in unknown LP2.');

'use strict';

/**
 * Whole-book complete-word holdout for the p55 prime-sum/Base32 locator
 * hypothesis. Reads the original source transcript without fitting any
 * alphabet, key, phase, or plaintext. Node.js 22, no third-party packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {parseSharedCorpus, physicalLP2Page} = require('./lp2_word_pages.cjs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const original = parseSharedCorpus();
const base32 = 'abcdefghijklmnopqrstuvwxyz234567';

/**
 * Sum canonical Gematria Primus prime weights for one printed rune word.
 * @param {string} runes
 * @returns {number}
 */
function primeDigit(runes) {
  return Array.from(runes).reduce((sum, rune) => {
    const index = corpus.runes.indexOf(rune);
    assert.ok(index >= 0, 'Unknown GP rune in source transcript');
    return sum + corpus.prime[index];
  }, 0) % 32;
}

/**
 * Encode a fixed sixteen-word window as a hypothetical Tor-v2 hostname.
 * @param {number[]} digits
 * @returns {string}
 */
function encode(digits) {
  assert.equal(digits.length, 16);
  return digits.map(value => base32[value]).join('');
}

assert.equal(original.runeCount, 12956);
assert.equal(original.words.length, 2896);
assert.equal(original.crossPageWords, 32);
assert.equal(corpus.runes.length, 29);

const digits = original.words.map(word => primeDigit(word.runes));
const matches = [];
const knownDistributorMatches = [];
for (let i = 0; i + 16 <= digits.length; i += 1) {
  const output = encode(digits.slice(i, i + 16));
  if (output === 'ky2khlqdf7qdznac') knownDistributorMatches.push(i);
  if (digits[i + 7] === 13 && digits[i + 15] === 31) {
    matches.push({
      wordOffset: i,
      physicalStartPage: physicalLP2Page(original.words[i].startPage),
      physicalEndPage: physicalLP2Page(original.words[i + 15].endPage),
      derivedHostname: output,
    });
  }
}

assert.equal(digits.length - 15, 2881);
assert.deepEqual(matches, [
  {wordOffset: 1750, physicalStartPage: 31, physicalEndPage: 32,
    derivedHostname: '3nmvm46nsg6e5lf7'},
  {wordOffset: 2730, physicalStartPage: 51, physicalEndPage: 52,
    derivedHostname: '6bjupjsnnheadah7'},
  {wordOffset: 2880, physicalStartPage: 55, physicalEndPage: 55,
    derivedHostname: '6sws36unkmvdy4b7'},
]);
assert.deepEqual(knownDistributorMatches, []);

// Exact source-independent detection control for the 13/31 rule.
const synthetic = Array.from({length: 16}, () => corpus.runes[0]);
synthetic[7] = corpus.runes[5];  // prime 13
synthetic[15] = corpus.runes[10]; // prime 31
assert.equal(primeDigit(synthetic[7]), 13);
assert.equal(primeDigit(synthetic[15]), 31);
assert.equal(encode(synthetic.map(primeDigit)).length, 16);

console.log(JSON.stringify({
  classification: 'whole-book source control, no authenticated LP2 plaintext',
  originalRunes: original.runeCount,
  completeWords: original.words.length,
  acrossPageWords: original.crossPageWords,
  sixteenWordWindows: digits.length - 15,
  frozen13and31Matches: matches,
  knownDistributorHostnameMatches: knownDistributorMatches,
}, null, 2));

'use strict';

/**
 * Source-exact reduction of previous-word GP-prime parity to length parity
 * corrected by literal Fehu occupancy. No key, phase or plaintext fitted.
 * Single runnable test on Node.js 22 (Windows 11):
 *   node sims/lp2_gp_prime_parity_word_direction_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
assert.equal(corpus.prime.length, 29);
assert.equal(corpus.prime[0], 2);
assert(corpus.prime.slice(1).every(n => n % 2 === 1));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sections = text.split(/^%\s*$/m);
assert.equal(sections.length, 57); // p50 table is purely numeric, no rune text
const raw = sections.slice(0, 55).join('').replace(/[\n/%&$§]/g, '');
const words = raw.split(/[-.]/g)
  .map(part => [...part].filter(c => runeIndex.has(c)).map(c => runeIndex.get(c)))
  .filter(indices => indices.length > 0);
const flat = words.flat();
const original = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.deepEqual(flat, original);
assert.equal(words.length, 2896);
assert.equal(flat.length, 12956);

let fTotal = 0;
let wordsWithF = 0;
let oddFWords = 0;
let fStarts = 0;
let fEnds = 0;
for (const word of words) {
  const fc = word.filter(i => i === 0).length;
  fTotal += fc;
  wordsWithF += Number(fc > 0);
  oddFWords += fc % 2;
  fStarts += Number(word[0] === 0);
  fEnds += Number(word[word.length - 1] === 0);
  const primeParity = word.reduce((sum, i) => sum + corpus.prime[i], 0) % 2;
  const lengthFParity = (word.length - fc) % 2;
  assert.equal(primeParity, lengthFParity,
    'Every GP prime except Fehu (2) is odd');
}
assert.equal(fTotal, 458);
assert.equal(wordsWithF, 422);
assert.equal(oddFWords, 388);
assert.equal(fStarts, 117);
assert.equal(fEnds, 82);
console.log(JSON.stringify({
  source: 'Original LP2 p0-p55, physical complete words with page carry intact',
  originalRunes: flat.length,
  originalPrintedWords: words.length,
  FehuRuneCount: fTotal,
  wordsContainingFehu: wordsWithF,
  wordsWithOddFehuCount: oddFWords,
  primeSumParityEqualsLengthParityWords: words.length - oddFWords,
  parityAgreementFraction: (words.length - oddFWords) / words.length,
  previousFirstPrimeEvenWords: fStarts,
  previousLastPrimeEvenWords: fEnds,
  exactIdentity: 'sum(prime[rune]) % 2 = (runeCount - count(Fehu)) % 2',
  consequence: 'GP-prime parity and length parity are not independent word direction selectors'
}, null, 2));

'use strict';

/**
 * Period-original Stage11 HTML and the physical p0 two-word red title.
 * Pure source-link reproducer; no cipher key or plaintext is assumed.
 * Run from repository root: node sims/lp2_2014_html_p0_prime_pair_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(
  path.join(root, 'resources', 'external', 'cicada2014-stage11-index-archived.html'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');

const gitHeader = Buffer.from('blob ' + Buffer.byteLength(html, 'utf8') + '\0');
const originalBlob = crypto.createHash('sha1')
  .update(gitHeader).update(Buffer.from(html, 'utf8')).digest('hex');
assert.equal(originalBlob, '303db130705f0ef9be2a738f4336d5cfcebde80c');
const webTitle = Number(html.match(/<title>(\d+)<\/title>/)[1]);
const webDiv = Number(html.match(/<div id="(\d+)">/)[1]);
assert.deepEqual([webTitle, webDiv], [133, 331]);
const urls = [...html.matchAll(/<img src="(\d+)\.jpg" \/>/g)].map((m) => Number(m[1]));
assert.deepEqual(urls, Array.from({length: 58}, (_, i) => i));

assert.equal(corpus.runes.length, 29);
const runeIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const firstHeading = transcription.match(/^([ᚠ-ᛡ]+)-([ᚠ-ᛡ]+)\./u);
assert(firstHeading, 'Original first GP29 two-word title required');
const a = [...firstHeading[1]].map((glyph) => runeIndex.get(glyph));
const b = [...firstHeading[2]].map((glyph) => runeIndex.get(glyph));
assert.deepEqual([a.length, b.length], [8, 5]);
assert.deepEqual([...a, ...b], corpus.pages[0].indices.slice(0, 13));
const sum = (values) => values.reduce((acc, index) => acc + corpus.prime[index], 0);
const titleSums = [sum(a), sum(b)];
assert.deepEqual(titleSums, [347, 315]);
const center = (titleSums[0] + titleSums[1]) / 2;
const halfDifference = (titleSums[0] - titleSums[1]) / 2;
assert.equal(center, webDiv);
assert.equal(halfDifference, 16);
const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
/** @param {number} bound @returns {number} */
function primeRank(bound) {
  let count = 0;
  for (let n = 2; n <= bound; n++) if (isPrime(n)) count++;
  return count;
}
assert.equal(primeRank(1033), 174);
assert.equal(primeRank(3301), 464);
assert.equal(webTitle + webDiv, 464);
assert.equal((webTitle + webDiv) / corpus.runes.length, halfDifference);
assert.equal(Number(String(1033).replace('0', '')), webTitle);
assert.equal(Number(String(3301).replace('0', '')), webDiv);
assert(isPrime(webDiv));

/**
 * Finite conditional control: permute the exact published 29 prime weights
 * among the eleven distinct rune identities appearing in the fixed title.
 * This evaluates only the exact two-sum match for fixed 347 and 315.
 * The result is exploratory and is NOT a search-adjusted authorship p-value.
 * @param {number} trials
 * @returns {{trials: number, joint: number, sumOnly: number, diffOnly: number}}
 */
function fixedWeightPermutationControl(trials) {
  const identities = [...new Set([...a, ...b])];
  assert.equal(identities.length, 11);
  const aSlots = a.map((value) => identities.indexOf(value));
  const bSlots = b.map((value) => identities.indexOf(value));
  let state = 3301133 >>> 0;
  const random32 = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  let joint = 0, sumOnly = 0, diffOnly = 0;
  const base = corpus.prime;
  for (let trial = 0; trial < trials; trial++) {
    const bag = base.slice();
    for (let j = 0; j < identities.length; j++) {
      const k = j + (random32() % (bag.length - j));
      [bag[j], bag[k]] = [bag[k], bag[j]];
    }
    let sa = 0, sb = 0;
    for (const j of aSlots) sa += bag[j];
    for (const j of bSlots) sb += bag[j];
    if (sa + sb === 662) sumOnly++;
    if (sa - sb === 32) diffOnly++;
    if (sa === 347 && sb === 315) joint++;
  }
  return {trials, joint, sumOnly, diffOnly};
}
const conditionalNull = fixedWeightPermutationControl(1000000);
console.log(JSON.stringify({
  kind: '2014 archive title and p0 red-heading prime pair',
  originalArchiveBlob: originalBlob,
  title: webTitle, div: webDiv, sourceHeadRunes: a.length + b.length,
  sums: titleSums, center, halfDifference,
  primeRank1033: primeRank(1033), primeRank3301: primeRank(3301),
  rankLink: webTitle + webDiv,
  conditions: {
    redHeadingAverageEqualsDiv: center === webDiv,
    redHeadingHalfDifferenceEqualsRankOverAlphabet:
      halfDifference === (webTitle + webDiv) / 29,
    htmlNumbersEqualZeroDroppedCuneiform: true
  },
  conditionalNull,
  caveat: 'No authenticated original-cipher inverse, unknown-page plaintext, or creator key provenance established'
}, null, 2));

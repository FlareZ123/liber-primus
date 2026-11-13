'use strict';

/**
 * Source-locked candidate: the signed 2016 tree image's 563x569 dimensions
 * address two original LP2 words by GP-prime sum. Their width-height gap (6)
 * also selects six literal runes from the width word, reading NEWBAS.
 * A suffix index sum of 66 gives a provisional 66-6=60 radix clue.
 *
 * Run: node sims/lp2_2016_gap6_newbas_source_sft.cjs
 * These readings are NOT authenticated recovered plaintext or a cipher key.
 * The probability calculations are conditional on the declared exact source
 * word, prefix and sums; they do not correct discovery-wide multiple testing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const pageTexts = raw.split(/\s*%\s*/).slice(0, 55);
assert.equal(pageTexts.length, 55);
const runeIndices = new Map(corpus.runes.map((rune, i) => [rune, i]));
const pages = pageTexts.map((body, p) => ({
  page: p < 50 ? p : p + 1,
  words: (body.replace(/\s/g, '').replaceAll('/', '')
    .match(/\p{Script=Runic}+/gu) || [])
    .map(text => [...text].map(rune => {
      assert(runeIndices.has(rune));
      return runeIndices.get(rune);
    }))
}));
assert.equal(pages.flatMap(p => p.words).length, 2928);
for (const page of pages) {
  assert.deepEqual(page.words.flat(),
    corpus.pages[page.page].indices,
    'all printed words reproduce the canonical original rune stream');
}
const sumPrime = symbols => symbols.reduce((n, x) => n + corpus.prime[x], 0);
const flatWords = pages.flatMap(p => p.words.map((runes, i) => ({
  page: p.page, word: i + 1, runes, sum: sumPrime(runes)
})));
const width = 563;
const height = 569;
const hits = [width, height].map(sum => flatWords.filter(w => w.sum === sum));
assert.deepEqual(hits.map(h => h.map(w => [w.page, w.word, w.runes.length])),
  [[[0, 6, 11]], [[1, 33, 10]]]);
const tree = corpus.pages[32].indices;
assert.equal(tree.length, 121);
assert.equal(sumPrime(tree.slice(0, 11)), width);
assert.equal(sumPrime(Array.from({length: 11}, (_, i) => tree[11 * i])),
  height);
const gap = height - width;
assert.equal(gap, 6);
const word = hits[0][0].runes;
const p1Word = hits[1][0].runes;
const prefix = word.slice(0, gap);
const suffix = word.slice(gap);
const spell = runes => runes.map(x => corpus.translit[x]).join('');
assert.deepEqual(prefix, [9, 18, 7, 17, 24, 15]);
assert.equal(spell(prefix), 'NEWBAS');
assert.equal(spell(word), 'NEWBASOEEOINGU');
assert.equal(spell(p1Word), 'JFINIACYEAIIA');
assert.deepEqual(suffix, [22, 12, 10, 21, 1]);
const suffixIndexSum = suffix.reduce((sum, i) => sum + i, 0);
assert.equal(suffixIndexSum, 66);
assert.equal(suffixIndexSum - gap, 60);

const fullOccurrences = [];
for (const p of pages) {
  const values = corpus.pages[p.page].indices;
  for (let i = 0; i + prefix.length <= values.length; i++) {
    if (prefix.every((rune, k) => values[i + k] === rune))
      fullOccurrences.push({page: p.page, runeOffset: i});
  }
}
assert.deepEqual(fullOccurrences, [{page: 0, runeOffset: 23}]);

/**
 * Exact without-replacement probability for fixed slot under p0's original
 * rune inventory. Count the six ordered prefix letters first, then the five
 * remaining unordered glyph identities satisfying the prime sum. Optionally
 * additionally require the observed suffix GP-index sum 66.
 * This is an after-discovery diagnostic only.
 */
function choose(n, k) {
  let v = 1n;
  for (let i = 1; i <= k; i++) v = v * BigInt(n - i + 1) / BigInt(i);
  return v;
}
const pool = [...corpus.pages[0].indices];
let prefixProbability = 1;
for (const rune of prefix) {
  const count = pool.filter(x => x === rune).length;
  prefixProbability *= count / pool.length;
  assert(count > 0);
  pool.splice(pool.indexOf(rune), 1);
}
const remainderLength = word.length - gap;
const remainderPrime = width - sumPrime(prefix);
assert.equal(remainderPrime, 237);
assert.equal(remainderLength, 5);
const counts = Array.from({length: 29},
  (_, rune) => pool.filter(x => x === rune).length);
const dp = Array.from({length: remainderLength + 1}, () => new Map());
dp[0].set('0,0', 1n);
let states = dp;
for (let rune = 0; rune < 29; rune++) {
  const next = Array.from({length: remainderLength + 1}, () => new Map());
  for (let count = 0; count <= remainderLength; count++) {
    for (const [state, ways] of states[count]) {
      const [sumPrimeValue, sumIndexValue] = state.split(',').map(Number);
      for (let k = 0; k <= Math.min(counts[rune],
          remainderLength - count); k++) {
        const nextPrime = sumPrimeValue + k * corpus.prime[rune];
        const nextIndex = sumIndexValue + k * rune;
        if (nextPrime > remainderPrime || nextIndex > 140) break;
        const key = nextPrime + ',' + nextIndex;
        next[count + k].set(key,
          (next[count + k].get(key) || 0n) +
          ways * choose(counts[rune], k));
      }
    }
  }
  states = next;
}
const outcomes = [...states[remainderLength]].filter(([key]) =>
  Number(key.split(',')[0]) === remainderPrime);
const totalPrimeWays = outcomes.reduce((sum, [, ways]) => sum + ways, 0n);
const exactBothWays = states[remainderLength].get(
  remainderPrime + ',' + suffixIndexSum) || 0n;
const denom = choose(pool.length, remainderLength);
assert.equal(totalPrimeWays.toString(), '66262347');
assert.equal(exactBothWays.toString(), '17133117');
const result = {
  status: 'source-selected literal prefix and provisional radix relation',
  originalSource: '2014 LP2 physical p0/p1/p32; 2016 signed tree 563x569',
  target: {width, height, gap,
    sourceWords: hits.map(words => words.map(w =>
      ({page: w.page, oneBasedWord: w.word, runes: w.runes.length})))},
  p0Word6: {transliteration: spell(word), prefix: spell(prefix),
    prefixRunes: prefix, remainingRunes: suffix, remainingPrimeSum: remainderPrime,
    remainingIndexSum: suffixIndexSum, provisionalBase: suffixIndexSum - gap},
  fullBookExactPrefixOccurrences: fullOccurrences,
  conditionalNull: {
    originalP0WordInventory: corpus.pages[0].indices.length,
    exactPrefixSixChance: prefixProbability,
    prefixAndPrimeSum563Chance:
      prefixProbability * Number(totalPrimeWays) / Number(denom),
    prefixAndPrimeSum563AndSuffixIndexSum66Chance:
      prefixProbability * Number(exactBothWays) / Number(denom),
    caveat: 'Post-selected fragment/operations; these are not authorship p-values'
  },
  conclusion: 'NEWBAS has no final E; 66-6=60 is analyst-selected. No plaintext, key, or decoder established.'
};
console.log(JSON.stringify(result, null, 2));

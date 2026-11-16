#!/usr/bin/env node
'use strict';

/**
 * Native GP29 16-word multiset screen for a putative p15 4x4 transposition.
 * Original input: 55 rune-bearing LP2 pages, joining all physical-page carries.
 * Run on Windows: node sims/lp2_p15_16word_anypermutation_source_bag_sft.cjs
 *
 * The word-length multiset of 16 ciphertext words is invariant under ANY
 * permutation of those 16 intact words. Adjacent blocks with fixed 16-word
 * source advance therefore remain traceable without knowing the permutation.
 * This is an exact-corpus test, not a test of plaintext character encryption.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const runePattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const continuousText = transcript.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const sourceWords = continuousText.match(runePattern) || [];
const original = sourceWords.map((word) => [...word].length);
assert.equal(original.length, 2896);
assert.equal(original.reduce((a, b) => a + b, 0), 12956);

const gpNames = [...gp.translit].sort((a, b) => b.length - a.length);
/** @param {string} word @returns {number} */
function nativeLength(word) {
  let n = 0;
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) { i += 3; n++; continue; }
    if (word.startsWith('IO', i)) { i += 2; n++; continue; }
    const found = gpNames.find((name) => word.startsWith(name, i));
    assert(found, 'Non-GP text segment ' + word.slice(i));
    i += found.length;
    n++;
  }
  return n;
}
/** @param {string} text @returns {number[]} */
function normalizeEnglish(text) {
  const words = text.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
    .match(/[A-Z]+/g) || [];
  return words.map(nativeLength);
}
/** @param {string} text @returns {string} */
function sourceOnly(text) {
  return text.split('BEGIN SOURCE TEXT')[1].split('END SOURCE TEXT')[0];
}
const references = [
  ['Shakespeare first 300k', normalizeEnglish(read('resources/control/shakespeare_first300k.txt'))],
  ['Gibran Prophet', normalizeEnglish(read('resources/control/gibran_prophet_58585.txt'))],
  ['Emerson Essays', normalizeEnglish(read('resources/control/emerson_essays_2944.txt'))],
  ['Latin Vulgate GP', read('resources/control/latin-vulgate-gp-wholewords.txt')
    .split(/\r?\n/).filter((line) => /^[0-9A-S]+$/.test(line)).map((word) => word.length)],
  ['2013 Book of the Law', normalizeEnglish([
    read('resources/external/2013-book-of-law-I.txt'),
    read('resources/external/2013-book-of-law-II.txt'),
    read('resources/external/2013-book-of-law-III.txt')
  ].join('\n'))],
  ['Blake Song of Liberty', normalizeEnglish(sourceOnly(read('resources/control/blake_song_of_liberty_train.txt')))],
  ['2012 signed Blake chorus', normalizeEnglish(sourceOnly(read('resources/control/cicada2012_blake_chorus.txt')))]
];
assert.deepEqual(references.map(([, a]) => a.length),
  [55407, 15733, 77932, 39835, 5867, 353, 56]);

/** @param {number[]} words @param {number} start @returns {string} */
function bag(words, start) {
  return words.slice(start, start + 16).sort((a, b) => a - b).join(',');
}
/**
 * Tests all 16 possible word-block origins and requires source blocks to be
 * contiguous with +16 source-word advances, regardless of ciphertext order.
 * @param {number[]} observed
 * @param {number[]} reference
 * @returns {{singleBlockAnchors:number,twoBlockAnchors:number,maxBlockRun:number}}
 */
function scan(observed, reference) {
  const index = new Map();
  for (let i = 0; i + 16 <= reference.length; i++) {
    const key = bag(reference, i);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(i);
  }
  let singleBlockAnchors = 0;
  let twoBlockAnchors = 0;
  let maxBlockRun = 0;
  for (let phase = 0; phase < 16; phase++) {
    for (let start = phase; start + 16 <= observed.length; start += 16) {
      const candidates = index.get(bag(observed, start)) || [];
      singleBlockAnchors += candidates.length;
      for (const candidate of candidates) {
        let count = 0;
        while (start + 16 * (count + 1) <= observed.length &&
               candidate + 16 * (count + 1) <= reference.length &&
               bag(observed, start + 16 * count) ===
                 bag(reference, candidate + 16 * count)) {
          count++;
        }
        if (count >= 2) twoBlockAnchors++;
        if (count > maxBlockRun) maxBlockRun = count;
      }
    }
  }
  return { singleBlockAnchors, twoBlockAnchors, maxBlockRun };
}
const checks = references.map(([name, source]) => ({
  reference: name, sourceWords: source.length, ...scan(original, source)
}));
assert(checks.every((x) => x.maxBlockRun === 1 && x.twoBlockAnchors === 0));

// Known native-prose 48-word positive is transposed arbitrarily inside each
// complete 16-word block; all three source-contiguous bags must remain visible.
const gibran = references[1][1];
const known = gibran.slice(400, 448);
const planted = [];
for (let i = 0; i < known.length; i += 16) {
  planted.push(...known.slice(i, i + 16).reverse());
}
assert.deepEqual(planted.length, 48);
const positive = scan(planted, gibran);
assert(positive.maxBlockRun >= 3 && positive.twoBlockAnchors >= 2);

console.log(JSON.stringify({
  status: 'PASS',
  originalWords: original.length,
  originalRunes: original.reduce((a, b) => a + b, 0),
  fixedBlockWords: 16,
  possibleBlockPhases: 16,
  checks,
  threeBlockGibranPlant: positive,
  interpretation: 'No pair of consecutive 16-word original blocks matches consecutive 16-word source blocks under any intra-block word permutations, among these seven fixed reference corpora and any of 16 global phases.'
}, null, 2));

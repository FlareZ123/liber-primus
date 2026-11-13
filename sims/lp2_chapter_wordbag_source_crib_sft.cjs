'use strict';

/**
 * Source-selected plaintext crib search under complete-word transposition.
 *
 * Exact source-visible model: each original physical page or illustrated chapter
 * may reorder its complete printed words but retain every word's GP rune length.
 * Compare the full multiset of word lengths against every contiguous same-count
 * window of historically documented 2012/2013 Cicada book-code sources.
 *
 * Node.js 22 CommonJS, no packages or writes. Run from any working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words, physicalLP2Page} = require('./lp2_word_pages.cjs');

const root = path.join(__dirname, '..');
/** @param {string} name */
const json = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const raw = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const parsed = parseLP2Words(raw);
const original = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const gpIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.equal(original.length, 55);
const segments = raw.split('%').slice(0, 55);
assert.equal(segments.length, 55);
for (let i = 0; i < segments.length; i++) {
  const sourceRunes = [...segments[i]].filter(rune => gpIndex.has(rune))
    .map(rune => gpIndex.get(rune));
  assert.deepEqual(sourceRunes, original[i].indices, 'canonical rune disagreement at ' + i);
}

/** @param {number[]} lengths @returns {Int32Array} */
function histogram(lengths) {
  const result = new Int32Array(32);
  for (const length of lengths) {
    assert.ok(Number.isInteger(length) && length >= 1 && length <= 31);
    result[length]++;
  }
  return result;
}

/**
 * Exhaustive O(source length + histogram width) minimum-L1 bag search.
 * L1/2 is the minimum number of replaced word lengths needed to match.
 * @param {number[]} source
 * @param {number[]} target
 * @returns {{minL1:number, firstBest:number, bestTies:number, exactMatches:number}}
 */
function scan(source, target) {
  const n = target.length;
  assert.ok(n > 0);
  assert.ok(source.length >= n);
  const wanted = histogram(target), seen = histogram(source.slice(0, n));
  let dist = 0;
  for (let i = 0; i < seen.length; i++) dist += Math.abs(seen[i] - wanted[i]);
  let minL1 = dist, firstBest = 0, bestTies = 1, exactMatches = Number(dist === 0);
  for (let i = n; i < source.length; i++) {
    const outgoing = source[i - n], incoming = source[i];
    if (outgoing !== incoming) {
      dist -= Math.abs(seen[outgoing] - wanted[outgoing]);
      dist -= Math.abs(seen[incoming] - wanted[incoming]);
      seen[outgoing]--;
      seen[incoming]++;
      dist += Math.abs(seen[outgoing] - wanted[outgoing]);
      dist += Math.abs(seen[incoming] - wanted[incoming]);
    }
    assert.equal(dist % 2, 0);
    if (dist < minL1) {
      minL1 = dist;
      firstBest = i - n + 1;
      bestTies = 1;
    } else if (dist === minL1) bestTies++;
    if (dist === 0) exactMatches++;
  }
  return {minL1, firstBest, bestTies, exactMatches};
}

const book12 = json('resources/derived/2012-bookcode-gp-wordlengths.json');
const crowley = json('resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json');
const mab = json('resources/external/cicada2012-mabinogion-gutenberg5160-gp-wordlengths.json');
const agrippa = json('resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json');
const sources = [
  ...book12.sources.map(s => ({
    name: s.id,
    lengths: Array.from(s.encoded_lengths, ch => ch.charCodeAt(0) - 65)
  })),
  ...crowley.chapters.map(s => ({name: 'Liber AL ' + s.chapter, lengths: s.word_lengths})),
  {name: 'Mabinogion independent GP', lengths: mab.mabinogion_story_word_lengths},
  {name: 'Agrippa alternate', lengths: agrippa.word_lengths}
];
assert.equal(sources.length, 8);
for (const source of sources) histogram(source.lengths);

const chapters = [[0,2], [3,7], [8,14], [15,22], [23,26],
  [27,32], [33,39], [40,53], [54,55]];
const chapterCounts = [158,255,383,437,224,326,378,669,66];
const chapterRunes = [729,1145,1729,1903,1021,1433,1680,3008,308];
const sectionResults = chapters.map(([first, last], i) => {
  const target = parsed.words.filter(w => {
    const physical = physicalLP2Page(w.startPage);
    return physical >= first && physical <= last;
  }).map(w => w.length);
  assert.equal(target.length, chapterCounts[i]);
  assert.equal(target.reduce((a,b) => a+b, 0), chapterRunes[i]);
  const ranked = sources.map(source => ({
    name: source.name, ...scan(source.lengths, target)
  })).sort((a,b) => a.minL1 - b.minL1);
  assert.ok(ranked.every(x => x.exactMatches === 0));
  return {pages: first + '-' + last, wordCount: target.length, best: ranked[0]};
});

const pageResults = [];
const exactHits = [];
for (const originalPage of original) {
  const target = parsed.words.filter(w =>
    physicalLP2Page(w.startPage) === originalPage.page).map(w => w.length);
  assert.ok(target.length);
  const row = sources.map(source => ({
    name: source.name, ...scan(source.lengths, target)
  })).sort((a,b) => a.minL1 - b.minL1);
  pageResults.push({page: originalPage.page, wordCount: target.length, best: row[0]});
  for (const hit of row) {
    if (hit.exactMatches) exactHits.push({
      page: originalPage.page, wordCount: target.length,
      name: hit.name, exactMatches: hit.exactMatches, sourceIndex: hit.firstBest
    });
  }
}
assert.equal(pageResults.length, 55);
assert.deepEqual(exactHits, [
  {page: 49, wordCount: 17, name: 'mabinogion-context', exactMatches: 2, sourceIndex: 18175},
  {page: 49, wordCount: 17, name: 'Mabinogion independent GP', exactMatches: 2, sourceIndex: 18175},
  {page: 55, wordCount: 16, name: 'britannica-2012', exactMatches: 1, sourceIndex: 140754}
]);

// Exact known-source positive: a whole target window permuted in any order
// is recovered by the bag scanner, without seeing a single plaintext rune.
for (const i of [0, 3, 8]) {
  const [first,last] = chapters[i];
  const target = parsed.words.filter(w => {
    const p = physicalLP2Page(w.startPage);
    return p >= first && p <= last;
  }).map(w => w.length);
  const plant = sources[0].lengths.slice();
  plant.splice(1000, target.length, ...target.slice().reverse());
  assert.equal(scan(plant, target).minL1, 0);
}

/** @param {string} sourceWord @returns {number[]} */
function encodeGP(sourceWord) {
  const normalized = sourceWord.toUpperCase().replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
  const tokens = corpus.translit.map((token, i) => ({token, i}))
    .sort((a,b) => b.token.length - a.token.length);
  const values = [];
  for (let i = 0; i < normalized.length;) {
    const match = tokens.find(v => normalized.startsWith(v.token, i));
    assert.ok(match, 'unmapped GP spelling: ' + sourceWord);
    values.push(match.i);
    i += match.token.length;
  }
  return values;
}

/** Symbol-equality pattern invariant under an arbitrary fixed alphabet relabeling. */
function equalityPattern(indices) {
  const seen = new Map();
  return indices.map(x => {
    if (!seen.has(x)) seen.set(x, seen.size);
    return seen.get(x);
  }).join(',');
}

// Candidate text is a 16-word public-domain excerpt, independently fetched
// from the original 2012 book-code source at word offset 140754. The wording
// is a test fixture, not an asserted plaintext for physical LP2 p55.
const britainExcerpt = 'of England to prepare for holy orders He became curate of South Cadbury Somersetshire and on'
  .split(' ');
const p55 = parsed.words.filter(w => physicalLP2Page(w.startPage) === 55)
  .map(w => [...w.runes].map(rune => gpIndex.get(rune)));
const english = britainExcerpt.map(encodeGP);
assert.equal(p55.length, 16);
assert.deepEqual(Array.from(histogram(english.map(w => w.length))),
  Array.from(histogram(p55.map(w => w.length))));
const missingShapes = britainExcerpt.filter((_, i) => !p55.some(
  c => equalityPattern(c) === equalityPattern(english[i])));
assert.deepEqual(missingShapes, ['prepare','orders','became','Cadbury','Somersetshire']);


// A stronger keyed model resets one arbitrary position-wise GP29 additive pad
// at every printed word, reusing the same key index for all 16 source words.
// The unique thirteen-rune source/cipher pair fixes all thirteen unknown key
// symbols without a dictionary, beam search, or language fit.
const p55Long = p55.find(w => w.length === 13);
const excerptLong = english.find(w => w.length === 13);
assert.ok(p55Long && excerptLong);
const restartPad = excerptLong.map((plain, i) =>
  (p55Long[i] - plain + 29) % 29);
const positionPadAssignmentOptions = english.map(plain =>
  p55.reduce((count, cipher) =>
    count + Number(cipher.length === plain.length &&
      cipher.every((value, position) =>
        (value - plain[position] + 29) % 29 === restartPad[position])), 0));
assert.deepEqual(positionPadAssignmentOptions,
  [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0]);

// Even an unrestricted secret 29-way substitution plus any permutation of
// complete words cannot map this 16-word source passage to original LP2 p55.
console.log(JSON.stringify({
  corpus: {pages: 55, printedWords: parsed.words.length, runes: parsed.runeCount},
  model: 'permutation of complete printed words preserving GP word lengths',
  sourceSets: sources.map(s => ({name: s.name, wordCount: s.lengths.length})),
  illustratedChapters: sectionResults,
  originalPageExactBagHits: exactHits,
  p55Britannica: {candidateStartWord: 140754, distinctSourceWords: 16,
    missingEqualityPatterns: missingShapes,
    repeatedWordPositionAdditivePad: restartPad,
    sourceWordAssignmentOptions: positionPadAssignmentOptions,
    fullWordAssignmentPossible: false,
    globalSubstitutionPossible: false},
  status: 'no complete-chapter source crib; two incidental exact single-page inventory hits'
}, null, 2));

'use strict';

/**
 * Original-source p0 black249 / opening-chapter 158-word / p50 2-cycle gate.
 * Read-only, deterministic Node.js 22 single-file test.
 *
 * Scope: source-word/cardinality navigation, not LP2 decryption.
 * Source inputs are resources/liber-primus/lp2-{corpus,grid-256,ink-annotations}.json
 * and resources/liber-primus/lp2-transcription.txt.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words, physicalLP2Page} = require('./lp2_word_pages.cjs');

/** @param {string} name @returns {string} */
function sourceText(name) {
  return fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8');
}

/** @param {string} name @returns {any} */
function sourceJson(name) {
  return JSON.parse(sourceText(name));
}

/** @param {string} s @returns {string} */
function digest(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

const corpus = sourceJson('lp2-corpus.json');
const grid = sourceJson('lp2-grid-256.json');
const ink = sourceJson('lp2-ink-annotations.json');
const transcript = sourceText('lp2-transcription.txt');
const words = parseLP2Words(transcript).words;
const originalPages = corpus.pages.filter(p => p.page <= 55);
const pageByPhysical = new Map(originalPages.map(p => [p.page, p]));
const inkByPhysical = new Map(ink.pages.map(p => [p.page, p]));

assert.equal(words.length, 2896);
assert.equal(originalPages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(originalPages.length, 56);
assert.equal(pageByPhysical.get(50).indices.length, 0);
assert.equal(grid.bytes.length, 256);

const starts = ink.pages
  .filter(p => p.page < 56 && (p.red_spans || []).some(s => s.start === 0))
  .map(p => p.page);
assert.deepEqual(starts, [0, 3, 8, 15, 23, 27, 33, 40, 54]);

const table = grid.bytes;
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);

/** @param {string} token @returns {number} */
function base59(token) {
  assert.equal(token.length, 2);
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return 59 * high + low;
}

const chapters = starts.map((firstPage, i) => {
  const endPageExclusive = starts[i + 1] ?? 56;
  const firstPageCount = pageByPhysical.get(firstPage).indices.length;
  const headingRedCount = (inkByPhysical.get(firstPage).red_spans || [])
    .filter(s => s.start === 0).reduce((n, s) => n + s.length, 0);
  const firstPageBlackCount = firstPageCount - headingRedCount;
  const wordCount = words.filter(w => {
    const physical = physicalLP2Page(w.startPage);
    return physical >= firstPage && physical < endPageExclusive;
  }).length;
  const addressable = firstPageBlackCount < 256 && wordCount < 256;
  return {
    firstPage, lastPage: endPageExclusive - 1, headingRedCount,
    firstPageBlackCount, wordCount, addressable,
    reciprocal: addressable &&
      table[firstPageBlackCount] === wordCount &&
      table[wordCount] === firstPageBlackCount
  };
});

assert.deepEqual(chapters.map(c => c.wordCount), [
  158, 255, 383, 437, 224, 326, 378, 669, 66
]);
assert.deepEqual(chapters.map(c => c.firstPageBlackCount), [
  249, 201, 243, 150, 197, 215, 204, 223, 223
]);
assert.equal(pageByPhysical.get(0).indices.length, 262);
assert.equal(chapters[0].headingRedCount, 13);
assert.equal(chapters[0].firstPageBlackCount, 249);
assert.equal(chapters[0].wordCount, 158);
assert.equal(tokens[249], '2c');
assert.equal(tokens[158], '49');
assert.equal(table[249], 158);
assert.equal(table[158], 249);
assert.equal(base59(tokens[249]), 156);
assert.equal(base59(tokens[158]), 245);
assert.deepEqual(chapters.filter(c => c.reciprocal).map(c => c.firstPage), [0]);

// Exact fixed-original-token-multiset shuffle baseline, with all nine
// visible chapters charged. Only four (blackCount, wordCount) pairs can
// address the table; two of these are impossible because the table does not
// contain the required reciprocal targets.
const counts = Array(256).fill(0);
for (const value of table) counts[value]++;
const addressable = chapters.filter(c => c.addressable);
assert.deepEqual(addressable.map(c => [c.firstPageBlackCount, c.wordCount]), [
  [249, 158], [201, 255], [197, 224], [223, 66]
]);
assert.equal(counts[158], 1);
assert.equal(counts[249], 3);
assert.equal(counts[201], 2);
assert.equal(counts[255], 1);
assert.equal(counts[224], 0);
assert.equal(counts[223], 0);

// All addresses and target values in the two nonzero branches are distinct,
// making this inclusion-exclusion probability exact under uniform permutations.
const pairP0 = counts[158] * counts[249] / (256 * 255);
const pairP3 = counts[201] * counts[255] / (256 * 255);
const intersection = counts[158] * counts[249] * counts[201] * counts[255] /
  (256 * 255 * 254 * 253);
const familyProbability = pairP0 + pairP3 - intersection;
assert.ok(Math.abs(pairP0 - 0.000045955882352941176) < 1e-15);
assert.ok(Math.abs(familyProbability - 0.00007659170698873057) < 1e-15);

// Plant, then invert the same 2-cycle without changing any other original
// cells, as a minimal independent regression of the typed navigation rule.
const plant = table.slice();
plant[249] = 158;
plant[158] = 249;
assert.equal(plant[plant[249]], 249);
assert.equal(plant[plant[158]], 158);

console.log(JSON.stringify({
  classification: 'source-count-matched, conditional base60 p50 two-cycle, no plaintext',
  inputSha256: Object.fromEntries([
    'lp2-corpus.json', 'lp2-grid-256.json',
    'lp2-ink-annotations.json', 'lp2-transcription.txt'
  ].map(name => [name, digest(sourceText(name))])),
  chapters, tableCycle: [
    {cell: 249, token: tokens[249], base60: table[249], base59: base59(tokens[249])},
    {cell: 158, token: tokens[158], base60: table[158], base59: base59(tokens[158])}
  ],
  fixedMultiset: {
    originalValueCounts: {158: counts[158], 249: counts[249], 201: counts[201], 255: counts[255]},
    fixedChapter1Probability: pairP0,
    anyVisibleChapterProbability: familyProbability,
    probabilityIncludes: 'all nine source-visible opening heading chapters; impossible targets contribute zero'
  },
  inferenceLimit: 'the count-to-cell addressing convention and use of the opening chapter were recognized after inspecting the graph; no discovery-adjusted significance, cipher, key, or plaintext'
}, null, 2));

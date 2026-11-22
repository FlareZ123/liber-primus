'use strict';

/**
 * Source-original lower bound on the missing repair-decision channel in the
 * provisional p15 red-3299 / 3301, six-back T(x)=24-2*x (mod29) hypothesis.
 *
 * This proves only that the specified collision-repair layer is many-to-one
 * without 79 independent original-site repair choices. It does not imply
 * the actual author used lag6 or a collision-repair cipher.
 *
 * Windows 11 / Node.js 22: node sims/lp2_lag6_79_preimages_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {any} */
function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const ink = readJSON('resources/liber-primus/lp2-ink-annotations.json');
const shared = parseSharedCorpus();
const alphabet = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const words = shared.words.map((word) =>
  Array.from(word.runes, (glyph) => {
    const index = alphabet.get(glyph);
    assert.notEqual(index, undefined, 'Unrecognized GP29 glyph');
    return index;
  }));
assert.equal(words.length, 2896);
assert.equal(shared.runeCount, 12956);
assert.equal(shared.crossPageWords, 32);

const locations = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices.map((rune, offset) =>
    ({page: p.page, offset, rune})));
const original = words.flat();
assert.equal(locations.length, 12956);
assert.deepEqual(original, locations.map((site) => site.rune),
  'Complete words must preserve exact original global rune order');

const redSites = new Set();
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    for (let i = 0; i < span.length; i++) {
      redSites.add(page.page + ':' + (span.start + i));
    }
  }
}
const mod29 = (value) => ((value % 29) + 29) % 29;
/** @param {number} x @returns {number} */
const sourceT = (x) => mod29(3301 - (3301 - 3299) * x);
assert.equal(sourceT(0), 24);
assert.equal(sourceT(1), 22);
assert.equal(sourceT(28), 26);

let global = 0;
let opportunities = 0;
let matches = 0;
let afterSixDoublets = 0;
let forcedStrictRepeatContradictions = 0;
const ambiguous = [];
for (let w = 0; w < words.length; w++) {
  const word = words[w];
  for (let j = 6; j < word.length; j++) {
    opportunities++;
    const emitted = word[j];
    const previous = word[j - 1];
    const echo = sourceT(word[j - 6]);
    if (emitted === previous) {
      afterSixDoublets++;
      if (echo !== previous) forcedStrictRepeatContradictions++;
    }
    if (emitted === echo) {
      matches++;
      if (emitted !== previous) {
        const site = locations[global + j];
        ambiguous.push({
          word: w, wordOffset: j, globalOffset: global + j,
          physicalPage: site.page, pageOffset: site.offset,
          published: emitted, priorPublished: previous,
          markedRed: redSites.has(site.page + ':' + site.offset)
        });
      }
    }
  }
  global += word.length;
}
assert.equal(global, 12956);
assert.equal(opportunities, 1290);
assert.equal(matches, 80);
assert.equal(afterSixDoublets, 9);
assert.equal(ambiguous.length, 79);
assert.equal(ambiguous.filter((site) => site.markedRed).length, 2);
assert.deepEqual(ambiguous.slice(0, 4).map((site) =>
  [site.physicalPage, site.pageOffset, site.globalOffset]),
  [[0, 31, 31], [0, 70, 70], [0, 72, 72], [0, 165, 165]]);

/**
 * Conditional collision-repair layer, with a published-ciphertext lag6 tap.
 * "true" means the provisional input must equal previous published output;
 * then the published rune is replaced by T(published[j-6]).
 *
 * @param {number[][]} raw
 * @param {boolean[][]} flags
 * @returns {number[][]}
 */
function forward(raw, flags) {
  const out = [];
  let last = null;
  for (let w = 0; w < raw.length; w++) {
    const row = [];
    assert.equal(raw[w].length, flags[w].length);
    for (let j = 0; j < raw[w].length; j++) {
      let symbol = raw[w][j];
      if (flags[w][j]) {
        assert(j >= 6, 'Six-back tap unavailable at this word position');
        assert.equal(symbol, last, 'Repair requires a tentative collision');
        symbol = sourceT(row[j - 6]);
      }
      row.push(symbol);
      last = symbol;
    }
    out.push(row);
  }
  return out;
}
const rawLiteral = words.map((word) => word.slice());
const rawRepaired = words.map((word) => word.slice());
const literalFlags = words.map((word) => word.map(() => false));
const repairedFlags = words.map((word) => word.map(() => false));
for (const site of ambiguous) {
  rawRepaired[site.word][site.wordOffset] = site.priorPublished;
  repairedFlags[site.word][site.wordOffset] = true;
}
const literal = forward(rawLiteral, literalFlags);
const repaired = forward(rawRepaired, repairedFlags);
assert.deepEqual(literal, words, 'All-literal preimage replays the original');
assert.deepEqual(repaired, words, '79-repair preimage replays same original');
assert.equal(rawLiteral.flat().filter((symbol, i) =>
  symbol !== rawRepaired.flat()[i]).length, 79);

// Each listed site is a separate optional flag. The output remains fixed,
// so later tests still see identical previously *published* ciphertext.
const parityFlags = repairedFlags.map((row, w) => row.map((x, j) =>
  x && (ambiguous.findIndex((site) =>
    site.word === w && site.wordOffset === j) % 2 === 0)));
const parityRaw = words.map((word) => word.slice());
for (const site of ambiguous) {
  if (parityFlags[site.word][site.wordOffset]) {
    parityRaw[site.word][site.wordOffset] = site.priorPublished;
  }
}
assert.deepEqual(forward(parityRaw, parityFlags), words,
  'Independent mixed-flag preimage replays original');

const byPage = Object.entries(Object.groupBy(ambiguous,
  (site) => site.physicalPage)).map(([page, sites]) =>
  ({physicalPage: Number(page), ambiguousSites: sites.length}));
console.log(JSON.stringify({
  status: 'PASS',
  source: {completeWords: words.length, originalRunes: original.length,
    joinedCrossPageWords: shared.crossPageWords,
    p15RedCell: 3299, cicadaNumber: 3301, sourceMap: 'T(x)=(24-2*x) mod29',
    lag6SelectedByOriginal: false, authorCipherAuthenticated: false},
  original: {lag6Opportunities: opportunities, lag6Echoes: matches,
    lag6WithinWordDoublets: afterSixDoublets,
    forcedStrictRepairContradictions: forcedStrictRepeatContradictions,
    twoPreimageSites: ambiguous.length,
    redColocatedSites: ambiguous.filter((site) => site.markedRed).length,
    minimumDistinctProvisionalStreams: (1n << BigInt(ambiguous.length)).toString(),
    byPage, first12: ambiguous.slice(0, 12)},
  exactForwardReplay: {
    allLiteralOriginal: literal.flat().length,
    all79RepairsOriginal: repaired.flat().length,
    alternatingFlagsOriginal: forward(parityRaw, parityFlags).flat().length
  },
  interpretation: 'For the stated ciphertext-tapped replacement layer with free latent flags, the unchanged published input admits 2^79 distinct tentative raw streams. Neither a unique GP plaintext nor the flag channel can be recovered from this rule alone. Additional source-selected constraints and a key are required.'
}, null, 2));

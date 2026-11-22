'use strict';

/**
 * Exact source-native GP29 word-circumference partition and literal-peel SFT.
 * Run from the repository root: node sims/lp2_word_circumference_sft.cjs
 * Uses no cipher fitting, dictionary tuning, or external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const tape = JSON.parse(read('im-results/lp2-word-circumference-tapes.json'));
const runes = new Map(corpus.runes.map((glyph, value) => [glyph, value]));
const chunks = transcript.split('%');
const sourcePages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const separators = new Set(['-', '.', '&', '$', '§']);
assert.equal(corpus.runes.length, 29);
assert.equal(sourcePages.length, 55);
assert.equal(chunks.length, 57);

/**
 * A word can be carried across a page break; physical page ends are not
 * word delimiters. The source's punctuation and line breaks stay unchanged.
 * @returns {Array<{runes: number[], pages: number[]}>}
 */
function parseUnknown() {
  const output = [];
  let current = [], pages = [];
  const stopCounts = {};
  for (let part = 0; part < sourcePages.length; part++) {
    const page = sourcePages[part];
    let count = 0;
    for (const glyph of chunks[part]) {
      if (runes.has(glyph)) {
        current.push(runes.get(glyph));
        pages.push(page.page);
        count++;
      } else if (separators.has(glyph)) {
        stopCounts[glyph] = (stopCounts[glyph] || 0) + 1;
        if (current.length) {
          output.push({runes: current, pages});
          current = [];
          pages = [];
        }
      }
    }
    assert.equal(count, page.indices.length, 'source page ' + page.page);
  }
  if (current.length) output.push({runes: current, pages});
  assert.deepEqual(stopCounts, {'-': 2727, '.': 175, '&': 17, '$': 8});
  return output;
}

/** @param {number[]} word @returns {{shell: number[], interior: number[]}} */
function peel(word) {
  assert(word.length >= 1);
  return {
    shell: word.length === 1 ? word.slice() : [word[0], word[word.length - 1]],
    interior: word.slice(1, -1)
  };
}

/**
 * Restores the original complete word, including F (GP index 0).
 * @param {{shell: number[], interior: number[]}} record
 * @returns {number[]}
 */
function restore(record) {
  assert(record.shell.length === 1 || record.shell.length === 2);
  return record.shell.length === 1
    ? record.shell.slice()
    : [record.shell[0], ...record.interior, record.shell[1]];
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = new Uint32Array(29);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

/** @param {number} actual @param {number} expected @returns {void} */
function approx(actual, expected) {
  assert(Math.abs(actual - expected) < 1e-11, actual + ' != ' + expected);
}

const words = parseUnknown();
assert.equal(words.length, 2896);
const original = words.flatMap((record) => record.runes);
assert.equal(original.length, 12956);
assert.deepEqual(original, corpus.pages.slice(0, 56).flatMap((page) => page.indices));
const peeled = words.map((record) => peel(record.runes));
assert.deepEqual(peeled.flatMap((record) => restore(record)), original);
assert.equal(words.filter((word) => new Set(word.pages).size > 1).length, 32);

const shellWords = peeled.map((record) => record.shell.map((n) => corpus.runes[n]).join(''));
const interiorWords = peeled.map((record) => record.interior.map((n) => corpus.runes[n]).join(''));
assert.deepEqual(shellWords, tape.shells);
assert.deepEqual(interiorWords, tape.interiors);
assert.equal(interiorWords.filter((word) => word.length === 0).length, 531);
const shells = peeled.flatMap((record) => record.shell);
const interiors = peeled.flatMap((record) => record.interior);
assert.equal(shells.length, 5709);
assert.equal(interiors.length, 7247);
approx(ioc(original), 0.03447839786450569);
approx(ioc(shells), 0.03448286020560609);
approx(ioc(interiors), 0.034473457584607424);

const carries = words.flatMap((word, i) => {
  const pages = [...new Set(word.pages)];
  return pages.length > 1 ? [{wordIndex: i, pages}] : [];
});
assert.deepEqual(carries, tape.carriedWords);

/** @param {number} lo @param {number} hi @returns {object} */
function section(lo, hi) {
  const selected = words.filter((word) => word.pages.some((page) => page >= lo && page <= hi));
  const partitioned = selected.map((word) => peel(word.runes));
  return {
    words: selected.length,
    full: selected.reduce((sum, word) => sum + word.runes.length, 0),
    shell: partitioned.reduce((sum, word) => sum + word.shell.length, 0),
    interior: partitioned.reduce((sum, word) => sum + word.interior.length, 0),
    iocInterior: ioc(partitioned.flatMap((word) => word.interior))
  };
}
const p0 = section(0, 2);
const holdout = section(40, 53);
assert.deepEqual([p0.words, p0.full, p0.interior, p0.shell], [158, 729, 418, 311]);
assert.deepEqual([holdout.words, holdout.full, holdout.interior, holdout.shell], [669, 3008, 1683, 1325]);
approx(p0.iocInterior, 0.034135371128934174);
approx(holdout.iocInterior, 0.034562594540212224);

// Genuine p57 is cleartext GP29. Its own shell and interior channels
// remain strongly nonuniform under the SAME literal operation.
const p57 = [];
let current = [];
for (const glyph of chunks[56]) {
  if (runes.has(glyph)) current.push(runes.get(glyph));
  else if (separators.has(glyph) && current.length) {
    p57.push(current);
    current = [];
  }
}
if (current.length) p57.push(current);
assert.equal(p57.length, 20);
const p57Full = p57.flat();
assert.equal(p57Full.length, 95);
assert.deepEqual(p57Full, corpus.pages[57].indices);
const p57Inner = p57.flatMap((word) => peel(word).interior);
const p57Shell = p57.flatMap((word) => peel(word).shell);
assert.deepEqual([p57Inner.length, p57Shell.length], [55, 40]);
approx(ioc(p57Full), 0.06270996640537514);
approx(ioc(p57Inner), 0.07138047138047138);
approx(ioc(p57Shell), 0.07307692307692308);

// Synthetic exact restoration: one-rune, two-rune, F, middle-bearing,
// and a fictitious page-carried word treated as a single lexical token.
for (const word of [[0], [0, 1], [0, 1, 2], [23, 0, 18, 0, 10]]) {
  assert.deepEqual(restore(peel(word)), word);
}
const carried = [3, 5, 0, 12, 29 - 1];
assert.deepEqual(restore(peel(carried)), carried);

console.log(JSON.stringify({
  test: 'literal first/last GP29 word-shell partition',
  originalRunes: original.length,
  words: words.length,
  carriedWords: carries.length,
  emptyInteriors: 531,
  shellRunes: shells.length,
  interiorRunes: interiors.length,
  sourceIoc: ioc(original),
  shellIoc: ioc(shells),
  interiorIoc: ioc(interiors),
  originalSections: {p0to2: p0, p40to53Holdout: holdout},
  clearControlP57: {
    runes: p57Full.length, words: p57.length,
    interiorRunes: p57Inner.length, shellRunes: p57Shell.length,
    sourceIoc: ioc(p57Full), interiorIoc: ioc(p57Inner), shellIoc: ioc(p57Shell)
  },
  exactOriginalReconstruction: true,
  syntheticWordEdgeCases: true
}, null, 2));

'use strict';

// Test whether p51's 72 numeric panel values are a source-selected ordering key
// for the 72 runes left after shedding one edge rune from each printed word.
// Run from any directory with Node 22:
//   node sims/lp2_p51_numeric_sort_wordedge_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const page = grid.pages.find((p) => p.page === 51);
const sourcePage = corpus.pages.find((p) => p.page === 51);
assert.ok(page && sourcePage);
assert.equal(page.rows, 9);
assert.equal(page.cols, 8);
assert.equal(page.bytes.length, 72);
assert.equal(page.tokens.length, 72);

const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const segments = transcription.split('%');
function extractRunes(s) {
  return Array.from(s).filter((r) => runeToIndex.has(r)).map((r) => runeToIndex.get(r));
}
const sourceSegment = segments.find((s) => {
  const a = extractRunes(s);
  return a.length === sourcePage.indices.length && a.every((x, i) => x === sourcePage.indices[i]);
});
assert.ok(sourceSegment, 'could not align original p51 transcription segment');
const clean = sourceSegment.replace(/[\\r\\n/]/g, '').replace(/[&$]/g, '-');
const words = clean.split(/[-.]/)
  .map((token) => Array.from(token).filter((r) => runeToIndex.has(r)).map((r) => runeToIndex.get(r)))
  .filter((w) => w.length);
assert.equal(words.length, 20);
assert.equal(words.reduce((s, w) => s + w.length, 0), 92);
assert.equal(sourcePage.indices.length, 92);

const panel = page.bytes;
assert.equal(new Set(panel).size, 66);
const keyValue = (v, mode) => mode === 'full' ? v : mode === 'high' ? Math.floor(v / 60) : v % 60;
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x] += 1;
  const n = values.length;
  return counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}
function translitWord(word) {
  return word.map((x) => corpus.translit[x]).join('');
}
function stableOrder(keys, mode, descending) {
  const order = keys.map((_, i) => i);
  order.sort((a, b) => {
    const d = keyValue(keys[a], mode) - keyValue(keys[b], mode);
    return descending ? -d : d;
  });
  return order;
}
function sortWithinWords(inputWords, edge, mode, descending) {
  let offset = 0;
  const output = [];
  for (const word of inputWords) {
    const kept = edge === 'first' ? word.slice(1) : word.slice(0, -1);
    const keys = panel.slice(offset, offset + kept.length);
    offset += kept.length;
    const order = stableOrder(keys, mode, descending);
    const sorted = order.map((i) => kept[i]);
    const inverse = Array(order.length);
    order.forEach((originalIndex, sortedIndex) => { inverse[originalIndex] = sortedIndex; });
    assert.deepEqual(inverse.map((i) => sorted[i]), kept, 'within-word permutation inverse');
    output.push(sorted);
  }
  assert.equal(offset, 72);
  return output;
}
function sortGlobally(inputWords, edge, mode, descending) {
  const kept = inputWords.flatMap((word) => edge === 'first' ? word.slice(1) : word.slice(0, -1));
  assert.equal(kept.length, 72);
  const order = stableOrder(panel, mode, descending);
  const sorted = order.map((i) => kept[i]);
  const inverse = Array(order.length);
  order.forEach((originalIndex, sortedIndex) => { inverse[originalIndex] = sortedIndex; });
  assert.deepEqual(inverse.map((i) => sorted[i]), kept, 'global permutation inverse');
  return sorted;
}

const results = [];
for (const edge of ['first', 'last']) {
  for (const mode of ['full', 'high', 'low']) {
    for (const descending of [false, true]) {
      const within = sortWithinWords(words, edge, mode, descending);
      const global = sortGlobally(words, edge, mode, descending);
      results.push({
        edge,
        key: mode,
        direction: descending ? 'descending' : 'ascending',
        withinWordIoC: ioc(within.flat()),
        withinWordOutput: within.map(translitWord).join(' '),
        globalIoC: ioc(global),
        globalOutput: global.map((x) => corpus.translit[x]).join(''),
      });
    }
  }
}

process.stdout.write(JSON.stringify({
  physicalPage: 51,
  source: 'original p51 9x8 panel and 92-rune/20-word transcription',
  panelTokens: page.tokens,
  panelValuesBase60: panel,
  panelUniqueValues: new Set(panel).size,
  panelDuplicates: panel.length - new Set(panel).size,
  wordLengths: words.map((w) => w.length),
  droppedFirstRetainedRunes: words.reduce((s, w) => s + w.length - 1, 0),
  droppedLastRetainedRunes: words.reduce((s, w) => s + w.length - 1, 0),
  tieRule: 'stable original position',
  testedVariants: results.length,
  results,
  positivePermutationRoundTrips: 'PASS',
}, null, 2) + '\\n');

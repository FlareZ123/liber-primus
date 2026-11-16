"use strict";

/**
 * Single-file original-input test for the 256 table-cell / 256 red+dot event
 * hypothesis. Original 225 rune identities and 31 explicit 13-dot markers
 * are kept separate. The main all-permutation invariant requires no guessed
 * table traversal, root, cipher key, or alphabet substitution.
 *
 * Run with Node.js 22 from the repository root:
 *   node sims/lp2_red256_table_permutation_invariant_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const annotations = read("resources/liber-primus/lp2-ink-annotations.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const solved = read("resources/external/relikd-solved-gp29-native-v1.json");
const pages = new Map(corpus.pages.map(page => [page.page, page]));
const events = [];

for (const page of [...annotations.pages].sort((a, b) => a.page - b.page)) {
  const source = pages.get(page.page);
  assert(source, "missing original ciphertext page " + page.page);
  const local = [];
  let serial = 0;
  // Original annotated offset i means a printed mark before rune i.
  for (const [offset, size] of page.large_punctuation || []) {
    if (size === 13) local.push({offset, order: 0, serial: serial++, rune: null});
  }
  for (const span of [...(page.red_spans || [])].sort((a, b) => a.start - b.start)) {
    assert.equal([...span.runes].length, span.length);
    for (let j = 0; j < span.length; j++) {
      const offset = span.start + j;
      const rune = source.indices[offset];
      assert.equal(corpus.runes[rune], [...span.runes][j],
        "source red-rune mismatch page " + page.page + " offset " + offset);
      local.push({offset, order: 1, serial: serial++, rune});
    }
  }
  local.sort((a, b) => a.offset - b.offset || a.order - b.order || a.serial - b.serial);
  events.push(...local.map(event => ({...event, page: page.page})));
}
assert.equal(events.length, 256);
const red = events.filter(event => event.rune !== null).map(event => event.rune);
assert.equal(red.length, 225);
assert.equal(events.length - red.length, 31);
assert.equal(annotations.counts.red, 225);
assert.equal(grid.bytes.length, 256);
assert.deepEqual(grid.pages.flatMap(page => page.bytes), grid.bytes);

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    counts[value]++;
  }
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const sourceIoc = ioc(red);
assert(Math.abs(sourceIoc - 0.03321428571428572) < 1e-14);

/** @type {number[]} */
const english = [];
for (const section of solved.sections) for (const glyph of [...section.source_text]) {
  const rune = corpus.runes.indexOf(glyph);
  if (rune !== -1) english.push(rune);
}
assert.equal(english.length, 2979);

const WINDOW = 225;
let minWindowIoc = Infinity, minWindowOffset = -1, passingWindows = 0;
for (let i = 0; i + WINDOW <= english.length; i++) {
  const value = ioc(english.slice(i, i + WINDOW));
  if (value < minWindowIoc) {
    minWindowIoc = value;
    minWindowOffset = i;
  }
  if (value <= sourceIoc) passingWindows++;
}
assert.equal(english.length - WINDOW + 1, 2755);
assert.equal(passingWindows, 0);
assert(Math.abs(minWindowIoc - 0.053214285714285714) < 1e-14);

// One source-motivated complete-permutation example: sort 256 event positions
// by matching p49-51 printed bytes; ties use source event order. The inverse
// uses positions, avoiding any false claim of unique-value lookup.
const original = events.map((event, index) => ({
  ...event, index, byte: grid.bytes[index]
}));
const sorted = [...original].sort((a, b) => a.byte - b.byte || a.index - b.index);
const restore = sortedEntries => {
  const restored = Array(sortedEntries.length);
  for (const item of sortedEntries) restored[item.index] = item;
  return restored;
};
assert.deepEqual(restore(sorted).map(e => e.rune), original.map(e => e.rune));
assert.deepEqual(sorted.map(e => e.byte).slice().sort((a, b) => a - b),
  grid.bytes.slice().sort((a, b) => a - b));

const sortedRed = sorted.filter(event => event.rune !== null).map(event => event.rune);
assert.equal(ioc(sortedRed), sourceIoc);

// Positive plant: replace source red slots with 225 authentic solved GP runes,
// retain all 31 dot slots, transform and invert without knowing the plaintext.
let next = 0;
const plant = original.map(e => ({...e, rune: e.rune === null ? null : english[next++]}));
assert.equal(next, 225);
const permutedPlant = [...plant].sort((a, b) => a.byte - b.byte || a.index - b.index);
assert.deepEqual(restore(permutedPlant).map(e => e.rune), plant.map(e => e.rune));
assert.equal(ioc(permutedPlant.filter(e => e.rune !== null).map(e => e.rune)),
  ioc(english.slice(0, 225)));

const first80 = sortedRed.slice(0, 80).map(value => corpus.translit[value]).join("");
console.log(JSON.stringify({
  status: "source-conditioned all-permutation exclusion, no plaintext recovered",
  eventCount: events.length,
  redRunes: red.length,
  thirteenDotMarks: events.length - red.length,
  preservedRedRuneIoC: sourceIoc,
  solvedControlRunes: english.length,
  fullWidthSolvedControlWindows: 2755,
  minimumSolvedWindowIoC: minWindowIoc,
  minimumSolvedWindowOffset: minWindowOffset,
  solvedWindowsAtOrBelowRedIoC: passingWindows,
  oneStableTableSort: {first80RuneTransliteration: first80,
    roundTrip: true, preservedIoC: ioc(sortedRed)},
  syntheticPositive: "225/225 solved-source runes + all 31 marks restored",
  decision: "Any permutation of the original 225 red runes, regardless of p50 byte ordering, preserves a source-native frequency profile below all 2,755 pinned 225-rune solved-source controls. Require an actual rune-value transformation or independent plaintext evidence."
}, null, 2));

"use strict";
/**
 * Director #2273, source-physical punctuation as a proposed exception channel.
 *
 * Conditional hypothesis: the 175 physically printed punctuation glyphs
 * delimit 86 successive pairs, each bracketing exactly one of the 86 actual
 * adjacent-equal GP29 rune transitions; the three unused glyphs are header
 * or terminal marks. The 29-letter alphabet makes the no-repeat register
 * a natural 28-choice channel, but it does not establish this hypothesis.
 *
 * All four ways to place the three spare marks before/after the 86 pairs are
 * examined. This is a necessary-condition test, not a plaintext decoder:
 * if a pair encloses zero or multiple repeat events, the literal one-exception
 * per-pair sidecar cannot reconstruct the original rune stream.
 *
 * Node.js 22 (Windows 11): node sims/lp2_physical_markpair_repeat_framing_original_sft.cjs
 * Read-only; no external dependencies or generated files.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {any} */
const read = relative => JSON.parse(fs.readFileSync(
  path.join(root, relative), "utf8"
));
const gp = read("resources/liber-primus/lp2-corpus.json");
const inventory = read("resources/liber-primus/lp2-punctuation-identity.json");
const audit = inventory.source_audit;

/** @type {Set<number>} */
const omitted = new Set(audit.audited_scope.excluded_editorial_stop_indices);
for (const exception of audit.morphology.physical_placements.exceptions) {
  if (exception.status === "no-source-glyph-found") {
    omitted.add(exception.event_index);
  }
}
assert.deepEqual([...omitted].sort((a, b) => a - b), [57, 58, 59, 60, 125]);
const marks = inventory.events.filter(event => !omitted.has(event.index));
assert.equal(inventory.events.length, 180);
assert.equal(marks.length, 175);
assert.equal(audit.counts.visible_all_marks_including_31_large, 175);

const ciphertext = gp.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(ciphertext.length, 12956);
/** @type {number[]} */
const repeats = [];
for (let i = 1; i < ciphertext.length; i++) {
  if (ciphertext[i] === ciphertext[i - 1]) repeats.push(i);
}
assert.equal(repeats.length, 86);

/**
 * Count adjacent-equal events strictly after the left mark and no later
 * than the right mark, in original rune-offset order.
 * @param {number} left
 * @param {number} right
 * @param {number[]} events
 * @returns {number}
 */
function eventCount(left, right, events) {
  return events.filter(pos => pos > left && pos <= right).length;
}

/**
 * Inspect one original-glyph pairing. phase=0..3 puts the three spare
 * physical marks at the beginning/end without inventing mark positions.
 * @param {{rune_offset:number}[]} punctuation
 * @param {number[]} events
 * @param {number} phase
 * @param {number} pairCount
 * @returns {{phase:number,pairs:number,single:number,empty:number,multiple:number,eventsWithin:number,histogram:Record<string,number>}}
 */
function brackets(punctuation, events, phase, pairCount) {
  const histogram = {};
  for (let j = 0; j < pairCount; j++) {
    const left = punctuation[phase + 2 * j].rune_offset;
    const right = punctuation[phase + 2 * j + 1].rune_offset;
    assert.ok(left <= right);
    const n = eventCount(left, right, events);
    histogram[n] = (histogram[n] || 0) + 1;
  }
  return {
    phase, pairs: pairCount,
    single: histogram[1] || 0,
    empty: histogram[0] || 0,
    multiple: pairCount - (histogram[1] || 0) - (histogram[0] || 0),
    eventsWithin: Object.entries(histogram)
      .reduce((sum, [number, count]) => sum + Number(number) * count, 0),
    histogram
  };
}

const positive = brackets(
  [1, 3, 5, 7, 9, 11].map(rune_offset => ({rune_offset})),
  [2, 6, 10], 0, 3
);
assert.equal(positive.single, 3);
assert.equal(positive.empty, 0);
assert.equal(positive.multiple, 0);

const observed = [0, 1, 2, 3].map(phase =>
  brackets(marks, repeats, phase, 86)
);
assert.deepEqual(observed.map(x => [x.single, x.empty, x.multiple]), [
  [24, 56, 6],
  [15, 60, 11],
  [23, 57, 6],
  [14, 60, 12]
]);

console.log(JSON.stringify({
  verdict: "REJECT conditional one-repeat-per-two-physical-marks framing",
  issue: 2273,
  originalRuneCount: ciphertext.length,
  adjacentEqualRuneEvents: repeats.length,
  physicallyVisiblePunctuationMarks: marks.length,
  sourceExcludedEditorialOrAbsentEventIndices: [...omitted].sort((a,b) => a-b),
  sourcePositiveControl: "3/3 synthetic repeat-bracketing pairs correctly detected",
  sourceOriginalFourHeaderTerminalPlacements: observed,
  limitation: "Other source-selected variable-capacity or encrypted punctuation channels remain untested; no plaintext/key recovered"
}, null, 2));

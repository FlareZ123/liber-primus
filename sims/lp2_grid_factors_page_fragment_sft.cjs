"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const annotations = readJson("resources/liber-primus/lp2-ink-annotations.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");
const mod29 = (x) => ((x % 29) + 29) % 29;
function inv29(x) {
  for (let k = 1; k < 29; k++) if (mod29(x * k) === 1) return k;
  throw new Error("zero leading coefficient");
}
function remainderHighToLow(input, divisor) {
  assert(input.length >= divisor.length);
  const work = input.map(mod29);
  const leadingInverse = inv29(divisor[0]);
  for (let i = 0; i <= work.length - divisor.length; i++) {
    const q = mod29(work[i] * leadingInverse);
    for (let j = 0; j < divisor.length; j++)
      work[i + j] = mod29(work[i + j] - q * divisor[j]);
  }
  return work.slice(-(divisor.length - 1));
}
const H = [24, 26, 3]; // 3 + 26X + 24X^2, high-degree first
const G = [15, 5, 27]; // 27 + 5X + 15X^2, high-degree first
const zero = (r) => r.every((x) => x === 0);

// Positive control: the original 256-byte table is divisible by both.
assert.equal(grid.bytes.length, 256);
assert.deepEqual(remainderHighToLow(grid.bytes, H), [0, 0]);
assert.deepEqual(remainderHighToLow(grid.bytes, G), [0, 0]);

// The unknown manuscript is p0-p55; p50 is rune-free.
const unknownPages = corpus.pages
  .filter((p) => p.page <= 55 && p.indices.length > 0)
  .sort((a, b) => a.page - b.page);
assert.equal(unknownPages.length, 55);
const sourcePages = corpus.pages.filter((p) => p.page <= 55).sort((a, b) => a.page - b.page);
const unknownRunes = sourcePages.flatMap((p) => p.indices);
assert.equal(unknownRunes.length, 12956);

// Read each physical page in printed order as high-to-low coefficients.
const pageRows = unknownPages.map((p) => ({
  page: p.page, length: p.indices.length,
  h: remainderHighToLow(p.indices, H), g: remainderHighToLow(p.indices, G),
}));
const pageHPasses = pageRows.filter((r) => zero(r.h)).map((r) => r.page);
const pageGPasses = pageRows.filter((r) => zero(r.g)).map((r) => r.page);
const pageBothPass = pageRows.filter((r) => zero(r.h) && zero(r.g)).map((r) => r.page);
assert.deepEqual(pageHPasses, []);
assert.deepEqual(pageGPasses, [29]);
assert.deepEqual(pageBothPass, []);
assert.deepEqual(pageRows.find((r) => r.page === 29), {
  page: 29, length: 277, h: [16, 20], g: [0, 0],
});

// Use the original-image-audited ink annotations for 13-dot cut positions.
// A local offset k follows the k preceding runes; coincident marks stay distinct.
const annotationByPage = new Map(annotations.pages.map((p) => [p.page, p]));
const all13Marks = annotations.pages.flatMap((p) =>
  (p.large_punctuation || []).filter((m) => m[1] === 13)
);
assert.equal(all13Marks.length, 31);
assert.equal(annotations.counts.red13 + annotations.counts.black13, 31);
let prefix = 0;
const unknownMarks = [];
for (const p of sourcePages) {
  for (const [local, dots, color] of annotationByPage.get(p.page)?.large_punctuation || []) {
    if (dots === 13) {
      assert(local >= 0 && local <= p.indices.length);
      unknownMarks.push({ page: p.page, local, offset: prefix + local, color });
    }
  }
  prefix += p.indices.length;
}
assert.equal(prefix, 12956);
assert.equal(unknownMarks.length, 28);
assert.equal(all13Marks.length - unknownMarks.length, 3); // solved p56-p57
const offsets = unknownMarks.map((m) => m.offset);
assert.deepEqual(offsets, [
  13,729,745,848,851,1541,1552,1860,1860,1874,3603,3603,3612,3623,
  5506,5522,6527,6546,7960,7970,8051,8059,9519,9522,9640,12648,12657,12956,
]);
const counts = new Map();
for (const offset of offsets) counts.set(offset, (counts.get(offset) || 0) + 1);
const duplicates = [...counts.entries()].filter(([, n]) => n > 1)
  .map(([offset]) => offset).sort((a, b) => a - b);
assert.deepEqual(duplicates, [1860, 3603]);

// Preserve every cut, including two coincident pairs and the terminal mark.
const fragments = [];
let cursor = 0;
for (const mark of unknownMarks) {
  fragments.push({ index: fragments.length, start: cursor, end: mark.offset, length: mark.offset - cursor });
  cursor = mark.offset;
}
fragments.push({ index: fragments.length, start: cursor, end: unknownRunes.length, length: unknownRunes.length - cursor });
const lengths = fragments.map((f) => f.length);
assert.equal(fragments.length, 29);
assert.equal(fragments.filter((f) => f.length > 0).length, 26);
assert.deepEqual(fragments.filter((f) => f.length === 0).map((f) => f.index), [8, 11, 28]);
assert.equal(fragments.filter((f) => f.length > 0 && f.length < 3).length, 0);
assert.deepEqual(lengths, [
  13,716,16,103,3,690,11,308,0,14,1729,0,9,11,1883,16,1005,19,1414,
  10,81,8,1460,3,118,3008,9,299,0,
]);
const fragmentRows = fragments.filter((f) => f.length >= 3).map((f) => {
  const seq = unknownRunes.slice(f.start, f.end);
  return { index: f.index, start: f.start, end: f.end, length: f.length,
    h: remainderHighToLow(seq, H), g: remainderHighToLow(seq, G) };
});
const fragmentHPasses = fragmentRows.filter((r) => zero(r.h)).map((r) => r.index);
const fragmentGPasses = fragmentRows.filter((r) => zero(r.g)).map((r) => r.index);
assert.equal(fragmentRows.length, 26);
assert.deepEqual(fragmentHPasses, []);
assert.deepEqual(fragmentGPasses, []);

console.log(JSON.stringify({
  factors: { H_high_to_low: H, G_high_to_low: G, field: "GF(29)" },
  table_control: { bytes: grid.bytes.length, h: remainderHighToLow(grid.bytes, H), g: remainderHighToLow(grid.bytes, G) },
  pages: { tested: pageRows.length, runes: unknownRunes.length, h_passes: pageHPasses, g_passes: pageGPasses, both_pass: pageBothPass, p29: pageRows.find((r) => r.page === 29) },
  fragments: {
    total_13_dot_marks: all13Marks.length, unknown_marks: unknownMarks.length, solved_marks_excluded: 3,
    unique_unknown_offsets: new Set(offsets).size, duplicate_offsets: duplicates,
    intervals_including_empty: fragments.length, nonempty: fragmentRows.length,
    empty_interval_indices: [8, 11, 28], lengths, h_passes: fragmentHPasses, g_passes: fragmentGPasses,
  },
}, null, 2));

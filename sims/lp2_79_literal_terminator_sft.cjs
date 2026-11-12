"use strict";
/**
 * SFT for Director #577: exact literal A/U/G/C reading at the original
 * five-numbered-paragraph / 79-step enclosure. No fitted phase or mapping.
 * Run: node sims/lp2_79_literal_terminator_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const load = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const book = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(load("resources/liber-primus/lp2-ink-annotations.json"));
const transcript = load("resources/lp2-transcription.txt").split("%").slice(0, 55);
const offsets = new Map();
const all = [];
for (const p of book.pages.filter((p) => p.page <= 55)) {
  offsets.set(p.page, all.length);
  all.push(...p.indices);
}
assert.equal(all.length, 12956);
const rune = /[\u16A0-\u16FF]/u;
const labels = [];
for (let p = 36; p <= 38; p++) {
  let local = 0;
  const page = transcript[p];
  assert.equal([...page].filter((c) => rune.test(c)).length,
    book.pages.find((q) => q.page === p).indices.length);
  for (let i = 0; i < page.length; i++) {
    if (rune.test(page[i])) local++;
    else if (/^[1-5]$/.test(page[i]) && page[i + 1] === "-")
      labels.push({number: Number(page[i]), offset: offsets.get(p) + local});
  }
}
assert.deepEqual(labels.map((x) => x.number), [1, 2, 3, 4, 5]);
assert.deepEqual(labels.map((x) => x.offset),
  [8805, 8944, 9035, 9133, 9229]);
const largeMarks = ink.pages.flatMap((p) =>
  (p.large_punctuation || []).filter((m) => m[1] === 10)
    .map((m) => ({offset: offsets.get(p.page) + m[0], color: m[2]})));
assert.deepEqual(largeMarks.slice(0, 2).map((x) => x.offset), [8805, 9358]);
assert.ok(largeMarks.slice(0, 2).every((x) => x.color === "red"));
const pair = Array.from({length: 8}, (_, j) => 8804 + 79 * j);
assert.equal(pair[0] + 553, pair[7]);
const names = (is) => is.map((i) => book.translit[all[i]]);
assert.deepEqual(names(pair), ["H", "U", "A", "A", "U", "A", "G", "C"]);
const preceding = Array.from({length: 8}, (_, j) => 8251 + 79 * j);
assert.deepEqual(names(preceding), ["T", "N", "IA", "S", "D", "R", "AE", "H"]);
const bases = new Set(["A", "U", "G", "C"]);
const salt = [];
for (let i = 35; i < all.length; i += 79)
  salt.push(book.translit[all[i]]);
assert.equal(salt.length, 164);
assert.equal(salt.filter((x) => bases.has(x)).length, 23);
assert.equal(salt.join("").includes("AUG"), false);
let maxRun = 0, current = 0;
for (const x of salt) {
  current = bases.has(x) ? current + 1 : 0;
  maxRun = Math.max(maxRun, current);
}
assert.equal(maxRun, 7);
const pageStarts = [...offsets.values()];
const stops = [1, 4].map((j) => {
  const loc = pair.slice(j, j + 3);
  const headingCrossings = labels.filter((h) =>
    h.offset > loc[0] && h.offset < loc[2]).map((h) => h.offset);
  const pageCrossings = pageStarts.filter((p) =>
    p > loc[0] && p < loc[2]);
  assert.ok(!labels.some((h) => h.offset === loc[0]));
  assert.ok(!pageStarts.includes(loc[0]));
  assert.ok(!largeMarks.some((m) => m.offset === loc[0]));
  return {start: loc[0], end: loc[2], codon: names(loc).join(""),
    headingCrossings, pageCrossings};
});
assert.deepEqual(stops, [
  {start:8883, end:9041, codon:"UAA",
   headingCrossings:[8944,9035], pageCrossings:[8944]},
  {start:9120, end:9278, codon:"UAG",
   headingCrossings:[9133,9229], pageCrossings:[9172]}
]);
console.log(JSON.stringify({
  classification:"literal RNA-terminator decoding fails source-anchored frame",
  sample: names(pair).join(""), precedingControl: names(preceding),
  stops, phase35BaseCount:23, phase35Length:164,
  phase35AUG:0, longestLiteralBaseRun:7,
  sourceSelectedStartCodon:false, decodedKeyOrPlaintext:false
}, null, 2));

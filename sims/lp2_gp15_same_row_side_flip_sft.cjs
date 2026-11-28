"use strict";

/**
 * GP15 same-row side-flip anti-repeat gate.
 *
 * Decompose each GP29 rune by the literal published chart:
 *   row(i)=i for i<15 else i-15
 *   side(i)=left/right table.
 *
 * When two adjacent ciphertext runes have the same vertical row, ask whether
 * they stay on the same symbol/side (exact repeat) or flip to the row mate.
 * Scan every same-length native-GP control window exhaustively.
 *
 * SFT: node sims/lp2_gp15_same_row_side_flip_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const row = (i) => i < 15 ? i : i - 15;

function encodeText(text) {
  const out = [];
  for (const raw of (text.toUpperCase().match(/[A-Z]+/g) || [])) {
    const s = raw.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < s.length;) {
      if (s.startsWith("ING", i)) { out.push(21); i += 3; continue; }
      if (s.startsWith("IO", i)) { out.push(27); i += 2; continue; }
      const t = tokens.find((x) => s.startsWith(x.s, i));
      if (!t) { i++; continue; }
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}

function transitionCounts(a, start, n) {
  let sameRow = 0;
  let exact = 0;
  for (let i = start + 1; i < start + n; i++) {
    if (row(a[i]) === row(a[i - 1])) {
      sameRow++;
      if (a[i] === a[i - 1]) exact++;
    }
  }
  return {sameRow, exact};
}

function exhaustiveRange(a, n) {
  let {sameRow, exact} = transitionCounts(a, 0, n);
  let min = exact / sameRow;
  let max = min;
  let minAt = 0, maxAt = 0;
  let minCounts = [sameRow, exact], maxCounts = [sameRow, exact];
  const windows = a.length - n + 1;

  for (let start = 1; start < windows; start++) {
    const oldA = a[start - 1], oldB = a[start];
    if (row(oldA) === row(oldB)) {
      sameRow--;
      if (oldA === oldB) exact--;
    }

    const newA = a[start + n - 2], newB = a[start + n - 1];
    if (row(newA) === row(newB)) {
      sameRow++;
      if (newA === newB) exact++;
    }

    const rate = exact / sameRow;
    if (rate < min) {
      min = rate; minAt = start; minCounts = [sameRow, exact];
    }
    if (rate > max) {
      max = rate; maxAt = start; maxCounts = [sameRow, exact];
    }
  }
  return {windows, min, minAt, minCounts, max, maxAt, maxCounts};
}

const source = gp.pages.filter((p) => p.page < 56 && p.indices.length)
  .flatMap((p) => p.indices);
assert.equal(source.length, 12956);
const sourceCounts = transitionCounts(source, 0, source.length);
assert.deepEqual(sourceCounts, {sameRow: 538, exact: 86});
const sourceRate = sourceCounts.exact / sourceCounts.sameRow;
assert.ok(Math.abs(sourceRate - 0.15985130111524162) < 1e-15);

const controls = [
  ["Shakespeare", encodeText(read("resources/control/shakespeare_first300k.txt"))],
  ["Gibran", encodeText(read("resources/control/gibran_prophet_58585.txt"))],
  ["Emerson", encodeText(read("resources/control/emerson_essays_2944.txt"))]
];
const expected = new Map([
  ["Shakespeare", [204151, 0.395748987854251, 71864, 988, 391]],
  ["Gibran", [49537, 0.3657262277951933, 17098, 957, 350]],
  ["Emerson", [308372, 0.33822091886608013, 290858, 1023, 346]]
]);

const ranges = [];
for (const [name, stream] of controls) {
  const result = exhaustiveRange(stream, source.length);
  const e = expected.get(name);
  assert.equal(result.windows, e[0]);
  assert.ok(Math.abs(result.min - e[1]) < 1e-15);
  assert.equal(result.minAt, e[2]);
  assert.deepEqual(result.minCounts, [e[3], e[4]]);
  assert.ok(sourceRate < result.min);
  ranges.push({name, ...result});
}

assert.equal(ranges.reduce((s, x) => s + x.windows, 0), 562060);


function perRowCounts(a) {
  const out = Array.from({length: 15}, () => ({same: 0, exact: 0}));
  for (let i = 1; i < a.length; i++) {
    const r = row(a[i]);
    if (r === row(a[i - 1])) {
      out[r].same++;
      if (a[i] === a[i - 1]) out[r].exact++;
    }
  }
  return out;
}

const sourceByRow = perRowCounts(source);
const controlByRow = Array.from({length: 15}, () => ({same: 0, exact: 0}));
for (const [, stream] of controls) {
  const rows = perRowCounts(stream);
  for (let r = 0; r < 15; r++) {
    controlByRow[r].same += rows[r].same;
    controlByRow[r].exact += rows[r].exact;
  }
}
const pairedRowComparison = [];
for (let r = 0; r < 14; r++) {
  const sourceExactRate = sourceByRow[r].exact / sourceByRow[r].same;
  const controlExactRate = controlByRow[r].exact / controlByRow[r].same;
  assert.ok(sourceExactRate < controlExactRate);
  pairedRowComparison.push({row: r, sourceExactRate, controlExactRate,
    sourceSame: sourceByRow[r].same, sourceExact: sourceByRow[r].exact});
}
assert.deepEqual(sourceByRow[14], {same: 6, exact: 6});


const transcription = read("resources/lp2-transcription.txt");
const pageParts = transcription.split("%").slice(0, 56);
let previous = null;
let between = "";
const repeatLocations = {internal: 0, wordBoundary: 0, pageBoundary: 0,
  chapterBoundary: 0};
for (let p = 0; p < pageParts.length; p++) {
  between = p === 0 ? "" : "%";
  for (const ch of pageParts[p]) {
    const rune = gp.runes.indexOf(ch);
    if (rune >= 0) {
      if (previous !== null && rune === previous) {
        const pageBoundary = between.includes("%");
        const chapterBoundary = between.includes("$");
        const wordBoundary = [...between].some((x) =>
          !gp.runes.includes(x) && x !== "%" && x !== "/" && !/\s/u.test(x));
        if (pageBoundary) repeatLocations.pageBoundary++;
        if (chapterBoundary) repeatLocations.chapterBoundary++;
        if (wordBoundary) repeatLocations.wordBoundary++;
        if (!pageBoundary && !chapterBoundary && !wordBoundary)
          repeatLocations.internal++;
      }
      previous = rune;
      between = "";
    } else {
      between += ch;
    }
  }
}
assert.deepEqual(repeatLocations, {
  internal: 80, wordBoundary: 6, pageBoundary: 0, chapterBoundary: 0
});

console.log(JSON.stringify({
  source: {
    runes: source.length,
    sameRowTransitions: sourceCounts.sameRow,
    exactRepeats: sourceCounts.exact,
    exactGivenSameRow: sourceRate,
    mateFlipGivenSameRow: 1 - sourceRate
  },
  controls: ranges.map((x) => ({
    name: x.name,
    windows: x.windows,
    minimumExactGivenSameRow: x.min,
    minimumCounts: x.minCounts,
    minimumAt: x.minAt
  })),
  exhaustiveControlWindows: 562060,
  allPairedRowsBelowAggregateNativeExactRate: true,
  pairedRowComparison,
  exactRepeatLocations: repeatLocations
}, null, 2));

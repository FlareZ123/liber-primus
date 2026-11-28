"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const annotations = JSON.parse(
  read("resources/liber-primus/lp2-ink-annotations.json")
);
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const rune = /[\u16A0-\u16FF]/u;

/** @param {string} text */
function pageWords(text) {
  const words = [];
  let length = 0;
  let start = 0;
  let offset = 0;

  function flush() {
    if (!length) return;
    words.push({ start, end: offset - 1, length });
    length = 0;
  }

  for (const char of [...text]) {
    if (rune.test(char)) {
      if (!length) start = offset;
      length += 1;
      offset += 1;
    } else if (
      char === "-" ||
      char === "." ||
      char === "&" ||
      char === "$" ||
      char === "᛭" ||
      char === "⁕"
    ) {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[]} widths @returns {number[]} */
function outsideInMagnitudes(widths) {
  assert.equal(widths.length, 4);
  const [a, b, c, d] = widths;
  return [Math.abs(a - d), Math.abs(b - c), b + c, a + d];
}

/** @param {number[]} widths @param {Array<[number,number]>} pairs */
function pairMagnitudes(widths, pairs) {
  return pairs.flatMap(([i, j]) => [
    Math.abs(widths[i] - widths[j]),
    widths[i] + widths[j],
  ]);
}

/** @param {number[]} widths @param {number[]} magnitudes */
function completesOneToSix(widths, magnitudes) {
  const values = [...new Set([...widths, ...magnitudes])].sort((a, b) => a - b);
  return values.length === 6 && values.every((value, index) => value === index + 1);
}

const redWindows = [];
const exactFourWordRedSpans = [];
let p6Bracketed = false;

for (const page of annotations.pages) {
  if (!page.red_spans) continue;
  const words = pageWords(parts[page.page] || "");
  const punctuation = page.large_punctuation || [];

  for (const span of page.red_spans) {
    const end = span.start + span.length - 1;
    const contained = words.filter(
      (word) => word.start >= span.start && word.end <= end
    );

    const exact =
      contained.length > 0 &&
      contained[0].start === span.start &&
      contained[contained.length - 1].end === end &&
      contained.reduce((sum, word) => sum + word.length, 0) === span.length;

    if (exact && contained.length === 4) {
      exactFourWordRedSpans.push({
        page: page.page,
        start: span.start,
        widths: contained.map((word) => word.length),
      });
    }

    for (let index = 0; index + 3 < contained.length; index += 1) {
      const window = contained.slice(index, index + 4);
      // A red subwindow must be contiguous in rune space.
      const contiguous = window.every(
        (word, i) => i === 0 || word.start === window[i - 1].end + 1
      );
      if (!contiguous) continue;
      const widths = window.map((word) => word.length);
      if (completesOneToSix(widths, outsideInMagnitudes(widths))) {
        redWindows.push({
          page: page.page,
          start: window[0].start,
          widths,
        });
      }
    }

    if (page.page === 6 && span.start === 71 && span.length === 11) {
      const startMark = punctuation.some(
        ([offset, dots, ink]) => offset === 71 && dots === 13 && ink === "red"
      );
      const endMark = punctuation.some(
        ([offset, dots, ink]) => offset === 82 && dots === 13 && ink === "red"
      );
      p6Bracketed = startMark && endMark;
    }
  }
}

assert.deepEqual(exactFourWordRedSpans, [
  { page: 6, start: 71, widths: [4, 1, 4, 2] },
  { page: 23, start: 0, widths: [2, 6, 3, 5] },
  { page: 54, start: 0, widths: [1, 4, 2, 2] },
]);
assert.equal(p6Bracketed, true);
assert.deepEqual(redWindows, [
  { page: 6, start: 71, widths: [4, 1, 4, 2] },
]);

const p6Widths = [4, 1, 4, 2];
const pairings = [
  { name: "outside-in", pairs: [[0, 3], [1, 2]] },
  { name: "adjacent", pairs: [[0, 1], [2, 3]] },
  { name: "crossing", pairs: [[0, 2], [1, 3]] },
];
const pairingCharge = pairings.map(({ name, pairs }) => {
  const magnitudes = pairMagnitudes(p6Widths, pairs);
  return {
    name,
    magnitudes,
    completes: completesOneToSix(p6Widths, magnitudes),
  };
});
assert.deepEqual(pairingCharge, [
  { name: "outside-in", magnitudes: [2, 6, 3, 5], completes: true },
  { name: "adjacent", magnitudes: [3, 5, 2, 6], completes: true },
  { name: "crossing", magnitudes: [0, 8, 1, 3], completes: false },
]);

// Existing signed H4 is the oriented outside-in serialization.
const mod29 = (value) => ((value % 29) + 29) % 29;
const h4 = [
  mod29(p6Widths[0] - p6Widths[3]),
  mod29(p6Widths[1] - p6Widths[2]),
  mod29(p6Widths[1] + p6Widths[2]),
  mod29(p6Widths[0] + p6Widths[3]),
];
assert.deepEqual(h4, [2, 26, 5, 6]);

const mirrorPairs = [[30, 42], [31, 41], [32, 40], [33, 39], [34, 38], [35, 37]];
const separations = mirrorPairs.map(([left, right]) => right - left);
const K = p6Widths[3];
const halfGaps = separations.map((value) => value / K);
assert.deepEqual(separations, [12, 10, 8, 6, 4, 2]);
assert.deepEqual(halfGaps, [6, 5, 4, 3, 2, 1]);

// The labels come only from the p6 title/H packet.
const state = {
  one: p6Widths[1],
  K,
  e: 29 - h4[1],
  q: p6Widths[0],
  g: h4[2],
  a: h4[3],
};
assert.deepEqual(state, { one: 1, K: 2, e: 3, q: 4, g: 5, a: 6 });
assert.deepEqual(halfGaps, [state.a, state.g, state.q, state.e, state.K, state.one]);

// Whole-book baseline: the length pattern alone is not globally unique.
let ordinaryWindows = 0;
const ordinaryHits = [];
for (let page = 0; page <= 55; page += 1) {
  const words = pageWords(parts[page] || "");
  for (let index = 0; index + 3 < words.length; index += 1) {
    ordinaryWindows += 1;
    const widths = words.slice(index, index + 4).map((word) => word.length);
    if (completesOneToSix(widths, outsideInMagnitudes(widths))) {
      ordinaryHits.push({ page, ordinal: index + 1, widths });
    }
  }
}
assert.equal(ordinaryWindows, 2785);
assert.equal(ordinaryHits.length, 33);
assert.ok(
  ordinaryHits.some(
    (hit) =>
      hit.page === 6 &&
      hit.widths.join(",") === "4,1,4,2"
  )
);

console.log(JSON.stringify({
  status: "PASS",
  p6Widths,
  h4,
  pairingCharge,
  state,
  mirrorPairs,
  separations,
  halfGaps,
  exactFourWordRedSpans,
  redWindowHits: redWindows,
  wholeBook: {
    windows: ordinaryWindows,
    hits: ordinaryHits.length,
  },
  decision: "p6 source geometry locally motivates outside-in H-like pairing, but does not select signed H4 serialization or mirror numeric Q/D order",
}, null, 2));

"use strict";

/**
 * SFT: source-visible geometry of the frozen p0 READ OUT receiver.
 *
 * Verifies p0 offsets80..102, physical line crossing, center rune, ink and
 * punctuation metadata, and a whole-manuscript matched census of 23-rune
 * four-word windows. This is a negative operation-selector audit.
 *
 * Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const override = JSON.parse(
  read("resources/liber-primus/lp2-p0-physical-ink-override.json")
);

const image = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "17.jpg")
);
assert.equal(
  crypto.createHash("sha256").update(image).digest("hex"),
  "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e"
);
assert.deepEqual(override.original_jpeg.size_pixels, [2400, 3600]);

const runeIndex = new Map(
  corpus.runes.map((rune, index) => [rune, index])
);
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {number} page
 * @returns {{
 *   words:Array<{start:number,end:number,values:number[]}>,
 *   lines:Array<{line:number,start:number,end:number,count:number}>
 * }}
 */
function parsePage(page) {
  const words = [];
  const lines = [];
  let current = [];
  let wordStart = 0;
  let offset = 0;
  let lineNumber = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({
      start: wordStart,
      end: offset - 1,
      values: current.slice(),
    });
    current = [];
  };

  for (const raw of physicalPart(page).split(/\r?\n/u)) {
    const lineStart = offset;
    let count = 0;

    for (const char of [...raw]) {
      if (runeSet.has(char)) {
        if (!current.length) wordStart = offset;
        current.push(runeIndex.get(char));
        offset += 1;
        count += 1;
      } else if (char === "-" || char === ".") {
        flush();
      }
    }

    if (count) {
      lineNumber += 1;
      lines.push({
        line: lineNumber,
        start: lineStart,
        end: offset - 1,
        count,
      });
    }
  }
  flush();
  return {words, lines};
}

/**
 * @param {Array<{start:number,end:number,values:number[]}>} words
 * @param {number} center
 * @returns {number}
 */
function valueAt(words, center) {
  const word = words.find((item) =>
    center >= item.start && center <= item.end);
  assert.ok(word);
  return word.values[center - word.start];
}

/**
 * @param {Array<{start:number,end:number,values:number[]}>} words
 * @param {Array<{line:number,start:number,end:number,count:number}>} lines
 * @param {number} first
 * @returns {{
 *  start:number,end:number,lengths:number[],center:string,
 *  lineBreaks:number,crosses:number[][]
 * }}
 */
function describeWindow(words, lines, first) {
  const window = words.slice(first, first + 4);
  assert.equal(window.length, 4);
  const start = window[0].start;
  const end = window[3].end;
  const center = start + 11;
  const boundaries = lines.slice(0, -1)
    .map((line) => line.end)
    .filter((boundary) => boundary >= start && boundary < end);
  const crosses = [];

  for (let index = 0; index < window.length; index += 1) {
    for (const boundary of boundaries) {
      if (
        boundary >= window[index].start &&
        boundary < window[index].end
      ) {
        crosses.push([
          index + 1,
          boundary - window[index].start + 1,
        ]);
      }
    }
  }

  return {
    start,
    end,
    lengths: window.map((word) => word.values.length),
    center: corpus.translit[valueAt(window, center)],
    lineBreaks: boundaries.length,
    crosses,
  };
}

const p0 = parsePage(0);
assert.deepEqual(
  p0.lines.map((line) => [line.line, line.start, line.end, line.count]),
  [
    [1,0,19,20], [2,20,42,23], [3,43,61,19], [4,62,83,22],
    [5,84,107,24], [6,108,128,21], [7,129,149,21], [8,150,172,23],
    [9,173,195,23], [10,196,215,20], [11,216,238,23], [12,239,261,23],
  ]
);

const target = describeWindow(p0.words, p0.lines, 17);
assert.deepEqual(target, {
  start: 80,
  end: 102,
  lengths: [3,7,5,8],
  center: "F",
  lineBreaks: 1,
  crosses: [[2,1]],
});

assert.deepEqual(
  p0.words.slice(17, 21).map((word) =>
    [word.start, word.end, word.values.length]),
  [[80,82,3], [83,89,7], [90,94,5], [95,102,8]]
);

const p0Ink = ink.pages.find((page) => page.page === 0);
assert.ok(p0Ink);
assert.deepEqual(p0Ink.red_spans, [{
  start: 0,
  length: 13,
  runes: override.physical_zero_based.red_words
    .map((word) => word.runes)
    .join(""),
}]);
assert.deepEqual(p0Ink.large_punctuation, [[13,13,"red"]]);
assert.equal(
  p0Ink.red_spans.some((span) =>
    span.start <= target.end &&
    span.start + span.length - 1 >= target.start),
  false
);
assert.equal(
  p0Ink.large_punctuation.some(([after]) =>
    after >= target.start && after <= target.end + 1),
  false
);

const matched = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(page);
  for (let first = 0; first + 3 < parsed.words.length; first += 1) {
    const row = describeWindow(parsed.words, parsed.lines, first);
    if (row.end - row.start + 1 !== 23) continue;
    matched.push({
      page,
      firstWord: first + 1,
      ...row,
    });
  }
}

assert.equal(matched.length, 117);
assert.equal(matched.filter((row) => row.page === 0).length, 4);
assert.equal(matched.filter((row) => row.lineBreaks === 1).length, 105);
assert.equal(
  matched.filter((row) =>
    JSON.stringify(row.crosses) === JSON.stringify([[2,1]])).length,
  5
);
assert.equal(matched.filter((row) => row.center === "F").length, 4);
assert.equal(
  matched.filter((row) =>
    JSON.stringify(row.lengths) === JSON.stringify([3,7,5,8])).length,
  1
);
assert.equal(
  matched.filter((row) =>
    row.center === "F" &&
    JSON.stringify(row.crosses) === JSON.stringify([[2,1]])).length,
  1
);

assert.deepEqual(
  matched
    .filter((row) => row.page === 0)
    .map((row) => ({
      firstWord: row.firstWord,
      start: row.start,
      end: row.end,
      lengths: row.lengths,
      center: row.center,
      lineBreaks: row.lineBreaks,
      crosses: row.crosses,
    })),
  [
    {
      firstWord: 5, start: 20, end: 42,
      lengths: [3,11,5,4], center: "I", lineBreaks: 0, crosses: [],
    },
    {
      firstWord: 6, start: 23, end: 45,
      lengths: [11,5,4,3], center: "N", lineBreaks: 1, crosses: [],
    },
    {
      firstWord: 18, start: 80, end: 102,
      lengths: [3,7,5,8], center: "F", lineBreaks: 1, crosses: [[2,1]],
    },
    {
      firstWord: 51, start: 221, end: 243,
      lengths: [7,7,2,7], center: "H", lineBreaks: 1, crosses: [[4,2]],
    },
  ]
);

console.log(JSON.stringify({
  status: "PASS",
  imageSha256:
    "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e",
  target,
  sourceVisibleInk: {
    redOverlap: false,
    largePunctuationOverlap: false,
    p0RedRange: [0,12],
    p0LargeMarkAfter: 13,
  },
  matchedControls: {
    fourWord23RuneWindows: matched.length,
    oneLineBreak: matched.filter((row) => row.lineBreaks === 1).length,
    secondWordSplitAfterOne:
      matched.filter((row) =>
        JSON.stringify(row.crosses) === JSON.stringify([[2,1]])).length,
    centerF: matched.filter((row) => row.center === "F").length,
    exactLengthVector:
      matched.filter((row) =>
        JSON.stringify(row.lengths) === JSON.stringify([3,7,5,8])).length,
    centerFAndBreakPattern:
      matched.filter((row) =>
        row.center === "F" &&
        JSON.stringify(row.crosses) === JSON.stringify([[2,1]])).length,
  },
  decision:
    "The receiver has distinctive geometry but no local source-visible selector for H, radial reading, shell direction or DH state order.",
}, null, 2));

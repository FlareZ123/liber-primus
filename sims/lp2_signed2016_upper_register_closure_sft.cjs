"use strict";

/**
 * Agent12 SFT: signed-2016 upper-register closure from the already fixed
 * p55-directed line-wrap H coordinate grammar.
 *
 * Node.js 22 / CommonJS. Reads canonical repository resources only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/** @param {number} x @param {number} y @returns {[number, number]} */
function H(x, y) {
  return [((x - y) % 29 + 29) % 29, (x + y) % 29];
}

/** @param {number[]} values @returns {number[]} */
function hSequence(values) {
  const out = [];
  for (let layer = 0; layer < Math.floor(values.length / 2); layer += 1) {
    out.push(...H(values[layer], values[values.length - 1 - layer]));
  }
  if (values.length % 2 === 1) {
    out.push(values[(values.length - 1) / 2]);
  }
  return out;
}

/** @param {number[]} values @param {number} split @returns {number[]} */
function lineWrapUnion(values, split) {
  return [
    ...hSequence(values),
    ...hSequence(values.slice(0, split)),
    ...hSequence(values.slice(split)),
  ];
}

/**
 * @param {number[]} values
 * @returns {Array<[number, number, number]>}
 */
function consecutiveRuns(values) {
  const set = new Set(values);
  const out = [];
  for (let start = 0; start < 29; start += 1) {
    if (start > 0 && set.has(start - 1)) continue;
    let end = start;
    while (end < 29 && set.has(end)) end += 1;
    if (end > start) out.push([start, end - 1, end - start]);
  }
  out.sort((a, b) => b[2] - a[2] || a[0] - b[0]);
  return out;
}

/** @param {[number, number, number]} run @returns {number[]} */
function expandRun(run) {
  const out = [];
  for (let value = run[0]; value <= run[1]; value += 1) out.push(value);
  return out;
}

/**
 * Lift GP29 residues into the second layer of the 43-word authenticated
 * source register. Residues 0..13 have a second valid representative 29..42.
 * @param {number[]} values
 * @returns {number[]}
 */
function upperRegister(values) {
  return [...new Set(values.filter((value) => value <= 13).map((value) => value + 29))]
    .sort((a, b) => a - b);
}

/** @typedef {{segment:number,offset:number,value:number}} Site */
/** @typedef {{page:number,ordinal:number,start:number,values:number[],breaks:number[]}} Word */

/** @type {Map<number, Word[]>} */
const wordsByPage = new Map();
/** @type {Site[]} */
let current = [];
/** @type {number[]} */
let breaks = [];
const offsets = Array(58).fill(0);
let segment = 0;

function finishWord() {
  if (current.length === 0) return;
  const segments = [...new Set(current.map((site) => site.segment))];
  if (segments.length === 1) {
    const page = physicalPage(segments[0]);
    if (page <= 55) {
      if (!wordsByPage.has(page)) wordsByPage.set(page, []);
      const pageWords = wordsByPage.get(page);
      pageWords.push({
        page,
        ordinal: pageWords.length + 1,
        start: current[0].offset,
        values: current.map((site) => site.value),
        breaks: breaks.slice(),
      });
    }
  }
  current = [];
  breaks = [];
}

for (const character of transcription) {
  if (character === "%") {
    segment += 1;
  } else if (runeIndex.has(character)) {
    current.push({
      segment,
      offset: offsets[segment],
      value: runeIndex.get(character),
    });
    offsets[segment] += 1;
  } else if (character === "/") {
    if (current.length > 0) breaks.push(current.length);
  } else if (/\s/u.test(character)) {
    // Physical whitespace does not terminate a printed word.
  } else {
    finishWord();
  }
}
finishWord();

const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/g, "");
const signedWords =
  signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);

/**
 * @param {number[]} indices
 * @returns {string[]}
 */
function sourceWords(indices) {
  return indices.map((index) => signedWords[index].toUpperCase());
}

/**
 * @param {number[]} directionSet
 * @returns {Array<{
 *   page:number,
 *   wordIndex:number,
 *   ordinal:number,
 *   start:number,
 *   length:number,
 *   split:number|null,
 *   hValues:number[],
 *   runs:Array<[number,number,number]>
 * }>}
 */
function coordinateRows(directionSet) {
  const rows = [];
  for (const pageIndex of directionSet) {
    const pageWords = wordsByPage.get(pageIndex) || [];
    for (const wordIndex of directionSet) {
      const word = pageWords[wordIndex];
      if (!word) continue;
      const split =
        word.breaks.length === 1 &&
        word.breaks[0] > 0 &&
        word.breaks[0] < word.values.length
          ? word.breaks[0]
          : null;
      const hValues = split === null ? hSequence(word.values) : lineWrapUnion(word.values, split);
      rows.push({
        page: pageIndex,
        wordIndex,
        ordinal: wordIndex + 1,
        start: word.start,
        length: word.values.length,
        split,
        hValues,
        runs: consecutiveRuns(hValues),
      });
    }
  }
  return rows;
}

/**
 * @param {ReturnType<typeof coordinateRows>} rows
 * @returns {ReturnType<typeof coordinateRows>}
 */
function lineWrapped(rows) {
  return rows.filter((row) => row.split !== null);
}

/**
 * @param {ReturnType<typeof coordinateRows>} before
 * @param {ReturnType<typeof coordinateRows>} after
 * @returns {ReturnType<typeof coordinateRows>}
 */
function newlyEnabled(before, after) {
  const prior = new Set(before.map((row) => `${row.page}:${row.wordIndex}`));
  return after.filter((row) => !prior.has(`${row.page}:${row.wordIndex}`));
}

/** @param {Set<number>} known @param {[number,number,number]} run */
function upperRunStats(known, run) {
  const upper = expandRun(run).map((value) => value + 29);
  return {
    upper,
    overlap: upper.filter((value) => known.has(value)),
    extension: upper.filter((value) => !known.has(value)),
  };
}

// Stage 0 is inherited, independently fixed p55 output.
const stage0Known = new Set([36, 37, 38]);
assert.deepEqual(sourceWords([...stage0Known]), ["GOOD", "LUCK", "BEWARE"]);

const baseDirections = [22, 23, 24, 36, 37, 38];
const baseRows = coordinateRows(baseDirections);
assert.equal(baseRows.length, 33);
const baseWrapped = lineWrapped(baseRows);
assert.equal(baseWrapped.length, 6);

const p24w24 = baseWrapped.find((row) => row.page === 24 && row.wordIndex === 23);
assert.ok(p24w24);
assert.deepEqual(p24w24.runs[0], [7, 10, 4]);
const p24w24Upper = expandRun(p24w24.runs[0]).map((value) => value + 29);
assert.deepEqual(p24w24Upper, [36, 37, 38, 39]);
assert.deepEqual(sourceWords(p24w24Upper), ["GOOD", "LUCK", "BEWARE", "FALSE"]);
assert.deepEqual(p24w24Upper.filter((value) => stage0Known.has(value)), [36, 37, 38]);
const stage1Known = new Set([...stage0Known, 39]);

// Adding only FALSE=39 produces exactly one new line-wrapped coordinate.
const stage1Directions = [...baseDirections, 39];
const stage1Rows = coordinateRows(stage1Directions);
const newStage1Wrapped = lineWrapped(newlyEnabled(baseRows, stage1Rows));
assert.equal(newStage1Wrapped.length, 1);
const p39w39 = newStage1Wrapped[0];
assert.deepEqual(
  [p39w39.page, p39w39.wordIndex, p39w39.ordinal, p39w39.start, p39w39.split],
  [39, 38, 39, 169, 5]
);
assert.deepEqual(p39w39.runs[0], [5, 9, 5]);
const p39w39Upper = expandRun(p39w39.runs[0]).map((value) => value + 29);
assert.deepEqual(p39w39Upper, [34, 35, 36, 37, 38]);
assert.deepEqual(sourceWords(p39w39Upper), ["BE", "FOUND", "GOOD", "LUCK", "BEWARE"]);
assert.deepEqual(p39w39Upper.filter((value) => stage1Known.has(value)), [36, 37, 38]);
const stage2Known = new Set([...stage1Known, 34, 35]);

// Adding BE=34 and FOUND=35 enables a small finite family.
// Only p35/word39 has a consecutive upper run that overlaps at least four
// already known upper-register values and extends the register beyond 39.
const stage2Directions = [...stage1Directions, 34, 35];
const stage2Rows = coordinateRows(stage2Directions);
const newStage2Wrapped = lineWrapped(newlyEnabled(stage1Rows, stage2Rows));
assert.equal(newStage2Wrapped.length, 5);

const extendingRows = [];
for (const row of newStage2Wrapped) {
  for (const run of row.runs) {
    const stats = upperRunStats(stage2Known, run);
    if (
      stats.overlap.length >= 4 &&
      stats.extension.some((value) => value > 39 && value <= 42)
    ) {
      extendingRows.push({ row, run, stats });
    }
  }
}
assert.equal(extendingRows.length, 1);
const p35w39 = extendingRows[0];
assert.deepEqual(
  [p35w39.row.page, p35w39.row.wordIndex, p35w39.row.ordinal, p35w39.row.start, p35w39.row.split],
  [35, 38, 39, 174, 4]
);
assert.deepEqual(p35w39.run, [7, 12, 6]);
assert.deepEqual(p35w39.stats.upper, [36, 37, 38, 39, 40, 41]);
assert.deepEqual(
  sourceWords(p35w39.stats.upper),
  ["GOOD", "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY"]
);

// The same selected receiver independently contains raw run 2..4,
// so the already established +29 lift predicts AND YOU WILL.
assert.deepEqual(p35w39.row.runs[1], [2, 4, 3]);
const p35SecondaryUpper = expandRun(p35w39.row.runs[1]).map((value) => value + 29);
assert.deepEqual(p35SecondaryUpper, [31, 32, 33]);
assert.deepEqual(sourceWords(p35SecondaryUpper), ["AND", "YOU", "WILL"]);

const stage3Known = new Set([
  ...stage2Known,
  ...p35w39.stats.upper,
  ...p35SecondaryUpper,
]);
assert.deepEqual([...stage3Known].sort((a, b) => a - b), [
  31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
]);

// Prospective cross-check after 31..35 exist: page34 / wordIndex31 is now
// source-addressable and reproduces the entire AND YOU WILL BE FOUND block.
const stage3Directions = [...stage2Directions, 31, 32, 33, 40, 41];
const stage3Rows = coordinateRows(stage3Directions);
const p34w32 = stage3Rows.find((row) => row.page === 34 && row.wordIndex === 31);
assert.ok(p34w32 && p34w32.split !== null);
assert.deepEqual(p34w32.runs[0], [2, 6, 5]);
const p34w32Upper = expandRun(p34w32.runs[0]).map((value) => value + 29);
assert.deepEqual(p34w32Upper, [31, 32, 33, 34, 35]);
assert.deepEqual(sourceWords(p34w32Upper), ["AND", "YOU", "WILL", "BE", "FOUND"]);

// Final endpoint holdout: the independently selected p24 word37 was fixed
// earlier by the lower register 9..15. Only now apply the already established
// upper lift to all of its H residues that have a valid second representative.
const p24w37 = baseWrapped.find((row) => row.page === 24 && row.wordIndex === 36);
assert.ok(p24w37);
assert.deepEqual(p24w37.runs[0], [9, 15, 7]);
const p24w37Upper = upperRegister(p24w37.hValues);
assert.deepEqual(p24w37Upper, [30, 38, 39, 40, 41, 42]);
assert.deepEqual(
  sourceWords(p24w37Upper),
  ["SEEK", "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP"]
);
assert.deepEqual(
  p24w37Upper.filter((value) => stage3Known.has(value)),
  [38, 39, 40, 41]
);
assert.deepEqual(
  p24w37Upper.filter((value) => !stage3Known.has(value)),
  [30, 42]
);

// Within the original six line-wrapped p55-direction receivers, p24 word37
// uniquely carries a five-word consecutive upper-register run 38..42.
const baseUpperRunSummary = baseWrapped.map((row) => {
  const upper = upperRegister(row.hValues);
  const runs = [];
  for (const start of upper) {
    if (upper.includes(start - 1)) continue;
    let end = start;
    while (upper.includes(end + 1)) end += 1;
    runs.push([start, end, end - start + 1]);
  }
  runs.sort((a, b) => b[2] - a[2] || a[0] - b[0]);
  return {
    page: row.page,
    wordIndex: row.wordIndex,
    bestUpperRun: runs[0],
  };
});
const fiveRunRows = baseUpperRunSummary.filter(
  (row) => row.bestUpperRun && row.bestUpperRun[2] >= 5
);
assert.deepEqual(fiveRunRows, [
  { page: 24, wordIndex: 36, bestUpperRun: [38, 42, 5] },
]);

const finalKnown = new Set([...stage3Known, 30, 42]);
assert.deepEqual([...finalKnown].sort((a, b) => a - b), [
  30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
]);
assert.deepEqual(sourceWords([...finalKnown].sort((a, b) => a - b)), [
  "SEEK", "AND", "YOU", "WILL", "BE", "FOUND",
  "GOOD", "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
]);

// Secondary endpoint check: after FALSE39 and PATHS40 are known, p40 word40
// is the natural page/word coordinate. Its physical prefix [22,20] has raw
// H-sum 42 before the routine mod29 reduction.
const p40w40 = stage3Rows.find((row) => row.page === 40 && row.wordIndex === 39);
assert.ok(p40w40 && p40w40.split === 2);
const p40Word = wordsByPage.get(40)[39];
assert.deepEqual(p40Word.values.slice(0, 2), [22, 20]);
assert.equal(p40Word.values[0] + p40Word.values[1], 42);
assert.equal(signedWords[42].toUpperCase(), "OPENPGP");

console.log(JSON.stringify({
  status: "PASS",
  initialKnown: {
    indices: [36, 37, 38],
    words: sourceWords([36, 37, 38]),
  },
  stage1: {
    selector: "p24 wordIndex23 / ordinal24",
    upperRun: p24w24Upper,
    words: sourceWords(p24w24Upper),
    newIndex: 39,
  },
  stage2: {
    newlyEnabledLineWrapped: newStage1Wrapped.length,
    selector: "p39 wordIndex38 / ordinal39",
    upperRun: p39w39Upper,
    words: sourceWords(p39w39Upper),
    newIndices: [34, 35],
  },
  stage3: {
    newlyEnabledLineWrapped: newStage2Wrapped.length,
    uniqueOverlapAndExtensionSelector: "p35 wordIndex38 / ordinal39",
    mainUpperRun: p35w39.stats.upper,
    mainWords: sourceWords(p35w39.stats.upper),
    secondaryUpperRun: p35SecondaryUpper,
    secondaryWords: sourceWords(p35SecondaryUpper),
    newIndices: [31, 32, 33, 40, 41],
  },
  crossCheck: {
    selector: "p34 wordIndex31 / ordinal32",
    upperRun: p34w32Upper,
    words: sourceWords(p34w32Upper),
  },
  endpointHoldout: {
    selector: "already-selected p24 wordIndex36 / ordinal37",
    upperValues: p24w37Upper,
    words: sourceWords(p24w37Upper),
    newIndices: [30, 42],
    originalSixReceiverUpperRunSummary: baseUpperRunSummary,
  },
  fullTerminalRegister: {
    indices: [...finalKnown].sort((a, b) => a - b),
    words: sourceWords([...finalKnown].sort((a, b) => a - b)),
  },
  p40RawEndpointCheck: {
    page: 40,
    wordIndex: 39,
    prefix: p40Word.values.slice(0, 2),
    rawSum: 42,
    word: signedWords[42].toUpperCase(),
  },
}, null, 2));

"use strict";

/**
 * Exact all-secret separator-grammar gate on unsolved LP2.
 *
 * Treat a printed punctuation boundary between two consecutive physical-page
 * runes as one binary event. The unknown rule may use an arbitrary binary
 * lookup table over the ordered GP29 digram, independently for each stated
 * public clock or source section. All possible secret tables are optimized
 * exactly, without searching their 2^841 assignments.
 *
 * A table state appearing with both boundary values forces at least
 * min(count_zero, count_one) errors. Summing these minima is the sharp lower
 * bound over every possible secret table. No plaintext-language premise.
 *
 * Run with Node.js 22: node sims/digram_boundary_anykey_gate.cjs
 * Requires the repository's original derived transcription and GP corpus.
 * Writes no files; prints a reproducible JSON report.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const sourcePages = read("resources/lp2-transcription.txt").split("%").slice(0, 55);

let section = 0;
let globalOffset = 0;
/** @type {Array<{runes:number[], boundary:number[], section:number[], offset:number[]}>} */
const pages = [];
for (const rawPage of sourcePages) {
  const runes = [];
  const boundary = [];
  const sections = [];
  const offsets = [];
  for (const ch of rawPage) {
    if (index.has(ch)) {
      runes.push(index.get(ch));
      boundary.push(0);
      sections.push(section);
      offsets.push(globalOffset++);
    } else if ("-.&$§".includes(ch)) {
      if (boundary.length > 0) boundary[boundary.length - 1] = 1;
      if (ch === "$") section++;
    }
  }
  pages.push({runes, boundary, section: sections, offset: offsets});
}

/** @typedef {{left:number,right:number,mark:number,section:number,page:number,offset:number}} Pair */
/** @type {Pair[]} */
const pairs = [];
for (let page = 0; page < pages.length; page++) {
  const row = pages[page];
  for (let i = 0; i + 1 < row.runes.length; i++) {
    pairs.push({
      left: row.runes[i], right: row.runes[i + 1],
      mark: row.boundary[i], section: row.section[i],
      page, offset: row.offset[i]
    });
  }
}
assert.equal(pages.length, 55);
assert.equal(globalOffset, 12956);
assert.equal(pairs.length, 12901);
assert.equal(pairs.reduce((n, x) => n + x.mark, 0), 2873);
assert.equal(section + 1, 9);

/**
 * Exhaustively optimize every arbitrary binary table key by group majority.
 * @param {Pair[]} rows
 * @param {(row:Pair)=>number|string} keyOf
 * @param {(row:Pair)=>number} [markOf]
 */
function gate(rows, keyOf, markOf = row => row.mark) {
  /** @type {Map<number|string,[number,number]>} */
  const counts = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    const count = counts.get(key) || [0, 0];
    count[markOf(row)]++;
    counts.set(key, count);
  }
  let conflicts = 0;
  let errors = 0;
  let positives = 0;
  let perfectlyPredictedPositives = 0;
  for (const [negative, positive] of counts.values()) {
    errors += Math.min(negative, positive);
    positives += positive;
    if (negative && positive) conflicts++;
    if (!negative) perfectlyPredictedPositives += positive;
  }
  return {
    opportunities: rows.length,
    marks: positives,
    occupiedStates: counts.size,
    conflictingStates: conflicts,
    minimumChangedDecisions: errors,
    exactPositiveOnlyStates: perfectlyPredictedPositives
  };
}

/** @param {Pair} row */
const digram = row => 29 * row.left + row.right;
const report = {
  source: "resources/lp2-transcription.txt",
  unsolvedRunes: globalOffset,
  runeBearingPages: pages.length,
  rawSourceSections: section + 1,
  globalDigram: gate(pairs, digram),
  byRawSection: gate(pairs, row => 841 * row.section + digram(row)),
  byPhysicalPage: gate(pairs, row => 841 * row.page + digram(row)),
  sourceClockPeriods: {},
  contextLengths: {}
};

for (const period of [2, 3, 5, 8, 13, 29, 32, 59, 79, 128, 256]) {
  report.sourceClockPeriods[period] = gate(
    pairs, row => 841 * (row.offset % period) + digram(row)
  );
}

/**
 * Match a local n-rune context wholly inside a single source page.
 * leftExtra precedes the left-hand rune and rightExtra follows the right.
 * @param {number} leftExtra
 * @param {number} rightExtra
 */
function contextGate(leftExtra, rightExtra) {
  /** @type {{key:string,mark:number}[]} */
  const observations = [];
  for (const page of pages) {
    for (let i = leftExtra; i + 1 + rightExtra < page.runes.length; i++) {
      observations.push({
        key: page.runes.slice(i - leftExtra, i + 2 + rightExtra).join(","),
        mark: page.boundary[i]
      });
    }
  }
  return gate(observations, row => row.key);
}
for (const [name, left, right] of [
  ["two", 0, 0],
  ["threeLeft", 1, 0],
  ["threeRight", 0, 1],
  ["fourSymmetric", 1, 1],
  ["fiveSymmetric", 2, 1],
  ["sixSymmetric", 2, 2]
]) {
  report.contextLengths[name] = contextGate(left, right);
}

// A source-native deterministic boundary plant must have zero contradictions.
const planted = gate(
  pairs, digram,
  row => Number((row.left + 3 * row.right) % 29 < 7)
);
assert.equal(planted.minimumChangedDecisions, 0);
assert.equal(report.globalDigram.minimumChangedDecisions, 2863);
assert.equal(report.byRawSection.minimumChangedDecisions, 2091);
assert.equal(report.byPhysicalPage.minimumChangedDecisions, 589);
assert.equal(report.sourceClockPeriods[256].minimumChangedDecisions, 149);
assert.equal(report.contextLengths.two.minimumChangedDecisions, 2863);
report.syntheticPositive = planted;
console.log(JSON.stringify(report, null, 2));

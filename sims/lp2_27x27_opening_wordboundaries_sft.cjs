"use strict";
/** Original-source delimiter audit for the published 27x27 opening.
 * Node.js 22, CommonJS, single runnable test, read-only.
 * Usage: node sims/lp2_27x27_opening_wordboundaries_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** Match the canonical parser: page/line wraps do not end a word.
 * @returns {Array<{start:number,end:number,indices:number[]}>}
 */
function parseWords() {
  const text = source.split("%").slice(0, 55).join("%");
  const words = [];
  let pos = 0;
  let start = 0;
  let token = [];
  function flush(separator = "") {
    if (!token.length) return;
    words.push({start, end: pos - 1, indices: token, separator});
    token = [];
  }
  for (const ch of text) {
    if (index.has(ch)) {
      if (!token.length) start = pos;
      token.push(index.get(ch));
      pos++;
    } else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch)) {
      flush(ch);
    }
  }
  flush();
  assert.equal(pos, 12956);
  assert.equal(words.length, 2896);
  return words;
}
const words = parseWords();
const first = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(first.length, 729);
const pattern = [2, 1, 2, 2];
const matches = [];
for (let i = 0; i <= words.length - pattern.length; i++) {
  const four = words.slice(i, i + 4);
  if (four.every((w, j) => w.indices.length === pattern[j])) matches.push(four);
}
assert.equal(matches.length, 1);
const only = matches[0];
assert.deepEqual(only.map(w => w.separator), [".", "-", "-", "-"]);
assert.deepEqual(only.map(w => [w.start, w.end]),
  [[348, 349], [350, 350], [351, 352], [353, 354]]);

// Candidate source-only locator. The source's typeset line break and the
// inferred 27x27 row break are distinct clocks. The conjunction below was
// formulated retrospectively after block01 was published, so it tests a
// possible human-visible selector, not a preregistered decryption.
const openingThreePages = source.split("%").slice(0, 3).join("%");
const lineEnds = new Set();
let runesBefore = 0;
for (const ch of openingThreePages) {
  if (index.has(ch)) runesBefore++;
  else if (ch === "/") lineEnds.add(runesBefore - 1);
}
assert.equal(runesBefore, 729);
const firstThreeWords = words.filter(w => w.end < 729);
const gridAndPrintCandidates = [];
for (let j = 0; j < firstThreeWords.length - 2; j++) {
  const three = firstThreeWords.slice(j, j + 3);
  if (three[0].separator !== ".") continue;
  if ((three[1].end + 1) % 27 !== 0) continue;
  if (!lineEnds.has(three[2].end)) continue;
  gridAndPrintCandidates.push(three);
}
assert.equal(gridAndPrintCandidates.length, 1);
assert.deepEqual(gridAndPrintCandidates[0].map(w => [w.start, w.end]),
  [[348,349],[350,350],[351,352]]);
assert.equal(lineEnds.has(352), true);
const phaseControls = [];
for (let phase = 0; phase < 27; phase++) {
  let hits = 0;
  for (let j = 0; j < firstThreeWords.length - 2; j++) {
    const three = firstThreeWords.slice(j, j + 3);
    if (three[0].separator === "." &&
      (three[1].end + 1 + phase) % 27 === 0 &&
      lineEnds.has(three[2].end)) hits++;
  }
  if (hits) phaseControls.push({phase, hits});
}
assert.deepEqual(phaseControls, [{phase:0,hits:1},{phase:10,hits:1}]);

const key = ["AE", "I", "EA"].map(name => corpus.translit.indexOf(name));
assert.deepEqual(key, [25, 10, 28]);
const plain = first.slice(348, 355).map((v, i) =>
  corpus.translit[(v - key[i % 3] + 29) % 29]).join("");
assert.equal(plain, "ASIGOTHE");
const cipherWords = only.map(w =>
  w.indices.map(v => corpus.translit[v]).join(""));
const sourceNext = words.find(w => w.start === 364);
assert.ok(sourceNext);
assert.equal(sourceNext.end, 369);
const k2 = ["X", "X", "I"].map(name => corpus.translit.indexOf(name));
const weather = first.slice(364, 369).map((v, i) =>
  corpus.translit[(v - k2[i % 3] + 29) % 29]).join("");
assert.equal(weather, "WEATHER");
// The published block03 starts at cell 369, within the source six-rune
// word that supplied WEATHER; the first alignment is not universal.
assert.equal(sourceNext.indices.length, 6);
console.log(JSON.stringify({
  unsolvedWords: words.length,
  matchingPatternCount: matches.length,
  matchingPositions: only.map(w => [w.start, w.end]),
  sourceCipherWords: cipherWords,
  sourceLengthPattern: pattern,
  originalDelimiters: only.map(w => w.separator),
  gridAndPrintStart: gridAndPrintCandidates[0][0].start,
  sourceLineBoundaryAfterRune: 352,
  squareRowBoundaryAfterRune: 350,
  shiftedSquarePhaseHits: phaseControls,
  punctuationPreservedReading: "AS. I GO THE",
  derivedRuneOutput: plain,
  interpretedSourceAlignedWords: ["AS", "I", "GO", "THE"],
  nextSourceWord: [sourceNext.start, sourceNext.end],
  nextProposedBlock: "WEATHER",
  nextProposedBlockPath: [364, 365, 366, 367, 368],
  followingProposedBlockStartsAt: 369,
}, null, 2));
console.log("PASS: unique original delimiter alignment, but no authenticated LP2 plaintext.");

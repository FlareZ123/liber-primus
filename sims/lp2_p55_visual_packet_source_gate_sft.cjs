"use strict";

/**
 * Issue #745: original print-lines as candidate p55 cipher packets.
 * Check the visible line boundaries and carry against a separately solved
 * source-cleartext page, without fitting unknown LP2 plaintext or a key.
 *
 * SFT: node sims/lp2_p55_visual_packet_source_gate_sft.cjs
 * Node.js 22, CommonJS, original repo inputs, no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/lp2-transcription.txt");
const RUNES = /[\u16a0-\u16ff]/gu;

/** @param {string} prefix @returns {string[]} */
function originalLines(prefix) {
  const candidates = transcript.split("%")
    .filter((section) => section.trimStart().startsWith(prefix));
  assert.equal(candidates.length, 1, "Source segment selector is unique");
  return candidates[0].split(/\r?\n/u)
    .filter((line) => /[\u16a0-\u16ff]/u.test(line));
}

/** @param {string[]} lines @returns {number[]} */
function indices(lines) {
  return lines.flatMap((line) => (line.match(RUNES) || []).map((rune) => {
    const index = corpus.runes.indexOf(rune);
    assert(index >= 0, "Source rune is in the original GP alphabet");
    return index;
  }));
}

/** @param {string[]} lines @returns {number[]} */
function lengths(lines) {
  return lines.map((line) => (line.match(RUNES) || []).length);
}

/** @param {number[]} list @returns {number[]} */
function ends(list) {
  let cursor = 0;
  return list.map((n) => (cursor += n));
}

/** @param {string[]} lines @returns {number[]} */
function printedWords(lines) {
  const joined = lines.join("").replaceAll("/", "");
  return joined.split(/[^\u16a0-\u16ff]+/u)
    .filter(Boolean)
    .map((word) => [...word].length);
}

const lines54 = originalLines("ᚪ-ᛗᛝᛞᛡᚦᛉᛁᛗ.");
const lines55 = originalLines("ᛝ-ᚫᛗᛁᚹ-");
const lines57 = originalLines("ᛈᚪᚱᚪᛒᛚᛖ.");
assert(lines54.at(-1).endsWith("ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣ/"));
assert(lines55[0].startsWith("ᛝ-"));
for (const n of [54, 55, 57]) {
  const original = corpus.pages.find((p) => p.page === n).indices;
  assert.deepEqual(indices(n === 54 ? lines54 :
    n === 55 ? lines55 : lines57), original);
}
const lengths55 = lengths(lines55);
const lengths57 = lengths(lines57);
assert.deepEqual(lengths55, [24, 22, 22, 8]);
assert.deepEqual(lengths57, [20, 17, 17, 18, 23]);

const printed55 = printedWords(lines55);
const printed57 = printedWords(lines57);
assert.deepEqual(printed55, [1, 4, 2, 2, 6, 6, 2, 13, 6, 4,
  2, 7, 7, 2, 6, 3, 3]);
assert.equal(printed57.length, 20);
assert.equal(ends(printed57).at(-1), 95);
const wordEnds55 = ends(printed55);
const wordEnds57 = ends(printed57);
const lineEnds55 = ends(lengths55);
const lineEnds57 = ends(lengths57);
const crossing55 = lineEnds55.slice(0, -1)
  .filter((at) => !wordEnds55.includes(at));
const crossing57 = lineEnds57.slice(0, -1)
  .filter((at) => !wordEnds57.includes(at));
assert.deepEqual(crossing55, [24, 68]);
assert.deepEqual(crossing57, [20, 54, 72]);
assert.equal(lineEnds55[1] - 1, 45, "Body train boundary at line2 end");
assert.equal(lineEnds55[3] - lineEnds55[1], 30,
  "Untouched final 30 body runes are physical lines3 and4");

// Original page-preserving reassembly is reversible with the recorded cuts.
// This confirms alignment ONLY; it cannot recover arbitrary new word cuts.
const roundTrip = (lines, page) => {
  const flat = indices(lines);
  const cuts = lengths(lines);
  let pos = 0;
  const packets = cuts.map((n) => flat.slice(pos, pos += n));
  assert.deepEqual(packets.flat(), corpus.pages.find((p) =>
    p.page === page).indices);
  assert.equal(pos, flat.length);
  return {page, packetLengths: cuts, exactOriginalRoundtrip: true};
};
const positives = [roundTrip(lines55, 55), roundTrip(lines57, 57)];

if (require.main === module) {
  console.log(JSON.stringify({
    decision: "No source-selected alternate p55 plaintext packet grammar",
    originalSource: "Physical p55 scan 72.jpg and exact physical line transcription",
    carry: "First p55 NG rune continues p54's final printed word",
    p55: {runes: 76, lines: lengths55, printedWords: 17,
      completePageWords: 16, lineEnds: lineEnds55,
      printedWordEnds: wordEnds55, crossWordLineEnds: crossing55,
      first45BodyEnd: lineEnds55[1], last30BodyLength: 30},
    solvedControlP57: {runes: 95, lines: lengths57,
      printedWords: 20, crossWordLineEnds: crossing57},
    sourcePreservingPositiveControls: positives,
    recoveredUnknownPlaintext: false,
    caution: "Original line breaks also split source-cleartext words on p57; neither lines nor a stencil select an alternative plaintext packet parser"
  }, null, 2));
}
module.exports = {originalLines, printedWords, ends};

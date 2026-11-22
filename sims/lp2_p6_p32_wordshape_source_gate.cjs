"use strict";
/**
 * P6 four-word red span vs. p32 single-word 11-rune candidate.
 * Exact corpus census. Records the missing source-selected partition/decoder.
 * Run from repository root: node sims/lp2_p6_p32_wordshape_source_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const pages = read("resources/lp2-transcription.txt").split("%");
const runeValues = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {string} page @param {number} pageNo */
function parseWords(page, pageNo) {
  const words = [];
  let values = [], offset = 0;
  const flush = () => {
    if (values.length) {
      words.push({ page: pageNo, start: offset - values.length, values });
      values = [];
    }
  };
  for (const rune of Array.from(page)) {
    const value = runeValues.get(rune);
    if (value !== undefined) { values.push(value); offset++; }
    else if (rune !== "/" && !/\s/u.test(rune)) flush();
  }
  flush();
  return words;
}

const wordPages = pages.map(parseWords);
const allUnknownWords = wordPages.slice(0, 56).flat();
const sum = values => values.reduce((a, b) => a + b, 0);
const translit = values => values.map(v => corpus.translit[v]).join("");

const p6 = ink.pages.find(p => p.page === 6);
const red = p6.red_spans.find(s => s.start === 71 && s.length === 11);
const redValues = Array.from(red.runes, r => runeValues.get(r));
assert.deepEqual(redValues, [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);
const redWords = wordPages[6].filter(w =>
  w.start >= 71 && w.start + w.values.length <= 82);
assert.deepEqual(redWords.map(w => w.values.length), [4, 1, 4, 2]);
assert.deepEqual(redWords.map(w => sum(w.values)), [71, 19, 65, 26]);
assert.equal(sum(redValues), 181);

const p32 = wordPages[32];
const candidate = p32.find(w => w.start === 33);
assert.ok(candidate);
assert.equal(candidate.values.length, 11);
assert.equal(translit(candidate.values), "HOMEXWDSLFD");
assert.equal(candidate.values[4], 14);
assert.equal(sum(candidate.values.slice(0, 4)), 48);
assert.equal(sum(candidate.values.slice(5, 9)), 65);
assert.equal(sum(candidate.values.slice(9, 11)), 23);

// Four genuinely printed words on p6 versus one genuinely printed word on p32.
// P32's division is only a *proposed segmentation*.
const printedPattern = [];
for (const words of wordPages.slice(0, 56)) {
  for (let i = 0; i <= words.length - 4; i++) {
    const seq = words.slice(i, i + 4);
    if (seq.map(w => w.values.length).join(",") === "4,1,4,2")
      printedPattern.push({ page: seq[0].page, start: seq[0].start });
  }
}
assert.deepEqual(printedPattern, [{ page: 6, start: 71 }]);

const eleven = allUnknownWords.filter(w => w.values.length === 11);
const middleX = eleven.filter(w => w.values[4] === 14);
const right65 = eleven.filter(w => sum(w.values.slice(5, 9)) === 65);
assert.equal(eleven.length, 28);
assert.deepEqual(middleX.map(w => [w.page, w.start]), [[9, 36], [32, 33]]);
assert.deepEqual(right65.map(w => [w.page, w.start]), [[32, 33]]);

// Receiver p32 contains 121 ciphertext runes. A requested >=150-runic
// original holdout must cross a page boundary without a source-selected clock.
const p32Runes = corpus.pages.find(p => p.page === 32).indices;
assert.equal(p32Runes.length, 121);

console.log(JSON.stringify({
  classification: "Structural correspondence only; no authenticated cipher inverse",
  p6: { redStart: 71, redEnd: 82, valueSum: 181,
    printedWords: redWords.map(w => translit(w.values)),
    lengths: [4, 1, 4, 2], sums: [71, 19, 65, 26] },
  p32: { runeCount: 121, candidateStart: 33, candidatePrintedWordCount: 1,
    candidate: translit(candidate.values), proposedSplit: [4, 1, 4, 2],
    proposedSums: [48, 14, 65, 23] },
  controls: { unknownPrintedWords: allUnknownWords.length,
    elevenRuneWords: eleven.length,
    elevenRuneWordsWithXAtPosition4: middleX.map(w => [w.page, w.start]),
    elevenRuneWordsWithRightFourSum65: right65.map(w => [w.page, w.start]),
    printed4142Pattern: printedPattern },
  unresolved: "No source instruction selects the p32 partition, key transform, reset, or 150-rune cross-page decoder"
}, null, 2));

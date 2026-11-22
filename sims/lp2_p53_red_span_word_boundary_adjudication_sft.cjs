"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotation = JSON.parse(read("resources/liber-primus/lp2-page53-red-span.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runes = new Set(corpus.runes);

assert.equal(annotation.lp2_page, 53);
assert.equal(annotation.image, "70.jpg");
assert.equal(annotation.red_text.start_rune_inclusive, 128);
assert.equal(annotation.red_text.end_rune_exclusive, 179);

const page = corpus.pages.find(row => row.page === 53);
assert.ok(page);
assert.equal(page.runic_count, 179);
assert.equal(page.indices.length, 179);

const stream = [];
const charOffsets = [];
for (let i = 0; i < transcription.length; i += 1) {
  const runeIndex = corpus.runes.indexOf(transcription[i]);
  if (runeIndex >= 0) {
    stream.push(runeIndex);
    charOffsets.push(i);
  }
}

const starts = [];
for (let i = 0; i <= stream.length - page.indices.length; i += 1) {
  if (page.indices.every((value, j) => stream[i + j] === value)) starts.push(i);
}
assert.equal(starts.length, 1, "canonical p53 rune sequence must occur exactly once");
const pageStart = starts[0];
const rawRed = transcription.slice(
  charOffsets[pageStart + annotation.red_text.start_rune_inclusive],
  charOffsets[pageStart + annotation.red_text.end_rune_exclusive]
);
const redRunes = Array.from(rawRed).filter(ch => runes.has(ch)).join("");
assert.equal(redRunes, annotation.red_text.runes);
assert.equal(Array.from(redRunes).length, 51);

const lineRuneCounts = rawRed.split("\n")
  .map(line => Array.from(line).filter(ch => runes.has(ch)).length)
  .filter(count => count > 0);
assert.deepEqual(lineRuneCounts, [1, 24, 22, 4]);
assert.deepEqual(lineRuneCounts, annotation.red_text.line_rune_counts);

const wordStrings = rawRed.replace(/[\/&%\n.]/g, "").split("-");
const wordLengths = wordStrings.map(word => Array.from(word).length);
assert.deepEqual(wordLengths, annotation.red_text.word_lengths);
assert.deepEqual(wordLengths, [5, 4, 4, 11, 2, 3, 2, 6, 5, 5, 2, 2]);

const firstSix = wordLengths.slice(0, 6).reduce((a, b) => a + b, 0);
const lastSix = wordLengths.slice(6).reduce((a, b) => a + b, 0);
assert.equal(firstSix, 29);
assert.equal(lastSix, 22);
assert.notEqual(firstSix, 23);
assert.notEqual(lastSix, 28);

const prefixSums = [];
let total = 0;
for (const length of wordLengths) {
  total += length;
  prefixSums.push(total);
}
assert.equal(total, 51);
assert.ok(!prefixSums.includes(23));
assert.ok(!prefixSums.includes(28));

const imageBytes = fs.readFileSync(path.join(root, "resources/liber-primus/70.jpg"));
const imageSha256 = crypto.createHash("sha256").update(imageBytes).digest("hex");
assert.equal(imageSha256, annotation.image_sha256);

const result = {
  sourceImage: annotation.image,
  sourceImageSha256: imageSha256,
  lp2Page: 53,
  pageRuneCount: page.runic_count,
  redSpan: { start: 128, endExclusive: 179, runeCount: 51 },
  rawRedRuneSequence: redRunes,
  physicalLineRuneCounts: lineRuneCounts,
  canonicalWordRuneLengths: wordLengths,
  firstSixWordRunes: firstSix,
  lastSixWordRunes: lastSix,
  wordBoundaryPrefixSums: prefixSums,
  claimedSplit23_28Exists: false,
  conclusion: "The p53 red span does not have a canonical 23/28 six-word split."
};
process.stdout.write(JSON.stringify(result, null, 2) + "\n");

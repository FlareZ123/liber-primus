"use strict";
const assert = require("node:assert/strict");
const {parseLP2Words, parseSharedCorpus, physicalLP2Page} =
  require("./lp2_word_pages.cjs");

const synthetic = parseLP2Words("ᚠᚢ/%\nᚦᚩ-ᛁ", 2);
assert.equal(synthetic.words.length, 2);
assert.deepEqual(synthetic.words[0],
  {runes:"ᚠᚢᚦᚩ",startPage:0,endPage:1,length:4});
assert.equal(synthetic.words[1].runes, "ᛁ");
assert.equal(synthetic.words[1].startPage, 1);
assert.equal(synthetic.crossPageWords, 1);
assert.equal(synthetic.runeCount, 5);

const afterPageSeparator = parseLP2Words("ᚠᛁ%\n-ᚢ", 2);
assert.equal(afterPageSeparator.words.length, 2);
assert.equal(afterPageSeparator.crossPageWords, 0);
assert.equal(afterPageSeparator.words[0].endPage, 0);
assert.equal(afterPageSeparator.words[1].startPage, 1);

const lp2 = parseSharedCorpus();
assert.equal(lp2.runeCount, 12956);
assert.equal(lp2.words.length, 2896);
assert.equal(lp2.byStartPage.length, 55);
assert.equal(lp2.originalPageFragments, 2928);
assert.equal(lp2.crossPageWords, 32);
assert.equal(lp2.originalPageFragments - lp2.words.length, 32);
assert.equal(lp2.byStartPage.flat().length, 2896);
assert.equal(lp2.byContainedPage.flat().length,
  lp2.words.length - lp2.crossPageWords);
assert.equal(physicalLP2Page(50), 51);
assert.equal(physicalLP2Page(49), 49);
assert.equal(physicalLP2Page(54), 55);
console.log(JSON.stringify({
  runeCount:lp2.runeCount, canonicalWords:lp2.words.length,
  pageFragments:lp2.originalPageFragments, crossPageWords:lp2.crossPageWords,
  unambiguousWithinPageWords:lp2.byContainedPage.flat().length
},null,2));

/*
 * Full physical-page crosswalk regression. LP2 page 50 is the rune-free
 * numerical grid and is absent from the 57 transcript segments. Both
 * resources share an upstream transcription lineage: this verifies
 * indexing and lossless rune conversion, not independent source accuracy.
 */
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const numeric = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const rawTranscript = fs.readFileSync(
  path.join(root, "resources/lp2-transcription.txt"), "utf8");
const segments = rawTranscript.split("%");
const alphabet = new Map(numeric.runes.map((rune, index) => [rune, index]));
assert.equal(numeric.runes.length, 29);
assert.equal(numeric.pages.length, 58);
assert.equal(segments.length, 57);
assert.deepEqual(numeric.pages.map(p => p.page),
  Array.from({length: 58}, (_, index) => index));
assert.equal(numeric.pages[50].status, "numeric_grid_only");
assert.deepEqual(numeric.pages[50].indices, []);
assert.deepEqual(numeric.pages.slice(0, 56).map(p => p.status),
  Array.from({length: 56}, (_, i) =>
    i === 50 ? "numeric_grid_only" : "unsolved"));
assert.deepEqual(numeric.pages.slice(56).map(p => p.status),
  ["solved", "solved"]);
let unsolvedRunes = 0;
for (let segment = 0; segment < segments.length; segment++) {
  const page = physicalLP2Page(segment);
  const runes = [...segments[segment]].filter(character =>
    /[\u16A0-\u16FF]/u.test(character));
  const indices = runes.map(character => {
    assert.ok(alphabet.has(character),
      "unrecognized rune on transcript segment " + segment);
    return alphabet.get(character);
  });
  assert.deepEqual(indices, numeric.pages[page].indices,
    "mismatch at transcript segment " + segment +
    ", physical LP2 page " + page);
  assert.equal(indices.length, numeric.pages[page].runic_count);
  if (page <= 55) unsolvedRunes += indices.length;
}
assert.equal(unsolvedRunes, 12956);
assert.equal(physicalLP2Page(55), 56);
assert.equal(physicalLP2Page(56), 57);
console.log("Full LP2 transcript/JSON physical-page crosswalk passed: " +
  segments.length + " rune-bearing segments mapped to 58 physical pages");

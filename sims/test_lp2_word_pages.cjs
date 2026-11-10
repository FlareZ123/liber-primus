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

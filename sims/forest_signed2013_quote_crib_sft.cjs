"use strict";
/**
 * Single source-attributed 2013 forest-clue quotation crib gate.
 * Frozen 2013 authenticated sentence and original LP2 p40–55 floral section.
 * Node.js 22 / CommonJS: node sims/forest_signed2013_quote_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const words = parseSharedCorpus().words;
assert.equal(words.length, 2896);
const forest = words.filter(w => {
  const page = physicalLP2Page(w.startPage);
  return page >= 40 && page <= 55;
});
assert.equal(forest.length, 735);

/** Longest GP spellings first, including the source-attested ING ligature. */
const units = ["ING","TH","NG","EO","OE","AE","IA","EA",
  "F","U","O","R","C","G","W","H","N","I","J","P","X","S",
  "T","B","E","M","L","D","A","Y"];
/** @param {string} latin */
function gpLength(latin) {
  let text = latin.toUpperCase().replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let n = 0;
  while (text.length) {
    const unit = units.find(x => text.startsWith(x));
    assert.ok(unit, `Unrecognized GP spelling: ${text}`);
    text = text.slice(unit.length);
    n++;
  }
  return n;
}

// Authenticated 6 January 2013 signed first-onion forest sentence.
// Apostrophes are normalized within each original printed English word.
const quote = ["YOU","CANT","SEE","THE","FOREST","WHEN",
  "YOURE","LOOKING","AT","THE","TREES"];
const target = quote.map(gpLength);
assert.deepEqual(target, [3,4,3,2,6,4,5,5,2,2,5]);
assert.equal(target.reduce((a,b)=>a+b,0),41);

/**
 * Return max exact word-length contiguous overlap, permitting every quote
 * word start and every LP2 word start with NO tuned cipher parameters.
 * @param {{length:number}[]} corpusWords
 */
function longest(corpusWords) {
  let best = {length:0,sourceWord:0,targetWord:0,physicalPage:0};
  for (let t = 0; t < target.length; t++)
    for (let j = 0; j < corpusWords.length; j++) {
      let n = 0;
      while (t+n < target.length && j+n < corpusWords.length
        && target[t+n] === corpusWords[j+n].length) n++;
      if (n > best.length)
        best = {length:n,sourceWord:j,targetWord:t,
          physicalPage:physicalLP2Page(corpusWords[j].startPage)};
    }
  return best;
}
const restricted = longest(forest);
const wholeBook = longest(words);
assert.equal(restricted.length,4);
assert.equal(wholeBook.length,4);

// End-to-end positive control: inject the entire frozen length sequence.
const plant = forest.map(w => ({...w}));
for (let i=0;i<target.length;i++) plant[100+i]={...plant[100+i],length:target[i]};
assert.equal(longest(plant).length,11);
console.log(JSON.stringify({phrase:quote.join(" "),quoteGP:target,
  quoteRunes:41,forestWords:forest.length,
  forestBest:restricted,wholeUnsolvedBest:wholeBook,
  plantedMatch:11,answer:"No exact word-preserving forest quotation"},null,2));

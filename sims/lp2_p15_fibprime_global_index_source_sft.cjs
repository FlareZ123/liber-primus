"use strict";

/**
 * Bounded source-selected continuation of the deciphered LP2 p15
 * Fibonacci-indexed prime spiral into original unmodified GP29 text.
 *
 * This tests a direct literal numeric-index reading, with no fitted phase,
 * permutation, plaintext guess, or book-source running key.
 *
 * SFT: node sims/lp2_p15_fibprime_global_index_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");

const corpus = JSON.parse(fs.readFileSync(
  "resources/liber-primus/lp2-corpus.json", "utf8"));
const pp = corpus.pages.filter(p => p.page <= 55);
const ciphertext = pp.flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);

/** @param {number} x @returns {boolean} */
function prime(x) {
  if (x < 2) return false;
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
  return true;
}

/** @param {number} ordinal one-based positive prime ordinal */
function nthPrime(ordinal) {
  let count = 0;
  for (let candidate = 2; ; candidate++) {
    if (!prime(candidate)) continue;
    if (++count === ordinal) return candidate;
  }
}

const fibonacci = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584];
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];
const spiral = [
  [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],
];
const amounts = fibonacci.map(index => Math.abs(3301 - nthPrime(index + 1)));
for (let i = 0; i < spiral.length; i++) {
  const [row,col] = spiral[i];
  assert.equal(amounts[i],printed[row][col],`Original p15 cell ${i}`);
}
assert.deepEqual(amounts.slice(13),[708,1206,4516,10176,19866]);

const positions = [];
let first = 0;
for (const p of pp) {
  positions.push({page:p.page,first,end:first+p.indices.length});
  first += p.indices.length;
}

/** @param {number} index @returns {{index:number,page:number,local:number,rune:string}} */
function at(index) {
  assert(index >= 0 && index < ciphertext.length);
  const p = positions.find(x => index >= x.first && index < x.end);
  assert(p);
  return {
    index,page:p.page,local:index-p.first,
    rune:corpus.translit[ciphertext[index]],
  };
}
/** @param {number} offset 0=index is zero-based, 1=printed one-based */
function direct(offset) {
  const picked = amounts.slice(0,17).map(n => at(n-offset));
  return {clock: offset ? "one-based" : "zero-based",
    originalRunes:picked.map(x=>x.rune).join(""),
    selected:picked};
}
const sourceReadouts = [direct(0),direct(1)];
assert.equal(sourceReadouts[0].selected[16].index,10176);
assert.deepEqual(sourceReadouts[0].selected[16],
  {index:10176,page:42,local:32,rune:"N"});
assert.deepEqual(sourceReadouts[1].selected[16],
  {index:10175,page:42,local:31,rune:"P"});
assert.equal(amounts[17] > ciphertext.length,true,
  "Next exact Fibonacci-prime continuation exits the complete unknown LP2 stream");

// The first marked p42 quotation starts at global rune 10211.
// The next-generated value 10176 happens to land on the same physical page,
// 35 runes earlier. This is a proximity observation, not a cipher output.
const p42QuotationStart = 10211;
assert.equal(p42QuotationStart - amounts[16], 35);

// Verify the pointer's original word boundaries, without interpreting the text.
const transcription = fs.readFileSync(
  "resources/liber-primus/lp2-transcription.txt", "utf8");
const runicWords = transcription.split("%").slice(0,55).join("%")
  .replace(/\/\n/g,"").replace(/[\r\n%]/g,"")
  .match(new RegExp("[" + corpus.runes.join("") + "]+", "gu")) || [];
assert.equal(runicWords.length,2896);
let wordRunePosition=0;
let pointerWord;
for(let i=0;i<runicWords.length;i++){
  const w=runicWords[i];
  if(wordRunePosition===10175){
    pointerWord={originalWordIndex:i,globalZeroBased:wordRunePosition,
      originalRunes:w,transliteration:[...w].map(rune=>{
        const j=corpus.runes.indexOf(rune);
        assert(j>=0);
        return corpus.translit[j];
      }).join("")};
  }
  wordRunePosition+=w.length;
}
assert.equal(wordRunePosition,ciphertext.length);
assert.deepEqual(pointerWord,{
  originalWordIndex:2284,globalZeroBased:10175,
  originalRunes:"ᛈᚾᚹ",transliteration:"PNW",
});
const threeRuneWords=runicWords.filter(w=>w.length===3).length;
assert.equal(threeRuneWords,720);

console.log(JSON.stringify({
  originalGridVerifiedCells:16,
  firstUnprinted:{fibonacci:1597,primeOrdinal:1598,
    primeValue:13477,value:10176},
  secondUnprinted:{fibonacci:2584,primeOrdinal:2585,
    primeValue:23167,value:19866,withinUnknownLP2:false},
  originalGlyphCount:ciphertext.length,
  directReadouts:sourceReadouts.map(x=>({clock:x.clock,
    readout:x.originalRunes,
    seventeenthPosition:x.selected[16],sampledOriginalPositions:x.selected.map(y=>y.index)})),
  oneBasedSelectedPrintedWord:pointerWord,
  originalThreeRuneWordCount:threeRuneWords,
  p42FirstQuotedRuneGlobalOffset:p42QuotationStart,
  p42QuoteDistanceFromExtrapolatedPointer:35,
  conclusion:"No readable original LP2 plaintext or key from the complete 17-symbol direct literal numeric-index extraction."
},null,2));

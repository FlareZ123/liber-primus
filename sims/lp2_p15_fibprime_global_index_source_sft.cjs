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
  .replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"")
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
// The selected three-rune word has an additional source-visible prime checksum.
// This was noticed after PNW, so it is an exploratory cross-link, not a
// statistically calibrated decipherment or a key instruction.
const gpPrimes = corpus.prime;
const primeSum = word => [...word].reduce((sum, rune) => {
  const index = corpus.runes.indexOf(rune);
  assert(index >= 0);
  return sum + gpPrimes[index];
}, 0);
assert.equal(primeSum(pointerWord.originalRunes), 91);
const threeRune91 = runicWords.filter(w =>
  w.length === 3 && primeSum(w) === 91);
assert.deepEqual(threeRune91.map(w =>
  [...w].map(r => corpus.translit[corpus.runes.indexOf(r)]).join("")),
  ["OTHNG", "WETH", "PNW"]);

// The third original 2014 OpenPuff-recovered square has 91 in its centre.
// This square predates the LP2 page delivery; equality alone does not choose
// the square as a cipher key.
const historicalSquares = fs.readFileSync(
  "resources/cicada2014-openpuff-magic-squares.txt", "utf8").trim()
  .split(/\r?\n\s*\r?\n/).map(block => block.trim().split(/\r?\n/)
    .map(row => row.trim().split(/\s+/).map(Number)));
assert.deepEqual(historicalSquares.map(square => square.length), [5, 7, 5]);
assert.equal(historicalSquares[2][2][2], 91);

// A single direct, clue-constrained consumer: use the checksum as the
// one-based starting prime ordinal under p56's established phi-prime shift.
// The original printed p42/p43 quotation is a 228-rune continuous source unit.
// It stays ciphertext-like; no post-hoc clock, phase or F-skip is fitted.
const quoteStart = 10211;
const quoteEnd = 10439;
const quotation = ciphertext.slice(quoteStart, quoteEnd);
assert.equal(quotation.length, 228);
const phi91 = quotation.map((_, i) => (nthPrime(91 + i) - 1) % 29);
const dec91 = quotation.map((r, i) => (r - phi91[i] + 29) % 29);
const add91 = quotation.map((r, i) => (r + phi91[i]) % 29);
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const r of runes) counts[r]++;
  return counts.reduce((s, count) => s + count * (count - 1), 0) /
    (runes.length * (runes.length - 1));
}
assert(Math.abs(ioc(quotation) - 0.033542004791715) < 1e-12);
assert(Math.abs(ioc(dec91) - 0.032653218950642) < 1e-12);
assert(Math.abs(ioc(add91) - 0.035358219336888) < 1e-12);
assert.deepEqual(dec91.map((r, i) => (r + phi91[i]) % 29), quotation);
assert.deepEqual(add91.map((r, i) => (r - phi91[i] + 29) % 29), quotation);

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
  originalThreeRunePrimeSum91:threeRune91.length,
  originalThreeRunePrimeSum91Words:threeRune91.map(w =>
    [...w].map(r => corpus.translit[corpus.runes.indexOf(r)]).join("")),
  historical2014ThirdSquareCentre:historicalSquares[2][2][2],
  originalP42P43QuotationStartAndEnd:[quoteStart,quoteEnd],
  p42P43PrimeOrdinal91OriginalInverse:{sourceIoC:ioc(quotation),
    minusIoC:ioc(dec91),plusIoC:ioc(add91),
    minusOpening:dec91.slice(0,30).map(r=>corpus.translit[r]).join(""),
    plusOpening:add91.slice(0,30).map(r=>corpus.translit[r]).join("")},
  p42FirstQuotedRuneGlobalOffset:p42QuotationStart,
  p42QuoteDistanceFromExtrapolatedPointer:35,
  conclusion:"No readable original LP2 plaintext or key from the complete 17-symbol direct literal numeric-index extraction."
},null,2));

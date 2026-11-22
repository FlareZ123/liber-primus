"use strict";

/**
 * Physical p55 wordwise H(x,y)=(x-y,x+y) mod29, source-typed SHED readout.
 * Test with Node 22 on Windows 11 from the repository root:
 * node sims/lp2_p55_hsum_gp29_source_sft.cjs
 * Reads canonical source data and writes no files.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-corpus.json"
), "utf8"));
const transcription = fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-transcription.txt"
), "utf8");
const runeMap = new Map([...source.runes].map((rune, index) => [rune, index]));
const p55 = source.pages[55].indices;
const wordLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(p55.length, 76);
assert.equal(p55[0], 21);
assert.equal(wordLengths.reduce((a,b) => a+b, 0), 75);

/** @param {number} x @returns {number} */
const mod29 = x => (x % 29 + 29) % 29;

/** @param {number[]} arr @returns {number} */
function doublets(arr) {
  let n = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i] === arr[i-1]) n++;
  return n;
}

/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const histogram = Array(29).fill(0);
  for (const x of arr) histogram[x]++;
  return histogram.reduce((s,n) => s + n*(n-1), 0) /
    (arr.length * (arr.length-1));
}

/** @param {number[][]} words @returns {{sum:number[],difference:number[],restored:number[][]}} */
function transform(words) {
  const sum = [], difference = [], restored = [];
  for (const original of words) {
    const word = Array(original.length);
    for (let j = 0; j < Math.floor(original.length / 2); j++) {
      const x = original[j], y = original[original.length-1-j];
      const d = mod29(x-y), s = mod29(x+y);
      sum.push(s);
      difference.push(d);
      word[j] = mod29(15*(s+d));
      word[original.length-1-j] = mod29(15*(s-d));
    }
    if (original.length % 2) word[Math.floor(original.length/2)] =
      original[Math.floor(original.length/2)];
    restored.push(word);
  }
  return {sum,difference,restored};
}

let offset = 1;
const words = wordLengths.map(n => {
  const w = p55.slice(offset,offset+n);
  offset += n;
  return w;
});
assert.equal(offset,76);
const {sum,difference,restored} = transform(words);
assert.deepEqual(restored,words);
assert.equal(sum.length,35);
assert.equal(ioc(sum),0.058823529411764705);
assert.equal(ioc(difference),0.02689075630252101);
assert.equal(sum.filter(x=>x===18).length,0);

// Preserve the original printed page framing. P50 has only a numeric grid,
// so the runic-only transcript skips it and offsets later page indices by1.
const parts = transcription.split("%");
assert.equal(parts.length,57);
/** @param {string} text @returns {number[][]} */
function pageWords(text) {
  return text.replaceAll("/", "").split("-").map(chunk =>
    [...chunk].filter(c => runeMap.has(c)).map(c => runeMap.get(c))
  ).filter(w => w.length);
}
const ranks = [];
for (let page=0; page<=55; page++) {
  if (page===50) continue;
  const parsed = pageWords(parts[page<50 ? page : page-1]);
  const {sum:values} = transform(parsed);
  const n = values.length;
  const sd = Math.sqrt(56/(841*n*(n-1)));
  ranks.push({page,n,IoC:ioc(values),z:(ioc(values)-1/29)/sd});
}
ranks.sort((a,b)=>b.z-a.z);
assert.equal(ranks[0].page,55);
assert.equal(ranks.length,55);

// Source-conditioned null: shuffle separately inside each original p55
// word, retain its rune multiset and the original count of adjacent doubles.
let rng=0x33017765;
/** @returns {number} */
function randomInt() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
const nTrials=20000;
const sourceDoubles=words.map(doublets);
let exceeding=0, sumIoc=0, sumIoc2=0;
for (let trial=0; trial<nTrials; trial++) {
  const randomWords=words.map((w,wordIndex) => {
    let t;
    do {
      t=w.slice();
      for (let i=t.length-1;i>0;i--) {
        const j=randomInt()%(i+1);
        [t[i],t[j]]=[t[j],t[i]];
      }
    } while(doublets(t)!==sourceDoubles[wordIndex]);
    return t;
  });
  const v=ioc(transform(randomWords).sum);
  sumIoc+=v;
  sumIoc2+=v*v;
  if (v>=ioc(sum)) exceeding++;
}
const mean=sumIoc/nTrials;
console.log(JSON.stringify({
  source:"physical p55 locally owned 16 complete words, source-specified H sum/difference",
  excludedLeadingCarryRune:p55[0],
  wordLengths,
  originalLocallyOwnedRunes:75,
  totalSourcePairCount:35,
  sumBranchGP29:sum,
  differenceBranchGP29:difference,
  sumBranchTranslit:sum.map(x=>source.translit[x]).join("."),
  sumBranchIoC:ioc(sum),
  differenceBranchIoC:ioc(difference),
  sumBranchNativeECount:sum.filter(x=>x===18).length,
  originalReconstruction:"75/75",
  comparativeRanks:ranks.slice(0,5),
  null:{fixedPRNGSeed:"0x33017765",resamples:nTrials,ge:exceeding,
    meanIoC:mean,sdIoC:Math.sqrt(sumIoc2/nTrials-mean*mean),
    conditionalTailP:(exceeding+1)/(nTrials+1)},
  conclusion:"Small n=35 outlier and potential keyed branch, no legible plaintext, known key or author-authenticated remapping"
},null,2));

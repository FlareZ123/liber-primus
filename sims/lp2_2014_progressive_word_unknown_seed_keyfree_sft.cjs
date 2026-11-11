"use strict";

/**
 * Key-free contradiction for any original-word GP29 progressive Caesar
 * C_(w,j) = P_(w,j) - (k_w+j) mod29.
 * Each word may use an arbitrary unknown starting key k_w. This full family
 * necessarily maps ΔP=+1 to C_j=C_(j-1); no key recovery is needed.
 * Historical selector: exact 2014 May24 ITS / LESS consecutive-shift cribs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"
), "utf8"));
const originalTranscript = fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus",
  "lp2-transcription.txt"
), "utf8");
const english = fs.readFileSync(path.join(
  __dirname, "..", "resources", "control",
  "shakespeare_first300k.txt"
), "utf8");
const gp = corpus.translit;
const runes = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const runeToIndex = new Map(runes.map((r, i) => [r, i]));
const digraphs = new Set(["TH","NG","EO","OE","AE","IA","EA"]);

/** @param {string} word @returns {number[]} */
function encodeWord(word) {
  const out = [];
  for (let i = 0; i < word.length; i++) {
    const pair = word.slice(i, i + 2);
    if (digraphs.has(pair)) {
      out.push(gp.indexOf(pair));
      i++;
    } else {
      const j = gp.indexOf(word[i]);
      if (j >= 0) out.push(j);
    }
  }
  return out;
}

/** @param {number[]} word @param {number} delta @returns {number} */
function deltaCount(word, delta) {
  let count = 0;
  for (let i = 1; i < word.length; i++) {
    count += Number((word[i] - word[i - 1] + 29) % 29 === delta);
  }
  return count;
}

/** @returns {void} */
function main() {
  const parsed = parseLP2Words(originalTranscript);
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  const observedWords = parsed.words.map(w => [...w.runes].map(r => {
    const i = runeToIndex.get(r);
    assert.ok(Number.isInteger(i));
    return i;
  }));
  assert.equal(observedWords.reduce((s,w)=>s+w.length-1,0),10060);
  const observedZero = observedWords.reduce((s,w)=>s+deltaCount(w,0),0);
  assert.equal(observedZero,63);

  const sourceWords = (english.toUpperCase().match(/[A-Z]+/g) || [])
    .map(encodeWord).filter(w => w.length > 0);
  assert.equal(sourceWords.length,55407);
  const byLen = new Map();
  for (const word of sourceWords) {
    if (!byLen.has(word.length)) byLen.set(word.length, []);
    byLen.get(word.length).push(word);
  }
  const originalLenCount = new Map();
  for (const word of observedWords) {
    originalLenCount.set(word.length,(originalLenCount.get(word.length)||0)+1);
  }
  let expectation=0,variance=0;
  const bins=[];
  for (const [length, count] of [...originalLenCount.entries()]
    .sort((a,b)=>a[0]-b[0])) {
    const references = byLen.get(length);
    assert.ok(references?.length > 0);
    const values = references.map(w => deltaCount(w,1));
    const avg=values.reduce((s,v)=>s+v,0)/values.length;
    const varianceOne=values.reduce((s,v)=>s+(v-avg)**2,0)/values.length;
    expectation+=avg*count;
    variance+=varianceOne*count;
    bins.push({length,originalWords:count,englishWords:references.length,
      expected:avg*count});
  }

  // Matched whole-word null: preserve the complete original 2,896-length
  // inventory, draw GP-encoded Shakespeare reference words with replacement.
  let state=0x2341f6bd>>>0;
  /** @returns {number} */
  function rand() {
    state ^= state << 13; state >>>=0;
    state ^= state >>> 17; state >>>=0;
    state ^= state << 5; state >>>=0;
    return state;
  }
  const iterations=20000;
  let exceedLower=0;
  let min=Infinity,max=-Infinity;
  for(let rep=0;rep<iterations;rep++) {
    let eventCount=0;
    for(const [len,count] of originalLenCount) {
      const pool=byLen.get(len);
      for(let j=0;j<count;j++) {
        eventCount+=deltaCount(pool[rand()%pool.length],1);
      }
    }
    min=Math.min(min,eventCount);
    max=Math.max(max,eventCount);
    if(eventCount<=observedZero)exceedLower++;
  }
  assert.equal(exceedLower,0);
  assert.ok(expectation>observedZero*5);
  // Exact seeded positive: a wordwise arbitrary key cancels in every
  // consecutive-rune difference under the independently specified rule.
  let checked=0;
  const checkWords=sourceWords.filter(w=>w.length>=2).slice(0,3000);
  for(const word of checkWords) {
    const seed=rand()%29;
    const encrypted=word.map((x,j)=>(x-seed-j+29*100)%29);
    assert.equal(deltaCount(encrypted,0),deltaCount(word,1));
    assert.deepEqual(encrypted.map((x,j)=>(x+seed+j)%29),word);
    checked+=word.length-1;
  }
  console.log(JSON.stringify({
    originalWords:observedWords.length,originalRunes:12956,
    withinWordAdjacentPairs:10060,
    observedZeroCiphertextDifferences:observedZero,
    fixedProgressiveLaw:"C(w,j) = P(w,j) - (k(w)+j) mod29",
    necessaryCondition:"C(w,j)==C(w,j-1) iff P(w,j)-P(w,j-1)==1 mod29",
    unknownStartingKeys:"one completely arbitrary per source word",
    englishSourceWords:sourceWords.length,
    expectedZeroByExactOriginalWordLengths:expectation,
    expectedStandardDeviation:Math.sqrt(variance),
    bootstrapIterations:iterations,seed:"0x2341f6bd",
    minBootstrapEnglishPairs:min,maxBootstrapEnglishPairs:max,
    observedAtOrBelowNull:exceedLower,
    conditionalAddOneLowerTailBound:(exceedLower+1)/(iterations+1),
    exactPositiveControlAdjacentPairs:checked,
    wordLengthBins:bins,
    result:"The complete fixed +1 within-word progressive-key family cannot explain native GP-English using these original boundaries",
    authenticUnknownLP2PlaintextRecovered:false
  },null,2));
}
if(require.main===module) main();
module.exports={main};

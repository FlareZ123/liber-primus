"use strict";
/**
 * SFT: source-fixed two-cipher-rune state, GP29 native-language entropy-rank
 * output transducer. This is a reversible *rank transport* baseline, not a
 * historical Liber Primus cipher and not a variable-rate rANS compressor.
 *
 * Run on Windows 11: node sims/lp2_wordcodec_gp29_crossword_rank_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const index = new Map(gp.runes.map((r, i) => [r, i]));
const source = parseSharedCorpus();
const original = source.words.map(w => [...w.runes].map(c => index.get(c)));
assert.equal(source.words.length, 2896);
assert.equal(source.runeCount, 12956);
assert(original.every(w => w.every(x => Number.isInteger(x) && x >= 0 && x < 29)));

const token = gp.translit.map((name, i) => ({name, i}))
  .sort((a, b) => b.name.length - a.name.length);
/** @param {string} raw @returns {number[]} */
function nativeWord(raw) {
  const s = raw.toUpperCase().replace(/QU/gu, "CW")
    .replace(/[KQ]/gu, "C").replace(/V/gu, "U")
    .replace(/Z/gu, "S").replace(/ING/gu, "NG").replace(/IO/gu, "IA");
  const out = [];
  for (let i = 0; i < s.length;) {
    const t = token.find(x => s.startsWith(x.name, i));
    if (!t) return [];
    out.push(t.i);
    i += t.name.length;
  }
  return out;
}
/** @param {string} name @returns {number[][]} */
function nativeCorpus(name) {
  return (read(name).match(/[A-Za-z]+/gu) || [])
    .map(nativeWord).filter(w => w.length >= 1 && w.length <= 14);
}
const gibran = nativeCorpus("resources/control/gibran_prophet_58585.txt");
const shakespeare = nativeCorpus("resources/control/shakespeare_first300k.txt");

/** Fixed Laplace-smoothed source-native GP29 order-one model.
 *  Context 29 denotes the beginning of a printed word.
 * @param {number[][]} corpus @returns {number[][]}
 */
function rankModel(corpus) {
  const counts = Array.from({length:30}, () => Array(29).fill(1));
  for (const word of corpus) for (let i=0; i<word.length; i++)
    counts[i ? word[i-1] : 29][word[i]]++;
  return counts.map(row => Array.from({length:29}, (_, i) => i)
    .sort((a,b) => row[b]-row[a] || a-b));
}
/** @param {number} n @param {number} d @returns {number} */
function mod(n,d) { return (n%d+d)%d; }
/**
 * Source-motivated fixed field constants 5,13 and initial ciphertext
 * state 13,5 are exploratory; no historical authorial operation is claimed.
 * Low-likelihood rank 28 is the only same-rune output. The remaining
 * 28 ranks are bijectively distributed over the 28 nonzero GP29 steps.
 *
 * @param {number[][]} words @param {number[][]} ranks
 * @returns {number[][]}
 */
function encode(words,ranks) {
  const inverse=ranks.map(row => {
    const arr=Array(29);
    row.forEach((p,r)=>{arr[p]=r;});
    return arr;
  });
  let a=13,b=5;
  return words.map(word => {
    let prevPlain=29;
    return word.map(p=>{
      const rank=inverse[prevPlain][p];
      const shift=(5*a+13*b)%28;
      const delta=rank===28?0:1+(5*rank+shift)%28;
      const c=(b+delta)%29;
      a=b;b=c;prevPlain=p;
      return c;
    });
  });
}
/** @param {number[][]} words @param {number[][]} ranks
 *  @returns {number[][]}
 */
function decode(words,ranks) {
  let a=13,b=5;
  return words.map(word=>{
    let prevPlain=29;
    return word.map(c=>{
      const delta=mod(c-b,29);
      const shift=(5*a+13*b)%28;
      const rank=delta===0?28:mod(17*(delta-1-shift),28);
      const p=ranks[prevPlain][rank];
      a=b;b=c;prevPlain=p;
      return p;
    });
  });
}
/** @param {number[][]} words @returns {number} */
function doublets(words) {
  const all=words.flat();
  let n=0;
  for(let i=1;i<all.length;i++) n+=Number(all[i]===all[i-1]);
  return n;
}
/** @param {number[][]} words @returns {{echoes:number,opportunities:number}} */
function withinFive(words) {
  let echoes=0,opportunities=0;
  for(const word of words)for(let i=5;i<word.length;i++){
    opportunities++;echoes+=Number(word[i]===word[i-5]);
  }
  return {echoes,opportunities};
}
/** @param {number[][]} words @returns {number} */
function normIoC(words) {
  const data=words.flat(),c=Array(29).fill(0);
  for(const x of data)c[x]++;
  return 29*c.reduce((s,n)=>s+n*(n-1),0)/(data.length*(data.length-1));
}
/** @param {number[][]} words @returns {number} */
function lexiconHits(words) {
  const known=new Set(gibran.map(w=>w.join(",")));
  return words.filter(w=>known.has(w.join(","))).length;
}
function typesByLength(words) {
  const buckets=Array.from({length:15},()=>({tokens:0,types:new Set()}));
  for(const w of words){
    buckets[w.length].tokens++;
    buckets[w.length].types.add(w.join(","));
  }
  return Object.fromEntries(buckets.slice(1).map((o,i)=>[i+1,{tokens:o.tokens,types:o.types.size}]));
}
const byLength=typesByLength(original);
assert.equal(byLength[1].tokens,83);
assert.equal(byLength[1].types,28);
assert.deepEqual([byLength[2].types,byLength[3].types,byLength[4].types],[354,704,513]);
assert(Object.entries(byLength).filter(([n])=>Number(n)>=4)
  .every(([,v])=>v.tokens===v.types));

// A public word-reset deterministic injection preserves the number
// of distinct plaintext word types at every source word length.
const nativeTypes={gibran:typesByLength(gibran),shakespeare:typesByLength(shakespeare)};
assert(nativeTypes.gibran[1].types<byLength[1].types);
assert(nativeTypes.shakespeare[1].types<byLength[1].types);

// At every same-physical-page singleton, test previous-cipher-rune-only
// state against the natural-English A/I(/O) singleton vocabulary.
const previous=new Map();
let eligible=0;
for(let i=1;i<source.words.length;i++){
  const current=source.words[i],before=source.words[i-1];
  if(current.length!==1 || current.startPage!==before.endPage)continue;
  const state=original[i-1].at(-1), output=original[i][0];
  if(!previous.has(state))previous.set(state,new Set());
  previous.get(state).add(output);
  eligible++;
}
assert.equal(eligible,82);
const sizes=[...previous.values()].map(x=>x.size);
const oneBack={
  eligible,contexts:previous.size,maxOutputsPerContext:Math.max(...sizes),
  contextsRequiringMoreThanTwoSingletonPlainTypes:sizes.filter(n=>n>2).length,
  contextsRequiringMoreThanThreeSingletonPlainTypes:sizes.filter(n=>n>3).length
};
assert.equal(oneBack.contextsRequiringMoreThanTwoSingletonPlainTypes,16);
assert.equal(oneBack.maxOutputsPerContext,6);

// Exact all-input arbitrary-symbol positive, independent from English.
const models={gibran:rankModel(gibran),shakespeare:rankModel(shakespeare)};
const arbitrary=Array.from({length:14},(_,i)=>
  Array.from({length:i+1},(_,j)=>(5*i+13*j)%29));
assert.deepEqual(decode(encode(arbitrary,models.gibran),models.gibran),arbitrary);
assert.deepEqual(decode(encode(arbitrary,models.shakespeare),models.shakespeare),arbitrary);

// Fixed seeded native-GP 12,956-rune plant matches all 2,896 original
// source word-length slots, with no plaintext selection on ciphertext.
let seed=3301;
const choices=Array.from({length:15},()=>[]);
for(const w of gibran)choices[w.length].push(w);
assert(choices.slice(1).every(x=>x.length));
const nativePlant=original.map(w=>{
  seed=(Math.imul(1664525,seed)+1013904223)>>>0;
  return choices[w.length][seed%choices[w.length].length];
});
const plantedCipher=encode(nativePlant,models.gibran);
assert.deepEqual(decode(plantedCipher,models.gibran),nativePlant);
const wrongModel=decode(plantedCipher,models.shakespeare);
assert.deepEqual(encode(wrongModel,models.shakespeare),plantedCipher);

// Fixed model, same original GP29 input; recipher parity is automatic
// for every key in an exact bijective family, not plaintext evidence.
const originalDecoded=decode(original,models.gibran);
assert.deepEqual(encode(originalDecoded,models.gibran),original);
assert.equal(doublets(original),86);
assert.equal(withinFive(original).echoes,104);
assert.equal(withinFive(original).opportunities,2105);
// Source word-length matched, never tuned to source output: 256 independent
// native GP plants under the same frozen public rank table.
let calibrationSeed=0x33011660;
const simulatedFive=[],simulatedRepeats=[];
for(let trial=0;trial<256;trial++){
  const nativeWords=original.map(w=>{
    const pool=choices[w.length];
    calibrationSeed=(Math.imul(1664525,calibrationSeed)+1013904223)>>>0;
    return pool[calibrationSeed%pool.length];
  });
  const ciphertext=encode(nativeWords,models.gibran);
  simulatedFive.push(withinFive(ciphertext).echoes);
  simulatedRepeats.push(doublets(ciphertext));
}
const observedFive=withinFive(original).echoes;
const meanFive=simulatedFive.reduce((x,y)=>x+y,0)/simulatedFive.length;
const sdFive=Math.sqrt(simulatedFive.reduce((s,v)=>s+(v-meanFive)**2,0)/simulatedFive.length);
const nativeRateControl={
  plantCount:simulatedFive.length,originalLag5:observedFive,
  simulatedLag5Mean:meanFive,simulatedLag5SD:sdFive,
  simulatedLag5Min:Math.min(...simulatedFive),
  simulatedLag5Max:Math.max(...simulatedFive),
  simulatedLag5AtLeastOriginal:simulatedFive.filter(x=>x>=observedFive).length,
  simulatedRepeatsMin:Math.min(...simulatedRepeats),
  simulatedRepeatsMax:Math.max(...simulatedRepeats)
};
const scope=(first,last)=>{
  const indices=source.words.map((w,i)=>({w,i}))
    .filter(x=>x.w.startPage>=first&&x.w.startPage<=last).map(x=>x.i);
  const subset=indices.map(i=>originalDecoded[i]);
  return {words:subset.length,runes:subset.flat().length,
    normIoC:normIoC(subset),gibranLexiconHits:lexiconHits(subset),
    first18:subset.slice(0,18).map(w=>w.map(i=>gp.translit[i]).join("")).join(" ")};
};
console.log(JSON.stringify({
  status:"PASS",classification:"bounded negative, no authentic LP2 plaintext",
  wordResetNecessary:{
    originalDistinctByLength:byLength,
    nativeControlSingletonTypeCounts:{
      gibran:nativeTypes.gibran[1].types,shakespeare:nativeTypes.shakespeare[1].types},
    samePageOneCipherRuneContext:oneBack},
  rankTransport:{
    type:"fixed-radix two-back reversible entropy-rank transducer",
    noHistoricalKey:"No creator-specified GP29 rank or state clock is known",
    source:{runes:original.flat().length,adjacentRepeats:doublets(original),
      withinWordLag5:withinFive(original)},
    nativePlant:{runes:nativePlant.flat().length,wordCount:nativePlant.length,
      adjacentRepeats:doublets(plantedCipher),
      cipherLag5:withinFive(plantedCipher),nativeIoC:normIoC(nativePlant)},
    decodedOriginal:{normIoC:normIoC(originalDecoded),
      gibranLexiconHits:lexiconHits(originalDecoded),wordCount:originalDecoded.length,
      chapterP0to2:scope(0,2),blindP3to7:scope(3,7)},
    nativeRateControl,wrongModelControl:{normIoC:normIoC(wrongModel),
      gibranLexiconHits:lexiconHits(wrongModel)},
    arbitraryGP29Positive:true,nativeGP29Positive:true,originalRecipherInvariant:true
  }
},null,2));
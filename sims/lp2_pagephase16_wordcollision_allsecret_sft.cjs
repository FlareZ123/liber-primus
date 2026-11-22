"use strict";

/**
 * Exact all-secret original LP2 page×16-phase whole-word collision gate.
 *
 * Under ANY deterministic length-preserving whole-word map E[page,phase],
 * identical plaintext words at an identical page×phase must map to identical
 * ciphertext words, irrespective of 29! unknown alphabet keys, nonlinear
 * internal mixing, or page-specific substitutions. Source authentic period16
 * is the printed p15 Fibonacci-prime spiral. A page boundary resets its
 * phase only at the next COMPLETE printed word. The original 32 cross-page
 * words are never cut or resegmented.
 *
 * Condition: original word breaks correspond to native-GP English words.
 * Opposite possibilities (word breaks as control codes, ciphertext feedback,
 * per-word evolving state, non-English) are outside this bound.
 *
 * Node22/CommonJS single runnable test; read only; zero dependencies.
 * Run: node sims/lp2_pagephase16_wordcollision_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(base,p),"utf8").replace(/\r\n/g,"\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const runeId=new Map(gp.runes.map((x,i)=>[x,i]));
const raw=read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("")
  .replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"");
const regex=new RegExp("["+gp.runes.join("")+"]+","gu");
const source=(raw.match(regex)||[]).map(s=>Array.from(s,x=>runeId.get(x)));
assert.equal(source.length,2896);
assert.deepEqual(source.flat(),gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
assert.equal(source.flat().length,12956);
const ranges=[];
let off=0;
for(const page of gp.pages.filter(p=>p.page<=55)){
  ranges.push({page:page.page,start:off,end:off+page.indices.length});
  off+=page.indices.length;
}
assert.equal(off,12956);
const positions=[],pageStart=new Map();
let r=0;
for(let i=0;i<source.length;i++){
  const p=ranges.find(a=>r>=a.start&&r<a.end);
  assert(p);
  if(!pageStart.has(p.page))pageStart.set(p.page,i);
  positions.push({page:p.page,phase:(i-pageStart.get(p.page))%16,
    runePhase:(r-p.start)%16,length:source[i].length});
  r+=source[i].length;
}
assert.equal(r,12956);
const classes=new Map(),runeClasses=new Map(),lengthSlots=new Map();
for(const [i,p] of positions.entries()){
  const key=p.page+"|"+p.phase+"|"+p.length;
  if(!classes.has(key)) classes.set(key,[]);
  classes.get(key).push(i);
  const runeKey=p.page+"|"+p.runePhase+"|"+p.length;
  if(!runeClasses.has(runeKey))runeClasses.set(runeKey,[]);
  runeClasses.get(runeKey).push(i);
  if(!lengthSlots.has(p.length))lengthSlots.set(p.length,[]);
  lengthSlots.get(p.length).push(i);
}
assert.equal(classes.size,2417);
assert.equal(runeClasses.size,2315);
const pairs=groups=>[...groups.values()].reduce((n,ids)=>n+ids.length*(ids.length-1)/2,0);
const comparePairs=pairs(classes),runeComparePairs=pairs(runeClasses);
assert.equal(comparePairs,536);
assert.equal(runeComparePairs,690);

/** @param {number[][]} words */
function countCollisions(words,clock="word"){
  let n=0;
  const classMap=clock==="word"?classes:runeClasses;
  for(const ids of classMap.values()){
    const counts=new Map();
    for(const i of ids){
      const w=words[i].join(",");
      n+=counts.get(w)||0;
      counts.set(w,(counts.get(w)||0)+1);
    }
  }
  return n;
}
const sourcePairs=countCollisions(source),runeSourcePairs=countCollisions(source,"rune");
assert.equal(sourcePairs,0);
assert.equal(runeSourcePairs,0);

/** @param {number} seed */
function randomState(seed){
  let x=seed>>>0;
  return ()=>{
    x^=x<<13;
    x^=x>>>17;
    x^=x<<5;
    return (x>>>0)/4294967296;
  };
}
/** @param {string} filename */
function pools(filename){
  const out=new Map();
  for(const word of read(filename).match(/[A-Za-z]+/g)||[]){
    const s=encodeSourceNativeGP(word);
    if(!s.length)continue;
    if(!out.has(s.length))out.set(s.length,[]);
    out.get(s.length).push(s);
  }
  return out;
}
/**
 * Seeded length-matched source-native English GP word draw WITHOUT replacement
 * at every length, preserving exact 2896 printed word lengths.
 * @param {Map<number,number[][]>} donors
 * @param {()=>number} rng
 * @returns {number[][]}
 */
function matched(donors,rng){
  const words=Array(2896);
  for(const [length,slots] of lengthSlots){
    const pool=donors.get(length);
    assert(pool && pool.length>=slots.length,
      "source length pool shortage at "+length);
    const swaps=new Map();
    for(let k=0;k<slots.length;k++){
      const j=k+Math.floor(rng()*(pool.length-k));
      const vk=swaps.has(k)?swaps.get(k):k;
      const vj=swaps.has(j)?swaps.get(j):j;
      swaps.set(k,vj);
      swaps.set(j,vk);
      words[slots[k]]=pool[vj];
    }
  }
  return words;
}
const inv29=a=>{
  for(let k=1;k<29;k++)if(k*a%29===1)return k;
  throw Error("source nonzero multiplier must invert");
};
/**
 * A positive example: independent secret GP29 affine symbol maps for EVERY
 * page and local word phase. The theorem applies to much richer maps.
 * @param {number[][]} words
 * @param {boolean} inverse
 */
function cipher(words,inverse=false,clock="word"){
  return words.map((w,i)=>{
    const p=positions[i],phase=clock==="word"?p.phase:p.runePhase;
    const a=1+(7*p.page+11*phase+3)%28,b=(13*p.page+5*phase+11)%29;
    return w.map(x=>inverse?((x-b+29)*inv29(a))%29:(a*x+b)%29);
  });
}
const results=[];
for(const [sourceIndex,[name,file]] of [
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
].entries()){
  const donors=pools(file),N=1000,stats=[],runeStats=[];
  let plantCheck=null;
  for(let trial=0;trial<N;trial++){
    const rng=randomState((0x3301a5f0+
      Math.imul(sourceIndex+1,0x9e3779b9)+
      Math.imul(trial+1,0x85ebca6b))>>>0);
    const sample=matched(donors,rng);
    const found=countCollisions(sample),runeFound=countCollisions(sample,"rune");
    stats.push(found);
    runeStats.push(runeFound);
    if(trial===0){
      const encrypted=cipher(sample),runeEncrypted=cipher(sample,false,"rune");
      assert.equal(sample.flat().length,12956);
      assert.deepEqual(cipher(encrypted,true),sample);
      assert.deepEqual(cipher(runeEncrypted,true,"rune"),sample);
      assert.equal(countCollisions(encrypted),found);
      assert.equal(countCollisions(runeEncrypted,"rune"),runeFound);
      plantCheck={sourceRunes:12956,exactRecovery:12956,
        wordPhasePairsBefore:found,wordPhasePairsAfter:countCollisions(encrypted),
        runePhasePairsBefore:runeFound,runePhasePairsAfter:countCollisions(runeEncrypted,"rune")};
    }
  }
  stats.sort((a,b)=>a-b);
  runeStats.sort((a,b)=>a-b);
  assert(stats[0]>sourcePairs);
  assert(runeStats[0]>runeSourcePairs);
  results.push({name,draws:N,
    wordPhase:{minimum:stats[0],p05:stats[49],median:stats[499],
      p95:stats[949],maximum:stats[999],
      mean:stats.reduce((s,x)=>s+x,0)/N,
      drawsAtOrBelowOriginal:stats.filter(x=>x<=sourcePairs).length},
    runeStartPhase:{minimum:runeStats[0],p05:runeStats[49],median:runeStats[499],
      p95:runeStats[949],maximum:runeStats[999],
      mean:runeStats.reduce((s,x)=>s+x,0)/N,
      drawsAtOrBelowOriginal:runeStats.filter(x=>x<=runeSourcePairs).length},
    fullSourcePlant:plantCheck});
}
console.log(JSON.stringify({
  classification:"bounded original all-key deterministic page-reset 16-phase word- and rune-start-clock word-map exclusions",
  runes:12956,completeWords:2896,
  wordPhase:{classes:classes.size,
    classesWithComparableWords:[...classes.values()].filter(v=>v.length>1).length,
    comparablePairs:comparePairs,originalEqualPairs:sourcePairs},
  runeStartPhase:{classes:runeClasses.size,
    classesWithComparableWords:[...runeClasses.values()].filter(v=>v.length>1).length,
    comparablePairs:runeComparePairs,originalEqualPairs:runeSourcePairs},
  sourceNativeGPExactLengthControlsWithoutReplacement:results,
  limitation:"Requires native GP English words preserving original printed cuts and a deterministic whole-word map fixed for each physical page×word clock or page×rune-start clock modulo16. Allows arbitrary secret page/phase maps and nonlinear withinword mixing. Leaves feedback, resegmentation, other languages and per-word nonce open."
},null,2));

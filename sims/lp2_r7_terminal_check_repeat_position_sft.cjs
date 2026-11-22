"use strict";

/**
 * Exact source-conditioned diagnostic against the external Phase57 R7
 * hypothesis: one checked END rune in ~44.8% of words, appended after
 * imperfect anti-doublet repair. This is a conditional, position-
 * exchangeable test, not a universal key-independent impossibility.
 *
 * Node22 CommonJS, read-only. No plaintext or keys produced.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=read("resources/liber-primus/lp2-transcription.txt");
const runeSet=new Set(gp.runes);
let words=[],word=[],count=0;
for(const ch of source){
  if(runeSet.has(ch)){
    word.push(ch);count++;
    if(count===12956){words.push(word);break;}
  }else if(ch==="-"||ch==="."||ch==="&"){
    if(word.length)words.push(word);
    word=[];
  }
}
assert.equal(words.length,2896);
const stats={runes:count,words:words.length,
  eligibleWordEndSlots:0,withinWordAdjacentSlots:0,
  observedWithinWordDoubles:0,observedTerminalDoubles:0};
for(const w of words)if(w.length>=2){
  stats.eligibleWordEndSlots++;
  for(let j=1;j<w.length;j++){
    stats.withinWordAdjacentSlots++;
    if(w[j]===w[j-1]){
      stats.observedWithinWordDoubles++;
      if(j===w.length-1)stats.observedTerminalDoubles++;
    }
  }
}
assert.deepEqual(stats,{runes:12956,words:2896,
  eligibleWordEndSlots:2813,withinWordAdjacentSlots:10060,
  observedWithinWordDoubles:63,observedTerminalDoubles:19});

/** Exact binomial coefficient log using stable precomputed factorials. */
const fact=new Float64Array(13000);
for(let n=2;n<fact.length;n++)fact[n]=fact[n-1]+Math.log(n);
function logchoose(n,k){
  if(k<0||k>n)return -Infinity;
  return fact[n]-fact[k]-fact[n-k];
}
/** Exact hypergeometric upper tail P(X >= threshold).
 * @param {number} N eligible original base-pair slots
 * @param {number} K eligible end-pair slots
 * @param {number} picked total observed doubled pairs
 * @param {number} threshold observed doubled ends
 */
function hyperTail(N,K,picked,threshold){
  let p=0;
  for(let k=threshold;k<=Math.min(K,picked);k++)
    p+=Math.exp(logchoose(K,k)+logchoose(N-K,picked-k)-logchoose(N,picked));
  return p;
}
const q=0.448, variants=[];
for(const base of ["all-printed-words","multi-rune-words","no-end-check-rival"]){
  const numEndChecks=base==="all-printed-words"?
    Math.round(q*words.length):base==="multi-rune-words"?
      Math.round(q*stats.eligibleWordEndSlots):0;
  const eligible=stats.withinWordAdjacentSlots-numEndChecks;
  const eligibleEnds=stats.eligibleWordEndSlots-numEndChecks;
  variants.push({model:base,numEndChecks,eligiblePairSlots:eligible,
    eligibleFinalPairSlots:eligibleEnds,
    expectedEndDoubles:stats.observedWithinWordDoubles*eligibleEnds/eligible,
    upperTailP:hyperTail(eligible,eligibleEnds,
      stats.observedWithinWordDoubles,stats.observedTerminalDoubles)});
}
assert.ok(variants[0].upperTailP>.007&&variants[0].upperTailP<.01);
assert.ok(variants[1].upperTailP>.009&&variants[1].upperTailP<.013);
assert.ok(variants[2].upperTailP>.35&&variants[2].upperTailP<.45);

// Positive "source-shaped" planted R7 control, conditional on 63 doubles:
// sample positions exchangeably from eligible original pre-null locations.
let seed=0x3301a448;
function random(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return(seed>>>0)/4294967296;
}
const ntrials=20000;
const exemplar=variants[1];
let tail=0,mean=0;
for(let t=0;t<ntrials;t++){
  let N=exemplar.eligiblePairSlots,K=exemplar.eligibleFinalPairSlots,x=0;
  for(let j=0;j<stats.observedWithinWordDoubles;j++){
    if(random()<K/N){x++;K--;}
    N--;
  }
  mean+=x;
  if(x>=stats.observedTerminalDoubles)tail++;
}
const empirical=(tail+1)/(ntrials+1);
assert.ok(Math.abs(empirical-exemplar.upperTailP)<.005,
  "positive R7 hypergeometric plant disagrees with exact law");
console.log(JSON.stringify({
  scope:"R7 source-conditioned terminal pair exchangeability, NOT key-independent rejection",
  source:stats,
  variants,
  plantedControl:{ntrials,meanTerminalDoubles:mean/ntrials,
    estimatedUpperP:empirical},
  interpretation:"Observed 19 of 63 doubles occupy printed-word last pairs; R7 with 1260-1297 distinct end checks and otherwise position-exchangeable residual repeats predicts about 11. R7 is disfavored conditionally; arbitrary position-dependent repeat rules remain.",
  recoveredUnknownPlaintext:false
},null,2));

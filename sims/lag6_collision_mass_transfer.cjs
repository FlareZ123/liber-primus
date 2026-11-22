"use strict";
/**
 * Deterministic lag-six collision-repair accounting from canonical LP2 words.
 *
 * Let X be the tentative iid-uniform rune, A the preceding published rune,
 * B=T(C[i-6])=(24-2*C[i-6]) mod 29, and q the probability of rewriting
 * X=A as B. Conditional on the prior ciphertext (A,B fixed), the sum
 *
 *   E[1{C[i]=A}+1{C[i]=B} | past] = 2/29
 *
 * regardless of q and regardless of whether A=B. For A!=B, the individual
 * probabilities are (1-q)/29 and (1+q)/29. The sum is therefore an
 * independent, no-extra-parameter model consequence. At A=B the two
 * indicators coincide and each has expectation 1/29.
 *
 * The T mapping was chosen after prior LP2 searches, so agreement is a
 * conditional mechanistic cross-check rather than a discovery-wide p-value.
 */
const assert=require("node:assert/strict");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const GP=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const TO_INDEX=new Map(GP.map((r,i)=>[r,i]));
const mod=x=>(x%29+29)%29;

/** @returns {number[][]} */
function corpus() {
  const words=parseSharedCorpus().words.map(w=>[...w.runes].map(c=>TO_INDEX.get(c)));
  assert.equal(words.length,2896);
  assert.equal(words.flat().length,12956);
  return words;
}
/** @returns {{n:number,forward:number,reverse:number,adjacent:number,duplicateTarget:number,overlap:number}} */
function blank() {
  return {n:0,forward:0,reverse:0,adjacent:0,duplicateTarget:0,overlap:0};
}
/** @param {number[][]} words */
function census(words) {
  const all=blank(),quarters=Array.from({length:4},blank);
  const lengths={};
  const register=(o,w,i)=>{
    const previous=w[i-1],candidate=w[i],target=mod(24-2*w[i-6]);
    const f=candidate===target,a=candidate===previous;
    o.n++;
    if(f)o.forward++;
    if(w[i-6]===mod(24-2*candidate))o.reverse++;
    if(a)o.adjacent++;
    if(target===previous)o.duplicateTarget++;
    if(f&&a)o.overlap++;
  };
  for(let word=0;word<words.length;word++){
    const w=words[word],quarter=Math.floor(4*word/words.length);
    for(let i=6;i<w.length;i++){
      register(all,w,i);register(quarters[quarter],w,i);
      const o=lengths[w.length]??(lengths[w.length]=blank());
      register(o,w,i);
    }
  }
  const shape=o=>{
    const expect=o.n/29,capacity=(o.n-o.duplicateTarget)/29;
    return {...o,forwardExcess:o.forward-expect,
      adjacentDeficit:expect-o.adjacent,
      conservation:o.forward+o.adjacent,conservationExpected:2*expect,
      qEstimatedFromForward:capacity>0?(o.forward-expect)/capacity:null,
      qEstimatedFromAdjacent:capacity>0?(expect-o.adjacent)/capacity:null};
  };
  return {all:shape(all),quarters:quarters.map(shape),
    byWordLength:Object.fromEntries(Object.entries(lengths).map(([k,o])=>[k,shape(o)]))};
}
/** @param {number[][]} words */
function main(words=corpus()){
  const data=census(words),v=data.all;
  assert.deepEqual(
    [v.n,v.forward,v.reverse,v.adjacent,v.duplicateTarget,v.overlap],
    [1290,80,44,9,33,1]
  );
  const pageRepeatRate=86/12901,wordRepeatRate=63/10060;
  const globalQ=1-29*pageRepeatRate,wordQ=1-29*wordRepeatRate;
  return {
    source:{runes:12956,words:2896,lag:6,affine:{multiplier:-2,intercept:24,mod:29}},
    interpretation:"Conditional mass-transfer identity under a hypothesized uniform tentative rune and collision-triggered T overwrite, not a verified cipher",
    conditionalExpectation:"E[forward indicator + adjacent equality indicator | past] = 2/29",
    expectedGlobalUnrepairedDoubletRate:1/29,
    estimatedRewriteFromAllPhysicalAdjacencies:globalQ,
    estimatedRewriteFromAllWithinWordAdjacencies:wordQ,
    ...data
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+"\n");
module.exports={corpus,census,main};

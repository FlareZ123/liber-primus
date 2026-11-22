"use strict";
/**
 * Candidate model: Y_i = (P_i + a*P_(i-1)) mod 29, reset P_-1=0 at each
 * rune word, followed by any unknown bijection sigma_w of 29 output labels.
 * Every internal equality pattern survives sigma_w exactly. A single shared
 * sigma also preserves global index of coincidence.
 *
 * Compare LP2 lag2..8 equality rates to length-matched English-GP words,
 * preselect coefficients on lags2..4, use 5..8 for a heldout structural test,
 * and run the full adaptive selection on an iid 81%-doublet-repaired null.
 * No secret keys or plaintext are recovered by this invariance experiment.
 */
const assert=require("node:assert/strict");
const {loadWords}=require("./word_partition_invariant.cjs");
const M=29,MIN=4,MAX=9,LAGS=9;
const mod=x=>(x%M+M)%M;
function enc(word,a){
  let prev=0;
  return word.map(p=>{const y=mod(p+a*prev);prev=p;return y;});
}
function measure(words){
  const counts=Array(10).fill(0),lag=Array(LAGS).fill(0);
  const total=Array(LAGS).fill(0),nonadj=Array(10).fill(0);
  for(const w of words){
    const n=w.length;if(n<MIN||n>MAX)continue;
    counts[n]++;
    for(let d=2;d<n;d++){
      total[d]+=n-d;
      for(let j=d;j<n;j++)if(w[j]===w[j-d]){
        lag[d]++;nonadj[n]++;
      }
    }
  }
  return {counts,lag,total,nonadj,wordCount:counts.reduce((a,b)=>a+b,0)};
}
function ioc(words){
  const hist=Array(29).fill(0);let n=0;
  for(const w of words)for(const v of w){hist[v]++;n++;}
  return hist.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));
}
function expectations(reference,counts,slope){
  const arrays=Array.from({length:10},()=>[]);
  for(const w of reference)if(w.length>=MIN&&w.length<=MAX)
    arrays[w.length].push(enc(w,slope));
  const means=new Float64Array(LAGS),variances=new Float64Array(LAGS);
  for(let n=MIN;n<=MAX;n++){
    const batch=arrays[n];assert.ok(batch.length>0,"Missing reference length "+n);
    const totals=new Float64Array(LAGS),sq=new Float64Array(LAGS);
    for(const w of batch)for(let d=2;d<n;d++){
      let same=0;
      for(let j=d;j<n;j++)same+=(w[j]===w[j-d]?1:0);
      totals[d]+=same;sq[d]+=same*same;
    }
    for(let d=2;d<n;d++){
      const mean=totals[d]/batch.length;
      means[d]+=counts[n]*mean;
      variances[d]+=counts[n]*(sq[d]/batch.length-mean*mean);
    }
  }
  return {a:slope,means:Array.from(means),vars:Array.from(variances)};
}
function chi(o,e,from=2,to=8){
  let out=0;
  for(let d=from;d<=to;d++){
    const variance=Math.max(1,e.vars[d]),z=o.lag[d]-e.means[d];
    out+=z*z/variance;
  }
  return out;
}
function rand(seed){
  let x=seed>>>0;
  return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};
}
function iidNull(words,random,q=.81){
  const out=[];let last=-1;
  for(const w of words){
    const x=[];
    for(let i=0;i<w.length;i++){
      let c=Math.floor(random()*M);
      if(c===last&&random()<q)
        c=(c+1+Math.floor(random()*28))%M;
      x.push(c);last=c;
    }
    out.push(x);
  }
  return out;
}
function slopeTable(o,reference){
  return Array.from({length:29},(_,a)=>{
    const e=expectations(reference,o.counts,a);
    return {...e,train:chi(o,e,2,4),
      test:chi(o,e,5,8),joint:chi(o,e,2,8)};
  });
}
function minBy(rows,key){
  return rows.reduce((best,x)=>x[key]<best[key]?x:best);
}
function selectedNull(cipher,expected,replicates,seed){
  const random=rand(seed);let heldoutAtOrBelow=0,jointAtOrBelow=0;
  const actual=measure(cipher),t=minBy(expected,"train"),
    full=minBy(expected,"joint");
  const heldScore=t.test,jointScore=full.joint;
  const allHeld=[],allJoint=[];
  for(let k=0;k<replicates;k++){
    const o=measure(iidNull(cipher,random));
    const scored=expected.map(e=>({a:e.a,train:chi(o,e,2,4),
      test:chi(o,e,5,8),joint:chi(o,e,2,8)}));
    const selected=minBy(scored,"train"),j=minBy(scored,"joint");
    if(selected.test<=heldScore)heldoutAtOrBelow++;
    if(j.joint<=jointScore)jointAtOrBelow++;
    allHeld.push(selected.test);allJoint.push(j.joint);
  }
  allHeld.sort((a,b)=>a-b);allJoint.sort((a,b)=>a-b);
  return {replicates,seed,nearNoRepeatOverwriteProbability:.81,
    trainSelectedHeldoutLowerTailP:(heldoutAtOrBelow+1)/(replicates+1),
    anySlopeFullProfileLowerTailP:(jointAtOrBelow+1)/(replicates+1),
    heldoutNullMedian:allHeld[Math.floor(replicates/2)],
    bestJointNullMedian:allJoint[Math.floor(replicates/2)]};
}
function report({replicates=3000}={}){
  const {cipher,shakespeare,lp1,unique}=loadWords(),o=measure(cipher),summaries={};
  for(const [name,words]of Object.entries({shakespeare,lp1,unique})){
    const slopes=slopeTable(o,words),ordered=slopes.slice().sort((a,b)=>a.train-b.train);
    const selected=ordered[0],bestJoint=minBy(slopes,"joint");
    const seed=name==="shakespeare"?0x33012026:name==="lp1"?0x33012027:0x33012028;
    summaries[name]={
      sourceWords:words.length,
      trainSelected:{slope:selected.a,trainChi:selected.train,
        untouchedLag5to8Chi:selected.test,
        lagForecast:selected.means.slice(2).map(x=>Number(x.toFixed(3))),
        unfilteredGlobalIoC:ioc(words.map(w=>enc(w,selected.a)))},
      bestJoint:{slope:bestJoint.a,jointChi:bestJoint.joint,
        trainChi:bestJoint.train,heldoutLagChi:bestJoint.test},
      trainingTopFive:ordered.slice(0,5).map(e=>({
        a:e.a,train:e.train,heldout:e.test,joint:e.joint})),
      null:selectedNull(cipher,slopes,replicates,seed)
    };
  }
  return {model:"word-reset plaintext-autokey modulo29, arbitrary 29-way outer permutation, no recovered key",
    actual:{words:cipher.length,runes:cipher.reduce((n,w)=>n+w.length,0),
      ioc:ioc(cipher),wordRangeCount:o.wordCount,lag2to8:o.lag.slice(2),
      opportunityPairs:o.total.slice(2),
      nonadjByWordLength:o.nonadj.slice(MIN,MAX+1)},summaries};
}
if(require.main===module)console.log(JSON.stringify(report(),null,2));
module.exports={enc,measure,ioc,expectations,chi,rand,iidNull,slopeTable,report};

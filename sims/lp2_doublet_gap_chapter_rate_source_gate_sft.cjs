'use strict';
/**
 * A native LP2 86-doublet rare-event state test. The prior independently
 * reported +0.380 inter-event gap autocorrelation is exact; this new gate
 * asks whether NINE visible illustrated chapters simply have different
 * constant repeat rates. Draw 86 distinct eligible sites without replacement
 * with a reproducible Floyd sampler, 200,000 source-shape null surrogates.
 * Run: node sims/lp2_doublet_gap_chapter_rate_source_gate_sft.cjs
 * Node22/Windows11/CommonJS built-ins, no writes.
 */
const assert=require('node:assert/strict');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const pages=corpus.pages.filter(p=>p.page<=55);
const spans=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapters=spans.map(([a,b])=>{
  let n=0,k=0;
  for(const page of pages.filter(p=>p.page>=a&&p.page<=b)){
    n+=Math.max(0,page.indices.length-1);
    for(let i=1;i<page.indices.length;i++)
      if(page.indices[i]===page.indices[i-1])k++;
  }
  return {pages:String(a)+'..'+String(b),n,k};
});
const N=chapters.reduce((s,x)=>s+x.n,0),K=chapters.reduce((s,x)=>s+x.k,0);
assert.equal(N,12901);assert.equal(K,86);
assert.deepEqual(chapters.map(x=>x.n),[726,1140,1722,1895,1017,1427,1673,2995,306]);
assert.deepEqual(chapters.map(x=>x.k),[4,6,9,10,11,13,12,18,3]);
const sites=[];let global=0;
for(const page of pages){
  for(let i=1;i<page.indices.length;i++)
    if(page.indices[i]===page.indices[i-1])sites.push(global+i);
  global+=page.indices.length;
}
assert.equal(global,12956);assert.equal(sites.length,86);
const gaps=sites.slice(1).map((p,i)=>p-sites[i]);
/** @param {number[]} a @param {number[]} b @returns {number} */
function corr(a,b){
  const n=a.length,meanA=a.reduce((s,x)=>s+x,0)/n,
    meanB=b.reduce((s,x)=>s+x,0)/n;
  let cov=0,varA=0,varB=0;
  for(let i=0;i<n;i++){
    const da=a[i]-meanA,db=b[i]-meanB;
    cov+=da*db;varA+=da*da;varB+=db*db;
  }
  return cov/Math.sqrt(varA*varB);
}
const ac=corr(gaps.slice(0,-1),gaps.slice(1));
assert(Math.abs(ac-0.38001968924100965)<1e-12);
const histogram=Array.from({length:13},(_,j)=>sites.filter(p=>Math.floor(p/1000)===j).length);
assert.deepEqual(histogram,[8,3,7,2,6,9,10,8,11,2,9,6,5]);
/** @param {number[]} counts @returns {number} */
function deviance(counts){
  const q=K/N;return 2*counts.reduce((s,k,j)=>{
    const n=chapters[j].n,expected=n*q;
    return s+(k>0?k*Math.log(k/expected):0)+
      (n-k>0?(n-k)*Math.log((n-k)/(n-expected)):0);
  },0);
}
const observed=deviance(chapters.map(x=>x.k));
assert(Math.abs(observed-5.739188548731982)<1e-11);
let seed=0x33012211;
/** @returns {number} */
function random32(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
const cum=chapters.map(x=>x.n);
for(let i=1;i<cum.length;i++)cum[i]+=cum[i-1];
let above=0;
const D=200000;
for(let d=0;d<D;d++){
  const sample=new Set(),counts=Array(9).fill(0);
  for(let j=N-K;j<N;j++){
    const t=random32()%(j+1),value=sample.has(t)?j:t;
    sample.add(value);
    let which=0;while(value>=cum[which])which++;counts[which]++;
  }
  if(deviance(counts)>=observed)above++;
}
assert.equal(above,140550);
const p=(above+1)/(D+1);
console.log(JSON.stringify({
  originalRunes:global,originalDoublets:K,eligibleAdjacentPositions:N,
  originalGapAC1:ac,blocks1000:histogram,chapters,
  nineRateVsOneRateDeviance:observed,
  fixedEventUniformWithoutReplacement:{seed:'0x33012211',draws:D,exceed:above,p},
  outcome:'No nine-chapter rate-step evidence despite earlier source-origin '+
    'doublet inter-gap autocorrelation; this does not recover plaintext or key'
},null,2));

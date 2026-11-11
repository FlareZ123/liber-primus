"use strict";
/**
 * Source-constrained all-pairs GF(29) polynomial-factor screen.
 *
 * The original printed p50 grid and p29 rune stream share the visible
 * p39 quadratic factor G. This checks whether the *other* original
 * rune-bearing pages have additional reusable polynomial factors.
 *
 * Null A shuffles source symbols within each page. Null B additionally
 * preserves each page's exact adjacent-equal count via local MCMC swaps.
 * Both retain page lengths, multisets, and section membership. Neither
 * is a full model of the encryption architecture.
 *
 * Run from repository root with Node.js 22:
 *   node sims/lp2_original_pairwise_gf29_gcd_sft.cjs
 *
 * Read-only; deterministic; no inferred plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname,"..");
/** @param {string} p @returns {any} */
const load = p => JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const c = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/base60-grid.json");
const entries = c.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => ({page:p.page,values:p.indices.slice()}));
entries.push({page:"grid",values:grid.byte_rows.flat().map(v=>v%29)});
assert.equal(entries.length,56);
assert.equal(entries.slice(0,-1).reduce((n,p)=>n+p.values.length,0),12956);
assert.equal(entries.at(-1).values.length,256);

const M=29,inv=Array(M).fill(0);
for(let a=1;a<M;a++)for(let b=1;b<M;b++)
  if((a*b)%M===1)inv[a]=b;
/** @param {number} v */
const mod=v=>(v%M+M)%M;
/** @param {number[]} p */
function trim(p){
  if(p.length===0)return[0];
  let j=0;while(j<p.length-1&&p[j]===0)j++;
  return j?p.slice(j):p;
}
/** Polynomial Euclidean GCD, descending source coefficients, monic result.
 * @param {number[]} u @param {number[]} v @returns {number[]} */
function gcd(u,v){
  let a=trim(u.map(mod)),b=trim(v.map(mod));
  while(b.length!==1||b[0]!==0){
    if(a.length<b.length)[a,b]=[b,a];
    const rows=a.length-b.length+1,r=a.slice(),scale=inv[b[0]];
    for(let i=0;i<rows;i++){
      const factor=r[i]*scale%M;
      if(factor)for(let j=0;j<b.length;j++)
        r[i+j]=mod(r[i+j]-factor*b[j]);
    }
    a=b;b=trim(r.slice(rows));
  }
  const scale=inv[a[0]];
  return a.map(v=>v*scale%M);
}
/** @param {number[]} p @param {number} x */
function valueAt(p,x){
  let v=0;for(const a of p)v=(v*x+a)%M;return v;
}
/** @param {number[]} p */
function repeatCount(p){
  let n=0;for(let i=1;i<p.length;i++)n+=Number(p[i]===p[i-1]);
  return n;
}
/** @param {number[][]} pages */
function rootStats(pages){
  let total=0,overlap=0;
  const histogram=Array(29).fill(0);
  for(let x=0;x<29;x++){
    let count=0;
    for(const p of pages)count+=Number(valueAt(p,x)===0);
    histogram[x]=count;
    total+=count;overlap+=count*(count-1)/2;
  }
  return {rootTotal:total,rootOverlap:overlap,rootByEvaluationPoint:histogram};
}
/** @param {number} seed */
function prng(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
/** @param {number[]} a @param {()=>number} random */
function shuffle(a,random){
  for(let i=a.length-1;i>0;i--){
    const j=random()%(i+1);[a[i],a[j]]=[a[j],a[i]];
  }
}
/** Preserve the precise page-local number of adjacent equal GP symbols.
 * @param {number[]} a @param {()=>number} random @param {number} attempts */
function exchange(a,random,attempts){
  const len=a.length;
  for(let step=0;step<attempts;step++){
    const i=random()%len,j=random()%len;
    if(i===j||a[i]===a[j])continue;
    const edges=[i-1,i,j-1,j].filter((k,pos,all)=>
      k>=0&&k<len-1&&all.indexOf(k)===pos);
    let before=0;
    for(const k of edges)before+=Number(a[k]===a[k+1]);
    [a[i],a[j]]=[a[j],a[i]];
    let after=0;
    for(const k of edges)after+=Number(a[k]===a[k+1]);
    if(before!==after)[a[i],a[j]]=[a[j],a[i]];
  }
}
/** @param {number[]} values */
function summary(values,observed){
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  return {replicates:values.length,mean,min:Math.min(...values),
    max:Math.max(...values),atLeastObserved:values.filter(v=>v>=observed).length,
    plusOneUpperTail:(values.filter(v=>v>=observed).length+1)/(values.length+1)};
}
/** @param {number[][]} ps @param {number} repeats @param {number} seed */
function withinPageNull(ps,repeats,seed){
  const random=prng(seed),roots=[],overlaps=[];
  for(let trial=0;trial<repeats;trial++){
    const shuffled=ps.map(p=>p.slice());
    for(const a of shuffled)shuffle(a,random);
    const s=rootStats(shuffled);
    roots.push(s.rootTotal);overlaps.push(s.rootOverlap);
  }
  return {rootTotal:summary(roots,original.rootTotal),
    rootOverlap:summary(overlaps,original.rootOverlap)};
}
/** @param {number[][]} ps @param {number} repeats @param {number} seed */
function adjacencyMatchedNull(ps,repeats,seed){
  const random=prng(seed),held=ps.map(p=>p.slice());
  const adjacent=held.map(repeatCount),roots=[],overlaps=[];
  for(let trial=0;trial<repeats;trial++){
    for(const a of held)exchange(a,random,7*a.length);
    if((trial%25)===0)
      assert.deepEqual(held.map(repeatCount),adjacent);
    const s=rootStats(held);
    roots.push(s.rootTotal);overlaps.push(s.rootOverlap);
  }
  assert.deepEqual(held.map(repeatCount),adjacent);
  return {rootTotal:summary(roots,original.rootTotal),
    rootOverlap:summary(overlaps,original.rootOverlap),
    exactPerPageAdjacentEqualCountsPreserved:true,
    attemptedSwapsPerPagePerReplicate:"seven times source page length"};
}
const pairs=[],byDegree=Array(10).fill(0);
for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
  const factor=gcd(entries[i].values,entries[j].values);
  const degree=factor.length-1;
  assert(degree<byDegree.length);
  byDegree[degree]++;
  if(degree>=2)pairs.push({pages:[entries[i].page,entries[j].page],
    degree,monicFactor:factor});
}
pairs.sort((a,b)=>b.degree-a.degree);
assert.deepEqual(byDegree.slice(0,4),[1450,88,2,0]);
assert.equal(pairs.length,2);
assert.deepEqual(pairs.map(p=>p.pages),[[27,48],[29,"grid"]]);
assert.deepEqual(pairs.map(p=>p.monicFactor),[[1,6,0],[1,10,25]]);
assert.deepEqual(gcd([1,10,25,1,10,25],[1,10,25,2,20,50]),
  [1,10,25]); // common quadratic, distinct following linear factors
const ps=entries.map(p=>p.values);
const original=rootStats(ps);
assert.equal(original.rootTotal,75);
assert.equal(original.rootOverlap,91);
assert.deepEqual(original.rootByEvaluationPoint.slice(0,5),[4,2,5,3,5]);
const controls={
  withinPagePermutations:withinPageNull(ps,600,0x31415926),
  adjacencyMatchedSwaps:adjacencyMatchedNull(ps,400,0x3301ae29)
};
console.log(JSON.stringify({
  input:{runeBearingPages:55,gridBytes:256,runicSymbols:12956,
    polynomialCount:entries.length,pairsChecked:1540},
  observed:{gcdDegrees:{zero:byDegree[0],one:byDegree[1],
    two:byDegree[2],atLeastThree:byDegree.slice(3).reduce((a,b)=>a+b,0)},
    uniqueHigherDegreePairs:pairs,...original},
  nullExpectation:{degreeAtLeastTwo:1540/(29*29),
    degreeAtLeastThree:1540/(29**3),totalRoots:56,
    pairOverlapApprox:1540/29},
  controls,
  conclusion:"No common polynomial of degree >=3 across the 55 original rune pages plus source grid. The two shared quadratics are known p29/grid G and p27/p48 X(X+6); other roots are weak exploratory signals, not keys or plaintext."
},null,2));

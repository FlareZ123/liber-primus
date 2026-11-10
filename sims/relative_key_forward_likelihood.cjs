'use strict';
/**
 * Exact marginalized two-time-pad English test for LP2 pages 28 and 42.
 *
 * Model C_a(t)-C_b(t)=scale*(P_a(t)-P_b(t)) modulo 29.
 * The unknown common key cancels; each plaintext is independently generated
 * by a smoothed GP bigram process, conditional on its physical rune-word
 * boundaries. The forward algorithm sums all 29^n compatible plaintext
 * pairs in O(29^2*n), without finding a favorable decoded path.
 *
 * A separate position-conditioned unigram model identifies how much evidence
 * is explained by rune marginals / word boundaries alone.
 *
 * Node.js 22, no third-party dependencies; on-demand workflow only.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { corpusWords, lp2Page, stream } = require('./relative_key_english_probe.cjs');

const ROOT = path.resolve(__dirname, '..');
const M = 29, N = 31, START = 29, END = 30;
const mod = x => ((x % M) + M) % M;

/** @param {number[][]} words */
function train(words) {
  const counts = new Float64Array(N*N);
  const totals = new Float64Array(N), unigrams = new Float64Array(N);
  const bySlot = Array.from({length: 4}, () => new Float64Array(M));
  const slotTotals = new Float64Array(4), global = new Float64Array(M);
  for (const word of words) {
    let prev = START;
    for (let i=0; i<word.length; i++) {
      const c = word[i], slot = (i===0?1:0) + (i===word.length-1?2:0);
      bySlot[slot][c]++; slotTotals[slot]++; global[c]++;
    }
    for (const c of [...word, END]) {
      counts[prev*N+c]++; totals[prev]++; unigrams[c]++; prev=c;
    }
  }
  const total = unigrams.reduce((a,b)=>a+b,0);
  const conditional = new Float64Array(N*N);
  for (let a=0; a<N; a++) for (let b=0; b<N; b++)
    conditional[a*N+b] = (counts[a*N+b] + 5*(unigrams[b]+1)/(total+N))/(totals[a]+5);
  const globalN = global.reduce((a,b)=>a+b,0);
  const marginal = bySlot.map((counts,i) => Float64Array.from(counts,(v,j) =>
    (v+10*global[j]/globalN)/(slotTotals[i]+10)));
  return { conditional, marginal, trainTokens: words.length };
}

/**
 * Marginal likelihood of one rune stream's observed word-break mask.
 * @param {{start:boolean[],end:boolean[]}} page
 * @param {Float64Array} T
 * @param {number} n
 */
function singleLogZ(page,T,n) {
  let state=new Float64Array(M), next=new Float64Array(M), logZ=0;
  for(let t=0;t<n;t++) {
    let z=0;
    for(let c=0;c<M;c++) {
      let x=0;
      if(t===0||page.start[t])x=T[START*N+c];
      else for(let p=0;p<M;p++)x+=state[p]*T[p*N+c];
      if(page.end[t])x*=T[c*N+END];
      next[c]=x;z+=x;
    }
    assert.ok(z>0);
    logZ+=Math.log(z);
    for(let c=0;c<M;c++)next[c]/=z;
    [state,next]=[next,state];
  }
  return logZ;
}

/**
 * Log likelihood ratio of difference stream against independent uniform
 * 29-symbol differences, conditional on both observed word-break masks.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @param {Float64Array} T
 * @param {number} inverseScale
 * @param {number} shift
 * @param {number} logDenominator
 */
function forwardLLR(a,b,T,inverseScale,shift,logDenominator) {
  const n=Math.min(a.xs.length,b.xs.length);
  let state=new Float64Array(M),next=new Float64Array(M),logZ=0;
  for(let t=0;t<n;t++) {
    const d=mod(inverseScale*(a.xs[t]-b.xs[(t+shift)%b.xs.length]));
    const prior=t?mod(inverseScale*(a.xs[t-1]-b.xs[(t+shift-1)%b.xs.length])):0;
    let z=0;
    for(let p=0;p<M;p++) {
      const q=mod(p-d);
      let x=0;
      if(t===0)x=T[START*N+p]*T[START*N+q];
      else for(let previous=0;previous<M;previous++) {
        const previousQ=mod(previous-prior);
        x+=state[previous]
          *(a.start[t]?T[START*N+p]:T[previous*N+p])
          *(b.start[t]?T[START*N+q]:T[previousQ*N+q]);
      }
      if(a.end[t])x*=T[p*N+END];
      if(b.end[t])x*=T[q*N+END];
      next[p]=x;z+=x;
    }
    assert.ok(z>0,'forward normalization became zero');
    logZ+=Math.log(z);
    for(let p=0;p<M;p++)next[p]/=z;
    [state,next]=[next,state];
  }
  return logZ-logDenominator+n*Math.log(M);
}

/** @param {boolean} starts @param {boolean} ends */
const slot=(starts,ends)=>(starts?1:0)+(ends?2:0);

/**
 * Independent character marginal test using the same exact word-break classes.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @param {Float64Array[]} marginal
 * @param {number} inverseScale
 * @param {number} shift
 */
function iidLLR(a,b,marginal,inverseScale,shift) {
  let score=0;
  const n=Math.min(a.xs.length,b.xs.length);
  for(let t=0;t<n;t++) {
    const d=mod(inverseScale*(a.xs[t]-b.xs[(t+shift)%b.xs.length]));
    const qa=marginal[slot(a.start[t],a.end[t])];
    const qb=marginal[slot(b.start[t],b.end[t])];
    let probability=0;
    for(let p=0;p<M;p++)probability+=qa[p]*qb[mod(p-d)];
    score+=Math.log(M*probability);
  }
  return score;
}

/**
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @param {{conditional:Float64Array,marginal:Float64Array[]}} model
 * @param {number} scale
 * @param {boolean} allShifts
 */
function evaluate(a,b,model,scale=4,allShifts=true) {
  const inverse=Array.from({length:M-1},(_,i)=>i+1).find(v=>mod(scale*v)===1);
  assert.notEqual(inverse,undefined);
  const n=Math.min(a.xs.length,b.xs.length);
  const denom=singleLogZ(a,model.conditional,n)+singleLogZ(b,model.conditional,n);
  const rows=[];
  for(let shift=0;shift<(allShifts?b.xs.length:1);shift++) {
    const forward=forwardLLR(a,b,model.conditional,inverse,shift,denom);
    const iid=iidLLR(a,b,model.marginal,inverse,shift);
    rows.push({shift,forward,iid,excess:forward-iid});
  }
  const real=rows[0],top=rows.slice().sort((x,y)=>y.forward-x.forward);
  const improvement=rows.slice().sort((x,y)=>y.excess-x.excess);
  const topIID=rows.slice().sort((x,y)=>y.iid-x.iid);
  return {
    scale, n, observed:real, shifts:rows.length,
    forwardRank:top.findIndex(x=>x.shift===0)+1,
    iidRank:topIID.findIndex(x=>x.shift===0)+1,
    excessRank:improvement.findIndex(x=>x.shift===0)+1,
    topForward:top.slice(0,5), topExcess:improvement.slice(0,3),
    medianForward:top[Math.floor(top.length/2)].forward,
    medianExcess:improvement[Math.floor(improvement.length/2)].excess
  };
}

/** @param {number} seed */
function rng(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}

/** Run authentic target, held-out true-key plants and independent-key decoys. */
function study(){
  const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const training=corpusWords(source.slice(0,240000)),heldout=corpusWords(source.slice(240000));
  const model=train(training),pageA=lp2Page(28),pageB=lp2Page(42),rand=rng(3301);
  const target4=evaluate(pageA,pageB,model,4);
  const target1=evaluate(pageA,pageB,model,1);
  const plants=[],decoys=[];
  for(let trial=0;trial<12;trial++){
    const p=stream(heldout.slice(trial*350,trial*350+400),269);
    const q=stream(heldout.slice(5000+trial*350,5400+trial*350),269);
    assert.equal(p.xs.length,269);assert.equal(q.xs.length,269);
    const shared=p.xs.map(()=>Math.floor(rand()*M));
    const independent=q.xs.map(()=>Math.floor(rand()*M));
    const cp={...p,xs:p.xs.map((v,i)=>mod(4*v+shared[i]))};
    const cq={...q,xs:q.xs.map((v,i)=>mod(4*v+shared[i]))};
    const randomQ={...q,xs:q.xs.map((v,i)=>mod(4*v+independent[i]))};
    plants.push(evaluate(cp,cq,model,4,trial===0));
    decoys.push(evaluate(cp,randomQ,model,4,false));
  }
  const summary=rows=>({
    forward:rows.map(r=>r.observed.forward),iid:rows.map(r=>r.observed.iid),
    excess:rows.map(r=>r.observed.excess)
  });
  return {
    hypothesis:'same-position scaled reused-key English GP plaintext for LP2 pages 28/42',
    method:'exact 29-state marginalized bigram forward algorithm; independent word boundary masks; separately trained slot-conditioned iid baseline',
    trainingWords:model.trainTokens,
    target4,target1,
    plantedControls:summary(plants),plantedFirstShiftRank:plants[0].forwardRank,
    independentKeyControls:summary(decoys),
    interpretation:'The same pair and scale were selected before this test. A top within-pair rotation rank alone does not establish plaintext or shared key.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
module.exports={train,singleLogZ,forwardLLR,iidLLR,evaluate,study};

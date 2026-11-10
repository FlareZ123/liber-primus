'use strict';
/**
 * Invert the known/alleged LP2 shared-key cancellation with an UNKNOWN
 * common plaintext alphabet permutation:
 *
 * C_a[t]-C_b[t]=sigma(P_a[t])-sigma(P_b[t]) (mod29).
 *
 * Enumerate exact 1-swap neighborhoods of the hinted affine sigma(p)=4*p,
 * then train-optimize up to two swaps. For every candidate sigma the
 * likelihood sums ALL compatible English-GP plaintext pair paths by a
 * 29-state forward algorithm, preserving both observed word-break masks.
 * A disjoint second half evaluates the selected transformation.
 *
 * This is an explicit inversion attempt; optimizing training likelihood
 * alone is not a decryption. Node 22, CommonJS, no external packages.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=require('./relative_key_english_probe.cjs');
const {train,singleLogZ}=require('./relative_key_forward_likelihood.cjs');
const ROOT=path.resolve(__dirname,'..');
const M=29,N=31,START=29,END=30,mod=x=>(x%M+M)%M;
const f0=Array.from({length:M},(_,i)=>mod(4*i));

/** @param {number[]} f */
function canonical(f){
  const zero=f[0];
  return f.map(x=>mod(x-zero));
}
/** @param {number[]} f @param {number} i @param {number} j */
function swapped(f,i,j){
  const out=f.slice();
  [out[i],out[j]]=[out[j],out[i]];
  return canonical(out);
}
/** @param {number[]} f */
function validate(f){
  assert.equal(f.length,M);
  assert.equal(new Set(f).size,M);
  assert.equal(f[0],0);
}
/**
 * @param {number[]} f
 * @param {number[]} D
 */
function qTable(f,D){
  validate(f);
  const inverse=new Uint8Array(M);
  for(let p=0;p<M;p++)inverse[f[p]]=p;
  const rows=Array.from({length:M},(_,d)=>{
    const values=new Uint8Array(M);
    for(let p=0;p<M;p++)values[p]=inverse[mod(f[p]-d)];
    return values;
  });
  return D.map(d=>rows[d]);
}
/**
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @param {Float64Array} T
 * @param {number[]} f
 * @param {number} from
 * @param {number} to
 */
function numerator(a,b,T,f,from,to){
  const differences=[];
  for(let t=from;t<to;t++)differences.push(mod(a.xs[t]-b.xs[t]));
  const Q=qTable(f,differences);
  let state=new Float64Array(M),next=new Float64Array(M),logZ=0;
  for(let offset=0;offset<Q.length;offset++){
    const t=from+offset,curr=Q[offset],prev=Q[offset-1],isFirst=offset===0;
    const startA=isFirst||a.start[t],startB=isFirst||b.start[t];
    let z=0;
    for(let p=0;p<M;p++){
      const q=curr[p];
      let x=0;
      if(isFirst)x=T[START*N+p]*T[START*N+q];
      else for(let previous=0;previous<M;previous++){
        x+=state[previous]
          *(startA?T[START*N+p]:T[previous*N+p])
          *(startB?T[START*N+q]:T[prev[previous]*N+q]);
      }
      if(a.end[t])x*=T[p*N+END];
      if(b.end[t])x*=T[q*N+END];
      next[p]=x;z+=x;
    }
    assert.ok(z>0);
    logZ+=Math.log(z);
    for(let p=0;p<M;p++)next[p]/=z;
    [next,state]=[state,next];
  }
  return logZ;
}
/** @param {{xs:number[],start:boolean[],end:boolean[]}} a @param {number} begin @param {number} end */
function part(a,begin,end){
  return {xs:a.xs.slice(begin,end),start:a.start.slice(begin,end),end:a.end.slice(begin,end)};
}
/** @param {{xs:number[],start:boolean[],end:boolean[]}} a @param {{xs:number[],start:boolean[],end:boolean[]}} b @param {Float64Array} T @param {number[]} f @param {number} from @param {number} to */
function llr(a,b,T,f,from,to){
  const norm=singleLogZ(part(a,from,to),T,to-from)+singleLogZ(part(b,from,to),T,to-from);
  return numerator(a,b,T,f,from,to)-norm+(to-from)*Math.log(M);
}
/** @param {number[]} seed @param {Function} cost */
function localSearch(seed,cost){
  let best={f:seed,score:cost(seed),swaps:[]};
  const scores=[];
  const seen=new Set();
  for(let i=0;i<M;i++)for(let j=i+1;j<M;j++){
    const f=swapped(seed,i,j),k=f.join(',');
    if(seen.has(k))continue;
    seen.add(k);
    scores.push({f,score:cost(f),swaps:[[i,j]]});
  }
  scores.sort((a,b)=>b.score-a.score);
  if(scores[0].score>best.score)best=scores[0];
  return {best,scores,all:1+scores.length};
}
/** @param {number[]} seed @param {Function} cost */
function twoSwapSearch(seed,cost){
  const one=localSearch(seed,cost);
  let best=one.best, tested=one.all;
  const seen=new Set([seed.join(',')]);
  for(const candidate of one.scores.slice(0,12)){
    for(let i=0;i<M;i++)for(let j=i+1;j<M;j++){
      const f=swapped(candidate.f,i,j),k=f.join(',');
      if(seen.has(k))continue;
      seen.add(k);
      const score=cost(f);tested++;
      if(score>best.score)best={f,score,swaps:[...candidate.swaps,[i,j]]};
    }
  }
  return {best,tested,oneSwapTop:one.scores.slice(0,6).map(x=>({
    swaps:x.swaps,score:x.score}))};
}
/** @param {number} seed */
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
/**
 * @param {{xs:number[],start:boolean[],end:boolean[]}} mask
 * @param {number[][]} words
 * @param {()=>number} random
 */
function matched(mask,words,random){
  const buckets=Array.from({length:33},()=>[]);
  for(const w of words)if(w.length<buckets.length)buckets[w.length].push(w);
  const xs=[];
  for(let t=0;t<mask.xs.length;){
    assert.ok(mask.start[t]);
    let u=t+1;
    while(u<mask.xs.length&&!mask.start[u])u++;
    const length=u-t;
    let options=buckets[length];
    if(!mask.end[u-1])options=buckets.slice(length+1).flat();
    assert.ok(options.length);
    xs.push(...options[Math.floor(random()*options.length)].slice(0,length));
    t=u;
  }
  return {...mask,xs};
}
/** @param {{xs:number[],start:boolean[],end:boolean[]}} a @param {{xs:number[],start:boolean[],end:boolean[]}} b @param {Float64Array} T */
function fit(a,b,T){
  const n=Math.min(a.xs.length,b.xs.length),middle=Math.floor(n/2);
  const train=f=>numerator(a,b,T,f,0,middle);
  const selected=twoSwapSearch(f0,train);
  const plain=llr(a,b,T,f0,0,middle);
  const heldPlain=llr(a,b,T,f0,middle,n);
  const best=selected.best.f;
  return {
    n,trainCount:middle,testCount:n-middle,
    testedCandidates:selected.tested,
    original:{trainLLR:plain,testLLR:heldPlain},
    selected:{
      substitutions:selected.best.swaps,permutation:best,
      trainLLR:llr(a,b,T,best,0,middle),
      testLLR:llr(a,b,T,best,middle,n)
    },
    oneSwapTop:selected.oneSwapTop.map(v=>({swaps:v.swaps,
      trainLLR:v.score-(singleLogZ(part(a,0,middle),T,middle)+singleLogZ(part(b,0,middle),T,middle))+middle*Math.log(M)}))
  };
}
function study(){
  const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const training=base.corpusWords(source.slice(0,240000)),heldout=base.corpusWords(source.slice(240000));
  const T=train(training).conditional,a=base.lp2Page(28),b=base.lp2Page(42);
  const observed=fit(a,b,T);
  const random=rng(20261110),p=matched(a,heldout,random),q=matched(b,heldout,random);
  const truth=swapped(f0,5,17),key=q.xs.map(()=>Math.floor(random()*M));
  const ca={...p,xs:p.xs.map((v,i)=>mod(truth[v]+key[i]))};
  const cb={...q,xs:q.xs.map((v,i)=>mod(truth[v]+key[i]))};
  const plant=fit(ca,cb,T);
  return {
    method:'exact 29-state DP, full 29-symbol affine-scale-four alphabet plus up to two arbitrary symbol swaps; first-half training, second-half evaluation',
    target:observed,positiveControl:{
      plantedPermutation:truth,fit:plant,
      exactRecovery:plant.selected.permutation.every((v,i)=>v===truth[i])
    },
    caveat:'Two-swap keyspace is narrow. Optimizing training data can overfit, even when heldout LLR is positive. All common-key reconstruction from two candidate plaintexts would be tautological without readable plaintext.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
module.exports={canonical,swapped,qTable,numerator,llr,localSearch,twoSwapSearch,fit,study};

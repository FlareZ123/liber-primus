'use strict';
/**
 * Higher-order simultaneous plaintext test for candidate LP2 pages 28 and 42.
 * Two ciphertexts have a hypothesized identical additive key modulo 29.
 * Under the hypothesis, P28[i]-P42[i] = C28[i]-C42[i]. Joint Viterbi search
 * with a word-aware trigram model scores those 29 admissible pairs per index.
 *
 * This is an exploratory cross-page cryptanalysis candidate, not a confirmed
 * key sharing result or proof of any recovered plaintext. Positive controls
 * report recovery accuracy on held-out known texts.
 *
 * Node 22, no external packages:
 *   node sims/relative_key_trigram_probe.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const base=require('./relative_key_english_probe.cjs');
const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const START=29,END=30,ALPHA=29,N=31,STATES=29*29;
const runeTranslit=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8')).translit;
const idx=(a,b,c)=>(a*N+b)*N+c;
const mod=x=>((x%29)+29)%29;
/**
 * Train a smoothed conditional triple probability P(c|a,b) with
 * interpolated held-out-safe bigram and unigram priors.
 * @param {number[][]} words
 * @returns {Float64Array} log probabilities
 */
function trainTrigram(words){
  const h3=new Float64Array(N*N*N),h2=new Float64Array(N*N);
  const h1=new Float64Array(N),ctx3=new Float64Array(N*N),ctx2=new Float64Array(N);
  for(const word of words){
    let u=START,v=START;
    for(const c of [...word,END]){
      h3[idx(u,v,c)]++;ctx3[u*N+v]++;
      h2[v*N+c]++;ctx2[v]++;
      h1[c]++;
      u=v;v=c;
    }
  }
  const h1Total=h1.reduce((a,b)=>a+b,0);
  const p1=Float64Array.from(h1,v=>(v+1)/(h1Total+N));
  const p2=new Float64Array(N*N);
  for(let b=0;b<N;b++)for(let c=0;c<N;c++)
    p2[b*N+c]=(h2[b*N+c]+10*p1[c])/(ctx2[b]+10);
  const log3=new Float64Array(N*N*N);
  for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++)
    log3[idx(a,b,c)]=Math.log((h3[idx(a,b,c)]+5*p2[b*N+c])/(ctx3[a*N+b]+5));
  return log3;
}
/**
 * @param {{xs:number[],start:boolean[],end:boolean[]}} pa
 * @param {{xs:number[],start:boolean[],end:boolean[]}} pb
 * @param {Float64Array} lm
 * @param {number} shift
 * @param {boolean} withText
 */
function solve(pa,pb,lm,shift=0,withText=false,plaintextScale=1){
  const n=Math.min(pa.xs.length,pb.xs.length),secondLength=pb.xs.length;
  assert.ok(n>=2);
  const inverse=Array.from({length:28},(_,i)=>i+1).find(v=>mod(v*plaintextScale)===1);
  assert.notEqual(inverse,undefined,'Scale must be invertible modulo 29');
  const D=new Uint8Array(n);
  for(let t=0;t<n;t++)D[t]=mod(inverse*(pa.xs[t]-pb.xs[(t+shift)%secondLength]));
  const at=(a,b,c)=>lm[(a*N+b)*N+c];
  const head=new Float64Array(29);
  for(let p=0;p<29;p++){
    const q=mod(p-D[0]);
    head[p]=at(START,START,p)+at(START,START,q)
      +(pa.end[0]?at(START,p,END):0)+(pb.end[0]?at(START,q,END):0);
  }
  let dp=new Float64Array(STATES),next=new Float64Array(STATES);
  const back=withText?new Uint8Array(n*STATES):null;
  for(let p=0;p<29;p++)for(let c=0;c<29;c++){
    const q=mod(p-D[0]),r=mod(c-D[1]);
    const pCtx=pa.start[1]?START:p,qCtx=pb.start[1]?START:q;
    dp[p*29+c]=head[p]+at(pCtx===START?START:START,pCtx,c)
      +at(qCtx===START?START:START,qCtx,r)
      +(pa.end[1]?at(pCtx,c,END):0)+(pb.end[1]?at(qCtx,r,END):0);
  }
  for(let t=2;t<n;t++){
    next.fill(-Infinity);
    const diff=D[t],one=D[t-1],two=D[t-2];
    const pNew=pa.start[t],qNew=pb.start[t];
    const pSecond=pa.start[t-1],qSecond=pb.start[t-1];
    for(let u=0;u<29;u++){
      const qu=mod(u-two);
      for(let v=0;v<29;v++){
        const old=dp[u*29+v];
        const qv=mod(v-one);
        const ctxPU=pNew?START:(pSecond?START:u),ctxPV=pNew?START:v;
        const ctxQU=qNew?START:(qSecond?START:qu),ctxQV=qNew?START:qv;
        const endP=pa.end[t],endQ=pb.end[t];
        for(let c=0;c<29;c++){
          const qc=mod(c-diff);
          const s=old+at(ctxPU,ctxPV,c)+at(ctxQU,ctxQV,qc)
            +(endP?at(pNew?START:v,c,END):0)
            +(endQ?at(qNew?START:qv,qc,END):0);
          const st=v*29+c;
          if(s>next[st]){next[st]=s;if(back)back[t*STATES+st]=u;}
        }
      }
    }
    [dp,next]=[next,dp];
  }
  let score=-Infinity,st=0;
  for(let i=0;i<STATES;i++)if(dp[i]>score){score=dp[i];st=i;}
  if(!withText)return {score,n};
  const P=new Uint8Array(n),Q=new Uint8Array(n);
  P[n-2]=Math.floor(st/29);P[n-1]=st%29;
  for(let t=n-1;t>=2;t--){
    const prev=back[t*STATES+P[t-1]*29+P[t]];
    P[t-2]=prev;
  }
  for(let t=0;t<n;t++)Q[t]=mod(P[t]-D[t]);
  const fmt=(v,starts)=>[...v].map((c,i)=>(starts[i]?' ':'')+runeTranslit[c]).join('').trim();
  return {score,n,p:Array.from(P),q:Array.from(Q),pText:fmt(P,pa.start),qText:fmt(Q,pb.start)};
}
/** @param {number} seed */
function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function study(){
  const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const words=base.corpusWords(source.slice(0,240000));
  const testWords=base.corpusWords(source.slice(240000));
  const model=trainTrigram(words);
  const a=base.lp2Page(28),b=base.lp2Page(42);
  const observed=solve(a,b,model,0,true);
  const shifts=[];for(let shift=0;shift<b.xs.length;shift++)shifts.push({shift,score:solve(a,b,model,shift).score});
  shifts.sort((u,v)=>v.score-u.score);
  const rank=shifts.findIndex(s=>s.shift===0)+1;
  const scaled=solve(a,b,model,0,true,4);
  const scaledShifts=[];for(let shift=0;shift<b.xs.length;shift++)scaledShifts.push({shift,score:solve(a,b,model,shift,false,4).score});
  scaledShifts.sort((u,v)=>v.score-u.score);
  const scaledRank=scaledShifts.findIndex(s=>s.shift===0)+1;
  // Independent heldout passages, same keystream (true two-time pad).
  const p=base.stream(testWords.slice(0,400),269),q=base.stream(testWords.slice(500,900),269);
  assert.equal(p.xs.length,269);assert.equal(q.xs.length,269);
  const random=rng(3301),key=p.xs.map(()=>Math.floor(random()*29));
  const ca={...p,xs:p.xs.map((v,i)=>mod(v+key[i]))};
  const cb={...q,xs:q.xs.map((v,i)=>mod(v+key[i]))};
  const synthetic=solve(ca,cb,model,0,true);
  const plantShifts=[];for(let shift=0;shift<269;shift++)plantShifts.push({shift,score:solve(ca,cb,model,shift).score});
  plantShifts.sort((u,v)=>v.score-u.score);
  const plantRank=plantShifts.findIndex(s=>s.shift===0)+1;
  const accuracy=synthetic.p.filter((v,i)=>v===p.xs[i]).length/p.xs.length;
  return {
    hypothesis:'LP2 pages28 and42 share an additive mod29 key, canceled in the aligned difference',
    decoder:'Joint GP rune text trigram Viterbi; word starts and ends; Shakespeare 240k train / 60k heldout',
    target:{
      score:observed.score,rankAmong272Rotations:rank,secondBest:shifts[1],medianShiftScore:shifts[135].score,
      page28Candidate:observed.pText,page42Candidate:observed.qText
    },
    scaledTarget:{scale:4,score:scaled.score,rankAmong272Rotations:scaledRank,secondBest:scaledShifts[1],medianShiftScore:scaledShifts[135].score,
      page28Candidate:scaled.pText,page42Candidate:scaled.qText},
    heldoutPositive:{score:synthetic.score,rankAmong269Rotations:plantRank,runeAccuracy:accuracy,
      candidateText:synthetic.pText,actualText:p.xs.map(i=>runeTranslit[i]).join('')},
    interpretation:'Candidate strings from stochastic language optimization are not authenticated plaintext; key sharing remains unproven'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
module.exports={trainTrigram,solve,study};

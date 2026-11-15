'use strict';
/**
 * Ciphertext-only, source-original XOR shared-pad test for LP2 pages28/42.
 * A shared 5-bit XOR stream would cancel to
 *    P28[t] ^ P42[t] = C28[t] ^ C42[t].
 * The GP29 alphabet's three unused five-bit values are never permitted as
 * plaintext or ciphertext. Independent Shakespeare native-GP controls.
 *
 * This is a hypothetical alternative to already-rejected mod29 shared-pad
 * model and has no authenticated authorial XOR instruction.
 *
 * Windows Node22 SFT:
 *   node sims/lp2_p28_p42_xor_twotimepad_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=require('./relative_key_english_probe.cjs');
const trigram=require('./relative_key_trigram_probe.cjs');
const ROOT=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const START=29,END=30,N=31,STATES=29*29;
const score=(lm,a,b,c)=>lm[(a*N+b)*N+c];
/**
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @param {Float64Array} lm
 * @param {number} shift
 * @returns {{n:number, score:number, p:number[],q:number[],pText:string,qText:string}}
 */
function solve(a,b,lm,shift=0){
 const n=Math.min(a.xs.length,b.xs.length);
 assert(n>=3);
 const xor=new Uint8Array(n);
 for(let t=0;t<n;t++){
  xor[t]=a.xs[t]^b.xs[(t+shift)%b.xs.length];
  assert(xor[t]>=0&&xor[t]<32);
 }
 let dp=new Float64Array(STATES).fill(-Infinity);
 let next=new Float64Array(STATES).fill(-Infinity);
 const back=new Uint8Array(n*STATES);
 const head=new Float64Array(29).fill(-Infinity);
 for(let p=0;p<29;p++){
  const q=p^xor[0];
  if(q>=29)continue;
  head[p]=score(lm,START,START,p)+score(lm,START,START,q)
   +(a.end[0]?score(lm,START,p,END):0)
   +(b.end[0]?score(lm,START,q,END):0);
 }
 for(let p=0;p<29;p++){
  const q=p^xor[0];
  if(q>=29)continue;
  for(let c=0;c<29;c++){
   const d=c^xor[1];
   if(d>=29)continue;
   const pCtx=a.start[1]?START:p,qCtx=b.start[1]?START:q;
   dp[p*29+c]=head[p]
    +score(lm,START,pCtx,c)+score(lm,START,qCtx,d)
    +(a.end[1]?score(lm,pCtx,c,END):0)
    +(b.end[1]?score(lm,qCtx,d,END):0);
  }
 }
 for(let t=2;t<n;t++){
  next.fill(-Infinity);
  const delta=xor[t],prior=xor[t-1],prev=xor[t-2];
  for(let u=0;u<29;u++){
   const qu=u^prev;if(qu>=29)continue;
   for(let v=0;v<29;v++){
    const qv=v^prior;if(qv>=29)continue;
    const old=dp[u*29+v];if(!Number.isFinite(old))continue;
    const pCtx1=a.start[t]?START:(a.start[t-1]?START:u);
    const pCtx2=a.start[t]?START:v;
    const qCtx1=b.start[t]?START:(b.start[t-1]?START:qu);
    const qCtx2=b.start[t]?START:qv;
    for(let c=0;c<29;c++){
     const qc=c^delta;if(qc>=29)continue;
     const x=old+score(lm,pCtx1,pCtx2,c)+score(lm,qCtx1,qCtx2,qc)
      +(a.end[t]?score(lm,a.start[t]?START:v,c,END):0)
      +(b.end[t]?score(lm,b.start[t]?START:qv,qc,END):0);
     const at=v*29+c;
     if(x>next[at]){next[at]=x;back[t*STATES+at]=u;}
    }
   }
  }
  [dp,next]=[next,dp];
 }
 let best=-Infinity,last=-1;
 for(let st=0;st<STATES;st++)if(dp[st]>best){best=dp[st];last=st;}
 assert(Number.isFinite(best)&&last>=0);
 const P=new Uint8Array(n);
 P[n-2]=Math.floor(last/29);P[n-1]=last%29;
 for(let t=n-1;t>=2;t--){
  P[t-2]=back[t*STATES+P[t-1]*29+P[t]];
 }
 const Q=Array.from(P,(p,t)=>p^xor[t]);
 assert(Q.every(q=>q<29));
 const fmt=(vals,starts)=>[...vals].map((p,i)=>(starts[i]?' ':'')+corpus.translit[p]).join('').trim();
 return {n,score:best,p:[...P],q:Q,pText:fmt(P,a.start),qText:fmt(Q,b.start)};
}
/** @param {number} seed */
function rng(seed){let state=seed>>>0;return()=>{
 state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;
};}
function main(){
 const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
 const lm=trigram.trainTrigram(base.corpusWords(source.slice(0,240000)));
 const remaining=base.corpusWords(source.slice(240000));
 const a=base.lp2Page(28),b=base.lp2Page(42);
 assert.deepEqual([a.xs.length,b.xs.length],[269,272]);
 const original=solve(a,b,lm,0);
 const d=a.xs.map((v,i)=>v^b.xs[i]);
 assert.equal(d.length,269);
 assert.equal(d.filter(x=>x===0).length,21);
 assert.equal(new Set(d).size,32);
 for(let i=0;i<269;i++)assert.equal(original.p[i]^original.q[i],d[i]);
 const refs=[0,1,5,14,29,68,136,201,271].map(shift=>({
  shift,score:solve(a,b,lm,shift).score
 }));
 const p=base.stream(remaining.slice(0,400),269);
 const q=base.stream(remaining.slice(500,900),269);
 assert.deepEqual([p.xs.length,q.xs.length],[269,269]);
 const roll=rng(3301),key=[];
 for(let i=0;i<269;i++){
  const choices=[];
  for(let k=0;k<32;k++)
   if((p.xs[i]^k)<29&&(q.xs[i]^k)<29)choices.push(k);
  assert(choices.length>0);
  key.push(choices[Math.floor(roll()*choices.length)]);
 }
 const ca={...p,xs:p.xs.map((v,i)=>v^key[i])};
 const cb={...q,xs:q.xs.map((v,i)=>v^key[i])};
 assert(ca.xs.every(v=>v<29));assert(cb.xs.every(v=>v<29));
 const plant=solve(ca,cb,lm,0);
 const accuracy=plant.p.filter((v,i)=>v===p.xs[i]).length/269;
 const accuracyB=plant.q.filter((v,i)=>v===q.xs[i]).length/269;
 for(let i=0;i<269;i++)assert.equal(plant.p[i]^plant.q[i],p.xs[i]^q.xs[i]);
 // A trained native-GP control must recover far better than chance.
 assert(accuracy>0.15&&accuracyB>0.15);
 const positiveShifts=[0,1,5,14,29,68,136,201,268].map(shift=>({
  shift,score:solve(ca,cb,lm,shift).score
 }));
 console.log(JSON.stringify({
  hypothesis:'Pages28/42 share a positionwise 5-bit XOR pad; key cancels',
  source:'unaltered physical pages28 and42, 269 aligned GP29 runes',
  rawXorZeroCount:21,
  rawXorDistribution:Array.from({length:32},(_,r)=>d.filter(x=>x===r).length),
  target:{score:original.score,p28:original.pText,p42:original.qText,shiftScreen:refs},
  nativeGpHeldoutPlant:{score:plant.score,recoveredP28Fraction:accuracy,
   recoveredP42Fraction:accuracyB,shiftScreen:positiveShifts},
  disclaimer:'No source selects the XOR operator or shared key; target is a fixed ciphertext-only test, not authenticated plaintext.'
 },null,2));
}
if(require.main===module)main();
module.exports={solve,main};

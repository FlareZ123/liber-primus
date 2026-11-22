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

/** Freeze transparent F skip on each page; words remain source-aligned.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} page */
function stripF(page){
 const out={xs:[],start:[],end:[]};let word=-1,last=-1;
 for(let i=0;i<page.xs.length;i++){
  if(page.start[i])word++;
  if(page.xs[i]===0)continue;
  if(out.end.length&&word!==last)out.end[out.end.length-1]=true;
  out.xs.push(page.xs[i]);out.start.push(word!==last);out.end.push(page.end[i]);
  last=word;
 }
 if(out.end.length)out.end[out.end.length-1]=true;
 return out;
}
/** Plant same 5-bit stream at successive non-F GP runes, all F transparent.
 * @param {{xs:number[]}} a @param {{xs:number[]}} b */
function plantF(a,b){
 const ia=a.xs.flatMap((v,i)=>v===0?[]:[i]),ib=b.xs.flatMap((v,i)=>v===0?[]:[i]);
 const aa=a.xs.slice(),bb=b.xs.slice(),roll=rng(0x3301f00);
 for(let t=0;t<Math.max(ia.length,ib.length);t++){
  const av=t<ia.length?a.xs[ia[t]]:null,bv=t<ib.length?b.xs[ib[t]]:null;
  const keys=[];
  for(let k=0;k<32;k++)if(
   (av===null||((av^k)>0&&(av^k)<29))&&
   (bv===null||((bv^k)>0&&(bv^k)<29)))keys.push(k);
  assert(keys.length);
  const k=keys[Math.floor(roll()*keys.length)];
  if(av!==null)aa[ia[t]]=av^k;
  if(bv!==null)bb[ib[t]]=bv^k;
 }
 assert(aa.every(v=>v>=0&&v<29)&&bb.every(v=>v>=0&&v<29));
 assert.deepEqual(aa.map(v=>v===0),a.xs.map(v=>v===0));
 assert.deepEqual(bb.map(v=>v===0),b.xs.map(v=>v===0));
 return [{...a,xs:aa},{...b,xs:bb}];
}
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
 const rankAll=(ca,cb)=>{
  const all=Array.from({length:cb.xs.length},(_,shift)=>({
   shift,score:solve(ca,cb,lm,shift).score
  })).sort((u,v)=>v.score-u.score);
  return {zeroRank:all.findIndex(x=>x.shift===0)+1,
   best:all[0],second:all[1],
   middle:all[Math.floor(all.length/2)],
   unshifted:all.find(x=>x.shift===0),
   nShifts:all.length};
 };
 const refs=rankAll(a,b);
 const aSkip=stripF(a),bSkip=stripF(b);
 assert.deepEqual([aSkip.xs.length,bSkip.xs.length],[257,258]);
 const originalSkip=solve(aSkip,bSkip,lm,0);
 const originalSkipRanks=rankAll(aSkip,bSkip);
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
 // Reuse 515 exact source GP runes of independently solved 2014 LP1 prose.
 const solved=require('./authentic_lp1_p03_p04_vigenere_recovery.cjs');
 const raw=fs.readFileSync(path.join(ROOT,'resources/transcriptions/lp1_wulfic_canonical.txt'),'utf8')
  .split('%').slice(1,3).join('%');
 const runes=new Map(corpus.runes.map((r,i)=>[r,i]));
 const known={xs:[],start:[],end:[]};
 let inWord=false;
 for(const r of raw){
  if(runes.has(r)){
   known.xs.push(solved.plaintext[known.xs.length]);
   known.start.push(!inWord);known.end.push(false);
   inWord=true;
  }else if('-.$&§%'.includes(r)){
   if(known.end.length)known.end[known.end.length-1]=true;
   inWord=false;
  }
 }
 assert.equal(known.xs.length,515);
 assert.deepEqual(known.xs,solved.plaintext);
 const slice=(i,j)=>({xs:known.xs.slice(i,j),start:known.start.slice(i,j),
  end:known.end.slice(i,j)});
 const lp1A=slice(0,251),lp1B=slice(251,515);
 const randLp1=rng(0x3301a17),gpKey=[];
 for(let i=0;i<264;i++){
  const choices=[];
  for(let k=0;k<32;k++)if((lp1B.xs[i]^k)<29&&
    (i>=251||(lp1A.xs[i]^k)<29))choices.push(k);
  assert(choices.length>0);
  gpKey.push(choices[Math.floor(randLp1()*choices.length)]);
 }
 const lp1Ca={...lp1A,xs:lp1A.xs.map((v,i)=>v^gpKey[i])};
 const lp1Cb={...lp1B,xs:lp1B.xs.map((v,i)=>v^gpKey[i])};
 const lp1Solved=solve(lp1Ca,lp1Cb,lm,0);
 const lp1Accuracy=lp1Solved.p.filter((v,i)=>v===lp1A.xs[i]).length/251;
 const lp1AccuracyB=lp1Solved.q.filter((v,i)=>v===lp1B.xs[i]).length/251;
 assert(lp1Accuracy>0.15&&lp1AccuracyB>0.15);
 const lp1Ranks=rankAll(lp1Ca,lp1Cb);
 const [cpF,cqF]=plantF(lp1A,lp1B);
 const originalPA=stripF(lp1A),originalQB=stripF(lp1B);
 const cipherPA=stripF(cpF),cipherQB=stripF(cqF);
 const truthF=solve(cipherPA,cipherQB,lm,0);
 const controlFRanks=rankAll(cipherPA,cipherQB);
 const truthFAcc=truthF.p.filter((v,i)=>v===originalPA.xs[i]).length/truthF.n;
 const truthFAccQ=truthF.q.filter((v,i)=>v===originalQB.xs[i]).length/truthF.n;
 assert(truthFAcc>0.15&&truthFAccQ>0.15);
 const positiveShifts=[0,1,5,14,29,68,136,201,268].map(shift=>({
  shift,score:solve(ca,cb,lm,shift).score
 }));
 console.log(JSON.stringify({
  hypothesis:'Pages28/42 share a positionwise 5-bit XOR pad; key cancels',
  source:'unaltered physical pages28 and42, 269 aligned GP29 runes',
  rawXorZeroCount:21,
  rawXorDistribution:Array.from({length:32},(_,r)=>d.filter(x=>x===r).length),
  target:{score:original.score,p28:original.pText,p42:original.qText,shiftScreen:refs},
  targetAllCiphertextFBypass:{n:[aSkip.xs.length,bSkip.xs.length],
   score:originalSkip.score,p28:originalSkip.pText,p42:originalSkip.qText,
   alignment:originalSkipRanks},
  nativeGpHeldoutPlant:{score:plant.score,recoveredP28Fraction:accuracy,
   recoveredP42Fraction:accuracyB,shiftScreen:positiveShifts},
  authenticCicadaGpPlant:{source:'solved LP1 pages03-04, 251+264 genuine GP runes',
   recoveredFirstFraction:lp1Accuracy,recoveredSecondFraction:lp1AccuracyB,
   zeroAlignedScore:lp1Solved.score,alignment:lp1Ranks},
  authenticCicadaFBypassPlant:{source:'authentic LP1 p03-04 plaintext F skips',
   n:[originalPA.xs.length,originalQB.xs.length],
   score:truthF.score,accuracyP03:truthFAcc,accuracyP04:truthFAccQ,
   alignment:controlFRanks},
  disclaimer:'No source selects the XOR operator or shared key; target is a fixed ciphertext-only test, not authenticated plaintext.'
 },null,2));
}
if(require.main===module)main();
module.exports={solve,main};

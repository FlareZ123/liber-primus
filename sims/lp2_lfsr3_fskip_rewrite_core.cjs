'use strict';

/**
 * Source p56 F-interrupter with 0.81-probability post-cipher anti-doublet
 * REWRITING, distinct from key-consuming collision rejection. All 29^3
 * linear-recursive GF29 taps and unknown 29^3 seeds are integrated exactly.
 *
 * Plaintext rune F=0 emits C=0 and does NOT advance the keystream.
 * Otherwise one K is consumed and tentative C=(P+K)%29. When tentative
 * C equals previous emitted C, with probability .81 replace with a
 * uniformly chosen *different* output rune. Rewrite never consumes a
 * second K. Both mechanisms are mathematical hypotheses, not evidenced
 * as historical LP2 mechanisms except the separately authenticated p56
 * plaintext-F bypass rule. Original p0..p55, continuous clock, no sorting.
 *
 * Partitions: sims/lp2_lfsr3_fskip_rewrite_part[0..7]_sft.cjs.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encode}=require('./affine_echo_literary_control.cjs');
const {model}=require('./lp2_lfsr3_skip_alltap_core.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const C=source.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(C.length,12956);
const N=29,STATES=N**3,REWRITE=0.81,ACCEPT=1-REWRITE;
const LOW=-10,HIGH=30,mod=x=>(x%N+N)%N;
const count=new Float64Array(N).fill(1);
for(const word of read('resources/control/shakespeare_first300k.txt').match(/[A-Za-z]+/g)||[])
 for(const glyph of encode(word)) count[glyph]++;
const total=count.reduce((x,y)=>x+y,0);
const q=count.map(n=>n/total),q0=q[0];
const emission=Array.from({length:N},(_,c)=>
 Float64Array.from({length:N},(_,k)=>{
   const p=mod(c-k);
   return p===0?0:q[p];
 }));
const prior=emission;
const first=new Uint8Array(STATES);
for(let s=0;s<STATES;s++)first[s]=Math.floor(s/841);
/** @param {number} c */
function nullInit(c){return q0*(c===0)+(1-q0)/N}
/** @param {number} c @param {number} prev */
function nullLater(c,prev){
 return q0*(c===0)+(1-q0)/N *
   (c===prev?ACCEPT:1+REWRITE/(N-1));
}
/**
 * Forward HMM that exactly marginalizes all 29^3 hidden initial state
 * triples and all possible plaintext-F bypasses, plus the 28-way
 * rewrite outcome. No beam, no guessed phase.
 * @param {number[]} ciphertext
 * @param {ReturnType<typeof model>} machine
 * @param {{low?:number,high?:number}} [thresholds]
 */
function forward(ciphertext,machine,thresholds={}){
 const low=thresholds.low??LOW,high=thresholds.high??HIGH;
 let current=new Float64Array(STATES).fill(1/STATES);
 let following=new Float64Array(STATES);
 let logLR=0;
 for(let i=0;i<ciphertext.length;i++){
   const c=ciphertext[i],prev=i?ciphertext[i-1]:-1;
   const row=emission[c],back=i?prior[prev]:null;
   const directWeight=(i&&c===prev)?ACCEPT:1;
   const rewriteWeight=(i&&c!==prev)?REWRITE/(N-1):0;
   following.fill(0);
   for(let s=0;s<STATES;s++){
     const mass=current[s];
     if(!mass)continue;
     if(c===0)following[s]+=mass*q0;
     const k=first[s];
     const probability=directWeight*row[k]+
       (rewriteWeight?rewriteWeight*back[k]:0);
     if(probability)following[machine.T[s]]+=mass*probability;
   }
   let normalization=0;
   for(let s=0;s<STATES;s++)normalization+=following[s];
   assert.ok(normalization>0&&Number.isFinite(normalization));
   logLR+=Math.log(normalization)-
     Math.log(i?nullLater(c,prev):nullInit(c));
   const inv=1/normalization;
   for(let s=0;s<STATES;s++)following[s]*=inv;
   [following,current]=[current,following];
   if(logLR<=low||logLR>=high)
     return{logLR,positions:i+1,status:logLR>=high?'FIRES':'EXCLUDED'};
 }
 return{logLR,positions:ciphertext.length,status:'UNRESOLVED'};
}
/** @param {number} seed */
function rng(seed){
 let x=seed>>>0;
 return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};
}
/** @param {number} prev @param {()=>number} random */
function different(prev,random){
 const n=Math.floor(random()*(N-1));
 return n>=prev?n+1:n;
}
/**
 * Hidden-seed GP-English control, with both proper F transparency
 * and actual 28-way output rewrites. No key drift on rewrites.
 * @param {number[]} taps
 */
function plant(taps){
 const random=rng(0x412459c1),cipher=[];
 let [a,b,c]=[7,11,19],transparent=0,rewrites=0;
 const cdf=[];let sum=0;
 for(const x of q)cdf.push(sum+=x);
 const nextKey=()=>{
   const k=a;
   [a,b,c]=[b,c,mod(taps[0]*c+taps[1]*b+taps[2]*a)];
   return k;
 };
 for(let i=0;i<1024;i++){
   const sample=random();
   const p=cdf.findIndex(x=>sample<x);
   assert.ok(p>=0);
   if(p===0){cipher.push(0);transparent++;continue}
   let output=mod(p+nextKey());
   if(i&&output===cipher[i-1]&&random()<REWRITE){
     output=different(output,random);rewrites++;
   }
   cipher.push(output);
 }
 return{cipher,transparent,rewrites};
}
/** @param {number} part @param {number} [total] */
function runPart(part,total=8){
 assert.ok(part>=0&&part<total&&Number.isInteger(part));
 const start=Math.floor(part*STATES/total);
 const end=Math.floor((part+1)*STATES/total);
 const controlTaps=[Math.floor(start/841),Math.floor(start/29)%29,start%29];
 const positive=plant(controlTaps);
 assert.ok(positive.transparent>5&&positive.rewrites>0);
 const planted=forward(positive.cipher,model(controlTaps));
 assert.equal(planted.status,'FIRES','planted hidden model must be detected');
 const random=rng(0x99903951+part),flat=[];
 for(let i=0;i<1024;i++){
   if(random()<q0){flat.push(0);continue}
   let x=Math.floor(random()*N);
   if(i&&x===flat[i-1]&&random()<REWRITE)x=different(x,random);
   flat.push(x);
 }
 const controlNull=forward(flat,model(controlTaps));
 assert.notEqual(controlNull.status,'FIRES');
 const counts={FIRES:0,EXCLUDED:0,UNRESOLVED:0},survivors=[],longest=[];
 let totalRuneEvaluations=0,maxPositions=0;
 for(let ord=start;ord<end;ord++){
   const taps=[Math.floor(ord/841),Math.floor(ord/29)%29,ord%29];
   const test=forward(C,model(taps));
   counts[test.status]++;
   totalRuneEvaluations+=test.positions;
   maxPositions=Math.max(maxPositions,test.positions);
   const row={ord,taps,logLR:+test.logLR.toFixed(5),runes:test.positions};
   if(test.status!=='EXCLUDED')survivors.push(row);
   if(longest.length<5)longest.push(row);
   else{
     let pos=0;
     for(let j=1;j<5;j++)if(longest[j].runes<longest[pos].runes)pos=j;
     if(row.runes>longest[pos].runes)longest[pos]=row;
   }
 }
 const report={
   model:'GP29 exhaustive LFSR3 all-secret F-bypass and output rewrite',
   part,total,start,end,candidates:end-start,originalRunes:C.length,
   thresholds:{low:LOW,high:HIGH},controls:{
     taps:controlTaps,transparent:positive.transparent,
     rewrites:positive.rewrites,planted,null:controlNull},
   counts,totalRuneEvaluations,maxPositions,
   longest:longest.sort((a,b)=>b.runes-a.runes),survivors};
 console.log('FSKIP-REWRITE-RESULT '+JSON.stringify(report));
 return report;
}
module.exports={forward,runPart,plant};

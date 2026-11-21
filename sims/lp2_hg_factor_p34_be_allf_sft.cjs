'use strict';
/**
 * Original-source two-state GF29 H or G key recurrence, independent p34
 * BE crib at positions 4..5, exact solved-p56 F-transparent cipher rule.
 * Source-only, all admissible F clocks, original 261-rune receiver.
 * Windows Node 22: node sims/lp2_hg_factor_p34_be_allf_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/base60-grid.json'),'utf8'));
const page=n=>corpus.pages.find(p=>p.page===n).indices;
const C=page(34);
assert.equal(C.length,261);
assert.deepEqual(C.slice(4,6),[12,23]);
const plainBE=[17,18],seed=C.slice(4,6).map((x,i)=>(x-plainBE[i]+29)%29);
assert.deepEqual(seed,[24,5]);
assert.equal(C.slice(0,4).filter(x=>x===0).length,0);
const mod=x=>((x%29)+29)%29;
function inv(x){for(let i=1;i<29;i++)if((x*i)%29===1)return i;assert.fail('not invertible '+x);}
const factors={H:[3,26,24],G:[27,5,15]};
const sum=Array(5).fill(0);
for(let i=0;i<3;i++)for(let j=0;j<3;j++)
  sum[i+j]=mod(sum[i+j]+factors.H[i]*factors.G[j]);
assert.deepEqual(sum,[23,21,11,17,12]);
const bytes=grid.byte_rows.flat().map(x=>x%29);
let remainder=bytes.slice();
const desc=sum.slice().reverse();
for(let i=0;i<=bytes.length-5;i++){
  const c=mod(remainder[i]*inv(desc[0]));
  for(let j=0;j<5;j++)remainder[i+j]=mod(remainder[i+j]-c*desc[j]);
}
assert.deepEqual(remainder.slice(-4),[0,0,0,0]);
/**
 * Key seed is forced by original p34 BE: no ciphertext-F precedes,
 * so consumed clock is exactly original offset4.
 * @param {number[]} polynomial
 * @returns {number[]}
 */
function key(polynomial){
 const out=Array(C.length).fill(0);
 out[4]=seed[0];out[5]=seed[1];
 for(let i=6;i<C.length;i++)out[i]=mod(-inv(polynomial[2])*
   (polynomial[0]*out[i-2]+polynomial[1]*out[i-1]));
 for(let i=3;i>=0;i--)out[i]=mod(-inv(polynomial[0])*
   (polynomial[1]*out[i+1]+polynomial[2]*out[i+2]));
 return out;
}
/**
 * Exact forward and exhaustive F-transparent inverse with fixed source BE
 * at offsets4..5.
 * @param {number[]} cipher @param {number[]} keystream
 */
function fTransparent(cipher,keystream){
 let states=new Set([0]),peak=1;
 for(let i=0;i<cipher.length;i++){
  const next=new Set();
  for(const clock of states){
   if(i===4&&clock!==4)continue;
   if(cipher[i]===0)next.add(clock);
   const plain=mod(cipher[i]-keystream[clock]);
   if(plain!==0&&(i<4||i>5||plain===plainBE[i-4]))
     next.add(clock+1);
  }
  states=next;peak=Math.max(peak,states.size);
  if(!states.size)return{full:false,firstImpossible:i,peak};
 }
 return{full:true,firstImpossible:cipher.length,peak};
}
function ioc(a){
 let bins=Array(29).fill(0);a.forEach(v=>bins[v]++);
 return bins.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const clear=page(57);assert.equal(clear.length,95);
const outcomes=[];
for(const [name,P] of Object.entries(factors)){
 const K=key(P),decoded=C.map((v,i)=>mod(v-K[i]));
 assert.deepEqual(decoded.slice(4,6),plainBE);
 assert.deepEqual(decoded.map((v,i)=>mod(v+K[i])),C);
 const gate=fTransparent(C,K);
 assert.equal(gate.full,false);
 assert.equal(gate.firstImpossible,name==='H'?42:12);
 // A 261-symbol original clear-p57 GP stream with only the sourced BE
 // overwrite is a correctly solvable F-transparent positive.
 const native=Array.from({length:C.length},(_,i)=>clear[i%clear.length]);
 native[4]=plainBE[0];native[5]=plainBE[1];
 assert.equal(native.slice(0,4).filter(x=>x===0).length,0);
 let clock=0;
 const plant=native.map(v=>v===0?0:mod(v+K[clock++]));
 assert.deepEqual(plant.slice(4,6),C.slice(4,6));
 const check=fTransparent(plant,K);
 assert.equal(check.full,true);
 outcomes.push({
  factor:name,coefficients:P,sourceSeed:seed,
  originalRunes:C.length,firstImpossibleOriginal:gate.firstImpossible,
  originalFullInverse:false,
  originalDirectIoC:ioc(decoded),
  nativeGPPositiveRunes:native.length,
  nativeGPPositiveFull:check.full
 });
}
console.log(JSON.stringify({
 conclusion:'Two original-source quadratic state-stream key candidates contradict unchanged p34; no plaintext or key recovered',
 originalPolynomialHtimesG:sum,
 exactOriginalGridRemainder:remainder.slice(-4),
 originalBEOffset:4,originalBEcipher:C.slice(4,6),
 originalBEplain:plainBE,
 outcomes
},null,2));

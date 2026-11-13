'use strict';
/**
 * LP2 original 256-cell grid: H2013 × Gp39 quotient as RC4 KSA key.
 * Run: node sims/lp2_hg_q252_rc4_original_sft.cjs
 * Context: 2013 signed BASE29 3301 -> 3QO, original LP2 red p39 triad.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const load = name=>JSON.parse(fs.readFileSync(path.join(
  __dirname,'..','resources/liber-primus',name),'utf8'));
const corpus=load('lp2-corpus.json');
const grid=load('lp2-grid-256.json');
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const source=pages.flatMap(p=>p.indices);
assert.equal(source.length,12956);
assert.equal(grid.bytes.length,256);
const mod = x=>(x%29+29)%29;
/** @param {number[]} A @param {number[]} B */
function multiplyAscending(A,B){
 const out=Array(A.length+B.length-1).fill(0);
 for(let i=0;i<A.length;i++)for(let j=0;j<B.length;j++)
  out[i+j]=mod(out[i+j]+A[i]*B[j]);
 return out;
}
/** Full source quadratics in ascending powers, independently published. */
const factor=multiplyAscending([3,26,24],[27,5,15]);
assert.deepEqual(factor,[23,21,11,17,12]);
const divisor=factor.slice().reverse();
const remainder=grid.bytes.map(mod);
const quotient=[];
const leadInv=Array.from({length:28},(_,i)=>i+1).find(
 n=>mod(n*divisor[0])===1);
for(let i=0;i<252;i++){
 const x=mod(remainder[i]*leadInv);
 quotient.push(x);
 for(let j=0;j<divisor.length;j++)
  remainder[i+j]=mod(remainder[i+j]-x*divisor[j]);
}
assert.deepEqual(remainder.slice(252),[0,0,0,0]);
assert.deepEqual(quotient.slice(0,20),[
 0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7
]);
/** @param {number[]} key @param {number} length @returns {number[]} */
function rc4(key,length){
 const state=Array.from({length:256},(_,i)=>i);
 let j=0;
 for(let i=0;i<256;i++){
  j=(j+state[i]+key[i%key.length])&255;
  [state[i],state[j]]=[state[j],state[i]];
 }
 let i=0;i=0;j=0;
 const stream=[];
 for(let k=0;k<length;k++){
  i=(i+1)&255;j=(j+state[i])&255;
  [state[i],state[j]]=[state[j],state[i]];
  stream.push(state[(state[i]+state[j])&255]);
 }
 return stream;
}
/** @param {'continuous'|'page'} reset @returns {number[]} */
function keyStream(reset) {
 return reset==='continuous'
  ?rc4(quotient,source.length)
  :pages.flatMap(page=>rc4(quotient,page.indices.length));
}
/** @param {number[]} values @returns {number} */
function ioc29(values){
 const counts=new Uint32Array(29);
 for(const value of values)counts[value]++;
 let count=0;
 for(const n of counts)count+=n*(n-1);
 return 29*count/(values.length*(values.length-1));
}
/** @param {number[]} input @param {number[]} stream
 * @param {'mod29'|'top5'} projection @param {1|-1} sign
 * @returns {number[]} */
function decode(input,stream,projection,sign){
 return input.map((x,i)=>mod(x+sign*(
  projection==='mod29'?stream[i]%29:stream[i]>>>3)));
}
const originalResults=[];
const known=corpus.pages.find(p=>p.page===57).indices;
assert.equal(known.length,95);
const plant=Array.from({length:source.length},(_,i)=>known[i%95]);
for(const reset of ['continuous','page']){
 const stream=keyStream(reset);
 assert.equal(stream.length,source.length);
 for(const projection of ['mod29','top5'])
  for(const sign of /** @type {const} */ ([-1,1])){
   const decoded=decode(source,stream,projection,sign);
   const reconstructed=decode(decoded,stream,projection,
    /** @type {1|-1} */ (-sign));
   assert.deepEqual(reconstructed,source);
   const encrypted=decode(plant,stream,projection,
    /** @type {1|-1} */ (-sign));
   assert.deepEqual(decode(encrypted,stream,projection,sign),plant);
   originalResults.push({reset,projection,sign,ioc29:ioc29(decoded)});
  }
}
assert.equal(originalResults.length,8);
const expected=[
 .9993997794870004,.999293347945229,
 .9996216270513423,1.0004979594861878,
 .9995545890023044,.9989833833576673,
 1.0006690101783204,1.000095040078053
];
for(let i=0;i<8;i++)
 assert(Math.abs(originalResults[i].ioc29-expected[i])<1e-12);
assert(originalResults.every(result=>result.ioc29<1.15));
assert(ioc29(plant)>1.8);
console.log(JSON.stringify({
 status:'PASS',
 source:'2013 signed H quadratic + p39 red G quadratic; original 256-byte table',
 quotientLength:quotient.length,originalSymbols:source.length,
 cipherResults:originalResults,plantedRecoveredRunes:plant.length,
 unknownPlaintextRecovered:0
},null,2));

"use strict";

/**
 * Source-selected speculative DIRECTION29 SEEK30 AND31 YOU32:
 * p29/G + p30/J quotient key -> original p32 GP29 C-K.
 * Precommit: workplace/agent5-direction-seek-and-you-quotient-key-precommit.md
 * Node.js 22 / CommonJS. Read-only, no external packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=JSON.parse(fs.readFileSync(
  path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),
  "utf8"
));
/** @param {number} n */
const mod29=(n)=>(n%29+29)%29;
/**
 * @param {number[]} poly
 * @param {number[]} factor
 */
function divide(poly,factor){
  const remainder=poly.slice();
  const quotient=[];
  const inv=Array.from({length:28},(_,i)=>i+1).find(x=>mod29(x*factor[0])===1);
  assert.notEqual(inv,undefined);
  for(let i=0;i<=poly.length-factor.length;i++){
    const q=mod29(remainder[i]*inv);
    quotient.push(q);
    for(let j=0;j<factor.length;j++)remainder[i+j]=mod29(remainder[i+j]-q*factor[j]);
  }
  return {quotient,remainder:remainder.slice(quotient.length)};
}
/** @param {number[]} a */
function ioc(a){
  const counts=Array(29).fill(0);
  for(const v of a)counts[v]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a */
const asText=(a)=>a.map(x=>source.translit[x]).join("");
/** @param {number} n */
const page=(n)=>source.pages.find(p=>p.page===n).indices;
const a=divide(page(29),[15,5,27]),b=divide(page(30),[1,4,20]);
assert.deepEqual(a.remainder,[0,0]);
assert.deepEqual(b.remainder,[0,0]);
assert.equal(a.quotient.length,275);
assert.equal(b.quotient.length,261);
const key=b.quotient.map((x,i)=>mod29(x+a.quotient[i+14]));
const C=page(32);
assert.equal(C.length,121);
const P=C.map((x,i)=>mod29(x-key[i]));
assert.deepEqual(P.map((x,i)=>mod29(x+key[i])),C);
const solved=page(57);
const plant=Array.from({length:C.length},(_,i)=>solved[i%solved.length]);
const plantCipher=plant.map((x,i)=>mod29(x+key[i]));
assert.deepEqual(plantCipher.map((x,i)=>mod29(x-key[i])),plant);
assert.ok(ioc(P)>0.037 && ioc(P)<0.0371);
console.log(JSON.stringify({
  classification:"NEGATIVE: no 121-rune p32 original plaintext from fixed quotient-sum key",
  source:"P29/G plus P30/J aligned on constants, then signed AND/YOU",
  p29Quotient:a.quotient.length,
  p30Quotient:b.quotient.length,
  availableCommonKey:key.length,
  p32Receiver:C.length,
  originalP32Ioc:ioc(C),
  decodedIoc:ioc(P),
  decodedAll121:asText(P),
  exactReencryption:true,
  exactNativeGPPlant:true
},null,2));

"use strict";
/**
 * Original PARABLE source-selected 56+8 disjoint p50 graph vertices:
 * exact order-independent first-root GF(256) RS(64,56) syndrome obstruction.
 * 2013 Cicada historically used polynomial secret sharing, but no LP2 source
 * authenticates a Reed-Solomon codec. Node22 CJS original-source SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const grid = JSON.parse(fs.readFileSync(
  path.join(__dirname,"..","resources","liber-primus","lp2-grid-256.json"),"utf8"));
const tokens=grid.pages.flatMap(page=>page.tokens);
const parent=tokens.map(t=>60*grid.alphabet.indexOf(t[0])+grid.alphabet.indexOf(t[1]));
assert.equal(parent.length,256);
assert(parent.every(n=>n>=0&&n<=255));

/** @param {number} n @returns {Set<number>} */
function orbit(n){const seen=new Set();while(!seen.has(n)){seen.add(n);n=parent[n];}return seen;}
/** @param {number} n @returns {number[]} */
function subtree(n){return Array.from({length:256},(_,i)=>i).filter(i=>orbit(i).has(n));}
const keyNodes=subtree(201),checkNodes=subtree(173);
assert.deepEqual([201,74,205].map(n=>subtree(n).length),[56,57,58]);
assert.equal(keyNodes.length,56);
assert.equal(checkNodes.length,8);
assert.deepEqual(keyNodes.filter(n=>checkNodes.includes(n)),[]);
const both=keyNodes.concat(checkNodes);
assert.equal(new Set(both).size,64);
/** @param {number[]} a @returns {number} */
function xor(a){return a.reduce((s,x)=>s^x,0);}
const sourceAddressXor=xor(both);
const sourceValueXor=xor(both.map(i=>parent[i]));
assert.equal(sourceAddressXor,0x9b);
assert.equal(sourceValueXor,0x0b);

/** GF(256) multiply, irreducible polynomial 0x11d. @param {number} a @param {number} b */
function gfMul(a,b){
  let c=0;
  while(b){
    if(b&1)c^=a;
    b>>=1;
    a<<=1;
    if(a&0x100)a^=0x11d;
  }
  return c;
}
/** @param {number} a @param {number} n */
function gfPow(a,n){
  let result=1;
  while(n){
    if(n&1)result=gfMul(result,a);
    n>>=1;
    a=gfMul(a,a);
  }
  return result;
}
const gen=[1];
for(let j=0;j<8;j++){
  const alpha=gfPow(2,j),out=Array(gen.length+1).fill(0);
  for(let k=0;k<gen.length;k++){
    out[k]^=gen[k];
    out[k+1]^=gfMul(gen[k],alpha);
  }
  gen.splice(0,gen.length,...out);
}
assert.equal(gen.length,9);

/** Systematic Reed-Solomon encode with eight parity bytes, first generator root alpha^0.
 * @param {number[]} data
 */
function encode(data){
  assert.equal(data.length,56);
  const quotient=data.concat(Array(8).fill(0));
  for(let i=0;i<56;i++){
    const factor=quotient[i];
    for(let j=0;j<9;j++)quotient[i+j]^=gfMul(factor,gen[j]);
  }
  return data.concat(quotient.slice(56));
}
/** @param {number[]} codeword */
function syndromes(codeword){
  assert.equal(codeword.length,64);
  return Array.from({length:8},(_,j)=>
    codeword.reduce((s,b,i)=>s^gfMul(b,gfPow(2,j*(63-i))),0));
}
// Positive: actual source 56 bytes used as arbitrary message data, standard encoder
// produces a fully valid length64/degree55 codeword and the necessary XOR zero.
const data=keyNodes.map(i=>parent[i]);
const knownValid=encode(data);
assert.deepEqual(syndromes(knownValid),Array(8).fill(0));
assert.equal(xor(knownValid),0);
const fixedSource=keyNodes.concat(checkNodes).map(i=>parent[i]);
const originalSyndromes=syndromes(fixedSource);
assert.equal(originalSyndromes[0],sourceValueXor);
assert.notEqual(originalSyndromes[0],0);
console.log(JSON.stringify({
  status:"PASS",
  sourcedPARABLEPrimeOrdinalRoots:[205,173,201],
  S201Data56:keyNodes.length,
  S173Checks8:checkNodes.length,
  intersectingNodes:0,
  selected64OriginalAddressXor:"0x"+sourceAddressXor.toString(16),
  selected64OriginalPrintedByteXor:"0x"+sourceValueXor.toString(16),
  standardGF256RS64_56FirstRoot1RequiredXor:"0x00",
  originalAllEightSyndromes:originalSyndromes,
  positiveOriginalDataPlantedParitySyndromes:syndromes(knownValid),
  firstSourceIndependentGate:"FAILS for every order of the selected64 original bytes",
  unknownPlaintextRecovered:false,
  scope:"systematic or nonsystematic unweighted cyclic GF256 RS(64,56) with alpha^0 as a root"
},null,2));

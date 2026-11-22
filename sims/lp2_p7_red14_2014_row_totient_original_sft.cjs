"use strict";
/**
 * Original-input test of p7's 14 red runes as a 2014-style row-permutation
 * key followed by the solved p56 prime-totient cipher with plaintext-F bypass.
 * Node 22 CommonJS SFT; no network, writes, or tuned English scoring.
 * node sims/lp2_p7_red14_2014_row_totient_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const source = new Map(corpus.pages.map(p => [p.page,p.indices]));
const key = source.get(7).slice(194,208);
assert.deepEqual(key,[23,3,22,16,2,25,5,7,11,14,28,6,28,19]);
const order = Array.from({length:14},(_,i)=>i).sort((a,b)=>key[a]-key[b]||a-b);
assert.deepEqual(order,[4,1,6,11,7,8,9,3,13,2,0,5,10,12]);
/** @param {number[]} a @param {boolean} reverse @returns {number[]} */
function permute(a,reverse){
  const out=a.slice();
  for(let i=0;i+14<=a.length;i+=14){
    for(let j=0;j<14;j++){
      if(reverse)out[i+order[j]]=a[i+j];
      else out[i+j]=a[i+order[j]];
    }
  }
  return out;
}
const shifts=[];
for(let n=2;shifts.length<8000;n++){
  let prime=true;
  for(let f=2;f*f<=n;f++)if(n%f===0){prime=false;break;}
  if(prime)shifts.push((n-1)%29);
}
assert.deepEqual(shifts.slice(0,7),[1,2,4,6,10,12,16]);
/**
 * Every legal key-consumption path: C=F may be literal-F skip or encrypted
 * non-F; C!=F must consume the shift and must NOT decrypt to plaintext F.
 * @param {number[]} cipher
 * @param {number} start
 * @returns {{valid:boolean,prefix:number}}
 */
function feasible(cipher,start){
  let states=new Set([start]);
  for(let i=0;i<cipher.length;i++){
    const value=cipher[i];
    const next=new Set();
    for(const k of states){
      const shift=shifts[k];
      if(value===0){next.add(k);if(shift!==0)next.add(k+1);}
      else if(value!==shift)next.add(k+1);
    }
    if(!next.size)return {valid:false,prefix:i};
    states=next;
  }
  return {valid:true,prefix:cipher.length};
}
/** @param {number[]} plaintext @param {number} start @returns {number[]} */
function encryptTotient(plaintext,start){
  const out=[];let k=start;
  for(const rune of plaintext){
    if(rune===0){out.push(0);continue;}
    out.push((rune+shifts[k])%29);k++;
  }
  return out;
}
const knownP56=source.get(56);
const knownP57=source.get(57);
assert.equal(knownP56.length,85);
assert.equal(knownP57.length,95);
assert.equal(feasible(knownP56,0).valid,true,"authentic solved p56");
const first=Array.from({length:1145},(_,i)=>knownP57[i%knownP57.length]);
assert.equal(feasible(encryptTotient(first,0),0).valid,true,"source-native GP positive with literal-F bypass");
const prev=[3,4,5,6,7].flatMap(n=>source.get(n));
const next=[8,9,10,11,12,13,14].flatMap(n=>source.get(n));
assert.equal(prev.length,1145);
assert.equal(next.length,1729);
const bodies=[
  {name:"p3-7 including printed red14",input:prev},
  {name:"p3-7 omitting terminal red14",input:prev.slice(0,-14)},
  {name:"p8-14 following terminal red14",input:next}
];
const outcomes=[];
for(const {name,input} of bodies){
  for(const reversed of [false,true]){
    const transformed=permute(input,reversed);
    assert.deepEqual(permute(transformed,!reversed),input,"permutation exact inversion");
    const planted=Array.from({length:input.length},(_,i)=>knownP57[i%knownP57.length]);
    const plantedCipher=permute(encryptTotient(planted,0),!reversed);
    assert.equal(feasible(permute(plantedCipher,reversed),0).valid,true,"complete native-GP planted inversion");
    let survivors=0,maxPrefix=0;
    for(let start=0;start<5000;start++){
      const outcome=feasible(transformed,start);
      if(outcome.valid)survivors++;
      maxPrefix=Math.max(maxPrefix,outcome.prefix);
    }
    const result={name,originalRuneCount:input.length,redKeyStableOrder:order,reverse:reversed,primeStartsTested:5000,validStarts:survivors,maxCompatiblePrefix:maxPrefix,plantedRecovery:true};
    outcomes.push(result);
    console.log(JSON.stringify(result));
  }
}
assert.equal(outcomes.length,6);
assert(outcomes.every(o=>o.validStarts===0),"source fixed gate requires no complete legal inverse");
console.log("RESULT: no original unknown plaintext recovered; only this printed-red14 keyed row operation and p56 cipher with starts 0..4999 are excluded.");

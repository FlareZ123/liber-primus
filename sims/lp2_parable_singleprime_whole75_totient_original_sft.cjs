"use strict";
/**
 * Original p55 75-rune whole-body prime-totient receiver:
 * test the complete authenticated p56 operation with one source-prime initializer,
 * contrasting with earlier three independent 25-rune resets.
 * Read-only standalone original-input Node22 CommonJS SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
const p55=corpus.pages.find(p=>p.page===55).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p55.length,76);
assert.equal(p57.length,95);
const core=p55.slice(1);
const clear=p57.slice(0,75);
assert.equal(core.length,75);
/** @param {number} n @returns {boolean} */
function prime(n){if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true;}
/** @param {number} n @returns {number} */
function nextPrime(n){do {n++;}while(!prime(n));return n;}
/** @param {number} x */
const mod=x=>((x%29)+29)%29;
/** @param {number} n */
function primeTape(n){assert(prime(n));const values=[n];for(let i=0;i<76;i++)values.push(nextPrime(values.at(-1)));return values.map(p=>(p-1)%29);}
/**
 * Source's plaintext-F literal bypass, which does not advance the prime clock.
 * @param {number[]} p
 * @param {number[]} tape
 * @param {1|-1} sign
 */
function encrypt(p,tape,sign){
  let j=0;
  return p.map(x => {
    if(x===0)return 0;
    return mod(x+sign*tape[j++]);
  });
}
/**
 * All possible prime-consumption states for each original ciphertext offset.
 * A ciphertext F can be a genuine plaintext F or the encrypted non-F output;
 * plaintext F must be literal, so no transformed F is allowed.
 * @param {number[]} cipher
 * @param {number[]} tape
 * @param {1|-1} sign
 */
function decodeStates(cipher,tape,sign){
  let states=new Map([[0,[]]]);
  for(let k=0;k<cipher.length;k++){
    const out=new Map();
    for(const [j,seq] of states){
      const candidate=mod(cipher[k]-sign*tape[j]);
      if(candidate!==0)out.set(j+1,seq.concat(candidate));
      if(cipher[k]===0)out.set(j,seq.concat(0));
    }
    if(out.size===0)return {failAt:k,possible:0,last:null};
    states=out;
  }
  return {failAt:null,possible:states.size,last:[...states].map(([consumed,seq])=>({consumed,seq}))};
}
/** @param {number[]} src */
function ioc(src){const freq=Array(29).fill(0);src.forEach(x=>freq[x]++);return 29*freq.reduce((sum,n)=>sum+n*(n-1),0)/(src.length*(src.length-1));}
const factors=[p57.slice(7,37),p57.slice(37,67),p57.slice(67,95)]
  .map(x=>x.reduce((a,b)=>a+corpus.prime[b],0));
assert.deepEqual(factors,[1259,1031,1229]);
assert.equal(factors.reduce((a,b)=>a*b,1),1595277641);
const outputs=[];
for(const seed of factors)for(const sign of [1,-1]){
  const tape=primeTape(seed);
  const actual=decodeStates(core,tape,sign);
  const planted=encrypt(clear,tape,sign);
  const control=decodeStates(planted,tape,sign);
  assert(control.possible>0);
  // Explicitly follow the original native plaintext-F consumption mask.
  let position=0;
  const knownPath=planted.map((v,k)=> {
    const x=clear[k];
    if(x===0){assert.equal(v,0);return 0;}
    const q=mod(v-sign*tape[position++]);
    assert.equal(q,x);
    return q;
  });
  assert.deepEqual(knownPath,clear);
  const native=actual.last?.map(v=>({
    consumed:v.consumed,
    normalizedIoc:ioc(v.seq),
    transliteration:v.seq.map(x=>corpus.translit[x]).join("")
  }))||[];
  outputs.push({seed,sign,failAt:actual.failAt,originalDecoderPaths:actual.possible,native});
  console.log(JSON.stringify(outputs.at(-1)));
}
assert.deepEqual(outputs.map(o=>o.failAt),[19,null,11,9,39,54]);
assert.equal(outputs[1].native.length,1);
assert.equal(outputs[1].native[0].consumed,72);
assert.equal(outputs[1].native[0].transliteration,
  "WMEOPIATHCXEOPMNDOEFURCJBHNAIFTHGMOPRNAIANGOCAEEOGFOEMIAYEOOEJCJJAEMOEOJXXCIAEABOMSWEATGDBPGAED");
console.log(JSON.stringify({
  status:"PASS",
  hypothesis:"p56 native continuous consecutive prime totient + original F bypass on p55 75-rune whole-word core",
  sourceProduct:1595277641,
  sourcePrimeInitializers:factors,
  originalP55RuneCount:p55.length,
  completeCoreCount:core.length,
  originalCoreNormalizedIoc:ioc(core),
  originalCipherFCount:core.filter(x=>x===0).length,
  originalNativeSignAllThreeFail:true,
  reverseSignOnlySeed1259SurvivesButNonlinguistic:true,
  nativeClearP57Plants:"6/6 75-rune originals recovered exactly with known source F masks",
  unknownPlaintextRecovered:false
},null,2));

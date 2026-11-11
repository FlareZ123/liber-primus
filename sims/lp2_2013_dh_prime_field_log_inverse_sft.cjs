"use strict";

/**
 * Strict, source-defined candidate: 2013 DH uses exponentiation, BASE29
 * supplies a digit codec, p3 gives a primitive F29^2 element, and solved
 * p56's last prime p84=433 selects the root of the 2013 quadratic.
 * This script tests the reversible logarithmic transport and the solved-p56
 * consecutive-prime (p_i-1) running exponent against original unsolved LP2.
 * Run: node sims/lp2_2013_dh_prime_field_log_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {mul,power,ioc} = require("./lp2_2013_p56_prime84_field_basis_sft.cjs");
const root=path.resolve(__dirname,"..");
/** @param {string} name */
const read = name => JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const native = read("resources/control/latin-vulgate-heldout-gp.json").runes;
const pages = corpus.pages.filter(x=>x.page<56).map(p=>p.indices);
const original=pages.flat();
const mod=(x,n)=>(x%n+n)%n;

/** @param {number} count @returns {number[]} */
function primes(count) {
  const out=[];
  for(let x=2;out.length<count;x++) {
    let prime=true;
    for(let d=2;d*d<=x;d++) if(x%d===0){prime=false;break;}
    if(prime) out.push(x);
  }
  return out;
}

const maxPairs=original.length/2;
assert.equal(maxPairs,6478);
const primeKeys=primes(maxPairs);
assert.equal(primeKeys[83],433);
assert.deepEqual(corpus.pages.find(p=>p.page===56).indices.length,85);
const z=power([0,1],primeKeys[83]);
assert.deepEqual(z,[23,27]); // historically fixed p56 endpoint chooses this p3 root
const exp=/** @type {Array<[number,number]>} */([]);
const log=new Map();
let state=/** @type {[number,number]} */([1,0]);
for(let i=0;i<840;i++){
  assert.equal(log.has(state[0]+29*state[1]),false);
  exp.push(state);
  log.set(state[0]+29*state[1],i);
  state=mul(state,z);
}
assert.deepEqual(state,[1,0]);
assert.equal(log.size,840);

/** This is a bijection of all 841 two-rune pairs. 0+0u is the
 * 841st field element and is given the unique extra BASE29 code 840=28,28.
 * The input pair window must be chosen independently of ciphertext scoring.
 * @param {number[]} input @param {number} startPrime
 * @param {-1|1} sign @param {boolean} encode
 * @returns {number[]} */
function transform(input,startPrime,sign,encode) {
  const out=input.slice();
  for(let k=0;k+1<input.length;k+=2) {
    const prime=primeKeys[startPrime+k/2];
    assert.ok(prime!==undefined);
    const shift=prime-1;
    if(encode) {
      const plain=29*input[k]+input[k+1];
      const el=plain===840?[0,0]:exp[mod(plain-sign*shift,840)];
      out[k]=el[0];out[k+1]=el[1];
    } else {
      const element=input[k]+29*input[k+1];
      const exponent=element===0?840:log.get(element);
      assert.ok(exponent!==undefined);
      const plain=exponent===840?840:mod(exponent+sign*shift,840);
      out[k]=Math.floor(plain/29);out[k+1]=plain%29;
    }
  }
  return out;
}

/** @param {"whole-book"|"page-pairs-book-primes"|"page-pairs-page-primes"} layout
 * @param {-1|1} sign
 * @returns {{plain:number[],recovered:boolean}} */
function decodeOriginal(layout,sign) {
  if(layout==="whole-book") {
    const plain=transform(original,0,sign,false);
    return {plain,recovered:transform(plain,0,sign,true).join()===original.join()};
  }
  const plaintext=[];
  let clock=0,recovered=true;
  for(const page of pages) {
    const start=layout==="page-pairs-book-primes"?clock:0;
    const plain=transform(page,start,sign,false);
    if(transform(plain,start,sign,true).join()!==page.join())recovered=false;
    plaintext.push(...plain);
    clock+=Math.floor(page.length/2);
  }
  return {plain:plaintext,recovered};
}
function main() {
  // The declared all-841 bijection must work for every possible pair, not
  // merely the original inputs or a specially chosen artificial key.
  for(const sign of /** @type {const} */([-1,1]))
    for(let n=0;n<841;n++) {
      const plain=[Math.floor(n/29),n%29];
      const enc=transform(plain,11,sign,true);
      assert.deepEqual(transform(enc,11,sign,false),plain);
    }
  const models=[];
  for(const layout of /** @type {const} */([
    "whole-book","page-pairs-book-primes","page-pairs-page-primes"]))
    for(const sign of /** @type {const} */([-1,1])) {
      const {plain,recovered}=decodeOriginal(layout,sign);
      assert.ok(recovered&&plain.length===12956);
      models.push({layout,sign,ioc:ioc(plain),
        prefix:plain.slice(0,70).map(x=>corpus.translit[x]).join("")});
    }
  const planted=native.slice(0,2400);
  const cipher=transform(planted,0,-1,true);
  assert.deepEqual(transform(cipher,0,-1,false),planted);
  assert.ok(ioc(planted)>0.055);
  assert.ok(models.every(x=>x.ioc<0.036));
  console.log(JSON.stringify({
    source:"2013 DH / BASE29; p3 F29^2 generator; authentic p56 p84=433",
    originalRunes:original.length,originalPairs:6478,base:z,
    naturalPrimeExponentSchedule:"p_i-1 mod840",models,
    rawIoC:ioc(original),nativePlantIoC:ioc(planted),
    exhaustive841PairRoundtrip:true,originalRoundtrips:true,
    result:"No original native-GP plaintext in the six source-motivated lossless logarithm/prime-clock models. Non-GP intermediates or other clocks are not excluded."
  },null,2));
}
if(require.main===module) main();
module.exports={main,transform,decodeOriginal};

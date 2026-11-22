"use strict";
/**
 * SFT: signed-2016 563x569 image dimensions interpreted as RSA primes.
 * Original LP2 tree page32 is a source-selected candidate target because
 * the exact 11x11 GP prime row and col sums equal image dimensions.
 * Period 2013 Cicada BASE29 and 2014 RSA both existed, but no author
 * instruction combines the image dimensions into an RSA modulus.
 *
 * One *necessary* no-overflow range test, no ciphertext fitting:
 * n = 563 * 569 = 320347, while four GP29 digits range [0, 29^4).
 * Four-rune base29 literal ciphertext blocks must be in [0, n)
 * for native RSA. Page32 first four runes already violate this.
 * The 121-rune length also leaves one unframed trailing rune.
 *
 * A 3-rune ciphertext block is always < n, but decryption m usually
 * requires four digits and needs a source-defined variable-rate codec;
 * this test does not exclude such a separate architecture.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const data=JSON.parse(fs.readFileSync(path.join(__dirname,"..",
  "resources","liber-primus","lp2-corpus.json"),"utf8"));
const p32=data.pages.find(x=>x.page===32).indices;
assert.equal(p32.length,121);
const primes=[563,569],N=primes[0]*primes[1];
assert.equal(N,320347);
assert.ok(29**3<N&&N<29**4);
assert.equal(p32.slice(0,11).reduce((s,x)=>s+data.prime[x],0),563);
assert.equal(Array.from({length:11},(_,i)=>data.prime[p32[11*i]])
  .reduce((s,x)=>s+x,0),569);
/** @param {number[]} a @returns {number} */
function base29(a){return a.reduce((s,x)=>29*s+x,0);}
const blocks=Array.from({length:30},(_,i)=>base29(p32.slice(4*i,4*i+4)));
const failures=blocks.map((value,i)=>({i,value})).filter(x=>x.value>=N);
assert.equal(blocks[0],490194);
assert.equal(failures.length,16);
assert.equal(p32.length%4,1);
// Native RSA plaintext/ciphertext must inhabit the residue ring [0,N).
for(const value of [0,1,N-1])assert.ok(value>=0&&value<N);
for(const value of failures)assert.ok(value.value>=N);
console.log("Image-derived RSA modulus:",N);
console.log("p32 four-rune complete blocks:",blocks.length,"unframed suffix:",p32.length%4);
console.log("Blocks outside modulus:",failures.length,"of",blocks.length);
console.log("First ciphertext block:",blocks[0],">",N);
console.log("PASS: literal 4-GP-rune native RSA ciphertext packing impossible for p32.");
// Test exactly one alternate native RSA framing, not a 4-rune-native cipher:
// 3 GP ciphertext digits (always <n) -> 4 GP plaintext digits; source
// 121 leaves one orphan rune, making this a partial diagnostic only.
// This is a constrained historical BASE29 + RSA + 3301-index candidate,
// NOT a whole-page decoder or source-selected pad rule.
const exponent=3301n, totient=562n*568n, inverseExponent=250557n;
assert.equal((exponent*inverseExponent)%totient,1n);
/** @param {bigint} base @param {bigint} power @param {bigint} modulus @returns {bigint} */
function modPow(base,power,modulus){
  let value=1n;
  while(power>0n){
    if(power&1n)value=(value*base)%modulus;
    base=(base*base)%modulus;
    power>>=1n;
  }
  return value;
}
/** @param {bigint} value @returns {number[]} */
function fourDigits(value){
  const out=Array(4).fill(0);
  for(let i=3;i>=0;i--){out[i]=Number(value%29n);value/=29n;}
  return out;
}
/** @param {number[]} xs @returns {number} */
function ioc(xs){
 const ct=Array(29).fill(0);
 for(const x of xs)ct[x]++;
 return ct.reduce((sum,n)=>sum+n*(n-1),0)/(xs.length*(xs.length-1));
}
const decrypted=[];
for(let offset=0;offset+3<=p32.length;offset+=3){
  const original=BigInt(base29(p32.slice(offset,offset+3)));
  const plaintext=modPow(original,inverseExponent,BigInt(N));
  assert.equal(modPow(plaintext,exponent,BigInt(N)),original);
  decrypted.push(...fourDigits(plaintext));
}
assert.equal(decrypted.length,160);
assert.ok(Math.abs(ioc(decrypted)-0.03569182389937107)<1e-12);
assert.equal(p32[120],12); // EO retained as an unframed symbol.
console.log("3-to-4 digit RSA 40 blocks, one original orphan rune: IoC",ioc(decrypted));
console.log("First 32 4-digit runes:",decrypted.slice(0,32).map(x=>data.translit[x]).join(" "));
console.log("PASS: all 40 three-digit original RSA values re-encrypt exactly.");
console.log("No source-selected handling for orphan rune or meaningful plaintext.");
console.log("No statement about arbitrary framing, non-RSA mappings or other LP2 targets.");

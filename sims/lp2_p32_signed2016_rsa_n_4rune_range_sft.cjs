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
console.log("No statement about arbitrary framing, non-RSA mappings or other LP2 targets.");

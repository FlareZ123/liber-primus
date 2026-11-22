"use strict";
/** Original fixed p0 red13 -> ciphertext-autokey full original p0 SFT.
 * Frozen precommit workplace/agent5-p0-red13-ciphertext-autokey-precommit.md.
 * Node22 CJS read-only; no external packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const c=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
/** @param {number} n */
const mod=n=>(n%29+29)%29;
/** @param {number} p */
const page=p=>c.pages.find(x=>x.page===p).indices;
/** @param {number[]} data */
function ioc(data){
  const count=Array(29).fill(0);for(const x of data)count[x]++;
  return count.reduce((v,n)=>v+n*(n-1),0)/(data.length*(data.length-1));
}
/** @param {number[]} data */
const show=data=>data.map(x=>c.translit[x]).join("");
/** @param {number[]} cipher @param {number[]} seed */
function decode(cipher,seed){
  return cipher.map((v,i)=>mod(v-(i<seed.length?seed[i]:cipher[i-seed.length])));
}
/** @param {number[]} clear @param {number[]} seed */
function encode(clear,seed){
  const cipher=[];
  for(let i=0;i<clear.length;i++)cipher.push(mod(clear[i]+(i<seed.length?seed[i]:cipher[i-seed.length])));
  return cipher;
}
const original=page(0);
assert.equal(original.length,262);
const conditionalTitle=[18,13,10,13,8,24,9,26,15,18,18,5,15];
const seed=conditionalTitle.map((v,i)=>mod(original[i]-v));
assert.deepEqual(seed,[26,24,8,19,27,24,18,3,0,8,0,16,19]);
const decoded=decode(original,seed);
assert.deepEqual(decoded.slice(0,13),conditionalTitle);
assert.deepEqual(encode(decoded,seed),original);
assert.ok(Math.abs(ioc(decoded.slice(13))-0.03578831454851665)<1e-12);
const native=conditionalTitle.concat(Array.from({length:249},(_,i)=>page(57)[i%95]));
const planted=encode(native,seed);
assert.deepEqual(planted.slice(0,13),original.slice(0,13));
assert.deepEqual(decode(planted,seed),native);
console.log(JSON.stringify({verdict:"NEGATIVE: source-seeded p0 13-back ciphertext autokey not a native 249-rune body decoder",
  originalRunes:original.length,originalTitleRunes:13,
  keySeed:seed,
  bodyIoc:ioc(decoded.slice(13)),fullIoc:ioc(decoded),rawOriginalIoc:ioc(original),
  bodyHead160:show(decoded.slice(13,173)),
  fullOriginalReencryptionExact:true,nativePlantRecoveredExactly:true,
  originalTitleCipherPreservedByPlant:true
},null,2));

"use strict";
/**
 * Original p55 three-step ciphertext-autokey lead selected by the 3 GP
 * runes of the conditional solved-p57 THOR keyword. No cryptanalytic claim.
 * SFT: node sims/lp2_p55_thor_lag3_source_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const db=JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const target=db.pages[55].indices;
assert.equal(target.length,76);
/** @param {number} x */
const mod=x=>(x%29+29)%29;
/** @param {number[]} arr */
function ioc(arr){
  const count=Array(29).fill(0);
  for(const i of arr)count[i]++;
  return count.reduce((s,n)=>s+n*(n-1),0)/(arr.length*(arr.length-1));
}
/** @param {number[]} arr @param {number} lag */
const diff=(arr,lag)=>arr.slice(lag).map((x,i)=>mod(x-arr[i]));
const observed=ioc(diff(target,3));
assert.ok(Math.abs(observed-0.05251141552511415)<1e-14);
assert.ok(Math.abs(ioc(target)-0.037894736842105266)<1e-14);
const windows=[];
for(const page of db.pages.slice(0,55)){
  const runes=page.indices;
  for(let j=0;j+76<=runes.length;j++)
    windows.push({page:page.page,start:j,score:ioc(diff(runes.slice(j,j+76),3))});
}
const exceed=windows.filter(x=>x.score>=observed);
assert.equal(windows.length,8839);
assert.deepEqual(exceed.map(x=>[x.page,x.start]),[[30,112]]);
const seed=[2,3,4];
/** @param {number[]} cipher @param {number[]} k */
function ciphertextAutokey(cipher,k){
  return cipher.map((v,i)=>mod(v-(i<k.length?k[i]:cipher[i-k.length])));
}
const seeded=ciphertextAutokey(target,seed);
assert.equal(seeded.length,76);
assert.ok(Math.abs(ioc(seeded)-0.05052631578947368)<1e-14);
assert.deepEqual(seeded.slice(3),diff(target,3));
const spell=a=>a.map(i=>db.translit[i]).join("");
const lengths=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
let offset=0;
const tokens=lengths.map(l=>{const s=seeded.slice(offset,offset+l);offset+=l;return spell(s);});
assert.equal(offset,76);
const controls=[54,56,57].map(pg=>({
  pg,n:db.pages[pg].indices.length,lag3:ioc(diff(db.pages[pg].indices,3))
}));
console.log(JSON.stringify({
  source:"unaltered original p55; THOR=three GP rune indices 2,3,4",
  rawIoC:ioc(target),
  p55Lag3SuffixIoC:observed,p55Lag3Symbols:73,
  otherOriginal76RuneWindows:windows.length,
  windowsMeetingOrExceedingP55:exceed,
  conventionalCiphertextAutokeyIoC:ioc(seeded),
  conventionalAutokeyPrintedWords:tokens,
  controls,
  interpretation:"Anomalous source arithmetic; no readable GP29 plaintext and no proven cipher mechanism"
},null,2));

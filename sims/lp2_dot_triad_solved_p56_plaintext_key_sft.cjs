"use strict";
/**
 * Source-fixed solved-text key transfer suggested by three original LP2
 * five-dot drawings. p7 is a horizontal mirror of solved p56; p23 is a
 * 180-degree rotation. Historical 2014 Stage04 demonstrably used already
 * solved LP1 text as the repeating Vigenere key for its following image.
 *
 * One complete candidate only: GP29 plaintext of solved p56 is a period-85
 * additive key, started at zero on the physical first source-oriented rune.
 * Exactly preserve the printed original page-line boundaries for reflection.
 * No F-skips or fitted phase are imported from the p56 ciphertext operation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const originalLines = fs.readFileSync(path.join(root,
  "resources/lp2-transcription.txt"), "utf8").split("%");
const index = new Map(corpus.runes.map((r,i) => [r,i]));
/** @param {number} n @returns {number[]} */
function primes(n) {
  const out=[];
  for (let i=2;out.length<n;i++) {
    let ok=true;
    for(let j=2;j*j<=i;j++)if(i%j===0){ok=false;break;}
    if(ok)out.push(i);
  }
  return out;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const count=Array(29).fill(0);
  for(const x of a)count[x]++;
  return count.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @returns {string} */
function latin(a) {return a.map(x=>corpus.translit[x]).join("");}
/** @param {number} physicalPage @returns {number[][]} */
function lines(physicalPage) {
  return originalLines[physicalPage].split(/\/\s*|\n+/)
    .map(line=>[...line].filter(r=>index.has(r)).map(r=>index.get(r)))
    .filter(line=>line.length);
}
/** @param {number[][]} ls @param {boolean} reversePage @returns {number[]} */
function reflect(ls,reversePage) {
  return (reversePage?ls.slice().reverse():ls)
    .flatMap(line=>line.slice().reverse());
}
/** @param {number[]} plaintext @param {number[]} key @returns {number[]} */
function encrypt(plaintext,key) {
  return plaintext.map((v,i)=>(v+key[i%key.length])%29);
}
/** @param {number[]} ciphertext @param {number[]} key @returns {number[]} */
function decrypt(ciphertext,key) {
  return ciphertext.map((v,i)=>(v-key[i%key.length]+29)%29);
}
const solvedCipher=corpus.pages.find(p=>p.page===56).indices;
assert.equal(solvedCipher.length,85);
const prime=primes(85);
let phase=0;
const knownPlaintext=solvedCipher.map((v,i)=>i===56?0:
  (v-(prime[phase++]-1)%29+29)%29);
assert.equal(phase,84);
assert.equal(latin(knownPlaintext),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");

const nativeGP=corpus.pages.find(p=>p.page===57).indices;
const planted=Array.from({length:213},(_,i)=>nativeGP[i%nativeGP.length]);
assert.deepEqual(decrypt(encrypt(planted,knownPlaintext),knownPlaintext),planted);

const results=[];
for(const p of [7,23]) {
  const raw=corpus.pages.find(page=>page.page===p).indices;
  const printed=lines(p);
  assert.deepEqual(printed.flat(),raw);
  const oriented=reflect(printed,p===23);
  assert.equal(oriented.length,p===7?208:213);
  const plain=decrypt(oriented,knownPlaintext);
  assert.deepEqual(encrypt(plain,knownPlaintext),oriented);
  const score=ioc(plain);
  assert.ok(Math.abs(score-(p===7?0.035395763656633224:0.0341482859420675))<1e-13);
  results.push({physicalPage:p,orientation:p===7?"horizontal line reflection":"180 degree page rotation",
    runeCount:oriented.length,authenticP56PlaintextKeyRunes:knownPlaintext.length,
    originalIoc:ioc(raw),decodedIoc:score,
    decodedLatin:latin(plain),wholePageReencryptsExactly:true});
}
console.log(JSON.stringify({keySource:"LP2 authentic p56 GP plaintext, period 85",
  originalOrientation:"three five-dot images p7 horizontal, p23 180 degrees relative to p56",
  trueGPTextPlantControl:true,solvedP56PositiveControl:true,results,
  conclusion:"No readable original plaintext from this fixed solved-text-key transfer."},null,2));

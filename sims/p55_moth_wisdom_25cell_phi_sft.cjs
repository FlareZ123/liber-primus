"use strict";

/**
 * Source-moth original p55 body: three complete 25-rune blocks and the
 * 2014 LP1 p5 Wisdom 5x5 composite-number totient row-major key.
 * Single frozen original-cipher inverse; no phase, sign or key sweep.
 * SFT: node sims/p55_moth_wisdom_25cell_phi_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const load = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const page = corpus.pages.find(p => p.page === 55).indices;
const sourceImage = fs.readFileSync(path.join(root, "resources/liber-primus/72.jpg"));
assert.equal(crypto.createHash("sha256").update(sourceImage).digest("hex"),
  "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba");
assert.equal(page.length, 76);
assert.equal(page[0], 21, "original p55 first NG rune is carried from p54");
const lengths = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(lengths.reduce((a,b)=>a+b,0), 75);
const body = page.slice(1);
assert.equal(body.length, 3 * 25);
const square = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
const values = square.flat();
assert.equal(values.length, 25);
for (const row of square) assert.equal(row.reduce((a,b) => a+b), 1033);
for (let c = 0; c < 5; c++) {
  assert.equal(square.reduce((a,row) => a + row[c],0), 1033);
}
assert.equal([0,1,2,3,4].reduce((a,i) => a + square[i][i],0), 1033);
assert.equal([0,1,2,3,4].reduce((a,i) => a + square[i][4-i],0), 1033);

/** @param {number} n @returns {number} */
function totient(n) {
  let result=n;
  for (let divisor=2;divisor*divisor<=n;divisor++) {
    if (n%divisor!==0) continue;
    while(n%divisor===0)n/=divisor;
    result=(result/divisor)*(divisor-1);
  }
  if(n>1)result=(result/n)*(n-1);
  return result;
}
const mod29=n=>((n%29)+29)%29;
const key=values.map(n=>totient(n)%29);
assert.deepEqual(key,
  [12,15,10,14,5,4,24,19,12,6,25,23,14,23,25,6,12,19,24,4,5,14,10,15,12]);
const decrypt=data=>data.map((cipher,i)=>mod29(cipher-key[i%25]));
const encrypt=data=>data.map((plain,i)=>mod29(plain+key[i%25]));
const originalCandidate=decrypt(body);
assert.deepEqual(encrypt(originalCandidate),body,"all original 75 runes re-encrypt");
const tokens=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);

/** @param {string} source @returns {number[]} */
function nativeGp(source) {
  const out=[];
  for(let word of source.toUpperCase().match(/[A-Z]+/g)||[]) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    for(let i=0;i<word.length;) {
      const t=tokens.find(t=>word.startsWith(t.token,i));
      assert(t,"unmapped control word "+word.slice(i));
      out.push(t.index);
      i+=t.token.length;
    }
  }
  return out;
}
const native=nativeGp(load("resources/control/gibran_prophet_58585.txt"));
assert.equal(native.length,62696);
const plant=native.slice(1000,1075);
assert.equal(plant.length,75);
assert.deepEqual(decrypt(encrypt(plant)),plant,"source key recovers native 75-rune plant");

/** @param {number[]} input */
function trigramModel(input) {
  const seen=new Map();
  for(let i=2;i<input.length;i++) {
    const k=input[i-2]*841+input[i-1]*29+input[i];
    seen.set(k,(seen.get(k)||0)+1);
  }
  const norm=input.length-2+0.1*29**3;
  return sequence=>{
    let value=0;
    for(let i=2;i<sequence.length;i++) {
      const k=sequence[i-2]*841+sequence[i-1]*29+sequence[i];
      value+=Math.log(((seen.get(k)||0)+0.1)/norm);
    }
    return value/(sequence.length-2);
  };
}
const score=trigramModel(native.slice(0,40000)),held=native.slice(40000);
let worstNative=Infinity;
let scored=0;
for(let i=0;i+75<=held.length;i++) {
  worstNative=Math.min(worstNative,score(held.slice(i,i+75)));
  scored++;
}
assert.equal(scored,22622);
const scoreOriginal=score(body),scoreCandidate=score(originalCandidate);
assert.ok(Math.abs(scoreOriginal-(-12.189206998473212))<1e-10);
assert.ok(Math.abs(scoreCandidate-(-12.143693175339685))<1e-10);
assert.ok(Math.abs(worstNative-(-9.760735021014934))<1e-10);
assert(scoreCandidate<worstNative,"unexpected English-like original candidate");
const crib=[
  2,18,16,3,16,10,18,9,16,0,1,9,5,16,27,9,
  10,15,15,24,5,4,18,23,24,20,20,2,21,15
];
assert.equal(crib.length,30);
const required=page.slice(46).map((cipher,i)=>mod29(cipher-crib[i]));
const sourceKey=required.map((v,i)=>key[(45+i)%25]);
const cribMatches=required.filter((v,i)=>v===sourceKey[i]).length;
assert.equal(cribMatches,1,"moth-matched seven-word candidate direct pad prediction");
const format=indices=>indices.map(i=>corpus.translit[i]).join("");
console.log(JSON.stringify({
  source:"original LP2 p55 76 runes; first NG carry excluded; 75 body runes",
  imageSha256:"a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba",
  sourceMothSource:"original 2014 LP1 p5 Wisdom 5x5 composite 1033 square",
  dimensions:{body:75,originalMagicSquareCells:25,completeBlocks:3},
  square,totientMod29Key:key,method:"body rune i: P[i]=(C[i]-phi(square[i mod25])) mod29",
  scores:{original:scoreOriginal,originalInverse:scoreCandidate,
    matchedNative75WindowCount:scored,worstNative:worstNative},
  p55MothSevenWordCrib:{length:30,exactKeyMatches:cribMatches},
  originalForwardRecovered:75,sourceNativePlantRecovered:75,
  decodedGP:format(originalCandidate),
  decision:"Direct square-phi repeating GP29 key fails original plaintext and provisional moth seven-word crib."
},null,2));

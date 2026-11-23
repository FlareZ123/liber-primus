"use strict";
/**
 * An exact original-cipher/source-native crib gate.
 * Run: node sims/lp2_p0_ea109_lp1_dh8k2_affine_crib_sft.cjs
 * Original source -> affine GP29 encoding: C = (8 P + 2) mod 29.
 * This is not an authenticated LP2 decoding rule.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname,"..");
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const book = read("resources/liber-primus/lp2-corpus.json");
const prior = read("resources/external/relikd-solved-gp29-native-v1.json");
const runeIndex = new Map(book.runes.map((x,i)=>[x,i]));
const known = prior.sections.slice(0,7).map(s =>
  Array.from(s.source_text).filter(r=>runeIndex.has(r)).map(r=>runeIndex.get(r)));
const pages = book.pages.filter(p=>p.page<=55 && p.indices.length);
const mod = x => ((x%29)+29)%29;
const inv = Array.from({length:29},(_,i) => i ?
  Array.from({length:29},(_,j)=>j).find(j=>mod(i*j)===1) : 0);
const n = pages.reduce((s,p)=>s+p.indices.length,0);
assert.equal(n,12956);
assert.equal(known.reduce((s,x)=>s+x.length,0),2799);
assert.equal(known.length,7);
const originalP0Transcription=fs.readFileSync(
  path.join(ROOT,"resources/liber-primus/lp2-transcription.txt"),"utf8").split("%")[0];
// Exact original word boundaries: LP1 "TO • THE • GREAT" versus
// LP2 "XY - EUNG - CFN". The affine sixgram does not preserve them.
assert(prior.sections[1].source_text.includes("ᛏᚩ•ᚦᛖ•ᚷᚱᛠᛏ"));
assert(originalP0Transcription.includes("ᛉᚣ-ᛖᚢᛝ-ᚳᚠᚾ"));
assert.deepEqual(known[1].slice(21,27),[16,3,2,18,6,4]);
assert.deepEqual(book.pages[0].indices.slice(109,115),[14,26,18,1,21,5]);
const affine=(p,a,b)=>mod(a*p+b);
assert.deepEqual(known[1].slice(21,27).map(p=>affine(p,8,2)),
  book.pages[0].indices.slice(109,115));
assert.equal(known[1][27],28); // next source vowel EA in GREAT
assert.equal(affine(known[1][27],8,2),23); // predicts D, but original prints F
assert.equal(book.pages[0].indices[115],0);
const ioc = arr => {
  let counts=Array(29).fill(0);
  for(const x of arr)counts[x]++;
  return counts.reduce((s,c)=>s+c*(c-1),0)/(arr.length*(arr.length-1));
};
const inverseP0=book.pages[0].indices.map(c=>mod(11*(c-2)));
assert.equal(inverseP0.length,262);
assert(Math.abs(ioc(inverseP0)-0.034307273843994034)<1e-12);
const plant=prior.sections[8].source_text; // independently clear p57
const plantGP=Array.from(plant).filter(r=>runeIndex.has(r)).map(r=>runeIndex.get(r));
assert.equal(plantGP.length,95);
assert.deepEqual(plantGP.map(p=>affine(p,8,2)).map(c=>mod(11*(c-2))),plantGP);
function signature(a,i,k){
  const d=Array.from({length:k-1},(_,j)=>mod(a[i+j+1]-a[i+j]));
  const pivot=d.find(x=>x!==0);
  return pivot===undefined?"flat":d.map(x=>mod(x*inv[pivot])).join(",");
}
function crossPairs(k){
  const bySig=new Map();
  for(let s=0;s<known.length;s++)for(let i=0;i+k<=known[s].length;i++){
    const key=signature(known[s],i,k);
    if(!bySig.has(key))bySig.set(key,[]);
    bySig.get(key).push([s,i]);
  }
  const pairs=[];
  for(const p of pages)for(let i=0;i+k<=p.indices.length;i++){
    const key=signature(p.indices,i,k);
    for(const [s,j] of bySig.get(key)||[]){
      let pivot=-1;
      for(let z=1;z<k;z++)if(known[s][j+z]!==known[s][j]){pivot=z;break;}
      if(pivot<0)continue;
      const alpha=mod(mod(p.indices[i+pivot]-p.indices[i]) *
        inv[mod(known[s][j+pivot]-known[s][j])]);
      if(alpha===0)continue;
      const beta=mod(p.indices[i]-alpha*known[s][j]);
      assert(known[s].slice(j,j+k).every((x,t)=>affine(x,alpha,beta)===p.indices[i+t]));
      pairs.push({page:p.page,position:i,sourceSection:s,sourcePosition:j,alpha,beta});
    }
  }
  return pairs;
}
const six=crossPairs(6), seven=crossPairs(7);
assert.equal(six.length,57);
assert.equal(seven.length,0);
const locked=six.filter(x=>x.alpha===8&&x.beta===2);
assert.deepEqual(locked,[{
  page:0,position:109,sourceSection:1,sourcePosition:21,alpha:8,beta:2
}]);
console.log(JSON.stringify({
  originalUnknownRunes:n,knownSourceRunes:2799,
  originalAtP0Index109:book.pages[0].indices.slice(109,115),
  priorAtWelcomeIndex21:known[1].slice(21,27),
  lockedEquation:"C=(8P+2) mod 29",
  lockedMatches:locked,allAffineSix:six.length,allAffineSeven:seven.length,
  seventhFails:{expectedCipher:23,actualCipher:0},
  fullP0InverseIoC:ioc(inverseP0),solvedP57AffinePlant:95
},null,2));

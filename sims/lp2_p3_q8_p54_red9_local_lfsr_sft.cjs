#!/usr/bin/env node
"use strict";
// Source-Q degree8 red9 compatibility and source-Q nine-register LFSR body gate
// PRETARGET: workplace/lp2-p3-q8-p54-red9-local-lfsr-pretarget.md
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const cp=read("resources/liber-primus/lp2-corpus.json"),solved=read("resources/external/relikd-solved-gp29-native-v1.json");
const page=n=>cp.pages.find(p=>p.page===n).indices,mod=x=>((x%29)+29)%29;
const f=page(3).slice(119,122),a=page(15).slice(9,20),b=page(57).slice(0,7);
assert.deepEqual(f,[13,23,2]);
let rem=a.map((v,i)=>mod(v-(b[i]||0))),q=Array(9).fill(0);
for(let j=10;j>=2;j--){let coeff=mod(rem[j]*15);q[j-2]=coeff;
 for(let k=0;k<3;k++)rem[j-2+k]=mod(rem[j-2+k]-coeff*f[k]);}
assert.deepEqual(rem,Array(11).fill(0));
assert.deepEqual(q,[5,5,14,9,10,4,27,17,25]);
const red=page(54).slice(0,9),otherRed=page(15).slice(0,9);
assert.deepEqual(red,[24,19,21,23,27,2,14,10,19]);
const sourceResidue=body=>mod(q.reduce((n,v,i)=>n+v*body[i],0));
assert.equal(sourceResidue(red),16);assert.equal(sourceResidue(otherRed),19);
const forcedNinth=mod(-7*q.slice(0,8).reduce((n,v,i)=>n+v*red[i],0)); // inv(25)=7
assert.equal(forcedNinth,23);
const keys=red.slice();
const C=page(54).slice(9).concat(page(55));assert.equal(C.length,299);
for(let i=0;i<C.length;i++){
 const kNext=mod(-q.reduce((n,v,j)=>n+v*keys[i+j],0));keys.push(kNext);
}
assert.equal(keys.length,308);
assert.deepEqual(keys.slice(9,19),[13,10,18,15,0,3,5,8,8,1]);
const stream=keys.slice(9);
const count=a=>{const h=Array(29).fill(0);a.forEach(v=>h[v]++);return h.reduce((n,c)=>n+c*(c-1),0);};
const windows=[];for(const s of solved.sections){const a=[...s.source_text]
 .filter(ch=>cp.runes.includes(ch)).map(ch=>cp.runes.indexOf(ch));
 for(let i=0;i+299<=a.length;i++)windows.push({section:s.name,i,n:count(a.slice(i,i+299))});}
windows.sort((a,b)=>a.n-b.n);
assert.equal(windows.length,1177);assert.equal(windows[0].n,4956);
const donor=[...solved.sections.find(s=>s.name==="0_loss_of_divinity").source_text]
 .filter(x=>cp.runes.includes(x)).map(x=>cp.runes.indexOf(x)).slice(0,C.length);
assert.equal(donor.length,299);
const candidates=[];
for(const sign of[-1,+1]){
 const P=C.map((c,i)=>mod(c+sign*stream[i]));
 assert.deepEqual(P.map((p,i)=>mod(p-sign*stream[i])),C);
 const plant=donor.map((p,i)=>mod(p-sign*stream[i]));
 assert.deepEqual(plant.map((v,i)=>mod(v+sign*stream[i])),donor);
 const collisionNumerator=count(P);
 assert(collisionNumerator<4956);
 candidates.push({sign,sourceOriginalCount:collisionNumerator,sourceIoC:collisionNumerator/(299*298),
  first80Runes:P.slice(0,80).map(x=>cp.translit[x]).join(""),last30Runes:P.slice(-30).map(x=>cp.translit[x]).join(""),
  exactOriginal299Roundtrip:true,sourceNative299PlantRecovered:true});
}
assert.deepEqual(candidates.map(c=>c.sourceOriginalCount),[3070,3054]);
console.log(JSON.stringify({status:"PASS",type:"Precommitted source-red Q LFSR on original p54 black+p55",
 source:{p3MarkedTriad:f,exactQuotient:q,p54Red9:red,p54Degree8SourceRemainder:sourceResidue(red),
  p15FirstRed9Remainder:sourceResidue(otherRed),forcedNinth:forcedNinth,actualNinth:red[8],
  streamKeyFirst10:stream.slice(0,10),originalTerminalLength:C.length},
 matchedNativeSource299:{windows:windows.length,minNumerator:windows[0].n,minSource:windows[0].section},
 originalCipherNumerator:count(C),candidateCiphertextResults:candidates,
 decision:"Degree8 source red9 relation nonzero, and both order9 source LFSR literal additive inversions nonprose; no recovered plaintext"},null,2));

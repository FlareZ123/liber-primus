'use strict';
// Original p39/p50 lag16 key-independent GP29 F-mask capacity gate.
// No source-derived secret key is fitted. Standalone Node22 CommonJS.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} filename @returns {any} */
const readJson=filename=>JSON.parse(fs.readFileSync(path.join(root,filename),'utf8'));
const corpus=readJson('resources/liber-primus/lp2-corpus.json');
const grid=readJson('resources/liber-primus/lp2-grid-256.json');
const solved=readJson('resources/external/relikd-solved-gp29-native-v1.json');
const m=x=>(x%29+29)%29;
assert.deepEqual(solved.runes,corpus.runes);
const F16=[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1];
const remain=grid.bytes.slice(1).reverse().map(x=>m(-x));
const q=Array(239).fill(0);
for(let i=238;i>=0;i--){
  const v=remain[i+16];
  q[i]=v;
  for(let j=0;j<17;j++)remain[i+j]=m(remain[i+j]-v*F16[j]);
}
assert.ok(remain.every(x=>x===0));
const Q238=q.slice(0,-1).reverse();
const C=corpus.pages[39].indices.slice(1,-1);
assert.equal(C.length,238);
const R=C.map((x,i)=>m(x-5*Q238[i]));
const c0=C.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
assert.deepEqual(c0,[42,48,153,213]);
const nativeWindows=[];
for(const s of solved.sections){
  const gp=Array.from(s.source_text).filter(c=>solved.runes.includes(c))
    .map(c=>solved.runes.indexOf(c));
  for(let i=0;i+238<=gp.length;i++)nativeWindows.push({
    name:s.name,start:i,values:gp.slice(i,i+238)
  });
}
assert.equal(nativeWindows.length,1421);
/** @param {number[]} exclusions @returns {number[][]} */
function sourceGroups(exclusions){
  const excluded=new Set(exclusions);
  const groups=Array.from({length:16},()=>[]);
  let phase=0;
  for(let i=0;i<238;i++)if(!excluded.has(i))groups[phase++%16].push(i);
  return groups;
}
/** @param {number[]} tape @param {number[][]} groups @returns {number} */
function samePhase(tape,groups){
  let equals=0;
  for(const group of groups){
    const count=Array(29).fill(0);
    for(const i of group)count[tape[i]]++;
    equals+=count.reduce((n,k)=>n+k*(k-1)/2,0);
  }
  return equals;
}
const expectedOriginal=[75,79,76,70,72,69,64,65,64,70,67,61,71,68,63,65];
const expectedLow=[15,69,28,3,0,6,0,0,0,3,2,0,0,7,0,0];
const expectedLiteral=[1421,23,23,0,19,1,0,0,19,1,0,0,0,0,0,0];
const expectedJoint=[15,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const results=[];
for(let mask=0;mask<16;mask++){
  const literal=c0.filter((_,i)=>((mask>>>i)&1)!==0);
  const groups=sourceGroups(literal);
  const original=samePhase(R,groups);
  const low=nativeWindows.filter(w=>samePhase(w.values,groups)<=original).length;
  const literalDonors=nativeWindows.filter(w=>literal.every(i=>w.values[i]===0));
  const joint=literalDonors.filter(w=>samePhase(w.values,groups)<=original).length;
  const key=Array.from({length:16},(_,i)=>m(11+7*i));
  const positive=nativeWindows[0].values.slice();
  for(const i of literal)positive[i]=0;
  const encrypted=positive.slice();
  for(let phase=0;phase<16;phase++)for(const i of groups[phase]){
    encrypted[i]=m(positive[i]+key[phase]);
  }
  const decoded=encrypted.slice();
  for(let phase=0;phase<16;phase++)for(const i of groups[phase]){
    decoded[i]=m(encrypted[i]-key[phase]);
  }
  assert.deepEqual(decoded,positive);
  assert.equal(samePhase(encrypted,groups),samePhase(positive,groups));
  results.push({mask,literal,original,low,donorsWithRequiredLiteralF:literalDonors.length,
    joint,nativePlantRoundTrip:'238/238'});
  assert.equal(original,expectedOriginal[mask]);
  assert.equal(low,expectedLow[mask]);
  assert.equal(literalDonors.length,expectedLiteral[mask]);
  assert.equal(joint,expectedJoint[mask]);
}
assert.deepEqual(results.filter(x=>x.joint>0).map(x=>x.mask),[0,1]);
console.log(JSON.stringify({case:'original p39 R238/5 with all 16 source p56-style F-literal skip masks and completely unknown period16 GP29 additive key',
  originalCipherLiteralFOptions:c0,donorWindows:nativeWindows.length,
  results,onlyNativeControlJointSurvivors:[0,1]},null,2));

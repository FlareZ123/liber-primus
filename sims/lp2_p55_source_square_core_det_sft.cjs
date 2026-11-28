#!/usr/bin/env node
'use strict';
/*
 * Candidate, NOT an authenticated decryptor.
 * Physical LP2 p55 strictly stripped word interiors (43 GP29 runes) align in
 * length with the three historical 2014 magic-square inner cores (9+25+9).
 * Show their GF29 determinants, eigenroots and the exact source difference.
 * Preserve null-selection caveats: the determinant readout was noticed after
 * source/p55 inspection. No plaintext is recovered.
 *
 * Usage from repository root:
 * node sims/lp2_p55_source_square_core_det_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const read = name => fs.readFileSync(path.resolve(__dirname,'..',name),'utf8');
const canonical = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const derived = JSON.parse(read('resources/liber-primus/lp2-page-groups-54-55-derived.json'));
const GP = '0123456789abcdefghijklmnopqrs';
const words = derived.p55.groups.map(w => Array.from(w, c => GP.indexOf(c)));
assert.equal(words.length,17);
assert.ok(words.every(w=>w.length>=1&&w.every(x=>x>=0)));
const original=words.flat();
assert.deepEqual(original,canonical.pages.find(p=>p.page===55).indices);
assert.equal(original.length,76);
const strictWords=words.map(w=>w.slice(1,-1));
const strict=strictWords.flat();
assert.equal(strict.length,43);
assert.deepEqual(strictWords.map(x=>x.length),[0,2,0,0,4,4,0,11,4,2,0,5,5,0,4,1,1]);
const source=read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/).map(b=>b.trim().split(/\r?\n/).map(l=>l.trim().split(/\s+/).map(Number)));
assert.deepEqual(source.map(A=>A.length),[5,7,5]);
const sourceCores=source.map(A=>A.slice(1,-1).map(row=>row.slice(1,-1)));
assert.deepEqual(sourceCores.map(A=>A.length),[3,5,3]);
const chunk=[strict.slice(0,9),strict.slice(9,34),strict.slice(34)];
const mod=x=>(x%29+29)%29;
const inv=new Uint8Array(29);
for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
const identity=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(i===j)));
function detFlat(flat,n) {
  assert.equal(flat.length,n*n);
  const A=Array.from({length:n},(_,i)=>Array.from(flat.slice(i*n,(i+1)*n),mod));
  let d=1;
  for(let k=0;k<n;k++) {
    let p=k;
    while(p<n&&A[p][k]===0)p++;
    if(p===n)return 0;
    if(p!==k) {[A[k],A[p]]=[A[p],A[k]];d=mod(-d);}
    const v=A[k][k];
    d=mod(d*v);
    const iv=inv[v];
    for(let r=k+1;r<n;r++) {
      const factor=mod(A[r][k]*iv);
      for(let c=k;c<n;c++)A[r][c]=mod(A[r][c]-factor*A[k][c]);
    }
  }
  return d;
}
function eigenRoots(flat,n){
  const out=[];
  for(let e=0;e<29;e++){
    const A=flat.slice();
    for(let i=0;i<n;i++)A[i*n+i]=mod(A[i*n+i]-e);
    if(detFlat(A,n)===0)out.push(e);
  }
  return out;
}
const sizes=[3,5,3], flatSources=sourceCores.map(A=>A.flat());
const sourceDet=flatSources.map((x,i)=>detFlat(x,sizes[i]));
const cipherDet=chunk.map((x,i)=>detFlat(x,sizes[i]));
const sourceRoots=flatSources.map((x,i)=>eigenRoots(x,sizes[i]));
const cipherRoots=chunk.map((x,i)=>eigenRoots(x,sizes[i]));
const trace=(x,n)=>mod(Array.from({length:n},(_,i)=>x[n*i+i]).reduce((s,v)=>s+v,0));
const sourceTrace=flatSources.map((x,i)=>trace(x,sizes[i]));
const cipherTrace=chunk.map((x,i)=>trace(x,sizes[i]));
assert.deepEqual(sourceDet,[24,8,24]);
assert.deepEqual(cipherDet,[23,10,27]);
assert.deepEqual(sourceRoots,[[10],[2],[24]]);
assert.deepEqual(cipherRoots,[[1,8,21],[20,27],[2,5,23]]);
assert.deepEqual(cipherTrace,[1,22,1]);
assert.deepEqual(sourceTrace,[26,4,25]);
const signedDelta=cipherDet.map((v,i)=>v-sourceDet[i]);
assert.deepEqual(signedDelta,[-1,2,3]);
assert.equal(detFlat(identity(3).flat(),3),1);
assert.equal(detFlat(identity(5).flat(),5),1);
const swapped=identity(3);[swapped[0],swapped[1]]=[swapped[1],swapped[0]];
assert.equal(detFlat(swapped.flat(),3),28);
function determinantTriplet(x){
  return [detFlat(x.slice(0,9),3),detFlat(x.slice(9,34),5),detFlat(x.slice(34,43),3)];
}
const cyclicDistance=(a,b)=>Math.min(mod(a-b),mod(b-a));
const hasDistances=d=>d.every((v,i)=>cyclicDistance(v,sourceDet[i])===i+1);
assert.ok(hasDistances(cipherDet));
const cipherTape=canonical.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(cipherTape.length,12956);
let slidingExact=0,slidingDistance=0,slidingDistanceLocations=[];
for(let start=0;start+43<=cipherTape.length;start++){
  const d=determinantTriplet(cipherTape.slice(start,start+43));
  if(d.every((v,i)=>v===cipherDet[i]))slidingExact++;
  if(hasDistances(d)){slidingDistance++;slidingDistanceLocations.push(start);}
}
assert.equal(slidingExact,0);
assert.equal(slidingDistance,4);
assert.deepEqual(slidingDistanceLocations,[5914,6938,11794,12487]);
function rng(seed){let state=seed>>>0;return n=>{
  state=(Math.imul(state,1664525)+1013904223)>>>0;
  return Math.floor(state/4294967296*n);
};}
function shuffleInPlace(a,next) {for(let i=a.length-1;i>0;i--){const j=next(i+1);[a[i],a[j]]=[a[j],a[i]];}}
function permutationNull(mode,trials,seed){
  const next=rng(seed),work=(mode==='rune'?strict.slice():Array.from(words,(_,i)=>i));
  let exact=0,distance=0;
  for(let t=0;t<trials;t++){
    shuffleInPlace(work,next);
    const vals=mode==='rune'?work:work.flatMap(i=>strictWords[i]);
    const d=determinantTriplet(vals);
    if(d.every((v,i)=>v===cipherDet[i]))exact++;
    if(hasDistances(d))distance++;
  }
  return {trials,seed:'0x'+seed.toString(16),exact,distance};
}
const runeNull=permutationNull('rune',100000,0x508ed0cc);
const wordNull=permutationNull('word',100000,0x4e93ac17);
assert.deepEqual([runeNull.exact,runeNull.distance],[3,29]);
assert.deepEqual([wordNull.exact,wordNull.distance],[2,18]);
console.log(JSON.stringify({
  classification:'Unverified source-constrained numerical clue; not plaintext or a cipher inverse',
  input:{physicalPage:55,originalRunes:76,printedGroups:17,strictInteriors:43,
    sourceSquareOrders:[5,7,5],sourceInnerCoreOrders:[3,5,3]},
  source:{determinants:sourceDet,trace:sourceTrace,eigenroots:sourceRoots},
  p55:{determinants:cipherDet,trace:cipherTrace,eigenroots:cipherRoots},
  sourceToP55:{integerDelta:signedDelta,mod29Delta:signedDelta.map(mod),
    orientationIndependentCyclicDistances:sourceDet.map((v,i)=>cyclicDistance(v,cipherDet[i]))},
  nulls:{originalContinuous43RuneWindows:cipherTape.length-42,slidingExact,
    slidingDistances:slidingDistance,slidingDistanceLocations,
    runePermutation:runeNull,wordChunkPermutation:wordNull},
  limitations:'Post-inspection determinant/3-block readout; unknown authored selector, receiver and decryption; conditional permutations are not discovery-corrected probabilities'
},null,2));
console.log('SFT PASS: source, p55, 2014 squares, GF29 invariants, 200000 permutations, full tape sliding controls');

'use strict';

/**
 * Exact all-secret GF29 three-previous-ciphertext affine finite-state exclusion.
 *
 * Conditional source model: one of five independent output phases at source
 * page-local rune position i%5; for each phase (a,b,c) may be ANY of 29^3
 * triples and intercept d ANY mod29. A further arbitrary new substitution
 * alphabet may independently rename its 29 output values at each phase.
 * Decoder: P[i] = perm_phase(C[i] - a*C[i-1] - b*C[i-2]
 *                        - c*C[i-3] - d mod29).
 * It cannot use future plaintext, unbounded state or page-private maps.
 *
 * The original first three symbols per physical page may be assigned ANY
 * plaintext runes for a generous 165-symbol free prefix allowance.
 *
 * Compute a key-independent hard maximum on global top-one/top-five decoded
 * rune counts across every legal secret, without optimizing a language score.
 * Source p7 has five red words, motivating a period-5 phase clock; this does
 * not establish that the author actually used such a model.
 *
 * Exact Windows Node22 SFT:
 * node sims/lp2_threeback_fivephase_allsecret_affine_original_sft.cjs
 */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repo=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(repo,
  'resources','liber-primus','lp2-corpus.json'),'utf8'));
const pages=corpus.pages.filter(p=>p.page<=55 && p.indices.length);
assert.equal(pages.length,55);
const real=pages.map(p=>p.indices);
assert.equal(real.reduce((s,v)=>s+v.length,0),12956);

const phases=5;
const N=real.reduce((n,v)=>n+v.length-3,0);
assert.equal(N,12791);
const phaseN=Array(phases).fill(0);
for(const a of real)for(let i=3;i<a.length;i++)phaseN[i%phases]++;
assert.deepEqual(phaseN,[2561,2547,2538,2577,2568]);

const freq=Array.from({length:5},()=>new Uint16Array(29));
const maxOne=Array(phases).fill(0),maxFive=Array(phases).fill(0);
const witnessOne=Array(phases).fill(null),witnessFive=Array(phases).fill(null);
for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
 for(const f of freq)f.fill(0);
 for(const original of real){
   for(let i=3;i<original.length;i++){
     const rank=(original[i]-a*original[i-1]-b*original[i-2]-
       c*original[i-3]+2436)%29;
     freq[i%5][rank]++;
   }
 }
 for(let phase=0;phase<phases;phase++){
   const top=Array.from(freq[phase]).sort((x,y)=>y-x);
   if(top[0]>maxOne[phase]){
     maxOne[phase]=top[0];
     witnessOne[phase]=[a,b,c];
   }
   const five=top.slice(0,5).reduce((s,x)=>s+x,0);
   if(five>maxFive[phase]){
     maxFive[phase]=five;
     witnessFive[phase]=[a,b,c];
   }
 }
}

assert.deepEqual(maxOne,[133,134,132,137,135]);
assert.deepEqual(maxFive,[567,559,557,569,567]);
const sum=x=>x.reduce((a,b)=>a+b,0);
assert.equal(sum(maxOne),671);
assert.equal(sum(maxFive),2819);
const free=pages.length*3;
assert.equal(free,165);
assert.equal(sum(maxOne)+free,836);
assert.equal(sum(maxFive)+free,2984);

const native=corpus.pages[57].indices;
assert.equal(native.length,95);
const fNative=Array(29).fill(0);
let k=0;
for(const x of real)for(let i=3;i<x.length;i++)
  fNative[native[k++%native.length]]++;
assert.equal(k,N);
const sortedNative=fNative.slice().sort((a,b)=>b-a);
assert.equal(sortedNative[0],2019);
assert.equal(sum(sortedNative.slice(0,5)),6190);

// Native-GP plant: inverse must recover exact solved p57 GP29 symbols
// from a nontrivially phase-dependent law at every original page length.
const mod=x=>((x%29)+29)%29;
const coefficients=[[6,7,16],[20,24,15],[2,0,23],[27,8,15],[28,2,3]];
let recovered=0;
for(const source of real){
 const plaintext=Array.from({length:source.length},()=>native[recovered++%native.length]);
 const ciphertext=plaintext.slice(0,3);
 for(let i=3;i<plaintext.length;i++){
  const [a,b,c]=coefficients[i%5];
  ciphertext.push(mod(plaintext[i]+a*ciphertext[i-1]+
    b*ciphertext[i-2]+c*ciphertext[i-3]));
 }
 const ptest=ciphertext.slice(0,3);
 for(let i=3;i<ciphertext.length;i++){
  const [a,b,c]=coefficients[i%5];
  ptest.push(mod(ciphertext[i]-a*ciphertext[i-1]-
    b*ciphertext[i-2]-c*ciphertext[i-3]));
 }
 assert.deepEqual(ptest,plaintext,'Exact full original-layout native-GP cryptographic positive');
}
assert.equal(recovered,12956);

console.log('Original LP2 p0–55: 12956 GP29 runes, 55 rune-bearing physical pages');
console.log('Page first3 symbols arbitrary: '+free+' unconstrained; transformed positions '+N);
console.log('Exhausted every triple of GF29 feedback coefficients per independent phase: 29^3=24389 each');
console.log('Five-phase true all-secret maximum single-symbol occupancy: '+maxOne.join('+')+'='+sum(maxOne));
console.log('Five-phase true all-secret maximum top-five occupancy: '+maxFive.join('+')+'='+sum(maxFive));
console.log('Even freeing all '+free+' starts, upper bounds on full12956: top1 '+(sum(maxOne)+free)+', top5 '+(sum(maxFive)+free));
console.log('Genuine 95-rune solved-LP2 GP control repeated on original inner source clocks: top1 '+sortedNative[0]+', top5 '+sum(sortedNative.slice(0,5)));
console.log('Max-single witnesses: '+JSON.stringify(witnessOne));
console.log('Max-five witnesses: '+JSON.stringify(witnessFive));
console.log('PASS: all secrets 5phase 3previous-cipher GF29 affine decoder cannot produce native-GP-English-like monogram concentration. Original source loops exhaustive and solved-GP plant recovers 12956/12956. No unknown plaintext.');

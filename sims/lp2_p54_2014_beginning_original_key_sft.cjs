'use strict';

/**
 * Source-frozen original May 24, 2014 "A BEGINNING" p54 key check.
 * Seven unknown words or an independently selected key are NOT inferred.
 * Run: node sims/lp2_p54_2014_beginning_original_key_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} relative @returns {string} */
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const page=gp.pages.find(p=>p.page===54);
assert(page);
const c=page.indices;
assert.equal(c.length,232);
const alphabet=new Map(gp.runes.map((r,i)=>[r,i]));
const sourcePage=read('resources/lp2-transcription.txt').split('%')[53];
const sourceIndices=Array.from(sourcePage).filter(x=>alphabet.has(x)).map(x=>alphabet.get(x));
assert.deepEqual(sourceIndices,c,'source-printed p54 must equal canonical original');
const firstWords=sourcePage.match(/[ᚠ-ᛡ]+/gu);
assert(firstWords&&firstWords.length>2);
assert.deepEqual(firstWords.slice(0,3).map(x=>Array.from(x).map(r=>alphabet.get(r))),
  [c.slice(0,1),c.slice(1,9),c.slice(9,17)]);
const key=[0,-2,-3,-17,-17,-22,-5,0,-27];
const target=[24,17,18,6,10,9,9,10,21];
const sourceFirstNine=[24,19,21,23,27,2,14,10,19];
const mod=x=>((x%29)+29)%29;
assert.deepEqual(c.slice(0,9),sourceFirstNine);
assert.deepEqual(target.map((v,i)=>mod(v-c[i])),key.map(mod),
  'nine key shifts are exactly P-C of the assumed phrase');
assert.deepEqual(c.slice(0,9).map((v,i)=>mod(v+key[i])),target);
const noSkip=c.map((v,i)=>mod(v+key[i%key.length]));
const nextWord=[27,21,10,4,13,14,19,19]; // IA NG I R P X M M GP29
assert.deepEqual(noSkip.slice(9,17),nextWord);
assert.equal(c[57],3); // cipher O, not F
assert.equal(mod(c[57]+key[2]),0); // forced plaintext F violates F transparency
/** @param {number[]} arr @returns {number} */
function ioc(arr){
  const counts=new Uint32Array(29);
  for(const v of arr)counts[v]++;
  return counts.reduce((n,k)=>n+k*(k-1),0)/(arr.length*(arr.length-1));
}
assert(Math.abs(ioc(noSkip)-0.036236751753993136)<1e-12);
assert(Math.abs(ioc(noSkip.slice(9))-0.036440027471417606)<1e-12);

/**
 * Enumerate all legal original p56-style F bypass clocks.
 * A plaintext F is transparently carried as ciphertext F, consuming no key.
 * Any ordinary decrypted F from a non-F ciphertext is thus forbidden.
 * @param {number[]} tape
 * @returns {{endPhases:number[],firstImpossible:number|null,liveBefore:number[],survivorPaths:string}}
 */
function legalMasks(tape){
  /** @type {Map<number,bigint>} */
  let dp=new Map([[0,1n]]);
  let before=[],dead=null;
  for(let i=0;i<tape.length;i++){
    const next=new Map();
    for(const [phase,ways] of dp){
      const ordinary=mod(tape[i]+key[phase]);
      if(ordinary!==0){
        const after=(phase+1)%9;
        next.set(after,(next.get(after)||0n)+ways);
      }
      if(tape[i]===0)next.set(phase,(next.get(phase)||0n)+ways);
    }
    if(next.size===0){dead=i;before=[...dp.keys()];break;}
    dp=next;
  }
  return {endPhases:[...dp.keys()],firstImpossible:dead,
    liveBefore:before,survivorPaths:dead===null?[...dp.values()].reduce((a,b)=>a+b,0n).toString():'0'};
}
const ftest=legalMasks(c);
assert.equal(ftest.firstImpossible,57);
assert.deepEqual(ftest.liveBefore,[2]);
assert.equal(ftest.survivorPaths,'0');
const fLocations=c.flatMap((v,i)=>v===0?[i]:[]);
assert.deepEqual(fLocations,[41,65,195]);

// The same exact p54 period-nine key can genuinely encode a positive native GP plant.
const solved=gp.pages.find(p=>p.page===57);
assert(solved);
const plain=Array.from({length:c.length},(_,i)=>solved.indices[i%solved.indices.length]);
const planted=[];
let phase=0;
for(const p of plain){
  if(p===0)planted.push(0);
  else{planted.push(mod(p-key[phase]));phase=(phase+1)%9;}
}
const recovered=[];
phase=0;
for(let i=0;i<plain.length;i++){
  if(plain[i]===0){
    assert.equal(planted[i],0,'source-native F bypass');
    recovered.push(0);
  }else{
    const v=mod(planted[i]+key[phase]);
    assert.equal(v,plain[i]);
    recovered.push(v);
    phase=(phase+1)%9;
  }
}
assert.deepEqual(recovered,plain);
assert.equal(legalMasks(planted).firstImpossible,null);
console.log(JSON.stringify({
  status:'PASS - frozen historical crib key rejected; no original unknown-page plaintext',
  source:'2014 May 24 L188635 Totry, preceded by May 23 L186651 Mothwing explicit false-crib admission',
  physicalPage:54,runes:c.length,
  key,originalNine:sourceFirstNine,guessedNine:target,
  derivedKeyExactlyMatches:true,
  firstUntouchedPrintedWord:{
    ciphertext:c.slice(9,17).map(i=>gp.translit[i]).join(' '),
    forcedIfPeriodNine:nextWord.map(i=>gp.translit[i]).join(' ')
  },
  noSkipFullIoC:ioc(noSkip),noSkipOutsideCribIoC:ioc(noSkip.slice(9)),
  historicalKeyAllLegalFBypass:ftest,
  originalCipherFLocations:fLocations,
  positiveSourceNativePlantLength:plain.length,
  positiveSourceNativePlantExact:true,
  caveat:'The 2014 author supplied no periodic key extension; the failure rejects this frozen period-nine reading and the underlying source-selected crib, not every independent p54 cipher.'
},null,2));

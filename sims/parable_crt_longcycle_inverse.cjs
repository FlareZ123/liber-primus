"use strict";
/**
 * Historical Parable composite-field keystream test on original LP2.
 *
 * F79 x F3301 has a canonical CRT modulus 260779. The original 2013
 * Parable 1595277641 modulo 260779 is 92498, of EXACT multiplicative
 * order lcm(78,3300)=42900. This joint cycle is longer than all
 * 12,815 ciphertext nonzero steps and evades the shorter individual-field
 * lag-equality screen. Test its original phase (with four simple byte-like
 * extraction rules) and the ENTIRE 42,900-phase historical-generator
 * orbit for the canonical state%28 extraction, book/page/section reset,
 * and both EA clock conventions.
 *
 * Candidate exact reversible GP28 model: 29 independent hidden stationary
 * bijections S[previousC] over all 28 next-cipher glyphs unequal to previous,
 * P=EA maps to repeated glyph. At identical previousC and known pad symbol,
 * output collisions are invariant to all 29 unknown secret row tables.
 *
 * Source-true positive: 12,815 native-GP Shakespeare non-EA rune symbols
 * encrypted with secret random rows under each specified composite key;
 * same 55 page lengths and exactly the 86 original EA sites; recover and
 * exact forward-re-encrypt the entire original-shaped synthetic manuscript.
 * The source-true positive establishes sensitivity, NOT a real decryption.
 *
 * Run: node sims/parable_crt_longcycle_inverse.cjs  (Node >= 22)
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {gp}=require("./parable_primitive_period_source_gate.cjs");
const {originalRecords,makeCollisionMeasure}=
  require("./parable_primitive_feedback_row_collision.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const co=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=co.pages.filter(p=>p.page<=55&&p.indices.length);
const raw=originalRecords();
const data=gp(read("resources/control/shakespeare_first300k.txt"));
const source=data.slice(12731).filter(x=>x!==28).slice(0,12815);
assert.equal(source.length,12815);
const MOD=79*3301,G=1595277641%MOD,T=42900;
assert.equal(MOD,260779);
assert.equal(G,92498);
const residue=new Uint32Array(T);
let x=G;
for(let i=0;i<T;i++) {
 residue[i]=x;
 x=x*G%MOD;
}
assert.equal(x,G);
for(const factor of [2,3,5,11,13])
 assert.notEqual(residue[T/factor-1],1,
  "Source product composite generator has smaller period");
const extract={
 residue28:v=>v%28,
 componentSum:v=>((v%79)+(v%3301))%28,
 componentXor:v=>((v%79)^(v%3301))%28,
 componentProduct:v=>((v%79)*(v%3301))%28
};
const keyCycles=Object.fromEntries(Object.entries(extract).map(
 ([name,fn])=>[name,Uint8Array.from(residue,fn)]));
const clockList=[
 ["book","skip","bc"],["book","consume","ba"],
 ["page","skip","pc"],["page","consume","pa"],
 ["section","skip","sc"],["section","consume","sa"]
];

/** @param {number} seed */
function rng(seed){
 let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
function secretRows(){
 const next=rng(0x17293301);
 return Array.from({length:29},(_,prior)=>{
  const row=Array.from({length:29},(_,i)=>i).filter(x=>x!==prior);
  for(let i=27;i>0;i--){const j=next()%(i+1);
   [row[i],row[j]]=[row[j],row[i]];}
  return row;
 });
}
const S=secretRows();
/** @param {Uint8Array} pad */
function plant(pad){
 let p=0,all=0,markers=0;
 const prior=[],cur=[];
 for(let j=0;j<pages.length;j++){
  const authentic=pages[j].indices,originalLength=authentic.length;
  const generated=[(5+7*j)%29];
  for(let i=1;i<originalLength;i++) {
   const preceding=generated[i-1];
   if(authentic[i]===authentic[i-1]){
    generated.push(preceding);markers++;
    continue;
   }
   const plain=source[p],k=pad[p],out=S[preceding][(plain+k)%28];
   generated.push(out);prior.push(preceding);cur.push(out);
   const inverse=S[preceding].indexOf(out);
   const check=(inverse-k+28)%28;
   assert.equal(check,plain);
   assert.equal(S[preceding][(check+k)%28],out);
   p++;
  }
  all+=generated.length;
 }
 assert.equal(p,12815);
 assert.equal(all,12956);
 assert.equal(markers,86);
 return {prev:Uint8Array.from(prior),cur:Uint8Array.from(cur),
  nonzeroSourceRunes:p,outputRunes:all,originalMarkerSites:markers};
}

/** @param {Uint8Array} cycle @param {Uint16Array} clock @param {number} phase */
function derive(cycle,clock,phase){
 const pad=new Uint8Array(clock.length);
 for(let i=0;i<clock.length;i++){
  let j=clock[i]+phase;
  if(j>=T)j-=T;
  pad[i]=cycle[j];
 }
 return pad;
}
const collision=makeCollisionMeasure();
function fixedPhase(){
 const results=[];
 for(const [reset,markerClock,idx] of clockList) {
  const clock=raw.clockFields[idx];
  for(const [name,cycle] of Object.entries(keyCycles)){
   const pad=derive(cycle,clock,0),plantData=plant(pad);
   const original=collision(raw.previous,raw.current,pad);
   const sourceTrue=collision(plantData.prev,plantData.cur,pad);
   assert.equal(plantData.originalMarkerSites,86);
   assert.equal(plantData.outputRunes,12956);
   assert(sourceTrue.rate>0.055);
   results.push({reset,markerClock,extraction:name,
    authentic:original,sourceTrue,originalShapedRecovered:plantData.outputRunes});
  }
 }
 return results;
}

/** Search all 42,900 possible power phases for ONE historical orbit. */
function exhaustive(){
 const cycle=keyCycles.residue28;
 const results=[];
 for(const [reset,markerClock,idx] of clockList){
  const clock=raw.clockFields[idx],pad=derive(cycle,clock,0);
  const truePlant=plant(pad);
  let max=-Infinity,bestPhase=0,min=Infinity,mean=0,
   phase0=0,positiveAtTrue=0;
  for(let phase=0;phase<T;phase++){
   for(let i=0;i<pad.length;i++){
    let j=phase+clock[i];
    if(j>=T)j-=T;
    pad[i]=cycle[j];
   }
   const original=collision(raw.previous,raw.current,pad);
   if(original.rate>max){max=original.rate;bestPhase=phase;}
   if(original.rate<min)min=original.rate;
   if(phase===0){
    phase0=original.rate;
    positiveAtTrue=collision(truePlant.prev,truePlant.cur,pad).rate;
   }
   mean+=original.rate;
  }
  assert(positiveAtTrue>0.055);
  results.push({reset,markerClock,phaseVariantsExhausted:T,
   sourceTrueAtHistoricalPhase:positiveAtTrue,
   original:{bestPhase,maximumRate:max,minimumRate:min,
    meanRate:mean/T,historicalPhaseRate:phase0}});
 }
 return results;
}
function main(){
 const fixed=fixedPhase(),sweep=exhaustive();
 assert.equal(fixed.length,24);
 assert.equal(sweep.length,6);
 assert.equal(sweep.reduce((s,x)=>s+x.phaseVariantsExhausted,0),257400);
 const fixedMax=Math.max(...fixed.map(x=>x.authentic.rate));
 const sweepMax=Math.max(...sweep.map(x=>x.original.maximumRate));
 const plantMin=Math.min(...fixed.map(x=>x.sourceTrue.rate));
 assert(plantMin>fixedMax);
 return {
  status:"Source-anchored 42,900-cycle CRT key original-input search, not an original plaintext recovery",
  historicalProduct:1595277641,crtModulus:MOD,primitiveGenerator:G,
  exactGeneratorOrder:T,unitGroupCosets:6,
  allOriginalCiphertextRunes:12956,originalCleanSteps:raw.count,
  originalMarkerSites:raw.markers,
  fixedHistoricalPhaseModels:24,
  exhaustiveCanonicalPeriodOrbits:6,
  canonicalPhaseModelsExhausted:257400,
  fixedHistoricalPhaseMaxRate:fixedMax,
  phaseSweptOriginalMaxRate:sweepMax,
  fixedPlantedMinTrueRate:plantMin,
  fixed,completeOrbitSearch:sweep,
  scope:"Finite selection of four natural CRT extractors at historical phase and one canonical residue28 extractor over all 42900 phases, 3 reset modes and 2 marker clocks. Six multiplicative unit-group cosets exist; a different initial coset is NOT tested. All conclusions assume native-GP28 source plaintext and globally fixed secret predecessor tables."
 };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={derive,plant,fixedPhase,exhaustive,main};

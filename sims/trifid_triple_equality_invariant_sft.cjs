"use strict";
/**
 * Original-source key-independent Trifid triple-equality invariant, SFT.
 * For standard 27-cube Trifid at any period divisible by 3,
 * each triple (C[t],C[m+t],C[2*m+t]) with m=period/3 is sent by
 * a bijection depending only on the fixed secret cube to plaintext
 * triple (P[3*t],P[3*t+1],P[3*t+2]).
 * Thus repeated-triplet multiplicities are IDENTICAL for all 27! cubes.
 * IA and EA remain fixed transparent controls, stripped before the clock.
 * Run: node sims/trifid_triple_equality_invariant_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {gp,apply}=require("./trifid_27cube_allsecret_gate.cjs");
const ROOT=path.join(__dirname,"..");
const read=f=>fs.readFileSync(path.join(ROOT,f),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
const core=original.filter(x=>x<27);
assert.equal(original.length,12956);
assert.equal(core.length,12026);
const references=[
 "resources/control/shakespeare_first300k.txt",
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/emerson_essays_2944.txt"
];
const periods=[3,9,27,81,243,729,2187,6561];
const pack=(a,b,c)=>(a*27+b)*27+c;

/** @param {number[]} runes @param {number} period */
function sourceTriples(runes,period) {
 const out=[],m=period/3,full=Math.floor(runes.length/period)*period;
 assert.equal(period%3,0);
 for(let off=0;off<full;off+=period)
   for(let t=0;t<m;t++)
     out.push(pack(runes[off+t],runes[off+m+t],runes[off+2*m+t]));
 return out;
}
/** @param {number[]} runes @param {number} triples */
function nativeTriples(runes,triples) {
 assert.ok(triples*3<=runes.length);
 return Array.from({length:triples},(_,i)=>
   pack(runes[3*i],runes[3*i+1],runes[3*i+2]));
}
/** @param {number[]} codes */
function stats(codes) {
 const frequencies=new Uint16Array(27**3);
 for(const c of codes) frequencies[c]++;
 let pairs=0,max=0,unique=0,repeats=0;
 for(const n of frequencies)if(n){
  unique++;max=Math.max(max,n);pairs+=n*(n-1)/2;
  if(n>1)repeats++;
 }
 return {triples:codes.length,unique,pairs,max,repeatedTypes:repeats};
}
/** @param {number[]} source @param {number[]} decoded */
function samePartition(source,decoded) {
 assert.equal(source.length,decoded.length);
 const forward=new Map(),reverse=new Map();
 for(let i=0;i<source.length;i++){
  const a=source[i],b=decoded[i];
  if(forward.has(a))assert.equal(forward.get(a),b);
  else forward.set(a,b);
  if(reverse.has(b))assert.equal(reverse.get(b),a);
  else reverse.set(b,a);
 }
 assert.deepEqual(stats(source),stats(decoded));
}
/**
 * Exact global sliding minima over all phase-aligned consecutive
 * 3-rune windows of the stripped reference. All GP windows are
 * represented, even those impossible for a 12,956-rune manuscript.
 * @param {number[]} coreText
 * @param {number} needed
 */
function minEnglish(coreText,needed){
 const histogram=new Uint16Array(27**3),buckets=new Int32Array(needed+1);
 let minPairs=Infinity,minMaximum=Infinity,windows=0,example=null;
 for(let phase=0;phase<3;phase++){
  const triples=[];
  for(let i=phase;i+2<coreText.length;i+=3)
   triples.push(pack(coreText[i],coreText[i+1],coreText[i+2]));
  if(triples.length<needed)continue;
  histogram.fill(0);buckets.fill(0);
  let pairs=0,max=0;
  /** @param {number} code @param {number} step */
  function change(code,step){
   const old=histogram[code];
   if(old)buckets[old]--;
   pairs+=step===1?old:1-old;
   const n=old+step;
   assert.ok(n>=0&&n<=needed);
   histogram[code]=n;
   if(n)buckets[n]++;
   max=Math.max(max,n);
   while(max&&!buckets[max])max--;
  }
  for(let i=0;i<needed;i++)change(triples[i],1);
  for(let start=0;start+needed<=triples.length;start++){
   windows++;
   if(pairs<minPairs){
    minPairs=pairs;example={phase,coreStart:phase+3*start};
   }
   minMaximum=Math.min(minMaximum,max);
   if(start+needed<triples.length){
    change(triples[start],-1);
    change(triples[start+needed],1);
   }
  }
 }
 assert.ok(windows>0);
 return {minPairs,minMaximum,windows,example};
}
/** @param {number} period */
function checkPlant(period){
 const cube=Array.from({length:27},(_,i)=>(7*i)%27);
 assert.equal(new Set(cube).size,27);
 const decrypted=apply(original,cube,"standard",false,period);
 const s=sourceTriples(core,period);
 samePartition(s,nativeTriples(decrypted.filter(x=>x<27),s.length));
 assert.deepEqual(apply(decrypted,cube,"standard",true,period),original);
 const sample=gp(read(references[0])).slice(0,12956);
 assert.equal(sample.length,12956);
 const encrypted=apply(sample,cube,"standard",true,period);
 assert.deepEqual(apply(encrypted,cube,"standard",false,period),sample);
 const s2=sourceTriples(encrypted.filter(x=>x<27),period);
 samePartition(s2,nativeTriples(sample.filter(x=>x<27),s2.length));
 return {originalRoundTrip:12956,nativePlantRoundTrip:12956,nativePlantTripleCheck:s2.length};
}
function main(){
 const english=references.map(file=>{
  const runes=gp(read(file)).filter(x=>x<27);
  return {name:path.basename(file),runes};
 });
 const rows=[];
 for(const period of periods){
  const source=sourceTriples(core,period),observed=stats(source);
  const controls=english.map(item=>{
   const e=minEnglish(item.runes,source.length);
   return {name:item.name,minEnglishPairs:e.minPairs,
     minEnglishMax:e.minMaximum,windows:e.windows,
     originalIsBelowEveryEnglishWindow:observed.pairs<e.minPairs};
  });
  const plant=checkPlant(period);
  const row={period,fullCoreRunes:3*source.length,
   originalPairs:observed.pairs,originalMax:observed.max,
   originalUnique:observed.unique,
   references:controls,
   excludingAllThreeReferences:controls.every(x=>x.originalIsBelowEveryEnglishWindow),
   plant};
  console.log("PERIOD "+JSON.stringify(row));
  rows.push(row);
 }
 console.log("RESULT "+JSON.stringify({
  sourceRunes:original.length,sourceCoreRunes:core.length,
  noUnknownPlaintextRecovered:true,
  allFixedSecretCubeNativeGPControlsExcluded:
    rows.filter(r=>r.excludingAllThreeReferences).map(r=>r.period),
  interpretation:"Exact triple-equality partition invariant, one-layer standard Trifid with GP IA/EA passthrough"
 }));
}
main();

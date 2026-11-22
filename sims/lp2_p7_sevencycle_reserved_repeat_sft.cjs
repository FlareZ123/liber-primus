"use strict";
/**
 * Source-constrained original-input exclusion for seven-cycle changing reserved
 * rune in fully arbitrary per-position predecessor-exclusion GP29 channel.
 * Windows 11 / Node.js 22: node sims/lp2_p7_sevencycle_reserved_repeat_sft.cjs
 *
 * The p7 five-red-product quartic has unique 7-cycle [5,15,28,9,10,24,7].
 * If this cycle chooses the special plaintext symbol which produces zero
 * cipher predecessor difference, the original number of repeated cipher
 * steps is a key-independent prediction, whatever bijection is used on
 * the other 28 plaintext values.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const data = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = data.pages.slice(0,56);
const original = pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);
const cycle = [5,15,28,9,10,24,7];
const mod = n => (n%29+29)%29;
const P = x => mod(11+26*x+8*x*x+15*x*x*x+2*x*x*x*x);
for(let j=0;j<cycle.length;j++)assert.equal(P(cycle[j]),cycle[(j+1)%7]);
assert.equal(new Set(cycle).size,7);
const originalRepeats = original.reduce((n,v,i)=>n+Number(i>0&&v===original[i-1]),0);
assert.equal(originalRepeats,86);
const names=cycle.map(x=>data.translit[x]);
/** @param {number} index @param {number} pageStart @param {string} mode @param {number} phase */
function special(index,pageStart,mode,phase){
 const clock=mode==="continuous"?index:index-pageStart;
 return cycle[(clock+phase)%7];
}
/** @param {number[]} plaintext @param {string} mode @param {number} phase */
function markerHits(plaintext,mode,phase){
 let hits=0,global=0;
 for(const page of pages){
  const start=global;
  for(let local=0;local<page.indices.length;local++,global++){
   if(global>0 && plaintext[global]===special(global,start,mode,phase))hits++;
  }
 }
 assert.equal(global,original.length);
 return hits;
}
/** @param {number[]} plaintext @param {string} mode @param {number} phase */
function transport(plaintext,mode,phase){
 const encoded=Array(plaintext.length).fill(0),restored=Array(plaintext.length).fill(0);
 encoded[0]=13;restored[0]=plaintext[0];
 let cursor=0;for(const page of pages){
  const start=cursor;
  for(let k=0;k<page.indices.length;k++,cursor++){
   if(cursor===0)continue;
   const source=plaintext[cursor],S=special(cursor,start,mode,phase);
   const rank=source<S?source:source-1;
   const step=source===S?0:rank+1;
   encoded[cursor]=mod(encoded[cursor-1]+step);
   const encodedStep=mod(encoded[cursor]-encoded[cursor-1]);
   const r=encodedStep-1;
   restored[cursor]=encodedStep===0?S:r>=S?r+1:r;
  }
 }
 assert.deepEqual(restored,plaintext);
 const observed=encoded.reduce((n,v,i)=>n+Number(i>0&&v===encoded[i-1]),0);
 assert.equal(observed,markerHits(plaintext,mode,phase));
 return observed;
}
const sourceFiles=[
 ["Gibran","resources/control/gibran_prophet_58585.txt"],
 ["Shakespeare","resources/control/shakespeare_first300k.txt"],
 ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const controls=[];
for(const [name,file] of sourceFiles){
 const body=encodeSourceNativeGP(read(file));
 assert(body.length>=original.length);
 const windowOffsets=[0,Math.floor((body.length-original.length)/3),
   Math.floor(2*(body.length-original.length)/3),body.length-original.length];
 for(let win=0;win<windowOffsets.length;win++){
  const source=body.slice(windowOffsets[win],windowOffsets[win]+original.length);
  for(const mode of ["continuous","page-reset"]){
   for(let phase=0;phase<7;phase++){
    const observed=markerHits(source,mode,phase);
    // None of the original phases can produce ordinary native GP
    // word frequencies when the source seven-state GP label is an
    // identifiable escaping rune. Test 12 source windows x 14 clocks.
    assert(observed>86);
    controls.push({name,window:win,mode,phase,hits:observed});
   }
  }
 }
}
const native=encodeSourceNativeGP(read(sourceFiles[0][1])).slice(0,original.length);
assert.equal(transport(native,"continuous",0),markerHits(native,"continuous",0));
assert.equal(transport(native,"page-reset",4),markerHits(native,"page-reset",4));
const lowest=controls.reduce((a,b)=>a.hits<b.hits?a:b);
const highest=controls.reduce((a,b)=>a.hits>b.hits?a:b);
console.log(JSON.stringify({sourcePolynomial:"P(x)=11+26x+8x²+15x³+2x⁴ mod29",
 sevenCycle:cycle,sevenCycleNativeLabels:names,
 outputModel:"Any arbitrary invertible 28-symbol map with source7-state changing reserved plaintext GP symbol",
 originalCipherRepeats:originalRepeats,sourceWindows:12,clockModels:14,
 testedOriginalNativeComparisons:controls.length,smallestSourceNativeExpected:lowest,
 largestSourceNativeExpected:highest,nativeGPPositivePlants:2,positiveExactReconstruction:true,
 evidence:"Native-controls-only conditional mismatch, not a proof against other ciphers or hidden languages",
 decision:"Reject seven-cycle reserved-rune predecessor-exclusion as a direct native-GP decoder of original unsolved LP2"},null,2));

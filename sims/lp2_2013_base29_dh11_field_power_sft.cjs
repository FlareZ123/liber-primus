"use strict";
// Source-constrained, exploratory GP29^2 power inverse gate, Node.js 22 CJS.
// 2013 signed BASE29 3301->3QO motivates monic x^2+18x+11 over F29.
// Inferred 2013 DH3301 client exponent class e = 11 mod550 motivates e=11.
// This candidate is not an attested LP2 encoding operation.
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const C=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
const mod=x=>(x%29+29)%29;
/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function multiply([a,b],[c,d]){
 return [mod(a*c-11*b*d),mod(a*d+b*c-18*b*d)];
}
/** @param {[number,number]} element @param {number} n @returns {[number,number]} */
function power(element,n){
 let result=[1,0],base=element;
 while(n>0){
  if(n%2)result=multiply(result,base);
  base=multiply(base,base);n=Math.floor(n/2);
 }
 return result;
}
/** Transform all pairs, leaving a terminal odd rune unchanged. */
function transform(indices,n){
 const result=[];
 for(let i=0;i+1<indices.length;i+=2)result.push(...power([indices[i],indices[i+1]],n));
 if(indices.length%2)result.push(indices[indices.length-1]);
 return result;
}
function ioc(x){
 const counts=Array(29).fill(0);
 for(const v of x)counts[v]++;
 return counts.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1));
}
function doubled(x){
 let n=0;for(let i=1;i<x.length;i++)if(x[i]===x[i-1])n++;return n;
}
const pages=C.pages.slice(0,56).filter(p=>p.indices.length);
const original=pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);
const controls=C.pages[57].indices;
assert.equal(controls.length,95);
assert.equal(11*611%840,1);
for(let a=0;a<29;a++)for(let b=0;b<29;b++){
 const xy=[a,b];
 assert.deepEqual(power(power(xy,11),611),xy);
}
// A blind, source-native plant, *not* an original-cipher success:
assert.deepEqual(transform(transform(controls,11),611),controls);
// Two preselected segmentations: full manuscript and reset at printed pages.
const clocks={
 book:original,
 pageReset:pages.flatMap(p=>transform(p.indices,611))
};
const outputs={
 original:{ioc:ioc(original),doubled:doubled(original)},
 nativeSolvedP57:{ioc:ioc(controls),doubled:doubled(controls)},
 plantedRecoveredCorrectly:true
};
for(const [clock,indices] of Object.entries(clocks)){
 const decoded=clock==="book"?transform(indices,611):indices;
 const alternative=clock==="book"?transform(indices,11):pages.flatMap(p=>transform(p.indices,11));
 outputs[clock]={
  inverse11:{ioc:ioc(decoded),doubled:doubled(decoded),
   first32:decoded.slice(0,32).map(x=>C.translit[x]).join("")},
  forward11:{ioc:ioc(alternative),doubled:doubled(alternative)}
 };
}
// Freeze these results as reproducibility assertions on original source.
assert.ok(Math.abs(outputs.book.inverse11.ioc-0.0345436485499894)<1e-14);
assert.ok(Math.abs(outputs.pageReset.inverse11.ioc-0.03447468014831304)<1e-14);
assert.deepEqual([outputs.book.inverse11.doubled,outputs.pageReset.inverse11.doubled],[269,270]);
console.log(JSON.stringify({field:"F29[x]/(x^2+18*x+11)",signed2013DigitConvention:"3QO",
 inferred2013DHExponentClass:"11 mod 550",chosenUnitExponent:11,
 exponentInverseMod840:611,originalRunes:original.length,outputs},null,2));

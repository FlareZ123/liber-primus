"use strict";
/**
 * Exact, all-degree GF29 gcd of physical p29 and p50 original polynomials.
 * Source-frozen before inspecting gcd: verify only the p39 root24 double
 * is common, with an independent nontrivial-factor synthetic positive.
 * Node22 CommonJS read-only SFT, no packages, no external calls.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const gp=load("resources/liber-primus/lp2-corpus.json");
const grid=load("resources/liber-primus/lp2-grid-256.json");
const A=gp.pages.find(page=>page.page===29).indices;
const B=grid.bytes;
const mod=x=>((x%29)+29)%29;
/** @param {number[]} values @returns {number[]} */
function trim(values){
 let i=0;while(i<values.length&&mod(values[i])===0)i++;
 return values.slice(i).map(mod);
}
/** @param {number} a */
function inverse(a){
 for(let i=1;i<29;i++)if(mod(i*a)===1)return i;
 throw Error("noninvertible factor lead");
}
/** @param {number[]} numer @param {number[]} denom */
function divmod(numer,denom) {
 const a=trim(numer),b=trim(denom);
 assert(b.length);
 const q=Array(Math.max(0,a.length-b.length+1)).fill(0),w=a.slice(),bi=inverse(b[0]);
 for(let i=0;i<q.length;i++){
  const c=mod(w[i]*bi);q[i]=c;
  for(let j=0;j<b.length;j++)w[i+j]=mod(w[i+j]-c*b[j]);
 }
 return {q:trim(q),r:trim(w.slice(q.length))};
}
/** @param {number[]} a @param {number[]} b */
function multiply(a,b){
 const o=Array(a.length+b.length-1).fill(0);
 for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)o[i+j]=mod(o[i+j]+a[i]*b[j]);
 return trim(o);
}
/** @param {number[]} a @param {number[]} b */
function gcd(a,b){
 a=trim(a);b=trim(b);let steps=0;
 while(b.length){const r=divmod(a,b).r;a=b;b=r;steps++;}
 return {coefficients:a.map(x=>mod(x*inverse(a[0]))),steps};
}
assert.equal(A.length,277);
assert.equal(B.length,256);
const common=gcd(A,B);
assert.deepEqual(common.coefficients,[1,10,25]);
assert.equal(common.steps,248);
assert.deepEqual(divmod(A,common.coefficients).r,[]);
assert.deepEqual(divmod(B,common.coefficients).r,[]);
const [QA,QB]=[divmod(A,common.coefficients).q,divmod(B,common.coefficients).q];
assert.equal(QA.length,275);
assert.equal(QB.length,253); // Original p50 begins with 0 mod29 (effective degree254).
assert.deepEqual(gcd(QA,QB).coefficients,[1]);
// Positive: append one full independent monic linear common factor X+1,
// while retaining the original high-order source G exactly on both streams.
const extra=[1,1];
const plant=gcd(multiply(A,extra),multiply(B,extra));
assert.deepEqual(plant.coefficients,multiply(common.coefficients,extra));
console.log(JSON.stringify({
 status:"PASS",original:{p29Runes:A.length,p50Bytes:B.length,sourcePolynomialsHighFirst:true},
 gcd:{degree:common.coefficients.length-1,coefficients:common.coefficients,steps:common.steps,
    extraCommonDegree:0,quotientGcd:[1]},
 synthetic:{extraFactor:extra,plantedGcd:plant.coefficients},
 interpretation:"The p39 source repeated root24 is the entire common GF29 polynomial divisor of p29 and p50; no higher irreducible shared factor exists."
},null,2));

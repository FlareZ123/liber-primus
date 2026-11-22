"use strict";
/**
 * Frozen, original-source direct GP29 Hill2 receiver of the p50/G quotient.
 * Source H/G second-base29 carry rows define the *whole* 2x2 key.
 * The result is negative for native GP prose, with an exact source-text plant.
 * Read-only Windows Node22/CommonJS SFT; no external dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const base=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(base,file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const model=buildSourceNativeTrigramModel({corpus,referenceText:read("resources/liber-primus/lp1-plaintext-reference.txt")});
const G=[15,5,27],M=[[8,5],[15,2]],I=[[27,5],[15,21]];
const mod29=x=>((x%29)+29)%29;
/** @param {number[]} values @param {number[][]} matrix */
function applyPair(values,matrix) {
 assert.equal(values.length%2,0);
 const out=[];
 for(let i=0;i<values.length;i+=2){
  out.push(mod29(matrix[0][0]*values[i]+matrix[0][1]*values[i+1]));
  out.push(mod29(matrix[1][0]*values[i]+matrix[1][1]*values[i+1]));
 }
 return out;
}
/** @param {number[]} values */
function divideG(values){
 const a=values.slice(),q=[];
 for(let i=0;i<=values.length-3;i++){
  const v=mod29(2*a[i]);q.push(v);
  for(let j=0;j<3;j++)a[i+j]=mod29(a[i+j]-G[j]*v);
 }
 return {q,rem:a.slice(-2)};
}
/** @param {number[]} values */
function ioc(values){
 const f=new Array(29).fill(0);for(const x of values)f[x]++;
 return f.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
assert.equal(grid.bytes.length,256);
assert.equal(mod29(8*2-5*15),28); // det -1
assert.deepEqual(applyPair([1,0],M),[8,15]);
assert.deepEqual(applyPair([0,1],M),[5,2]);
const original=divideG(grid.bytes);
assert.deepEqual(original.rem,[0,0]);
assert.equal(original.q.length,254);
const decoded=applyPair(original.q,I);
assert.equal(decoded.length,254);
assert.deepEqual(applyPair(decoded,M),original.q);
// Independently sourced native-LP1 positive, length254.
const plant=model.training.slice(0,254);
assert.deepEqual(applyPair(applyPair(plant,M),I),plant);
const origScore=model.scoreStream(original.q).mean;
const decodedScore=model.scoreStream(decoded).mean;
assert(Math.abs(decodedScore-(-3.423784871579763))<1e-10);
assert(decodedScore<model.p57Score-0.5);
console.log(JSON.stringify({
 status:"PASS",
 classification:"Frozen source-carry Hill2 yields no original native-GP plaintext.",
 original:{p50Bytes:256,factor:G,remainder:original.rem,quotientRunes:254,quotientTrigram:origScore,quotientIoC:ioc(original.q)},
 derived:{M,I,det:28},
 decoded:{runes:decoded.length,trigram:decodedScore,ioc:ioc(decoded),start:model.spell(decoded.slice(0,120))},
 controls:{solvedP57Trigram:model.p57Score,solvedP57IoC:ioc(corpus.pages.find(p=>p.page===57).indices),plantedSourceNativeGP:plant.length,exactOriginalForwardReplay:254},
 interpretation:"Two independent p50 source-carry rows determine a legitimate reversible Hill2 key; applying exactly that inverse to the even p50/G quotient fails the original native-GP language gate."
},null,2));

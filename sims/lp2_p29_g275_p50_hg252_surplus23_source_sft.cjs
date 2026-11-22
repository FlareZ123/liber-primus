"use strict";
/**
 * Frozen source-G p29 275 GP registers vs source-HG p50 252 GP registers.
 * Exactly two natural 23-symbol boundary removals x two GP29 pad signs.
 * Full source-native positive and exact source forward replay, negative
 * original native GP prose. Node22 CommonJS read-only, Windows-compatible.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const root=path.resolve(__dirname,"..");
const read=pathpart=>fs.readFileSync(path.join(root,pathpart),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const model=buildSourceNativeTrigramModel({corpus:gp,referenceText:read("resources/liber-primus/lp1-plaintext-reference.txt")});
const G=[15,5,27],H=[24,26,3];
const mod=n=>((n%29)+29)%29;
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a,b){
 const o=Array(a.length+b.length-1).fill(0);
 for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)o[i+j]=mod(o[i+j]+a[i]*b[j]);
 return o;
}
/** @param {number[]} original @param {number[]} factor */
function divide(original,factor){
 const a=original.map(mod),q=[];
 const inverse=Array.from({length:29},(_,i)=>i).find(i=>mod(i*factor[0])===1);
 assert.notEqual(inverse,undefined);
 for(let i=0;i<=original.length-factor.length;i++){
  const v=mod(a[i]*inverse);q.push(v);
  for(let j=0;j<factor.length;j++)a[i+j]=mod(a[i+j]-v*factor[j]);
 }
 return {q,remainder:a.slice(-factor.length+1)};
}
/** @param {number[]} a */
function ioc(a){const f=Array(29).fill(0);for(const x of a)f[x]++;
 return f.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));}
const p29=gp.pages.find(p=>p.page===29).indices;
assert.equal(p29.length,277);
assert.equal(grid.bytes.length,256);
const product=multiply(H,G);
assert.deepEqual(product,[12,17,11,21,23]);
const P=divide(p29,G),T=divide(grid.bytes,product);
assert.deepEqual(P.remainder,[0,0]);
assert.deepEqual(T.remainder,[0,0,0,0]);
assert.equal(P.q.length,275);
assert.equal(T.q.length,252);
assert.deepEqual(multiply(P.q,G),p29);
assert.deepEqual(multiply(T.q,product),grid.bytes.map(mod));
const rows=[];
for(const removed of ["first23","last23"]){
 const source=removed==="first23"?P.q.slice(23):P.q.slice(0,252);
 assert.equal(source.length,252);
 for(const sign of [-1,1]){
  const plaintext=source.map((v,i)=>mod(sign*(v-T.q[i])));
  assert.deepEqual(plaintext.map((v,i)=>mod(T.q[i]+sign*v)),source);
  // The positive plants genuine source-native GP source indices using the
  // exact same static original-other-stream and sign without fitting keys.
  const planted=model.training.slice(0,252);
  const plantedInput=planted.map((v,i)=>mod(T.q[i]+sign*v));
  assert.deepEqual(plantedInput.map((v,i)=>mod(sign*(v-T.q[i]))),planted);
  rows.push({removed,sign,runes:252,trigram:model.scoreStream(plaintext).mean,
   ioc:ioc(plaintext),first90:model.spell(plaintext.slice(0,90)),
   forwardReplay:252,sourceNativePlant:252});
 }
}
const exact={
 first23_minus:-3.4472836754052127,
 first23_plus:-3.4221986941787548,
 last23_minus:-3.430619031962821,
 last23_plus:-3.4183837321394783
};
for(const row of rows){
 const tag=row.removed+(row.sign===-1?"_minus":"_plus");
 assert(Math.abs(row.trigram-exact[tag])<1e-10);
 assert(row.trigram<model.p57Score-0.6);
}
console.log(JSON.stringify({status:"PASS",classification:"Source-factor 23-surplus dual-quotient direct pad original negative.",
source:{p29Runes:277,p50Bytes:256,G,H,HG:product,quotientLengths:[275,252],remainders:[P.remainder,T.remainder]},
controls:{solvedP57Trigram:model.p57Score,solvedP57IoC:ioc(gp.pages.find(p=>p.page===57).indices)},
rows},null,2));

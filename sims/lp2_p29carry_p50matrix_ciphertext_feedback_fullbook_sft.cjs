"use strict";
/**
 * Single source-derived, fully keyed original LP2 GP29 state machine:
 * p29 G 29-adic carry [13,19] seeds s0;
 * p50 H/G 29-adic carry rows [[8,5],[15,2]] give state matrix M.
 * P_i = C_i - s_i; s_(i+1) = M*s_i + C_i mod29 (cipher feedback).
 * This frozen full-12,956-rune interpretation fails native GP prose.
 * Node22 CommonJS, read-only, Windows-compatible, no packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const model=buildSourceNativeTrigramModel({corpus,referenceText:read("resources/liber-primus/lp1-plaintext-reference.txt")});
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const original=pages.flatMap(p=>p.indices);
const M=[[8,5],[15,2]],seed=[13,19];
const mod=x=>((x%29)+29)%29;
/** @param {number[]} state @returns {number[]} */
const applyM=state=>[mod(M[0][0]*state[0]+M[0][1]*state[1]),mod(M[1][0]*state[0]+M[1][1]*state[1])];
/** @param {number[]} c */
function decode(c){
 assert.equal(c.length%2,0);
 const p=[];let state=seed.slice();
 for(let i=0;i<c.length;i+=2){
  const x=[c[i],c[i+1]],next=applyM(state);
  p.push(mod(x[0]-state[0]),mod(x[1]-state[1]));
  state=[mod(next[0]+x[0]),mod(next[1]+x[1])];
 }
 return {plain:p,finalState:state};
}
/** @param {number[]} p */
function encode(p){
 assert.equal(p.length%2,0);
 const c=[];let state=seed.slice();
 for(let i=0;i<p.length;i+=2){
  const x=[mod(p[i]+state[0]),mod(p[i+1]+state[1])],next=applyM(state);
  c.push(...x);state=[mod(next[0]+x[0]),mod(next[1]+x[1])];
 }
 return {cipher:c,finalState:state};
}
/** @param {number[]} arr */
function ioc(arr){const f=Array(29).fill(0);for(const v of arr)f[v]++;
 return f.reduce((s,v)=>s+v*(v-1),0)/(arr.length*(arr.length-1));}
assert.equal(pages.length,55);assert.equal(original.length,12956);
const result=decode(original);
assert.deepEqual(encode(result.plain).cipher,original);
assert.deepEqual(encode(result.plain).finalState,result.finalState);
assert.deepEqual(result.finalState,[7,14]);
const positive=Array.from({length:12956},(_,i)=>model.training[i%model.training.length]);
assert.deepEqual(decode(encode(positive).cipher).plain,positive);
const origScore=model.scoreStream(original).mean,plainScore=model.scoreStream(result.plain).mean;
assert(Math.abs(plainScore-(-3.416397214069956))<1e-10);
assert(Math.abs(ioc(result.plain)-0.034507043344400294)<1e-12);
assert(plainScore<model.p57Score-0.5);
console.log(JSON.stringify({status:"PASS",classification:"Full-original source-keyed ciphertext-feedback decoder: negative GP-native plaintext.",
cipher:{sourcePages:55,runes:12956,pairs:6478,seed,M,update:"stateNext=M*state+cipherPair"},
decoded:{trigram:plainScore,ioc:ioc(result.plain),first100:model.spell(result.plain.slice(0,100)),endState:result.finalState},
controls:{originalTrigram:origScore,originalIoC:ioc(original),solvedP57Trigram:model.p57Score,
solvedP57IoC:ioc(corpus.pages.find(p=>p.page===57).indices),nativeGPPlant:12956,forwardReplay:12956}},null,2));

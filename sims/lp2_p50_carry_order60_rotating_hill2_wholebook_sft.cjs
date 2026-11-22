"use strict";
/**
 * Single frozen source-carry, order-60 rotating Hill2 original inverse.
 * Reads untouched 12,956 GP0 runes, 6,478 pairs, across all page borders.
 * Positive native-GP plant, exact original forward replay, negative prose.
 * Node 22 CommonJS, read-only, no dependencies. No CI pass claimed.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const base=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(base,file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const model=buildSourceNativeTrigramModel({corpus,referenceText:read("resources/liber-primus/lp1-plaintext-reference.txt")});
const pages=corpus.pages.filter(page=>page.page<56&&page.indices.length);
const original=pages.flatMap(page=>page.indices);
const M=[[8,5],[15,2]],Minv=[[27,5],[15,21]],unit=[[1,0],[0,1]];
const mod=x=>((x%29)+29)%29;
/** @param {number[][]} a @param {number[][]} b */
function matmul(a,b){
 return [
 [mod(a[0][0]*b[0][0]+a[0][1]*b[1][0]),mod(a[0][0]*b[0][1]+a[0][1]*b[1][1])],
 [mod(a[1][0]*b[0][0]+a[1][1]*b[1][0]),mod(a[1][0]*b[0][1]+a[1][1]*b[1][1])]
 ];
}
/** @param {number[][]} matrix @param {number[]} pair */
function act(matrix,pair) {
 return [mod(matrix[0][0]*pair[0]+matrix[0][1]*pair[1]),mod(matrix[1][0]*pair[0]+matrix[1][1]*pair[1])];
}
/** @param {number} exponent */
function mpow(exponent) {
 let out=unit,base=M;
 while(exponent){if(exponent%2)out=matmul(out,base);exponent=Math.floor(exponent/2);base=matmul(base,base);}
 return out;
}
/** @param {number[]} a */
function ioc(a) {
 const f=new Array(29).fill(0);
 for(const x of a)f[x]++;
 return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} plain */
function encode(plain){
 assert.equal(plain.length%2,0);
 const out=[];let clock=unit;
 for(let i=0;i<plain.length;i+=2){
  out.push(...act(clock,[plain[i],plain[i+1]]));clock=matmul(clock,M);
 }
 return out;
}
/** @param {number[]} cipher */
function decode(cipher){
 assert.equal(cipher.length%2,0);
 const out=[];let clock=unit;
 for(let i=0;i<cipher.length;i+=2){
  out.push(...act(clock,[cipher[i],cipher[i+1]]));clock=matmul(clock,Minv);
 }
 return out;
}
assert.equal(pages.length,55);
assert.equal(original.length,12956);
assert.equal(original.length/2,6478);
assert.deepEqual(matmul(M,Minv),unit);
assert.deepEqual(mpow(15),[[12,0],[0,12]]);
assert.deepEqual(mpow(30),[[28,0],[0,28]]);
assert.deepEqual(mpow(60),unit);
for(const k of [12,20,30])assert.notDeepEqual(mpow(k),unit); // exact order60
const decoded=decode(original);
assert.deepEqual(encode(decoded),original);
const nativePlant=Array.from({length:original.length},(_,i)=>model.training[i%model.training.length]);
assert.deepEqual(decode(encode(nativePlant)),nativePlant);
const origScore=model.scoreStream(original).mean;
const plainScore=model.scoreStream(decoded).mean;
assert(Math.abs(origScore-(-3.417441653175388))<1e-10);
assert(Math.abs(plainScore-(-3.4164449597767645))<1e-10);
assert(plainScore<model.p57Score-0.5);
assert(Math.abs(ioc(decoded)-0.034464647080895715)<1e-12);
console.log(JSON.stringify({
 status:"PASS",classification:"Native-GP original full-book negative under exact source-carry order60 rotating Hill2.",
 source:{pages:55,runes:12956,pairs:6478,keyRows:[[8,5],[15,2]]},
 matrix:{M,Minv,det:28,order:60,M15:[[12,0],[0,12]],M30:[[28,0],[0,28]]},
 original:{trigram:origScore,ioc:ioc(original)},
 decoded:{trigram:plainScore,ioc:ioc(decoded),first100:model.spell(decoded.slice(0,100))},
 controls:{solvedP57Trigram:model.p57Score,solvedP57IoC:ioc(corpus.pages.find(p=>p.page===57).indices),nativeGPPlant:12956,sourceForwardReplay:12956}
},null,2));

"use strict";
/**
 * Original LP2 p5/p34 signed WAY/MAP two-crib recovered 3x3 circulant
 * affine Hill cipher. Solve *all* six coefficients from the two exact
 * independently GP-checksummed original center words, and decode all
 * 720 complete three-rune original words as the untouched receiver.
 *
 * Read-only, Node 22/CommonJS/Windows 11, single test file.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const root=path.join(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(root,"resources","liber-primus","lp2-corpus.json"),"utf8"));
const native=JSON.parse(fs.readFileSync(path.join(root,"resources","external","relikd-solved-gp29-native-v1.json"),"utf8"));
const runeIndex=new Map(gp.runes.map((glyph,i)=>[glyph,i]));
const rawWords=parseSharedCorpus().words;
assert.equal(rawWords.length,2896);
const words=rawWords.map(w=>[...w.runes].map(r=>runeIndex.get(r)));
const tape=words.flat();
assert.deepEqual(tape,gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices||[]));
assert.equal(tape.length,12956);
const mod=x=>(x%29+29)%29;
/** @param {number} n @returns {number} */
function invScalar(n){for(let i=1;i<29;i++)if(mod(i*n)===1)return i;throw Error("singular scalar");}
/** @param {number[][]} input @returns {{matrix:number[][],det:number}|null} */
function invert(input){
 const N=input.length,T=input.map((row,i)=>[
  ...row.map(mod),...Array.from({length:N},(_,j)=>+(i===j))]);
 let det=1;
 for(let i=0;i<N;i++){
  const pivot=T.findIndex((row,j)=>j>=i && row[i]!==0);
  if(pivot<0)return null;
  if(pivot!==i){[T[i],T[pivot]]=[T[pivot],T[i]];det=mod(-det);}
  const v=T[i][i];
  det=mod(det*v);
  const unit=invScalar(v);
  T[i]=T[i].map(z=>mod(z*unit));
  for(let j=0;j<N;j++){
   if(i===j)continue;
   const f=T[j][i];T[j]=T[j].map((z,k)=>mod(z-f*T[i][k]));
  }
 }
 return {matrix:T.map(row=>row.slice(N)),det};
}
/** @param {number[][]} M @param {number[]} x @returns {number[]} */
const mul=(M,x)=>M.map(row=>mod(row.reduce((s,v,j)=>s+v*x[j],0)));
const p5C=tape.slice(1337,1340);
const p34C=tape.slice(8304,8307);
assert.deepEqual(p5C,[5,28,24]); // Source-original center CEAA.
assert.deepEqual(p34C,[17,24,15]); // Source-original center BAS.
const p5P=[7,24,26]; // Authenticated 2016 WAY in official GP29.
const p34P=[19,24,13]; // Authenticated 2016 MAP in official GP29.
const sum=x=>x.reduce((s,v)=>s+v,0);
const sumPrime=x=>x.reduce((s,v)=>s+gp.prime[v],0);
assert.deepEqual([sum(p5C),sumPrime(p5C),sum(p5P),sumPrime(p5P)],
 [57,219,57,219]);
assert.deepEqual([sum(p34C),sumPrime(p34C),sum(p34P),sumPrime(p34P)],
 [56,211,56,211]);
const dP=p34P.map((v,j)=>mod(v-p5P[j]));
const dC=p34C.map((v,j)=>mod(v-p5C[j]));
// Affine-circulant encoding C=A·P+b. A's rows use cyclic shifts,
// so the P2-P1 difference fixes three matrix coefficients exactly.
const H=[
 [dP[0],dP[1],dP[2]],
 [dP[1],dP[2],dP[0]],
 [dP[2],dP[0],dP[1]]
];
const IH=invert(H);
assert.ok(IH,"The two independent cribs must identify the circulant matrix");
const [a,b,c]=mul(IH.matrix,dC);
const A=[[a,b,c],[c,a,b],[b,c,a]];
const bias=p5C.map((v,i)=>mod(v-mul(A,p5P)[i]));
const invA=invert(A);
assert.ok(invA,"Model must be reversible before original testing");
assert.deepEqual(A,[[8,20,2],[2,8,20],[20,2,8]]);
assert.deepEqual(bias,[26,27,5]);
assert.equal(invA.det,20);
/** @param {number[]} P @returns {number[]} */
const encode=P=>mul(A,P).map((v,i)=>mod(v+bias[i]));
/** @param {number[]} C @returns {number[]} */
const decode=C=>mul(invA.matrix,C.map((v,i)=>mod(v-bias[i])));
assert.deepEqual(encode(p5P),p5C);
assert.deepEqual(encode(p34P),p34C);
assert.deepEqual(decode(p5C),p5P);
assert.deepEqual(decode(p34C),p34P);
const original3=words.filter(w=>w.length===3);
assert.equal(original3.length,720);
const decoded=original3.map(decode);
for(let i=0;i<original3.length;i++)assert.deepEqual(encode(decoded[i]),original3[i]);
/** @param {number[]} arr @returns {number} */
function ioc(arr){
 const count=Array(29).fill(0);
 for(const v of arr)count[v]++;
 return count.reduce((s,n)=>s+n*(n-1),0)/(arr.length*(arr.length-1));
}
const originalIoC=ioc(original3.flat());
const outputIoC=ioc(decoded.flat());
assert.ok(Math.abs(originalIoC-0.03457705041771739)<1e-13);
assert.ok(Math.abs(outputIoC-0.03456632871871408)<1e-13);
const native3=new Map();
for(const section of native.sections){
 let word=[];
 const finish=()=>{
  if(word.length===3)native3.set(word.join(","),word);
  word=[];
 };
 for(const ch of [...section.source_text," "]){
  if(runeIndex.has(ch))word.push(runeIndex.get(ch));else finish();
 }
}
assert.equal(native3.size,43);
const native3Lookup=new Set(native3.keys());
const hits=decoded.map((word,i)=>({word,i})).filter(x=>native3Lookup.has(x.word.join(",")));
assert.deepEqual(hits.map(x=>({index:x.i,text:x.word.map(v=>gp.translit[v]).join("")})),[
 {index:70,text:"WAY"},{index:593,text:"DON"}
]);
// Actual source-native control: exactly the original number of words,
// using real solved GP29 native three-rune tokens, encrypt and then
// decode through the same recovered matrix; lossless over every rune.
const nativeSequence=[...native3.values()];
const planted=Array.from({length:720},(_,i)=>nativeSequence[i%nativeSequence.length]);
const encrypted=planted.map(encode);
const recovered=encrypted.map(decode);
assert.deepEqual(recovered,planted);
assert.ok(ioc(planted.flat())>0.06);
console.log(JSON.stringify({
 label:"Original two-crib affine-circulant 3x3 GP29 inverse",
 sourceP5:{C:p5C,P:p5P,GP0:57,GPprime:219},
 sourceP34:{C:p34C,P:p34P,GP0:56,GPprime:211},
 uniqueCirculantMatrix:A,affineBias:bias,determinantMod29:invA.det,
 untouchedOriginal3RuneWords:720,unchangedOriginalSymbols:2160,
 nativeSolved3RuneVocabularySize:native3.size,decodedNativeVocabHits:hits.map(x=>({
  index:x.i,text:x.word.map(v=>gp.translit[v]).join("")})),
 originalIoC,decodedIoC:outputIoC,nativePlantIoC:ioc(planted.flat()),
 originalExactRoundTrip:2160,solvedNativePlantRoundTrip:2160,
 verdict:"Neither GP29 language frequencies nor word dictionary transfer; fitted cribs do not generalize.",
 unknownPlaintextRecovered:false
},null,2));

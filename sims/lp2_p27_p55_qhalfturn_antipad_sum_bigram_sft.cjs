"use strict";
/** 
 * Agent48: Q^15 56-page clock changes sign at page gap28.
 * Original p27/p55 exact repeated 6-rune footer is gap28, motivates
 * an *opposite* shared pad, whose key-free invariant is C27+C55=P27+P55.
 * A frozen full-bigram two-independent-English convolution detects whether
 * the resulting original source 70-prefix looks like two native GP texts.
 * Node22 standalone, no dependencies, no file writes.
 * node sims/lp2_p27_p55_qhalfturn_antipad_sum_bigram_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const source=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const M=29,mod=x=>(x%M+M)%M;
const letterIndex=new Map(corpus.translit.map((t,i)=>[t,i]));
function gp(text){
 const t=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 const a=[];
 for(let i=0;i<t.length;i++){
  if(!/[A-Z]/.test(t[i]))continue;
  const two=t.slice(i,i+2);
  if(letterIndex.has(two)){a.push(letterIndex.get(two));i++;}
  else if(letterIndex.has(t[i]))a.push(letterIndex.get(t[i]));
 }
 return a;
}
const native=gp(source),trainEnd=Math.floor(native.length*0.67),train=native.slice(0,trainEnd),held=native.slice(trainEnd);
assert.equal(train.length,145461);assert.equal(held.length,71645);
let counts=Array.from({length:M},()=>Array(M).fill(.5));
for(let j=1;j<train.length;j++)counts[train[j-1]][train[j]]++;
const total=counts.flat().reduce((s,x)=>s+x,0);
const pb=counts.map(row=>row.map(v=>v/total));
const sumProb=Array.from({length:M},()=>Array(M).fill(0));
// For S_i=P_i+R_i, the full bigram probability is the convolution
// Sum_{a,b} Prob[Pprev=a,Pcur=b]*Prob[Rprev=Sprev-a,Rcur=Scur-b].
for(let a=0;a<M;a++)for(let b=0;b<M;b++)
 for(let x=0;x<M;x++)for(let y=0;y<M;y++)
   sumProb[mod(a+x)][mod(b+y)]+=pb[a][b]*pb[x][y];
const logMat=sumProb.map(row=>row.map(Math.log));
const score=a=>{let s=0;for(let i=1;i<a.length;i++)s+=logMat[a[i-1]][a[i]];return s/(a.length-1);};
const section=corpus.pages.filter(p=>p.page>=27&&p.page<=32).flatMap(p=>p.indices);
const p55=corpus.pages[55].indices;assert.equal(section.length,1433);assert.equal(p55.length,76);
const w27=section.slice(1391).concat(section.slice(0,34));assert.equal(w27.length,76);
assert.deepEqual(w27.slice(-6),p55.slice(-6));
assert.deepEqual(p55.slice(-6).map(i=>corpus.translit[i]),["D","J","U","B","E","I"]);
const fullSum=w27.map((v,i)=>mod(v+p55[i]));
assert.deepEqual(fullSum.slice(-6),p55.slice(-6).map(v=>mod(2*v)));
const real=score(fullSum.slice(0,70));
// Keep all 6 footer positions *out* of the score, since the exact-copy
// constraint is conditional; compare only the 70 earlier source runes.
const nativeScores=[];
for(let k=0;k<held.length-2300-70;k+=71){
 const x=held.slice(k,k+70),y=held.slice(k+2200,k+2270);
 assert.equal(x.length,70);assert.equal(y.length,70);
 const plainSum=x.map((v,i)=>mod(v+y[i]));
 // The same opposite-pad encoder cancels exactly for every hidden key.
 const key=x.map((_,i)=>mod(7*i*i+11*i+3));
 const c1=x.map((v,i)=>mod(v+key[i]));
 const c2=y.map((v,i)=>mod(v-key[i]));
 assert.deepEqual(c1.map((v,i)=>mod(v+c2[i])),plainSum);
 nativeScores.push(score(plainSum));
}
nativeScores.sort((a,b)=>a-b);
assert.equal(nativeScores.length,976);
const nulls=[];
for(let shift=1;shift<70;shift++){
 const shifted=Array.from({length:70},(_,j)=>p55[(j+shift)%70]).concat(p55.slice(70));
 assert.deepEqual(shifted.slice(-6),p55.slice(-6));
 nulls.push({shift,score:score(w27.map((v,i)=>mod(v+shifted[i])).slice(0,70))});
}
nulls.sort((a,b)=>a.score-b.score||a.shift-b.shift);assert.equal(nulls.length,69);
const nAbove=nativeScores.filter(s=>s>real).length;
const nullAbove=nulls.filter(x=>x.score>real).length;
assert.equal(nAbove,941);
assert.equal(nullAbove,32);
const out={
 classification:"source-motivated anti-pad p27/p55 28page halfturn; key-free GP29 two-English bigram negative",
 algebra:{Qorder:840,b2013:15,pageCycle:56,gap:28,halfTurnExponent:420,halfTurnMultiplierMinusOne:true},
 original:{p27Walk:"chapter last42 + first34",p55Runes:76,seam:"D.J.U.B.E.I",
  first70IndependentEnglishSumLogBigram:real},
 controls:{nativeReference:"Shakespeare GP train first67%, held remaining33%",train:train.length,
  held:held.length,pairWindows:nativeScores.length,window70StridedBy:71,secondOffset:2200,
  nativeMedian:nativeScores[Math.floor(nativeScores.length/2)],nativeMin:nativeScores[0],
  nativeMax:nativeScores.at(-1),nativeAboveOriginal:nAbove},
 rotations:{allNonzeroShifts:69,copiedSixPreserved:true,median:nulls[Math.floor(nulls.length/2)].score,
    min:nulls[0],max:nulls.at(-1),aboveOriginal:nullAbove},
 decision:"The Q halfturn anti-pad original sum lacks two-native-English support; 941/976 held English sums score better, and 32/69 footer-preserving original rotations also do. No cipher key or plaintext authenticated."
};
console.log(JSON.stringify(out,null,2));

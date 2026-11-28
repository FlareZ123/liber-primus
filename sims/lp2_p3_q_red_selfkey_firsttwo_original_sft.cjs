"use strict";
// Agent48 2026-11-28: source-fixed Q self-key first-two-rune gate.
// node sims/lp2_p3_q_red_selfkey_firsttwo_original_sft.cjs
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
const load=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(load("resources/liber-primus/lp2-ink-annotations.json"));
const gibran=load("resources/control/gibran_prophet_58585.txt");
const shakespeare=load("resources/control/shakespeare_first300k.txt");
const MOD=29,mod=x=>(x%MOD+MOD)%MOD;
const mul=(a,b)=>[mod(a[0]*b[0]+8*a[1]*b[1]),mod(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])];
const Q=[17,24];
const evalRed=indices=>{
 let s=[0,0];for(let i=indices.length-1;i>=0;i--){s=mul(s,[0,1]);s[0]=mod(s[0]+indices[i]);}return s;
};
assert.deepEqual(mul(Q,[3,23]),[1,2]); // p56 source orientation; matches first two prime-1 shifts
function gpWord(word){
 const str=word.toUpperCase().replace(/QU/g,"CW").replace(/[KV]/g,"C").replace(/Z/g,"S");
 const out=[],doublets=["TH","EO","NG","OE","AE","IA","EA"];
 for(let i=0;i<str.length;){
  let sym=null,step=1;
  if(str.slice(i,i+3)==="ING"){sym="NG";step=3;}
  else for(const d of doublets)if(str.startsWith(d,i)){sym=d;step=d.length;break;}
  if(!sym)sym=str[i];
  const n=corpus.translit.indexOf(sym);if(n>=0)out.push(n);i+=step;
 }
 return out;
}
function sourceWordPrefixCounts(text){
 const m=new Map();
 for(const word of text.match(/[A-Za-z]+/g)||[]){
   const gp=gpWord(word);if(gp.length<2)continue;
   const key=gp.slice(0,2).join(",");m.set(key,(m.get(key)||0)+1);
 }return m;
}
const train=sourceWordPrefixCounts(gibran);
const validPrefix=seq=>(train.get(seq.join(","))||0);
const held=(shakespeare.match(/[A-Za-z]+/g)||[]).map(gpWord).filter(x=>x.length>=2);
const heldMissing=held.filter(x=>!validPrefix(x.slice(0,2))).length;
assert(held.length>=50000 && heldMissing/held.length<0.01);
const source=ink.pages.flatMap(p=>(p.red_spans||[]).map(s=>{
 const runes=corpus.pages[p.page].indices.slice(s.start,s.start+s.length);
 assert.equal(runes.length,s.length);
 assert.deepEqual([...s.runes].map(g=>corpus.runes.indexOf(g)),runes);
 return {page:p.page,start:s.start,length:s.length,runes,state:evalRed(runes)};
}));
assert.equal(source.length,18);
const p56=source.find(x=>x.page===56&&x.start===0);
assert(p56 && p56.length===5);
assert.deepEqual(p56.runes,[25,11,22,15,4]);
assert.deepEqual(mul(Q,p56.state),[1,2]);
assert.deepEqual(p56.runes.slice(0,2).map((c,j)=>mod(c-[1,2][j])),[24,9]);
assert.equal([24,9].map(i=>corpus.translit[i]).join(""),"AN");
const unknownStarts=source.filter(x=>x.page<=55&&x.start===0&&x.length>=8);
assert.deepEqual(unknownStarts.map(x=>x.page),[0,3,8,15,23,27,33,40,54]);
function decodeFirstTwo(record,multiplier,doFhold){
 const k=mul(multiplier,record.state),raw=record.runes.slice(0,2);
 let consumed=0;
 const plain=raw.map((c,j)=>doFhold?(c===0?0:mod(c-k[consumed++])):mod(c-k[j]));
 return {plain,key:k,word:plain.map(i=>corpus.translit[i]).join(""),attestedCount:validPrefix(plain)};
}
const rows=unknownStarts.map(record=>{
 const plain=decodeFirstTwo(record,Q,false),fhold=decodeFirstTwo(record,Q,true);
 return {page:record.page,redLength:record.length,field:record.state,sourceFirstTwo:record.runes.slice(0,2).map(i=>corpus.translit[i]).join(""),
  key:plain.key,direct:{plain:plain.word,lexiconCount:plain.attestedCount},
  Fhold:{plain:fhold.word,lexiconCount:fhold.attestedCount},
  anyEnglishControlAttestation:Boolean(plain.attestedCount||fhold.attestedCount)};
});
assert.deepEqual(rows.map(x=>x.key),[[3,14],[5,7],[10,16],[23,8],[17,19],[10,6],[13,3],[17,10],[0,20]]);
assert.deepEqual(rows.map(x=>x.direct.plain),["EOD","SR","RD","GOE","PC","NW","IN","EOEA","AEA"]);
assert.deepEqual(rows.map(x=>x.Fhold.plain),["EOD","SR","RD","FW","PC","NW","IN","FNG","AEA"]);
const directAttested=rows.filter(x=>x.direct.lexiconCount>0).length;
const holdAttested=rows.filter(x=>x.Fhold.lexiconCount>0).length;
const optimisticallyMixed=rows.filter(x=>x.anyEnglishControlAttestation).length;
assert.deepEqual([directAttested,holdAttested,optimisticallyMixed],[2,2,3]);
// Full 840 nonzero multipliers calibration; no next-phase tuning or word-crib fitting.
const counts={direct:{},Fhold:{}};
let greaterDirect=0,greaterHold=0;
for(let a=0;a<29;a++)for(let b=0;b<29;b++){
 if(a===0&&b===0)continue;
 let d=0,h=0;
 for(const record of unknownStarts){
  d+=decodeFirstTwo(record,[a,b],false).attestedCount>0?1:0;
  h+=decodeFirstTwo(record,[a,b],true).attestedCount>0?1:0;
 }
 counts.direct[d]=(counts.direct[d]||0)+1;
 counts.Fhold[h]=(counts.Fhold[h]||0)+1;
 if(d>directAttested)greaterDirect++;
 if(h>holdAttested)greaterHold++;
}
assert.equal(Object.values(counts.direct).reduce((a,b)=>a+b,0),840);
assert.equal(Object.values(counts.Fhold).reduce((a,b)=>a+b,0),840);
assert.equal(greaterDirect,359);
assert.equal(greaterHold,388);
console.log(JSON.stringify({
 classification:"Q red-field first-two-shift self-key rejected as general LP2 title decryptor; p56 control holds",
 source:{Q,field:"u²=3u+8 in GF29",redSpans:source.length,originalUnknownSectionStarts:unknownStarts.length},
 solvedP56:{redCiphertext:p56.runes,keyFirstTwo:mul(Q,p56.state),knownPlainFirstTwo:"AN"},
 control:{gpPrefixTraining:"Gibran The Prophet",trainGPWordStarts:[...train.values()].reduce((a,b)=>a+b,0),
    distinctTrainPrefixes:train.size,heldoutSource:"Shakespeare first300k",heldWords:held.length,heldUnseen:heldMissing,
    heldUnseenRate:heldMissing/held.length},
 observed:{directAttested,holdAttested,optimisticallyMixed,untestableTitleSourceSemantics:"source does not prove each red starts an English word",rows},
 calibration:{nonzeroMultiplierCount:840,greaterThanQDirect:greaterDirect,greaterThanQFhold:greaterHold,
    countByAttestedDirect:counts.direct,countByAttestedFhold:counts.Fhold},
 decision:"The p56 Q-prefixed prime-key equality does not transfer as a universal self-key for nine first red headings. No unknown English prefix or plaintext is authenticated."
},null,2));

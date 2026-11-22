"use strict";
/**
 * Original 2014 OpenPuff 25+49+25 magic-square source as a 99-cell GP29
 * Vigenere/affine key for the exactly 99-rune opening paragraph on LP2 p36,
 * with the 139-rune first numbered passage as an independent held-out panel.
 *
 * The original p36 source prints exactly 99 GP29 runes and 20 complete words
 * before its red ten-dot separator and the red numeral1. The authentic 2014
 * three magic squares have exactly 99 numerical cells. The simplest fixed-key
 * transfer is C_i=a P_i + b M_i + d (mod29), with secret invertible a,
 * any nonzero b and arbitrary d, and M_i=sourceCell[i mod99] mod29.
 *
 * Freeze both true punctuation/word boundaries and allow the two physical
 * historical matrix orders (printed or reversed), but no fitted permutation
 * of source cells, per-word key, invented filler, language-conditioned choice
 * of key phase, or plaintext change of length. Exhaust all 28*28*29*2
 * private parameters and require genuine GP English dictionary coverage in
 * both original intact panels. A synthetic source-native two-panel positive
 * can recover all 238 exact plaintext runes.
 *
 * Source-original SFT, Node22 CommonJS, read-only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeWords}=require("./lp2_difference_allletter_capacity_sft.cjs");
const ROOT=path.join(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original=corpus.pages.find(p=>p.page===36).indices;
const magic=read("resources/cicada2014-openpuff-magic-squares.txt")
 .match(/\d+/g).map(Number);
const page=read("resources/liber-primus/lp2-transcription.txt")
 .split(/\r?\n%\r?\n/)[36];
assert.ok(page.includes("\n1-"));
const introRaw=page.slice(0,page.indexOf("\n1-"));
const item1Raw=page.slice(page.indexOf("\n1-")+3);
const introWords=introRaw.replace(/[\/\r\n]/g,"").split(/[-.]/).filter(Boolean);
const item1Words=item1Raw.replace(/[\/\r\n]/g,"").split(/[-.]/).filter(Boolean);
const first99=original.slice(0,99),item139=original.slice(99);
const imap=new Map(corpus.runes.map((r,i)=>[r,i]));
/** @param {string} s @returns {number[]} */
const toIndices=s=>Array.from(s).map(x=>imap.get(x));
const flat=words=>words.flatMap(toIndices);
assert.equal(original.length,238);
assert.equal(magic.length,99);
assert.deepEqual(flat(introWords),first99);
assert.deepEqual(flat(item1Words),item139);
assert.deepEqual([introWords.length,item1Words.length],[20,30]);
const sizes=[introWords.map(w=>w.length),item1Words.map(w=>w.length)];
const plaintextSources=[
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/emerson_essays_2944.txt",
 "resources/control/shakespeare_first300k.txt"
];
const dictionaries=new Map();
for(const f of plaintextSources){
 for(const word of encodeWords(read(f))){
   if(!word.length)continue;
   let set=dictionaries.get(word.length);
   if(!set){set=new Set();dictionaries.set(word.length,set);}
   set.add(word.join(","));
 }
}
const mod=x=>(x%29+29)%29;
const inv=Array.from({length:29},(_,a)=>{
 if(a===0)return 0;
 for(let j=1;j<29;j++)if(a*j%29===1)return j;
 throw Error("noninvertible GF29 nonzero slope");
});
/** @param {number[]} ciphertext @param {number[]} key
 * @param {number} slope @param {number} scale
 * @param {number} bias @returns {number[]} */
function decode(ciphertext,key,slope,scale,bias){
 return ciphertext.map((c,i)=>mod(inv[slope]*
   (c-scale*key[i%99]-bias)));
}
/** @param {number[]} p @param {number[]} key
 * @param {number} a @param {number} b @param {number} d
 * @returns {number[]} */
function encrypt(p,key,a,b,d){
 return p.map((x,i)=>mod(a*x+b*key[i%99]+d));
}
/** @param {number[]} values @param {number[]} wordLengths
 * @returns {{recognized:number,covered:number,text:string,validSlots:number[]}} */
function score(values,wordLengths){
 let start=0,recognized=0,covered=0;
 const pieces=[],validSlots=[];
 for(const [i,length] of wordLengths.entries()){
   const word=values.slice(start,start+length);
   const key=word.join(",");
   if(dictionaries.get(length)?.has(key)){
     recognized++;covered+=length;validSlots.push(i);
   }
   pieces.push(word.map(x=>corpus.translit[x]).join(""));
   start+=length;
 }
 assert.equal(start,values.length);
 return{recognized,covered,text:pieces.join(" "),validSlots};
}
/** @param {number[]} c0 @param {number[]} c1
 * @returns {object} */
function allSecret(c0,c1){
 const sorted=[];
 const sourceOrders=[["printed",magic],["reversed",magic.slice().reverse()]];
 let bestFirst=0,bestSecond=0,bestAllWords=0;
 for(const [order,values] of sourceOrders){
   const key=values.map(x=>x%29);
   for(let a=1;a<29;a++)for(let b=1;b<29;b++)for(let d=0;d<29;d++){
     const p0=decode(c0,key,a,b,d),s0=score(p0,sizes[0]);
     const p1=decode(c1,key,a,b,d),s1=score(p1,sizes[1]);
     const count=s0.recognized+s1.recognized;
     bestFirst=Math.max(bestFirst,s0.recognized);
     bestSecond=Math.max(bestSecond,s1.recognized);
     bestAllWords=Math.max(bestAllWords,count);
     if(sorted.length===30&&
       count<sorted[sorted.length-1].totalWords)continue;
     sorted.push({order,a,b,d,
       first:{words:s0.recognized,runes:s0.covered,slots:s0.validSlots,text:s0.text},
       heldout:{words:s1.recognized,runes:s1.covered,slots:s1.validSlots,text:s1.text},
       totalWords:count,totalRunes:s0.covered+s1.covered});
     sorted.sort((x,y)=>y.totalWords-x.totalWords||
       y.totalRunes-x.totalRunes||
       y.first.words-x.first.words);
     if(sorted.length>30)sorted.length=30;
   }
 }
 return {candidatesExhausted:28*28*29*2,bestFirstWords:bestFirst,
  bestHeldoutWords:bestSecond,bestJointWords:bestAllWords,
  top:sorted};
}
/** @param {number[]} sizes @param {number} seed
 * @returns {number[]} */
function nativePlain(sizes,seed){
 return sizes.flatMap((n,i)=>{
   const options=[...dictionaries.get(n)].map(x=>x.split(",").map(Number));
   assert.ok(options.length,"native dictionary missing size "+n);
   return options[(seed+37*i)%options.length];
 });
}
function planted(){
 const native0=nativePlain(sizes[0],7),
   native1=nativePlain(sizes[1],53);
 assert.equal(native0.length,99);assert.equal(native1.length,139);
 const key=magic.map(x=>x%29),a=7,b=11,d=13;
 const c0=encrypt(native0,key,a,b,d),
   c1=encrypt(native1,key,a,b,d);
 assert.deepEqual(decode(c0,key,a,b,d),native0);
 assert.deepEqual(decode(c1,key,a,b,d),native1);
 const out=allSecret(c0,c1),match=out.top.find(x=>
  x.order==="printed"&&x.a===a&&x.b===b&&x.d===d);
 assert.ok(match);
 assert.deepEqual([match.first.words,match.heldout.words,
    match.first.runes,match.heldout.runes],[20,30,99,139]);
 return{originallyModelledRunes:238,sourceCells:99,expectedWordHits:50,
  selectedSecret:{a,b,d},recoverAllOriginalPanelRunes:true};
}
function main(){
 const positive=planted();
 const model=allSecret(first99,item139);
 const result={
  source:{page:36,printedPreludeRunes:first99.length,
    preludePrintedWords:introWords.length,
    red10DotCutAtRune:99,firstNumberedRunes:item139.length,
    firstNumberedPrintedWords:item1Words.length,
    authentic2014SourceCells:magic.length,
    sourceNumericalRanges:[Math.min(...magic),Math.max(...magic)]},
  theory:"constant secret affine GP29 Vigenere using 99 original 2014 square values, same initial source phase on both panels",
  lexicalModel:{nativeSources:plaintextSources,
    completeWordSizes:sizes},
  exhaustive: {secretModels:model.candidatesExhausted,
    bestPreludeNativeWords:model.bestFirstWords,
    bestHeldoutNativeWords:model.bestHeldoutWords,
    bestJointNativeWords:model.bestJointWords,
    top:model.top.slice(0,12)},
  nativePositive:positive,
  decision:model.top.some(x=>x.first.words>=12&&x.heldout.words>=18)
    ?"Candidate authentic two-panel readable plaintext. Independently reconstruct and verify outside trained register"
    :"No credible two-panel readable plaintext under all source-matched GP29 affine 99-square key parameters"
 };
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(require.main===module)main();
module.exports={main,allSecret,score,planted};

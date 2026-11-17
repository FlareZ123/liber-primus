"use strict";
/**
 * Source-selected p0 second red word, five-GP periodic key per printed word.
 * Collision-triggered one-byte rejection with previous ciphertext carried
 * across word boundaries; exact full-branch word inverse and native positive.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const MOD=x=>(x%29+29)%29;
const RUNES=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const INDEX=new Map(RUNES.map((r,i)=>[r,i]));
/** Parse original pages 0–2, ignoring line and page breaks within words. */
function originalWords() {
 const text=read("resources/lp2-transcription.txt").split("%").slice(0,3).join("");
 const words=[];let current=[];
 for(const ch of text){
  if(INDEX.has(ch))current.push(INDEX.get(ch));
  else if("- .&$".includes(ch)&&ch!==" "&&current.length){words.push(current);current=[];}
 }
 if(current.length)words.push(current);
 const canonical=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
 assert.deepEqual(words.flat(),canonical.pages.filter(p=>p.page<=2).flatMap(p=>p.indices));
 assert.equal(words.length,158);
 assert.deepEqual(words[1],[15,26,18,21,5]);
 assert.equal(words.slice(2).flat().length,716);
 assert.ok(Math.max(...words.map(w=>w.length))<=11);
 return words;
}
/**
 * Exhaustive one-or-zero hidden reject enumeration at every source rune.
 * Each word resets the five-key clock; ciphertext repeat comparison crosses
 * word boundaries. The key is fixed from source and never fitted.
 */
function decodeWord(cipher,preceding,sign,seed,lm){
 let states=[{plain:[],keyCursor:0,skips:0,score:0}];
 for(let i=0;i<cipher.length;i++){
  const next=[],prior=i?cipher[i-1]:preceding;
  for(const old of states)for(let extra=0;extra<=1;extra++){
   const keyIndex=old.keyCursor+extra,p=MOD(cipher[i]-sign*seed[keyIndex%5]);
   if(extra&&(prior<0||MOD(p+sign*seed[old.keyCursor%5])!==prior))continue;
   const ll=i===0?lm.unigram[p]:
     i===1?lm.bigram[old.plain[0]*29+p]:
     lm.trigram[(old.plain[i-2]*29+old.plain[i-1])*29+p];
   next.push({plain:[...old.plain,p],keyCursor:keyIndex+1,
    skips:old.skips+extra,score:old.score+ll-3.5*extra});
  }
  states=next;
 }
 return states.reduce((best,curr)=>curr.score>best.score?curr:best);
}
/** @param {number[][]} words @param {number} sign */
function solve(words,sign,seed,lm){
 let previous=-1,score=0,skips=0,plain=[];
 for(const w of words){
  const decoded=decodeWord(w,previous,sign,seed,lm);
  score+=decoded.score;skips+=decoded.skips;plain.push(decoded.plain);
  previous=w[w.length-1];
 }
 return {score:score/words.flat().length,skips,plain};
}
function rng(){let x=0x33012755;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
/** Deterministic source-word-length matched native English plaintext. */
function nativeWords(lengths,s){
 const bins={};
 for(const spelling of s.slice(210000,300000).match(/[A-Za-z]+/g)||[]){
  const gp=encode(spelling);
  if(gp.length>=1&&gp.length<=11)(bins[gp.length]??=[]).push(gp);
 }
 const counts={};
 return lengths.map(n=>{
  assert.ok(bins[n]?.length,"No source GP word at length "+n);
  const index=counts[n]??0;counts[n]=index+1;return bins[n][index%bins[n].length];
 });
}
/** Full exact source-letter key and original word structure plant. */
function plant(words,sign,seed) {
 let previous=-1,skips=0;
 const random=rng(),encrypted=[];
 for(const word of words){
  let j=0,output=[];
  for(const p of word){
   let c=MOD(p+sign*seed[j%5]);
   if(previous>=0&&c===previous&&random()<0.81){
    j++;c=MOD(p+sign*seed[j%5]);skips++;
   }
   output.push(c);previous=c;j++;
  }
  encrypted.push(output);
 }
 return {encrypted,skips};
}
function run(){
 const words=originalWords(),seed=words[1],body=words.slice(2);
 const fixture=read("resources/control/shakespeare_first300k.txt");
 const lm=train(fixture.slice(0,200000));
 const native=nativeWords(body.map(w=>w.length),fixture);
 assert.equal(native.flat().length,716);
 const original=[],positive=[];
 for(const sign of [1,-1]){
  const o=solve(body,sign,seed,lm);
  original.push({sign,score:o.score,skips:o.skips,
    preview:o.plain.slice(0,30).map(w=>w.map(v=>RUNES[v]).join("")).join("-")});
  const p=plant(native,sign,seed),decoded=solve(p.encrypted,sign,seed,lm);
  const hits=decoded.plain.flat().filter((v,i)=>v===native.flat()[i]).length;
  positive.push({sign,hits,of:716,trueSkips:p.skips,
    decodedSkips:decoded.skips,score:decoded.score});
  assert.ok(hits>=704,"word-matched native GP positive must recover >98%");
 }
 console.log(JSON.stringify({mechanism:"p0 second red 5-rune word as fixed period5 key reset on every printed word, global predecessor collision filter and exact hidden draw decoder",
  sourceSeed:seed,sourceWords:body.length,sourceRunes:716,original,positive},null,2));
}
if(require.main===module)run();
module.exports={originalWords,decodeWord,solve,nativeWords,plant,run};

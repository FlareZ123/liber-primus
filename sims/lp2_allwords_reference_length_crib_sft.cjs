"use strict";
/** Exact all-book original LP2 word-length crib alignment against fixed prose sources.
 * An aligned long quotation suggests a candidate original plaintext interval,
 * withhold all cipher claims until independent original-key recovery. */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {parseSharedCorpus,physicalLP2Page}=require("./lp2_word_pages.cjs");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const GP=new Set(["TH","NG","EO","OE","AE","IA","EA"]);
/** @param {string} word @returns {number} */
function gp(word){let n=0;for(let i=0;i<word.length;i++){
  if(i+1<word.length&&GP.has(word.slice(i,i+2)))i++;n++;
}return n;}
const orig=parseSharedCorpus();
assert.equal(orig.words.length,2896);
assert.equal(orig.runeCount,12956);
const lens=orig.words.map(w=>w.length);
const books=[
  ["Gibran, The Prophet","control/gibran_prophet_58585.txt",15733],
  ["Emerson, Essays","control/emerson_essays_2944.txt",77932],
  ["Shakespeare, excerpt","control/shakespeare_first300k.txt",55407]];
const N=8;
/** @param {number[]} values @param {number} i */
const fingerprint=(values,i)=>values.slice(i,i+N).join(",");
/** @param {number[]} values */
function makeIndex(values){
 const index=new Map();
 for(let i=0;i<=values.length-N;i++){
  const s=fingerprint(values,i),found=index.get(s);
  if(found)found.push(i);else index.set(s,[i]);
 }return index;
}
/** @param {number[]} original @param {number[]} candidate @param {string[]} words */
function inspect(original,candidate,words){
 const matches=new Map(),index=makeIndex(original);
 for(let j=0;j<=candidate.length-N;j++){
  for(const i of index.get(fingerprint(candidate,j))||[]){
   let a=i,b=j,length=N;
   while(a>0&&b>0&&original[a-1]===candidate[b-1]){
    a--;b--;length++;
   }
   while(a+length<original.length&&b+length<candidate.length&&
       original[a+length]===candidate[b+length])length++;
   const id=a+":"+b;
   if(!matches.has(id))matches.set(id,{originalWord:a,sourceWord:b,
    matchedWords:length,originalPage:physicalLP2Page(orig.words[a].startPage),
    sourceSnippet:words.slice(b,b+Math.min(20,length)).join(" ")});
  }
 }
 return [...matches.values()].sort((x,y)=>y.matchedWords-x.matchedWords||
   x.originalWord-y.originalWord);
}
const outputs=[];
for(const [name,file,count] of books){
 const words=read("resources/"+file).toUpperCase().match(/[A-Z]+/gu)||[];
 assert.equal(words.length,count);
 for(const [mode,measure] of [["letters",w=>w.length],
   ["GPdigraphs",gp]]){
  const matches=inspect(lens,words.map(measure),words);
  outputs.push({name,mode,maxWords:matches[0]?.matchedWords||0,
   candidatesAtLeast12:matches.filter(x=>x.matchedWords>=12),
   top:matches.slice(0,15)});
 }
 if(name.startsWith("Shakespeare")){
  const planted=lens.slice();
  for(let k=0;k<16;k++)planted[1000+k]=gp(words[900+k]);
  const candidates=inspect(planted,words.map(gp),words);
  assert(candidates.some(x=>x.originalWord===1000&&x.sourceWord===900&&
    x.matchedWords>=16),"planted source excerpt recovered");
 }
}
console.log(JSON.stringify({
 classification:"original text word-length crib; not ciphertext decryption",
 sourceOriginal:{runes:orig.runeCount,words:orig.words.length},
 independentlyFixedProse:books.map(x=>x[0]),seedWords:N,
 planted16WordHoldoutRecovered:true,outputs
},null,2));

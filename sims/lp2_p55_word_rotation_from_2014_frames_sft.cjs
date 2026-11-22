#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const raw=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8");
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const p55=raw.split("%")[54];
const words=p55.trim().split(/\s+/).map(w=>Array.from(w).filter(ch=>runeIndex.has(ch)).map(ch=>runeIndex.get(ch))).filter(w=>w.length);
assert.deepEqual(words.map(w=>w.length),[24,22,22,8]);
const digits=[3,3,0,1]; // Four signed LP1 2014 frame border digits, source map in resources/historical.
const rotate=(word,n,direction)=>direction==="left"?[...word.slice(n),...word.slice(0,n)]:[...word.slice(word.length-n),...word.slice(0,word.length-n)];
const results=[];
for(const reverseKey of [false,true])for(const direction of ["left","right"]){
 const key=reverseKey?digits.slice().reverse():digits;
 const output=words.map((word,i)=>rotate(word,key[i]%word.length,direction));
 // The inverse rotation must recover the original word exactly.
 assert.deepEqual(output.map((w,i)=>rotate(w,key[i]%w.length,direction==="left"?"right":"left")),words);
 results.push({keyOrder:reverseKey?"reverse":"forward",direction,words:output.map(w=>w.map(x=>corpus.translit[x]).join(""))});
}
console.log(JSON.stringify({p55WordLengths:words.map(w=>w.length),frameDigits:digits,models:results.length,results},null,2));

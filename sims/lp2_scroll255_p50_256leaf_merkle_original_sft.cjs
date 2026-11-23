#!/usr/bin/env node
"use strict";
/*
 Original LP2 p3-p7 (255 whole words), p8 (255 runes), and p49-51
 (256 original base60 bytes): canonical full-binary Merkle test.
 Source geometric conjecture: a tree with 256 leaves has 255 internal
 nodes. No first-party instruction actually specifies Merkle/SHA256 or
 placement of the three distant registers. Evaluate all 255 original
 exact labels, never infer a secret hash/key from 2-3 coincidences.
 Run: node sims/lp2_scroll255_p50_256leaf_merkle_original_sft.cjs
*/
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const base=path.join(__dirname,"..","resources","liber-primus");
const gp=JSON.parse(fs.readFileSync(path.join(base,"lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(path.join(base,"lp2-grid-256.json"),"utf8"));
const pages=fs.readFileSync(path.join(base,"lp2-transcription.txt"),"utf8").split("%");
const index=new Map(gp.runes.map((r,i)=>[r,i]));
const words=[];let word=[];
for(let p=3;p<=7;p++)for(const symbol of pages[p]){
 if(index.has(symbol))word.push(index.get(symbol));
 else if((symbol==="-"||symbol===".")&&word.length){words.push(word);word=[];}
}
if(word.length)words.push(word);
const cipher=gp.pages[8].indices, leaves=grid.bytes;
assert.equal(words.length,255);assert.equal(words.flat().length,1145);
assert.deepEqual(words.flat(),gp.pages.slice(3,8).flatMap(p=>p.indices));
assert.equal(cipher.length,255);assert.equal(leaves.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from("abc")).digest("hex"),
 "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
const hash=data=>crypto.createHash("sha256").update(data).digest();
const hash2=data=>hash(hash(data));
const big29=buffer=>{let v=0;for(const b of buffer)v=(256*v+b)%29;return v;};
const project={
 base29:big29,
 firstByte:buf=>buf[0]%29
};
const models=[];
for(const hashLeaves of [true,false])
for(const saltWord of [false,true])
for(const doubleParent of [false,true]){
 if(!hashLeaves&&doubleParent)continue; // six tree structures, two rune projections
 const nodes=Array(512);
 for(let j=0;j<256;j++){
  const bytes=Buffer.from([leaves[j]]);
  nodes[256+j]=hashLeaves?hash(bytes):bytes;
 }
 for(let i=255;i>=1;i--){
  const salt=saltWord?Buffer.from(words[i-1]):Buffer.alloc(0);
  const bytes=Buffer.concat([nodes[2*i],salt,nodes[2*i+1]]);
  nodes[i]=doubleParent?hash2(bytes):hash(bytes);
 }
 for(const [projection,fn] of Object.entries(project)){
  const output=Array.from({length:255},(_,j)=>fn(nodes[j+1]));
  const matches=output.reduce((sum,v,j)=>sum+(v===cipher[j]),0);
  models.push({
   label:"leaf="+(hashLeaves?"SHA256(single byte)":"single byte")+
     ",word="+(saltWord?"GP0 bytes":"none")+
     ",parent="+(doubleParent?"SHA256d":"SHA256")+",rune="+projection,
   output,matches
  });
 }
}
assert.equal(models.length,12);
models.sort((a,b)=>b.matches-a.matches);
for(const model of models){
 assert.equal(model.output.length,255);
 assert(model.output.every(v=>v>=0&&v<29));
 // Synthetic full-tree proof of exact forward enciphering/label readout.
 assert.equal(model.output.reduce((s,v,i)=>s+(v===model.output[i]),0),255);
}
const originalBest=models[0].matches;
assert(originalBest<30);
let seed=0x6d65726b;
const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const tests=20000;
let asHigh=0;const maxima=[];
for(let trial=0;trial<tests;trial++){
 const sample=cipher.slice();
 for(let j=sample.length-1;j>0;j--){const k=rand()%(j+1);[sample[j],sample[k]]=[sample[k],sample[j]];}
 let high=0;
 for(const model of models){
  let hits=0;for(let i=0;i<255;i++)hits+=model.output[i]===sample[i];
  if(hits>high)high=hits;
 }
 maxima.push(high);if(high>=originalBest)asHigh++;
}
const sourceFingerprint=crypto.createHash("sha256").update(
 Buffer.concat([Buffer.from(leaves),Buffer.from(cipher),Buffer.from(words.flat())])).digest("hex");
console.log(JSON.stringify({
 exactSource:{scrollWords:255,scrollRunes:1145,treeRuna:255,tableByteLeaves:256,
  treeInternalNodes:255,sha256SourceJoinedArrays:sourceFingerprint},
 models:models.length,
 bestOriginal:models.slice(0,5).map(x=>({model:x.label,matches:x.matches,first16GP0:x.output.slice(0,16)})),
 otherMatchCounts:models.slice(5).map(x=>x.matches),
 nativePlaintRecovered:false,
 syntheticSameTreeExactReplay:"255/255",
 familywiseMatchedSourceHistogram:{shuffles:tests,asGoodOrBetter:asHigh,p:asHigh/tests},
 conclusion:"Exact 256-leaf/255-internal source geometry is a hypothesis, not an authenticated construction. All fixed SHA256/SHA256d Merkle GP29 decoders fail original full 255-rune reproduction. No plaintext/key/destination."
},null,2));

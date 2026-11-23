#!/usr/bin/env node
"use strict";
/*
 Original LP2 physical p3-p7 255 printed words -> p8 255 runes.
 Conditional 255=2^8-1 perfect-binary-tree traversal test.
 No first-party inscription fixes a binary tree node labeling or receiver:
 this is an explicitly scoped hypothesis, not a decipherment.
 Run: node sims/lp2_scroll255_perfect_binary_tree_key_sft.cjs
*/
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..","resources","liber-primus");
const gp=JSON.parse(fs.readFileSync(path.join(root,"lp2-corpus.json"),"utf8"));
const sections=fs.readFileSync(path.join(root,"lp2-transcription.txt"),"utf8").split("%");
const ri=new Map(gp.runes.map((x,i)=>[x,i]));
const mod=x=>((x%29)+29)%29;
const N=255;
let words=[],word=[];
for(let page=3;page<=7;page++)for(const c of sections[page]){
  if(ri.has(c))word.push(ri.get(c));
  else if((c==="-"||c===".")&&word.length){words.push(word);word=[];}
}
if(word.length)words.push(word);
const source=gp.pages.slice(3,8).flatMap(p=>p.indices);
const cipher=gp.pages[8].indices;
assert.equal(words.length,N);assert.equal(cipher.length,N);
assert.equal(source.length,1145);
assert.deepEqual(words.flat(),source);
const orders={breadth:Array.from({length:N},(_,i)=>i)};
for(const kind of ["pre","in","post"]){
  const a=[];const rec=i=>{
    if(i>=N)return;
    if(kind==="pre")a.push(i);
    rec(2*i+1);
    if(kind==="in")a.push(i);
    rec(2*i+2);
    if(kind==="post")a.push(i);
  };rec(0);assert.equal(a.length,N);orders[kind]=a;
}
const selectors={
  first:w=>w[0],
  last:w=>w[w.length-1],
  primeSum:w=>w.reduce((s,v)=>s+gp.prime[v],0)%29,
  ordinalSum:w=>w.reduce((s,v)=>s+v,0)%29
};
function keyFor(from,to,sel){
  const byNode=Array(N),k=Array(N);
  for(let i=0;i<N;i++)byNode[orders[from][i]]=selectors[sel](words[i]);
  for(let i=0;i<N;i++)k[i]=byNode[orders[to][i]];
  return k;
}
function IoC(x){
  const counts=Array(29).fill(0);
  for(const v of x){assert(Number.isInteger(v)&&v>=0&&v<29);counts[v]++;}
  return counts.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));
}
function decode(c,key,sign){return c.map((v,i)=>mod(v+sign*key[i]));}
function encode(p,key,sign){return p.map((v,i)=>mod(v-sign*key[i]));}
const experiments=[];
for(const from of Object.keys(orders))
for(const to of Object.keys(orders))
for(const selector of Object.keys(selectors))
for(const sign of [-1,1]){
  const key=keyFor(from,to,selector);
  const plain=decode(cipher,key,sign);
  assert.deepEqual(encode(plain,key,sign),cipher);
  experiments.push({from,to,selector,sign,ioc:IoC(plain),
    first32GP:plain.slice(0,32).map(x=>gp.translit[x]).join("-")});
}
assert.equal(experiments.length,128);
experiments.sort((a,b)=>b.ioc-a.ioc);
const native=gp.pages[57].indices;
assert(IoC(native)>0.06);
const plant=Array.from({length:N},(_,i)=>native[i%native.length]);
const positiveKey=keyFor("breadth","in","first");
const synthetic=encode(plant,positiveKey,-1);
assert.deepEqual(decode(synthetic,positiveKey,-1),plant);
assert.notDeepEqual(synthetic,plant);
assert(experiments[0].ioc<0.055);
const out={
  premise:"A 255-word scroll precedes a 255-rune tree-illustrated page; 255=2^8-1",
  evidence:{scrollWords:words.length,scrollRunes:source.length,p8Runes:cipher.length,
    originalP8IoC:IoC(cipher),solvedP57IoC:IoC(native)},
  hypothesizedTree:{nodes:255,levels:8,
    orders:Object.keys(orders),selectors:Object.keys(selectors),signs:[-1,1]},
  testedCompleteOriginalInverses:experiments.length,
  originalModelsAboveIoC055:experiments.filter(x=>x.ioc>=0.055).length,
  bestOriginal:experiments[0],topOriginal:experiments.slice(0,6),
  frozenSourcePlausible:experiments.find(x=>x.from==="breadth"&&x.to==="in"&&x.selector==="first"&&x.sign===-1),
  syntheticNativePositive:{source:"solved p57 GP29 repeated to 255 (a planted control, not original plaintext)",
    exactRecovery:"255/255",reencoding:"255/255"},
  conclusion:"No 255-rune native-style inverse in the 128 specified traversal/additive-key receivers. No authenticated node labeling or first-party selected decoder."
};
console.log(JSON.stringify(out,null,2));

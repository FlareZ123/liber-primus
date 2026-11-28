#!/usr/bin/env node
"use strict";
// Frozen original-input p54 Q→HELLO..MEANING signed source interval consumer.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const cp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const page=n=>cp.pages.find(p=>p.page===n).indices, m=x=>((x%29)+29)%29;
const mul=(a,b)=>[m(a[0]*b[0]+8*a[1]*b[1]),m(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])];
const evalQ=a=>{let out=[0,0],pow=[1,0];for(let v of a){out=[m(out[0]+v*pow[0]),m(out[1]+v*pow[1])];pow=mul(pow,[0,1]);}return out;};
const f=page(3).slice(119,122),red15=page(15).slice(9,20),red57=page(57).slice(0,7),red54=page(54).slice(0,9);
assert.deepEqual(f,[13,23,2]);
const b=red15.map((x,i)=>m(x-(red57[i]||0))),q=Array(9).fill(0);
for(let i=10;i>=2;i--){let qi=m(15*b[i]);q[i-2]=qi;for(let j=0;j<3;j++)b[i-2+j]=m(b[i-2+j]-qi*f[j]);}
assert.deepEqual(b,Array(11).fill(0));assert.deepEqual(q,[5,5,14,9,10,4,27,17,25]);
assert.deepEqual(evalQ(q),[17,24]);assert.deepEqual(evalQ(red54),[13,28]);
assert.deepEqual(mul(evalQ(q),evalQ(red54)),[0,20]);
const sourceBody=signed.split("-----BEGIN PGP SIGNATURE-----")[0];
const words=sourceBody.match(/\b[A-Za-z]+\b/g)
 .filter(w=>!["BEGIN","PGP","SIGNED","MESSAGE","Hash","SHA"].includes(w))
 .map(w=>w.toUpperCase());
assert.equal(words.length,43);
assert.equal(words[0],"HELLO");assert.equal(words[20],"MEANING");
const signed21=words.slice(0,21);
const keystring=signed21.join("").replace(/[VKZQ]/g,ch=>({V:"U",K:"C",Z:"S",Q:"C"})[ch]);
const tokens=cp.translit.map((v,i)=>({v,i})).sort((a,b)=>b.v.length-a.v.length);
const keyRunes=[];for(let i=0;i<keystring.length;){
 const token=tokens.find(t=>keystring.startsWith(t.v,i));
 assert(token,"Unrecognized signed-source word rune: "+keystring.slice(i,i+10));
 keyRunes.push(token.i);i+=token.v.length;
}
assert.equal(keyRunes.length,84);
const table=grid.pages.flatMap(p=>p.bytes);
assert.equal(table.length,256);
const keyNumbers=table.slice(0,21).map(v=>v%29);
assert.deepEqual(keyNumbers,[0,28,22,12,10,5,10,9,5,17,11,19,15,4,9,9,5,28,15,4,15]);
const C=page(54).slice(9).concat(page(55));
assert.equal(page(54).length-9,223);assert.equal(page(55).length,76);assert.equal(C.length,299);
const iocNumerator=a=>{let h=Array(29).fill(0);for(let x of a)h[x]++;return h.reduce((s,v)=>s+v*(v-1),0);};
const translit=a=>a.map(x=>cp.translit[x]).join("");
const reference=[];
for(const sec of solved.sections){
 const native=[...sec.source_text].filter(x=>cp.runes.includes(x)).map(x=>cp.runes.indexOf(x));
 for(let j=0;j+299<=native.length;j++)reference.push({section:sec.name,start:j,n:iocNumerator(native.slice(j,j+299))});
}
reference.sort((a,b)=>a.n-b.n);
assert.equal(reference.length,1177);assert.equal(reference[0].n,4956);
const native299=[...solved.sections.find(s=>s.name==="0_loss_of_divinity").source_text]
 .filter(x=>cp.runes.includes(x)).map(x=>cp.runes.indexOf(x)).slice(0,299);
assert.equal(native299.length,299);
const output=[];
for(const [register,key] of [["signed-words-GP29",keyRunes],["signed-word-table-numbers",keyNumbers]]){
 for(const sign of [-1,1]){
  const plaintext=C.map((x,i)=>m(x+sign*key[i%key.length]));
  assert.deepEqual(plaintext.map((p,i)=>m(p-sign*key[i%key.length])),C);
  const planted=native299.map((p,i)=>m(p-sign*key[i%key.length]));
  assert.deepEqual(planted.map((c,i)=>m(c+sign*key[i%key.length])),native299);
  const originalCount=iocNumerator(plaintext);
  assert(originalCount<4956);
  output.push({register,sign,keyLength:key.length,iocNumerator:originalCount,
   ioc:originalCount/(299*298),nativeIocFloor:4956/(299*298),
   first72RuneTranslit:translit(plaintext.slice(0,72)),
   p55First30RuneTranslit:translit(plaintext.slice(223,253)),
   exactOriginalForwardReplay:true,solvedNative299Plant:true});
 }
}
assert.deepEqual(output.map(x=>x.iocNumerator),[3086,3078,3092,3106]);
console.log(JSON.stringify({schema:"p54-q-2016-hello-meaning-original-additive-v1",
 source:{Q:q,fieldQ:evalQ(q),p54Red: red54,fieldP54:evalQ(red54),
 stateProduct:mul(evalQ(q),evalQ(red54)),signedIntervalNames:[words[0],words[20]],
 signedWordCount:words.length,intervalWords:signed21,wordKeyLength:keyRunes.length,
 numeric21:keyNumbers,receiver:[223,76],length:C.length},
 control:{nativeSolvedWindows299:reference.length,minNumerator:reference[0].n,
  minSource:reference[0].section,originalCipherNumerator:iocNumerator(C)},
 originalResults:output,decision:"Four source-typed additive GP29 original-terminal inverses fail to produce native-GP prose; no unknown plaintext"},null,2));

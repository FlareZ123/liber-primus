"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const image=fs.readFileSync(path.join(root,"resources/liber-primus/17.jpg"));
const imageSHA256=crypto.createHash("sha256").update(image).digest("hex");
assert.equal(imageSHA256,"197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e");
const page=n=>corpus.pages.find(p=>p.page===n);
const p0=page(0).indices,p1=page(1).indices,p2=page(2).indices,p57=page(57).indices;
assert.deepEqual([p0.length,p1.length,p2.length,p57.length],[262,266,201,95]);
const key=p0.slice(0,13),body=p0.slice(13),chapter=[...body,...p1,...p2];
assert.deepEqual(key,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.equal(body.length,249);assert.equal(chapter.length,716);
const MOD=29,mod=x=>((x%MOD)+MOD)%MOD;
function apply(tape,sign){return tape.map((x,i)=>mod(x+sign*key[i%13]));}
function ioc(tape){const f=Array(MOD).fill(0);for(const x of tape)f[x]++;return f.reduce((s,x)=>s+x*(x-1),0)/(tape.length*(tape.length-1));}
function top(tape){const f=Array(MOD).fill(0);for(const x of tape)f[x]++;return f.map((count,index)=>({index,count})).sort((a,b)=>b.count-a.count).slice(0,8);}
const results=[];
for(const [scope,tape] of [["p0-body",body],["p0-2-remainder",chapter]]){
 const minus=apply(tape,-1),plus=apply(tape,1);
 assert.deepEqual(apply(minus,1),tape);assert.deepEqual(apply(plus,-1),tape);
 results.push({scope,length:tape.length,raw:{ioc:ioc(tape),top:top(tape)},subtract:{ioc:ioc(minus),top:top(minus),first40:minus.slice(0,40)},add:{ioc:ioc(plus),top:top(plus),first40:plus.slice(0,40)}});
}
console.log(JSON.stringify({
 classification:"BOUNDED NEGATIVE FOR THE RAW PRINTED-ORDER PERIOD-13 GP29 ADDITIVE KEY",
 sourceImage:"resources/liber-primus/17.jpg",sourceImageSHA256:imageSHA256,
 layout:{p0Runes:p0.length,redTitleRunes:key.length,key,bodyRunes:body.length,p1Runes:p1.length,p2Runes:p2.length,chapterRemainderRunes:chapter.length,keyClock:"phase zero at first black rune; continuous across p0/p1/p2"},
 clearP57:{length:p57.length,ioc:ioc(p57)},
 tested:["plaintext=(cipher-key) mod29","plaintext=(cipher+key) mod29"],
 notTested:["phase search","F bypass","page resets","2015 prime-delta layer","dot-topology key permutation","autokey"],
 results
},null,2));

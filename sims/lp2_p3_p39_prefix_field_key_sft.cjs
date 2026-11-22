#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=corpus.pages.filter(p=>p.page<=55),C=pages.flatMap(p=>p.indices);
const p3=pages.find(p=>p.page===3).indices.slice(0,119),p39=pages.find(p=>p.page===39).indices.slice(0,119);
assert.equal(C.length,12956);assert.equal(p3.length,119);assert.equal(p39.length,119);
const mod=x=>((x%29)+29)%29;
const add=(a,b)=>[mod(a[0]+b[0]),mod(a[1]+b[1])];
const sub=(a,b)=>[mod(a[0]-b[0]),mod(a[1]-b[1])];
const ioc=a=>{const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
const raw=[];for(let i=0;i<C.length;i+=2)raw.push([C[i],C[i+1]]);
const nonF=C.filter(x=>x!==0),skip=[];for(let i=0;i<nonF.length;i+=2)skip.push([nonF[i],nonF[i+1]]);
const results=[];
for(const swap of [false,true])for(const reverse of [false,true])for(const skipF of [false,true])for(const sign of [-1,1]){
 let key=Array.from({length:119},(_,i)=>swap?[p39[i],p3[i]]:[p3[i],p39[i]]);
 if(reverse)key=key.reverse();
 const input=skipF?skip:raw;
 const plain=input.map((v,i)=>sign<0?sub(v,key[i%119]):add(v,key[i%119])).flat();
 results.push({channelOrder:swap?"p39,p3":"p3,p39",keyOrder:reverse?"reverse":"forward",skipF,sign,ioc:ioc(plain)});
}
const seed=Array.from({length:119},(_,i)=>[i%29,(i*7+3)%29]);
const plain=Array.from({length:500},(_,i)=>[i%29,(i*11+5)%29]);
const key=Array.from({length:500},(_,i)=>seed[i%119]);
const cipher=plain.map((v,i)=>add(v,key[i]));
assert.deepEqual(cipher.map((v,i)=>sub(v,key[i])),plain);
console.log(JSON.stringify({
 input:{runes:C.length,fieldElements:raw.length,fCount:C.length-nonF.length,nonFRunes:nonF.length,nonFFieldElements:skip.length,rawIoC:ioc(C)},
 sourceKey:{p3Prefix:119,p39Prefix:119,keyElements:119},
 models:results.length,
 best:results.slice().sort((a,b)=>b.ioc-a.ioc)[0],
 positiveControl:"planted field-additive stream recovered exactly",
},null,2));

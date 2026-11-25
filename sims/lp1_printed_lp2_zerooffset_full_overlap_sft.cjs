'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const lp1 = fs.readFileSync('resources/transcriptions/lp1_wulfic_canonical.txt','utf8');
const lp2 = fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8');
const c = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const s = JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
const map=new Map(c.runes.map((r,i)=>[r,i]));
const parse=t=>Array.from(t).filter(r=>map.has(r)).map(r=>map.get(r));
const key=parse(lp1),tape=parse(lp2),canon=c.pages.flatMap(p=>p.indices);
assert.deepEqual(tape,canon);
assert.equal(key.length,2797);
const n=key.length;
const mod=x=>(x+29)%29;
const P=tape.slice(0,n).map((v,i)=>mod(v-key[i]));
assert.deepEqual(P.map((x,i)=>mod(x+key[i])),tape.slice(0,n));
const stats=a=>{
 const f=Array(29).fill(0);
 a.forEach(x=>f[x]++);
 return {n:a.length,ioc:f.reduce((z,x)=>z+x*(x-1),0)/(a.length*(a.length-1)),repeats:a.slice(1).filter((x,i)=>x===a[i]).length};
};
const native=s.sections.map(x=>({name:x.name,a:parse(x.source_text)}));
const train=native.slice(0,7).filter((_,i)=>![1,5].includes(i));
const count=new Map(),ctx=new Map();
for(const {a} of train) for(let i=2;i<a.length;i++){
 const k=a[i-2]*29+a[i-1];
 ctx.set(k,(ctx.get(k)||0)+1);
 count.set(k*29+a[i],(count.get(k*29+a[i])||0)+1);
}
const score=a=>a.slice(2).reduce((z,x,i)=>{
 const k=a[i]*29+a[i+1];
 return z+Math.log(((count.get(k*29+x)||0)+1)/((ctx.get(k)||0)+29));
},0)/(a.length-2);
const details=a=>({...stats(a),trigram:score(a)});
let seed=2769;
const rnd=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed;};
const controls=native.filter((_,i)=>[1,5,7,8].includes(i)).map(({name,a})=>{
 const enc=a.map((x,i)=>mod(x+key[i]));
 const inv=enc.map((x,i)=>mod(x-key[i]));
 assert.deepEqual(inv,a);
 const nulls=Array.from({length:128},()=>details(enc.map(x=>mod(x-(rnd()%29)))));
 return {name,...details(a),exact:true,nullMax:Math.max(...nulls.map(x=>x.trigram))};
});
const nulls=Array.from({length:256},()=>details(tape.slice(0,n).map(x=>mod(x-(rnd()%29)))));
let offset=0;
const pageStats=[];
for(const p of c.pages){
 if(offset>=n)break;
 const a=P.slice(offset,offset+p.indices.length);
 pageStats.push({page:p.page,offset,...details(a)});
 offset+=p.indices.length;
}
let k=0;
const formatted=Array.from(lp2).map(ch=>map.has(ch)?(k<n?c.runes[P[k++]]:''):k<n?ch:'').join('');
console.log(JSON.stringify({controls,original:details(P),first729:details(P.slice(0,729)),remaining:details(P.slice(729)),pageStats,negative:{min:Math.min(...nulls.map(x=>x.trigram)),max:Math.max(...nulls.map(x=>x.trigram)),mean:nulls.reduce((z,x)=>z+x.trigram,0)/nulls.length},candidateIndices:P,candidateWithSourceSeparators:formatted},null,2));

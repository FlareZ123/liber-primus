'use strict';
const fs=require('node:fs');
function frontier(corpus){
 const S=corpus.prime,pages=corpus.pages.slice(0,56).filter(x=>x.indices.length),gcd=(a,b)=>b?gcd(b,a%b):a,out=[];
 for(const base of [110,128])for(const reverse of [false,true]){
 const C=pages.map(p=>(reverse?[...p.indices].reverse():p.indices).map(x=>S[x])),legal=new Set(S),trace=[];
 let j=0;
 for(;j<Math.max(...C.map(a=>a.length));j++){
 const active=C.filter(a=>a.length>j),keys=[];
 for(let a=0;a<base;a++){if(j===0&&gcd(a,base)!==1)continue;for(let b=0;b<base;b++){
 if(active.every(x=>legal.has((a*x[0]+b+(j===0?0:x[j]))%base)))keys.push([a,b]);
 }}
 const id=j===0?[1,0]:[0,0];if(!keys.some(([a,b])=>a===id[0]&&b===id[1]))throw Error("identity lost");
 trace.push({digit:j,active:active.length,keys:keys.length});
 if(keys.length>1){const changing=keys.filter(([a,b])=>active.some(x=>((a*x[0]+b+(j===0?0:x[j]))%base)!==x[j]));out.push({base,reverse,forcedIdentityDigits:j,unchangedRunes:C.reduce((s,x)=>s+Math.min(j,x.length),0),total:C.reduce((s,x)=>s+x.length,0),firstNonuniqueActive:active.length,firstNonuniqueKeys:keys,changing,trace});break}
 }
 }
 return out;
}
console.log(JSON.stringify(frontier(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json'))),null,2));

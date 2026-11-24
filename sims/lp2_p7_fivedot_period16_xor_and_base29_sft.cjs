"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const C=corpus.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices);assert.equal(C.length,1729);
const e=C.slice();e.splice(692,0,-1);
const D=Array.from({length:1730},(_,i)=>e[346*[2,4,0,3,1][i%5]+Math.floor(i/5)]);assert.equal(D.shift(),-1);
const tuple=[0,6,2,5,1,4,3],inv=tuple.map((_,i)=>tuple.indexOf(i)),apply=(a,t)=>a.map((_,i)=>a[Math.floor(i/7)*7+t[i%7]]);
const orders={printed:C,five:D,seven:apply(D,tuple),inverse:apply(D,inv),down:Array.from({length:1729},(_,i)=>D[(i%247)*7+Math.floor(i/247)]),across:Array.from({length:1729},(_,i)=>D[(i%7)*247+Math.floor(i/7)])};
const allowed=new Set(Array.from({length:95},(_,i)=>i+32)),rows=[];
for(const [name,t] of Object.entries(orders))for(const rev of [false,true]){
 const bits=t.map(x=>{let s=x.toString(2).padStart(5,"0");return rev?s.split("").reverse().join(""):s}).join("");
 const A=Array.from({length:1235},(_,j)=>parseInt(bits.slice(7*j,7*j+7),2));
 const dom=Array.from({length:80},(_,p)=>Array.from({length:128},(_,m)=>m).filter(m=>A.filter((_,j)=>j%80===p).every(x=>allowed.has(x^m))));
 const empty=dom.filter(x=>!x.length).length;rows.push({name,rev,empty});assert.ok(empty);
}
assert.deepEqual(rows.map(x=>x.empty),[75,72,76,79,76,76,77,76,78,80,77,74]);
const out=[];let overflow=0;
for(let j=0;j<D.length;j+=7){
 let n=D.slice(j,j+7).reduce((a,b)=>a*29+b,0);if(n>=95**5)overflow++;
 const d=Array(5);for(let i=4;i>=0;i--){d[i]=n%128;n=Math.floor(n/128)}assert.equal(n,0);out.push(d);
}
const re=out.flatMap(d=>{let n=d.reduce((a,b)=>a*128+b,0);let a=Array(7);for(let i=6;i>=0;i--){a[i]=n%29;n=Math.floor(n/29)}assert.equal(n,0);return a});
assert.deepEqual(re,D);
const result={period16:rows,base128:{printable:out.flat().filter(x=>allowed.has(x)).length,wholePrintable:out.filter(x=>x.every(y=>allowed.has(y))).length,maxLeading:Math.max(...out.map(x=>x[0])),exactReplay:true},base95Overflow:overflow};
assert.equal(result.base128.printable,884);assert.equal(result.base128.wholePrintable,48);assert.equal(overflow,143);
console.log(JSON.stringify(result,null,2));

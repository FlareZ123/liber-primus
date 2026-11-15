#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8').replace(/\r\n/g,'\n');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),B=grid.pages.flatMap(p=>p.bytes),N=C.length;
assert.equal(N,12956);assert.equal(B.length,256);assert.equal(new Set(B).size,161);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encodeNativeGP(raw){
 const text=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S'),out=[];
 for(const w of text.match(/[A-Z]+/g)||[])for(let i=0;i<w.length;){
  if(w.startsWith('ING',i)){out.push(21);i+=3;continue;}
  if(w.startsWith('IO',i)){out.push(27);i+=2;continue;}
  const t=tokens.find(x=>w.startsWith(x.s,i));assert(t,'unmapped '+w.slice(i));out.push(t.i);i+=t.s.length;
 }
 return out;
}
const alpha='0123456789ABCDEFGHIJKLMNOPQRS';
const vulgate=read('resources/control/latin-vulgate-gp-wholewords.txt').split('\n').filter(x=>/^[0-9A-S]+$/.test(x)).join('').split('').map(x=>alpha.indexOf(x));
const controls=[
 {name:'Shakespeare',r:encodeNativeGP(read('resources/control/shakespeare_first300k.txt'))},
 {name:'Gibran',r:encodeNativeGP(read('resources/control/gibran_prophet_58585.txt'))},
 {name:'Emerson',r:encodeNativeGP(read('resources/control/emerson_essays_2944.txt'))},
 {name:'Latin Vulgate',r:vulgate}
];
assert.deepEqual(controls.map(x=>[x.name,x.r.length]),[['Shakespeare',217106],['Gibran',62492],['Emerson',321327],['Latin Vulgate',204802]]);
function measure(xs,key){
 const g=new Map();for(let i=0;i<N;i++){const v=key[i%key.length];let a=g.get(v);if(!a){a=new Uint32Array(29);g.set(v,a);}a[xs[i]]++;}
 let pairs=0,hits=0;const top=Array(12).fill(0),sizes=[];
 for(const row of g.values()){const a=Array.from(row).sort((x,y)=>y-x),n=a.reduce((s,x)=>s+x,0);sizes.push(n);pairs+=n*(n-1)/2;for(const x of a)hits+=x*(x-1)/2;let z=0;for(let k=0;k<12;k++){z+=a[k];top[k]+=z;}}
 return {groups:g.size,pairs,hits,rate:hits/pairs,top,minGroup:Math.min(...sizes),maxGroup:Math.max(...sizes)};
}
function windows(xs){
 const starts=[],step=Math.floor(N/2);for(let s=0;s+N<=xs.length;s+=step)starts.push(s);
 if(starts.length&&starts[starts.length-1]+N<xs.length)starts.push(xs.length-N);
 return starts.map(s=>xs.slice(s,s+N));
}
function plant(xs,key){
 let seed=0x17c0ffee;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 const p=new Map();for(const v of new Set(key)){const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rnd()%(j+1);[a[j],a[k]]=[a[k],a[j]];}p.set(v,a);}
 return xs.map((x,i)=>p.get(key[i%key.length])[x]);
}
function run(key){
 const orig=measure(C,key),all=[],bySource=[];let minRate=Infinity,maxRate=-Infinity;const minTop=Array(12).fill(Infinity),maxTop=Array(12).fill(-Infinity);
 for(const source of controls){const ws=windows(source.r),ms=ws.map(w=>measure(w,key));all.push(...ms);const sm=Array(12).fill(Infinity);for(const m of ms){minRate=Math.min(minRate,m.rate);maxRate=Math.max(maxRate,m.rate);for(let k=0;k<12;k++){minTop[k]=Math.min(minTop[k],m.top[k]);maxTop[k]=Math.max(maxTop[k],m.top[k]);sm[k]=Math.min(sm[k],m.top[k]);}}
 bySource.push({name:source.name,windows:ms.length,minRate:Math.min(...ms.map(m=>m.rate)),minTop:sm});}
 const plain=controls[0].r.slice(0,N),p0=measure(plain,key),p1=measure(plant(plain,key),key);
 const positive=p0.groups===p1.groups&&p0.pairs===p1.pairs&&p0.hits===p1.hits&&p0.rate===p1.rate&&JSON.stringify(p0.top)===JSON.stringify(p1.top)&&p0.minGroup===p1.minGroup&&p0.maxGroup===p1.maxGroup;
 return {original:orig,controlWindows:all.length,minControlRate:minRate,maxControlRate:maxRate,minControlTop:minTop,maxControlTop:maxTop,all12TopBelowControls:minTop.every((x,k)=>orig.top[k]<x),bySource,positivePlantExact:positive,positivePlantRate:p1.rate};
}
const raw=run(B),mod29=run(B.map(x=>x%29));
assert.equal(raw.original.groups,161);assert.equal(raw.original.pairs,646599);assert.equal(raw.original.hits,22339);
assert(Math.abs(raw.original.rate-0.034548460483236135)<1e-15);
assert.deepEqual(raw.original.top,[1039,1944,2773,3537,4248,4927,5570,6176,6737,7260,7769,8269]);
assert.equal(raw.controlWindows,122);assert(Math.abs(raw.minControlRate-0.056999778842837676)<1e-15);
assert.deepEqual(raw.minControlTop,[1634,2938,4052,5051,5952,6775,7531,8230,8870,9460,10000,10499]);
assert(raw.all12TopBelowControls&&raw.positivePlantExact);
assert.equal(mod29.original.groups,29);assert.equal(mod29.original.pairs,3429119);assert.equal(mod29.original.hits,117679);
assert(Math.abs(mod29.original.rate-0.03431756086621666)<1e-15);
assert.deepEqual(mod29.original.top,[664,1291,1883,2449,2999,3538,4067,4578,5083,5575,6060,6533]);
assert.equal(mod29.controlWindows,122);assert(Math.abs(mod29.minControlRate-0.0577673157449479)<1e-15);
assert.deepEqual(mod29.minControlTop,[1472,2593,3575,4478,5314,6103,6844,7523,8170,8762,9310,9821]);
assert(mod29.all12TopBelowControls&&mod29.positivePlantExact);
console.log(JSON.stringify({status:'bounded negative for two zero-drift p50-table selector tableau models; no plaintext recovered',originalRunes:N,p50Bytes:B.length,p50DistinctBytes:new Set(B).size,controls:controls.map(x=>({name:x.name,runes:x.r.length,windows:windows(x.r).length})),rawByteSelector:raw,byteModulo29Selector:mod29,scope:'continuous row-major p50 stream from p0; no skips, nulls, page/word resets, changing tables or non-bijective mappings'},null,2));

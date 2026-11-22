"use strict";
// Agent6 exact source GP29 radix29 -> Latin26 blocks, phi receiver (Node22).
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const load=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const gp=load("resources/liber-primus/lp2-corpus.json");
const solved=load("resources/external/relikd-solved-gp29-native-v1.json");
const glyph=new Map(gp.runes.map((s,i)=>[s,i]));
const control=name=>[...solved.sections.find(x=>x.name===name).source_text]
 .filter(x=>glyph.has(x)).map(x=>glyph.get(x));
const primes=[];
for(let n=2;primes.length<4200;n++)if(primes.every(x=>x*x>n||n%x))primes.push(n);
const key=(i,m)=>(primes[i]-1)%m;
let clock=0;const clear56=control("p56_an_end"),C56=gp.pages[56].indices;
assert.equal(clear56.length,85);
for(let i=0;i<85;i++){
 if(clear56[i]===0){assert.equal(i,56);assert.equal(C56[i],0);}
 else assert.equal((C56[i]-key(clock++,29)+29)%29,clear56[i]);
}
assert.equal(clock,84);
function width(n){
 let cap=29n**BigInt(n),d=0,pow=1n;
 do {d++;pow*=26n;}while(pow<cap);
 return d;
}
assert.equal(width(29),30);
function encode(runes){
 let v=runes.reduce((n,x)=>n*29n+BigInt(x),0n),a=Array(width(runes.length));
 for(let i=a.length-1;i>=0;i--){a[i]=Number(v%26n);v/=26n;}
 assert.equal(v,0n);
 return a;
}
function decode(chars,n){
 let v=chars.reduce((t,x)=>t*26n+BigInt(x),0n);
 if(v>=29n**BigInt(n))return null;
 const out=Array(n);
 for(let i=n-1;i>=0;i--){out[i]=Number(v%29n);v/=29n;}
 return out;
}
function blocks(runes){
 const out=[];
 for(let i=0;i<runes.length;i+=29){
  const x=runes.slice(i,i+29),c=encode(x);
  assert.deepEqual(decode(c,x.length),x);
  out.push({r:x.length,c});
 }
 return out;
}
function split(shape,chars){
 let off=0;
 return shape.map(({r,c})=>{
  const part=chars.slice(off,off+c.length);off+=c.length;
  return {r,c:part};
 });
}
const flat=bs=>bs.flatMap(x=>x.c);
function ioc(v){
 const h=Array(26).fill(0);v.forEach(x=>h[x]++);
 return h.reduce((s,x)=>s+x*(x-1),0)/(v.length*(v.length-1));
}
function source(a,b){return gp.pages.filter(x=>x.page>=a&&x.page<=b)
 .flatMap(x=>x.indices);}
function test(name,run,expected){
 const bs=blocks(run),C=flat(bs),P=C.map((v,i)=>(v-key(i,26)+26)%26);
 const replay=P.map((v,i)=>(v+key(i,26))%26);
 assert.deepEqual(replay,C);
 assert.deepEqual(split(bs,replay).flatMap(x=>decode(x.c,x.r)),run);
 const invalid=split(bs,P).flatMap((x,i)=>decode(x.c,x.r)===null?[i]:[]);
 assert.equal(C.length,expected.letters);
 assert.deepEqual(invalid,expected.invalid);
 const rate=ioc(P);
 assert(Math.abs(rate-expected.ioc)<1e-12);
 return {name,sourceRunes:run.length,latinLetters:C.length,decodedLatinIOC:rate,
  plaintextGPOverflowBlockIndices:invalid,
  latinFirst120:P.slice(0,120).map(x=>String.fromCharCode(65+x)).join("")};
}
const a=test("p16-p21",source(16,21),{letters:1669,
 ioc:0.038372178231052066,invalid:[4,7,13,45,55]});
const b=test("p40-p53",source(40,53),{letters:3112,
 ioc:0.038492239577781466,
 invalid:[0,2,19,39,40,51,63,64,74,89,92,93,95,103]});
const native=control("p57_parable");assert.equal(native.length,95);
const native87=native.slice(0,87),pb=blocks(native87),p=flat(pb);
const enc=p.map((x,i)=>(x+key(i,26))%26);
const synthetic=split(pb,enc).flatMap(x=>decode(x.c,x.r));
assert.equal(synthetic.length,87);
const dec=flat(blocks(synthetic)).map((x,i)=>(x-key(i,26)+26)%26);
assert.deepEqual(split(pb,dec).flatMap(x=>decode(x.c,x.r)),native87);
const full=blocks(native),fullenc=flat(full).map((x,i)=>(x+key(i,26))%26);
assert.deepEqual(split(full,fullenc).flatMap((x,i)=>decode(x.c,x.r)===null?[i]:[]),[3]);
console.log(JSON.stringify({classification:"no new plaintext",p56GP29PrimePhi:"85/85",
 solvedP57NativePlant:"87/87",nativeFullP57CipherDomainOverflow:[3],
 original:[a,b]},null,2));

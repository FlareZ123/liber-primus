"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const json=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const text=f=>fs.readFileSync(path.join(root,f),"utf8");
const corpus=json("resources/liber-primus/lp2-corpus.json");
const grid=json("resources/liber-primus/lp2-grid-256.json");
const p54=corpus.pages.find(p=>p.page===54).indices;
const allUnknown=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const key=p54.slice(1,9), tail=grid.bytes.slice(24);
const mod=n=>(n%29+29)%29;
assert.equal(p54.length,232); assert.equal(p54[0],24);
assert.deepEqual(key,[19,21,23,27,2,14,10,19]);
assert.equal(tail.length,232);
assert.equal(allUnknown.filter(p=>p.indices.length+p.indices[0]===256).length,1);
assert.equal(allUnknown.find(p=>p.indices.length+p.indices[0]===256).page,54);
function gpEncode(source){
  const map=new Map(corpus.translit.map((t,i)=>[t,i])); map.set("ING",21);
  const s=source.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  const out=[];
  for(const word of s.match(/[A-Z]+/g)||[]) for(let i=0;i<word.length;){
    let ok=false;
    for(const n of [3,2,1]){const t=word.slice(i,i+n);if(map.has(t)){out.push(map.get(t));i+=n;ok=true;break;}}
    assert(ok,"unmapped token: "+word.slice(i));
  }
  return out;
}
function ioc(xs){const f=Array(29).fill(0);for(const x of xs)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));}
function score(xs,counts,denom){let s=0;for(let i=2;i<xs.length;i++)s+=Math.log((counts[xs[i-2]*841+xs[i-1]*29+xs[i]]+.2)/denom);return s/(xs.length-2);}
function decode(c,k,op){return c.map((x,i)=>op==="C-K"?mod(x-k[i]):op==="C+K"?mod(x+k[i]):mod(k[i]-x));}
function encode(p,k,op){return p.map((x,i)=>op==="C-K"?mod(x+k[i]):op==="C+K"?mod(x-k[i]):mod(k[i]-x));}
const emerson=gpEncode(text("resources/control/emerson_essays_2944.txt")).slice(0,50000);
const gibran=gpEncode(text("resources/control/gibran_prophet_58585.txt"));
const counts=new Uint32Array(29**3);
for(let i=2;i<emerson.length;i++)counts[emerson[i-2]*841+emerson[i-1]*29+emerson[i]]++;
const denom=emerson.length-2+counts.length*.2;
const hold=[];
for(let i=0;i+232<=gibran.length;i+=29)hold.push(score(gibran.slice(i,i+232),counts,denom));
hold.sort((a,b)=>a-b);assert.equal(hold.length,2154);
const plant=gibran.slice(1024,1256);assert.equal(plant.length,232);
const models=[];
for(const direction of [1,-1]){
  const shifted=Array(232);
  for(let row=0;row<29;row++)for(let col=0;col<8;col++){
    const sr=mod(row+direction*key[col]);shifted[row*8+col]=tail[sr*8+col];
  }
  const maps=[
    ["byte-mod29",b=>b%29],
    ["byte-floor29/256",b=>Math.floor(29*b/256)],
    ["byte-mod28",b=>b%28]
  ];
  for(const [mapName,fn] of maps){
    const ks=shifted.map(fn);
    for(const op of ["C-K","C+K","K-C"]){
      const plain=decode(p54,ks,op);
      assert.deepEqual(encode(plain,ks,op),p54);
      assert.deepEqual(decode(encode(plant,ks,op),ks,op),plant);
      models.push({direction,byteMap:mapName,operation:op,ioc:ioc(plain),trigram:score(plain,counts,denom),preview:plain.slice(0,24).map(i=>corpus.translit[i]).join(" ")});
    }
  }
}
models.sort((a,b)=>b.trigram-a.trigram);
assert.equal(models.length,18);
assert(models.every(m=>m.trigram<hold[0]));
assert(Math.abs(models[0].trigram-(-11.55819743489948))<1e-9);
console.log(JSON.stringify({
  classification:"bounded negative; no p54 plaintext or authentic key",
  source:{p54Runes:232,enlargedInitialGPIndex:24,redHeadingKey:key,tableCells:256,skippedCells:24,tailCells:232,matrix:[29,8]},
  family:{shiftDirections:[1,-1],byteMaps:["byte-mod29","byte-floor29/256","byte-mod28"],operations:["C-K","C+K","K-C"],models:18,noPhaseOrFreePermutation:true},
  raw:{ioc:ioc(p54),trigram:score(p54,counts,denom)},
  best:models.slice(0,6),
  nativeGibranHoldout:{windows:hold.length,length:232,stride:29,worst:hold[0],q10:hold[Math.floor(hold.length*.1)],median:hold[Math.floor(hold.length/2)],q90:hold[Math.floor(hold.length*.9)]},
  candidatesEnteringNativeRange:models.filter(m=>m.trigram>=hold[0]).length,
  positiveControl:"All 18 models recover a 232-rune native-GP plant exactly.",
  conclusion:"The p54 red-heading column-shift / table-tail family does not recover plaintext; 24+232 remains a hypothesis."
},null,2));

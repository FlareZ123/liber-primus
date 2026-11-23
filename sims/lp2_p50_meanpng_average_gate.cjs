#!/usr/bin/env node
"use strict";

// One frozen, source-motivated test: the original 32x8 byte table as
// PNG Average (filter type 3) residuals, 8-bit grayscale, bpp=1.
// See https://www.libpng.org/pub/png/spec/1.0/PNG-Filters.html
// Execute from repository root: node sims/lp2_p50_meanpng_average_gate.cjs
const fs = require("fs");
const zlib = require("zlib");
const assert = require("assert");
const grid = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json","utf8"));
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
assert.equal(grid.shape,"32 rows by 8 columns across LP2 pages 49, 50, 51");
assert.equal(grid.bytes.length,256);
assert.equal(grid.pages.map(p=>p.rows).join(","),"10,13,9");
const source = grid.bytes;
assert.equal(source.slice(0,8).map(x=>x.toString(16).padStart(2,"0")).join(""),"cbe7a7ba61ed7eb7");

// Official PNG type-3 Average filter; top and left boundaries are zero.
// Output and residual are integers modulo 256. Exactly one interpretation:
// each ORIGINAL printed row is one grayscale scanline of eight bytes.
function reconstruct(residual,width=8) {
  const out=[];
  for(let i=0;i<residual.length;i++){
    const x=i%width;
    const a=x?out[i-1]:0;
    const b=i>=width?out[i-width]:0;
    out[i]=(residual[i]+Math.floor((a+b)/2))&255;
  }
  return out;
}
function filter(original,width=8) {
  const out=[];
  for(let i=0;i<original.length;i++){
    const x=i%width;
    const a=x?original[i-1]:0;
    const b=i>=width?original[i-width]:0;
    out[i]=(original[i]-Math.floor((a+b)/2)+256)&255;
  }
  return out;
}
function ioc(values) {
  if(values.length<2)return null;
  const n=values.length, hist=new Array(29).fill(0);
  values.forEach(x=>hist[x]++);
  return hist.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1));
}
function stats(bytes){
  let hist=new Array(256).fill(0);
  for(const b of bytes)hist[b]++;
  return {
    entropy:-hist.filter(n=>n).reduce((s,n)=>s+(n/bytes.length)*Math.log2(n/bytes.length),0),
    printable_ascii:bytes.filter(x=>x>=32&&x<=126).length,
    ascii_letters:bytes.filter(x=>(x>=65&&x<=90)||(x>=97&&x<=122)).length,
    unique_values:new Set(bytes).size,
    head32:bytes.slice(0,32).map(x=>x.toString(16).padStart(2,"0")).join("")
  };
}
// Independent miniature 2x2 PNG-average worked example. Row 0 original
// [10,20] filters [10,15]; row 1 [30,40] filters [25,15].
assert.deepEqual(filter([10,20,30,40],2),[10,15,25,15]);
assert.deepEqual(reconstruct([10,15,25,15],2),[10,20,30,40]);
const avg=reconstruct(source);
assert.deepEqual(filter(avg),source);
// Literal PNG scanlines cannot be read directly from the 32x8 printed grid:
// each row would need a leading filter opcode in [0,4], plus seven pixels.
// In the original first column, only row24 is in that mandatory range.
const literalFilterHeaders=Array.from({length:32},(_,r)=>source[r*8]);
const validLiteralHeaders=literalFilterHeaders.filter(x=>x<=4).length;
assert.equal(validLiteralHeaders,1);
assert.equal(avg.slice(0,8).map(x=>x.toString(16).padStart(2,"0")).join(""),"cb4ccd20712590ff");
// One fixed historical binary receiver: a complete offset-zero RFC1951 raw
// DEFLATE body, which Cicada's authenticated 2013 OpenPGP ZIP channel used.
// Do not fit offsets, skip bytes, or retune image-filter parameters.
const authenticTransportPlant=Buffer.from("AN END. WITHIN THE DEEP WEB THERE EXISTS A PAGE.");
const deflatedPlant=zlib.deflateRawSync(authenticTransportPlant);
assert.deepEqual(zlib.inflateRawSync(deflatedPlant),authenticTransportPlant);
let rawDeflateAccepts=false,rawDeflateLength=null,rawDeflateError=null;
try { const d=zlib.inflateRawSync(Buffer.from(avg)); rawDeflateAccepts=true;rawDeflateLength=d.length; }
catch(e) { rawDeflateError=String(e.message); }
assert.equal(rawDeflateAccepts,false);
const allPages=corpus.pages.filter(p=>p.page<=55);
const C=allPages.flatMap(p=>p.indices);
assert.equal(C.length,12956);
const offsets=new Map();
let off=0;for(const p of allPages){offsets.set(p.page,[off,off+p.indices.length]);off+=p.indices.length}
function pageRange(lo,hi) {
  const res=[];
  for(const p of allPages)if(p.page>=lo&&p.page<=hi){
    const [s,e]=offsets.get(p.page);
    for(let i=s;i<e;i++)res.push(i);
  }
  return res;
}
const splits={opening:pageRange(0,2),train:pageRange(16,21),holdout:pageRange(40,53),p55:pageRange(55,55)};
function profile(P) {
  return Object.fromEntries(Object.entries(splits).map(([n,idx])=>[n,{n:idx.length,ioc:ioc(idx.map(i=>P[i]))}]));
}
function run(originalBytes,name,sign) {
  // Explicitly one continuous GP29 clock over p0..p55 (p50 has 0 runes).
  // Both natural additive signs; no secret F hold or phase reset.
  const K=originalBytes.map(x=>x%29);
  const P=C.map((c,i)=>(c+sign*K[i%256]+29)%29);
  const back=P.map((p,i)=>(p-sign*K[i%256]+29)%29);
  assert.deepEqual(back,C);
  const sourceNative=corpus.pages.find(p=>p.page===57).indices;
  const plantCipher=sourceNative.map((p,i)=>(p+K[i%256])%29);
  assert.deepEqual(plantCipher.map((c,i)=>(c-K[i%256]+29)%29),sourceNative);
  return {source:name,sign,profile:profile(P),forward_replay:true,native_plant_recovery:true};
}
const output={
  sources:["resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-corpus.json"],
  formula:"Recon(x)=[Filt(x)+floor((Recon(left)+Recon(above))/2)] mod 256",
  shape:[32,8],bpp:1,
  literalPNGFilterHeadersValid:validLiteralHeaders,literalPNGFilterHeadersTotal:32,
  avg_filter_exact_replay:true,
  rawDeflateAtOffset0:{accepted:rawDeflateAccepts,length:rawDeflateLength,error:rawDeflateError,sourceNativePlant:true},
  original_stats:stats(source),avg_reconstructed_stats:stats(avg),
  decoded_4c_positions:avg.flatMap((v,i)=>v===0x4c?[i]:[]),
  original_gp29_ic:profile(C),
  candidates:[run(source,"printed",1),run(source,"printed",-1),run(avg,"avg_reconstructed",1),run(avg,"avg_reconstructed",-1)]
};
console.log(JSON.stringify(output,null,2));

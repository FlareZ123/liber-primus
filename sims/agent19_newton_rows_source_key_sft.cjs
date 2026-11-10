"use strict";
/**
 * Agent19: p39 Newton-cycle grid-row 32-byte key, source-locked original LP2 inverse.
 * The exact grid polynomial jet fixes Newton cycle 15 -> 27 -> 21 -> 15;
 * the visually enlarged p54 Ac supplies row24, forming a 4x8-byte key.
 * Evaluate deterministic AES256-CTR/ChaCha20 streams on original GP29 and
 * transparent-doublet GP28, with exact original ciphertext roundtrips and
 * native Shakespeare plants. This tests a hypothetical source interpretation.
 *
 * Node.js 22, CommonJS; built-in libraries, no writes, no workflow triggers.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,"..");
const data=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const grid=data("resources/liber-primus/base60-grid.json");
const corpus=data("resources/liber-primus/lp2-corpus.json");
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const bytes=grid.byte_rows.flat();
assert.equal(bytes.length,256);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
const mod=(n,m)=>((n%m)+m)%m;

/** @param {number} a */
function inverse(a){for(let i=1;i<29;i++)if(mod(a*i,29)===1)return i;throw Error("No inverse");}
/** @param {number} x */
function jet(x){
  let p=0,d=0;
  for(const c of bytes){d=mod(d*x+p,29);p=mod(p*x+c,29);}
  return {p,d};
}
const j15=jet(15);
assert.deepEqual(j15,{p:27,d:5});
const next=x=>{const j=jet(x);return mod(x-j.p*inverse(j.d),29);};
assert.deepEqual([next(15),next(27),next(21)],[27,21,15]);
assert.deepEqual(jet(24),{p:0,d:0});
assert.equal(corpus.pages.find(p=>p.page===54).indices[0],24);
const rowIndices=[15,27,21,24];
const key=Buffer.from(rowIndices.flatMap(i=>grid.byte_rows[i]));
assert.equal(key.length,32);
const wrongKey=Buffer.from([15,27,21,13].flatMap(i=>grid.byte_rows[i]));
const zeroIV=Buffer.alloc(16);
const gridIV=Buffer.from(bytes.slice(0,16));
/**
 * @param {"aes-256-ctr"|"chacha20"} cipher
 * @param {Buffer} cipherKey
 * @param {Buffer} iv
 * @param {number} length
 * @returns {Buffer}
 */
function stream(cipher,cipherKey,iv,length){
  const instance=crypto.createCipheriv(cipher,cipherKey,iv);
  return Buffer.concat([instance.update(Buffer.alloc(length)),instance.final()]);
}
function ioc(values){
  const counts=new Array(29).fill(0);
  for(const v of values)counts[v]++;
  const n=values.length;
  return counts.reduce((x,c)=>x+c*(c-1),0)/(n*(n-1));
}
/** @param {number[]} seq */
function preview(seq){
  return seq.slice(0,90).map(i=>corpus.translit[i]).join("");
}
const pow15=Array.from({length:28},(_,i)=>{let v=1;for(let j=0;j<i;j++)v=v*15%29;return v;});
assert.equal(new Set(pow15).size,28);
const log15=new Array(29).fill(-1);
pow15.forEach((v,i)=>log15[v]=i);

/**
 * @param {Buffer} keyBytes
 * @param {"gp29"|"gp28-sorted"|"gp28-log15"} mode
 * @param {1|-1} sign
 * @param {"global"|"page"} clock
 * @param {number[][]} input
 */
function decode(keyBytes,mode,sign,clock,input){
  const output=[];
  let t=0;
  for(const page of input){
    if(clock==="page")t=0;
    if(mode==="gp29"){
      for(const c of page)output.push(mod(c+sign*(keyBytes[t++]%29),29));
    }else{
      for(let j=1;j<page.length;j++){
        const diff=mod(page[j]-page[j-1],29);
        if(diff===0){output.push(28);continue;}
        const rank=mode==="gp28-sorted"?diff-1:log15[diff];
        output.push(mod(rank+sign*(keyBytes[t++]%28),28));
      }
    }
  }
  return output;
}
/**
 * @param {number[][]} plaintext
 * @param {number[][]} ivPages
 * @param {Buffer} keyBytes
 * @param {"gp29"|"gp28-sorted"|"gp28-log15"} mode
 * @param {1|-1} sign
 * @param {"global"|"page"} clock
 */
function encode(plaintext,ivPages,keyBytes,mode,sign,clock){
  const all=[];
  let t=0;
  for(let p=0;p<plaintext.length;p++){
    if(clock==="page")t=0;
    const plain=plaintext[p],src=ivPages[p];
    if(mode==="gp29"){
      all.push(plain.map(v=>mod(v-sign*(keyBytes[t++]%29),29)));
      continue;
    }
    const enc=[src[0]];
    for(let j=1;j<plain.length;j++){
      const val=plain[j];
      if(val===28){enc.push(enc[j-1]);continue;}
      const rank=mod(val-sign*(keyBytes[t++]%28),28);
      const delta=mode==="gp28-sorted"?rank+1:pow15[rank];
      enc.push(mod(enc[j-1]+delta,29));
    }
    all.push(enc);
  }
  return all;
}
const originalPages=pages.map(p=>p.indices);
const originalAll=originalPages.flat();
assert.equal(originalAll.length,12956);
const nativeText=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8")
  .toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
const tokens=corpus.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
/** @returns {number[]} */
function gpReference(){
  const out=[];
  for(const word of nativeText.match(/[A-Z]+/g)||[]){
    for(let at=0;at<word.length;){
      const found=tokens.find(t=>word.startsWith(t.token,at));
      assert(found);
      out.push(found.index);
      at+=found.token.length;
      if(out.length===12956)return out;
    }
  }
  throw Error("Short reference source");
}
const reference=gpReference();
const refPages=[];
let ptr=0;
for(const page of originalPages){refPages.push(reference.slice(ptr,ptr+page.length));ptr+=page.length;}
assert.equal(ptr,12956);
const settings=[];
for(const cipher of ["aes-256-ctr","chacha20"])
for(const ivType of ["zero","grid"])
for(const clock of ["global","page"])
for(const mode of ["gp29","gp28-sorted","gp28-log15"])
for(const sign of [-1,1]){
  settings.push({cipher,ivType,clock,mode,sign});
}
assert.equal(settings.length,48);
const originalResults=[];
let plantChecks=0;
for(const {cipher,ivType,clock,mode,sign} of settings){
  const iv=ivType==="zero"?zeroIV:gridIV;
  const sourceStream=stream(cipher,key,iv,originalAll.length);
  const original=decode(sourceStream,mode,sign,clock,originalPages);
  const enc=encode(mode==="gp29"?
    originalPages.map((p,i)=>original.slice(originalPages.slice(0,i).reduce((x,v)=>x+v.length,0),
      originalPages.slice(0,i+1).reduce((x,v)=>x+v.length,0))):
    (()=>{let k=0;return originalPages.map(p=>{const a=[p[0],...original.slice(k,k+p.length-1)];k+=p.length-1;return a;});})(),
    originalPages,sourceStream,mode,sign,clock);
  assert.deepEqual(enc,originalPages,"Original roundtrip failed");
  const plant=encode(refPages,originalPages,sourceStream,mode,sign,clock);
  const decoded=decode(sourceStream,mode,sign,clock,plant);
  const expected=mode==="gp29"?reference:refPages.flatMap(p=>p.slice(1));
  assert.deepEqual(decoded,expected,"Native plaintext plant failed");
  plantChecks++;
  originalResults.push({cipher,ivType,clock,mode,sign,ioc:ioc(original),
    nativeIoC:ioc(expected),preview:preview(original)});
}
originalResults.sort((a,b)=>b.ioc-a.ioc);
const wrong=decode(stream("aes-256-ctr",wrongKey,zeroIV,originalAll.length),
  "gp28-log15",-1,"global",originalPages);
const rawGP28=originalPages.flatMap(page=>page.slice(1).map((v,j)=>
  mod(v-page[j],29)===0?28:log15[mod(v-page[j],29)]));
console.log(JSON.stringify({
  hypothesis:"Newton rows [15,27,21] plus p54 Ac root row24 => 32-byte key",
  sourceKeyRows:rowIndices,sourceKeyHex:key.toString("hex"),
  zeroIV:"00000000000000000000000000000000",gridIV:gridIV.toString("hex"),
  sourceGridSha256:crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  originalRunes:originalAll.length,originalPages:pages.length,models:settings.length,
  plantedControlChecks:plantChecks,
  originalGP29IoC:ioc(originalAll),originalRawGP28IoC:ioc(rawGP28),
  nativeGPReferenceIoC:ioc(reference),
  wrongKeyGP28IoC:ioc(wrong),
  maxOriginalIoC:originalResults[0].ioc,
  bestModels:originalResults.slice(0,10),
  minOriginalIoC:originalResults[originalResults.length-1].ioc,
  interpretation:"Finite, explicitly postulated source-row-key inversion; no claim of authentic plaintext"
},null,2));

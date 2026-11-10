"use strict";
/**
 * Use the complete corrected 256-byte base-60 grid as a 2048-bit RC4 key,
 * or digest to 256-bit AES/ChaCha keys. Compare page-reset vs global
 * keystream alignment and byte-to-rune mappings, with a planted control.
 * Reproduce: node sims/base60_fullkey_stream.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");
const {tableBytes,stream}=require("./base60_seeded_stream.cjs");
const pages=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"))
  .pages.filter(p=>p.status==="unsolved"&&p.indices.length);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
const MOD=29;
const RAND_SEED=0x35144a17;
/** @param {Buffer} b @param {string} hash */
function digest(b,hash){return createHash(hash).update(b).digest();}
/** @returns {Array<{name:string,key:Buffer,rc4Only:boolean}>} */
function keys(){
  const all=tableBytes(), reversed=Buffer.from(all).reverse();
  const colMajor=Buffer.from(Array.from({length:256},(_,i)=>all[(i%32)*8+Math.floor(i/32)]));
  return [
    {name:"table256",key:all,rc4Only:true},
    {name:"reverse256",key:reversed,rc4Only:true},
    {name:"sha256(table)",key:digest(all,"sha256"),rc4Only:false},
    {name:"sha256(reverse)",key:digest(reversed,"sha256"),rc4Only:false},
    {name:"sha256(column-major)",key:digest(colMajor,"sha256"),rc4Only:false},
    {name:"sha512(table):left",key:digest(all,"sha512").subarray(0,32),rc4Only:false},
    {name:"sha512(table):right",key:digest(all,"sha512").subarray(32),rc4Only:false},
    {name:"table:first32",key:all.subarray(0,32),rc4Only:false},
    {name:"table:last32",key:all.subarray(224),rc4Only:false}
  ];
}
/** @param {Buffer} b @param {"mod"|"scale"|"reject"} map @param {number} n */
function symbols(b,map,n){
  const out=new Uint8Array(n);
  let cursor=0;
  for(let t=0;t<n;t++){
    if(map==="reject"){
      while(b[cursor]>=232)cursor++;
      out[t]=b[cursor++]%MOD;
    }else{
      const x=b[cursor++];
      out[t]=map==="mod"?x%MOD:Math.floor(x*MOD/256);
    }
  }
  return out;
}
/** @param {number} n */
function streamLength(n){return n*2+64;}
/** @param {string} cipher @param {Buffer} key @param {string} mode @param {string} align @param {number} drop @param {string} map */
function keyPads(cipher,key,mode,align,drop,map){
  if(align==="global"){
    const total=pages.reduce((n,p)=>n+p.indices.length,0);
    const bytes=stream(cipher,key,"zero",0,streamLength(total),drop);
    const symbolsGlobal=symbols(bytes,map,total);
    let offset=0;
    return pages.map(p=>{
      const a=symbolsGlobal.subarray(offset,offset+p.indices.length);
      offset+=p.indices.length;return a;
    });
  }
  const cache=new Map();
  return pages.map(p=>{
    const id=mode==="zero"?0:p.page;
    if(!cache.has(id))
      cache.set(id,stream(cipher,key,mode,p.page,streamLength(
        mode==="zero"?Math.max(...pages.map(x=>x.indices.length)):p.indices.length
      ),drop));
    return symbols(cache.get(id),map,p.indices.length);
  });
}
/** @param {Array<Uint8Array>} ks @param {number} sign @param {Array<{page:number,indices:number[]}>} input */
function score(ks,sign,input){
  const hist=new Uint32Array(MOD);
  let n=0,localMax=-1,localPage=-1;
  for(let i=0;i<input.length;i++){
    const page=input[i],loc=new Uint32Array(MOD);
    for(let t=0;t<page.indices.length;t++){
      const value=(page.indices[t]+sign*ks[i][t]+MOD)%MOD;
      hist[value]++;loc[value]++;n++;
    }
    if(page.indices.length>=200){
      let sum=0;for(const f of loc)sum+=f*(f-1);
      const v=sum/(page.indices.length*(page.indices.length-1));
      if(v>localMax){localMax=v;localPage=page.page;}
    }
  }
  let sum=0;for(const f of hist)sum+=f*(f-1);
  return {overall:sum/(n*(n-1)),local:localMax,localPage};
}
/** @param {Array<{page:number,indices:number[]}>} input */
function scan(input){
  const fullkeys=keys(), ranked=[],local=[];
  for(const k of fullkeys)
    for(const cipher of ["rc4","aes-256-ctr","chacha20"]){
      if(k.rc4Only&&cipher!=="rc4")continue;
      for(const align of ["page","global"])
        for(const mode of align==="global"||cipher==="rc4"?["zero"]:["zero","last-le","last-be","first-le"])
          for(const drop of cipher==="rc4"?[0,256,3072]:[0,256])
            for(const map of ["mod","scale","reject"]){
              const ks=keyPads(cipher,k.key,mode,align,drop,map);
              for(const sign of [-1,1]){
                const v=score(ks,sign,input);
                const entry={key:k.name,cipher,align,iv:mode,drop,map,sign};
                ranked.push({...entry,ioc:v.overall});
                local.push({...entry,ioc:v.local,page:v.localPage});
              }
            }
    }
  ranked.sort((a,b)=>b.ioc-a.ioc);
  local.sort((a,b)=>b.ioc-a.ioc);
  return {tested:ranked.length,top:ranked.slice(0,12),local:local.slice(0,8)};
}
/** @param {number} seed */
function rng(seed){
  let s=seed|0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};
}
function plant(){
  const freq=new Float64Array(MOD);
  const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const cv=[24,17,5,23,18,0,6,8,10,11,5,20,19,9,3,13,5,4,15,16,1,1,7,14,26,15];
  const txt=fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp1-plaintext-reference.txt"),"utf8")
    .split("\n").filter(s=>!s.startsWith("#")).join("").toUpperCase().replace(/[^A-Z]/g,"");
  for(const char of txt)freq[cv[letters.indexOf(char)]]++;
  let total=0;
  const cdf=Array.from(freq,x=>(total+=x)/txt.length);
  const draw=rng(RAND_SEED);
  const secret=keys().find(k=>k.name==="table256");
  const streamKeys=keyPads("rc4",secret.key,"zero","global",256,"reject");
  let avoided=0;
  const synthetic=pages.map((p,j)=>{
    const indices=[];
    for(let i=0;i<p.indices.length;i++){
      const rand=draw(),plain=cdf.findIndex(x=>rand<x);
      assert.ok(plain>=0);
      let c=(plain+streamKeys[j][i])%MOD;
      if(i>0&&c===indices[i-1]&&draw()<0.81){
        c=(c+1+Math.floor(28*draw()))%MOD;avoided++;
      }
      indices.push(c);
    }
    return {page:p.page,indices};
  });
  return {synthetic,avoided};
}
function main(){
  const observed=scan(pages);
  const {synthetic,avoided}=plant();
  const positive=scan(synthetic);
  const trueMatch=x=>x.key==="table256"&&x.cipher==="rc4"&&x.align==="global"
    &&x.iv==="zero"&&x.drop===256&&x.map==="reject"&&x.sign===-1;
  console.log(JSON.stringify({
    source:"Canonical base-60 master + shared numeric rune corpus",
    tableSha256:digest(tableBytes(),"sha256").toString("hex"),
    observed,positive:{avoided,first:positive.top[0],correctTop: trueMatch(positive.top[0]),
      correctInTop12:positive.top.some(trueMatch),top3:positive.top.slice(0,3)}
  },null,2));
}
if(require.main===module)main();
module.exports={keys,symbols,keyPads,score,scan,plant};

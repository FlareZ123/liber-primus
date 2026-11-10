"use strict";
/**
 * A bounded attack: 8 x 32-byte keys from LP2's base-60 table, interpreted
 * as AES-256-CTR, ChaCha20 or RC4 keystreams and mapped to mod-29 runes.
 * Reproduce: node sims/base60_seeded_stream.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {createCipheriv,createHash}=require("node:crypto");
const root=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const master=fs.readFileSync(path.join(root,"resources/transcriptions/liber_primus_master.txt"),"utf8");
const sha="3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290";
const ab="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);

/** @returns {Buffer} */
function tableBytes(){
  const begin=master.indexOf("\n3N-3p-");
  assert.ok(begin>0);
  const end=master.indexOf("\n&",begin);
  assert.ok(end>begin);
  const cells=master.slice(begin,end).split(/[-/%\s]+/).filter(Boolean);
  assert.equal(cells.length,256);
  const b=Buffer.from(cells.map(s=>{
    assert.equal(s.length,2);
    const a=ab.indexOf(s[0]),z=ab.indexOf(s[1]);
    assert.ok(a>=0&&z>=0);
    const value=60*a+z;
    assert.ok(value>=0&&value<=255);
    return value;
  }));
  assert.equal(createHash("sha256").update(b).digest("hex"),sha);
  return b;
}

/** @param {Buffer} table @returns {Array<{name:string,key:Buffer}>} */
function keyList(table){
  const keys=[];
  for(const shape of ["row","column"])
    for(let n=0;n<8;n++){
      const k=shape==="row"
        ? Array.from(table.subarray(n*32,n*32+32))
        : Array.from({length:32},(_,r)=>table[8*r+n]);
      keys.push({name:shape+n+":forward",key:Buffer.from(k)});
      keys.push({name:shape+n+":reverse",key:Buffer.from([...k].reverse())});
    }
  assert.equal(keys.length,32);
  return keys;
}

/** @param {number} seed @returns {()=>number} */
function rand(seed){
  let s=seed|0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};
}

/** @param {Buffer} key @param {number} n @param {number} drop */
function rc4(key,n,drop){
  const S=Uint8Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){
    j=(j+S[i]+key[i%key.length])&255;
    const x=S[i];S[i]=S[j];S[j]=x;
  }
  let i=0;j=0;
  const out=Buffer.alloc(n);
  for(let t=0;t<drop+n;t++){
    i=(i+1)&255;j=(j+S[i])&255;
    const x=S[i];S[i]=S[j];S[j]=x;
    if(t>=drop)out[t-drop]=S[(S[i]+S[j])&255];
  }
  return out;
}

/** @param {string} mode @param {number} page */
function ivFor(mode,page){
  const iv=Buffer.alloc(16);
  if(mode==="last-le")iv.writeUInt32LE(page,12);
  if(mode==="last-be")iv.writeUInt32BE(page,12);
  if(mode==="first-le")iv.writeUInt32LE(page,0);
  return iv;
}

/** @param {string} cipher @param {Buffer} key @param {string} ivmode @param {number} page @param {number} n @param {number} drop */
function stream(cipher,key,ivmode,page,n,drop){
  if(cipher==="rc4")return rc4(key,n,drop);
  const enc=createCipheriv(cipher,key,ivFor(ivmode,page));
  const output=Buffer.concat([enc.update(Buffer.alloc(n+drop)),enc.final()]);
  return output.subarray(drop);
}

/** @param {Array<{page:number,indices:number[]}>} ps */
function ioc(ps){
  const a=new Uint32Array(29);
  let n=0;
  for(const p of ps)for(const c of p.indices){a[c]++;n++;}
  let v=0;for(const f of a)v+=f*(f-1);
  return v/(n*(n-1));
}

/** @param {Array<{page:number,indices:number[]}>} ps @param {Array<{name:string,key:Buffer}>} keys */
function scan(ps,keys){
  const top=[],topPage=[];
  let tested=0;
  const nmax=Math.max(...ps.map(p=>p.indices.length));
  for(const k of keys)
    for(const cipher of ["aes-256-ctr","chacha20","rc4"])
      for(const ivmode of cipher==="rc4"?["zero"]:["zero","last-le","last-be","first-le"])
        for(const drop of cipher==="rc4"?[0,256,3072]:[0,256]){
          const cache=new Map();
          for(const p of ps){
            const id=ivmode==="zero"?0:p.page;
            if(!cache.has(id))cache.set(id,stream(cipher,k.key,ivmode,p.page,nmax,drop));
          }
          for(const mapping of ["mod","scale"])for(const sign of [-1,1]){
            tested++;
            const hist=new Uint32Array(29);
            let count=0,maxPageIoC=-1,maxPage=null;
            for(const p of ps){
              const keyStream=cache.get(ivmode==="zero"?0:p.page);
              const local=new Uint32Array(29);
              for(let i=0;i<p.indices.length;i++){
                const x=keyStream[i];
                const keySymbol=mapping==="mod"?x%29:Math.floor(29*x/256);
                const y=(p.indices[i]+sign*keySymbol+29)%29;
                hist[y]++;local[y]++;
              }
              const n=p.indices.length;
              count+=n;
              if(n>=200){
                let s=0;for(const f of local)s+=f*(f-1);
                const score=s/(n*(n-1));
                if(score>maxPageIoC){maxPageIoC=score;maxPage=p.page;}
              }
            }
            let s=0;for(const f of hist)s+=f*(f-1);
            const desc={key:k.name,cipher,ivmode,drop,mapping,sign};
            top.push({...desc,ioc:s/(count*(count-1))});
            topPage.push({...desc,ioc:maxPageIoC,page:maxPage});
          }
        }
  top.sort((a,b)=>b.ioc-a.ioc);
  topPage.sort((a,b)=>b.ioc-a.ioc);
  return {tested,overall:top.slice(0,10),page:topPage.slice(0,10)};
}

/** @param {Array<{page:number,indices:number[]}>} shapes @param {Buffer} key */
function plant(shapes,key){
  const ref=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8")
    .split("\n").filter(s=>!s.startsWith("#")).join("").toUpperCase().replace(/[^A-Z]/g,"");
  const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const mapped=[24,17,5,23,18,0,6,8,10,11,5,20,19,9,3,13,5,4,15,16,1,1,7,14,26,15];
  const freq=new Uint32Array(29);
  for(const c of ref)freq[mapped[letters.indexOf(c)]]++;
  let total=0;const cdf=Array.from(freq,f=>(total+=f)/ref.length);
  const random=rand(0x41a53e91);
  return shapes.map(p=>{
    const ks=stream("aes-256-ctr",key,"zero",p.page,p.indices.length,0);
    const indices=[];
    for(let i=0;i<p.indices.length;i++){
      const r=random();
      const plain=cdf.findIndex(x=>r<x);
      assert.ok(plain>=0);
      let c=(plain+ks[i]%29)%29;
      if(i>0&&c===indices[i-1]&&random()<0.81)c=(c+1+Math.floor(28*random()))%29;
      indices.push(c);
    }
    return {page:p.page,indices};
  });
}
function main(){
  const keys=keyList(tableBytes());
  const observed=scan(pages,keys);
  const plantedKey=keys.find(k=>k.name==="column3:forward");
  assert.ok(plantedKey);
  const fake=plant(pages,plantedKey.key);
  const positive=scan(fake,keys);
  const criterion=o=>o.key==="column3:forward"&&o.cipher==="aes-256-ctr"
    &&o.ivmode==="zero"&&o.drop===0&&o.mapping==="mod"&&o.sign===-1;
  console.log(JSON.stringify({
    tableSha256:sha,source:"resources/transcriptions/liber_primus_master.txt",
    pages:pages.length,runes:12956,rawIoC:ioc(pages),
    observed,planted:{rawIoC:ioc(fake),top:positive.overall.slice(0,5),
      trueKeyRecoveredAtRankOne:criterion(positive.overall[0]),
      trueKeyInTopTen:positive.overall.some(criterion)}
  },null,2));
}
if(require.main===module)main();
module.exports={tableBytes,keyList,stream,scan,plant};
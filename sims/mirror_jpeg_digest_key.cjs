"use strict";
/**
 * SHA-256/HMAC expansion of the unusual LP1 05.jpg mirrored JPEG as
 * candidate LP2 keystream. Exact head Viterbi then full-page lengthen.
 * No unbounded dictionary and no claim of a plaintext oracle.
 * Reproduce: node sims/mirror_jpeg_digest_key.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {decode,encrypt,imageStreams}=require("./mirror_jpeg_pad.cjs");
const {headScore}=require("./mirror_jpeg_offsets.cjs");
const ROOT=path.join(__dirname,".."),HEAD=24,WINDOW=220;
const OFFSETS=[0,1,29,64,256,3301],OUT_BYTES=4200;
function digest(alg,bytes){return crypto.createHash(alg).update(bytes).digest();}
function counter(n,little=false){const b=Buffer.alloc(4);if(little)b.writeUInt32LE(n);else b.writeUInt32BE(n);return b;}
/**
 * @param {Buffer} seed
 * @param {string} mode SHA256 counter/HMAC/chain mode.
 * @returns {Buffer}
 */
function expand(seed,mode){
  let prev=seed;
  const parts=[],count=Math.ceil(OUT_BYTES/32);
  for(let i=0;i<count;i++){
    const little=mode.endsWith("-le");
    const c=counter(i,little);
    let b;
    if(mode.startsWith("prefix"))b=digest("sha256",Buffer.concat([c,seed]));
    else if(mode.startsWith("suffix"))b=digest("sha256",Buffer.concat([seed,c]));
    else if(mode==="chain")b=digest("sha256",prev);
    else if(mode.startsWith("hmac"))b=crypto.createHmac("sha256",seed).update(c).digest();
    else throw Error("Unknown expansion mode");
    parts.push(b);prev=b;
  }
  return Buffer.concat(parts).subarray(0,OUT_BYTES);
}
/** @param {Buffer} image */
function candidates(image){
  const sources=imageStreams(image);
  const out=[],modes=[
    "prefix-be","suffix-be","prefix-le","suffix-le","hmac-be","chain"
  ];
  for(const s of sources)for(const alg of ["sha256","sha512"]){
    const seed=digest(alg,s.bytes);
    for(const mode of modes){
      const raw=expand(seed,mode),name=s.name+":"+alg+":"+mode;
      out.push({name:name+":mod29",
        key:Uint8Array.from(raw,n=>n%29)});
      out.push({name:name+":scaled29",
        key:Uint8Array.from(raw,n=>Math.floor(n*29/256))});
    }
  }
  return out;
}
/**
 * @param {number[]} cipher
 * @param {{name:string,key:Uint8Array}[]} keys
 * @param {ReturnType<typeof train>} lm
 */
function scan(cipher,keys,lm){
  const best=[];
  for(const item of keys)for(const sign of [-1,1])for(const offset of OFFSETS){
    const score=headScore(cipher.slice(0,HEAD),item.key,offset,sign,lm);
    best.push({name:item.name,sign,offset,score});
  }
  best.sort((a,b)=>b.score-a.score);
  const extended=best.slice(0,140).map(x=>{
    const key=keys.find(y=>y.name===x.name).key;
    const d=decode(cipher,key,x.offset,x.sign,lm);
    return {...x,fullScore:d.perRune,skips:d.skips,
      first40:d.plain.slice(0,40)};
  });
  extended.sort((a,b)=>b.fullScore-a.fullScore);
  return {checked:best.length,bestHead:best[0],topFull:extended.slice(0,12)};
}
function main(){
  const image=fs.readFileSync(path.join(ROOT,"resources","liber-primus","05.jpg"));
  const keys=candidates(image);
  assert.equal(keys.length,96);
  const lm=train(fs.readFileSync(path.join(ROOT,
    "resources","control","shakespeare_first300k.txt"),"utf8"));
  const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources","liber-primus","lp2-corpus.json"),"utf8"));
  const solved=fs.readFileSync(path.join(ROOT,
    "resources","liber-primus","lp1-plaintext-reference.txt"),"utf8");
  const plain=encode(solved.split("### 3")[1].split("### 4")[0]).slice(0,WINDOW);
  const trueKey=keys.find(x=>x.name==="whole-jpeg:sha256:suffix-be:mod29");
  assert.ok(trueKey);
  const control=encrypt(plain,trueKey.key,29,1,0x305de011);
  const dec=decode(control.cipher,trueKey.key,29,1,lm);
  const exact=dec.plain.filter((p,i)=>p===plain[i]).length;
  const all=scan(control.cipher,keys,lm);
  const trueHead=headScore(control.cipher.slice(0,HEAD),trueKey.key,29,1,lm);
  let rank=1;
  for(const item of keys)for(const sign of [-1,1])for(const offset of OFFSETS){
    if(item.name===trueKey.name && sign===1 && offset===29)continue;
    if(headScore(control.cipher.slice(0,HEAD),item.key,offset,sign,lm)>trueHead)rank++;
  }
  console.log("CONTROL",JSON.stringify({
    length:WINDOW,candidates:all.checked,trueKey:trueKey.name,
    trueOffset:29,trueHeadScore:trueHead,rank,
    recovered:exact,plantSkips:control.skips,decodedSkips:dec.skips
  }));
  assert.ok(exact>=198);
  assert.ok(rank<=140);
  for(const page of [0,5]){
    const cipher=corpus.pages.find(p=>p.page===page).indices.slice(0,WINDOW);
    console.log("FINAL",JSON.stringify({page,window:cipher.length,
      ...scan(cipher,keys,lm)}));
  }
}
if(require.main===module)main();
module.exports={digest,expand,candidates,scan};

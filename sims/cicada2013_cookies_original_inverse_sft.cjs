"use strict";
/**
 * Original-LP2 inverse using the two 32-byte cookies documented on Cicada's
 * 2013 p7amjopgric7dfdi onion ("167" and "761", reverse-decimal prime names).
 *
 * Historical source:
 * https://github.com/neuroretransmit/cicada/blob/main/2013/007-fourth-onion/README.md
 * Authentic operation here is unknown: the cookies may be session tokens.
 * Original 2013 stages did use XOR, justifying a direct XOR probe; AES/ChaCha
 * are explicitly hypothesis-driven stream-cipher alternatives, not a source
 * instruction. Node.js 22, built-in modules only.
 *
 * SFT: node sims/cicada2013_cookies_original_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages = corpus.pages.filter(p=>p.page<56 && p.indices.length);
const original = pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);
const mod=(n,m)=>(n%m+m)%m;
const source = [
  ["167","6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6"],
  ["761","7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5"]
].map(([id,hex])=>[id,Buffer.from(hex,"hex")]);
assert(source.every(([,data])=>data.length===32));
const sourceXor=Buffer.from(source[0][1].map((b,i)=>b^source[1][1][i]));
assert.equal(sourceXor.toString("hex"),
  "12801087a3f677416d7e68ee8585e4297c07fa8a46eb27a80d135b2ae7031a03");

/** @param {number[]} a @param {number} start @param {number} end @returns {number} */
function normIoC(a,start,end) {
  const f=new Uint32Array(29);
  for(let i=start;i<end;i++)f[a[i]]++;
  let sum=0;
  for(const n of f)sum+=n*(n-1);
  return 29*sum/((end-start)*(end-start-1));
}
/** @param {number[]} cipher @param {Buffer} pad @param {"add"|"exclude"} family @param {"mod"|"scale"} projection @param {1|-1} sign @param {boolean} encode @returns {number[]} */
function transform(cipher,pad,family,projection,sign,encode) {
  assert.equal(cipher.length,original.length);
  const out=new Array(cipher.length);
  let at=0;
  for(const page of pages){
    let prev=-1;
    for(let j=0;j<page.indices.length;j++){
      const i=at+j,v=cipher[i],period=family==="add"?29:28;
      const k=projection==="mod"?pad[i]%period:Math.floor(pad[i]*period/256);
      let w;
      if(family==="add")w=mod(v+(encode?-1:1)*sign*k,29);
      else if(prev<0)w=v;
      else if(encode)w=v===28?prev:mod(prev+1+mod(v+sign*k,28),29);
      else w=v===prev?28:mod(mod(v-prev-1,29)-sign*k,28);
      out[i]=w;
      if(family==="exclude")prev=encode?w:v;
    }
    at+=page.indices.length;
  }
  assert.equal(at,cipher.length);
  return out;
}
/** @param {Buffer} key @param {Buffer} iv @param {string} algorithm @param {number} n @returns {Buffer} */
function keystream(key,iv,algorithm,n) {
  const cipher=crypto.createCipheriv(algorithm,key,iv);
  return Buffer.concat([cipher.update(Buffer.alloc(n)),cipher.final()]);
}
/** @param {Buffer} key @param {Buffer} iv @param {string} algorithm @param {"book"|"page"} reset @returns {Buffer} */
function fullStream(key,iv,algorithm,reset){
  if(reset==="book")return keystream(key,iv,algorithm,original.length);
  return Buffer.concat(pages.map(p=>keystream(key,iv,algorithm,p.indices.length)));
}
/** @param {string} text @returns {number[]} */
function transliterate(text){
  const tokens=corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    const local=[];
    for(let j=0;j<word.length;){
      const t=tokens.find(q=>word.startsWith(q.s,j));
      if(!t){local.length=0;break;}
      local.push(t.i);j+=t.s.length;
    }
    out.push(...local);
  }
  return out;
}
const nativeSource=fs.readFileSync(path.join(root,
  "resources/liber-primus/lp1-plaintext-reference.txt"),"utf8")
  .split(/\r?\n/).filter(x=>!x.startsWith("#")).join(" ");
const native=transliterate(nativeSource);
assert(native.length>3000);
const plant=Array.from({length:original.length},(_,i)=>native[i%native.length]);
assert(normIoC(plant,0,6000)>1.15);
const runs=[];
const allKeys=[
  ["2013-cookie-167",source[0][1]],
  ["2013-cookie-761",source[1][1]]
];
const directPads=[
  ["cookie-167",source[0][1]],
  ["cookie-761",source[1][1]],
  ["cookie-167-XOR-761",sourceXor]
];
/**
 * @param {string} sourceName
 * @param {Buffer} pad
 * @param {string} reset
 * @param {string} algorithm
 * @param {string} ivLabel
 * @returns {void}
 */
function probe(sourceName,pad,reset,algorithm,ivLabel) {
  for(const family of ["add","exclude"])
  for(const projection of ["mod","scale"])
  for(const sign of /** @type {Array<1|-1>} */ ([-1,1])) {
    const decoded=transform(original,pad,family,projection,sign,false);
    assert.deepEqual(transform(decoded,pad,family,projection,sign,true),original);
    const plantedCipher=transform(plant,pad,family,projection,sign,true);
    assert.deepEqual(transform(plantedCipher,pad,family,projection,sign,false),plant);
    runs.push({source:sourceName,algorithm,iv:ivLabel,reset,family,projection,sign,
      trainIoC:normIoC(decoded,0,6000),heldoutIoC:normIoC(decoded,6000,original.length),
      prefix:decoded.slice(0,50).map(i=>corpus.translit[i]).join("")});
  }
}
for(const [name,pad] of directPads)for(const reset of ["book","page"]){
  const byteStream=Buffer.alloc(original.length);
  let k=0,loc=0;
  for(const page of pages){
    if(reset==="page")k=0;
    for(let j=0;j<page.indices.length;j++){
      byteStream[loc++]=pad[k++%pad.length];
    }
  }
  probe(name,byteStream,reset,"literal-periodic-XOR-source","none");
}
for(const [id,key] of allKeys){
  const other=source.find(x=>x[0]!==id)[1];
  const ivs=[
    ["zero",Buffer.alloc(16)],
    ["other-cookie-head",other.subarray(0,16)],
    ["other-cookie-tail",other.subarray(16)]
  ];
  for(const [ivLabel,iv] of ivs)
  for(const algorithm of ["aes-256-ctr","chacha20"])
  for(const reset of ["book","page"]){
    const pad=fullStream(key,iv,algorithm,reset);
    probe(id,pad,reset,algorithm,ivLabel);
  }
}
assert.equal(runs.length,240);
const trainSorted=runs.slice().sort((a,b)=>b.trainIoC-a.trainIoC);
const heldoutSorted=runs.slice().sort((a,b)=>b.heldoutIoC-a.heldoutIoC);
console.log(JSON.stringify({
  historicalInput:"2013 p7amjopgric7dfdi.onion reverse-prime 167/761 32-byte cookies (secondary archive)",
  caveat:"No authenticated source instruction uses the cookies as LP2 keys or prescribes AES/ChaCha",
  originalRunes:original.length,originalNormalizedIoC:normIoC(original,0,original.length),
  nativePlantNormalizedIoC:normIoC(plant,0,original.length),
  nativePlantRecovered:original.length,
  invertibleOriginalModels:runs.length,
  trainTop10:trainSorted.slice(0,10),
  heldoutTop10:heldoutSorted.slice(0,10)
},null,2));

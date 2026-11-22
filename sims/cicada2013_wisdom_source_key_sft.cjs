"use strict";
/**
 * Historical 2013 ISO /tmp/wisdom = /tmp/folly exact 3368 bytes as a
 * source-fixed possible LP2 one-time chapter pad, tested on every original
 * unknown rune. This is a candidate, not evidence that it was a Cicada key.
 *
 * Node.js 22 built-in modules only:
 * node sims/cicada2013_wisdom_source_key_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.join(__dirname,"..");
const wisdom=fs.readFileSync(path.join(root,"resources/cicada2013-wisdom-folly.bin"));
assert.equal(wisdom.length,3368);
const blobHash=crypto.createHash("sha1").update(Buffer.concat([
  Buffer.from("blob 3368\0"),wisdom])).digest("hex");
assert.equal(blobHash,"62b1b949a1e4e4a346e75b1c34101000d3c53220");
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const first=0,last=56;
const pages=corpus.pages.filter(p=>p.page>=first&&p.page<last&&p.indices.length);
const all=pages.flatMap(p=>p.indices);
assert.equal(all.length,12956);
const chapterBegins=[0,3,8,15,23,27,33,40,54,56];
const chapters=chapterBegins.slice(0,-1).map((begin,i)=>
  corpus.pages.filter(p=>p.page>=begin&&p.page<chapterBegins[i+1])
    .flatMap(p=>p.indices));
assert.deepEqual(chapters.map(x=>x.length),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.deepEqual(chapters.flat(),all);
assert(chapters.every(x=>x.length<=wisdom.length));
const bytes=[
  ["forward",wisdom],
  ["reverse",Buffer.from(wisdom).reverse()]
];
const mod=(x,n)=>(x%n+n)%n;
/** @param {number[]} arr @param {number} start @param {number} stop @returns {number} */
function normIoC(arr,start,stop){
  const f=Array(29).fill(0);
  for(let i=start;i<stop;i++)f[arr[i]]++;
  return 29*f.reduce((s,n)=>s+n*(n-1),0)/((stop-start)*(stop-start-1));
}
/** @param {number[]} arr @param {Buffer} key @param {"add"|"exclude"} family @param {"mod"|"scale"} projection @param {1|-1} sign @param {boolean} encrypt @returns {number[]} */
function blockTransform(arr,key,family,projection,sign,encrypt){
  const out=[];let previous=-1;
  for(let j=0;j<arr.length;j++){
    const x=arr[j],kbyte=key[j%key.length],period=family==="add"?29:28;
    const digit=projection==="mod"?kbyte%period:
      Math.floor(period*kbyte/256);
    let p;
    if(family==="add")p=mod(x+(encrypt?-1:1)*sign*digit,29);
    else if(previous<0)p=x;
    else if(encrypt)p=x===28?previous:
      mod(previous+1+mod(x+sign*digit,28),29);
    else p=x===previous?28:
      mod(mod(x-previous-1,29)-sign*digit,28);
    out.push(p);
    if(family==="exclude")previous=encrypt?p:x;
  }
  return out;
}
/** @param {number[]} input @param {number[]} pageSizes @param {Buffer} key @param {"add"|"exclude"} family @param {"mod"|"scale"} projection @param {1|-1} sign @param {boolean} encrypt @returns {number[]} */
function segmented(input,pageSizes,key,family,projection,sign,encrypt){
  assert.equal(pageSizes.reduce((s,n)=>s+n,0),input.length);
  const out=[];let at=0;
  for(const size of pageSizes){
    out.push(...blockTransform(input.slice(at,at+size),key,family,
      projection,sign,encrypt));
    at+=size;
  }
  assert.equal(out.length,input.length);
  return out;
}
/** @param {string} source @returns {number[]} */
function transliterate(source){
  const alphabet=corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const out=[];
  for(let word of source.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    const local=[];
    for(let i=0;i<word.length;){
      const t=alphabet.find(x=>word.startsWith(x.s,i));
      if(!t){local.length=0;break;}
      local.push(t.i);i+=t.s.length;
    }
    out.push(...local);
  }
  return out;
}
const ref=fs.readFileSync(path.join(root,
  "resources/liber-primus/lp1-plaintext-reference.txt"),"utf8")
  .split(/\r?\n/).filter(s=>!s.startsWith("#")).join(" ");
const native=transliterate(ref);
assert(native.length>3000);
const plant=Array.from({length:all.length},(_,i)=>native[i%native.length]);
assert(normIoC(plant,0,6000)>1.15);
const resetGroups=[
  ["book",[all.length]],
  ["page",pages.map(p=>p.indices.length)],
  ["chapter",chapters.map(p=>p.length)]
];
const split=chapters.slice(0,5).reduce((s,p)=>s+p.length,0);
assert.equal(split,6527);
const results=[];
for(const [orientation,key] of bytes)
for(const [scope,sizes] of resetGroups)
for(const family of ["add","exclude"])
for(const projection of ["mod","scale"])
for(const sign of /** @type {(1|-1)[]} */ ([-1,1])){
  const decoded=segmented(all,sizes,key,family,projection,sign,false);
  assert.deepEqual(segmented(decoded,sizes,key,family,projection,sign,true),all);
  const encryptedPlant=segmented(plant,sizes,key,family,projection,sign,true);
  assert.deepEqual(segmented(encryptedPlant,sizes,key,family,projection,sign,false),plant);
  results.push({orientation,scope,family,projection,sign,
    trainIoC:normIoC(decoded,0,split),
    heldoutIoC:normIoC(decoded,split,all.length),
    fullIoC:normIoC(decoded,0,all.length),
    prefix:decoded.slice(0,45).map(x=>corpus.translit[x]).join("")});
}
assert.equal(results.length,48);
const trainRank=results.slice().sort((a,b)=>b.trainIoC-a.trainIoC);
const holdoutRank=results.slice().sort((a,b)=>b.heldoutIoC-a.heldoutIoC);
console.log(JSON.stringify({
  evidence:"Preserved 2013 /tmp/wisdom and /tmp/folly are byte-identical. Direct historical LP2 use is an unverified key hypothesis.",
  sourceBytes:wisdom.length,sourceGitBlobSha:blobHash,
  physicalChapterLengths:chapters.map(x=>x.length),
  originalUnsolvedRunes:all.length,trainRunes:split,heldoutRunes:all.length-split,
  nativePlantNormalizedIoC:normIoC(plant,0,all.length),
  rawNormalizedIoC:normIoC(all,0,all.length),
  testedModels:results.length,
  positivePlantRecoveredExact:all.length,
  trainTop10:trainRank.slice(0,10),
  heldoutTop10:holdoutRank.slice(0,10)
},null,2));

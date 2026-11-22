"use strict";
/** 31 original thirteen-dot marks delimit 32 source fragments. Test whether their
 * 8-byte hashes form the printed 32×8 byte grid. CommonJS Node.js 22, read-only. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const grid=read("resources/liber-primus/lp2-grid-256.json").pages.flatMap(p=>p.bytes);
const annotations=new Map(ink.pages.map(p=>[p.page,p]));
const fragments=[];let fragment=[],marks=0;
for(const page of corpus.pages){
  const positions=new Map();
  for(const mark of annotations.get(page.page)?.large_punctuation||[])
    if(mark[1]===13)positions.set(mark[0],(positions.get(mark[0])||0)+1);
  for(let i=0;i<=page.indices.length;i++){
    for(let k=0;k<(positions.get(i)||0);k++){fragments.push(fragment);fragment=[];marks++;}
    if(i<page.indices.length)fragment.push(page.indices[i]);
  }
}
fragments.push(fragment);
assert.equal(marks,31);assert.equal(fragments.length,32);
assert.equal(fragments.flat().length,13136);assert.equal(grid.length,256);
assert.equal(crypto.createHash("sha256").update("abc").digest("hex"),
  "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
const rows=Array.from({length:32},(_,i)=>Buffer.from(grid.slice(i*8,i*8+8)));
const sources={
 index:a=>Buffer.from(a),plus1:a=>Buffer.from(a.map(x=>x+1)),
 prime:a=>Buffer.from(a.map(x=>corpus.prime[x])),
 rune:a=>Buffer.from(a.map(x=>corpus.runes[x]).join(""),"utf8"),
 latin:a=>Buffer.from(a.map(x=>corpus.translit[x]).join(""),"utf8"),
 lower:a=>Buffer.from(a.map(x=>corpus.translit[x].toLowerCase()).join(""),"utf8"),
 decimal:a=>Buffer.from(a.join(","),"utf8"),
 primeDecimal:a=>Buffer.from(a.map(x=>corpus.prime[x]).join(","),"utf8")
};
const algos=["sha256","sha3-256","blake2s256","sha512","blake2b512","sha1","md5"];
const hash=(buf,algo)=>crypto.createHash(algo).update(buf).digest();
let compared=0,best={prefix:0},matches=[];
for(let f=0;f<32;f++)for(const [encoding,encode] of Object.entries(sources))
for(const direction of [1,-1]){
 const payload=encode(direction===1?fragments[f]:[...fragments[f]].reverse());
 for(const algo of algos){
  const full=hash(payload,algo);
  for(const side of ["head","tail"]){
   const digest=side==="head"?full.subarray(0,8):full.subarray(-8);
   for(let r=0;r<32;r++)for(const reverse of [false,true]){
    const row=reverse?Buffer.from(rows[r]).reverse():rows[r];compared++;
    let prefix=0;while(prefix<8&&row[prefix]===digest[prefix])prefix++;
    const state={prefix,f,r,encoding,direction,algo,side,reverse};
    if(prefix>best.prefix)best=state;
    if(prefix===8)matches.push(state);
   }
  }
 }
}
const synthetic=fragments.map(a=>hash(sources.index(a),"sha256").subarray(0,8));
assert.equal(synthetic.length,32);
for(let i=0;i<32;i++)assert.ok(synthetic[i].equals(hash(sources.index(fragments[i]),"sha256").subarray(0,8)));
console.log(JSON.stringify({marks,fragments:fragments.length,fragmentLengths:fragments.map(a=>a.length),
  sourceRunes:fragments.flat().length,algos,encodings:Object.keys(sources),tested:compared,
  exactMatches:matches,best,positiveControl:"32 of 32 correct synthetic fragment hash rows"},null,2));

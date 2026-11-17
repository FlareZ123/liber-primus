"use strict";
/**
 * Finite author-era checksum interpretation of p50's 32x8 printed table:
 * each printed column is 32 bytes, potentially SHA-256 of one red chapter title.
 * No fitted key, offsets, or mutable source text. Node 22 SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
assert.equal(grid.bytes.length,256);
assert.equal(grid.shape.rows,32);
assert.equal(grid.shape.cols,8);
const columns=Array.from({length:8},(_,column)=>Buffer.from(grid.bytes.filter((_,i)=>i%8===column)));
const chunks=Array.from({length:8},(_,i)=>Buffer.from(grid.bytes.slice(32*i,32*i+32)));
assert(columns.every(c=>c.length===32));
assert(chunks.every(c=>c.length===32));
const redStarts=[0,3,8,15,23,27,33,40];
const redItems=redStarts.map(page=>{
  const p=corpus.pages.find(p=>p.page===page);
  const a=ink.pages.find(p=>p.page===page);
  const span=a.red_spans.find(x=>x.start===0);
  assert(span,"missing first red span on p"+page);
  const indexes=p.indices.slice(0,span.length);
  assert.equal(indexes.length,span.length);
  assert.equal(indexes.map(i=>corpus.runes[i]).join(""),span.runes);
  return {page,indexes,runes:span.runes};
});
const representations=[
  {name:"original UTF8 rune glyph bytes",bytes:r=>Buffer.from(r.runes,"utf8")},
  {name:"GP29 zero-index values as bytes",bytes:r=>Buffer.from(r.indexes)},
  {name:"GP29 one-index values as bytes",bytes:r=>Buffer.from(r.indexes.map(i=>i+1))},
  {name:"GP assigned prime values as bytes",bytes:r=>Buffer.from(r.indexes.map(i=>corpus.prime[i]))},
  {name:"GP uppercase latin romanization",bytes:r=>Buffer.from(r.indexes.map(i=>corpus.translit[i]).join(""),"utf8")}
];
const exact=[];
for(const {name,bytes} of representations)for(const title of redItems){
  const digest=crypto.createHash("sha256").update(bytes(title)).digest();
  for(const [layout,target] of [["printed-column",columns],["row-contiguous-32",chunks]]){
    for(let i=0;i<8;i++)if(digest.equals(target[i]))exact.push({layout,index:i,title: title.page,representation:name});
  }
}
const digestToHex=b=>crypto.createHash("sha256").update(b).digest("hex");
const test=Buffer.from("abc");
assert.equal(digestToHex(test),"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
const positive=columns.map((col,i)=>({col:i,digest:digestToHex(col)}));
assert.equal(exact.length,0,"An exact original source digest match has been found; needs interpretation.");
console.log(JSON.stringify({testedTitles:redItems.map(x=>[x.page,x.indexes.length]),serializers:representations.map(x=>x.name),layouts:["eight printed 32-byte columns","eight contiguous 32-byte pieces"],sha256Evaluations:representations.length*8,exactMatches:exact,positiveControls:positive.length,warning:"Only direct SHA-256 of printed red headings is excluded; no new plaintext or key."},null,2));

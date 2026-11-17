"use strict";
/**
 * Bounded original LP2 word-order test of the authentic historical 14-column
 * Cicada order. Word-length MI is a diagnostic; this does not decrypt LP2.
 * Node.js 22 CommonJS, no writes, no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/liber-primus/lp2-transcription.txt");
const runeSet = new Set(gp.runes);
const ends = [158,255,383,437,224,326,378,669,66];
const order = [2,8,9,1,12,13,11,4,5,7,3,0,6,10];
const width = order.length;
const K = 12;

/** @returns {number[]} Original printed words, joining line/page carries. */
function words() {
  const out = [];
  let len = 0, runes = 0;
  for (const ch of text) {
    if (runeSet.has(ch)) {
      len++; runes++;
      if (runes === 12956) { out.push(len); break; }
    } else if (ch === "-" || ch === "." || ch === "&") {
      if (len) out.push(len);
      len = 0;
    }
  }
  assert.equal(runes, 12956);
  assert.equal(out.length, 2896);
  return out;
}
/** @param {number[]} x @returns {number[][]} */
function split(x) {
  let at = 0;
  return ends.map(n => { const y=x.slice(at,at+n); at+=n; return y; });
}
/** @param {number[]} x @returns {number} */
function mi(x) {
  const joint=new Float64Array(K*K), a=new Float64Array(K), b=new Float64Array(K);
  let n=0;
  for (const group of split(x)) for(let i=1;i<group.length;i++) {
    const u=Math.min(11,group[i-1]-1),v=Math.min(11,group[i]-1);
    joint[u*K+v]++; a[u]++; b[v]++; n++;
  }
  let value=0;
  for(let u=0;u<K;u++) for(let v=0;v<K;v++) {
    const z=joint[u*K+v];
    if(z) value+=z/n*Math.log(z*n/(a[u]*b[v]));
  }
  return value;
}
/** @param {number[]} x @returns {number[]} */
function columnForward(x) {
  const out=[],rows=Math.ceil(x.length/width);
  for(const col of order) for(let r=0;r<rows;r++)
    if(r*width+col<x.length) out.push(x[r*width+col]);
  return out;
}
/** @param {number[]} x @returns {number[]} */
function columnInverse(x) {
  const out=Array(x.length),rows=Math.ceil(x.length/width);
  let at=0;
  for(const col of order) for(let r=0;r<rows;r++)
    if(r*width+col<x.length) out[r*width+col]=x[at++];
  return out;
}
/** @param {number[]} x @returns {number[]} */
function rowForward(x) {
  const out=[];
  for(let i=0;i<x.length;i+=width) {
    const block=x.slice(i,i+width);
    for(const col of order) if(col<block.length) out.push(block[col]);
  }
  return out;
}
/** @param {number[]} x @returns {number[]} */
function rowInverse(x) {
  const out=[];
  for(let i=0;i<x.length;i+=width) {
    const block=x.slice(i,i+width),restored=Array(block.length);
    let at=0;
    for(const col of order) if(col<block.length) restored[col]=block[at++];
    out.push(...restored);
  }
  return out;
}
/** @param {number[]} x @param {(x:number[])=>number[]} fn @returns {number[]} */
function perChapter(x,fn) {return split(x).flatMap(fn);}
const candidates={
  "literal":x=>x,
  "chapter/column-forward":x=>perChapter(x,columnForward),
  "chapter/column-inverse":x=>perChapter(x,columnInverse),
  "chapter/row-forward":x=>perChapter(x,rowForward),
  "chapter/row-inverse":x=>perChapter(x,rowInverse),
  "global/column-forward":columnForward,
  "global/column-inverse":columnInverse,
  "global/row-forward":rowForward,
  "global/row-inverse":rowInverse
};
const original=words();
assert.equal(ends.reduce((a,b)=>a+b),original.length);
for(const group of split(original)) {
  assert.deepEqual(columnInverse(columnForward(group)),group);
  assert.deepEqual(rowInverse(rowForward(group)),group);
}
const observed=Object.entries(candidates)
  .map(([name,fn])=>({name,mi:mi(fn(original))}))
  .sort((a,b)=>b.mi-a.mi);
let seed=0x330114;
/** @returns {number} */
function random() {
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296;
}
/** @param {number[]} x @returns {number[]} */
function shuffle(x) {
  const y=x.slice();
  for(let i=y.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [y[i],y[j]]=[y[j],y[i]];
  }
  return y;
}
const n=600,maxima=[];
for(let t=0;t<n;t++) {
  const x=split(original).flatMap(shuffle);
  maxima.push(Math.max(...Object.values(candidates).map(fn=>mi(fn(x)))));
}
maxima.sort((a,b)=>a-b);
console.log(JSON.stringify({
  source:{runes:12956,words:original.length,chapterWordCounts:ends},
  originalColumnOrder:order,
  observed,
  familywiseNull:{
    count:n,shuffleSeed:"0x330114",
    mean:maxima.reduce((a,b)=>a+b,0)/n,
    p025:maxima[Math.floor(.025*n)],
    median:maxima[Math.floor(.5*n)],
    p975:maxima[Math.floor(.975*n)],
    upperP:(1+maxima.filter(v=>v>=observed[0].mi).length)/(n+1)
  },
  conclusion:"No tested historical 14-column word-order inverse restores native English word-length adjacency"
},null,2));

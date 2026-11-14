"use strict";
/**
 * Director #864: source-fixed, minimal pre-2014 operator grammar.
 * Original 32x8 table -> 256 source numerals -> 76 withheld p55 plus
 * 85 independently deciphered p56 and 95 original clear p57 runes.
 *
 * Two physically specified walks only: printed row-major, or clockwise
 * top-left outer-to-inner four concentric rings. Freeze depth<=2:
 * an original byte operation {identity, nibbleSwap, 3-digit-reverse}
 * then a GP29 invertible symbol operation {identity, Atbash, negation}.
 * All byte operators are bijections on their stated 3-decimal-digit
 * or byte domain. The final base29 byte->rune residue is a noninjective
 * projection and requires a separate reversible byte framing if ANY
 * candidate were to work; do not call this a complete cipher inverse.
 * No fitted key/constant/symbol permutation/phase/reset/word mask.
 *
 * Train on solved p56's 85 original runes, blind-validate on p57's 95.
 * Repeat with reverse split. Show entire frozen family and heldout counts.
 * A source-native planted full-sized known-text input must recover 180/180.
 *
 * Windows 11 / Node.js 22:
 * node sims/lp2_p50_terminal_historical_minidsl_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..");
const read=name=>JSON.parse(fs.readFileSync(path.join(ROOT,name),"utf8"));
const db=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
const original=grid.bytes;
assert.equal(original.length,256);
assert.deepEqual([db.pages[55].indices.length,db.pages[56].indices.length,
  db.pages[57].indices.length],[76,85,95]);
const mod=x=>(x%29+29)%29;
function primes(count) {
  const out=[];
  for(let k=2;out.length<count;k++){
    if(out.every(p=>k%p!==0))out.push(k);
  }
  return out;
}
const prime=primes(100);
const raw56=db.pages[56].indices;
let clock=0;
const plain56=raw56.map((c,i)=>i===56?0:mod(c-(prime[clock++]-1)));
assert.equal(clock,84);
const plain57=db.pages[57].indices;
const plain180=plain56.concat(plain57);
assert.equal(plain180.length,180);
const token=db.translit.map((s,index)=>({s,index}))
  .sort((a,b)=>b.s.length-a.s.length);
function encodeGP(str) {
 const out=[];
 for(const word of str.split(" "))for(let i=0;i<word.length;){
  const t=token.find(t=>word.startsWith(t.s,i));
  assert.ok(t,"Unknown original GP token in solved source: "+word.slice(i));
  out.push(t.index);i+=t.s.length;
 }
 return out;
}
assert.deepEqual(plain56,encodeGP(
 "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"));
const rings=[];
for(let d=0;d<4;d++){
 const ids=[];
 for(let x=d;x<=7-d;x++)ids.push(8*d+x);
 for(let y=d+1;y<=31-d;y++)ids.push(8*y+7-d);
 for(let x=6-d;x>=d;x--)ids.push(8*(31-d)+x);
 for(let y=30-d;y>d;y--)ids.push(8*y+d);
 rings.push(ids);
}
assert.deepEqual(rings.map(x=>x.length),[76,68,60,52]);
const walks=[
 {name:"rowMajor",indices:Array.from({length:256},(_,i)=>i)},
 {name:"clockwiseRings",indices:rings.flat()}
];
for(const w of walks){
 assert.equal(w.indices.length,256);
 assert.equal(new Set(w.indices).size,256);
}
const bytes=[
 {name:"identity",cost:0,f:b=>b},
 {name:"nibbleSwap",cost:1,f:b=>(b>>4)|((b&15)<<4)},
 {name:"reverse3Decimal",cost:1,
  f:b=>Number(String(b).padStart(3,"0").split("").reverse().join(""))}
];
const rune=[
 {name:"identity",cost:0,f:x=>x},
 {name:"atbash",cost:1,f:x=>28-x},
 {name:"negate",cost:1,f:x=>mod(-x)}
];
/** @param {number[]} table @param {{indices:number[]}} walk @param {{f:(b:number)=>number}} b @param {{f:(r:number)=>number}} r */
function decode(table,walk,b,r) {
 return walk.indices.slice(76).map(i=>r.f(mod(b.f(table[i]))));
}
/** @param {number[]} candidate @param {number[]} reference @returns {number} */
function matches(candidate,reference){
 assert.equal(candidate.length,reference.length);
 return candidate.reduce((n,v,i)=>n+(v===reference[i]?1:0),0);
}
function evaluate(table) {
 const rows=[];
 for(const w of walks)for(const b of bytes)for(const r of rune){
  const candidate=decode(table,w,b,r);
  rows.push({walk:w.name,byte:b.name,gp:r.name,
   depth:b.cost+r.cost,cost:b.cost+r.cost,
   p56Train:matches(candidate.slice(0,85),plain56),
   p57Holdout:matches(candidate.slice(85),plain57),
   gpProjectionExactReversible:false});
 }
 rows.sort((a,b)=>b.p56Train-a.p56Train||a.cost-b.cost||
   a.walk.localeCompare(b.walk)||a.byte.localeCompare(b.byte)||
   a.gp.localeCompare(b.gp));
 return rows;
}
function run(){
 const all=evaluate(original);
 assert.equal(all.length,18);
 const best56=all[0];
 const reverse=all.slice().sort((a,b)=>b.p57Holdout-a.p57Holdout||
   a.cost-b.cost||a.walk.localeCompare(b.walk)||
   a.byte.localeCompare(b.byte)||a.gp.localeCompare(b.gp));
 const wrong=evaluate(original.slice().reverse());
 const plants=walks.map(w=>{
  const data=original.slice();
  w.indices.slice(76).forEach((index,i)=>data[index]=plain180[i]);
  const candidate=decode(data,w,bytes[0],rune[0]);
  assert.deepEqual(candidate,plain180,
   "Source-native 180 runes must round-trip into the original table layout.");
  return {walk:w.name,train:matches(candidate.slice(0,85),plain56),
   holdout:matches(candidate.slice(85),plain57)};
 });
 assert.ok(all.every(x=>x.p56Train<85 || x.p57Holdout<95),
  "Do not consume unknown p55 unless a unique genuine 180/180 source decoder succeeds.");
 const result={
  task:"Director #864 minimal source historical byte/rune operator DSL",
  frozenWalks:walks.map(w=>w.name),frozenByteOps:bytes.map(x=>x.name),
  frozenRuneOps:rune.map(x=>x.name),programCount:all.length,
  modelSelection:"rank by first 85 original solved p56 matches, then minimal depth; p57 heldout",
  originalBestP56:best56,
  topFiveP56:all.slice(0,5),
  reverseSplitBestP57:reverse[0],
  allFrozenPrograms:all,
  bestWrongGridP56:wrong[0],
  exactSyntheticNativePlants:plants,
  conclusion:"Only a 180/180 matched source-picked decoder with an independently specified byte-to-rune sidecar licenses decoding p55; otherwise report finite negative."
 };
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(require.main===module)run();
module.exports={run,evaluate,decode};

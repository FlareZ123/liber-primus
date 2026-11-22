"use strict";
/**
 * Test the newly calibrated but provisional source graph × HG polynomial
 * factor bridge as an actual reversible unknown-page cipher decoder.
 *
 * Source p50 prints a 256-byte table. Its functional pointer graph has
 * one 252-node component and a disjoint four-node component. The historical
 * BASE29 H factor and p39 red G factor divide the source codeword, giving
 * an exactly 252-rune GF29 quotient. Assign quotient symbols to the 252
 * source graph addresses in ascending printed order, then read them by the
 * table's unkeyed reverse-pointer forest walk (ascending children).
 *
 * Frozen source-native variation:
 * - traversal begins at cycle node0 (first table cell), or node197
 *   (cycle entry reached from historical signed-2014 whitespace seed178);
 * - preorder or postorder, forward or reverse read;
 * - keyed stream is quotient Q or original main-basin residues;
 * - key clock continuous across p0–p55 or reset at each physical page;
 * - additive GP29 decrypt sign ±.
 * No free phases, fitted key, optimized tree roots, or plaintext edits.
 *
 * This models a possible original human route. Nothing in the manuscript
 * authenticates the tree walk, quotient assignment or cipher mode.
 * SFT: node sims/lp2_p50_hg_quotient_forest_key_original_sft.cjs
 * Windows11, Node22, CommonJS, read-only.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const ROOT=path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const B=table.bytes;
assert.equal(B.length,256);
const mod29=n=>(n%29+29)%29;
const F=[12,17,11,21,23];
const quotient=[];
const work=B.map(mod29);
for(let i=0;i<=B.length-F.length;i++){
 const q=mod29(work[i]*17);
 quotient.push(q);
 for(let j=0;j<F.length;j++)
  work[i+j]=mod29(work[i+j]-q*F[j]);
}
assert.equal(quotient.length,252);
assert.deepEqual(work.slice(252),[0,0,0,0]);
const small=new Set([9,158,227,249]);
const main=Array.from({length:256},(_,i)=>i).filter(i=>!small.has(i));
assert.equal(main.length,252);
for(const i of main)assert(main.includes(B[i]));
for(const i of small)assert(small.has(B[i]));
const children=Array.from({length:256},()=>[]);
for(const i of main)children[B[i]].push(i);
const cycle=[];
let node=0;
do{
 cycle.push(node);
 node=B[node];
 assert(cycle.length<=11);
}while(node!==0);
assert.equal(cycle.length,11);
const cycleSet=new Set(cycle);
for(const x of cycle)children[x]=children[x].filter(k=>!cycleSet.has(k));
/**
 * @param {number} origin Cycle start, either source0 or 197
 * @param {"pre"|"post"} shape Tree traversal branch
 * @returns {number[]}
 */
function forestWalk(origin,shape){
 assert(cycleSet.has(origin));
 const orderedCycle=[];
 let current=origin;
 do{
  orderedCycle.push(current);
  current=B[current];
 }while(current!==origin);
 const out=[];
 /** @param {number} v */
 function dfs(v){
  if(shape==="pre")out.push(v);
  for(const child of children[v])dfs(child);
  if(shape==="post")out.push(v);
 }
 for(const root of orderedCycle)dfs(root);
 assert.equal(out.length,252);
 assert.equal(new Set(out).size,252);
 assert.deepEqual([...out].sort((a,b)=>a-b),main);
 return out;
}
const forest=[];
for(const origin of [0,197])for(const shape of ["pre","post"]){
 const list=forestWalk(origin,shape);
 for(const backwards of [false,true]){
  forest.push({origin,shape,backwards,
   indices:backwards?list.toReversed():list});
 }
}
assert.equal(forest.length,8);
const inputs={
 quotient,raw:main.map(i=>mod29(B[i]))
};
const keyBySource={};
for(const [name,values] of Object.entries(inputs)){
 const byIndex=new Map(main.map((x,i)=>[x,values[i]]));
 keyBySource[name]=forest.map(f=>f.indices.map(i=>byIndex.get(i)));
}
const pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
const all=pages.flatMap(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(all.length,12956);
const language=buildSourceNativeTrigramModel({
 corpus:gp,referenceText:read("resources/liber-primus/lp1-plaintext-reference.txt")
});
const reference=gp.pages.find(p=>p.page===57).indices;
assert.equal(reference.length,95);
/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign
 */
function transform(cipher,key,sign){
 return cipher.map((x,i)=>mod29(x+sign*key[i%252]));
}
/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign
 * @param {"continuous"|"page"} clock
 * @returns {number[]}
 */
function decodeBook(cipher,key,sign,clock){
 if(clock==="continuous")return transform(cipher,key,sign);
 const out=[];
 let offset=0;
 for(const p of pages){
  const seg=cipher.slice(offset,offset+p.indices.length);
  out.push(...transform(seg,key,sign));
  offset+=seg.length;
 }
 assert.equal(offset,cipher.length);
 return out;
}
const scored=[];
for(const [source,streams] of Object.entries(keyBySource))
for(let index=0;index<streams.length;index++){
 const key=streams[index],f=forest[index];
 assert.equal(key.length,252);
 for(const clock of ["continuous","page"])
 for(const sign of [-1,1]){
  const plain=decodeBook(all,key,sign,clock);
  const score=language.scoreStream(plain).mean;
  const p0=plain.slice(0,262);
  const p55=clock==="continuous"
   ? plain.slice(-76)
   : transform(gp.pages.find(p=>p.page===55).indices,key,sign);
  // Exact symmetric inverse for every output on ALL original rune positions.
  assert.deepEqual(decodeBook(plain,key,-sign,clock),all);
  // Native solved-p57 encrypted, then decoded with the actual source tape.
  const planted=transform(reference,key,-sign);
  assert.deepEqual(transform(planted,key,sign),reference);
  const recoveredNative=language.scoreStream(transform(planted,key,sign)).mean;
  assert.ok(Math.abs(recoveredNative-language.p57Score)<1e-10);
  scored.push({source,origin:f.origin,shape:f.shape,
   backwards:f.backwards,clock,sign,score,
   p0Score:language.scoreStream(p0).mean,
   p55Score:language.scoreStream(p55).mean,
   first45:language.spell(plain.slice(0,45)),
   last45:language.spell(plain.slice(-45))});
 }
}
assert.equal(scored.length,64);
scored.sort((a,b)=>b.score-a.score);
const byP55=[...scored].sort((a,b)=>b.p55Score-a.p55Score);
console.log(JSON.stringify({
 sourceBytes:256,sourceGraphBasin:252,sourceGraphExcluded4:[...small],
 polynomialDegree:4,sourceQuotient:252,
 pathStarts:[0,197],forestModes:8,keySources:["quotient","raw"],
 totalFixedReversibleDecoderCandidates:64,originalRunes:12956,
 nativeReferences:{lp1:language.trainingScore,solvedP57:language.p57Score},
 bestGlobal:scored.slice(0,12),
 bestP55:byP55.slice(0,5),
 originalBestNativeLike:scored.filter(x=>x.score>-2.8).length,
 p55BestNativeLike:byP55.filter(x=>x.p55Score>-2.8).length,
 exactPositiveInverseRuns:64,
 interpretation:"Source-motivated proposal, not historically selected; only native-GP plaintext under these exact fixed walks and additive clocks is tested."
},null,2));
console.log("PASS: exact original H×G polynomial division, full 252-node forest walks, all 64 original decryption/re-encryption and GP-native positive plants.");

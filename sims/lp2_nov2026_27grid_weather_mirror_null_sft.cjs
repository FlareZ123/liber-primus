"use strict";
/**
 * Original-source independent test of a public November 2026 27x27 LP2
 * WEATHER candidate using a deliberately BROAD symmetric-triplet source
 * family and 5-rune straight line ciphertext rays.
 *
 * This is a specificity/selection audit, NOT a claimed decryptor of LP2.
 * Node.js 22: node sims/lp2_nov2026_27grid_weather_mirror_null_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const original = corpus.pages.slice(0,3).flatMap(x => x.indices);
const W = 27, target = [7,28,2,18,4]; // W-EA-TH-E-R; five GP runes
assert.equal(original.length,W*W);
/** @param {number} n @returns {number} */
function phi(n) {
  let value=n, k=n;
  for(let p=2;p*p<=k;p++) if(k%p===0) {
    value-=value/p;
    while(k%p===0) k/=p;
  }
  if(k>1) value-=value/k;
  return value;
}
/** @param {number} n @returns {number} */
function mobius(n) {
  let sign=1,k=n;
  for(let p=2;p*p<=k;p++) if(k%p===0) {
    sign=-sign;k/=p;
    if(k%p===0)return 0;
    while(k%p===0)k/=p;
  }
  return k>1?-sign:sign;
}
const phis=Array.from({length:29},(_,i)=>i?phi(i):0);
const sigs=phis.map((n,i)=>i?mobius(n):0);
const axes=[[0,1],[1,0],[1,1],[1,-1]];
const inside=(r,c)=>r>=0&&r<W&&c>=0&&c<W;
const mirrors=[],rays=[];
for(let r=0;r<W;r++)for(let c=0;c<W;c++) {
  for(const [dr,dc] of axes) for(let radius=1;radius<W;radius++) {
    const a=[r-radius*dr,c-radius*dc];
    const b=[r+radius*dr,c+radius*dc];
    if(!inside(...a)||!inside(...b)) break;
    mirrors.push([a[0]*W+a[1],r*W+c,b[0]*W+b[1]]);
  }
  for(const [dr,dc] of axes.concat(axes.map(x=>x.map(y=>-y)))) {
    if(!inside(r+4*dr,c+4*dc))continue;
    rays.push(Array.from({length:5},(_,j)=>(r+j*dr)*W+c+j*dc));
  }
}
assert.equal(mirrors.length,14976);
assert.equal(rays.length,4600);
/**
 * Count exact target ciphertext paths consistent with *some* symmetric
 * source triplet after optional center-phi, mu(phi) rotation, and key-repeat.
 * Different source nodes for the same ciphertext path count as ONE possible
 * plaintext locus for the correct familywise interpretation.
 * @param {number[]} data
 * @returns {{segments:number,unique:number,nodeWeighted:number,
 *             sourceKeys:Map<string, number>}}
 */
function audit(data) {
  const sources=new Map();
  for(const [ai,bi,ci] of mirrors) {
    if(data[ai]!==data[ci])continue;
    for(const transformed of [false,true]) {
      const key=[data[ai],transformed?phis[data[bi]]:data[bi],data[ci]];
      if(key.some(x=>x===0))continue;
      const phase=(sigs[key[0]]+sigs[key[1]]+sigs[key[2]]+9)%3;
      const aligned=key.slice(phase).concat(key.slice(0,phase));
      const name=aligned.join(".");
      sources.set(name,(sources.get(name)||0)+1);
    }
  }
  let segments=0,unique=0,nodeWeighted=0;
  for(const ray of rays) {
    const k=ray.map((site,i)=>(data[site]-target[i]+29)%29);
    if(k[0]!==k[3]||k[1]!==k[4])continue;
    segments++;
    const n=sources.get(k.slice(0,3).join("."))||0;
    if(n){unique++;nodeWeighted+=n;}
  }
  return {segments,unique,nodeWeighted,sourceKeys:sources};
}
const at=(r,c)=>original[(r-1)*W+c-1];
// Reproduce the actual public WEATHER cell and selected local source node.
assert.deepEqual([at(14,4),at(14,5),at(14,6)],[14,22,14]);
assert.deepEqual(Array.from({length:5},(_,i)=>at(14,14+i)),[21,13,12,3,18]);
const local=[14,phis[22],14];
const phase=(sigs[local[0]]+sigs[local[1]]+sigs[local[2]]+9)%3;
assert.equal(phase,2);
const aligned=local.slice(phase).concat(local.slice(0,phase));
assert.deepEqual(aligned,[14,14,10]);
assert.deepEqual([21,13,12,3,18].map(
  (v,i)=>(v-aligned[i%3]+29)%29),target);

const a=audit(original);
assert.deepEqual({segments:a.segments,unique:a.unique,
  nodeWeighted:a.nodeWeighted},{segments:5,unique:1,nodeWeighted:4});
assert.equal(a.sourceKeys.get("14.14.10"),4);
let seed=0x33012727;
/** @param {number} n @returns {number} */
function random(n) {
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)%n;
}
const trials=2048;
let positive=0,sumUnique=0,sumNode=0,geNode=0;
for(let t=0;t<trials;t++) {
  const sample=original.slice();
  for(let i=sample.length-1;i>0;i--) {
    const j=random(i+1);
    [sample[i],sample[j]]=[sample[j],sample[i]];
  }
  const s=audit(sample);
  sumUnique+=s.unique;sumNode+=s.nodeWeighted;
  if(s.unique>=1)positive++;
  if(s.nodeWeighted>=4)geNode++;
}
assert.equal(positive,197);
assert.equal(sumUnique,213);
assert.equal(sumNode,463);
assert.equal(geNode,38);
console.log(JSON.stringify({
  originalScope:"LP2 pp0–2, all 729 original GP29 runes",
  target:"WEATHER as 5 GP runes W-EA-TH-E-R",
  mirroredSourceTriplets:mirrors.length,
  fiveRuneDirectedStraightRays:rays.length,
  original:{segments:a.segments,independentCiphertextLocations:a.unique,
    compatibleSourceNodes:a.nodeWeighted},
  null:{trialCount:trials,seed:"0x33012727",
    preserves:"original 729-rune source-frequency multiset",
    meanLocations:sumUnique/trials,positiveTrials:positive,
    atLeastOneLocationUpperTail:(positive+1)/(trials+1),
    meanCompatibleNodes:sumNode/trials,
    atLeastFourNodesUpperTail:(geNode+1)/(trials+1)},
  implication:"Exact local decoding, but not an independently selected full-chapter inverse; the broader null does not evaluate the complete claimed transition chain."
},null,2));

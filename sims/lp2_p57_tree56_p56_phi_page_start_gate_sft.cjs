#!/usr/bin/env node
"use strict";

/*
 * Candidate gate: base60 p50 root-201 reverse tree -> largest-child-first
 * inorder page assignment -> node address as zero-based p56 prime-clock
 * start, reset per physical page. Preserve authentic plaintext-F bypass.
 *
 * The tree-to-page mapping and page-reset key law are hypotheses, not
 * creator-authenticated facts. This script tests one frozen consumer.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const table = JSON.parse(fs.readFileSync("resources/liber-primus/base60-grid.json","utf8"));
const M = 29, parent = table.byte_rows.flat();
assert.equal(parent.length,256);
assert.equal(corpus.pages.length,58);
assert.equal(corpus.pages[50].indices.length,0);
const children = Array.from({length:256},()=>[]);
for(let i=0;i<256;i++) children[parent[i]].push(i);
const core = new Set();
function collect(n){if(core.has(n))return;core.add(n);for(const c of children[n])collect(c);}
collect(201);
assert.equal(core.size,56);
const memoSize = new Map();
function size(n,active=new Set()){
  if(memoSize.has(n))return memoSize.get(n);
  assert(!active.has(n),"root-201 reverse closure must be acyclic");
  const next=new Set(active);next.add(n);
  const v=1+children[n].filter(c=>core.has(c)).reduce((s,c)=>s+size(c,next),0);
  memoSize.set(n,v);return v;
}
for(const n of core)size(n);
function inorder(n){
  const cs=children[n].filter(c=>core.has(c)).sort((a,b)=>size(b)-size(a)||a-b);
  return cs.length?[...inorder(cs[0]),n,...cs.slice(1).flatMap(inorder)]:[n];
}
const pageNodes=inorder(201);
assert.equal(pageNodes.length,56);
assert.equal(new Set(pageNodes).size,56);
assert.deepEqual([0,15,23,32,44,50,55].map(p=>pageNodes[p]),[178,105,222,73,82,201,128]);
assert.deepEqual(children[201].filter(n=>core.has(n)).sort((a,b)=>a-b),[82,128]);
assert.deepEqual([82,128].map(size),[50,5]);
assert.deepEqual(children[82].filter(n=>core.has(n)).sort((a,b)=>a-b),[79,163]);
assert.deepEqual([79,163].map(size),[44,5]);

function primes(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    let ok=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}
    if(ok)out.push(n);
  }
  return out;
}
const maxStart=Math.max(...pageNodes);
const maxLen=Math.max(...corpus.pages.slice(0,56).map(p=>p.indices.length));
const prime=primes(maxStart+maxLen+2);
const mod=n=>((n%M)+M)%M;
const key=(start,used)=>(prime[start+used]-1)%M;
function add(map,k,n){map.set(k,(map.get(k)||0n)+n);}

/* Exact F-transparent inverse reachability, merged by consumed-prime count. */
function analyze(page,start){
  let states=new Map([[0,1n]]),maxStates=1;
  for(let pos=0;pos<page.indices.length;pos++){
    const c=page.indices[pos],next=new Map();
    for(const [used,ways] of states){
      if(c===0)add(next,used,ways);                 // literal plaintext F
      const p=mod(c-key(start,used));               // consuming non-F inverse
      if(p!==0)add(next,used+1,ways);               // consuming plaintext F is illegal
    }
    states=next;maxStates=Math.max(maxStates,states.size);
    if(!states.size)return {page:page.page,start,length:page.indices.length,complete:false,failedAt:pos,maxStates};
  }
  return {page:page.page,start,length:page.indices.length,complete:true,
    terminalUsed:[...states.keys()].sort((a,b)=>a-b),
    paths:[...states.values()].reduce((s,n)=>s+n,0n).toString(),maxStates};
}
function enumerate(cipher,start){
  const memo=new Map();
  function visit(pos,used){
    if(pos===cipher.length)return [[]];
    const id=pos+":"+used;if(memo.has(id))return memo.get(id);
    const out=[];
    if(cipher[pos]===0)for(const tail of visit(pos+1,used))out.push([0,...tail]);
    const p=mod(cipher[pos]-key(start,used));
    if(p!==0)for(const tail of visit(pos+1,used+1))out.push([p,...tail]);
    memo.set(id,out);return out;
  }
  return visit(0,0);
}
function encrypt(plain,start){
  let used=0;
  return plain.map(p=>p===0?0:((p+key(start,used++))%M));
}
function valid(plain,cipher,start){
  if(plain.length!==cipher.length)return false;
  let used=0;
  for(let i=0;i<plain.length;i++){
    if(plain[i]===0){if(cipher[i]!==0)return false;}
    else if(cipher[i]!==((plain[i]+key(start,used++))%M))return false;
  }
  return true;
}
function ioc(a){
  const h=Array(M).fill(0);for(const x of a)h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const runePages=corpus.pages.slice(0,56).filter(p=>p.indices.length>0);
assert.equal(runePages.length,55);
assert.equal(runePages.reduce((s,p)=>s+p.indices.length,0),12956);
const results=runePages.map(p=>analyze(p,pageNodes[p.page]));
const failures=results.filter(r=>!r.complete).map(r=>[r.page,r.failedAt]);
const survivors=results.filter(r=>r.complete);
assert.equal(failures.length,52);
assert.deepEqual(failures,[
 [0,90],[1,1],[2,33],[3,55],[4,6],[5,27],[6,26],[7,6],[8,4],[9,184],
 [10,10],[11,40],[12,28],[13,28],[14,31],[15,77],[16,2],[17,10],[18,109],[19,91],
 [20,31],[21,168],[22,26],[23,26],[24,17],[25,106],[26,13],[27,15],[28,6],[29,158],
 [30,157],[31,66],[32,12],[34,16],[35,9],[36,60],[37,74],[38,6],[39,96],[40,77],
 [41,2],[42,4],[44,27],[45,4],[46,87],[47,33],[48,133],[51,54],[52,16],[53,4],[54,11],[55,7],
]);
assert.deepEqual(survivors.map(r=>[r.page,r.start,r.paths]),[[33,103,"12"],[43,79,"56"],[49,163,"1"]]);
const survivorIoC=survivors.map(r=>{
  const candidates=enumerate(corpus.pages[r.page].indices,r.start);
  assert.equal(candidates.length,Number(r.paths));
  for(const p of candidates)assert.deepEqual(encrypt(p,r.start),corpus.pages[r.page].indices);
  const scores=candidates.map(ioc);
  return {page:r.page,start:r.start,paths:candidates.length,minIoC:Math.min(...scores),maxIoC:Math.max(...scores)};
});
const clearP57IoC=ioc(corpus.pages[57].indices);
const maxCandidateIoC=Math.max(...survivorIoC.map(r=>r.maxIoC));
assert(Math.abs(clearP57IoC-0.06270997)<1e-7);
assert(maxCandidateIoC<0.038);

/* Source-native positive plant: 75 clear p57 runes, nonzero start167, 3 F events. */
const plant=corpus.pages[57].indices.slice(0,75),plantStart=167;
assert.equal(plant.length,75);
assert.equal(plant.filter(x=>x===0).length,3);
const plantedCipher=encrypt(plant,plantStart);
assert(valid(plant,plantedCipher,plantStart));
const plantResult=analyze({page:57,indices:plantedCipher},plantStart);
assert(plantResult.complete);
assert(plantResult.terminalUsed.includes(plant.filter(x=>x!==0).length));

console.log(JSON.stringify({
 hypothesis:"candidate tree node address is zero-based p56 prime-stream start; reset per physical rune page",
 pageNodes,totalPages:runePages.length,totalRunes:12956,
 algebraicallyImpossiblePages:failures,completePages:survivors,survivorIoC,
 totalSurvivingPaths:survivorIoC.reduce((s,r)=>s+r.paths,0),
 clearP57IoC,maxCandidateIoC,
 positiveControl:{source:"first75 clear p57 runes",start:plantStart,literalFEvents:3,
   exactForwardReplay:true,inverseReachabilityContainsPlant:true},
 decision:"Retire this exact node-address to p56-prime-clock consumer; do not infer that the candidate tree-to-page assignment is authentic."
},null,2));

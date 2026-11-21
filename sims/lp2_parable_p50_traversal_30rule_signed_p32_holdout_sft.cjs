"use strict";
/**
 * Source-driven page traversal grammar on the original p50 table,
 * with independent authenticated signed-2016 physical-page-32 holdout.
 * Exploratory grammar, not an instruction from the Cicada creator.
 * Windows Node22 standalone CommonJS original-input SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const dir=path.resolve(__dirname,"..");
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
const g=read("resources/liber-primus/lp2-grid-256.json");
const c=read("resources/liber-primus/lp2-corpus.json");
const signed=fs.readFileSync(path.join(dir,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");
const tokens=g.pages.flatMap(page=>page.tokens);
const next=tokens.map(s=>60*g.alphabet.indexOf(s[0])+g.alphabet.indexOf(s[1]));
assert.equal(next.length,256);
assert(next.every(v=>v>=0&&v<=255));
const factors=[
  c.pages[57].indices.slice(7,37),
  c.pages[57].indices.slice(37,67),
  c.pages[57].indices.slice(67,95)
].map(a=>a.reduce((s,i)=>s+c.prime[i],0));
assert.deepEqual(factors,[1259,1031,1229]);
assert.equal(factors.reduce((a,b)=>a*b,1),1595277641);
/** @param {number} n @returns {boolean} */
function prime(n){if(n<2)return false;for(let j=2;j*j<=n;j++)if(n%j===0)return false;return true;}
/** @param {number} n @returns {number} */
function ordinal(n){assert(prime(n));let k=0;for(let j=2;j<=n;j++)if(prime(j))k++;return k;}
assert.deepEqual(factors.map(ordinal),[205,173,201]);
/** @param {number} n @returns {Set<number>} */
function orbit(n){const s=new Set();while(!s.has(n)){s.add(n);n=next[n];}return s;}
/** @param {number} n @returns {number[]} */
function subtree(n){return Array.from({length:256},(_,i)=>i).filter(i=>orbit(i).has(n));}
assert.deepEqual([201,74,205,173].map(n=>subtree(n).length),[56,57,58,8]);
const nodes=subtree(205);
const children=new Map(nodes.map(n=>[n,[]]));
const member=new Set(nodes);
for(const n of nodes)if(n!==205){
  assert(member.has(next[n]));
  children.get(next[n]).push(n);
}
const sizes=new Map();
/** @param {number} n @returns {number} */
function count(n){
  const z=1+children.get(n).reduce((sum,child)=>sum+count(child),0);
  sizes.set(n,z);return z;
}
assert.equal(count(205),58);
assert.deepEqual([82,128,201].map(n=>sizes.get(n)),[50,5,56]);
assert.deepEqual(children.get(73).map(n=>sizes.get(n)).sort((a,b)=>b-a),[32,8,1,1]);
assert.equal(subtree(201).filter(n=>children.get(n).length===4).length,1);
assert.deepEqual(subtree(201).filter(n=>children.get(n).length===4),[73]);

// Independent authenticated 2016-word GP0 route THE20→102, DEVOTED102→32.
// This target existed prior to the new PARABLE graph and page-order proposal.
assert(signed.includes("epiphany seeks the devoted."));
const canonical=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number} */
function gp0(word){
  let w=word.toUpperCase().replaceAll("K","C").replaceAll("V","U");
  let acc=0;
  while(w.length){
    const rune=canonical.find(x=>w.startsWith(x.s));
    assert(rune);
    acc+=rune.i;
    w=w.slice(rune.s.length);
  }
  return acc;
}
assert.deepEqual([gp0("THE"),gp0("DEVOTED")],[20,102]);
assert.deepEqual([next[20],next[102]],[102,32]);
assert.equal(c.pages[32].indices.length,121);
assert.equal(c.pages[50].indices.length,0);
assert.equal(c.pages[56].indices.length,85);
assert.equal(c.pages[57].indices.length,95);

const comparisons={
  addressAsc:(a,b)=>a-b,
  addressDesc:(a,b)=>b-a,
  sizeDesc:(a,b)=>sizes.get(b)-sizes.get(a)||a-b,
  sizeAsc:(a,b)=>sizes.get(a)-sizes.get(b)||a-b,
  valueAsc:(a,b)=>next[a]-next[b]||a-b,
  valueDesc:(a,b)=>next[b]-next[a]||a-b
};
const roots=["pre","post","after1","half","beforeLast"];
const variants=[];
for(const [sortName,compare] of Object.entries(comparisons))
  for(const rootMode of roots) {
    const visitOrder=[];
    /** @param {number} n */
    function visit(n){
      const ch=children.get(n).slice().sort(compare);
      const cut=rootMode==="pre"?0:
        rootMode==="post"?ch.length:
        rootMode==="after1"?Math.min(1,ch.length):
        rootMode==="half"?Math.ceil(ch.length/2):
        Math.max(0,ch.length-1);
      for(const child of ch.slice(0,cut))visit(child);
      visitOrder.push(n);
      for(const child of ch.slice(cut))visit(child);
    }
    visit(205);
    assert.equal(visitOrder.length,58);
    assert.equal(new Set(visitOrder).size,58);
    variants.push({
      sortName,rootMode,visitOrder,
      p32:visitOrder.indexOf(73),
      p44:visitOrder.indexOf(82),
      p50:visitOrder.indexOf(201),
      p56:visitOrder.indexOf(74),
      p57:visitOrder.indexOf(205)
    });
  }
assert.equal(variants.length,30);
const distinct=new Set(variants.map(v=>v.visitOrder.join(",")));
assert.equal(distinct.size,20);
const tail=variants.filter(v=>v.p50===50&&v.p56===56&&v.p57===57);
assert.equal(tail.length,8);
assert.equal(new Set(tail.map(v=>v.visitOrder.join(","))).size,4);
const signedTarget=tail.filter(v=>v.p32===32);
assert.equal(signedTarget.length,1);
assert.equal(signedTarget[0].sortName,"sizeDesc");
assert.equal(signedTarget[0].rootMode,"after1");
assert.equal(signedTarget[0].p44,44);
assert.equal(signedTarget[0].visitOrder[31],69);
assert.equal(signedTarget[0].visitOrder[32],73);
assert.equal(gp0("LIBER"),69);
assert.equal(gp0("HELLO"),69);
assert.equal(gp0("VERIFY"),59);
assert.deepEqual([next[59],next[69]],[69,73]);
console.log(JSON.stringify({
  status:"PASS",
  sourceParableOriginalPrimeOrdinals:[205,173,201],
  sourceTableNodeCounts:[58,8,56],
  sourceParentChain:[201,74,205],
  independentSigned2016PhysicalP32:"THE20→DEVOTED102→numeric32",
  testedHumanTraversalGrammar:"six printed-node sibling sorts × five root-placement rules",
  totalRules:30,
  uniqueTraversalSequences:20,
  physicalTableAndSolvedTailCompatible:tail.length,
  distinctTailCompatibleOrderings:4,
  targetP32CompatibleAmongTail:signedTarget.length,
  soleConditionalRule:{sort:signedTarget[0].sortName,
    rootPlacement:signedTarget[0].rootMode},
  predictedOriginalPageNodes:{
    p0:signedTarget[0].visitOrder[0],p31:69,p32:73,
    p44:82,p50:201,p55:signedTarget[0].visitOrder[55],
    p56:74,p57:205
  },
  significanceCaveat:"candidate traversal grammar and choice of p32 holdout are retrospective, not a calibrated selection-adjusted p value",
  unknownPlaintextRecovered:false
},null,2));

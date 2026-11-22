"use strict";
/**
 * Source-original exact Latin-square transducer capacity sieve.
 * Each 28-valued digit induces a permutation of the 29 previous-rune states
 * with no fixed points. This is stricter than arbitrary independent row order.
 *
 * A bipartite k-factor exists precisely when k disjoint permutation ranks can
 * be hidden among the observed packet-leading transitions. A failed NECESSARY
 * k-factor rules out the complete Latin family under that framing.
 *
 * node sims/stateful_28rank_latin_matching.cjs
 */
const assert = require("node:assert/strict");
const {
  getPages, packets, evidence, leadingCeiling, verify
} = require("./stateful_28rank_allwidth.cjs");
const SIZE = 29;
const NODE_COUNT = 60, SOURCE = 58, SINK = 59;

/**
 * Find k edge-disjoint perfect matchings in a 29x29 allowed-edge graph using
 * integer max flow; return null when Hall's capacitated condition is violated.
 * @param {number[][]} allowed
 * @param {number} k
 * @returns {number[][] | null} k perfect matchings indexed by source state
 */
function kFactorMatchings(allowed, k) {
  assert(Number.isInteger(k) && k >= 0 && k <= 28);
  const graph = Array.from({length: NODE_COUNT}, () => []);
  /** @param {number} a @param {number} b @param {number} cap */
  function add(a,b,cap) {
    const f = {to:b, cap, rev:graph[b].length};
    const r = {to:a, cap:0, rev:graph[a].length};
    graph[a].push(f);graph[b].push(r);
  }
  for (let a=0;a<SIZE;a++) {
    add(SOURCE,a,k);
    for(const b of allowed[a])add(a,SIZE+b,1);
    add(SIZE+a,SINK,k);
  }
  let flow=0;
  while(true) {
    const level=Array(NODE_COUNT).fill(-1),queue=[SOURCE];
    level[SOURCE]=0;
    for(let z=0;z<queue.length;z++){
      const x=queue[z];
      for(const e of graph[x])if(e.cap>0&&level[e.to]<0){
        level[e.to]=level[x]+1;queue.push(e.to);
      }
    }
    if(level[SINK]<0)break;
    const cursor=Array(NODE_COUNT).fill(0);
    /** @param {number} x @param {number} limit */
    function dfs(x,limit){
      if(x===SINK)return limit;
      while(cursor[x]<graph[x].length){
        const e=graph[x][cursor[x]];
        if(e.cap>0&&level[e.to]===level[x]+1){
          const pushed=dfs(e.to,Math.min(limit,e.cap));
          if(pushed){
            e.cap-=pushed;
            graph[e.to][e.rev].cap+=pushed;
            return pushed;
          }
        }
        cursor[x]++;
      }
      return 0;
    }
    while(true){
      const pushed=dfs(SOURCE,SIZE*k);
      if(!pushed)break;
      flow+=pushed;
    }
  }
  if(flow!==SIZE*k)return null;
  const active=Array.from({length:SIZE},(_,a)=>
    graph[a].filter(e=>e.to>=SIZE && e.to<SIZE*2 && e.cap===0)
      .map(e=>e.to-SIZE));
  assert(active.every(x=>x.length===k));
  return peelMatchings(active,k);
}

/**
 * A k-regular bipartite graph admits exactly k perfect matchings.
 * @param {number[][]} allowed
 * @param {number} count
 * @returns {number[][]}
 */
function peelMatchings(allowed,count){
  const remaining=allowed.map(row=>new Set(row)),out=[];
  for(let round=0;round<count;round++){
    const mate=Array(SIZE).fill(-1);
    /** @param {number} a @param {boolean[]} seen */
    function augment(a,seen){
      for(const b of remaining[a]){
        if(seen[b])continue;
        seen[b]=true;
        if(mate[b]<0||augment(mate[b],seen)){
          mate[b]=a;return true;
        }
      }
      return false;
    }
    for(let a=0;a<SIZE;a++)
      assert(augment(a,Array(SIZE).fill(false)),
        "Regular graph must admit full perfect matching");
    const mapping=Array(SIZE).fill(-1);
    for(let b=0;b<SIZE;b++){
      assert(mate[b]>=0);
      mapping[mate[b]]=b;
    }
    assert(mapping.every(b=>b>=0));
    for(let a=0;a<SIZE;a++)remaining[a].delete(mapping[a]);
    out.push(mapping);
  }
  return out;
}

/**
 * Build an entire 29-by-28 Latin derangement table with the highest k digit
 * columns absent from all observed leaders. If k-factor impossible return null.
 * @param {Array<Set<number>>} seen
 * @param {number} k
 * @returns {number[][] | null}
 */
function latinRows(seen,k) {
  const available=seen.map((set,a)=>
    Array.from({length:SIZE},(_,b)=>b).filter(b=>b!==a&&!set.has(b)));
  const top=kFactorMatchings(available,k);
  if(top===null)return null;
  const unreserved=Array.from({length:SIZE},(_,a)=>
    Array.from({length:SIZE},(_,b)=>b).filter(b=>b!==a && !top.some(t=>t[a]===b)));
  const lower=peelMatchings(unreserved,28-k);
  const matched=[...lower,...top];
  assert.equal(matched.length,28);
  const rows=Array.from({length:SIZE},(_,a)=>matched.map(m=>m[a]));
  assert(rows.every((row,a)=>row.length===28 && !row.includes(a) && new Set(row).size===28));
  assert(matched.every(col=>new Set(col).size===SIZE));
  return rows;
}

/** @returns {object} */
function study(){
  const originals=getPages();
  const lines=[], counterexamples=[];
  for(const D of [10,15,20,25,30]){
    const ceiling=leadingCeiling(D);
    const necessaryK=27-ceiling, safeK=28-ceiling;
    let impossible=0,strictCompatible=0,unknown=0,packetCount=0;
    for(const reset of [false,true])for(const drop of [false,true])
      for(const reverse of [false,true])for(let phase=0;phase<D;phase++){
        const block=packets(originals,reset,drop,D,phase,reverse);
        const {seen}=evidence(block);
        const necessary=latinRows(seen,necessaryK);
        if(necessary===null){
          impossible++;
          counterexamples.push({D,reset,drop,reverse,phase,
            consequence:"no forbidden-high-digit Latin edge factor"});
          continue;
        }
        const safe=latinRows(seen,safeK);
        if(safe===null){
          unknown++;
          continue;
        }
        const checked=verify(block,safe,D);
        strictCompatible++;
        packetCount+=checked.totalPackets;
      }
    assert.equal(impossible+strictCompatible+unknown,8*D);
    lines.push({D,byteCount:3*D/5,ceiling,necessaryForbiddenHighRanks:necessaryK,
      sufficientForbiddenHighRanks:safeK,models:8*D,
      exactlyImpossible:impossible,
      fullyConstructedLatinSafe:strictCompatible,
      necessaryPassedButNotYetResolved:unknown,
      independentlyBigIntVerifiedPackets:packetCount});
  }
  // Positive-control check: all 28 cyclic additive rank permutations are
  // Latin derangements, and arbitrary bytes encoded through them must always
  // pass the exact *necessary* forbidden-high-digit matching test.
  const planted=[];
  let state=0x4a71ab22;
  /** @returns {number} */
  function next() {state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
  for(const D of [10,15,20,25,30]){
    const seq=[9],bytes=3*D/5;
    for(let i=0;i<350;i++){
      let value=0n;
      for(let j=0;j<bytes;j++)value=value*256n+BigInt(next()&255);
      const digits=Array(D).fill(0);
      for(let j=D-1;j>=0;j--){digits[j]=Number(value%28n);value/=28n;}
      assert.equal(value,0n);
      for(const digit of digits)seq.push((seq.at(-1)+digit+1)%SIZE);
    }
    const s=new Set(),seen=Array.from({length:SIZE},()=>new Set());
    const block=packets([seq],false,false,D,0,false);
    for(const b of block){seen[b[0].a].add(b[0].b);s.add(b[0].a);}
    assert.equal(block.length,350);
    const possible=latinRows(seen,27-leadingCeiling(D));
    assert(possible,"Actual encoded bytes must pass necessary Latin test");
    planted.push({D,encodedBytePackets:350,necessaryMatchingPass:true});
  }
  const totals={tested:lines.reduce((s,x)=>s+x.models,0),
    impossible:lines.reduce((s,x)=>s+x.exactlyImpossible,0),
    strictLatinWitness:lines.reduce((s,x)=>s+x.fullyConstructedLatinSafe,0),
    remainingUnresolved:lines.reduce((s,x)=>s+x.necessaryPassedButNotYetResolved,0)};
  return {source:"resources/liber-primus/lp2-corpus.json",runes:12956,
    family:"29 by 28 row-permutation transducer with each digit also a derangement permutation of previous-rune states",
    classification:"bounded exact necessary exclusions and sufficient capacity witnesses, not plaintext",
    totals,widths:lines,counterexamples,planted};
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={kFactorMatchings,peelMatchings,latinRows,study};

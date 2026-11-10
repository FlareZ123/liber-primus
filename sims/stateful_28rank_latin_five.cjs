"use strict";
/**
 * A complete Latin-derangement table witness for every original LP2 5-digit
 * to 3-byte, state-dependent radix-28 packet framing. A digit d determines
 * one fixed-point-free permutation of the 29 preceding-ciphertext states.
 *
 * This is a deliberately flexible byte-capacity interpretation, NOT the
 * authentic Cicada key or any recovered plaintext.
 *
 * node sims/stateful_28rank_latin_five.cjs
 */
const assert=require("node:assert/strict");
const {
  getPages,packets,evidence,verify
}=require("./stateful_28rank_allwidth.cjs");
const {peelMatchings}=require("./stateful_28rank_latin_matching.cjs");
const M=29, COUNT=60, SRC=58, SINK=59;

/**
 * Complete a prescribed collection of low-rank row edges into eight Latin
 * digit permutations, while excluding top-ranked outgoing edges.
 * @param {Array<Set<number>>} required
 * @param {number[]} top
 * @returns {number[][] | null} Eight complete digit permutations
 */
function completeLowFactor(required,top){
  const rowQuota=required.map(s=>8-s.size),colQuota=Array(M).fill(8);
  for(let a=0;a<M;a++)for(const b of required[a]){
    if(a===b||b===top[a])return null;
    colQuota[b]--;
  }
  if(rowQuota.some(n=>n<0)||colQuota.some(n=>n<0))return null;
  const graph=Array.from({length:COUNT},()=>[]);
  /** @param {number} a @param {number} b @param {number} cap */
  function add(a,b,cap){
    graph[a].push({to:b,cap,rev:graph[b].length});
    graph[b].push({to:a,cap:0,rev:graph[a].length-1});
  }
  for(let a=0;a<M;a++){
    add(SRC,a,rowQuota[a]);
    for(let b=0;b<M;b++)
      if(b!==a&&b!==top[a]&&!required[a].has(b))add(a,M+b,1);
    add(M+a,SINK,colQuota[a]);
  }
  let flow=0;
  while(true){
    const level=Array(COUNT).fill(-1),queue=[SRC];level[SRC]=0;
    for(let z=0;z<queue.length;z++){
      const x=queue[z];
      for(const edge of graph[x])if(edge.cap>0&&level[edge.to]<0){
        level[edge.to]=level[x]+1;queue.push(edge.to);
      }
    }
    if(level[SINK]<0)break;
    const cursor=Array(COUNT).fill(0);
    /** @param {number} x @param {number} limit */
    function dfs(x,limit){
      if(x===SINK)return limit;
      while(cursor[x]<graph[x].length){
        const edge=graph[x][cursor[x]];
        if(edge.cap>0&&level[edge.to]===level[x]+1){
          const pushed=dfs(edge.to,Math.min(limit,edge.cap));
          if(pushed){
            edge.cap-=pushed;
            graph[edge.to][edge.rev].cap+=pushed;
            return pushed;
          }
        }
        cursor[x]++;
      }
      return 0;
    }
    while(true){
      const pushed=dfs(SRC,M*8);
      if(!pushed)break;
      flow+=pushed;
    }
  }
  if(flow!==rowQuota.reduce((a,b)=>a+b,0))return null;
  const low=required.map(s=>new Set(s));
  for(let a=0;a<M;a++)for(const edge of graph[a])
    if(edge.to>=M&&edge.to<2*M&&edge.cap===0)low[a].add(edge.to-M);
  assert(low.every(s=>s.size===8));
  return peelMatchings(low.map(s=>[...s]),8);
}

/**
 * Find the unique top-digit outgoing edge for each of 29 source states as a
 * derangement. When a real five-digit packet starts with this edge, its
 * second edge must have a low digit (0..7). Complete those required follower
 * edges to eight whole-column permutations, then fill the 19 middle columns.
 * @param {Array<Array<Array<[number,number]>>>} events
 * @returns {number[][] | null}
 */
function fiveLatinRows(events){
  let state=0x4a9b03ab;
  /** @param {number} n @returns {number} */
  function random(n){
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)%n;
  }
  for(let trial=0;trial<100;trial++){
    const weights=events.map((row,a)=>row.map((list,b)=>
      b===a?1e9:new Set(list.map(([q,h])=>q*M+h)).size*128+random(128)));
    const mate=Array(M).fill(-1);
    /** @param {number} a @param {boolean[]} seen */
    function augment(a,seen){
      const sorted=Array.from({length:M},(_,x)=>x).filter(x=>x!==a)
        .sort((x,y)=>weights[a][x]-weights[a][y]||x-y);
      for(const b of sorted){
        if(seen[b])continue;
        seen[b]=true;
        if(mate[b]<0||augment(mate[b],seen)){
          mate[b]=a;return true;
        }
      }
      return false;
    }
    let success=true;
    for(let a=0;a<M;a++)if(!augment(a,Array(M).fill(false))){
      success=false;break;
    }
    if(!success)continue;
    const top=Array(M).fill(-1);
    for(let b=0;b<M;b++)top[mate[b]]=b;
    const required=Array.from({length:M},()=>new Set());
    for(let a=0;a<M;a++)
      for(const [q,h] of events[a][top[a]])required[q].add(h);
    const low=completeLowFactor(required,top);
    if(low===null)continue;
    const remaining=Array.from({length:M},(_,a)=>
      Array.from({length:M},(_,b)=>b)
        .filter(b=>b!==a&&b!==top[a]&&!low.some(c=>c[a]===b)));
    const middle=peelMatchings(remaining,19);
    const columns=[...low,...middle,top];
    assert.equal(columns.length,28);
    assert(columns.every(column=>new Set(column).size===M));
    const rows=Array.from({length:M},(_,a)=>columns.map(c=>c[a]));
    assert(rows.every((row,a)=>row.length===28&&
      !row.includes(a)&&new Set(row).size===28));
    return rows;
  }
  return null;
}

/** @returns {object} */
function study(){
  const pages=getPages();
  let successful=0,allPackets=0,markerAffected=0,cleanPackets=0;
  const cases=[];
  for(const reset of [false,true])for(const drop of [false,true])
    for(const reverse of [false,true])for(let phase=0;phase<5;phase++){
      const block=packets(pages,reset,drop,5,phase,reverse);
      const table=fiveLatinRows(evidence(block).events);
      assert(table!==null,JSON.stringify({reset,drop,reverse,phase}));
      const checked=verify(block,table,5);
      successful++;
      allPackets+=checked.totalPackets;
      markerAffected+=checked.markerAffectedPackets;
      cleanPackets+=checked.exactNonmarkerPackets;
      cases.push({reset,drop,reverse,phase,
        packets:checked.totalPackets,nonmarker:checked.exactNonmarkerPackets,
        markerAffected:checked.markerAffectedPackets});
    }
  assert.equal(successful,40);
  // Authentic three-byte integers encoded by a distinct Latin digit
  // permutation must survive the same exact inverse/overflow checks.
  const cyclic=Array.from({length:M},(_,a)=>
    Array.from({length:28},(_,d)=>(a+d+1)%M));
  let state=0x4a3b17ad;
  /** @returns {number} */
  function next(){
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  }
  const original=[5];
  for(let i=0;i<1000;i++){
    let value=BigInt(next()&255)*65536n+
      BigInt(next()&255)*256n+BigInt(next()&255);
    const digits=Array(5).fill(0);
    for(let k=4;k>=0;k--){digits[k]=Number(value%28n);value/=28n;}
    assert.equal(value,0n);
    for(const d of digits)original.push(cyclic[original.at(-1)][d]);
  }
  const synthetic=packets([original],false,false,5,0,false);
  assert.equal(synthetic.length,1000);
  assert.equal(verify(synthetic,cyclic,5).exactNonmarkerPackets,1000);
  const fitted=fiveLatinRows(evidence(synthetic).events);
  assert(fitted!==null);
  assert.equal(verify(synthetic,fitted,5).exactNonmarkerPackets,1000);
  // A fake requirement to give a row 27 distinct low digits is impossible.
  const impossible=Array.from({length:M},()=>new Set());
  for(let b=1;b<M-1;b++)impossible[0].add(b);
  assert.equal(completeLowFactor(impossible,Array.from({length:M},(_,a)=>(a+1)%M)),null);
  return {source:"resources/liber-primus/lp2-corpus.json",
    mechanism:"Latin 29x28 prev-ciphertext-state symbol permutations, five radix28 digits to three raw bytes",
    originalRunes:12956,
    cases:successful,allPacketChecks:allPackets,
    cleanRuneExactReencodings:cleanPackets,markerAffectedPackets:markerAffected,
    exactByteOverflowCount:0,
    plantedThreeByteRoundTrips:1000,
    eachDigitIsA29StateDerangement:true,
    classification:"existence of compatible postselected rank tables, no LP2 plaintext or key",
    framings:cases};
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={completeLowFactor,fiveLatinRows,study};

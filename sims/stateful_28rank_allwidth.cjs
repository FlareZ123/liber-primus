"use strict";
/**
 * A finite original-LP2 capacity test for a DIFFERENT 28-choice permutation
 * after every preceding rune. Tests widths 5..30, all phases/restarts,
 * byte-order directions and doublet marker treatments.
 *
 * Result is an existence proof for a deliberately flexible code family,
 * or an exact finite counterexample where a row uses all 28 leading edges.
 * It is NEVER a recovered Cicada key or plaintext.
 *
 * node sims/stateful_28rank_allwidth.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const M = 29;
const WIDTHS = [5,10,15,20,25,30];
let seed = 0x4a424042;

/** @param {number} n @returns {number} */
function rand(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}

/** @returns {number[][]} */
function getPages() {
  const data = JSON.parse(fs.readFileSync(path.join(
    __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
  const p = data.pages.filter(x => x.status === "unsolved" && x.indices.length)
    .map(x => x.indices);
  assert.equal(p.length, 55);
  assert.equal(p.flat().length, 12956);
  return p;
}

/**
 * A doublet either takes one arbitrary marker digit or is dropped, but no
 * ordinary adaptive rune code is asserted to encode the repeated output.
 * @param {number[][]} pages
 * @param {boolean} reset
 * @param {boolean} drop
 * @param {number} D
 * @param {number} phase
 * @param {boolean} reverse
 * @returns {Array<Array<{a:number,b:number,marker:boolean}>>}
 */
function packets(pages, reset, drop, D, phase, reverse) {
  const out = [];
  for (const page of reset ? pages : [pages.flat()]) {
    const t = [];
    for (let i=1;i<page.length;i++) {
      const marker = page[i] === page[i-1];
      if (!marker || !drop) t.push({a:page[i-1],b:page[i],marker});
    }
    for (let i=phase;i+D<=t.length;i+=D) {
      const block=t.slice(i,i+D);
      out.push(reverse ? block.reverse() : block);
    }
  }
  return out;
}

/** @param {number} D @returns {number} */
function leadingCeiling(D) {
  return Number(((256n ** BigInt(D/5*3)) - 1n) /
    (28n ** BigInt(D-1)));
}

/**
 * Every candidate top outgoing rune per predecessor, and second transitions
 * for any packet starting with that edge.
 * @param {ReturnType<typeof packets>} blocks
 */
function evidence(blocks) {
  const seen = Array.from({length:M}, () => new Set());
  const events = Array.from({length:M}, () => Array.from({length:M}, () => []));
  for (const b of blocks) {
    if (b[0].marker) continue;
    const first=b[0];
    seen[first.a].add(first.b);
    if (!b[1].marker) events[first.a][first.b].push([b[1].a,b[1].b]);
  }
  return {seen,events};
}

/**
 * @param {number[][]} high Last symbols per row, in increasing rank order.
 * @param {Array<Set<number>>} low First symbols per row.
 * @returns {number[][] | null}
 */
function makeRows(high, low) {
  const result=[];
  for (let p=0;p<M;p++) {
    const h=high[p], l=[...low[p]].sort((a,b)=>a-b);
    if (new Set(h).size !== h.length || l.some(x=>h.includes(x)||x===p)) return null;
    const rest=Array.from({length:M},(_,i)=>i)
      .filter(x=>x!==p && !low[p].has(x) && !h.includes(x));
    const row=[...l,...rest,...h];
    if (row.length!==28 || new Set(row).size!==28 || row.includes(p)) return null;
    result.push(row);
  }
  return result;
}

/** @param {number[]} chosen @param {number[][][]} events */
function lowSets(chosen, events) {
  const low=Array.from({length:M},()=>new Set());
  for(let p=0;p<M;p++)
    for(const [q,h] of events[p][chosen[p]]) low[q].add(h);
  return low;
}

/** @param {number[]} F @param {number[][][]} events @returns {number} */
function loss(F,events) {
  const sets=lowSets(F,events);
  let bad=0;
  for(let p=0;p<M;p++) {
    if (sets[p].has(F[p])) bad+=100;
    if (sets[p].size>8) bad+=10*(sets[p].size-8)**2;
  }
  return bad;
}

/**
 * State-row maximum digit 27, with followers confined to 0..7; all remaining
 * suffixes then fit in 24 bits, even for the fractional top capacity bin.
 * Search affects only a finite feasibility witness and has no language score.
 * @param {number[][][]} events
 * @returns {number[][]}
 */
function fiveRows(events) {
  let F=null;
  for(let restart=0;restart<30;restart++) {
    const trial=Array.from({length:M},(_,p)=>{
      let candidates=[],best=Infinity;
      for(let g=0;g<M;g++) {
        if(g===p)continue;
        const n=events[p][g].length;
        if(n<best){best=n;candidates=[g];}
        else if(n===best)candidates.push(g);
      }
      return candidates[rand(candidates.length)];
    });
    let cost=loss(trial,events);
    for(let step=0;step<5000&&cost>0;step++) {
      const p=rand(M),old=trial[p];
      let best=cost,bestGlyph=old;
      for(let g=0;g<M;g++){
        if(g===p)continue;
        trial[p]=g;
        const test=loss(trial,events);
        if(test<best){best=test;bestGlyph=g;}
      }
      trial[p]=bestGlyph;cost=loss(trial,events);
      if(step%100===99&&cost>0) {
        const x=rand(M),g=rand(M-1);
        trial[x]=g>=x?g+1:g;
        cost=loss(trial,events);
      }
    }
    if(cost===0){F=trial;break;}
  }
  assert(F,"No 5-digit feasibility witness was constructed");
  const low=lowSets(F,events);
  assert(low.every(x=>x.size<=8));
  const rows=makeRows(F.map(x=>[x]),low);
  assert(rows);
  return rows;
}

/**
 * For width10, the largest rank 27 may never be a block leader. At rank26
 * choose follower digits <=16 to fit ALL eight remaining digit positions.
 * @param {Set<number>[]} seen
 * @param {number[][][]} events
 * @returns {number[][] | null}
 */
function tenRows(seen,events) {
  const missing=seen.map((s,p)=>Array.from({length:M},(_,i)=>i)
    .filter(x=>x!==p&&!s.has(x)));
  if(missing.some(a=>a.length===0)) return null;
  const rank27=missing.map(a=>a[0]);
  const rank26=missing.map((a,p)=>{
    if(a.length>1)return a[1];
    return Array.from({length:M},(_,x)=>x).filter(x=>x!==p&&x!==rank27[p])
      .sort((x,y)=>events[p][x].length-events[p][y].length||x-y)[0];
  });
  const low=lowSets(rank26,events);
  assert(low.every(x=>x.size<=17));
  const rows=makeRows(rank26.map((x,p)=>[x,rank27[p]]),low);
  assert(rows);
  return rows;
}

/**
 * When enough outgoing symbols were never seen as block leaders, assign the
 * top digit ranks to those symbols. Every actual first digit is below the
 * capacity ceiling and all packet suffixes fit regardless of their ranks.
 * @param {number} D
 * @param {Set<number>[]} seen
 * @returns {number[][] | null}
 */
function longRows(D,seen) {
  const topCount=28-leadingCeiling(D);
  const high=seen.map((s,p)=>Array.from({length:M},(_,i)=>i)
    .filter(x=>x!==p&&!s.has(x)).slice(0,topCount));
  if(high.some(a=>a.length!==topCount))return null;
  const rows=makeRows(high,Array.from({length:M},()=>new Set()));
  assert(rows);
  return rows;
}

/**
 * @param {ReturnType<typeof packets>} blocks
 * @param {number[][]} rows
 * @param {number} D
 */
function verify(blocks,rows,D) {
  const cap=256n**BigInt(D/5*3);
  let exactClean=0,markers=0,maximum=0n,partialTop=0;
  const ceiling=leadingCeiling(D);
  for(const block of blocks) {
    let v=0n,clean=true,first=-1;
    for(const [i,t] of block.entries()) {
      // Marker values are arbitrary special slots outside the 28-way code.
      const digit=t.marker?0:rows[t.a].indexOf(t.b);
      assert(digit>=0 && digit<=27);
      if(i===0)first=digit;
      if(t.marker) clean=false;
      v=28n*v+BigInt(digit);
    }
    assert(v<cap,"Original LP2 packet exceeds its exact byte capacity");
    if(v>maximum)maximum=v;
    if(first===ceiling)partialTop++;
    if(clean) {
      exactClean++;
      // Encoding back through the table must reproduce EVERY nonmarker edge.
      for(const t of block)assert.equal(rows[t.a][rows[t.a].indexOf(t.b)],t.b);
    } else markers++;
  }
  return {totalPackets:blocks.length,exactNonmarkerPackets:exactClean,
    markerAffectedPackets:markers,partialTopPackets:partialTop,
    largestDecodedInteger:maximum.toString()};
}

/** @returns {object} */
function study() {
  const pages=getPages(), rowsByWidth=[];
  for(const D of WIDTHS) {
    let feasible=0,excluded=0,clean=0,markerAffected=0,originalPackets=0;
    const counterexamples=[];
    for(const reset of [false,true])for(const drop of [false,true])
      for(const reverse of [false,true])for(let phase=0;phase<D;phase++){
        const blocks=packets(pages,reset,drop,D,phase,reverse);
        const {seen,events}=evidence(blocks);
        const rows=D===5?fiveRows(events):D===10?tenRows(seen,events):longRows(D,seen);
        if(rows===null) {
          assert.equal(D,10);
          const badRows=seen.map((s,i)=>s.size===28?i:null)
            .filter(i=>i!==null);
          assert(badRows.length>0);
          excluded++;
          counterexamples.push({reset,drop,reverse,phase,badRows});
        } else {
          const v=verify(blocks,rows,D);
          feasible++;
          clean+=v.exactNonmarkerPackets;
          markerAffected+=v.markerAffectedPackets;
          originalPackets+=v.totalPackets;
        }
      }
    assert.equal(feasible+excluded,8*D);
    rowsByWidth.push({D,bytes:3*D/5,configurations:8*D,feasible,
      excludedByAll28LeadingEdges:excluded,packetChecks:originalPackets,
      exactNonmarkerPacketChecks:clean,markerAffectedPacketChecks:markerAffected,
      counterexamples});
  }
  return {source:"resources/liber-primus/lp2-corpus.json",
    originalRuneCount:12956,sourcePages:55,
    framing:"all six widths; all phases; page/global; forward/reversed packet digits; marker retained as arbitrary digit0 or dropped",
    hypothesis:"different secret 28-choice digit ordering after each previous ciphertext rune",
    result:"pure capacity compatibility; no recovered plaintext or key",
    summary:rowsByWidth,configurations:rowsByWidth.reduce((a,b)=>a+b.configurations,0),
    feasible:rowsByWidth.reduce((a,b)=>a+b.feasible,0),
    excluded:rowsByWidth.reduce((a,b)=>a+b.excludedByAll28LeadingEdges,0)};
}

if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={getPages,packets,leadingCeiling,evidence,makeRows,fiveRows,tenRows,longRows,verify,study};

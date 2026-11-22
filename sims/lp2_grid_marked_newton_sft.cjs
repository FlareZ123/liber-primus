"use strict";
/**
 * Original LP2 table as a GF29 polynomial: marked red triads as exact
 * value/slope/seed and as a finite Newton-map control.
 *
 * The p39 red triple [27,5,15] is the exact Taylor 1-jet
 * [P(15),P'(15),15], where the base-60 printed table supplies P.
 * The p3 red triple [13,23,2] selects its first index13 as the
 * other critical point of P', and its middle index23 reaches13 via
 * Newton's finite-field map.
 *
 * No cipher/key/plaintext is inferred. Source and derivation preserved
 * to permit a clue-constrained downstream state proposal.
 *
 * Usage: node sims/lp2_grid_marked_newton_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const mod=n=>((n%29)+29)%29;

/** @param {number[]} coefficients @param {number} x */
function jet(coefficients,x){
  let value=0,derivative=0,second=0;
  for(const c of coefficients){
    second=mod(second*x+derivative);
    derivative=mod(derivative*x+value);
    value=mod(value*x+c);
  }
  return {value,derivative,hasseSecond:second};
}

/** @param {number} a */
function inverse(a){
  assert.notEqual(mod(a),0);
  for(let k=1;k<29;k++)if(mod(a*k)===1)return k;
  throw new Error("nonunit in prime field");
}

/** @param {{value:number,derivative:number,hasseSecond:number}[]} states */
function newtonGraph(states){
  return states.map((j,x)=>({
    x, ...j, next:j.derivative===0?null:
      mod(x-j.value*inverse(j.derivative))
  }));
}

/**
 * Find all distinct directed cycles of a partial deterministic graph.
 * @param {{x:number,next:number|null}[]} graph
 */
function cycles(graph){
  const unique=new Map();
  for(const node of graph){
    let s=node.x;
    const seen=new Map();
    while(s!==null&&!seen.has(s)){
      seen.set(s,seen.size);
      s=graph[s].next;
    }
    if(s!==null){
      const sequence=[...seen.keys()].slice(seen.get(s));
      const rotations=sequence.map((_,i)=>
        sequence.slice(i).concat(sequence.slice(0,i)));
      rotations.sort((a,b)=>a.join(",").localeCompare(b.join(",")));
      unique.set(rotations[0].join(","),rotations[0]);
    }
  }
  return [...unique.values()].sort((a,b)=>a.length-b.length);
}

/** @param {{x:number,next:number|null}[]} graph @param {number} start */
function walk(graph,start){
  const entries=[];
  const visited=new Set();
  let x=start;
  while(x!==null&&!visited.has(x)){
    visited.add(x);
    entries.push(x);
    x=graph[x].next;
  }
  return {states:entries,exit:x===null?"critical-point":"cycle",endpoint:x};
}

function main(){
  const grid=load("resources/liber-primus/base60-grid.json");
  const corpus=load("resources/liber-primus/lp2-corpus.json");
  const ink=load("resources/liber-primus/lp2-ink-annotations.json");
  const bytes=grid.byte_rows.flat();
  assert.equal(bytes.length,256);
  const sha=crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(sha,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const triads=ink.pages.flatMap(page=>(page.red_spans||[])
    .filter(span=>span.length===3)
    .map(span=>({
      page:page.page,at:span.start,
      indices:[...span.runes].map(r=>corpus.runes.indexOf(r))
    })));
  assert.deepEqual(triads,[
    {page:3,at:119,indices:[13,23,2]},
    {page:39,at:119,indices:[27,5,15]}
  ]);

  const states=Array.from({length:29},(_,x)=>jet(bytes,x));
  // Source-defined p39: last rune is evaluation point;
  // the first two are the 0th and 1st Hasse/Taylor coefficients.
  const [value,slope,seed]=triads[1].indices;
  assert.deepEqual([states[seed].value,states[seed].derivative],
    [value,slope]);
  // An important comparator: 14 has that same jet, so the first
  // two residues alone do not uniquely identify the red seed 15.
  const sameJet=states.flatMap((j,x)=>
    j.value===value&&j.derivative===slope?[x]:[]);
  assert.deepEqual(sameJet,[14,15]);

  const graph=newtonGraph(states);
  const critical=graph.filter(s=>s.next===null)
    .map(({x,value,hasseSecond})=>({x,value,hasseSecond}));
  assert.deepEqual(critical,[
    {x:13,value:8,hasseSecond:4},
    {x:24,value:0,hasseSecond:26}
  ]);
  assert.equal(critical[0].x,triads[0].indices[0]);
  // The oversized p54 Ac24 is the other critical point.
  assert.equal(corpus.pages.find(p=>p.page===54).indices[0],24);

  const orbit15=walk(graph,seed);
  const orbit23=walk(graph,triads[0].indices[1]);
  assert.deepEqual(orbit15,{states:[15,27,21],exit:"cycle",endpoint:15});
  assert.equal(graph[15].next,triads[1].indices[0]);
  assert.deepEqual(orbit23,{
    states:[23,8,7,16,9,13],
    exit:"critical-point",endpoint:null
  });
  const allCycles=cycles(graph);
  assert.deepEqual(allCycles,[[15,27,21],[10,28,18,22]]);
  assert.equal(graph.filter(s=>s.next===s.x).length,0);

  // The jet match at x15 is not forced by the previously identified
  // (X-24)^2 polynomial divisor: adding (X-24)^2 preserves that factor
  // while changing both P(15) and P'(15) modulo29.
  const squaredModification=bytes.slice();
  const n=squaredModification.length;
  // Descending polynomial add X^2 - 48X + 576 at the final 3 slots.
  squaredModification[n-3]+=1;
  squaredModification[n-2]-=48;
  squaredModification[n-1]+=576;
  assert.deepEqual(
    [jet(squaredModification,24).value,jet(squaredModification,24).derivative],
    [0,0]
  );
  assert.notDeepEqual(
    [jet(squaredModification,15).value,jet(squaredModification,15).derivative],
    [value,slope]
  );

  console.log(JSON.stringify({
    classification:"Exact original-source Newton-map structure; no LP2 key/plaintext",
    sourceGridSha256:sha,
    markedTriads:triads,
    p39SelfJet:{at:seed,value,slope,matchedSourceX:sameJet},
    markedP3Critical:critical[0],
    enlargedAcCritical:critical[1],
    newtonSeed15:orbit15,newtonSeed23:orbit23,
    full29StateCycles:allCycles,
    allCriticalStates:critical,
    noInvertibleDerivativeAt13or24:true,
    conditionalControl:"(X-24)^2 factor preserved but p39 jet match broken"
  },null,2));
}
if(require.main===module)main();

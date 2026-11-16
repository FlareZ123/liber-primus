"use strict";
/**
 * Issue #1256: fixed original 32x8 numeric table as 256-cell directed map.
 * Follow literal next-cell = decoded byte, not a guessed key/state.
 * Source-first base60 and distinct source-visible missing-"f" base59.
 *
 * Node.js 22, Windows 11:
 * node sims/lp2_p50_base59_base60_selfmap_sft.cjs
 *
 * The naturally distinguished starts are first/last and four physical
 * page seams (index79/80 and183/184). Reversed graph uses exactly one
 * canonical cycle-minimum, numeric-child-order, depth-first traversal.
 * Matched nulls Fisher-Yates shuffle ONLY the original value multiset.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const table = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/base60-grid.json"),"utf8"));
const tokens = table.rows.flat();
assert.equal(table.rows.length,32);
assert.ok(table.rows.every(row=>row.length===8));
assert.equal(tokens.length,256);
assert.deepEqual(table.page_row_counts,[10,13,9]);
const alphabet60=table.alphabet;
const alphabet59=alphabet60.replace("f","");
assert.equal(alphabet60.length,60);
assert.equal(alphabet59.length,59);
assert.deepEqual([...alphabet60].filter(ch=>!tokens.some(t=>t.includes(ch))),["f"]);

/** @param {string} alphabet @returns {number[]} */
function parse(alphabet){
  return tokens.map(t=>{
    assert.equal(t.length,2);
    const high=alphabet.indexOf(t[0]),low=alphabet.indexOf(t[1]);
    assert.ok(high>=0&&low>=0);
    const value=high*alphabet.length+low;
    assert.ok(value>=0&&value<256);
    return value;
  });
}
const base60=parse(alphabet60),base59=parse(alphabet59);
assert.equal(new Set(base60).size,161);
assert.equal(new Set(base59).size,161);
const seedIndices=[0,79,80,183,184,255];

/** @param {number[]} values @param {number} start */
function orbit(values,start){
  const seen=new Map(),positions=[];
  let x=start;
  while(!seen.has(x)){
    seen.set(x,positions.length);
    positions.push(x);
    x=values[x];
  }
  return {start,positions,preperiod:seen.get(x),
    cycleLength:positions.length-seen.get(x),reentry:x};
}

/** @param {number[]} values */
function graph(values){
  const roots=new Int16Array(256).fill(-1),cycles=[];
  for(let start=0;start<256;start++){
    if(roots[start]>=0)continue;
    const trail=[],seen=new Map();
    let x=start;
    while(roots[x]<0&&!seen.has(x)){
      seen.set(x,trail.length);
      trail.push(x);
      x=values[x];
    }
    let leader;
    if(seen.has(x)){
      const vertices=trail.slice(seen.get(x));
      leader=Math.min(...vertices);
      cycles.push({leader,vertices});
    }else leader=roots[x];
    for(const v of trail)roots[v]=leader;
  }
  const basins=cycles.map(c=>({
    ...c,cycleLength:c.vertices.length,
    basin:[...roots].filter(x=>x===c.leader).length
  })).sort((a,b)=>a.leader-b.leader);
  return {basins,roots};
}

/** @param {number[]} values */
function canonicalReverseTreeOrder(values){
  const source=graph(values),children=Array.from({length:256},()=>[]);
  for(let i=0;i<256;i++)children[values[i]].push(i);
  const cycleSet=new Set(source.basins.flatMap(b=>b.vertices));
  const order=[];
  /** @param {number} node */
  function walk(node){
    order.push(node);
    for(const incoming of children[node])
      if(!cycleSet.has(incoming))walk(incoming);
  }
  for(const basin of source.basins){
    let node=basin.leader;
    do{
      walk(node);
      node=values[node];
    }while(node!==basin.leader);
  }
  assert.equal(order.length,256);
  assert.equal(new Set(order).size,256);
  return order;
}

/** @param {number[]} bytes */
function inspectTypedBytes(bytes){
  const printable=bytes.filter(v=>v>=32&&v<=126).length;
  let run=0,longestRun=0;
  for(const v of bytes){
    run=v>=32&&v<=126?run+1:0;
    longestRun=Math.max(longestRun,run);
  }
  const prefix=bytes.slice(0,16);
  const standardSignatures=[
    [0x89,0x50,0x4e,0x47],[0x25,0x50,0x44,0x46],
    [0x50,0x4b,0x03,0x04],[0x1f,0x8b],[0x7f,0x45,0x4c,0x46],
    [0x47,0x49,0x46,0x38],[0x52,0x49,0x46,0x46]
  ];
  const magic=standardSignatures.some(s=>s.every((v,i)=>bytes[i]===v));
  const frequencies=Array(29).fill(0);
  for(const v of bytes)frequencies[v%29]++;
  const ioc=frequencies.reduce((sum,x)=>sum+x*(x-1),0)/(256*255);
  return {prefix,printable,longestPrintableRun:longestRun,
    standardTypedFileSignature:magic,gp29ModuloIoC:ioc};
}

/** @param {number[]} values */
function graphStats(values){
  const g=graph(values);
  return {cycles:g.basins.length,
    cyclicNodes:g.basins.reduce((s,b)=>s+b.cycleLength,0),
    largestBasin:Math.max(...g.basins.map(b=>b.basin)),
    sameAllSeamRoots:seedIndices.every(k=>
      g.roots[k]===g.roots[seedIndices[0]]),
    longestSeamOrbit:Math.max(...seedIndices.map(k=>orbit(values,k).positions.length))};
}
const original60=graphStats(base60),original59=graphStats(base59);
assert.deepEqual(original60,{cycles:2,cyclicNodes:13,largestBasin:252,
  sameAllSeamRoots:true,longestSeamOrbit:32});
assert.deepEqual(original59,{cycles:1,cyclicNodes:1,largestBasin:256,
  sameAllSeamRoots:true,longestSeamOrbit:31});
const structure60=graph(base60),structure59=graph(base59);
assert.deepEqual(structure60.basins.map(b=>
  [b.leader,b.cycleLength,b.basin]),[[0,11,252],[158,2,4]]);
assert.deepEqual(structure59.basins.map(b=>
  [b.leader,b.cycleLength,b.basin]),[[189,1,256]]);
assert.equal(base59[189],189);
assert.equal(tokens[189],"3C");
assert.equal(Math.floor(189/8),23);
assert.equal(189%8,5);
const orbits60=seedIndices.map(k=>orbit(base60,k));
const orbits59=seedIndices.map(k=>orbit(base59,k));
assert.deepEqual(orbits60.map(o=>o.positions.length),[11,16,22,32,16,23]);
assert.deepEqual(orbits59.map(o=>o.positions.length),[26,17,30,31,30,18]);
const readout60=canonicalReverseTreeOrder(base60).map(k=>base60[k]);
const readout59=canonicalReverseTreeOrder(base59).map(k=>base59[k]);
assert.equal(inspectTypedBytes(readout60).printable,103);

/**
 * Fully matched permutation null, including exact 256 decoded values.
 * xorshift32 is reproducible and has a vastly larger period than 30k*255.
 * @param {number[]} original
 * @param {number} seed
 * @param {number} iterations
 */
function matchedNull(original,seed,iterations=30000){
  const work=original.slice(),counters={
    atMostTwoCycles:0,atMost13CyclicNodes:0,basinAtLeast252:0,
    oneFixedPointAllVertices:0,allSixSeedsSameBasin:0,
    maxSeamOrbitAtLeast32:0
  };
  let state=seed>>>0;
  function random(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
  for(let n=0;n<iterations;n++){
    for(let i=255;i>0;i--){
      const j=random()%(i+1);
      [work[i],work[j]]=[work[j],work[i]];
    }
    const s=graphStats(work);
    counters.atMostTwoCycles+=Number(s.cycles<=2);
    counters.atMost13CyclicNodes+=Number(s.cyclicNodes<=13);
    counters.basinAtLeast252+=Number(s.largestBasin>=252);
    counters.oneFixedPointAllVertices+=Number(
      s.cycles===1&&s.cyclicNodes===1&&s.largestBasin===256);
    counters.allSixSeedsSameBasin+=Number(s.sameAllSeamRoots);
    counters.maxSeamOrbitAtLeast32+=Number(s.longestSeamOrbit>=32);
  }
  return {iterations,seed:"0x"+seed.toString(16),
    counts:counters,frequencies:Object.fromEntries(
      Object.entries(counters).map(([k,v])=>[k,v/iterations]))};
}
const null60=matchedNull(base60,0x33012026);
const null59=matchedNull(base59,0x33015926);
assert.equal(null60.counts.basinAtLeast252,4685);
assert.equal(null59.counts.oneFixedPointAllVertices,108);

console.log(JSON.stringify({
  test:"original 32x8 256-cell self-addressing number-to-direction map",
  exactOriginalCells:256,
  originalDistinctSecondSymbols:59,
  soleMissingAlphabetSymbol:"f",
  fixedSeamSeeds:seedIndices,
  base60:{structure:structure60.basins,orbits:orbits60.map(o=>({
    start:o.start,path:o.positions.length,cycle:o.cycleLength,
    preperiod:o.preperiod})),
    canonicalByteReadout:inspectTypedBytes(readout60),matchedNull:null60},
  base59:{structure:structure59.basins,orbits:orbits59.map(o=>({
    start:o.start,path:o.positions.length,cycle:o.cycleLength,
    preperiod:o.preperiod})),
    printedRoot:{index:189,zeroBasedRow:23,zeroBasedColumn:5,
      originalCell:"3C",physicalPage:51,localRow:0},
    canonicalByteReadout:inspectTypedBytes(readout59),matchedNull:null59},
  decision:"All six printed source-seam roots share 11-cycle under base60; missing-f base59 has one fixed 189 root for all 256 starts, rare under a fixed-multiset null (108/30000). Neither canonical byte tape is a typed file or complete readable text. No authenticated key, plaintext or instruction."
},null,2));

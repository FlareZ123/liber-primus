"use strict";
/**
 * Explore whether the physical 32x8 byte-table row order carries a low-variation
 * channel. Exploratory original-input test, not a cipher/key identification.
 * Run from repository root: node sims/grid_two_channel_serial_order_sft.cjs
 *
 * One SFT, no dependencies. The two test families correct for scanning every
 * pair among all 8 columns, including non-adjacent pairs (28 choices).
 * @typedef {{name:string, rows:number[][], boundaries:number[]}} Source
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),"utf8"));
const grid=load("resources/liber-primus/base60-grid.json");
const onion=load("resources/cicada2014-onion2-timing.json");
const hex=onion.final_hex;
assert.match(hex,/^[0-9a-f]{512}$/i);
const onionBytes=Array.from({length:256},(_,i)=>parseInt(hex.slice(2*i,2*i+2),16));
const onionRows=Array.from({length:32},(_,i)=>onionBytes.slice(8*i,8*i+8));
const gridRows=grid.byte_rows;
// Exact competing five-cell reading documented in
// im-results/historical-onion-xor-grid-source-inversion.md.
const alternateRows=gridRows.map(row=>row.slice());
for(const [index,current,alternate] of [
  [45,107,81],[50,47,21],[165,18,47],[172,148,174],[246,198,224]
]){
  assert.equal(gridRows[Math.floor(index/8)][index%8],current);
  alternateRows[Math.floor(index/8)][index%8]=alternate;
}
const sources=[
  {name:"original printed LP2 grid",rows:gridRows,boundaries:[0,10,23,32]},
  {name:"independent historical onion2 byte string",rows:onionRows,boundaries:[0,32]}
];
for(const source of sources){
  assert.equal(source.rows.length,32,source.name);
  assert(source.rows.every(row=>row.length===8 && row.every(b=>Number.isInteger(b)&&b>=0&&b<256)),source.name);
}
assert.deepEqual(grid.page_row_counts,[10,13,9]);
assert.equal(grid.alphabet.length,60);
assert.deepEqual(grid.rows.flat().map(t =>
  grid.alphabet.indexOf(t[0])*60+grid.alphabet.indexOf(t[1])),gridRows.flat());
const TRIALS=100000;
const SEED=0x33013301;
/** @returns {()=>number} */
function prng(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
}
/** @param {number[]} index @param {number[]} boundaries @param {()=>number} next */
function shuffleWithin(index,boundaries,next){
  for(let s=0;s<boundaries.length-1;s++){
    const lo=boundaries[s],hi=boundaries[s+1];
    for(let i=hi-1;i>lo;i--){
      const j=lo+(next()%(i-lo+1));
      [index[i],index[j]]=[index[j],index[i]];
    }
  }
}
/** @param {number[][]} rows @param {number[]} boundaries */
function baseline(rows,boundaries){
  const expected=Array(8).fill(0);
  let pairs=0;
  for(let s=0;s<boundaries.length-1;s++){
    for(let i=boundaries[s];i<boundaries[s+1];i++){
      for(let k=i+1;k<boundaries[s+1];k++){
        for(let c=0;c<8;c++)expected[c]+=Math.abs(rows[i][c]-rows[k][c]);
        pairs++;
      }
    }
  }
  assert(pairs>0);
  return expected.map(x=>x/pairs);
}
/** @param {number[][]} rows @param {number[]} boundaries @param {number[]} index @param {number[]} expected */
function scores(rows,boundaries,index,expected){
  const sum=Array(8).fill(0);
  let joins=0;
  for(let s=0;s<boundaries.length-1;s++){
    for(let i=boundaries[s]+1;i<boundaries[s+1];i++){
      for(let c=0;c<8;c++)sum[c]+=Math.abs(rows[index[i]][c]-rows[index[i-1]][c]);
      joins++;
    }
  }
  return sum.map((v,c)=>v/(joins*expected[c]));
}
/** @param {number[]} perColumn */
function bestPair(perColumn){
  let value=Infinity,cols=null;
  for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){
    const x=perColumn[i]+perColumn[j];
    if(x<value){value=x;cols=[i+1,j+1];}
  }
  return {value,columns:cols};
}
/** @param {Source} source @param {number[]} boundaries @param {number} seed */
function assess(source,boundaries,seed){
  const {rows}=source;
  const original=Array.from({length:32},(_,i)=>i);
  const exp=baseline(rows,boundaries);
  assert(exp.every(x=>x>0),"all columns must have variation");
  const perColumn=scores(rows,boundaries,original,exp);
  const best=bestPair(perColumn);
  const next=prng(seed),permuted=original.slice();
  let exceed=0;
  for(let t=0;t<TRIALS;t++){
    shuffleWithin(permuted,boundaries,next);
    if(bestPair(scores(rows,boundaries,permuted,exp)).value<=best.value)exceed++;
  }
  return {source:source.name,segments:boundaries.slice(1).map((x,j)=>x-boundaries[j]),score:best.value,
    columns:best.columns,perColumn:perColumn.map(x=>Number(x.toFixed(7))),
    exceed,plusOneP:(exceed+1)/(TRIALS+1),trials:TRIALS,seed:"0x"+seed.toString(16)};
}
const gridPrinted=assess(sources[0],[0,32],SEED);
const gridPerPage=assess(sources[0],[0,10,23,32],SEED^0x65a50617);
const altSource={name:"five-cell alternate grid reading",rows:alternateRows,boundaries:[0,10,23,32]};
const altPrinted=assess(altSource,[0,32],SEED);
const altPerPage=assess(altSource,[0,10,23,32],SEED^0x65a50617);
const onionControl=assess(sources[1],[0,32],SEED);
console.log(JSON.stringify({gridPrinted,gridPerPage,altPrinted,altPerPage,onionControl},null,2));
assert.deepEqual(gridPrinted.columns,[7,8],"canonical table selected pair changed");
assert.deepEqual(gridPerPage.columns,[7,8],"within-page selected pair changed");
assert(gridPrinted.plusOneP<0.03 && gridPerPage.plusOneP<0.03,
  "original serial-order signal not reproduced within exploratory threshold");
assert.deepEqual(altPrinted.columns,[7,8]);
assert.deepEqual(altPerPage.columns,[7,8]);
assert(altPrinted.plusOneP<0.03 && altPerPage.plusOneP<0.03,
  "alternate five-cell grid reading loses original signal");
assert(onionControl.plusOneP>0.1,"onion source unexpectedly exhibits serial ordering");
console.log("SFT PASS: exploratory source ordering confirmed; no LP2 key, cipher or plaintext.");

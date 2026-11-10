"use strict";
/**
 * Historical 2014 PATIENCE column order vs the original LP2 red-ink/13-dot
 * 256-event channel and 32-by-8 printed numerical table.
 *
 * Source-only comparison. Tests full 8! permutation-exchangeability null and
 * early/late row partitions, includes blind synthetic exact alignment control.
 * No claim that any recovered LP2 plaintext, key, or intended mapping exists.
 *
 * Run: node sims/red256_grid_patience_column_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {events} = require("./red_256_event_key_inverse.cjs");

const ROOT = path.resolve(__dirname,"..");
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const rows = read("resources/liber-primus/base60-grid.json").byte_rows;
const stream = events();
assert.equal(rows.length,32);
assert.ok(rows.every(r=>r.length===8));
assert.equal(stream.length,256);
assert.equal(stream.filter(x=>x.kind===0).length,31);
assert.equal(stream.filter(x=>x.kind===1).length,225);
const values = stream.map(x=>x.value);

/**
 * Exact 2014 Cicada stage-3 "PATIENCE" key:
 * sort column positions by the corresponding GP prime value; stable original
 * position breaks the duplicated E tie. This yields [6,5,3,0,2,4,7,1].
 */
function historicOrder() {
  const spelling = "PATIENCE";
  const key = [...spelling].map(ch=>{
    const n=corpus.translit.indexOf(ch);
    assert.ok(n>=0);
    return corpus.prime[n];
  });
  const order=Array.from({length:8},(_,i)=>i)
    .sort((i,j)=>key[i]-key[j]||i-j);
  assert.deepEqual(key,[43,97,59,31,67,29,13,67]);
  assert.deepEqual(order,[6,5,3,0,2,4,7,1]);
  return {spelling,primeValues:key,order};
}

/** Row-selective 8 by 8 incidence matrix for an explicitly chosen view. */
function incidence(grid,start,end,view) {
  return Array.from({length:8},(_,sourceCol)=>
    Array.from({length:8},(_,gridCol)=>{
      let matches=0;
      for(let r=start;r<end;r++) {
        const v=grid[r][gridCol];
        const out=view==="low5"?(v&31):view==="mod29"?(v%29):v;
        if(values[8*r+sourceCol]===out)matches++;
      }
      return matches;
    }));
}

/**
 * Exact column assignment null: enumerate every one of the 8! bijections,
 * preserving original grid rows, event chronology and all per-row values.
 */
function permutations8() {
  const all=[];
  function visit(p,remaining) {
    if(!remaining.length){all.push(p);return;}
    for(let j=0;j<remaining.length;j++)visit(
      [...p,remaining[j]],[...remaining.slice(0,j),...remaining.slice(j+1)]);
  }
  visit([],[0,1,2,3,4,5,6,7]);
  assert.equal(all.length,40320);
  return all;
}
const allOrders=permutations8();

function measure(grid,start,end,view,order) {
  const matrix=incidence(grid,start,end,view);
  const score=p=>p.reduce((s,col,j)=>s+matrix[j][col],0);
  const observed=score(order);
  let betterOrEqual=0,total=0,best=-1,worst=Infinity,sum=0;
  const histogram=new Map();
  for(const p of allOrders) {
    const s=score(p);
    total++;
    sum+=s;
    if(s>=observed)betterOrEqual++;
    best=Math.max(best,s);
    worst=Math.min(worst,s);
    histogram.set(s,(histogram.get(s)||0)+1);
  }
  return {sourceRows:[start,end-1],view,historicalScore:observed,
    comparisonOrders:total,atLeastAsHigh:betterOrEqual,
    exactConditionalUpperTail:betterOrEqual/total,
    meanPermutationScore:sum/total,min:worst,max:best,
    scoreHistogram:Array.from(histogram).sort((a,b)=>a[0]-b[0])};
}

/** Reuse high bits but put the exact authentic event index in each low5 slot. */
function syntheticAlignedGrid(order) {
  const plant=rows.map(r=>r.slice());
  for(let r=0;r<32;r++)for(let j=0;j<8;j++) {
    const k=order[j];
    plant[r][k]=(rows[r][k]&224)|values[8*r+j];
  }
  return plant;
}

function run() {
  const historical=historicOrder();
  const order=historical.order;
  const tests={
    entireLow5:measure(rows,0,32,"low5",order),
    first16Low5:measure(rows,0,16,"low5",order),
    last16Low5:measure(rows,16,32,"low5",order),
    entireRawByte:measure(rows,0,32,"raw",order),
    entireResidue29:measure(rows,0,32,"mod29",order)
  };
  assert.equal(tests.entireLow5.historicalScore,15);
  assert.equal(tests.entireLow5.atLeastAsHigh,135);
  assert.equal(tests.first16Low5.historicalScore,9);
  assert.equal(tests.last16Low5.historicalScore,6);
  assert.equal(tests.entireRawByte.historicalScore,2);
  assert.equal(tests.entireResidue29.historicalScore,8);
  assert.deepEqual([tests.entireLow5.min,tests.entireLow5.max],[1,17]);
  const controls={
    syntheticTrueSource:measure(syntheticAlignedGrid(order),0,32,"low5",order)
  };
  assert.equal(controls.syntheticTrueSource.historicalScore,256);
  assert.equal(controls.syntheticTrueSource.atLeastAsHigh,1);
  const locations=[];
  for(let r=0;r<32;r++)for(let j=0;j<8;j++) {
    const evt=stream[8*r+j],byte=rows[r][order[j]];
    if((byte&31)===evt.value)locations.push({
      gridRow:r,sourceColumn:j,printedColumn:order[j],
      sourcePage:evt.page,inkKind:evt.kind===0?"13dot":"redRune",
      eventValue:evt.value,gridByte:byte
    });
  }
  assert.equal(locations.length,15);
  const summary=Object.fromEntries(Object.entries(tests).map(([k,v])=>
    [k,{sourceRows:v.sourceRows,view:v.view,score:v.historicalScore,
      mean:v.meanPermutationScore,atLeastAsHigh:v.atLeastAsHigh,
      permutations:v.comparisonOrders,p:v.exactConditionalUpperTail,
      min:v.min,max:v.max}]));
  return {evidenceClass:"retrospective source-only alignment test; no LP2 decryption",
    sources:{historical,inkEvents:values.length,redRunes:225,
      thirteenDotStencils:31,printedGridShape:[32,8]},
    hypothesis:"eventIndex = originalGridByte&31 after PATIENCE rowwise column reordering",
    observed:summary,
    matchingPositions:locations,
    plantedPositive:{
      score:controls.syntheticTrueSource.historicalScore,
      atLeastAsHigh:controls.syntheticTrueSource.atLeastAsHigh,
      permutations:controls.syntheticTrueSource.comparisonOrders},
    decision:"15/256 matches despite favorable permutation rank; weak partial numerical alignment, no complete source mapping or key"
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={historicOrder,incidence,permutations8,measure,syntheticAlignedGrid,run};

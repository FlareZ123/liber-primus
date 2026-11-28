"use strict";

/**
 * Reciprocal p50-zero-dose -> T7 holdout gate.
 *
 * The source-selected state schedule is already frozen elsewhere:
 * row-major p50, continuous p0-p55 clock, left endpoint, phase zero.
 * Preserve the observed equality-event count inside each literal-zero dose
 * stratum exactly (0/1/2 zero characters in the current p50 cell), then
 * randomize only WHICH eligible source sites carry the 86 repeat events.
 *
 * T7 (lag-1 correlation of consecutive repeat gaps) is therefore a held-out
 * ordering statistic. If the p50 dose association alone generated T7, this
 * conditional null should reproduce +0.380 without fitting a new parameter.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const toks=grid.rows.flat();
assert.equal(toks.length,256);

const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.page<=55&&p.runic_count);
const tape=pages.flatMap(p=>p.indices);
assert.equal(tape.length,12956);
const seams=new Set();
let off=0;
for(const p of pages){
  off+=p.indices.length;
  if(off<tape.length)seams.add(off-1);
}
const zeroCount=t=>Number(t[0]==="0")+Number(t[1]==="0");
const strata=[[],[],[]], events=[];
for(let i=0;i<tape.length-1;i++){
  if(seams.has(i))continue;
  strata[zeroCount(toks[i&255])].push(i);
  if(tape[i]===tape[i+1])events.push(i);
}
assert.deepEqual(strata.map(x=>x.length),[9725,3076,100]);
assert.equal(events.length,86);
const eventCounts=[0,0,0];
for(const i of events)eventCounts[zeroCount(toks[i&255])]++;
assert.deepEqual(eventCounts,[52,29,5]);

function corr(a,b){
  const ma=a.reduce((s,v)=>s+v,0)/a.length;
  const mb=b.reduce((s,v)=>s+v,0)/b.length;
  let c=0,aa=0,bb=0;
  for(let i=0;i<a.length;i++){
    const x=a[i]-ma,y=b[i]-mb;
    c+=x*y; aa+=x*x; bb+=y*y;
  }
  return c/Math.sqrt(aa*bb);
}
function t7(sites){
  sites=[...sites].sort((a,b)=>a-b);
  const gaps=sites.slice(1).map((v,i)=>v-sites[i]);
  return corr(gaps.slice(0,-1),gaps.slice(1));
}
const observed=t7(events);
assert.ok(Math.abs(observed-0.38001968924100965)<1e-15);

// Exact source-dose detail: the only two "00" cells are phases 192 and 229.
const exact00=toks.flatMap((t,i)=>t==="00"?[i]:[]);
assert.deepEqual(exact00,[192,229]);
const residueHits=Array(256).fill(0);
for(const i of events)residueHits[i&255]++;
assert.deepEqual(exact00.map(i=>residueHits[i]),[4,1]);

// A zero on the RIGHT/next table cell does not create a comparable two-tap
// state signal; preserve this as a descriptive obstruction to the simplest
// adjacent-zero-overlap sender.
const pair=Array.from({length:3},()=>Array.from({length:3},()=>({opp:0,hit:0})));
for(let i=0;i<tape.length-1;i++){
  if(seams.has(i))continue;
  const a=zeroCount(toks[i&255]),b=zeroCount(toks[(i+1)&255]);
  pair[a][b].opp++;
  if(tape[i]===tape[i+1])pair[a][b].hit++;
}
assert.deepEqual(pair.map(r=>r.map(x=>x.hit)),[[40,12,0],[25,4,0],[5,0,0]]);

// Split events by the already source-defined first-character-zero mask.  T7
// is not internal to either channel, and four transition-class mean gaps do
// not absorb it: the residual ordering correlation stays near the original.
const typed=events.map(i=>({i,mask:toks[i&255][0]==="0"}));
const maskSites=typed.filter(x=>x.mask).map(x=>x.i);
const nonMaskSites=typed.filter(x=>!x.mask).map(x=>x.i);
assert.equal(maskSites.length,33);
assert.equal(nonMaskSites.length,53);
const channelT7={mask:t7(maskSites),nonMask:t7(nonMaskSites)};
const gaps=typed.slice(1).map((x,k)=>x.i-typed[k].i);
const classes=typed.slice(1).map((x,k)=>(typed[k].mask?"M":"N")+(x.mask?"M":"N"));
const transitionMeans={};
for(const key of ["NN","NM","MN","MM"]){
  const a=gaps.filter((_,i)=>classes[i]===key);
  transitionMeans[key]=a.reduce((s,v)=>s+v,0)/a.length;
}
const predicted=classes.map(k=>transitionMeans[k]);
const residual=gaps.map((v,i)=>v-predicted[i]);
const residualLag1=corr(residual.slice(0,-1),residual.slice(1));
const meanGap=gaps.reduce((s,v)=>s+v,0)/gaps.length;
const sst=gaps.reduce((s,v)=>s+(v-meanGap)**2,0);
const sse=residual.reduce((s,v)=>s+v*v,0);
const transitionVarianceExplained=1-sse/sst;
assert.ok(Math.abs(channelT7.mask+0.01779422316719754)<1e-12);
assert.ok(Math.abs(channelT7.nonMask-0.05085402960384603)<1e-12);
assert.ok(residualLag1>0.35);
assert.ok(transitionVarianceExplained<0.07);

/** @param {number} seed @param {number} draws */
function simulate(seed,draws){
  let state=seed>>>0;
  function uniform(){
    state^=state<<13; state^=state>>>17; state^=state<<5;
    return(state>>>0)/4294967296;
  }
  function sample(arr,k){
    const chosen=new Set();
    while(chosen.size<k)chosen.add(Math.floor(uniform()*arr.length));
    return [...chosen].map(i=>arr[i]);
  }
  const vals=[];
  let ge=0;
  for(let d=0;d<draws;d++){
    const sites=[];
    for(let q=0;q<3;q++)sites.push(...sample(strata[q],eventCounts[q]));
    const v=t7(sites);
    vals.push(v);
    if(v>=observed)ge++;
  }
  vals.sort((a,b)=>a-b);
  const q=p=>vals[Math.floor(p*(draws-1))];
  return{
    seed,draws,geObserved:ge,
    addOneUpper:(ge+1)/(draws+1),
    median:q(.5),q95:q(.95),q99:q(.99),max:vals.at(-1)
  };
}
const runs=[simulate(3301,20000),simulate(123456789,20000)];
assert.ok(runs.every(r=>r.addOneUpper<0.002));

console.log(JSON.stringify({
  sourceSchedule:"p50 row-major / continuous p0-p55 / left endpoint / phase0",
  opportunitiesByLiteralZeroCount:strata.map(x=>x.length),
  equalityEventsByLiteralZeroCount:eventCounts,
  exact00:{phases:exact00,eventHits:exact00.map(i=>residueHits[i])},
  adjacentZeroPairHits:pair.map(r=>r.map(x=>x.hit)),
  sourceMaskChannelDecomposition:{
    channelT7,
    transitionMeans,
    transitionVarianceExplained,
    residualLag1
  },
  observedT7:observed,
  conditionalDoseNull:runs,
  decision:"P50_ZERO_DOSE_AND_T7_ARE_DISTINCT_CONSTRAINTS;_ZERO_DOSE_ALONE_DOES_NOT_GENERATE_T7"
},null,2));

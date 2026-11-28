"use strict";

/**
 * SFT: conditional rejection of every independent stationary one-cell p50
 * residue hazard as the source of LP2 T7 ordering.
 *
 * A model may assign an arbitrary Bernoulli probability p_r to each of the
 * 256 row-major p50 residues. Conditional on the observed number e_r of
 * equality events at each residue, all subsets of size e_r among that
 * residue's real opportunities are equiprobable. Sampling those subsets
 * therefore removes all 256 nuisance probabilities without fitting them.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const tokens=grid.rows.flat();
assert.equal(tokens.length,256);

const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.page<=55&&p.runic_count);
const tape=pages.flatMap(p=>p.indices);
assert.equal(tape.length,12956);

const seams=new Set();
let offset=0;
for(const p of pages){
  offset+=p.indices.length;
  if(offset<tape.length)seams.add(offset-1);
}

const pools=Array.from({length:256},()=>[]);
const eventCounts=Array(256).fill(0);
const events=[];
for(let i=0;i<tape.length-1;i++){
  if(seams.has(i))continue;
  const r=i&255;
  pools[r].push(i);
  if(tape[i]===tape[i+1]){
    eventCounts[r]++;
    events.push(i);
  }
}
assert.equal(pools.reduce((s,a)=>s+a.length,0),12901);
assert.equal(events.length,86);

const hist={};
for(const n of eventCounts)hist[n]=(hist[n]||0)+1;
assert.deepEqual(hist,{"0":190,"1":52,"2":9,"3":4,"4":1});

let firstZeroOpp=0,firstZeroHit=0,col3Opp=0,col3Hit=0;
for(let r=0;r<256;r++){
  if(tokens[r][0]==="0"){
    firstZeroOpp+=pools[r].length;
    firstZeroHit+=eventCounts[r];
  }
  if((r%8)===3){
    col3Opp+=pools[r].length;
    col3Hit+=eventCounts[r];
  }
}
assert.equal(firstZeroOpp,3025);
assert.equal(firstZeroHit,33);
assert.equal(col3Opp,1617);
assert.equal(col3Hit,18);

/** @param {number[]} a @param {number[]} b */
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

/** @param {number[]} sites */
function t7(sites){
  const sorted=[...sites].sort((a,b)=>a-b);
  const gaps=sorted.slice(1).map((v,i)=>v-sorted[i]);
  return corr(gaps.slice(0,-1),gaps.slice(1));
}

const observed=t7(events);
assert.ok(Math.abs(observed-0.38001968924100965)<1e-15);

/**
 * @param {number} seed
 * @param {number} draws
 */
function simulate(seed,draws){
  let state=seed>>>0;
  function uniform(){
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return(state>>>0)/4294967296;
  }

  /** @param {number[]} arr @param {number} k @param {number[]} out */
  function sample(arr,k,out){
    const chosen=new Set();
    while(chosen.size<k)chosen.add(Math.floor(uniform()*arr.length));
    for(const j of chosen)out.push(arr[j]);
  }

  const vals=[];
  let ge=0;
  for(let d=0;d<draws;d++){
    const sites=[];
    for(let r=0;r<256;r++){
      if(eventCounts[r])sample(pools[r],eventCounts[r],sites);
    }
    const value=t7(sites);
    vals.push(value);
    if(value>=observed)ge++;
  }
  vals.sort((a,b)=>a-b);
  const q=p=>vals[Math.floor(p*(draws-1))];
  return{
    seed,
    draws,
    geObserved:ge,
    addOneUpper:(ge+1)/(draws+1),
    median:q(.5),
    q95:q(.95),
    q99:q(.99),
    max:vals.at(-1)
  };
}

const runs=[
  simulate(3301,50000),
  simulate(123456789,50000)
];
assert.ok(runs.every(r=>r.addOneUpper<0.002));

console.log(JSON.stringify({
  sourceSchedule:"p50 row-major / continuous p0-p55 / left endpoint / phase0",
  opportunities:12901,
  equalityEvents:86,
  observedT7:observed,
  residueEventCountHistogram:hist,
  preservedSourceFeatures:{
    firstDigitZero:{opportunities:firstZeroOpp,events:firstZeroHit},
    column3:{opportunities:col3Opp,events:col3Hit}
  },
  conditionalResidueNull:runs,
  modelClassRejected:"independent stationary Bernoulli equality hazard with arbitrary probability p_r for each of 256 p50 residues",
  outsideScope:[
    "history-dependent or Markov hazards",
    "cycle/page-varying probabilities",
    "multi-cell or latent-state operations"
  ],
  decision:"P50_ONE_CELL_PHASE_PROFILE_AND_T7_REQUIRE_CROSS_EVENT_STATE"
},null,2));

"use strict";

/**
 * SFT: p50 dual-digit exception feedback.
 * Source schedule: original row-major 256-cell table, continuous p0-p55
 * rune clock, left endpoint, phase zero.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const tokens=grid.rows.flat();
const alphabet=grid.alphabet;
const high=tokens.map(t=>alphabet.indexOf(t[0]));
const low=tokens.map(t=>alphabet.indexOf(t[1]));
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

const events=[];
const pools=Array.from({length:256},()=>[]);
const eventCounts=Array(256).fill(0);
let opportunities=0;
for(let i=0;i<tape.length-1;i++){
  if(seams.has(i))continue;
  opportunities++;
  pools[i&255].push(i);
  if(tape[i]===tape[i+1]){
    events.push(i);
    eventCounts[i&255]++;
  }
}
assert.equal(opportunities,12901);
assert.equal(events.length,86);

function mean(a){return a.reduce((s,v)=>s+v,0)/a.length;}
function corr(a,b){
  const ma=mean(a),mb=mean(b);
  let c=0,aa=0,bb=0;
  for(let i=0;i<a.length;i++){
    const x=a[i]-ma,y=b[i]-mb;
    c+=x*y; aa+=x*x; bb+=y*y;
  }
  return c/Math.sqrt(aa*bb);
}

function scoreLookup(lookup){
  let zeroHits=0;
  for(const p of events)zeroHits+=Number(high[lookup(p&255)]===0);
  const gaps=events.slice(1).map((v,i)=>v-events[i]);
  const lowInnov=[],highInnov=[],xs=[],ys=[];
  let correct=0,nonzero=0;
  for(let n=0;n<gaps.length-1;n++){
    const innovation=gaps[n+1]-gaps[n];
    const digit=low[lookup(events[n+1]&255)];
    const lower=digit<30;
    (lower?lowInnov:highInnov).push(innovation);
    xs.push(digit); ys.push(innovation);
    if(innovation!==0){
      nonzero++;
      correct+=Number((lower&&innovation>0)||(!lower&&innovation<0));
    }
  }
  return{
    zeroHits,correct,nonzero,accuracy:correct/nonzero,
    nLow:lowInnov.length,nHigh:highInnov.length,
    meanLow:mean(lowInnov),meanHigh:mean(highInnov),
    meanDiff:mean(lowInnov)-mean(highInnov),
    lowInnovationCorrelation:corr(xs,ys)
  };
}

const source=scoreLookup(r=>r);
assert.equal(source.zeroHits,33);
assert.equal(source.correct,58);
assert.equal(source.nonzero,83);
assert.equal(source.nLow,42);
assert.equal(source.nHigh,42);
assert(Math.abs(source.meanLow-51.92857142857143)<1e-12);
assert(Math.abs(source.meanHigh+50.73809523809524)<1e-12);
assert(Math.abs(source.lowInnovationCorrelation+0.32074194975793396)<1e-12);

const phases=[];
for(let phase=0;phase<256;phase++)phases.push({phase,...scoreLookup(r=>(r+phase)&255)});
assert.equal(Math.max(...phases.map(x=>x.zeroHits)),33);
assert.equal(phases.filter(x=>x.zeroHits===33).length,1);
assert.equal(Math.max(...phases.map(x=>x.correct)),58);
assert.equal(phases.filter(x=>x.correct===58).length,1);
assert.equal(phases.filter(x=>x.zeroHits>=33&&x.correct>=58).length,1);

const orientations={
  forward:scoreLookup(r=>r),
  reverse:scoreLookup(r=>255-r),
  horizontalMirror:scoreLookup(r=>Math.floor(r/8)*8+(7-r%8)),
  verticalMirror:scoreLookup(r=>(31-Math.floor(r/8))*8+(r%8))
};
assert.deepEqual(
  Object.fromEntries(Object.entries(orientations).map(([k,v])=>[k,[v.zeroHits,v.correct]])),
  {forward:[33,58],reverse:[24,40],horizontalMirror:[24,37],verticalMirror:[26,39]}
);

const local={lowHalf:{opp:0,eq:0},highHalf:{opp:0,eq:0}};
for(let i=0;i<tape.length-1;i++){
  if(seams.has(i))continue;
  const k=low[i&255]<30?"lowHalf":"highHalf";
  local[k].opp++;
  if(tape[i]===tape[i+1])local[k].eq++;
}
assert.deepEqual(local,{lowHalf:{opp:6807,eq:42},highHalf:{opp:6094,eq:44}});

const gaps=events.slice(1).map((v,i)=>v-events[i]);
const panelRanges=[[0,9],[10,22],[23,31]];
const panels=panelRanges.map(([loRow,hiRow])=>{
  let n=0,correct=0;
  for(let k=0;k<gaps.length-1;k++){
    const r=events[k+1]&255,row=Math.floor(r/8);
    if(row<loRow||row>hiRow)continue;
    const innovation=gaps[k+1]-gaps[k];
    if(innovation===0)continue;
    n++;
    const lower=low[r]<30;
    correct+=Number((lower&&innovation>0)||(!lower&&innovation<0));
  }
  return{loRow,hiRow,n,correct,accuracy:correct/n};
});
assert.deepEqual(panels.map(x=>[x.n,x.correct]),[[24,17],[31,21],[28,20]]);

function eventSubsetScore(subset){
  const gs=subset.slice(1).map((v,i)=>v-subset[i]);
  let n=0,correct=0;
  for(let k=0;k<gs.length-1;k++){
    const innovation=gs[k+1]-gs[k];
    if(innovation===0)continue;
    n++;
    const lower=low[subset[k+1]&255]<30;
    correct+=Number((lower&&innovation>0)||(!lower&&innovation<0));
  }
  return{n,correct,accuracy:correct/n};
}
const temporal=[eventSubsetScore(events.slice(0,43)),eventSubsetScore(events.slice(43))];
assert.deepEqual(temporal.map(x=>[x.n,x.correct]),[[41,29],[40,28]]);

function makeRng(seed){
  let state=seed>>>0;
  return()=>{
    state^=state<<13; state^=state>>>17; state^=state<<5;
    return(state>>>0)/4294967296;
  };
}
function sampleInto(arr,k,U,out){
  const chosen=new Set();
  while(chosen.size<k)chosen.add(Math.floor(U()*arr.length));
  for(const j of chosen)out.push(arr[j]);
}
function scoreSites(sites){
  const s=[...sites].sort((a,b)=>a-b);
  const gs=s.slice(1).map((v,i)=>v-s[i]);
  let correct=0,nonzero=0,lowN=0,highN=0,sumLow=0,sumHigh=0;
  for(let k=0;k<gs.length-1;k++){
    const innovation=gs[k+1]-gs[k];
    const lower=low[s[k+1]&255]<30;
    if(lower){lowN++;sumLow+=innovation;}else{highN++;sumHigh+=innovation;}
    if(innovation!==0){
      nonzero++;
      correct+=Number((lower&&innovation>0)||(!lower&&innovation<0));
    }
  }
  return{correct,nonzero,meanDiff:sumLow/lowN-sumHigh/highN};
}
function residueConditional(draws,seed){
  const U=makeRng(seed);
  let geCorrect=0,geMeanDiff=0,geBoth=0;
  for(let d=0;d<draws;d++){
    const sites=[];
    for(let r=0;r<256;r++)if(eventCounts[r])sampleInto(pools[r],eventCounts[r],U,sites);
    const x=scoreSites(sites);
    if(x.correct>=source.correct)geCorrect++;
    if(x.meanDiff>=source.meanDiff)geMeanDiff++;
    if(x.correct>=source.correct&&x.meanDiff>=source.meanDiff)geBoth++;
  }
  return{
    draws,geCorrect,geMeanDiff,geBoth,
    correctUpper:(geCorrect+1)/(draws+1),
    meanDiffUpper:(geMeanDiff+1)/(draws+1),
    jointUpper:(geBoth+1)/(draws+1)
  };
}
const conditional=residueConditional(50000,3301);
assert.equal(conditional.geCorrect,17);
assert.equal(conditional.geMeanDiff,979);
assert.equal(conditional.geBoth,13);

function tokenPermutation(draws,seed){
  const U=makeRng(seed);
  let geZero=0,geCorrect=0,geBoth=0;
  for(let d=0;d<draws;d++){
    const perm=Array.from({length:256},(_,i)=>i);
    for(let i=255;i>0;i--){
      const j=Math.floor(U()*(i+1));
      [perm[i],perm[j]]=[perm[j],perm[i]];
    }
    let zeroHits=0,correct=0;
    for(const p of events)zeroHits+=Number(high[perm[p&255]]===0);
    for(let k=0;k<gaps.length-1;k++){
      const innovation=gaps[k+1]-gaps[k];
      if(innovation===0)continue;
      const lower=low[perm[events[k+1]&255]]<30;
      correct+=Number((lower&&innovation>0)||(!lower&&innovation<0));
    }
    if(zeroHits>=source.zeroHits)geZero++;
    if(correct>=source.correct)geCorrect++;
    if(zeroHits>=source.zeroHits&&correct>=source.correct)geBoth++;
  }
  return{
    draws,geZero,geCorrect,geBoth,
    zeroUpper:(geZero+1)/(draws+1),
    correctUpper:(geCorrect+1)/(draws+1),
    jointUpper:(geBoth+1)/(draws+1)
  };
}
const tokenNull=tokenPermutation(50000,3301);
assert.deepEqual([tokenNull.geZero,tokenNull.geCorrect,tokenNull.geBoth],[218,2,0]);

console.log(JSON.stringify({
  source,orientations,localLowHalfHazard:local,physicalPanels:panels,temporal,
  fullResidueConditional:conditional,wholeTokenPermutation:tokenNull,
  decision:"P50_DUAL_FIELD_EXCEPTION_PROCESS_HIGH_DIGIT_GATES_REPEAT_LOW_HALF_PREDICTS_NEXT_GAP_UPDATE_SIGN_MAGNITUDE_LAW_MISSING"
},null,2));

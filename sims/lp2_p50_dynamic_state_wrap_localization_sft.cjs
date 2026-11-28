"use strict";

/**
 * Source-frozen p50/T7 dynamic-state diagnostics.
 *
 * This SFT:
 * 1) holds the p50 first-digit-zero schedule fixed and tests whether it changes
 *    ordinary off-diagonal GP29 transitions;
 * 2) decomposes equality gaps into 256-cell whole-pass counts and within-table
 *    displacements under the already-frozen row-major continuous clock;
 * 3) ablates the two ordered components;
 * 4) tests several literal cumulative p50 state schedules by conditioning on
 *    their complete observed state/event-count vectors.
 *
 * These are mechanism constraints, not plaintext recovery.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const tokens=grid.rows.flat();
const values60=grid.byte_rows.flat();
const alphabet=grid.alphabet;
const alphabet59=alphabet.replace("f","");
assert.equal(tokens.length,256);

const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.page<=55&&p.runic_count);
const tape=pages.flatMap(p=>p.indices);
assert.equal(tape.length,12956);
const seams=new Set();
let off=0;
for(const p of pages){
  off+=p.indices.length;
  if(off<tape.length)seams.add(off-1);
}

const opportunities=[];
const events=[];
const residuePools=Array.from({length:256},()=>[]);
const residueEventCounts=Array(256).fill(0);
for(let i=0;i<tape.length-1;i++){
  if(seams.has(i))continue;
  opportunities.push(i);
  residuePools[i&255].push(i);
  if(tape[i]===tape[i+1]){
    events.push(i);
    residueEventCounts[i&255]++;
  }
}
assert.equal(opportunities.length,12901);
assert.equal(events.length,86);

/** @param {number[]} a @param {number[]} b */
function corr(a,b){
  const ma=a.reduce((s,v)=>s+v,0)/a.length;
  const mb=b.reduce((s,v)=>s+v,0)/b.length;
  let c=0,aa=0,bb=0;
  for(let i=0;i<a.length;i++){
    const x=a[i]-ma,y=b[i]-mb;
    c+=x*y; aa+=x*x; bb+=y*y;
  }
  return aa&&bb ? c/Math.sqrt(aa*bb) : 0;
}

/** @param {number[]} sites */
function gapComponents(sites){
  const s=[...sites].sort((a,b)=>a-b);
  const gaps=[],deltas=[],wraps=[];
  for(let i=1;i<s.length;i++){
    const gap=s[i]-s[i-1];
    const ra=s[i-1]&255,rb=s[i]&255;
    const delta=(rb-ra+256)&255;
    gaps.push(gap);
    deltas.push(delta);
    wraps.push((gap-delta)/256);
  }
  return{
    gaps,deltas,wraps,
    t7:corr(gaps.slice(0,-1),gaps.slice(1)),
    deltaLag:corr(deltas.slice(0,-1),deltas.slice(1)),
    wrapLag:corr(wraps.slice(0,-1),wraps.slice(1))
  };
}
const observed=gapComponents(events);
assert(Math.abs(observed.t7-0.38001968924100965)<1e-15);
assert(Math.abs(observed.deltaLag-0.04923458148839263)<1e-12);
assert(Math.abs(observed.wrapLag-0.367741935483871)<1e-12);
assert.deepEqual(
  [0,1,2].map(w=>observed.wraps.filter(x=>x===w).length),
  [71,10,4]
);

/** @param {number} seed */
function makeRng(seed){
  let state=seed>>>0;
  return()=>{
    state^=state<<13; state^=state>>>17; state^=state<<5;
    return(state>>>0)/4294967296;
  };
}

/** @param {number[]} arr @param {number} k @param {()=>number} uniform @param {number[]} out */
function sampleInto(arr,k,uniform,out){
  const chosen=new Set();
  while(chosen.size<k)chosen.add(Math.floor(uniform()*arr.length));
  for(const j of chosen)out.push(arr[j]);
}

/** @param {number[]} arr @param {()=>number} uniform */
function shuffled(arr,uniform){
  const out=[...arr];
  for(let i=out.length-1;i>0;i--){
    const j=Math.floor(uniform()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}

// Conditional on all 256 observed residue event counts, localize which ordered
// gap component carries the serial dependence.
function residueConditional(draws,seed){
  const U=makeRng(seed);
  let geDelta=0,geWrap=0;
  for(let d=0;d<draws;d++){
    const sites=[];
    for(let r=0;r<256;r++){
      if(residueEventCounts[r])sampleInto(residuePools[r],residueEventCounts[r],U,sites);
    }
    const x=gapComponents(sites);
    if(x.deltaLag>=observed.deltaLag)geDelta++;
    if(x.wrapLag>=observed.wrapLag)geWrap++;
  }
  return{
    draws,
    deltaUpper:(geDelta+1)/(draws+1),
    wrapUpper:(geWrap+1)/(draws+1),
    geDelta,geWrap
  };
}
const conditional=residueConditional(20000,3301);
assert(conditional.deltaUpper>0.05);
assert(conditional.wrapUpper<0.01);

// Ordered-component ablation.
function ablation(draws,seed){
  const U=makeRng(seed);
  let geKeepWrap=0,geKeepDelta=0;
  const keepWrap=[],keepDelta=[];
  for(let d=0;d<draws;d++){
    const ds=shuffled(observed.deltas,U);
    const ws=shuffled(observed.wraps,U);
    const g1=observed.wraps.map((w,i)=>256*w+ds[i]);
    const g2=ws.map((w,i)=>256*w+observed.deltas[i]);
    const t1=corr(g1.slice(0,-1),g1.slice(1));
    const t2=corr(g2.slice(0,-1),g2.slice(1));
    keepWrap.push(t1); keepDelta.push(t2);
    if(t1>=observed.t7)geKeepWrap++;
    if(t2>=observed.t7)geKeepDelta++;
  }
  const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
  return{
    draws,
    keepWrapMean:mean(keepWrap),
    keepWrapUpper:(geKeepWrap+1)/(draws+1),
    keepDeltaMean:mean(keepDelta),
    keepDeltaUpper:(geKeepDelta+1)/(draws+1)
  };
}
const abl=ablation(20000,123456789);
assert(abl.keepWrapUpper>0.02);
assert(abl.keepDeltaUpper<0.005);

// Binary >=256 persistence.
const long=observed.gaps.map(g=>g>=256);
let LL=0,LS=0,SL=0,SS=0;
for(let i=1;i<long.length;i++){
  const k=(long[i-1]?"L":"S")+(long[i]?"L":"S");
  if(k==="LL")LL++; else if(k==="LS")LS++; else if(k==="SL")SL++; else SS++;
}
assert.deepEqual([long.filter(Boolean).length,LL,LS,SL,SS],[14,6,8,8,62]);

// Held-out ordinary-transition discriminator.
const trans=Array.from({length:256},()=>Array.from({length:29},()=>new Uint16Array(29)));
for(const i of opportunities){
  const a=tape[i],b=tape[i+1];
  if(a!==b)trans[i&255][a][b]++;
}
/** @param {boolean[]} mask */
function offdiagG2(mask){
  let G=0,df=0;
  for(let a=0;a<29;a++){
    const z=new Uint32Array(29),n=new Uint32Array(29);
    for(let r=0;r<256;r++){
      const dst=mask[r]?z:n,row=trans[r][a];
      for(let b=0;b<29;b++)dst[b]+=row[b];
    }
    let nz=0,nn=0;
    for(let b=0;b<29;b++){nz+=z[b];nn+=n[b];}
    const nt=nz+nn;
    let used=0;
    for(let b=0;b<29;b++){
      if(b===a)continue;
      const total=z[b]+n[b];
      if(!total)continue;
      used++;
      const ez=nz*total/nt,en=nn*total/nt;
      if(z[b])G+=2*z[b]*Math.log(z[b]/ez);
      if(n[b])G+=2*n[b]*Math.log(n[b]/en);
    }
    df+=Math.max(0,used-1);
  }
  return{G,df};
}
const zeroMask=tokens.map(t=>t[0]==="0");
const offdiag=offdiagG2(zeroMask);
assert(Math.abs(offdiag.G-820.9612221509853)<1e-9);
assert.equal(offdiag.df,783);
let circularRank=0;
for(let phase=0;phase<256;phase++){
  const m=Array.from({length:256},(_,r)=>zeroMask[(r+phase)&255]);
  if(offdiagG2(m).G>=offdiag.G)circularRank++;
}
assert.equal(circularRank,193);

// Natural cumulative state schedules.
const values59=tokens.map(t=>{
  const a=alphabet59.indexOf(t[0]),b=alphabet59.indexOf(t[1]);
  return a<0||b<0 ? 0 : a*59+b;
});
const high=tokens.map(t=>alphabet.indexOf(t[0]));
const low=tokens.map(t=>alphabet.indexOf(t[1]));

/**
 * @param {number[]} vals
 * @param {number} modulus
 * @param {"sum"|"xor"} op
 */
function cumulative(vals,modulus,op="sum"){
  const state=new Uint16Array(tape.length);
  let s=0;
  for(let i=0;i<tape.length;i++){
    state[i]=s;
    const v=vals[i&255];
    s=op==="xor" ? (s^v) : ((s+v)%modulus);
  }
  return{state,size:modulus};
}
function jointDigitState(){
  const state=new Uint16Array(tape.length);
  let a=0,b=0;
  for(let i=0;i<tape.length;i++){
    state[i]=a*29+b;
    a=(a+high[i&255])%29;
    b=(b+low[i&255])%29;
  }
  return{state,size:841};
}
/**
 * Conditional on complete event counts per derived state.
 * @param {{state:Uint16Array,size:number}} model
 * @param {number} draws
 * @param {number} seed
 */
function conditionalState(model,draws,seed){
  const pools=Array.from({length:model.size},()=>[]);
  const counts=Array(model.size).fill(0);
  for(const i of opportunities)pools[model.state[i]].push(i);
  for(const i of events)counts[model.state[i]]++;
  const U=makeRng(seed);
  let geT=0,geZero=0,geBoth=0;
  for(let d=0;d<draws;d++){
    const sites=[];
    for(let q=0;q<model.size;q++)if(counts[q])sampleInto(pools[q],counts[q],U,sites);
    const t=gapComponents(sites).t7;
    let z=0;
    for(const i of sites)z+=Number(zeroMask[i&255]);
    if(t>=observed.t7)geT++;
    if(z>=33)geZero++;
    if(t>=observed.t7&&z>=33)geBoth++;
  }
  return{
    draws,
    t7Upper:(geT+1)/(draws+1),
    zeroUpper:(geZero+1)/(draws+1),
    jointUpper:(geBoth+1)/(draws+1),
    activeEventStates:counts.filter(Boolean).length,
    maxEventsPerState:Math.max(...counts)
  };
}

const models={
  base60sum29:cumulative(values60,29),
  base59sum29:cumulative(values59,29),
  highsum29:cumulative(high,29),
  lowsum29:cumulative(low,29),
  base60sum60:cumulative(values60,60),
  base59sum59:cumulative(values59,59),
  byteSum256:cumulative(values60,256),
  byteXor256:cumulative(values60,256,"xor"),
  digitPair841:jointDigitState()
};
const accumulator={};
let seed=3301;
for(const [name,model] of Object.entries(models)){
  accumulator[name]=conditionalState(model,5000,seed++);
  assert(accumulator[name].t7Upper<0.01);
  assert(accumulator[name].jointUpper<0.002);
}

console.log(JSON.stringify({
  sourceSchedule:"p50 row-major / continuous p0-p55 / left endpoint / phase0",
  observed:{
    t7:observed.t7,
    deltaLag:observed.deltaLag,
    wrapLag:observed.wrapLag,
    wrapCounts:[71,10,4],
    binary256:{long:14,LL,LS,SL,SS}
  },
  fullResidueConditional:conditional,
  ablation:abl,
  offDiagonal:{
    G2:offdiag.G,
    df:offdiag.df,
    circularRankGE:circularRank,
    interpretation:"ordinary-transition channel is not selected by the p50 zero state"
  },
  accumulators:accumulator,
  decision:"P50_ASSOCIATION_IS_DIAGONAL_WHILE_T7_MEMORY_IS_LARGE_GAP_TEMPORAL;_NATURAL_CUMULATIVE_STATES_FAIL"
},null,2));

'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const MASK = Uint8Array.from(
  grid.pages.flatMap(page => page.tokens),
  token => Number(token[0] === '0')
);
assert.equal(MASK.length, 256);
assert.equal(MASK.reduce((a, b) => a + b, 0), 60);

const PAGES = corpus.pages.filter(page => page.page <= 55);
const CYCLES = Math.ceil(
  PAGES.reduce((s, p) => s + p.indices.length, 0) / 256
);
assert.equal(CYCLES, 51);

const counts = Array.from({length: CYCLES}, (_, cycle) => ({
  cycle,
  selectedOpp: 0,
  selectedHits: 0,
  outsideOpp: 0,
  outsideHits: 0
}));

let global = 0;
let totalHits = 0;
for (const page of PAGES) {
  for (let i = 0; i + 1 < page.indices.length; i++) {
    const pos = global + i;
    const cycle = Math.floor(pos / 256);
    const selected = MASK[pos & 255] === 1;
    const hit = page.indices[i] === page.indices[i + 1];
    const cell = counts[cycle];
    if (selected) {
      cell.selectedOpp++;
      cell.selectedHits += Number(hit);
    } else {
      cell.outsideOpp++;
      cell.outsideHits += Number(hit);
    }
    totalHits += Number(hit);
  }
  global += page.indices.length;
}
assert.equal(global, 12956);
assert.equal(totalHits, 86);
assert.equal(counts.reduce((s,c)=>s+c.selectedHits,0),33);
assert.equal(counts.reduce((s,c)=>s+c.outsideHits,0),53);

const MAX_N = 12901;
const logFact = new Float64Array(MAX_N + 1);
for (let i = 2; i <= MAX_N; i++) logFact[i] = logFact[i - 1] + Math.log(i);
const logChoose = (n,k) => k < 0 || k > n
  ? -Infinity
  : logFact[n] - logFact[k] - logFact[n-k];
const logSumExp = values => {
  const m = Math.max(...values);
  return m + Math.log(values.reduce((s,v)=>s+Math.exp(v-m),0));
};

/** Conditional selected-hit distribution given total hits in one cycle. */
function dist(c, logOdds) {
  const h = c.selectedHits + c.outsideHits;
  const lo = Math.max(0, h - c.outsideOpp);
  const hi = Math.min(h, c.selectedOpp);
  const xs = [];
  const logs = [];
  for (let x = lo; x <= hi; x++) {
    xs.push(x);
    logs.push(
      logChoose(c.selectedOpp,x) +
      logChoose(c.outsideOpp,h-x) +
      x*logOdds
    );
  }
  const z = logSumExp(logs);
  return {xs, probs: logs.map(v=>Math.exp(v-z))};
}
function logLike(rows, logOdds) {
  let ll=0;
  for (const c of rows) {
    const h=c.selectedHits+c.outsideHits;
    if(!h) continue;
    const d=dist(c,logOdds);
    ll+=Math.log(d.probs[d.xs.indexOf(c.selectedHits)]);
  }
  return ll;
}
function mle(rows){
  let lo=-12,hi=12;
  for(let i=0;i<100;i++){
    const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;
    if(logLike(rows,a)<logLike(rows,b)) lo=a; else hi=b;
  }
  return (lo+hi)/2;
}
function expected(c,logOdds){
  const d=dist(c,logOdds);
  return d.xs.reduce((s,x,i)=>s+x*d.probs[i],0);
}
function heterogeneity(rows){
  const common=mle(rows);
  const commonLL=logLike(rows,common);
  let separateLL=0;
  for(const c of rows) separateLL+=logLike([c],mle([c]));
  return {commonLogOdds:common, commonOdds:Math.exp(common),
    statistic:2*(separateLL-commonLL)};
}
function xorshift32(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
}
function sample(d,rnd){
  const u=rnd()/0x100000000;
  let acc=0;
  for(let i=0;i<d.xs.length;i++){
    acc+=d.probs[i];
    if(u<=acc||i===d.xs.length-1)return d.xs[i];
  }
  throw new Error('unreachable');
}

const informative=counts.filter(c=>c.selectedHits+c.outsideHits>0);
const fit=heterogeneity(informative);
const rnd=xorshift32(0x33011577);
const BOOT=2000;
let ge=0;
for(let b=0;b<BOOT;b++){
  const sim=informative.map(c=>{
    const h=c.selectedHits+c.outsideHits;
    const x=sample(dist(c,fit.commonLogOdds),rnd);
    return {...c,selectedHits:x,outsideHits:h-x};
  });
  if(heterogeneity(sim).statistic>=fit.statistic-1e-12) ge++;
}
fit.bootstrapTrials=BOOT;
fit.bootstrapP=(ge+1)/(BOOT+1);

const blocks=[[0,9],[10,19],[20,29],[30,39],[40,50]];
const folds=blocks.map(([a,b])=>{
  const held=counts.filter(c=>a<=c.cycle&&c.cycle<=b);
  const train=counts.filter(c=>c.cycle<a||c.cycle>b);
  const logOdds=mle(train.filter(c=>c.selectedHits+c.outsideHits>0));
  const heldInfo=held.filter(c=>c.selectedHits+c.outsideHits>0);
  const gain=logLike(heldInfo,logOdds)-logLike(heldInfo,0);
  const observed=heldInfo.reduce((s,c)=>s+c.selectedHits,0);
  const nullExpected=heldInfo.reduce((s,c)=>s+expected(c,0),0);
  return {
    cycles:[a,b],
    trainOdds:Math.exp(logOdds),
    heldRepeats:heldInfo.reduce((s,c)=>s+c.selectedHits+c.outsideHits,0),
    heldSelectedHits:observed,
    heldNullExpected:nullExpected,
    positiveDirection:observed>nullExpected,
    logLikelihoodGain:gain
  };
});

const ranked=[...counts].sort((a,b)=>
  b.selectedHits-a.selectedHits || a.cycle-b.cycle
);
const nonzeroSelected=counts.filter(c=>c.selectedHits>0);
const selectedTotal=33;

console.log(JSON.stringify({
  source:{
    cycles:CYCLES,
    fullCycles:50,
    finalCycleRunes:12956-50*256,
    totalRepeats:86,
    selectedHits:33,
    outsideHits:53,
    cyclesWithSelectedHits:nonzeroSelected.length
  },
  commonEffect:fit,
  concentration:{
    top1Share:ranked[0].selectedHits/selectedTotal,
    top5Share:ranked.slice(0,5).reduce((s,c)=>s+c.selectedHits,0)/selectedTotal,
    top5:ranked.slice(0,5).map(c=>({
      cycle:c.cycle,
      selectedHits:c.selectedHits,
      selectedOpp:c.selectedOpp,
      outsideHits:c.outsideHits,
      outsideOpp:c.outsideOpp
    }))
  },
  blockHoldout:{
    positiveDirections:folds.filter(f=>f.positiveDirection).length,
    positiveGains:folds.filter(f=>f.logLikelihoodGain>0).length,
    totalGain:folds.reduce((s,f)=>s+f.logLikelihoodGain,0),
    folds
  },
  perCycle:counts
},null,2));

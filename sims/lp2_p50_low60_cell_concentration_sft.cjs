'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');

const CHAPTERS = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const KAPPAS = [1,2,4,8,16,32,64,128,256,512,1024,2048];
const TRIALS = 200000;
const PAGES = corpus.pages.filter(p => p.page <= 55);
const TOKENS = grid.pages.flatMap(p => p.tokens);
const CELLS = TOKENS.map((t,i) => t[0] === '0' ? i : -1).filter(i => i >= 0);
const SLOT = new Map(CELLS.map((cell,i) => [cell,i]));
const N = PAGES.reduce((s,p) => s + p.indices.length, 0);
const ALL = Array.from({length:9}, (_,i) => i);
const VALUES = CELLS.map(cell => grid.bytes[cell]);
const UNIQUE_VALUES = [...new Set(VALUES)].sort((a,b) => a-b);
const VALUE_SLOT = new Map(UNIQUE_VALUES.map((value,i) => [value,i]));
const VALUE_GROUPS = VALUES.map(value => VALUE_SLOT.get(value));
const IDENTITY_GROUPS = CELLS.map((_,i) => i);
const GROUP_TRIALS = 100000;
assert.equal(N, 12956);
assert.equal(CELLS.length, 60);

/**
 * @param {number[]} stream
 * @returns {{opp:Int32Array[],hit:Int32Array[]}}
 */
function inventory(stream) {
  assert.equal(stream.length, N);
  const opp = Array.from({length:9}, () => new Int32Array(60));
  const hit = Array.from({length:9}, () => new Int32Array(60));
  let offset = 0;
  for (const page of PAGES) {
    const chapter = CHAPTERS.findIndex(([a,b]) => a <= page.page && page.page <= b);
    assert.ok(chapter >= 0);
    for (let i = 0; i + 1 < page.indices.length; i++) {
      const slot = SLOT.get((offset + i) & 255);
      if (slot === undefined) continue;
      opp[chapter][slot]++;
      hit[chapter][slot] += Number(stream[offset+i] === stream[offset+i+1]);
    }
    offset += page.indices.length;
  }
  assert.equal(offset, N);
  return {opp,hit};
}

/**
 * @param {{opp:Int32Array[],hit:Int32Array[]}} inv
 * @param {number[]} chapters
 * @returns {{opp:Int32Array,hit:Int32Array}}
 */
function aggregate(inv, chapters) {
  const opp = new Int32Array(60);
  const hit = new Int32Array(60);
  for (const c of chapters) for (let j=0;j<60;j++) {
    opp[j] += inv.opp[c][j];
    hit[j] += inv.hit[c][j];
  }
  return {opp,hit};
}

/** @param {number} h @param {number} n @param {number} p */
function logBernoulli(h,n,p) {
  return h*Math.log(p) + (n-h)*Math.log1p(-p);
}

/**
 * @param {{opp:Int32Array[],hit:Int32Array[]}} inv
 * @param {number} kappa
 * @returns {{common:number,hetero:number,gain:number,gains:number[],positive:number}}
 */
function score(inv,kappa) {
  let common=0, hetero=0;
  const gains=[];
  for (let hold=0;hold<9;hold++) {
    const train=aggregate(inv, ALL.filter(c => c !== hold));
    const held=aggregate(inv,[hold]);
    const n=[...train.opp].reduce((a,b)=>a+b,0);
    const h=[...train.hit].reduce((a,b)=>a+b,0);
    const p0=(h+0.5)/(n+1);
    let c=0,m=0;
    for (let j=0;j<60;j++) {
      c += logBernoulli(held.hit[j],held.opp[j],p0);
      const pj=(train.hit[j]+kappa*p0)/(train.opp[j]+kappa);
      m += logBernoulli(held.hit[j],held.opp[j],pj);
    }
    common += c;
    hetero += m;
    gains.push(m-c);
  }
  return {common,hetero,gain:hetero-common,gains,positive:gains.filter(x=>x>0).length};
}

/**
 * Score a source-defined grouping of the 60 selected cells.
 * @param {{opp:Int32Array[],hit:Int32Array[]}} inv
 * @param {number} kappa
 * @param {number[]} groups
 * @returns {{common:number,model:number,gain:number,gains:number[],positive:number}}
 */
function scoreGroups(inv,kappa,groups) {
  const groupCount=Math.max(...groups)+1;
  let common=0, model=0;
  const gains=[];
  for (let hold=0;hold<9;hold++) {
    const train=aggregate(inv, ALL.filter(c => c !== hold));
    const held=aggregate(inv,[hold]);
    const n=[...train.opp].reduce((a,b)=>a+b,0);
    const h=[...train.hit].reduce((a,b)=>a+b,0);
    const p0=(h+0.5)/(n+1);
    const trainOpp=new Int32Array(groupCount);
    const trainHit=new Int32Array(groupCount);
    const heldOpp=new Int32Array(groupCount);
    const heldHit=new Int32Array(groupCount);
    for (let j=0;j<60;j++) {
      const g=groups[j];
      trainOpp[g]+=train.opp[j];
      trainHit[g]+=train.hit[j];
      heldOpp[g]+=held.opp[j];
      heldHit[g]+=held.hit[j];
    }
    let c=0,m=0;
    for (let g=0;g<groupCount;g++) {
      c+=logBernoulli(heldHit[g],heldOpp[g],p0);
      const pg=(trainHit[g]+kappa*p0)/(trainOpp[g]+kappa);
      m+=logBernoulli(heldHit[g],heldOpp[g],pg);
    }
    common+=c;
    model+=m;
    gains.push(m-c);
  }
  return {common,model,gain:model-common,gains,positive:gains.filter(x=>x>0).length};
}

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state=seed>>>0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * @param {number[]} exposures
 * @returns {{trials:number,top1Ge4:number,top5Ge14:number,occupiedLe22:number,top1AndTop5:number}}
 */
function concentrationNull(exposures) {
  const random=xorshift32(0x33011571);
  let a=0,b=0,c=0,d=0;
  for (let trial=0;trial<TRIALS;trial++) {
    const remaining=exposures.slice();
    const counts=new Uint8Array(60);
    let total=remaining.reduce((s,x)=>s+x,0);
    for (let draw=0;draw<33;draw++) {
      let u=(random()/0x100000000)*total;
      let j=0;
      while (u >= remaining[j]) { u -= remaining[j]; j++; }
      remaining[j]--;
      counts[j]++;
      total--;
    }
    const ranked=[...counts].sort((x,y)=>y-x);
    const top1=ranked[0];
    const top5=ranked.slice(0,5).reduce((s,x)=>s+x,0);
    const occupied=ranked.filter(x=>x>0).length;
    if (top1>=4) a++;
    if (top5>=14) b++;
    if (occupied<=22) c++;
    if (top1>=4 && top5>=14) d++;
  }
  const p=x=>(x+1)/(TRIALS+1);
  return {trials:TRIALS,top1Ge4:p(a),top5Ge14:p(b),occupiedLe22:p(c),top1AndTop5:p(d)};
}

/**
 * Test whether the actual equality classes of the 36 raw values predict more
 * than an arbitrary 36-group coarsening with the same multiplicities.
 * @param {{opp:Int32Array[],hit:Int32Array[]}} inv
 * @param {number} kappa
 * @returns {{trials:number,observedGain:number,meanGain:number,sdGain:number,pGainGe:number}}
 */
function valueGroupingNull(inv,kappa) {
  const observed=scoreGroups(inv,kappa,VALUE_GROUPS);
  const random=xorshift32(0x33011572);
  let sum=0,sum2=0,ge=0;
  for (let trial=0;trial<GROUP_TRIALS;trial++) {
    const groups=VALUE_GROUPS.slice();
    for (let i=groups.length-1;i>0;i--) {
      const j=Math.floor((random()/0x100000000)*(i+1));
      [groups[i],groups[j]]=[groups[j],groups[i]];
    }
    const candidate=scoreGroups(inv,kappa,groups).gain;
    sum+=candidate;
    sum2+=candidate*candidate;
    if (candidate>=observed.gain-1e-12) ge++;
  }
  const mean=sum/GROUP_TRIALS;
  return {
    trials:GROUP_TRIALS,
    observedGain:observed.gain,
    meanGain:mean,
    sdGain:Math.sqrt(sum2/GROUP_TRIALS-mean*mean),
    pGainGe:(ge+1)/(GROUP_TRIALS+1)
  };
}

const root=path.resolve(__dirname,'..');
const shakespeare=fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8');
const native=encodeSourceNativeGP(shakespeare);
const controlCount=Math.min(8,Math.floor(native.length/N));
assert.equal(controlCount,8);
const controls=Array.from({length:controlCount},(_,i)=>inventory(native.slice(i*N,(i+1)*N)));
const calibration=KAPPAS.map(kappa=>({
  kappa,
  heteroTotal:controls.reduce((s,x)=>s+score(x,kappa).hetero,0),
  gainTotal:controls.reduce((s,x)=>s+score(x,kappa).gain,0)
})).sort((a,b)=>b.heteroTotal-a.heteroTotal||a.kappa-b.kappa);
const chosenKappa=calibration[0].kappa;
assert.equal(chosenKappa,256);
const valueCalibration=KAPPAS.map(kappa=>({
  kappa,
  modelTotal:controls.reduce((sum,inv)=>sum+scoreGroups(inv,kappa,VALUE_GROUPS).model,0),
  gainTotal:controls.reduce((sum,inv)=>sum+scoreGroups(inv,kappa,VALUE_GROUPS).gain,0)
})).sort((a,b)=>b.modelTotal-a.modelTotal||a.kappa-b.kappa);
const valueKappa=valueCalibration[0].kappa;
assert.equal(valueKappa,256);

const original=inventory(PAGES.flatMap(p=>p.indices));
const all=aggregate(original,ALL);
const rows=CELLS.map((cell,j)=>({
  cell,
  row:Math.floor(cell/8),
  column:cell%8,
  token:TOKENS[cell],
  rawValue:grid.bytes[cell],
  opportunities:all.opp[j],
  hits:all.hit[j],
  chapterHits:original.hit.map(x=>x[j])
}));
const ranked=[...rows].sort((a,b)=>b.hits-a.hits || b.hits/b.opportunities-a.hits/a.opportunities || a.cell-b.cell);
const totalOpp=rows.reduce((s,r)=>s+r.opportunities,0);
const totalHits=rows.reduce((s,r)=>s+r.hits,0);
const hitCells=rows.filter(r=>r.hits>0).length;
const originalScore=score(original,chosenKappa);
const valueScore=scoreGroups(original,valueKappa,VALUE_GROUPS);
const identityScore=scoreGroups(original,chosenKappa,IDENTITY_GROUPS);
const valueGroupingCalibration=valueGroupingNull(original,valueKappa);
const nullCalibration=concentrationNull(rows.map(r=>r.opportunities));

assert.equal(totalOpp,3025);
assert.equal(totalHits,33);
assert.equal(hitCells,22);
assert.equal(ranked[0].hits,4);
assert.equal(ranked.slice(0,5).reduce((s,r)=>s+r.hits,0),14);
assert.ok(Math.abs(originalScore.gain-2.5735253455981706)<1e-12);
assert.equal(originalScore.positive,7);
assert.ok(Math.abs(valueScore.gain-3.5487788113474323)<1e-12);
assert.equal(valueScore.positive,7);
assert.ok(Math.abs(valueScore.model-identityScore.model-0.9752534657493186)<1e-12);
assert.ok(Math.abs(valueGroupingCalibration.pGainGe-0.12055879441205589)<1e-12);

console.log(JSON.stringify({
  source:{selectedCells:60,selectedOpportunities:totalOpp,selectedRepeats:totalHits,hitCells,zeroHitCells:60-hitCells},
  concentration:{
    top1Hits:ranked[0].hits,
    top1Share:ranked[0].hits/totalHits,
    top5Hits:ranked.slice(0,5).reduce((s,r)=>s+r.hits,0),
    top5Share:ranked.slice(0,5).reduce((s,r)=>s+r.hits,0)/totalHits,
    topCells:ranked.slice(0,7)
  },
  sourceNativeRegularization:{
    windows:controlCount,
    kappaGrid:KAPPAS,
    physicalCell:{chosenKappa,calibration},
    rawValue:{chosenKappa:valueKappa,calibration:valueCalibration}
  },
  originalNineChapterLoco:originalScore,
  rawValueReplication:{
    distinctValues:UNIQUE_VALUES.length,
    score:valueScore,
    valueMinusPhysicalCell:valueScore.model-identityScore.model,
    valueGroupingNull:valueGroupingCalibration
  },
  conditionalCommonEffectConcentrationNull:nullCalibration,
  perCell:rows
},null,2));

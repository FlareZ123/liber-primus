#!/usr/bin/env node
'use strict';
/*
  LP2 original p50 dual-digit repeat-clock phase corroboration (28 Nov 2026).

  Exact source: resources/liber-primus/lp2-corpus.json (unresolved p0..55,
  including rune-free p50) and lp2-grid-256.json (all printed p49..51 tokens).
  Event E_j is the LEFT rune offset of each adjacent equality in the continuous
  12,956-rune tape; delta_j = E_(j+1)-2*E_j+E_(j-1).
  Split AFTER event42. Gap-update j42 and j43 straddle this split and
  are omitted: no endpoint from one half leaks into the other half's
  direction target. At phase q, H=0 if raw base60 byte <60. L<30 if raw byte %60 <30.
  Higher high-zero event count and more correct gap-innovation directions are
  predicted at the manuscript's unshifted row-major phase 0.

  This is post-discovery HALF-SPLIT STABILITY, not a prospectively blinded
  test: the two field predicates themselves were first noticed using all
  original events. Do not convert ranks into independent p-values, and never
  infer authentic plaintext or a cipher inverse from this phase association.
*/
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corp=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const table=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const gp=corp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const tokens=table.bytes;
if(gp.length!==12956||tokens.length!==256)throw Error('source dimensions changed');
if(tokens.filter(b=>b<60).length!==60||tokens.filter(b=>b%60<30).length!==135)throw Error('printed-field population changed');
const ev=[];
for(let i=0;i<gp.length-1;i++)if(gp[i]===gp[i+1])ev.push(i);
if(ev.length!==86)throw Error('source event census changed');
const changes=[];
for(let j=1;j<ev.length-1;j++){
  const delta=ev[j+1]-2*ev[j]+ev[j-1];
  if(delta!==0)changes.push({j,pos:ev[j],positive:delta>0});
}
if(changes.length!==83)throw Error('source nonzero gap-update count changed');
const halves=[
  {name:'first43',ev:ev.slice(0,43),changes:changes.filter(x=>x.j<=41)},
  {name:'last43',ev:ev.slice(43),changes:changes.filter(x=>x.j>=44)}
];
function phaseRows(half,bytes){
  const rows=[];
  for(let phase=0;phase<256;phase++){
    let high=0,correct=0;
    for(const i of half.ev)if(bytes[(i+phase)&255]<60)high++;
    for(const {pos,positive} of half.changes)
      if((bytes[(pos+phase)&255]%60<30)===positive)correct++;
    rows.push({phase,high,correct});
  }
  const avg=k=>rows.reduce((s,x)=>s+x[k],0)/256;
  const meanH=avg('high'),meanD=avg('correct');
  const sdH=Math.sqrt(rows.reduce((s,x)=>s+(x.high-meanH)**2,0)/256);
  const sdD=Math.sqrt(rows.reduce((s,x)=>s+(x.correct-meanD)**2,0)/256);
  if(!sdH||!sdD)throw Error('degenerate control');
  for(const x of rows)x.score=(x.high-meanH)/sdH+(x.correct-meanD)/sdD;
  rows.sort((a,b)=>b.score-a.score||a.phase-b.phase);
  return {rows,meanH,meanD,sdH,sdD};
}
// Threshold-free ordinal control: the printed low digit is an ordered
// 0..59 character. Mann–Whitney AUC measures how often its value at an
// increasing next-gap is below its value at a decreasing next-gap. No half-
// radix threshold is selected. Combine it with the distinct H=0 event count.
function ordinalAuc(half,bytes,phase){
  const pos=Array(60).fill(0),neg=Array(60).fill(0);
  let npos=0,nneg=0;
  for(const x of half.changes){
    const v=bytes[(x.pos+phase)&255]%60;
    if(x.positive){pos[v]++;npos++}else{neg[v]++;nneg++}
  }
  if(!npos||!nneg)throw Error('no both-direction test');
  let total=0,more=0;
  for(let value=59;value>=0;value--){
    total+=pos[value]*(more+.5*neg[value]);more+=neg[value];
  }
  return total/(npos*nneg);
}
const ordinalSummaries=halves.map(half=>{
  const rows=Array.from({length:256},(_,phase)=>({
    phase, high:half.ev.filter(x=>tokens[(x+phase)&255]<60).length,
    auc:ordinalAuc(half,tokens,phase)
  }));
  const avg=k=>rows.reduce((v,r)=>v+r[k],0)/256;
  const mh=avg('high'),ma=avg('auc');
  const sh=Math.sqrt(rows.reduce((v,r)=>v+(r.high-mh)**2,0)/256);
  const sa=Math.sqrt(rows.reduce((v,r)=>v+(r.auc-ma)**2,0)/256);
  for(const r of rows)r.score=(r.high-mh)/sh+(r.auc-ma)/sa;
  rows.sort((a,b)=>b.score-a.score||a.phase-b.phase);
  const source=rows.find(x=>x.phase===0);
  return {name:half.name,rankJoint:rows.indexOf(source)+1,
    rankAuc:rows.filter(x=>x.auc>source.auc).length+1,
    nEvents:half.ev.length,nUpdates:half.changes.length,
    source,second:rows[1]};
});
console.log('Threshold-free printed-low-digit rank AUC',JSON.stringify(ordinalSummaries,null,2));
if(ordinalSummaries.some(x=>x.rankJoint!==1))
  throw Error('source phase0 fails ordinal joint phase-half control');

// Multiverse sensitivity: a split low digit at exactly 30 is NOT implied
// by the cipher. Many nearby cutpoints produce the same original phase lead.
// Count the entire explicit family and disclose the actual multiplicity.
let bothFirst=0,bothUniqueFirst=0,neighboring=[];
for(let cut=1;cut<60;cut++){
  const raw=halves.map(half=>{
    const scores=Array.from({length:256},(_,phase)=>
      half.ev.filter(x=>tokens[(x+phase)&255]<60).length+
      half.changes.filter(x=>((tokens[(x.pos+phase)&255]%60)<cut)===x.positive).length);
    const best=Math.max(...scores);
    return {rank:scores.filter(x=>x>scores[0]).length+1,
      ties:scores.filter(x=>x===best).length};
  });
  if(raw.every(x=>x.rank===1))bothFirst++;
  if(raw.every(x=>x.rank===1&&x.ties===1))bothUniqueFirst++;
  if(cut>=28&&cut<=34)neighboring.push({cut,first:raw[0],last:raw[1]});
}
console.log('Cutpoint family (1..59): source phase top in both:',bothFirst,
            'unique top both:',bothUniqueFirst);
console.log('Cutpoint sensitivity around printed half-radix:',JSON.stringify(neighboring));

// A smaller, more human-readable primary check uses no variance fitting:
// count one point per high-zero repeat hit and one point per correctly
// predicted increase/decrease. No phase-dependent weight is learned.
const rawSummaries=halves.map(half=>{
  const arr=phaseRows(half,tokens).rows.map(x=>({
    phase:x.phase,high:x.high,correct:x.correct,tally:x.high+x.correct
  })).sort((a,b)=>b.tally-a.tally||a.phase-b.phase);
  const phase0=arr.find(x=>x.phase===0);
  return {name:half.name,phase0,rank:arr.indexOf(phase0)+1,
    tiesAtMaximum:arr.filter(x=>x.tally===arr[0].tally).length,
    runnerUp:arr[1]};
});
console.log('Equal-weight exact source-field tallies:',JSON.stringify(rawSummaries,null,2));
if(rawSummaries.some(x=>x.rank!==1||x.tiesAtMaximum!==1))
  throw Error('printed phase0 is not unique top in both integer-tally halves');
const summaries=halves.map(half=>{
  const obj=phaseRows(half,tokens);
  const original=obj.rows.find(x=>x.phase===0);
  return {name:half.name,nEvents:half.ev.length,nGapUpdates:half.changes.length,
    phase0Rank:obj.rows.indexOf(original)+1,source:original,
    second:obj.rows[1],mean:[obj.meanH,obj.meanD],sd:[obj.sdH,obj.sdD]};
});
const firstResidues=new Set(halves[0].ev.map(x=>x&255));
const secondResidues=new Set(halves[1].ev.map(x=>x&255));
const repeatedOriginalCells=[...firstResidues].filter(x=>secondResidues.has(x));
console.log('Distinct source table residues first/last/shared:',
  firstResidues.size,secondResidues.size,repeatedOriginalCells.length);
// Resampling the same table cell in both chronological halves is a dependence,
// NOT a fresh-source control. Exclude every cell appearing in the opposite half
// before rescoring, preventing any phase candidate from reusing a cell across
// source halves; this tests transfer to 33 previously unseen table residues.
for(let n=0;n<2;n++){
  const opposite=new Set(halves[1-n].ev.map(i=>i&255));
  const clean={...halves[n],
    ev:halves[n].ev.filter(i=>!opposite.has(i&255)),
    changes:halves[n].changes.filter(x=>!opposite.has(x.pos&255))};
  const ranks=phaseRows(clean,tokens).rows;
  const phase0=ranks.find(x=>x.phase===0);
  console.log('TABLE-CELL-DISJOINT',JSON.stringify({
    half:clean.name,eventCount:clean.ev.length,updateCount:clean.changes.length,
    phase0Rank:ranks.indexOf(phase0)+1,source:phase0,best:ranks[0]
  }));
}
console.log('Source letters:',gp.length,'equal adjacent events:',ev.length,
  'nonzero interior gap updates:',changes.length);
console.log('Unshifted original-table 2-field phase-half results:\n'+JSON.stringify(summaries,null,2));
if(summaries[0].phase0Rank!==1||summaries[1].phase0Rank!==1)
  throw Error('phase0 not first in both halves');
if(summaries[0].source.high!==18||summaries[0].source.correct!==29||
   summaries[1].source.high!==15||summaries[1].source.correct!==28)
  throw Error('half counts changed');

// Native positive registration: a circularly relabeled original source table
// MUST shift the recovered phase by the exactly opposite offset.
for(const offset of [1,73,151,255]){
  const shifted=Array.from({length:256},(_,i)=>tokens[(i+offset)&255]);
  for(const half of halves){
    const top=phaseRows(half,shifted).rows[0];
    if(top.phase!==((256-offset)&255))
      throw Error('circular-registration positive control failed at '+offset);
  }
}
console.log('Circular source-shift positives: 4/4 offsets pass both halves.');

// Whole-token-permutation source null: keep all 256 exactly printed two-character
// values and their high/low joint distribution, but remove their row-major pairing
// to source event positions. Reshuffle tokens using a frozen seeded PRNG.
let state=330126>>>0;
function rand32(){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return state>>>0;
}
const TRIALS=10000;
let bothSourceTop=0,anySharedTop=0,jointOriginalScoreExceed=0;
let sourceHalf1ScoreExceed=0,sourceHalf2ScoreExceed=0;
let bothRawSourceTalliesExceed=0;
const src1=summaries[0].source.score,src2=summaries[1].source.score;
for(let iteration=0;iteration<TRIALS;iteration++){
  const shuffled=tokens.slice();
  for(let i=255;i>0;i--){const j=rand32()%(i+1);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  const h1=phaseRows(halves[0],shuffled),h2=phaseRows(halves[1],shuffled);
  if(h1.rows[0].phase===h2.rows[0].phase)anySharedTop++;
  if(h1.rows[0].phase===0&&h2.rows[0].phase===0)bothSourceTop++;
  const z1=h1.rows.find(x=>x.phase===0).score;
  const z2=h2.rows.find(x=>x.phase===0).score;
  if(z1>=src1)sourceHalf1ScoreExceed++;
  if(z2>=src2)sourceHalf2ScoreExceed++;
  if(z1>=src1&&z2>=src2)jointOriginalScoreExceed++;
  const p1=h1.rows.find(x=>x.phase===0),p2=h2.rows.find(x=>x.phase===0);
  if(p1.high+p1.correct>=rawSummaries[0].phase0.tally &&
     p2.high+p2.correct>=rawSummaries[1].phase0.tally)bothRawSourceTalliesExceed++;
}
console.log('Whole-two-character-token shuffle null',JSON.stringify({
  seed:330126,trials:TRIALS,
  sharedWinnerRegardlessOfPhase:anySharedTop,
  bothWinnerAtSourcePhase0:bothSourceTop,
  sourcePhaseScoreAtLeastOriginalHalf1:sourceHalf1ScoreExceed,
  sourcePhaseScoreAtLeastOriginalHalf2:sourceHalf2ScoreExceed,
  jointSourcePhaseScoresAtLeastOriginal:jointOriginalScoreExceed,
  jointIntegerTallyAtLeastOriginal:bothRawSourceTalliesExceed,
  addOneJointExceed:(jointOriginalScoreExceed+1)/(TRIALS+1)
},null,2).replace(/,\s*"allP":\s*\{\}/,''));
console.log('CAUTION: all test features and table came from the same originally scanned book; retrospective split is not independent feature discovery. No unknown LP2 plaintext/key/decoder.');

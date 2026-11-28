#!/usr/bin/env node
'use strict';

/*
 * Agent13 — chapter PRODUCT vs exact visual-frame spacing gate.
 *
 * Reuses the independently validated all-scan frame census and the already
 * frozen #3445 natural OUT-statistic family. The image-derived frame starts
 * are never chosen from chapter values.
 */

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');

// Run the exact original-scan census unchanged and expose its source-selected
// non-singleton LP2 frame runs.
const visualCode=fs.readFileSync(
  path.join(__dirname,'lp2_p40_mirrored_section_artwork_sft.cjs'),'utf8'
);
const savedLog=console.log;
console.log=()=>{};
try{
  eval(visualCode + `
    globalThis.__frameNonSingleton = nonSingleton.map(x=>({...x}));
  `);
}finally{
  console.log=savedLog;
}
const frameRuns=globalThis.__frameNonSingleton;
assert.deepEqual(frameRuns,[
  {lp2Start:1,lp2End:2,length:2},
  {lp2Start:4,lp2End:7,length:4},
  {lp2Start:15,lp2End:21,length:7},
  {lp2Start:27,lp2End:39,length:13},
  {lp2Start:40,lp2End:55,length:16},
  {lp2Start:56,lp2End:57,length:2},
]);
const frameStarts=frameRuns.map(x=>x.lp2Start);
const frameStartGaps=frameStarts.slice(1).map((x,i)=>x-frameStarts[i]);
assert.deepEqual(frameStarts,[1,4,15,27,40,56]);
assert.deepEqual(frameStartGaps,[3,11,12,13,16]);
const gapSet=new Set(frameStartGaps);

// Reconstruct the exact #3445 chapter operands from canonical resources.
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'
));
const ink=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'
));
const transcription=fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8'
).replace(/\r/g,'').split(/^\s*%\s*$/m);
const runeId=new Map(corpus.runes.map((r,i)=>[r,i]));
const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const chapters=[0,3,8,15,23,27,33,40,54];
const mod29=x=>((x%29)+29)%29;

/** @param {number} page */
function chapterRecord(page){
  const source=corpus.pages.find(x=>x.page===page).indices;
  const ann=ink.pages.find(x=>x.page===page);
  let redEnd=ann.red_spans[0].length;
  for(let i=1;i<ann.red_spans.length&&ann.red_spans[i].start===redEnd;i+=1){
    redEnd+=ann.red_spans[i].length;
  }

  const text=transcription[page>=51?page-1:page];
  const words=[]; let current=[]; let offset=0;
  const emit=()=>{if(current.length){words.push(current.slice());current=[];}};
  for(const ch of text){
    if(runeId.has(ch)){
      assert.equal(source[offset],runeId.get(ch),`transcription mismatch p${page}@${offset}`);
      current.push({offset,value:source[offset]});
      offset+=1;
    }else if('-.&$§'.includes(ch)){
      emit();
    }
  }
  emit();
  assert.equal(offset,source.length);
  const firstBlack=words.find(w=>w[0].offset===redEnd);
  assert.ok(firstBlack);
  return {page,black:firstBlack.map(x=>x.value)};
}
const records=chapters.map(chapterRecord);

const statistics={
  length:w=>w.length%29,
  rune_sum:w=>mod29(w.reduce((a,b)=>a+b,0)),
  rune_product:w=>w.reduce((a,b)=>mod29(a*b),1),
  prime_sum:w=>mod29(w.reduce((a,b)=>a+primes[b],0)),
  prime_product:w=>mod29(w.reduce((a,b)=>a*primes[b],1)),
  first:w=>w[0],
  last:w=>w.at(-1),
  first_plus_last:w=>mod29(w[0]+w.at(-1)),
  first_times_last:w=>mod29(w[0]*w.at(-1)),
};
assert.deepEqual(records.map(r=>[
  r.page,
  statistics.length(r.black),
  statistics.rune_sum(r.black),
  statistics.rune_product(r.black),
]),[
  [0,4,15,23],[3,4,9,11],[8,3,23,2],[15,4,22,13],
  [23,8,25,16],[27,7,2,19],[33,2,5,3],[40,5,27,3],[54,8,19,27],
]);

// Freeze the same #3445 OUT family: SUM stays the independently supported IN.
const outNames=[
  'length','rune_product','prime_sum','prime_product',
  'first','last','first_plus_last','first_times_last',
];

/** @param {string} name @param {object[]} rows */
function overlap(name,rows){
  const values=[...new Set(rows.map(r=>statistics[name](r.black)))].sort((a,b)=>a-b);
  return {values,overlap:values.filter(x=>gapSet.has(x))};
}
const allCoverage=Object.fromEntries(outNames.map(name=>[name,overlap(name,records)]));
assert.deepEqual(
  Object.fromEntries(outNames.map(name=>[name,allCoverage[name].overlap.length])),
  {
    length:1,
    rune_product:4,
    prime_sum:0,
    prime_product:0,
    first:1,
    last:1,
    first_plus_last:2,
    first_times_last:1,
  }
);

// Dead ends are defined only by the already-published SUM->PRODUCT graph.
const inValues=records.map(r=>statistics.rune_sum(r.black));
const productEdges=records.map(r=>{
  const out=statistics.rune_product(r.black);
  return inValues.flatMap((value,i)=>value===out?[i]:[]);
});
const dead=records.filter((r,i)=>productEdges[i].length===0);
assert.deepEqual(dead.map(r=>r.page),[3,15,23,33,40]);

// Union of the two independently visible source registers: chapter IN sums
// plus exact frame-start spacings. PRODUCT is the only frozen OUT statistic
// whose complete distinct value vocabulary is covered by this union.
const inSet=new Set(inValues);
const typedRegister=new Set([...inSet,...gapSet]);
const typedCoverage=Object.fromEntries(outNames.map(name=>{
  const values=[...new Set(records.map(r=>statistics[name](r.black)))].sort((a,b)=>a-b);
  const covered=values.filter(x=>typedRegister.has(x));
  return [name,{values,covered,complete:covered.length===values.length}];
}));
assert.deepEqual(
  Object.fromEntries(outNames.map(name=>[
    name,[typedCoverage[name].covered.length,typedCoverage[name].values.length]
  ])),
  {
    length:[3,6],
    rune_product:[8,8],
    prime_sum:[3,7],
    prime_product:[3,8],
    first:[5,8],
    last:[4,8],
    first_plus_last:[4,8],
    first_times_last:[2,8],
  }
);
assert.deepEqual(outNames.filter(name=>typedCoverage[name].complete),['rune_product']);

// The same robust frame starts viewed cyclically from p4 over LP2's 58 pages.
// Define this before the instance partition so both controls share one frozen
// visual recipient multiset.
const lp2PageCount=58;
const startsFromP4=[4,15,27,40,56,1];
const cyclicFrameGaps=startsFromP4.map((x,i)=>{
  const y=startsFromP4[(i+1)%startsFromP4.length];
  return mod29((y-x+lp2PageCount)%lp2PageCount);
});
assert.deepEqual(cyclicFrameGaps,[11,12,13,16,3,3]);

// Stronger instance-level partition: for each frozen OUT statistic, send every
// chapter output that already appears in the chapter-IN register to that class.
// Ask whether the remaining output multiset is a submultiset of the six exact
// cyclic frame gaps. PRODUCT alone passes, using five gaps and leaving only
// 12=u. This rule does not depend on naming "dead ends" after the fact.
function multiset(values){
  const m=new Map();
  for(const value of values)m.set(value,(m.get(value)||0)+1);
  return m;
}
function isSubmultiset(values,container){
  const a=multiset(values),b=multiset(container);
  for(const [value,count] of a){
    if(count>(b.get(value)||0))return false;
  }
  return true;
}
const twoRegisterPartition=Object.fromEntries(outNames.map(name=>{
  const values=records.map(r=>statistics[name](r.black));
  const inRecipients=values.filter(value=>inSet.has(value));
  const frameRecipients=values.filter(value=>!inSet.has(value));
  const frameFits=isSubmultiset(frameRecipients,cyclicFrameGaps);
  let leftoverFrame=null;
  if(frameFits){
    const have=multiset(frameRecipients),all=multiset(cyclicFrameGaps);
    leftoverFrame=[];
    for(const [value,count] of all){
      for(let i=0;i<count-(have.get(value)||0);i+=1)leftoverFrame.push(value);
    }
  }
  return [name,{values,inRecipients,frameRecipients,frameFits,leftoverFrame}];
}));
assert.deepEqual(
  outNames.filter(name=>twoRegisterPartition[name].frameFits),
  ['rune_product']
);
assert.deepEqual(twoRegisterPartition.rune_product.inRecipients,[23,2,19,27]);
assert.deepEqual(twoRegisterPartition.rune_product.frameRecipients,[11,13,16,3,3]);
assert.deepEqual(twoRegisterPartition.rune_product.leftoverFrame,[12]);

const deadCoverage=Object.fromEntries(outNames.map(name=>[name,overlap(name,dead)]));
assert.deepEqual(deadCoverage.rune_product.values,[3,11,13,16]);
assert.deepEqual(deadCoverage.rune_product.overlap,[3,11,13,16]);
assert.deepEqual(
  Object.fromEntries(outNames.map(name=>[name,deadCoverage[name].overlap.length])),
  {
    length:0,
    rune_product:4,
    prime_sum:0,
    prime_product:0,
    first:1,
    last:0,
    first_plus_last:2,
    first_times_last:1,
  }
);

// The one visual gap not used by any chapter PRODUCT is independently known
// p6 state u=aK=12. This is reported as a state observation, not used to pick
// PRODUCT or alter the frozen family.
const productGapSet=new Set(deadCoverage.rune_product.overlap);
const unmatchedGaps=frameStartGaps.filter(x=>!productGapSet.has(x));
assert.deepEqual(unmatchedGaps,[12]);

// Ordered serialization control. LP2 has 58 pages p0..p57. Starting from
// p4—the first non-singleton frame start immediately after the first
// PRODUCT-dead-end chapter p3—the cyclic gaps between non-singleton frame
// starts are [11,12,13,16,3,3]. PRODUCT values on the five PRODUCT-dead-end
// chapters in printed chapter order are [11,13,16,3,3]: exact after deleting
// the single u=aK=12 marker. Charge this exact "one deletion from a cyclic
// frame-gap sequence" relation against every other frozen OUT statistic.
function oneDeletionMatches(sequence){
  const hits=[];
  for(let rotation=0;rotation<cyclicFrameGaps.length;rotation+=1){
    const cycle=cyclicFrameGaps.slice(rotation).concat(cyclicFrameGaps.slice(0,rotation));
    for(let deletedIndex=0;deletedIndex<cycle.length;deletedIndex+=1){
      const candidate=cycle.slice(0,deletedIndex).concat(cycle.slice(deletedIndex+1));
      if(candidate.length===sequence.length&&candidate.every((x,i)=>x===sequence[i])){
        hits.push({rotation,deletedIndex,deleted:cycle[deletedIndex],cycle});
      }
    }
  }
  return hits;
}
const deadSequences=Object.fromEntries(outNames.map(name=>[
  name,dead.map(r=>statistics[name](r.black))
]));
const orderedMatches=Object.fromEntries(outNames.map(name=>[
  name,oneDeletionMatches(deadSequences[name])
]));
assert.deepEqual(deadSequences.rune_product,[11,13,16,3,3]);
assert.deepEqual(orderedMatches.rune_product,[{
  rotation:0,
  deletedIndex:1,
  deleted:12,
  cycle:[11,12,13,16,3,3],
}]);
assert.deepEqual(
  outNames.filter(name=>orderedMatches[name].length>0),
  ['rune_product']
);

console.log(JSON.stringify({
  status:'PASS',
  classification:'independent common visual cue for PRODUCT; post-discovery structural authentication, not plaintext',
  frame:{runs:frameRuns,starts:frameStarts,startGaps:frameStartGaps},
  frozenOutFamily:allCoverage,
  combinedSourceRegister:{
    chapterInValues:[...inSet].sort((a,b)=>a-b),
    frameStartGaps,
    typedCoverage,
    uniquelyCompleteOutStatistic:'rune_product',
    twoRegisterPartition,
    uniquePartitionStatistic:'rune_product',
  },
  productGraphDeadEnds:{
    pages:dead.map(r=>r.page),
    coverage:deadCoverage,
    distinctProducts:deadCoverage.rune_product.values,
    unmatchedVisualGap:unmatchedGaps[0],
    unmatchedStateLabel:'u=aK',
    cyclicFrameGapsFromP4:cyclicFrameGaps,
    deadSequences,
    orderedOneDeletionMatches:orderedMatches,
  },
  decision:'Within the pre-existing #3445 OUT family, rune PRODUCT is uniquely typed by the two visible registers. Instance-by-instance, its nine outputs partition exactly into four chapter-IN recipients [23,2,19,27] and five frame-gap recipients [11,13,16,3,3], leaving only visual gap12=u unused; no rival statistic's non-IN output multiset fits the frame-gap multiset. Equivalently, all 8 distinct PRODUCT outputs lie in the combined register while no other OUT statistic is fully covered. Stronger, the five PRODUCT-dead-end outputs in chapter order [11,13,16,3,3] are exactly the cyclic frame-start gaps from p4 [11,12,13,16,3,3] after deleting the sole u=aK=12 marker; no other OUT statistic has any one-deletion cyclic match. This supplies a common ordered source-side PRODUCT cue; it does not by itself define a frame-gap navigation fallback.',
},null,2));

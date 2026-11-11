'use strict';
/**
 * The authentic 2016 "words are the map" base58 address "THE" lands on the
 * unique visible GP word FOLD (physical p14 word1). A literal 58-leaf
 * end-to-end book fold pairs p with 57-p: exactly 29 page pairs, matching
 * the 29-letter Gematria Primus alphabet. This is a source-selected,
 * key-independent shared-output-register test, not a claimed solve.
 *
 * If two folded original pages at the same local rune coordinate use
 * exactly the same unknown 29-way bijection sigma_i, then C_left=C_right
 * iff P_left=P_right, independent of the secret sigma_i or its evolution.
 * We test four natural orientations, freeze the highest training rate on
 * first 12 eligible pairs, then check the remaining 14 unfit pairs.
 * Circular-shift nulls within each page preserve real glyph histograms,
 * page lengths, and much local structure. A genuine source-language plant
 * under random shared per-position affine output rows demonstrates power.
 *
 * Node 22 CJS; run node sims/signed2016_fold58_pair_keyless_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encode}=require('./grid_keyskip_viterbi.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=corpus.pages;
assert.equal(pages.length,58);
assert.equal(pages.filter(x=>x.page<=55).reduce((s,p)=>s+p.indices.length,0),12956);
const pairs=Array.from({length:29},(_,p)=>({
  p,q:57-p,left:pages[p].indices,right:pages[57-p].indices
}));
assert.deepEqual(pairs.filter(x=>!x.left.length||!x.right.length||x.p<=1)
  .map(x=>[x.p,x.q]),[[0,57],[1,56],[7,50]]);
const tests=pairs.filter(x=>x.p>=2&&x.left.length&&x.right.length);
assert.equal(tests.length,26);
assert.equal(tests.filter(x=>x.p<15).length,12);
assert.equal(tests.filter(x=>x.p>=15).length,14);
const ORIENT=['forward-forward','forward-reverse','back-back','back-forward'];
/** @typedef {{p:number,q:number,left:number[],right:number[]}} Pair */
/** @param {Pair[]} group @param {string} orientation */
function test(group,orientation){
  let eq=0,n=0;
  for(const {left,right} of group){
    const len=Math.min(left.length,right.length);
    for(let i=0;i<len;i++){
      const u=orientation.startsWith('back')?left[left.length-1-i]:left[i];
      const v=orientation.endsWith('reverse')||orientation==='back-back'
        ?right[right.length-1-i]:right[i];
      eq+=Number(u===v);n++;
    }
  }
  return {eq,n,rate:eq/n};
}
function evaluate(group){
  return Object.fromEntries(ORIENT.map(o=>[o,test(group,o)]));
}
function choose(group){
  const scores=evaluate(group);
  return ORIENT.slice().sort((a,b)=>scores[b].rate-scores[a].rate)[0];
}
let state=0x2016f01d;
/** @returns {number} */
function next(){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return state>>>0;
}
/** @returns {number} */
function random(){return next()/4294967296;}
/** @param {number[]} a */
function shifted(a){
  const k=next()%a.length;
  return a.slice(k).concat(a.slice(0,k));
}
function shiftPairs(group){
  return group.map(x=>({...x,right:shifted(x.right)}));
}
const training=tests.filter(x=>x.p<15),heldout=tests.filter(x=>x.p>=15);
const allTrain=evaluate(training),allHeld=evaluate(heldout);
const model=choose(training);
const nulls=[];
const NNULL=600;
for(let k=0;k<NNULL;k++){
  const train=shiftPairs(training),hold=shiftPairs(heldout);
  const winner=choose(train);
  nulls.push({selected:winner,train:test(train,winner).rate,
    heldout:test(hold,winner).rate,anyOrientationHeldout:
      Math.max(...Object.values(evaluate(hold)).map(x=>x.rate))});
}
const observedHeldout=allHeld[model].rate;
const bestHeldout=Math.max(...Object.values(allHeld).map(x=>x.rate));
const ge=values=>values.filter(x=>x>=observedHeldout).length;
const nullStat={
  draws:NNULL,seed:'0x2016f01d',control:'independent per-pair circular rotation of each right-hand page; freeze choice on training',
  observedSelectedOrientation:model,
  observedSelectedTrain:allTrain[model],observedSelectedHeldout:allHeld[model],
  selectedHeldoutMean:nulls.reduce((s,x)=>s+x.heldout,0)/NNULL,
  selectedHeldoutMaximum:Math.max(...nulls.map(x=>x.heldout)),
  exceedSelectedHeldout:ge(nulls.map(x=>x.heldout)),
  selectedHeldoutUpperTailPlusOne:
    (1+ge(nulls.map(x=>x.heldout)))/(NNULL+1),
  exploratoryBestHeldout:bestHeldout,
  exploratoryNullBestUpperTailPlusOne:
    (1+nulls.filter(x=>x.anyOrientationHeldout>=bestHeldout).length)/(NNULL+1)
};

// Independent native-GP source segments, used ONLY for the sensitivity test.
const source=encode(read('resources/control/shakespeare_first300k.txt').slice(213000));
let pos=0,modifications=0;
const mod=x=>(x%29+29)%29;
function simulate(leftPlain,rightPlain){
  const n=Math.max(leftPlain.length,rightPlain.length);
  const left=[],right=[];
  for(let i=0;i<n;i++){
    // Both encipherments use the SAME arbitrary i-dependent bijective row.
    const mul=1+next()%28,add=next()%29;
    for(const [plain,out] of [[leftPlain,left],[rightPlain,right]]){
      if(i>=plain.length)continue;
      let glyph=mod(plain[i]*mul+add);
      if(out.length&&glyph===out[out.length-1]&&random()<.81){
        glyph=mod(glyph+1);modifications++;
      }
      out.push(glyph);
    }
  }
  assert.equal(left.length,leftPlain.length);
  assert.equal(right.length,rightPlain.length);
  return {left,right};
}
const synthetic=tests.map(x=>{
  const l=source.slice(pos,pos+x.left.length);
  pos+=x.left.length;
  const r=source.slice(pos,pos+x.right.length);
  pos+=x.right.length;
  assert.equal(l.length,x.left.length);
  assert.equal(r.length,x.right.length);
  return {p:x.p,q:x.q,...simulate(l,r)};
});
const syntheticTrain=synthetic.filter(x=>x.p<15),syntheticHeld=synthetic.filter(x=>x.p>=15);
const syntheticScore=evaluate(syntheticTrain),syntheticOut=evaluate(syntheticHeld);
const nativeModel=choose(syntheticTrain);
assert.equal(nativeModel,'forward-forward','source-true orientation must be recovered');
assert(syntheticOut[nativeModel].rate>.045,'shared-row plant should exceed chance collision rate');
assert(syntheticScore[nativeModel].rate>.045,'shared-row plant should detect source language');
const result={
  hypothesis:'2016 signed-message THE->FOLD; literal p with 57-p pairs for 58 original page slots / 29 GP glyphs',
  structurallyUnavailablePairs:[[0,57],[1,56],[7,50]],
  eligibleOriginalPairs:26,trainingPairs:12,heldoutPairs:14,
  includedRunePositions:tests.reduce((s,x)=>s+Math.min(x.left.length,x.right.length),0),
  sourceLanguage:'GP-encoded disjoint Shakespeare heldout segments',
  observable:'positionwise C_left==C_right, exactly invariant under every unknown shared 29-way output permutation row',
  original:{trainByOrientation:allTrain,heldByOrientation:allHeld,selectedModel:model,null:nullStat},
  nativePlant:{randomSharedPerPositionAffineRows:true,softRepeatFilter:.81,
    modifications,selectedTrain:syntheticScore[nativeModel],
    selectedHeldout:syntheticOut[nativeModel],selectedModel:nativeModel,
    totalSourceRunes:pos},
  scope:'Excludes only same-position shared bijective output-register ciphers under the four declared physical mirror alignments; it says nothing about independently keyed pages, inter-page offsets, nonbijective transformations, or external source keys'
};
console.log(JSON.stringify(result,null,2));

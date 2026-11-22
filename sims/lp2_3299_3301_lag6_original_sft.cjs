'use strict';
/**
 * Original LP2 lag-six affine event, independently checkable in the authored
 * text. The lag-six relation itself was previously reported by pnotisdev
 * (2026-10-22); this SFT checks a possible first-party parameter source:
 * the manuscript's red 3299 (p15 / original image32.jpg), Cicada 3301,
 * and the GP29 alphabet give b=3301%29=24 and a=(3299-3301)%29=27.
 *
 * The SIX is NOT source-selected. We retain the earlier publication's
 * exploratory lag rather than asserting a prospective first-party clue.
 * Measure independent chapter halves and full all-affine shuffle max.
 * Run with Node22: node sims/lp2_3299_3301_lag6_original_sft.cjs
 */
const assert = require('node:assert/strict');
const gp = require('../resources/liber-primus/lp2-corpus.json');
const {parseSharedCorpus,physicalLP2Page} = require('./lp2_word_pages.cjs');
const parsed = parseSharedCorpus();
assert.equal(parsed.runeCount,12956);
assert.equal(parsed.words.length,2896);
assert.equal(parsed.crossPageWords,32);
const idx=new Map(gp.runes.map((glyph,i)=>[glyph,i]));
const rows=parsed.words.map(w=>({
  physicalPage:physicalLP2Page(w.startPage),
  symbols:[...w.runes].map(g=>idx.get(g))
}));
const spans=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const sourceB=3301%29,sourceA=(3299-3301+29)%29;
assert.equal(sourceA,27);
assert.equal(sourceB,24);
const sourceRule=(x)=>((sourceA*x+sourceB)%29);
const chapterRows=spans.map(([lo,hi],i)=>({chapter:i,lo,hi,opportunities:0,hits:0}));
const withinWordDoublets={beforeSix:{pairs:0,hits:0},fromSix:{pairs:0,hits:0}};
const observed=Array.from({length:29},()=>new Uint32Array(29));
const lengths=[];
for(const w of rows){
  const ci=spans.findIndex(([lo,hi])=>lo<=w.physicalPage&&w.physicalPage<=hi);
  assert(ci>=0);
  const arr=w.symbols;
  lengths.push(arr.length);
  for(let j=1;j<arr.length;j++) {
    const target=j<6?withinWordDoublets.beforeSix:withinWordDoublets.fromSix;
    target.pairs++;
    target.hits+=Number(arr[j]===arr[j-1]);
  }
  for(let j=6;j<arr.length;j++) {
    const a=arr[j-6],b=arr[j];
    observed[a][b]++;
    chapterRows[ci].opportunities++;
    chapterRows[ci].hits+=Number(b===sourceRule(a));
  }
}
assert.deepEqual(chapterRows.map(z=>z.opportunities),[79,106,184,178,100,144,162,302,35]);
assert.deepEqual(chapterRows.map(z=>z.hits),[6,6,10,13,5,11,9,20,0]);
const total=chapterRows.reduce((s,v)=>s+v.opportunities,0);
const hits=chapterRows.reduce((s,v)=>s+v.hits,0);
assert.equal(total,1290);
assert.equal(hits,80);
assert.deepEqual(withinWordDoublets,{beforeSix:{pairs:8770,hits:54},fromSix:{pairs:1290,hits:9}});
const correct=((x,m)=>((x%m)+m)%m);
// The 16 original p15 Fibonacci-indexed prime cells, rigorously solved by
// njloof / Dukotah #14 (2026-11-19), can alias in GP29. The original
// red first-prime coefficient is NOT unique among the 16 modulo 29.
const sourceFibonacciIndices=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const p15PhysicalGrid=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const p15Spiral=[
  [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]
];
const firstPrimes=[];
for(let n=2;firstPrimes.length<988;n++){
  let prime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
  if(prime)firstPrimes.push(n);
}
const gridMultChoice=sourceFibonacciIndices.map((F,k)=>{
  const prime=firstPrimes[F],gridCell=Math.abs(3301-prime);
  const [row,col]=p15Spiral[k];
  assert.equal(p15PhysicalGrid[row][col],gridCell);
  const a=(((-prime)%29)+29)%29;
  let h=0;
  for(let previous=0;previous<29;previous++)
    h+=observed[previous][(a*previous+sourceB)%29];
  return {spiralIndex:k,F,firstPrime:prime,gridCell,multiplierMod29:a,hits:h};
});
assert.deepEqual(gridMultChoice.filter(v=>v.hits===80)
  .map(v=>v.spiralIndex),[0,9,12]);
assert.equal(gridMultChoice[0].gridCell,3299);
const competitors=[];
for(let a=1;a<29;a++) for(let b=0;b<29;b++) {
  let h=0;
  for(let prev=0;prev<29;prev++) h+=observed[prev][(a*prev+b)%29];
  competitors.push({a,b,h});
}
competitors.sort((x,y)=>y.h-x.h||x.a-y.a||x.b-y.b);
assert.deepEqual(competitors[0],{a:27,b:24,h:80});
assert.equal(competitors[1].h,65);
const rng=(()=>{
  let state=0x33013299;
  return ()=>{state ^= state<<13;state ^= state>>>17;state ^= state<<5;return (state>>>0)/4294967296;};
})();
const rounds=2048;
let targetAtLeast=0, anyAffineAtLeast=0,maxHighest=0;
let allShuffleTarget=0;
const maxSample=[];
for(let round=0;round<rounds;round++){
  const N=Array.from({length:29},()=>new Uint16Array(29));
  for(const w of rows){
    if(w.symbols.length<=6)continue;
    const z=w.symbols.slice();
    for(let j=z.length-1;j>0;j--){
      const k=Math.floor(rng()*(j+1));
      [z[j],z[k]]=[z[k],z[j]];
    }
    for(let j=6;j<z.length;j++)N[z[j-6]][z[j]]++;
  }
  let target=0,mx=0;
  for(let a=1;a<29;a++)for(let b=0;b<29;b++){
    let h=0;
    for(let prev=0;prev<29;prev++)h+=N[prev][(a*prev+b)%29];
    if(a===sourceA&&b===sourceB)target=h;
    if(h>mx)mx=h;
  }
  maxHighest=Math.max(maxHighest,mx);
  allShuffleTarget+=target;
  targetAtLeast+=Number(target>=hits);
  anyAffineAtLeast+=Number(mx>=hits);
  if(round<12)maxSample.push(mx);
}
console.log(JSON.stringify({
  provenance:'External pnotisdev/cicada3301 phase57 reports 80/1290 original lag6 affine hits in 2026. Independent original-source re-evaluation; this SFT does not claim discovery of the numerical event.',
  physicalClues:{red_p15_fibonacci_grid_entry:3299,cicada_puzzle_number:3301,modulus:29,selected_a:sourceA,selected_b:sourceB,unselected_lag:6},
  p15AllSixteenSourcePrimeCoefficients:gridMultChoice,
  red29Aliases:[0,9,12],
  original:{completeWords:parsed.words.length,carriedWords:parsed.crossPageWords,
    withinWordDoubletsBySixPosition:withinWordDoublets,
    expectedFirstSixDoubletsWithoutAnyRepair:8770/29,
    sixBackOnlyCollisionRepairFailsEarlyWords:true,
    events:total,hits,uniformExpected:total/29,otherBest:competitors[1],rankAmongAll812Affine:1,chapterRows,firstFourChapters:chapterRows.slice(0,4).reduce((s,r)=>({n:s.n+r.opportunities,h:s.h+r.hits}),{n:0,h:0}),remainingFiveChapters:chapterRows.slice(4).reduce((s,r)=>({n:s.n+r.opportunities,h:s.h+r.hits}),{n:0,h:0})},
  permutationNull:{seed:'0x33013299',rounds,perWordSymbolCountFixed:true,sourceRuleAtLeastObserved:targetAtLeast,anyOf812AffineAtLeastObserved:anyAffineAtLeast,maxNullObserved:maxHighest,meanSourceHits:allShuffleTarget/rounds,maxFirst12:maxSample,upperPSource:(targetAtLeast+1)/(rounds+1),upperPFamily:(anyAffineAtLeast+1)/(rounds+1)},
  decision:'Source number pair suggests the exact observed affine coefficients, but the six-rune delay and actual emitter/repair flag are NOT selected by the original. This statistical channel cannot alone restore unknown plaintext or a key.'
},null,2));

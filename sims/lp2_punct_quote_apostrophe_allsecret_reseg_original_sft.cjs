'use strict';
/**
 * Original p0..55 all-secret physical punct + quote + apostrophe GP29 gate.
 *
 * All 182 source-visible punctuation/quote/apostrophe spans receive entirely
 * independent 29! secret rune substitutions. Also allow ANY within-span rune
 * permutation and ANY movement of plaintext word spaces within the span.
 * The multiset of runes in each span is invariant under all of these choices,
 * yielding a key-independent E / (E+O) maximum.
 *
 * Run read-only on Node.js 22:
 * node sims/lp2_punctuation_quote_apostrophe_reseg_allsecret_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeWords}=require('./lp2_difference_allletter_capacity_sft.cjs');
const {capacity,minimumWindow}=
  require('./lp2_punctuation_private_segment_allsecret_original_sft.cjs');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
function read(p){return fs.readFileSync(path.join(ROOT,p),'utf8');}
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const marks=JSON.parse(read('resources/liber-primus/lp2-punctuation-identity.json'));
const quotes=JSON.parse(read('resources/liber-primus/lp2-quote-punctuation-spans.json'));
const original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const N=original.length;
assert.equal(N,12956);
const excluded=new Set([57,58,59,60,125]);
const physical=marks.events.filter(e=>!excluded.has(e.index));
assert.equal(physical.length,175);
assert.equal(new Set(physical.map(e=>e.rune_offset)).size,172);
assert.equal(quotes.quotes.length,7);
assert.deepEqual(quotes.apostrophes_before_rune,[1110,5138,8515,10089]);

/** @param {number[]} boundaries */
function uniqueCuts(boundaries){
  return [...new Set([0,N,...boundaries])]
    .sort((a,b)=>a-b);
}
const basic=uniqueCuts(physical.map(e=>e.rune_offset));
const all=uniqueCuts([
  ...physical.map(e=>e.rune_offset),
  ...quotes.quotes.flatMap(q=>[q.start,q.end]),
  ...quotes.apostrophes_before_rune
]);
assert.equal(basic.length-1,172);
assert.equal(all.length-1,182);
assert.deepEqual(all.filter(x=>!basic.includes(x)),
  [1110,1677,5138,5459,8515,9727,9811,10089,10439,12592]);

/** @param {number[]} vals @param {number[]} cuts
 * @returns {number[][]} */
function bins(vals,cuts){
  assert.equal(vals.length,N);
  return cuts.slice(1).map((end,j)=>{
    const hist=Array(29).fill(0);
    for(let i=cuts[j];i<end;i++)hist[vals[i]]++;
    return hist.sort((a,b)=>b-a);
  });
}
const base=bins(original,basic), augmented=bins(original,all);
assert.deepEqual([capacity(base,1),capacity(base,2)],[1012,1874]);
assert.deepEqual([capacity(augmented,1),capacity(augmented,2)],[1029,1897]);

// An independently chosen cyclic relabeling of each source-ink scope
// exactly preserves EVERY interior original adjacent-equality event, while
// making each across-scope adjacency equal with probability 1/29.
const inkCrossings=all.slice(1,-1);
const equalCrossings=inkCrossings.filter(i=>original[i-1]===original[i]);
assert.equal(inkCrossings.length,181);
assert.deepEqual(equalCrossings,[8385]);
const p=1/29,n=inkCrossings.length;
const independentResetLowerTail=(1-p)**n+n*p*(1-p)**(n-1);
assert(Math.abs(independentResetLowerTail-0.013018300976797)<1e-12);


// Canonical whole-word breaks, including cross-page carried words.
// Source-only quote/apostrophe splits remain hard punctuation anchors,
// not invented printed words.
const rune=new Set(gp.runes);
const text=read('resources/liber-primus/lp2-transcription.txt');
let cursor=0,prior=0;
const wordEnds=[];
for(const ch of text){
  if(rune.has(ch))cursor++;
  else if('-.$&§'.includes(ch)&&cursor>prior){
    wordEnds.push(cursor);prior=cursor;
  }
}
if(cursor>prior)wordEnds.push(cursor);
assert.equal(cursor,13136);

// The original visible page seams and printed line wraps offer progressively
// finer, source-defined reset clocks. Keep these as separate alternatives.
let offset=0;
const pageSeams=[];
for(const page of gp.pages.filter(p=>p.page<=55 && p.indices.length)){
  if(offset>0)pageSeams.push(offset);
  offset+=page.indices.length;
}
assert.equal(offset,N);
assert.equal(pageSeams.length,54);
let runeAt=0;
const slash=[];
for(const ch of text){
  if(rune.has(ch))runeAt++;
  else if(ch==='/')slash.push(runeAt);
}
const lineEnds=slash.filter(i=>i>0&&i<=N);
assert.equal(lineEnds.length,594);
const withPages=uniqueCuts([...all,...pageSeams]);
const onlyLines=uniqueCuts(lineEnds);
const withLines=uniqueCuts([...all,...pageSeams,...lineEnds]);
assert.equal(withPages.length-1,226);
assert.deepEqual([capacity(bins(original,withPages),1),
  capacity(bins(original,withPages),2)],[1109,2042]);
assert.equal(onlyLines.length-1,594);
assert.deepEqual([capacity(bins(original,onlyLines),1),
  capacity(bins(original,onlyLines),2)],[1680,2997]);
assert.equal(withLines.length-1,738);
assert.deepEqual([capacity(bins(original,withLines),1),
  capacity(bins(original,withLines),2)],[1816,3218]);

/** All 29 sorted-rank mass capacities over fully secret line alphabets.
 * @param {number[][]} hist @returns {number[]} */
function majorizationCaps(hist){
  const out=Array(29).fill(0);
  for(const counts of hist){
    let s=0;
    for(let k=0;k<29;k++){s+=counts[k];out[k]+=s;}
  }
  return out;
}
const lineRankCaps=majorizationCaps(bins(original,onlyLines));
assert.deepEqual(lineRankCaps,
  [1680,2997,4181,5274,6235,7033,7711,8318,8904,9489,
    10074,10650,11213,11737,12200,12563,12794,12906,12945,
    12955,12956,12956,12956,12956,12956,12956,12956,12956,12956]);

/** Count complete original-length native windows failing at least one of the
 * 29 necessary sorted-rank occupancy ceilings.
 * @param {number[]} native @returns {{windows:number,failures:number}} */
function rankCounter(native){
  const counts=Array(29).fill(0);
  for(let i=0;i<N;i++)counts[native[i]]++;
  let failures=0,windows=0;
  for(let begin=0;begin+N<=native.length;begin++){
    if(begin){
      counts[native[begin-1]]--;
      counts[native[begin+N-1]]++;
    }
    const sorted=counts.slice().sort((a,b)=>b-a);
    let mass=0,failed=false;
    for(let k=0;k<29;k++){
      mass+=sorted[k];
      if(mass>lineRankCaps[k]){failed=true;break;}
    }
    if(failed)failures++;
    windows++;
  }
  return {windows,failures};
}
const originalWordBreaks=wordEnds.filter(x=>x<=N);
assert.equal(originalWordBreaks.length,2896);
assert.equal(originalWordBreaks.at(-1),N);

// Most generous fully ink/layout/word anchored source segmentation:
// every original whole word, printed line, page seam, period, rubric,
// quote boundary and four genuine internal apostrophe strokes may introduce
// its own arbitrarily secret 29! alphabet and arbitrary intra-scope
// rune transposition, while any internal word boundaries may be reflowed.
const withAllVisible=uniqueCuts([...withLines,...originalWordBreaks]);
assert.equal(withAllVisible.length-1,3320);
assert.deepEqual([withLines.length-1,withAllVisible.length-1],
  [738,3320]);
/** Exact within-scope same-symbol pair count. Independent secret symbol
 * permutations and unrestricted intra-scope rune order preserve the count.
 * @param {number[]} values @param {number[]} cuts @returns {number} */
function equalPairs(values,cuts){
  const counts=Array(29).fill(0);
  let equal=0;
  for(let j=1;j<cuts.length;j++){
    counts.fill(0);
    for(let k=cuts[j-1];k<cuts[j];k++)counts[values[k]]++;
    for(const n of counts)equal+=n*(n-1)/2;
  }
  return equal;
}
const exactOriginalEquality={
  lineAndAllInk:equalPairs(original,withLines),
  everyPrintedTokenAndInk:equalPairs(original,withAllVisible)
};
assert.deepEqual(exactOriginalEquality,
  {lineAndAllInk:3956,everyPrintedTokenAndInk:683});

/** Native contiguous original-length windows at fixed half-book steps, to
 * match the long-standing exact-original layout control convention.
 * @param {number[]} native @returns {{samples:number,min738:number,min3320:number,atOrBelowOriginal738:number,atOrBelowOriginal3320:number}} */
function fixedLayoutNativeCollisionControls(native){
  const x=[],y=[];
  for(let begin=0;begin+N<=native.length;begin+=6478){
    const window=native.slice(begin,begin+N);
    x.push(equalPairs(window,withLines));
    y.push(equalPairs(window,withAllVisible));
  }
  return {samples:x.length,min738:Math.min(...x),min3320:Math.min(...y),
    atOrBelowOriginal738:x.filter(n=>n<=3956).length,
    atOrBelowOriginal3320:y.filter(n=>n<=683).length};
}

// Exact simplest independent-substitution-reset null: random independent
// cyclic translations of each printed segment. All intra-segment source
// doublet decisions remain unchanged, and each seam matches with p=1/29.
/** @param {number[]} cuts @returns {{n:number,hits:number,expected:number,pAtMost:number}} */
function crossingNull(cuts){
  const edges=cuts.filter(i=>i>0&&i<N);
  const hits=edges.filter(i=>original[i-1]===original[i]).length;
  const p=1/29,n=edges.length;
  let term=(1-p)**n,tail=term;
  for(let k=1;k<=hits;k++){
    term*=(n-k+1)*p/(k*(1-p));
    tail+=term;
  }
  return {n,hits,expected:n*p,pAtMost:tail};
}
const pageAndInkEcho=crossingNull(withPages);
const lineEcho=crossingNull(onlyLines);
assert.deepEqual([pageAndInkEcho.n,pageAndInkEcho.hits],[225,1]);
assert.deepEqual([lineEcho.n,lineEcho.hits],[593,4]);
assert(Math.abs(pageAndInkEcho.pAtMost-0.003364883360697)<1e-12);
assert(Math.abs(lineEcho.pAtMost-0.000009286425029802315)<1e-12);

// Competing continuous-low-repeat null conditions on each source PAGE's
// original number of observed doublets. Relocate those doublets uniformly
// over the unchanged within-page adjacency opportunities; count hits only at
// original within-page physical line-wrap coordinates. This makes no claim
// that adjacent observed events are independent.
const logFact=[0];
for(let i=1;i<=N;i++)logFact[i]=logFact[i-1]+Math.log(i);
/** @param {number} n @param {number} k @returns {number} */
function logChoose(n,k){
  return k<0||k>n?-Infinity:logFact[n]-logFact[k]-logFact[n-k];
}
let law=[1],beg=0,observed=0,expected=0,opportunities=0,wraps=0;
for(const page of gp.pages.filter(p=>p.page<=55&&p.indices.length)){
  const end=beg+page.indices.length,n=page.indices.length-1;
  const validLineCuts=lineEnds.filter(i=>i>beg&&i<end);
  let events=0,lineHits=0;
  for(let i=beg+1;i<end;i++)if(original[i-1]===original[i]){
    events++;
    if(validLineCuts.includes(i))lineHits++;
  }
  const k=validLineCuts.length;
  const probabilities=[];
  for(let j=0;j<=Math.min(k,events);j++)
    probabilities[j]=Math.exp(logChoose(k,j)+
      logChoose(n-k,events-j)-logChoose(n,events));
  const next=new Array(law.length+probabilities.length-1).fill(0);
  for(let i=0;i<law.length;i++)
    for(let j=0;j<probabilities.length;j++)
      next[i+j]+=law[i]*probabilities[j];
  law=next;
  expected+=k*events/n;
  observed+=lineHits;
  wraps+=k;
  opportunities+=n;
  beg=end;
}
assert.deepEqual([observed,wraps,opportunities],[4,539,12901]);
assert(Math.abs(expected-3.57937198717445)<1e-10);
const lower=law.slice(0,observed+1).reduce((a,b)=>a+b,0);
const upper=law.slice(observed).reduce((a,b)=>a+b,0);
assert(Math.abs(lower-0.712458552206366)<1e-10);
assert(Math.abs(upper-0.483437654932058)<1e-10);
const pageConditionedLineEdges={
  sourceEvents:86,withinPageOpportunities:opportunities,
  withinPageLineWraps:wraps,lineWrapEvents:observed,
  nullExpectation:expected,lowerTail:lower,upperTail:upper
};


/** Involutive boundary reflow. All original authentic punctuation cuts
 * remain pinned; within every segment swap adjacent gap lengths.
 * @param {number[]} breaks @returns {number[]} */
function swapWithinScopes(breaks){
  const moved=[];
  for(let j=0;j<all.length-1;j++){
    const a=all[j],b=all[j+1];
    const interior=breaks.filter(x=>x>a&&x<b);
    const bounds=[a,...interior,b];
    const widths=bounds.slice(1).map((v,k)=>v-bounds[k]);
    for(let k=0;k+1<widths.length;k+=2)
      [widths[k],widths[k+1]]=[widths[k+1],widths[k]];
    let pos=a;
    for(const width of widths.slice(0,-1)){pos+=width;moved.push(pos);}
  }
  return moved;
}
const moved=swapWithinScopes(originalWordBreaks);
const unmoved=swapWithinScopes(moved);
assert.deepEqual(unmoved,
  originalWordBreaks.filter(x=>!all.includes(x)));
assert.ok(moved.some((v,i)=>v!==unmoved[i]),
  'The source-bounded space reflow must be nontrivial');

/** Deterministic positive-control keys, *never fitted* to original ciphertext.
 * @returns {()=>number} */
function rng(){let state=0x33012026;return ()=>{
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return state>>>0;
};}
/** Exact secret bijection plus arbitrary intra-scope reversal and its inverse.
 * @param {number[]} plain @returns {{cipher:number[],recovered:number[]}} */
function plant(plain,cuts=all){
  const random=rng(),cipher=new Array(N),recovered=new Array(N);
  for(let s=0;s<cuts.length-1;s++){
    const left=cuts[s],right=cuts[s+1],
      perm=Array.from({length:29},(_,i)=>i);
    for(let i=28;i>0;i--){const j=random()%(i+1);
      [perm[i],perm[j]]=[perm[j],perm[i]];}
    const inv=Array(29);
    for(let k=0;k<29;k++)inv[perm[k]]=k;
    for(let j=left;j<right;j++){
      cipher[j]=perm[plain[right-1-(j-left)]];
      recovered[right-1-(j-left)]=inv[cipher[j]];
    }
  }
  assert.deepEqual(recovered,plain);
  return {cipher,recovered};
}
/** Exactly match all 2,896 original whole-word rune lengths, allowing
 * independently sampled *real* source-native words in each source slot.
 * All original printed line/ink cuts stay fixed independently of the choices.
 * @param {string} donor
 * @param {()=>number} draw
 * @returns {{replicates:number,donorWords:number,min:number,max:number,mean:number,atOrBelow:number}} */
function lengthMatchedCollisionDonor(donor,draw){
  const lexicon=encodeWords(donor);
  const byLen=new Map();
  for(const w of lexicon){
    let bucket=byLen.get(w.length);
    if(!bucket){bucket=[];byLen.set(w.length,bucket);}
    bucket.push(w);
  }
  const widths=originalWordBreaks.map((end,j)=>end-
    (j===0?0:originalWordBreaks[j-1]));
  assert.equal(widths.length,2896);
  for(const width of widths)assert(byLen.has(width));
  const trials=256;
  let min=Infinity,max=-Infinity,sum=0,atOrBelow=0;
  for(let k=0;k<trials;k++){
    const candidate=new Array(N);
    let offset=0;
    for(const width of widths){
      const bucket=byLen.get(width);
      const chosen=bucket[draw()%bucket.length];
      for(const v of chosen)candidate[offset++]=v;
    }
    assert.equal(offset,N);
    const pairs=equalPairs(candidate,withAllVisible);
    min=Math.min(min,pairs);
    max=Math.max(max,pairs);
    sum+=pairs;
    if(pairs<=exactOriginalEquality.everyPrintedTokenAndInk)atOrBelow++;
  }
  return {replicates:trials,donorWords:lexicon.length,
    min,max,mean:sum/trials,atOrBelow};
}
const matchedDraw=rng();
const E=gp.translit.indexOf('E'),O=gp.translit.indexOf('O');
const sources=[
  ['Gibran','resources/control/gibran_prophet_58585.txt',1407,2556],
  ['Emerson','resources/control/emerson_essays_2944.txt',1482,2455],
  ['Shakespeare','resources/control/shakespeare_first300k.txt',1397,2430]
];
const controls=sources.map(([name,file,expectE,expectEO])=>{
  const native=encodeWords(read(file)).flat();
  const minE=minimumWindow(native,[E],N),
    minEO=minimumWindow(native,[E,O],N);
  assert.deepEqual([minE,minEO],[expectE,expectEO]);
  assert(1029<minE&&1897<minEO);
  const rank=rankCounter(native);
  const matching=fixedLayoutNativeCollisionControls(native);
  const nativeWordLengths=lengthMatchedCollisionDonor(read(file),matchedDraw);
  return {name,minE,minEO,sourceLineFullRankCapacity:rank,
    fullVisibleInkAndWordCollision:matching,
    originalWordLengthMatchedInkCollision:nativeWordLengths};
});
assert.deepEqual(controls.map(x=>[
  x.sourceLineFullRankCapacity.windows,
  x.sourceLineFullRankCapacity.failures]),
  [[50159,0],[311675,5649],[205845,0]]);
assert.deepEqual(controls.map(x=>[
  x.fullVisibleInkAndWordCollision.samples,
  x.fullVisibleInkAndWordCollision.min738,
  x.fullVisibleInkAndWordCollision.min3320,
  x.fullVisibleInkAndWordCollision.atOrBelowOriginal738,
  x.fullVisibleInkAndWordCollision.atOrBelowOriginal3320]),
  [[8,6658,1101,0,0],[49,6958,1137,0,0],
    [32,6599,1133,0,0]]);
assert.deepEqual(controls.map(x=>[
  x.originalWordLengthMatchedInkCollision.donorWords,
  x.originalWordLengthMatchedInkCollision.min,
  x.originalWordLengthMatchedInkCollision.max,
  x.originalWordLengthMatchedInkCollision.mean,
  x.originalWordLengthMatchedInkCollision.atOrBelow]),
  [[15733,1023,1200,1109.109375,0],
    [77932,1053,1249,1134.5703125,0],
    [55407,1059,1244,1150.7734375,0]]);
const native=encodeWords(read(sources[0][1])).flat().slice(0,N);
const positive=plant(native),positiveCap=bins(positive.cipher,all);
const allVisiblePositive=plant(native,withAllVisible);
assert.equal(allVisiblePositive.recovered.length,12956);
assert.equal(equalPairs(native,withAllVisible),
  equalPairs(allVisiblePositive.cipher,withAllVisible));
const nativeE=native.filter(x=>x===E).length,
  nativeEO=native.filter(x=>x===E||x===O).length;
assert(capacity(positiveCap,1)>=nativeE);
assert(capacity(positiveCap,2)>=nativeEO);
console.log(JSON.stringify({
  classification:'physical punctuation+quote+apostrophe allsecret intrasegment reflow and transposition',
  source:{originalRunes:N,printedWords:originalWordBreaks.length,
    physicalPunctuation:physical.length,quoteSpans:quotes.quotes.length,
    realApostrophes:quotes.apostrophes_before_rune.length,
    basicSegments:base.length,augmentedSegments:augmented.length,
    newCutPositions:all.filter(v=>!basic.includes(v))},
  upperBounds:{basicE:1012,basicEO:1874,augmentedE:1029,augmentedEO:1897,
    plusPageSeamsE:1109,plusPageSeamsEO:2042,
    lineOnlyE:1680,lineOnlyEO:2997,allInkAndLineE:1816,allInkAndLineEO:3218},
  sourceLayoutResetResolution:{
    pageAndInkCuts:{scopes:withPages.length-1,...pageAndInkEcho},
    physicalPrintedLines:{scopes:onlyLines.length-1,...lineEcho},
    allInkAndLineScopes:withLines.length-1,
    physicalLineAll29RankUpperMass:lineRankCaps,
    originalSameSymbolPairInvariants:exactOriginalEquality,
    allPrintedWordLineInkScopes:withAllVisible.length-1,
    continuousLowRepeatPageConditionedLineNull:pageConditionedLineEdges,
    decision:'The global top-letter capacity gate fails to exclude line-based private alphabets, but within-layout exact same-symbol pairs exclude even 3,320 independent private alphabets in every complete original ink/word/line scope, with any intra-scope rune order and internal spaces. Evolving values within scopes or transposition across marked scopes remain unselected.'},
  sourceInkCrossingEcho:{tested:inkCrossings.length,
    equal:equalCrossings.length,
    exactRandomIndependentScopeCyclicShiftP_le1:independentResetLowerTail,
    expectedIndependentScopeEcho:inkCrossings.length/29,
    interpretation:'A simple independent fresh-GP29-alphabet reset at every ink scope predicts more crossing equalities than observed; a continuous anti-repeat state remains plausible.'},
  nativeWindowMinima:controls,
  proof:'Arbitrary within-scope rune permutation and space motion preserve each scope histogram. Any private GP29 symbol bijection only relabels that histogram.',
  nativePlant:{recoveredRunes:positive.recovered.length,
    ciphertextMaxE:capacity(positiveCap,1),
    ciphertextMaxEO:capacity(positiveCap,2),
    sourceNativeE:nativeE,sourceNativeEO:nativeEO,
    alternativeWordBreaks:moved.length,
    exactInverseOfWordBreakReflow:true,
    allVisibleScopePrivateAlphabetAndRereadRestoresAllNativeGP:true},
  decision:'All original source-anchored scope-static GP29 substitutions combined with arbitrary internal transposition and word resegmentation fail native-GP prose ceilings. A viable space-changing solver must move rune mass across anchor cuts or change rune identities through evolving/polygraphic states (or use another plaintext register).'
},null,2));

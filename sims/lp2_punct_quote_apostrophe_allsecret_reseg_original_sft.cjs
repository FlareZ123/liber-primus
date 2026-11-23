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
const originalWordBreaks=wordEnds.filter(x=>x<=N);
assert.equal(originalWordBreaks.length,2896);
assert.equal(originalWordBreaks.at(-1),N);

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
function plant(plain){
  const random=rng(),cipher=new Array(N),recovered=new Array(N);
  for(let s=0;s<all.length-1;s++){
    const left=all[s],right=all[s+1],perm=Array.from({length:29},(_,i)=>i);
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
  return {name,minE,minEO};
});
const native=encodeWords(read(sources[0][1])).flat().slice(0,N);
const positive=plant(native),positiveCap=bins(positive.cipher,all);
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
  upperBounds:{basicE:1012,basicEO:1874,augmentedE:1029,augmentedEO:1897},
  nativeWindowMinima:controls,
  proof:'Arbitrary within-scope rune permutation and space motion preserve each scope histogram. Any private GP29 symbol bijection only relabels that histogram.',
  nativePlant:{recoveredRunes:positive.recovered.length,
    ciphertextMaxE:capacity(positiveCap,1),
    ciphertextMaxEO:capacity(positiveCap,2),
    sourceNativeE:nativeE,sourceNativeEO:nativeEO,
    alternativeWordBreaks:moved.length,
    exactInverseOfWordBreakReflow:true},
  decision:'All original source-anchored scope-static GP29 substitutions combined with arbitrary internal transposition and word resegmentation fail native-GP prose ceilings. A viable space-changing solver must move rune mass across anchor cuts or change rune identities through evolving/polygraphic states (or use another plaintext register).'
},null,2));

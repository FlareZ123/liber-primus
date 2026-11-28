'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'
));

const MOD = 29;
const mod = (x) => (x % MOD + MOD) % MOD;
const state = { p:23, g:5, a:6, b:15, K:2, q:4, A:8, B:19, e:3 };

const annotatedRedPages = ink.pages
  .filter((page) =>
    (page.red_spans || []).length ||
    (page.large_punctuation || []).some((item) => item[2] === 'red'))
  .map((page) => page.page)
  .sort((a,b) => a-b);
assert.equal(annotatedRedPages.length, 24);

// p37's original page visibly carries red numeric labels; these are outside
// the rune-span / large-punctuation annotation schema.
const visibleRedPages = [...new Set([...annotatedRedPages, 37])].sort((a,b) => a-b);
assert.deepEqual(visibleRedPages, [
  0,2,3,6,7,8,14,15,22,23,26,27,32,33,36,37,38,39,40,49,53,54,55,56,57,
]);
assert.equal(visibleRedPages.length, 25);

const gapRecords=[];
for(let i=0;i+1<visibleRedPages.length;i++){
  const n=visibleRedPages[i+1]-visibleRedPages[i]-1;
  if(n>0)gapRecords.push({from:visibleRedPages[i],to:visibleRedPages[i+1],n});
}
const gaps=gapRecords.map(x=>x.n);
assert.deepEqual(gaps,[1,2,5,6,2,4,2,8,3]);
assert.deepEqual(gaps,[
  1,state.K,state.g,state.a,state.K,state.q,state.K,state.A,state.e
]);

const firstOccurrences=[...new Set(gaps)];
assert.deepEqual(firstOccurrences,[1,state.K,state.g,state.a,state.q,state.A,state.e]);

const nonRedPages=58-visibleRedPages.length;
assert.equal(nonRedPages,33);
assert.equal(gaps.reduce((a,b)=>a+b,0),nonRedPages);
assert.equal(mod(visibleRedPages.length),mod(-state.q));
assert.equal(mod(nonRedPages),state.q);
assert.equal(nonRedPages-visibleRedPages.length,state.A);

const nonemptyGapCount=gaps.length;
assert.equal(nonemptyGapCount,state.q+state.g);
assert.equal(new Set(gaps).size,state.g+state.K);
assert.equal(gaps.filter(x=>x===state.K).length,state.e);

const redSpans=ink.pages.flatMap((page)=>(page.red_spans||[]));
const redRuneCount=redSpans.reduce((sum,span)=>sum+span.length,0);
assert.equal(redSpans.length,18);
assert.equal(redSpans.length,state.p-state.g);
assert.equal(redRuneCount,225);
assert.deepEqual([Math.floor(redRuneCount/MOD),redRuneCount%MOD],
  [state.g+state.K,state.p-1]);


// Natural 2x2 red-feature table: complete red rune span vs red large punctuation.
const spanPageSet=new Set(ink.pages.filter((page)=>(page.red_spans||[]).length).map((page)=>page.page));
const punctuationPageSet=new Set(ink.pages.filter((page)=>
  (page.large_punctuation||[]).some((item)=>item[2]==='red')).map((page)=>page.page));
const bothPages=[],spanOnlyPages=[],punctuationOnlyPages=[],neitherPages=[];
for(let page=0;page<58;page+=1){
  const hasSpan=spanPageSet.has(page),hasPunctuation=punctuationPageSet.has(page);
  (hasSpan&&hasPunctuation?bothPages:hasSpan?spanOnlyPages:hasPunctuation?punctuationOnlyPages:neitherPages).push(page);
}
assert.equal(spanPageSet.size,state.b);                    // 15
assert.equal(punctuationPageSet.size,state.p-1);          // 22
assert.equal(bothPages.length,state.b-state.K);           // 13
assert.equal(spanOnlyPages.length,state.K);               // 2
assert.equal(punctuationOnlyPages.length,state.q+state.g);// 9
assert.equal(neitherPages.length,MOD+state.g);            // 34
assert.deepEqual(spanOnlyPages,[8,40]);
const spanOnlyResidues=spanOnlyPages.map((page)=>page%MOD);
assert.deepEqual(spanOnlyResidues,[state.A,11]);          // [A,A^-1]
assert.equal(mod(state.A*spanOnlyResidues[1]),1);
assert.equal(mod(spanOnlyResidues[0]+spanOnlyResidues[1]),state.B);
assert.equal(mod(spanOnlyResidues[1]-spanOnlyResidues[0]),state.e);
assert.deepEqual([
  mod(spanOnlyResidues[1]-spanOnlyResidues[0]),
  mod(spanOnlyResidues[1]+spanOnlyResidues[0]),
],[state.e,state.B]);

console.log(JSON.stringify({
  visibleRedPages,
  redPageCount:visibleRedPages.length,
  nonRedPageCount:nonRedPages,
  redNonRedResidues:[mod(visibleRedPages.length),mod(nonRedPages)],
  redNonRedDifference:nonRedPages-visibleRedPages.length,
  gapRecords,
  nonemptyGapVector:gaps,
  firstOccurrenceGapAlphabet:firstOccurrences,
  nonemptyGapCount,
  distinctGapLengthCount:new Set(gaps).size,
  KFrequency:gaps.filter(x=>x===state.K).length,
  completeRedSpanCount:redSpans.length,
  completeRedRuneCount:redRuneCount,
  completeRedRuneCountBase29:[Math.floor(redRuneCount/MOD),redRuneCount%MOD],
  redFeatureContingency:{bothPages,spanOnlyPages,punctuationOnlyPages,neitherPages,spanOnlyResidues},
  state,
},null,2));

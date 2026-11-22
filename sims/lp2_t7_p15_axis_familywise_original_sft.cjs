'use strict';

/**
 * First-party LP2 residual-doublet clustering and original p15-axis
 * source-selector gate. Reproduces external T7 only as a necessary baseline;
 * the NEW decision is page-center familywise calibration of the visual p15
 * infinity/numeric-panel axis, with manuscript word-break audit.
 *
 * Run on Node.js 22: node sims/lp2_t7_p15_axis_familywise_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'),'utf8'));
const annotations = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'),'utf8'));

const pages = corpus.pages.slice(0,56);
const cipher = [];
const spans = [];
for(const page of pages){
  const start = cipher.length;
  cipher.push(...page.indices);
  if(page.indices.length) spans.push({
    page:page.page, start, end:cipher.length-1,
    midpoint:(start+cipher.length-1)/2
  });
}
assert.equal(cipher.length,12956);
assert.equal(spans.length,55);
assert.equal(corpus.pages[50].indices.length,0);

const sites = [];
for(let i=1;i<cipher.length;i++) if(cipher[i]===cipher[i-1])sites.push(i);
assert.equal(sites.length,86);
assert.deepEqual(sites.slice(16,21),[2580,2740,3140,3852,4389]);
const gaps=sites.slice(1).map((p,i)=>p-sites[i]);
assert.equal(Math.min(...gaps),6);
assert.deepEqual(gaps.slice(17,20),[400,712,537]);

/** @param {number[]} ss @returns {number} Pearson lag-one on site gaps */
function gapAc1(ss){
  const g=ss.slice(1).map((p,i)=>p-ss[i]);
  const n=g.length-1;
  let m0=0,m1=0;
  for(let i=0;i<n;i++){m0+=g[i];m1+=g[i+1];}
  m0/=n;m1/=n;
  let cov=0,v0=0,v1=0;
  for(let i=0;i<n;i++){
    const a=g[i]-m0,b=g[i+1]-m1;
    cov+=a*b;v0+=a*a;v1+=b*b;
  }
  return cov/Math.sqrt(v0*v1);
}
const observedAc1=gapAc1(sites);
assert(Math.abs(observedAc1-0.38001968924100965)<1e-12);

const parsed=parseSharedCorpus();
assert.equal(parsed.words.length,2896);
assert.equal(parsed.runeCount,cipher.length);
const charMap=new Map(corpus.runes.map((ch,i)=>[ch,i]));
assert.deepEqual(parsed.words.flatMap(w=>[...w.runes].map(ch=>charMap.get(ch))),cipher);
const wordBoundaries=new Set();
let ptr=0;
for(const word of parsed.words){
  if(ptr>0)wordBoundaries.add(ptr);
  ptr+=word.length;
}
assert.equal(ptr,cipher.length);
assert.equal(wordBoundaries.size,2895);
assert.equal(sites.filter(i=>wordBoundaries.has(i)).length,23);

const p15=spans.find(p=>p.page===15);
assert(p15);
assert.equal(p15.start,3603);
const ink15=annotations.pages.find(p=>p.page===15);
assert(ink15);
assert.equal(ink15.red_spans[0].length,9);
assert.deepEqual(ink15.large_punctuation,[[0,13,'red'],[9,13,'red'],[20,13,'red']]);
const sourceJ=p15.start+ink15.red_spans[0].length-0.5;
assert.equal(sourceJ,3611.5);
const N=cipher.length, K=sites.length, W=1650;
const pageMidpointStarts=spans.map(p=>Math.max(0,
  Math.min(N-W,Math.round(p.midpoint-W/2))));
const sourceP15Start=Math.round(sourceJ-W/2);
assert.equal(sourceP15Start,2787);
const page15Index=spans.findIndex(p=>p.page===15);
assert.equal(pageMidpointStarts[page15Index],2857);

/** @param {number} start @param {number[]} positions */
function countSites(start,positions){
  let n=0;
  for(const position of positions)if(position>=start&&position<start+W)n++;
  return n;
}
const observedP15=countSites(pageMidpointStarts[page15Index],sites);
const observedMin=Math.min(...pageMidpointStarts.map(s=>countSites(s,sites)));
assert.equal(observedP15,3);
assert.equal(observedMin,3);
assert.equal(countSites(sourceP15Start,sites),3);
const winningPageCenters=spans.filter((p,i)=>
  countSites(pageMidpointStarts[i],sites)===observedMin).map(p=>p.page);
assert.deepEqual(winningPageCenters,[14,15]);
const p15SourceBreaks=[...wordBoundaries].filter(i=>
  i>=sourceP15Start&&i<sourceP15Start+W).length;
assert.equal(p15SourceBreaks,380);
assert.equal(sites.filter(i=>i>=sourceP15Start&&i<sourceP15Start+W&&wordBoundaries.has(i)).length,0);

// Exact bijection for a hard-core point-process null: choose a uniform
// k-subset U from 1..(N-1)-5*(k-1), sort it, then site_i=U_i+5*i.
// Every k-subset with nearest-site separation>=6 is represented once.
// Seeded xorshift32 is sufficient for reproducible pseudorandom MC draws.
// The integer map rejects modulo bias from the generator range.
const M=(N-1)-5*(K-1);
assert.equal(M,12530);
let seed=0x33012026;
/** @returns {number} */
function random32(){
  seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5;
  return seed>>>0;
}
/** @param {number} max @returns {number} Integer from 1 through max */
function uniformInt(max){
  const period=4294967296;
  const limit=period-(period%max);
  let value;
  do{value=random32();}while(value>=limit);
  return 1+(value%max);
}
/** @returns {number[]} */
function sampleHardcore(){
  const subset=new Set();
  for(let j=M-K+1;j<=M;j++){
    const v=uniformInt(j);
    subset.add(subset.has(v)?j:v);
  }
  return [...subset].sort((a,b)=>a-b).map((v,i)=>v+5*i);
}

const D=30000;
let acExceed=0,p15Low=0,anyPageLow=0;
for(let draw=0;draw<D;draw++){
  const synthetic=sampleHardcore();
  if(Math.abs(gapAc1(synthetic))>=Math.abs(observedAc1))acExceed++;
  if(countSites(pageMidpointStarts[page15Index],synthetic)<=observedP15)p15Low++;
  let minCount=Infinity;
  for(const start of pageMidpointStarts){
    minCount=Math.min(minCount,countSites(start,synthetic));
    if(minCount<=observedMin)break;
  }
  if(minCount<=observedMin)anyPageLow++;
}
assert.deepEqual([acExceed,p15Low,anyPageLow],[14,64,2382]);
const empiricalP=n=>(n+1)/(D+1);
console.log(JSON.stringify({
 original:{runes:N,doubletSites:K,minSiteSpacing:6,wordBreaks:wordBoundaries.size,
  repeatAtWordBreaks:23,repeatWithinWords:63,
  observedGapLagOne:observedAc1,
  sparseSites:[2740,3140,3852,4389],consecutiveGaps:[400,712,537],
  p15:{pageRunes:p15.end-p15.start+1,firstRedRunes:9,axis:sourceJ,
   sourceAxisWindow:[sourceP15Start,sourceP15Start+W],
   sourceWindowSites:countSites(sourceP15Start,sites),
   sourceWindowWordBreaks:p15SourceBreaks,
   sourceWindowRepeatAtWordBreaks:0,
   midpointWindowStart:pageMidpointStarts[page15Index],
   midpointWindowSites:observedP15},
  pageMidpointWindows:pageMidpointStarts.length,
  minimumPageWindowDoublets:observedMin,
  minimumPages:winningPageCenters
 },
 null:{sampling:'uniform 86-site subsets conditioned gap>=6',
  draws:D,seed:'0x33012026',acExceed,p15Low,anyPageLow,
  pGapAutocorrelation:empiricalP(acExceed),
  pP15MidpointUnadjusted:empiricalP(p15Low),
  pAnyOriginalPageCenterFamilywise:empiricalP(anyPageLow)},
 conclusion:'Global lag-one gap clustering is source-present (T7). The p15 numeric axis is an independently printed landmark but its postdiscovery familywise association does not reach 0.05; no key or plaintext.'
},null,2));
console.log('PASS original T7 nonstationarity and 55-page source-axis familywise gate');

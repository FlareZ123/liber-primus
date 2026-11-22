"use strict";

/**
 * Reproducible source-visible GP prime-weight checksum candidate.
 * LP2 p40 red8 and p53 red51 are the only red spans in the intervening
 * 3008-rune text section. The fixed floral left/right ornaments read 13/31.
 * These, GP's published 29-rune alphabet and 29 source primes are inputs,
 * not numbers discovered by the cryptanalysis script.
 *
 * Demonstrate all four original equalities, the exact 224×129 original
 * same-length contiguous-window census, algebraic forced closing sum, and a
 * deterministic histogram-preserving random-position calibration.
 * The calculation does not claim a cipher, unknown plaintext or key.
 *
 * Windows 11 / Node.js22 CommonJS, no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root=path.resolve(__dirname,"..");
const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const p40=corpus.pages[40].indices;
const p53=corpus.pages[53].indices;
const primes=corpus.prime;
assert.equal(primes.length,29);
assert.equal(primes[0],2);
assert.equal(Math.max(...primes),109);
assert.equal(p40.length,231);
assert.equal(p53.length,179);
const a=ink.pages.find(p=>p.page===40);
const b=ink.pages.find(p=>p.page===53);
assert.deepEqual(a.red_spans.map(s=>[s.start,s.length]),[[0,8]]);
assert.deepEqual(b.red_spans.map(s=>[s.start,s.length]),[[128,51]]);
const floralReds=ink.pages.filter(p=>p.page>=40&&p.page<=53)
  .flatMap(p=>(p.red_spans||[]).map(s=>[p.page,s.start,s.length]));
assert.deepEqual(floralReds,[[40,0,8],[53,128,51]]);
/** @param {number[]} source @param {number} start @param {number} n */
const sums=(source,start,n)=>{
  let indexSum=0,primeSum=0;
  for(let i=start;i<start+n;i++){
    indexSum+=source[i];
    primeSum+=primes[source[i]];
  }
  return {start,indexSum,primeSum};
};
const heading=sums(p40,0,8);
const closing=sums(p53,128,51);
assert.deepEqual(heading,{start:0,indexSum:116,primeSum:435});
assert.deepEqual(closing,{start:128,indexSum:634,primeSum:2262});
const LEFT=13,RIGHT=31,GP=29,RED_COUNT=59;
/** @param {{indexSum:number,primeSum:number}} h @param {{primeSum:number}} t */
function seals(h,t){
  return [
    h.indexSum%GP===0,
    h.primeSum%GP===0,
    t.primeSum%(LEFT*GP)===0,
    (h.primeSum+t.primeSum)%(RIGHT*GP)===0
  ];
}
assert.deepEqual(seals(heading,closing),[true,true,true,true]);
assert.equal(8+51,RED_COUNT);
assert.equal(heading.primeSum/29,15);
assert.equal(closing.primeSum/(13*29),6);
assert.equal((heading.primeSum+closing.primeSum)/(31*29),3);

// Locked *deduction* from frozen p40 heading and 13/31 ornaments.
// With closing total T, the two congruences require T=377(6+31*k).
// Every GP prime weight is 2..109, so a 51-rune sum lies in 102..5559.
// This leaves T=2262 as the only possible nonnegative solution.
const rhs=[];
for(let T=2*51;T<=109*51;T++)
  if(T%(13*29)===0 && (heading.primeSum+T)%(31*29)===0)
    rhs.push(T);
assert.deepEqual(rhs,[2262]);
assert.equal(closing.primeSum,rhs[0]);

// Stronger ink-blind consequence: ignore annotated color and enumerate every
// ENTIRE p40 prefix and ENTIRE p53 suffix of ANY positive length. The same
// two checksum predicates uniquely reconstruct exactly both original red
// boundaries from the source rune values and original floral ornament values.
const inkBlindPrefixes=[];
let prefixIndex=0,prefixPrime=0;
for(let i=0;i<p40.length;i++){
  prefixIndex+=p40[i];prefixPrime+=primes[p40[i]];
  if(prefixIndex%29===0 && prefixPrime%29===0)
    inkBlindPrefixes.push({length:i+1,indexSum:prefixIndex,primeSum:prefixPrime});
}
assert.deepEqual(inkBlindPrefixes,[{length:8,indexSum:116,primeSum:435}]);
const inkBlindSuffixes=[];
let suffixPrime=0;
for(let j=p53.length-1;j>=0;j--){
  suffixPrime+=primes[p53[j]];
  if(suffixPrime%(LEFT*GP)===0 &&
     (heading.primeSum+suffixPrime)%(RIGHT*GP)===0)
     inkBlindSuffixes.push({start:j,length:p53.length-j,primeSum:suffixPrime});
}
assert.deepEqual(inkBlindSuffixes,[{start:128,length:51,primeSum:2262}]);

const heads=Array.from({length:p40.length-8+1},
  (_,i)=>sums(p40,i,8));
const tails=Array.from({length:p53.length-51+1},
  (_,i)=>sums(p53,i,51));
assert.equal(heads.length,224);
assert.equal(tails.length,129);
let head29=0,headBoth29=0,tail13x29=0,sum31x29=0,allThree=0,allFour=0;
const conjunction=[];
for(const h of heads){
 for(const t of tails){
   const [hIdx,hPrime,tPrime,pairPrime]=seals(h,t);
   head29+=Number(hPrime);
   headBoth29+=Number(hIdx&&hPrime);
   tail13x29+=Number(tPrime);
   sum31x29+=Number(pairPrime);
   allThree+=Number(hPrime&&tPrime&&pairPrime);
   if(hIdx&&hPrime&&tPrime&&pairPrime){
     allFour++;
     conjunction.push({headingStart:h.start,closingStart:t.start});
   }
 }
}
assert.equal(head29,1032);
assert.equal(headBoth29,129);
assert.equal(tail13x29,224);
assert.equal(sum31x29,20);
assert.equal(allThree,1);
assert.equal(allFour,1);
assert.deepEqual(conjunction,[{headingStart:0,closingStart:128}]);
assert.deepEqual(heads.filter(h=>h.indexSum%29===0 && h.primeSum%29===0)
  .map(h=>h.start),[0]);
assert.deepEqual(tails.filter(t=>t.primeSum%(13*29)===0)
  .map(t=>t.start),[128]);

// Exploratory conditional null: choose each marked span's number of symbols
// without replacement from the UNCHANGED original corresponding physical page.
// This preserves the p40/p53 GP symbol histograms, the original 8/51 length
// contrast, the independently sourced 13/31 targets, and original-page scope.
// It randomizes which source glyphs are red, not the original glyphs themselves.
let state=0x13312959>>>0;
function random(){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return state>>>0;
}
/**
 * Sample WITHOUT replacement via partial Fisher–Yates.
 * @param {number[]} source
 * @param {number} n
 * @returns {{indexSum:number,primeSum:number}}
 */
function draw(source,n){
  const choices=Array.from({length:source.length},(_,i)=>i);
  let indexSum=0,primeSum=0;
  for(let i=0;i<n;i++){
    const j=i+random()%(source.length-i);
    const old=choices[i];choices[i]=choices[j];choices[j]=old;
    const r=source[choices[i]];
    indexSum+=r;primeSum+=primes[r];
  }
  return {indexSum,primeSum};
}
const trials=300000;
let exact4=0,exact3=0,headChecks=0,tailChecks=0,combinedChecks=0,minimumDistance=Infinity;
for(let t=0;t<trials;t++){
  const h=draw(p40,8),cl=draw(p53,51);
  const [hi,hp,tp,pc]=seals(h,cl);
  headChecks+=Number(hi&&hp);
  tailChecks+=Number(tp);
  combinedChecks+=Number(pc);
  exact3+=Number(hp&&tp&&pc);
  exact4+=Number(hi&&hp&&tp&&pc);
  const dist=Math.abs(cl.primeSum-2262);
  if(dist<minimumDistance)minimumDistance=dist;
}
assert(minimumDistance>=0);
// Synthetic negative signal: changing one original closing rune to its next
// legal GP index destroys at least one of the congruences.
const mutant={...closing,primeSum:closing.primeSum-
  primes[p53[p53.length-1]]+primes[(p53[p53.length-1]+1)%29]};
assert(seals(heading,mutant).some(v=>!v));
console.log(JSON.stringify({
  source:"Physical LP2 p40 red8 and p53 closing red51, p40–53 only red spans; floral left13/right31; authentic GP29 prime weights",
  physical:{p40Runes:p40.length,p53Runes:p53.length,
    heading,closing,redCount:RED_COUNT,primeSumBoth:heading.primeSum+closing.primeSum},
  exactDivisions:{openingGPIndexOver29:4,openingPrimeOver29:15,
    closingPrimeOverGPxLeft:6,totalPrimeOverGPxRight:3,
    forcedClosingPrimeSum:rhs[0],boundedPossibleSums:[102,5559]},
  inkBlindBoundaries:{p40AllPrefixesSatisfyingBoth29Checks:inkBlindPrefixes,p53AllSuffixesSatisfyingBothOrnamentChecks:inkBlindSuffixes},
  originalWindowCensus:{headWindows:heads.length,tailWindows:tails.length,
    totalPairs:heads.length*tails.length,headPrime0Pairs:head29,
    headIndexAndPrime0Pairs:headBoth29,tail13x29Pairs:tail13x29,
    total31x29Pairs:sum31x29,threePrimeConditions:allThree,
    allFourConditions:allFour,uniqueMarkedOriginalPair:conjunction},
  matchedPageHistogramResampling:{seed:"0x13312959",trials,
    headBoth29:headChecks,tail13x29:tailChecks,
    combined31x29:combinedChecks,
    allThree:exact3,allFour:exact4,
    additiveOneSidedUpper:(exact4+1)/(trials+1),
    minimumAbsDeviationFromForcedClosingSum:minimumDistance},
  interpretation:"Source-associated candidate checksum, numerically exceptional under its stated conditional null, with no authored checksum/decoding instruction and no unknown plaintext or key."
},null,2));
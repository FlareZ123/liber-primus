"use strict";
/**
 * Source-clue bounded non-3-period Trifid all-secret one-letter capacity test.
 *
 * Earlier 4,008-period triple equality invariant covers ALL multiples of 3.
 * This tests only nonmultiples specifically suggested by published LP2 clues:
 * GP alphabet 29, Fibonacci square's 79, grid quotient 127, 179-rune p53,
 * 32x8=256 printed grid, 263-rune p52, red 3299 and Cicada 3301.
 *
 * Import rigorous 9x9 rectangle relaxation over all 27! secret cube orders.
 * Explicit standard/reverse test, no key fitting or unknown plaintext guess.
 * The reference minimum E-symbol count in 12,956 GP runes is 1,404
 * across pinned Shakespeare, Gibran and Emerson native-GP corpora.
 *
 * Run: node sims/trifid_source_selected_non3_periods_gate.cjs
 */
const assert=require("node:assert/strict");
const {test,main:previous}=require("./trifid_27cube_periods_gate.cjs");
const {apply,gp}=require("./trifid_27cube_allsecret_gate.cjs");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const original=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(original.length,12956);
const reference=gp(fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8")).slice(0,12956);
assert.equal(reference.length,12956);
const cube=Array.from({length:27},(_,i)=>(7*i)%27);
const candidatePeriods=[29,79,127,179,256,263,3299,3301];
assert(candidatePeriods.every(p=>p%3!==0));
function main(){
 const findings=[];
 for(const p of candidatePeriods){
  const options=[];
  for(const d of ["standard","reverse"]){
   const result=test(p,d);
   assert.equal(result.period,p);
   assert.equal(result.direction,d);
   assert.ok(result.bound>=0 && result.bound<=12956);
   const coded=apply(reference,cube,d,true,p);
   assert.deepEqual(apply(coded,cube,d,false,p),reference);
   const synthetic=apply(original,cube,d,false,p);
   assert.deepEqual(apply(synthetic,cube,d,true,p),original);
   const item={
    period:p,direction:d,allKeyMaxCopiesOfAnyDecodedCoreRune:result.bound,
    minGPEnglishERunes:1404,
    excludesDirectGPReference:result.bound<1404,
    axes:result.classes.length,
    rectangleSearchNodes:result.nodes,
    originalRuneRoundTrip:12956,
    nativeReferencePlantRoundTrip:12956
   };
   console.log("CASE "+JSON.stringify(item));
   options.push(item);
  }
  findings.push(...options);
 }
 console.log("RESULT "+JSON.stringify({
  classification:"Fixed secret 27-cube Trifid all-key native-GP one-symbol capacity",
  sourceSelectedPeriods:candidatePeriods,
  sourceOnly:true,
  models:findings.length,
  establishedExclusions:findings.filter(x=>x.excludesDirectGPReference)
    .map(x=>({p:x.period,d:x.direction,bound:x.allKeyMaxCopiesOfAnyDecodedCoreRune})),
  unexcluded:findings.filter(x=>!x.excludesDirectGPReference)
    .map(x=>({p:x.period,d:x.direction,bound:x.allKeyMaxCopiesOfAnyDecodedCoreRune})),
  scope:"Fixed IA/EA transparent controls, one book cube, full GP-native plaintext; no original recovered text or key"
 }));
}
main();

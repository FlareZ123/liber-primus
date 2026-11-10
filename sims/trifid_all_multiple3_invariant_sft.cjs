"use strict";
/**
 * Original LP2 all-fixed-secret-cube exclusion for every standard Trifid
 * period divisible by three with at least one complete ciphertext block.
 * All 4,008 candidate periods 3,6,...,12,024 are tested exactly.
 *
 * Each period n=3m maps ciphertext source glyph triples
 * (C_t,C_(m+t),C_(2m+t)) bijectively to consecutive plaintext triples
 * under ANY book-fixed secret 27-cell cube. Thus collision-pair counts
 * are key-independent. All source IA/EA controls are transparent.
 *
 * A single rigorous reference comparison suffices for all 4,008 periods:
 * every corresponding plaintext triple window has at least Kmin triplets.
 * Collision-pair count is monotone under window extension, so the exact
 * minimum over every Kmin-triplet native-GP reference window is a lower
 * bound on every longer window. Compare this lower bound to the MAXIMUM
 * original-source collision count over ALL tested periods.
 *
 * Run: node sims/trifid_all_multiple3_invariant_sft.cjs
 * No files are written and no plaintext key is searched.
 */
const assert=require("node:assert/strict");
const path=require("node:path");
const {gp}=require("./trifid_27cube_allsecret_gate.cjs");
const {
  sourceTriples, stats, minEnglish, checkPlant, core, references, read
}=require("./trifid_triple_equality_invariant_sft.cjs");

function main(){
 const byPeriod=[];
 let minimumTriples=Infinity;
 let worstOriginalPairs=-1;
 let worstPeriods=[];
 for(let period=3;period<=core.length;period+=3){
  const triplets=sourceTriples(core,period);
  const pairs=stats(triplets).pairs;
  minimumTriples=Math.min(minimumTriples,triplets.length);
  if(pairs>worstOriginalPairs){worstOriginalPairs=pairs;worstPeriods=[period];}
  else if(pairs===worstOriginalPairs)worstPeriods.push(period);
  byPeriod.push({period,triplets:triplets.length,pairs});
 }
 assert.equal(byPeriod.length,4008);
 const referencesMin=references.map(file=>{
  const stripped=gp(read(file)).filter(x=>x<27);
  const windows=minEnglish(stripped,minimumTriples);
  return {
   name:path.basename(file),
   allEligibleMinLengthWindows:windows.windows,
   minimumTriplets:minimumTriples,
   minimumNativeGPPairs:windows.minPairs,
   originalWorstCasesStillBelowReference:worstOriginalPairs<windows.minPairs
  };
 });
 const positives=[3,3300,6015,12024].map(period=>{
  const plant=checkPlant(period);
  return {period,...plant};
 });
 const successful=referencesMin.every(x=>x.originalWorstCasesStillBelowReference);
 const result={
  finding:"Exact fixed-cube native-GP Trifid triple-equality exclusion",
  periodsTested:byPeriod.length,
  allPeriodsAreMultiplesOfThree:true,
  minimumPeriod:3,
  maximumPeriod:12024,
  totalCoreRunes:core.length,
  minimumCompleteBlockTriplets:minimumTriples,
  worstSourceTriplePairCollisions:worstOriginalPairs,
  worstPeriods:worstPeriods.slice(0,20),
  worstPeriodCount:worstPeriods.length,
  independentReferenceWindowMinima:referencesMin,
  hiddenCubeOriginalAndGPPlantControls:positives,
  excludesAllTestedPeriodsAgainstAllReferenceWindows:successful,
  caveat:"Direct GP only; two fixed transparent glyphs, one book-fixed secret cube, period divisible by three. No plaintext recovered."
 };
 assert.ok(successful,"Direct GP-English reference exclusion was not established");
 console.log("RESULT "+JSON.stringify(result));
}
main();

"use strict";
/**
 * Every nonzero whole-book cyclic offset, all-secret coordinate proof.
 *
 * This extends two source-original stationary-grid capacity gates from
 * finite block clocks to ALL positive cyclic source shifts, excluding
 * delta=0 where the two taps coincide. It reuses their exact original
 * normalization, pair-capacity theorem, reference-window counts and
 * source-native hidden-key positive controls.
 *
 * GP28: 12,815 compacted rank positions, 12,814 shifts in each of two
 *        predecessor-rank orders, any 28-symbol rectangular secret key.
 * GP30: 15,844 rune-plus-word-space symbols, all 15,843 shifts, any
 *        stationary secret 5x6 grid key.
 *
 * Run: node sims/coordinate_fractionation_all_lag_gate.cjs
 * Node 22 CommonJS, built-ins only, read-only original inputs.
 */
const assert=require("node:assert/strict");
const gp28=require("./gp28_coordinate_fractionation_gate.cjs");
const gp30=require("./gp30_space_fractionation_gate.cjs");

/**
 * @param {"cyclic"|"sorted"} mode
 * @returns {{shifts:number,maximum:{lag:number,bound:number},minimum:{lag:number,bound:number}}}
 */
function allGP28(mode) {
  const stream=gp28.pageRanks(mode).flat();
  const N=stream.length;
  assert.equal(N,12815);
  let maximum={lag:0,bound:-Infinity};
  let minimum={lag:0,bound:Infinity};
  for(let lag=1;lag<N;lag++) {
    const observed=gp28.pairCap([stream],N,lag).bound;
    if(observed>maximum.bound)maximum={lag,bound:observed};
    if(observed<minimum.bound)minimum={lag,bound:observed};
  }
  return {shifts:N-1,maximum,minimum};
}

/** @returns {{shifts:number,maximum:{lag:number,bound:number},minimum:{lag:number,bound:number}}} */
function allGP30() {
  const stream=gp30.sourceSections().flat();
  const N=stream.length;
  assert.equal(N,15844);
  let maximum={lag:0,bound:-Infinity};
  let minimum={lag:0,bound:Infinity};
  for(let lag=1;lag<N;lag++) {
    const observed=gp30.pairCapacity([stream],N,lag).allKeyCap;
    if(observed>maximum.bound)maximum={lag,bound:observed};
    if(observed<minimum.bound)minimum={lag,bound:observed};
  }
  return {shifts:N-1,maximum,minimum};
}

function main() {
  const cyclic=allGP28("cyclic");
  const sorted=allGP28("sorted");
  const space=allGP30();

  assert.equal(cyclic.shifts,12814);
  assert.equal(sorted.shifts,12814);
  assert.equal(space.shifts,15843);
  assert.deepEqual(cyclic.maximum,{lag:2666,bound:783});
  assert.deepEqual(sorted.maximum,{lag:2257,bound:765});
  assert.deepEqual(space.maximum,{lag:15840,bound:1857});

  const native28=gp28.main();
  const native30=gp30.main();
  const min28=Math.min(...Object.values(native28.references).map(x=>x.minTopOne));
  const min30=native30.minimumAcrossAllReferences;
  assert.ok(cyclic.maximum.bound<min28);
  assert.ok(sorted.maximum.bound<min28);
  assert.ok(space.maximum.bound<min30);

  return {
    classification:"Exhaustive original-key-independent exclusion for every nonzero book-cyclic two-tap shift in the declared stationary grid architectures",
    gp28:{
      modes:{cyclic,sorted},
      minimumMostFrequentNativeSourceRune:min28,
      zeroAcceptedGlobalShifts:true,
      allSecretKeys:"Every fixed 28-position rectangular alphabet and both original GP28 rank conventions",
      originalSourceNativeControlRecovered:native28.controls.sourceNativeHiddenKey.sourceNativeRecovered
    },
    gp30:{
      allBookShifts:space,
      minimumMostFrequentNativeSourceToken:min30,
      zeroAcceptedGlobalShifts:true,
      allSecretKeys:"Every fixed 5x6 secret permutation of all 29 GP rune symbols and literal word space",
      originalSourceNativeControlRecovered:native30.hiddenKeyPositive.plaintextRecovered
    },
    originalRangedShiftsTested:cyclic.shifts+sorted.shifts+space.shifts,
    limits:"Cyclic whole-book fixed coordinate shift only; separate finite page/section-reset clock evidence belongs to both companion scripts. Dynamic keys, arbitrary position routing, extra taps and non-GP intermediates remain open."
  };
}

if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={allGP28,allGP30,main};

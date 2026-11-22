'use strict';

/**
 * Near-table H2 blind-clock sensitivity and alternating tableau refinement.
 *
 * Original-shaped SYNTHETIC GP29 ciphertext, no unknown LP2 plaintext.
 * Each test withholds the exact key-row clock and supplies an intentionally
 * damaged secret 29x29 inverse tableau, with independently frozen errors.
 *
 * Windows Node.js 22 CommonJS, read-only, no third-party dependencies.
 */
const assert = require('node:assert/strict');
const {
  inferClock, gpWord, clock, source, training, rng, permutation, inverseTable
} = require('./lp2_h2_hiddenclock_known_table_viterbi_sft.cjs');
const {languageModel,recoverTableau} = require('./gp29_bigram_tableau_decoder.cjs');

const N=29,LENGTH=12956;
const lm=languageModel(training);
const sites=[
  [1107,'DONT'],[5136,'ITS'],[8513,'HES'],[10086,'CANT']
];

/**
 * @param {Uint8Array} skips
 * @returns {number[]}
 */
function rowHistory(skips) {
  let ptr=0;
  return Array.from(skips,s=>{
    ptr+=s;
    const row=clock[ptr];
    ptr++;
    return row;
  });
}

/**
 * @param {number[][]} candidate
 * @param {number[][]} trueInverse
 */
function cellAccuracy(candidate,trueInverse) {
  let hits=0;
  for(let r=0;r<N;r++)for(let c=0;c<N;c++)
    hits+=Number(candidate[r][c]===trueInverse[r][c]);
  return hits;
}

/**
 * Introduce one independent GP29 ciphertext-label transposition per secret
 * row, without exposing either the labels or the corrected cells to solver.
 * @param {number[][]} inverse
 * @param {{int:(n:number)=>number}} random
 * @param {number} swaps
 */
function damagedTable(inverse,random,swaps) {
  const estimate=inverse.map(row=>row.slice());
  for(let r=0;r<N;r++)for(let k=0;k<swaps;k++) {
    const c=random.int(N);
    const other=(c+1+random.int(N-1))%N;
    [estimate[r][c],estimate[r][other]]=
      [estimate[r][other],estimate[r][c]];
  }
  return estimate;
}

/**
 * @param {Uint8Array} predicted
 * @param {number[]} actual
 */
function equalCount(predicted,actual) {
  let hits=0;
  for(let i=0;i<predicted.length;i++)hits+=Number(predicted[i]===actual[i]);
  return hits;
}

const outputs=[];
for(let trial=0;trial<2;trial++) {
  const random=rng((0x3301abcd+trial*1013904223)>>>0);
  const start=random.int(source.length-LENGTH);
  const truth=source.slice(start,start+LENGTH);
  for(const [at,word] of sites) {
    const runes=gpWord(word);
    truth.splice(at,runes.length,...runes);
  }
  assert.equal(truth.length,LENGTH);
  const secret=Array.from({length:N},()=>permutation(random));
  const correctInverse=inverseTable(secret);
  let ptr=0,prior=-1;
  const ciphertext=new Uint8Array(LENGTH);
  const hiddenSkips=new Uint8Array(LENGTH);
  const hiddenRows=new Array(LENGTH);
  for(let i=0;i<LENGTH;i++) {
    let c=secret[clock[ptr]][truth[i]],s=0;
    while(c===prior&&random.uniform()<.81) {
      ptr++;s++;c=secret[clock[ptr]][truth[i]];
    }
    ciphertext[i]=c;
    hiddenSkips[i]=s;
    hiddenRows[i]=clock[ptr];
    prior=c;ptr++;
  }
  const estimated=damagedTable(correctInverse,rng(0x44556677+trial),1);
  const initialCells=cellAccuracy(estimated,correctInverse);
  assert.equal(initialCells,783, 'exactly 58 damaged inverse-table entries');
  const noSkip=Array.from(ciphertext,(c,i)=>estimated[clock[i]][c]);
  const first=inferClock(ciphertext,estimated,{mismatchPenalty:5.25});
  const firstRows=rowHistory(first.skips);
  const rowHits=equalCount(firstRows,hiddenRows);
  const tableReestimate=recoverTableau(
    Array.from(ciphertext),firstRows,lm,{sweeps:12}
  );
  const improved=tableReestimate.inverseTableau;
  const refined=inferClock(ciphertext,improved,{mismatchPenalty:5.25});
  const refineRows=rowHistory(refined.skips);
  outputs.push({
    trial,start,
    damagedTableCorrectCellsOf841:initialCells,
    seedBlindNoSkipPlaintextCorrect:equalCount(noSkip,truth),
    firstSoftViterbiPlaintextCorrect:equalCount(first.plaintext,truth),
    firstSoftViterbiSkipCountsCorrect:equalCount(first.skips,hiddenSkips),
    firstSoftViterbiRowLabelsCorrect:rowHits,
    reestimatedTableCorrectCellsOf841:cellAccuracy(improved,correctInverse),
    reestimatedTablePlaintextCorrect:equalCount(tableReestimate.plaintext,truth),
    refinedSoftViterbiPlaintextCorrect:equalCount(refined.plaintext,truth),
    refinedSoftViterbiSkipCountsCorrect:equalCount(refined.skips,hiddenSkips),
    refinedRowLabelsCorrect:equalCount(refineRows,hiddenRows),
    trueSkipAdvances:hiddenSkips.reduce((n,x)=>n+x,0),
    estimatedSkipAdvances:refined.skips.reduce((n,x)=>n+x,0),
    softPenalty:5.25,
    firstViterbiMaxStates:first.maxStates,
    refinedViterbiMaxStates:refined.maxStates
  });
}
console.log(JSON.stringify({
  classification:'synthetic near-table blind-clock alternating decoder; NOT original LP2 plaintext',
  oracle:'783/841 exact unknown substitution inverse cells given (one rowwise swap; 58 deliberately corrupted)',
  missing:'all source plaintext, entire real key-row pointer/skip path, 58 table cells',
  independentTraining:'217106 source-external Shakespeare GP29 runes',
  score:'Shakespeare bigrams + exact collision constraints softened by frozen 5.25 log penalty per disagreement',
  hardModel:'29 independent random GP29 substitutions, public prime totient clock, q=.81 repeats',
  results:outputs
},null,2));

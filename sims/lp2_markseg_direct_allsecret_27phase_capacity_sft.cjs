'use strict';

/**
 * Original LP2 mark-local DIRECT GP29 substitution secret-capacity gate.
 * Any unknown alphabet bijection is allowed independently for every
 * (authentic mark interval, local phase) state. No secret keys are guessed.
 *
 * SFT: node sims/lp2_markseg_direct_allsecret_27phase_capacity_sft.cjs
 * Node.js 22 CommonJS, original p0..p55 images' indexed GP and punctuation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  originalIntervals, minimumNativeWindow
} = require('./lp2_markseg_differential_allsecret_phase_capacity_sft.cjs');
const {encodeWords} = require('./lp2_difference_allletter_capacity_sft.cjs');

const Q = 29;
const N = 12956;
const mod = (x, m) => ((x % m) + m) % m;

/**
 * Maximize all GP29 coincident plaintext pairs over independent unknown
 * alphabet permutations per (mark interval, local phase) state.
 * Sorting the 29 counts in each state and aligning equal ranks gives the
 * exact maximum by the rearrangement inequality.
 * @param {{start:number,end:number,symbols:number[]}[]} intervals
 * @param {number} period
 */
function secretDirectCapacity(intervals, period) {
  assert.ok(Number.isInteger(period) && period >= 1);
  const pooled = Array(Q).fill(0);
  let states = 0, covered = 0;
  for (const interval of intervals) {
    const hist = Array.from({length:period},()=>Array(Q).fill(0));
    for (let i=0;i<interval.symbols.length;i++) {
      hist[i%period][interval.symbols[i]]++;
      covered++;
    }
    for (const counts of hist) {
      counts.sort((a,b)=>b-a);
      counts.forEach((v,j)=>{pooled[j]+=v;});
      states++;
    }
  }
  assert.equal(covered, N);
  const orderedPairs=pooled.reduce((total,count)=>total+count*(count-1),0);
  return {period,states,orderedPairs,
    normalizedIoC:Q*orderedPairs/(N*(N-1))};
}

/**
 * Direct substitution positive plant with the same original mark boundaries
 * and a secret affine GP29 alphabet for every interval and local phase.
 * @param {{start:number,end:number,symbols:number[]}[]} intervals
 * @param {number[]} plaintext
 * @param {number} period
 */
function nativePlant(intervals, plaintext, period) {
  assert.equal(plaintext.length,N);
  const encrypted=[],decoded=[];
  for (let segment=0;segment<intervals.length;segment++) {
    const interval=intervals[segment];
    const source=plaintext.slice(interval.start,interval.end);
    for (let i=0;i<source.length;i++) {
      const shift=mod(13*segment+5*(i%period),Q);
      const cipher=mod(7*source[i]+shift,Q);
      const plain=mod(25*(cipher-shift),Q);
      assert.equal(plain,source[i]);
      assert.equal(mod(7*plain+shift,Q),cipher);
      encrypted.push(cipher);
      decoded.push(plain);
    }
  }
  assert.deepEqual(decoded,plaintext);
  assert.equal(encrypted.length,N);
  const constructed=intervals.map(s=>({...s,symbols:encrypted.slice(s.start,s.end)}));
  const bound=secretDirectCapacity(constructed,period);
  const counts=Array(Q).fill(0);
  plaintext.forEach(x=>counts[x]++);
  const nativePairs=counts.reduce((total,n)=>total+n*(n-1),0);
  assert.ok(bound.orderedPairs>=nativePairs);
  return {period,nativePairs,maxSecretPairs:bound.orderedPairs,exactRecovery:true};
}

function main() {
  const intervals=originalIntervals();
  const ROOT=path.join(__dirname,'..');
  const refs=[
    ['Gibran','resources/control/gibran_prophet_58585.txt',9993046],
    ['Emerson','resources/control/emerson_essays_2944.txt',10262872],
    ['Shakespeare','resources/control/shakespeare_first300k.txt',9704196]
  ];
  const native=refs.map(([name,filename,expected])=>{
    const runes=encodeWords(fs.readFileSync(path.join(ROOT,filename),'utf8')).flat();
    const min=minimumNativeWindow(runes);
    assert.equal(min.orderedPairs,expected);
    return {name,min,runes};
  });
  const floor=Math.min(...native.map(x=>x.min.normalizedIoC));
  const bounds=Array.from({length:29},(_,i)=>secretDirectCapacity(intervals,i+1));
  assert.deepEqual(
    [bounds[0].orderedPairs,bounds[12].orderedPairs,bounds[24].orderedPairs,
     bounds[26].orderedPairs,bounds[27].orderedPairs,bounds[28].orderedPairs],
    [5936930,7848116,9481178,9654346,9825216,10030126]);
  assert.ok(bounds.slice(0,27).every(x=>x.normalizedIoC<floor));
  assert.ok(bounds[27].normalizedIoC>=floor);
  const plant=nativePlant(intervals,native[0].runes.slice(0,N),27);
  const result={
    source:'canonical original LP2 physical pages p0..p55',
    originalRunes:N,
    markEvents:31,markIntervals:intervals.length,
    nonemptyIntervals:intervals.filter(x=>x.symbols.length>0).length,
    decoder:'arbitrary SECRET direct GP29 bijection for each (mark interval, local rune phase) state',
    smallestNotExcludedPeriod:28,
    excludedPeriods:'1..27 inclusive under the pinned native GP English coincidence floor',
    nativeEnglishControls:native.map(x=>({name:x.name,...x.min})),
    nativeMinimumNormalizedIoC:floor,
    originalBounds:bounds,
    nativePositiveControl:plant,
    originalUnknownPlaintextRecovered:false
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}

if (require.main===module) main();
module.exports={secretDirectCapacity,nativePlant,main};

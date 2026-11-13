'use strict';

/**
 * Exact historical plaintext-F bypass feasibility of eight p15 source keys.
 * Every ciphertext F is exhaustively permitted to mean literal plaintext F
 * (no key consumed) or a key-consuming non-F whose ciphertext is F.
 * This DP never uses English scores, guessed plaintext or a fixed F mask.
 *
 * Run: node sims/lp2_p15_ftransparent_allphase_feasibility_sft.cjs
 * Node.js 20+, CommonJS, read-only local inputs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname,'..');
/** @param {string} f @returns {string} */
const read = f => fs.readFileSync(path.join(root,f),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.slice(16,23).map(p => p.indices);
assert.deepEqual(pages.map(p=>p.length),[267,273,260,271,269,273,131]);
const ciphertext = pages.flat();
assert.equal(ciphertext.length,1744);
assert.equal(ciphertext.filter(c=>c===0).length,65);
/** @param {number} x @returns {number} */
const mod29 = x => ((x%29)+29)%29;
/** @param {number} amount @returns {number[]} */
function firstPrimes(amount) {
  const primes=[];
  for (let p=2;primes.length<amount;p++) {
    let prime=true;
    for (let d=2;d*d<=p;d++) if (p%d===0) {prime=false;break;}
    if (prime)primes.push(p);
  }
  return primes;
}
/** @param {number} n @returns {number[]} */
function base29(n) {
  const digits=[];
  do {digits.unshift(n%29);n=Math.floor(n/29);} while(n>0);
  return digits;
}
const fibonacci = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const primeTable = firstPrimes(2800);
const primes = fibonacci.map(n=>primeTable[n]);
const printed = primes.map(p=>Math.abs(3301-p));
assert.deepEqual(printed,
  [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);
assert.deepEqual(base29(3301),[3,26,24]);
const keys=[
  ['printed16',printed],
  ['prime16',primes],
  ['totient16',primes.map(n=>n-1)],
  ['fibonacci16',fibonacci],
  ['ordinal16',fibonacci.map(n=>n+1)],
  ['printedBase29',printed.flatMap(base29)],
  ['primeBase29',primes.flatMap(base29)],
  ['seedBase29',base29(3301)]
].map(([name,values])=>({name, key:values.map(mod29)}));
assert.deepEqual(keys.map(p=>p.key.length),[16,16,16,16,16,47,30,3]);

/**
 * Complete exact-state feasibility for the historically solved Cicada rule:
 * P=F -> C=F and consume no key;
 * P != F -> C=(P+shift(consumed)) mod29 and consume one key.
 *
 * The only state needed is the total number of key symbols consumed.
 * Equal states are merged without discarding any viable plaintext path.
 * @param {number[]} data
 * @param {(consumed:number)=>number} shift
 * @returns {{possible:boolean,firstFailure:number,terminal:number,peak:number}}
 */
function feasible(data,shift) {
  let states=new Set([0]);
  let peak=1;
  for(let i=0;i<data.length;i++) {
    const next=new Set();
    for(const used of states) {
      if(data[i]===0)next.add(used); // genuine plaintext F bypass
      if(mod29(data[i]-shift(used))!==0)
        next.add(used+1); // normal branch must never decode to plaintext F
    }
    if(next.size===0)
      return {possible:false,firstFailure:i,terminal:0,peak};
    peak=Math.max(peak,next.size);
    states=next;
  }
  return {possible:true,firstFailure:-1,terminal:states.size,peak};
}
/** @param {number[]} plaintext @param {(used:number)=>number} shift */
function encrypt(plaintext,shift) {
  let used=0;
  return plaintext.map(x=>x===0?0:mod29(x+shift(used++)));
}
// Authentic solved original p56 key is phi(p_n)=p_n-1. The source has five
// independently feasible final clocks; known p56 plaintext selects one.
const p56 = corpus.pages[56].indices;
assert.equal(p56.length,85);
const first90=firstPrimes(90);
const known56=feasible(p56,k=>first90[k]-1);
assert.equal(known56.possible,true);
assert.equal(known56.terminal,5);

// A genuine source-native English plant for all 320 candidate shifts and
// source-length layout, with authentic F transparency and exact re-encryption.
const native=encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt')).slice(0,1744);
assert.equal(native.length,1744);
assert.ok(native.filter(v=>v===0).length>10);
let planted=0;
const results=[];
for(const {name,key} of keys) {
  let validWhole=0,validFixedReset=0,bestPrefix=0;
  const pageChoices=pages.map(()=>0);
  const variants=[];
  for(const sign of [-1,+1]) for(let phase=0;phase<key.length;phase++) {
    const shift = used => mod29(sign*key[(used+phase)%key.length]);
    const whole=feasible(ciphertext,shift);
    const perPage=pages.map(p=>feasible(p,shift));
    bestPrefix=Math.max(bestPrefix,whole.firstFailure<0?ciphertext.length:whole.firstFailure);
    validWhole+=Number(whole.possible);
    validFixedReset+=Number(perPage.every(x=>x.possible));
    perPage.forEach((r,i)=>pageChoices[i]+=Number(r.possible));
    variants.push({sign,phase,whole,perPage});

    const encrypted=encrypt(native,shift);
    const inverse=feasible(encrypted,shift);
    assert.ok(inverse.possible,'true F-transparent source plant must have valid path');
    // Every true original plain F remains ciphertext F, and the entire
    // unmodified source plaintext strictly forward-replays.
    let used=0;
    assert.deepEqual(encrypted,native.map(p=>p===0?0:mod29(p+shift(used++))));
    planted++;
  }
  assert.equal(validWhole,0,'a direct original LP2 solution would invalidate this negative');
  assert.equal(validFixedReset,0);
  assert.ok(pageChoices.some(count=>count===0),
    'independent page phases must also be unable to rescue this key');
  results.push({
    key:name,period:key.length,candidateSignsAndPhases:variants.length,
    validContinuous:validWhole,validFixedPageReset:validFixedReset,
    validIndependentPhasePerPage:pageChoices,
    maximumContinuousPrefixBeforeContradiction:bestPrefix
  });
}
assert.equal(planted,320);
assert.deepEqual(results.map(r=>r.validIndependentPhasePerPage),[
  [1,0,0,0,0,1,6],
  [0,0,0,0,1,0,2],
  [0,1,1,0,0,0,3],
  [0,0,1,3,0,0,1],
  [0,0,0,5,0,0,4],
  [1,0,0,0,0,0,10],
  [0,0,2,0,0,0,6],
  [0,0,0,0,0,0,1]
]);
assert.deepEqual(results.map(r=>r.maximumContinuousPrefixBeforeContradiction),
  [272,145,187,186,161,403,176,13]);
/*
 * Independent p15 -> sixteen floral-bordered pages (physical pp40-55).
 * Source-authentic p56 prime-totient consumer, but the beginning prime
 * rank of each page is one of the sixteen p15 distinct-Fibonacci ordinals.
 * Every page is allowed all sixteen starts AND an independent sign; this
 * dominates all sixteen! unknown source-start page assignments.
 */
const floral = corpus.pages.slice(40,56).map(p=>p.indices);
assert.deepEqual(floral.map(p=>p.length),
  [231,273,272,274,273,270,270,274,271,66,0,92,263,179,232,76]);
assert.equal(floral.flat().length,3316);
const floralNative=encodeSourceNativeGP(
  read('resources/control/gibran_prophet_58585.txt')).slice(1744,5060);
assert.equal(floralNative.length,3316);
const starts=fibonacci.map(v=>v+1);
assert.deepEqual(starts,[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]);
const expectedFloralOptions=[0,1,0,5,0,0,1,0,0,4,32,6,2,2,0,6];
const floralReport=[];
let floraOffset=0,floraPositive=0,originalAssignmentPossible=0;
for(let page=0;page<floral.length;page++) {
  const original=floral[page];
  const nativePage=floralNative.slice(floraOffset,floraOffset+original.length);
  floraOffset+=original.length;
  let viable=0,maxPrefix=0;
  for(const sign of [-1,+1]) for(const start of starts) {
    const shift=used=>mod29(sign*(primeTable[start-1+used]-1));
    const test=feasible(original,shift);
    viable+=Number(test.possible);
    maxPrefix=Math.max(maxPrefix,test.possible?original.length:test.firstFailure);
    const plantedPage=encrypt(nativePage,shift);
    assert.ok(feasible(plantedPage,shift).possible,
      'source-native F-transparent prime-totient stream must invert');
    floraPositive++;
  }
  assert.equal(viable,expectedFloralOptions[page],
    'original page must match frozen all-start feasibility count');
  const selected = feasible(original,
    used=>mod29(primeTable[starts[page]-1+used]-1));
  originalAssignmentPossible+=Number(selected.possible);
  floralReport.push({
    physicalPage:40+page,runes:original.length,
    possibleOf32IndependentStartsAndSigns:viable,
    longestFeasiblePrefix:maxPrefix,
    originalClockwiseStartPossible:selected.possible
  });
}
assert.equal(floraOffset,3316);
assert.equal(floraPositive,512);
assert.equal(originalAssignmentPossible,3);
const impossibleFloralPages=floralReport.filter(x=>
  x.runes>0 && x.possibleOf32IndependentStartsAndSigns===0).map(x=>x.physicalPage);
assert.deepEqual(impossibleFloralPages,[40,42,44,45,47,48,54]);

/*
 * All affine distortions of the five independent 16-value p15 source lists:
 * K[j]=(a*S[j]+b) mod29. By exhaustive enumeration this includes
 * EVERY Caesar addition, reflection, sign and nonzero multiplicative
 * rescaling of the original source-value key, for every cyclic phase.
 * A zero-slope zero-offset key is the vacuous identity C=P; it survives
 * but cannot be a plaintext decryption of the source ciphertext.
 * Exhaustive DP still accounts for every genuine historical F skip mask.
 */
const affineSources=[
  ['printed16',printed],
  ['prime16',primes],
  ['totient16',primes.map(p=>p-1)],
  ['fibonacci16',fibonacci],
  ['ordinal16',fibonacci.map(p=>p+1)]
];
const affinePrefixExpected=[634,617,617,617,617];
const affineReport=[];
let affineConfigurations=0,affineSurvivors=0,affinePlantCount=0;
for(let si=0;si<affineSources.length;si++) {
  const [name,sourceValues]=affineSources[si];
  let survivors=0,longestImpossiblePrefix=-1;
  for(let a=0;a<29;a++) for(let b=0;b<29;b++) {
    const key=sourceValues.map(x=>mod29(a*x+b));
    for(let phase=0;phase<16;phase++) {
      const shift=used=>key[(used+phase)%16];
      const result=feasible(ciphertext,shift);
      affineConfigurations++;
      if(result.possible) {
        survivors++;
        assert.equal(a,0,'any surviving nontrivial source scaling is a new cipher lead');
        assert.equal(b,0,'any surviving nonzero affine offset is a new cipher lead');
      } else {
        longestImpossiblePrefix=Math.max(longestImpossiblePrefix,result.firstFailure);
      }
    }
    // Independent positive planted source-native recovery for a real
    // nontrivial member from each 16-value family.
    if(a===7 && b===11) {
      const shift=used=>key[(used+3)%16];
      const encoded=encrypt(native,shift);
      assert.ok(feasible(encoded,shift).possible);
      affinePlantCount++;
    }
  }
  assert.equal(survivors,16);
  assert.equal(longestImpossiblePrefix,affinePrefixExpected[si]);
  affineSurvivors+=survivors;
  affineReport.push({
    sourceKey:name,affineScales:29,affineOffsets:29,phases:16,
    tested:13456,surviving:survivors,
    survivingKeys:'only a=0,b=0 with any of 16 redundant phases',
    maximumNontrivialFeasiblePrefix:longestImpossiblePrefix
  });
}
assert.equal(affineConfigurations,67280);
assert.equal(affineSurvivors,80);
assert.equal(affinePlantCount,5);

/*
 * The same source-selected p15 prime ordinals can initialize the genuine
 * solved-p56 unbounded prime-totient stream on the immediately following
 * pp16-22 chapter. This is independent of repeating the sixteen numeric
 * key values. It exhausts every source start and both signs with genuine
 * plaintext-F handling and no English/plaintext oracle.
 */
const followingChapterStarts=[];
const followingPageOptions=pages.map(()=>0);
const followingPageBestPrefix=pages.map(()=>0);
let maxContinuousPrefix=0,followingValidWhole=0,followingValidFixedResets=0;
let followingPlants=0;
for(const start of starts) for(const sign of [-1,+1]) {
  const shift=used=>mod29(sign*(primeTable[start-1+used]-1));
  const whole=feasible(ciphertext,shift);
  const perPage=pages.map(page=>feasible(page,shift));
  followingValidWhole+=Number(whole.possible);
  followingValidFixedResets+=Number(perPage.every(z=>z.possible));
  maxContinuousPrefix=Math.max(maxContinuousPrefix,
    whole.possible?ciphertext.length:whole.firstFailure);
  perPage.forEach((z,i)=>{
    followingPageOptions[i]+=Number(z.possible);
    followingPageBestPrefix[i]=Math.max(followingPageBestPrefix[i],
      z.possible?pages[i].length:z.firstFailure);
  });
  const planted=encrypt(native,shift);
  assert.ok(feasible(planted,shift).possible,
    'true historical F bypass must always accept the source-native nonperiodic plant');
  followingPlants++;
  followingChapterStarts.push({start,sign,whole:whole.possible});
}
assert.equal(followingPlants,32);
assert.equal(followingValidWhole,0);
assert.equal(followingValidFixedResets,0);
assert.equal(maxContinuousPrefix,90);
assert.deepEqual(followingPageOptions,[0,0,0,0,0,0,1]);
assert.deepEqual(followingPageBestPrefix,[90,146,218,145,202,172,131]);

console.log(JSON.stringify({
  method:'Exact all-F-mask GF29 feasibility, literal plaintext-F bypass',
  authenticSolvedP56:{runes:85,...known56},
  unknownOriginal:{physicalPages:'16-22',runes:1744,ciphertextF:65},
  eightSourceDerivedKeys:results,totalOriginalVariants:planted,
  affineAllSecret:{tested:affineConfigurations,survivingDegenerateZeroKeys:affineSurvivors,
    excludedNontrivialConfigurations:affineConfigurations-affineSurvivors,
    families:affineReport,positiveNativeSourcePlants:affinePlantCount},
  immediatelyFollowingChapterPrimeTotient:{pages:'16-22',runes:ciphertext.length,
    originalContinuousOptions:followingValidWhole,
    originalFixedResetOptions:followingValidFixedResets,
    maxContinuousPrefix,allStartSignIndependentPageOptions:followingPageOptions,
    bestIndividualPagePrefixes:followingPageBestPrefix,
    positiveSourceNativePlants:followingPlants},
  positiveOriginalLengthFTransparentPlants:planted,
  floralPrimeTotient:{pages:'40-55',runes:3316,originalAssignmentPossible,
    allStartAllSignOriginalPages:floralReport,impossibleFloralPages,
    authenticFTransparentPositivePlants:floraPositive},
  result:'All 320 repeated-key variants impossible, and seven floral pages impossible under every one of 32 Fibonacci-prime start/sign variants. No unknown plaintext recovered.',
  caveat:'Does not reject different keys, nonperiodic streams, other cipher operations, or loss of historical plaintext-F rule.'
},null,2));

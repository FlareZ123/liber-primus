'use strict';

/**
 * LP2 p55 moth-linked native GP seven-word suffix crib:
 * test keyless plaintext/ciphertext feedback over 1..30-rune lags.
 *
 * SFT: node sims/lp2_p55_moth_p5_crib_autokey_lag30_sft.cjs
 * Requires Node.js 20+, no third-party packages. Does not prove the crib.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const {encodeSourceNativeGP: encode} =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const lp1 = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const printed = fs.readFileSync(
  path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8');
const page = corpus.pages.find(p => p.page === 55);
const C = page.indices, q = 30, start = 46;
const phrase = 'THE TOTIENT FUNCTION IS SACRED ALL THINGS';
assert(lp1.includes('THE TOTIENT FUNCTION IS SACRED'));
assert(lp1.includes('ALL THINGS SHOULD BE ENCRYPTED'));
const plaintextSuffix = encode(phrase);
assert.equal(C.length, 76);
assert.equal(plaintextSuffix.length, 30);
assert.deepEqual(plaintextSuffix, [
  2,18,16,3,16,10,18,9,16,0,1,9,5,16,27,9,
  10,15,15,24,5,4,18,23,24,20,20,2,21,15
]);
const pageText = printed.split(/\n%\n/)[54].replace(/\/\n/g, '').replace(/\n/g, '');
const runeWords = pageText.match(new RegExp('['+corpus.runes.join('')+']+', 'gu')) || [];
assert.equal(runeWords[0], 'ᛝ');
assert.deepEqual(runeWords.slice(1).map(word => word.length),
  [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(runeWords.join('').split('').map(r => corpus.runes.indexOf(r)), C);
assert.deepEqual(phrase.split(' ').map(word => encode(word).length),
  runeWords.slice(-7).map(word => word.length));

const mod = value => ((value % 29) + 29) % 29;
const modes = [
  {name: 'C=P_i+P_i-lag', combine: (now, past) => mod(now+past),
    recoverPast: (now, cipher) => mod(cipher-now)},
  {name: 'C=P_i-P_i-lag', combine: (now, past) => mod(now-past),
    recoverPast: (now, cipher) => mod(now-cipher)},
  {name: 'C=P_i-lag-P_i', combine: (now, past) => mod(past-now),
    recoverPast: (now, cipher) => mod(cipher+now)}
];
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const frequency = Array(29).fill(0);
  for (const value of values) frequency[value]++;
  return frequency.reduce((sum, n) => sum+n*(n-1), 0) /
    (values.length*(values.length-1));
}
/**
 * For any lag up to 29, two plaintext symbols in the frozen suffix
 * determine the original output; no unknown key or seed can affect it.
 * @param {number} lag @param {typeof modes[number]} mode
 */
function suffixMismatches(lag, mode) {
  const misses = [];
  for (let i=start+lag;i<C.length;i++) {
    const predicted = mode.combine(plaintextSuffix[i-start], plaintextSuffix[i-start-lag]);
    if (predicted!==C[i]) misses.push({local:i,expected:predicted,original:C[i]});
  }
  return misses;
}
/**
 * For lag exactly 30, the entire 30-rune suffix determines every earlier
 * plaintext rune by proceeding from right to left; no secret prefix remains.
 * @param {number[]} ciphertext
 * @param {number[]} tail
 * @param {typeof modes[number]} mode
 * @returns {number[]}
 */
function fromFinalKnownPlaintext(ciphertext, tail, mode) {
  assert.equal(ciphertext.length, 76);
  assert.equal(tail.length, q);
  const output = Array(ciphertext.length).fill(null);
  for (let i=0;i<q;i++)output[start+i]=tail[i];
  for (let i=ciphertext.length-1;i>=q;i--) {
    const known=output[i];
    assert(known!==null);
    output[i-q]=mode.recoverPast(known,ciphertext[i]);
  }
  assert(output.every(x=>Number.isInteger(x)&&x>=0&&x<29));
  for (let i=q;i<ciphertext.length;i++)
    assert.equal(mode.combine(output[i],output[i-q]),ciphertext[i]);
  return output;
}
const results=[];
for (const mode of modes) {
  const failures = Array.from({length:29}, (_, i) => {
    const lag = i+1, misses=suffixMismatches(lag,mode);
    return {lag, tests:q-lag, conflicts:misses.length,
      firstWitness:misses[0]||null};
  });
  assert(failures.every(test => test.conflicts>0));
  const lag25=failures.find(x=>x.lag===25);
  assert(lag25&&lag25.tests===5&&lag25.conflicts>=4);
  const decoded=fromFinalKnownPlaintext(C,plaintextSuffix,mode);
  const before=decoded.slice(0,start);
  const rendered=before.map(n=>corpus.translit[n]).join('');
  const independentlyChosenPlant=[
    ...encode('THE JOURNEY FROM THE DEEP WEB SHALL ALWAYS GUIDE THE WISE')
  ];
  // Keep the planted control precisely 76 rune values, independent of
  // the original source ciphertext and without seeking English matches.
  const plantPlain=Array.from({length:76},(_,i)=>
    independentlyChosenPlant[i%independentlyChosenPlant.length]);
  const plantCipher=plantPlain.slice();
  for (let i=q;i<76;i++)
    plantCipher[i]=mode.combine(plantPlain[i],plantPlain[i-q]);
  const reverse=fromFinalKnownPlaintext(plantCipher,plantPlain.slice(start),mode);
  assert.deepEqual(reverse,plantPlain);
  const wrongTail=plantPlain.slice(start).map((v,i)=>i===0?mod(v+1):v);
  const wrong=fromFinalKnownPlaintext(plantCipher,wrongTail,mode);
  assert(wrong.some((v,i)=>v!==plantPlain[i]));
  results.push({
    mode:mode.name,
    contradictedShortLags:failures.length,
    totalShortLagInputConflicts:failures.reduce((s,x)=>s+x.conflicts,0),
    lag25,
    lag30RecoveredUnknownPrefixIndices:before,
    lag30RecoveredUnknownPrefixGP:rendered,
    lag30UnknownPrefixIOC:ioc(before),
    lag30ExactOriginalReencryption:46,
    positiveNativePlantRecoveredRunes:76,
    wrongSuffixFails:true
  });
}

/*
 * Stronger all-secret affine feedback gate on the same fixed suffix.
 * Even if an unknown source-selected affine key (a,b,d) is granted for
 * every lag, none of the 29^3 settings can satisfy all original equations
 * when the suffix supplies >=4 independent ciphertext observations.
 * The original LP1 p5 square suggests lag 25; we include all lags 1..26
 * to remove parameter-choice objections rather than only three signs.
 * No phase or word-specific exception is granted.
 */
const affineResults = [];
for (let lag=1;lag<=26;lag++) {
  let best=30-lag, models=0, bestKey=null;
  for (let a=0;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++) {
    let errors=0;
    for(let i=lag;i<q;i++) {
      const y=mod(a*plaintextSuffix[i]+b*plaintextSuffix[i-lag]+d);
      if(y!==C[start+i])errors++;
    }
    if (errors<best) {
      best=errors;
      bestKey={a,b,d};
    }
    if (errors===0) models++;
  }
  assert.equal(models,0, 'full affine model should fail original at lag '+lag);
  affineResults.push({lag,sourceObservations:30-lag,
    minOriginalConflicts:best,closestAffineCoefficients:bestKey});
}
assert.equal(affineResults.length,26);
assert.equal(affineResults[24].minOriginalConflicts,2);
assert.equal(affineResults[25].minOriginalConflicts,1);

// Independent exact source-native 76-rune affine plant at square lag25.
const affineNative=encode('THE WISE SHALL SEE A NEW WAY THROUGH THE CIRCLE');
const affinePlain=Array.from({length:76},(_,i)=>affineNative[i%affineNative.length]);
const a=7,b=5,d=13,lag=25,inverse=25; // 7*25=175=1 (mod29)
assert.equal(mod(a*inverse),1);
const affineCipher=affinePlain.slice();
for(let i=lag;i<76;i++)
  affineCipher[i]=mod(a*affinePlain[i]+b*affinePlain[i-lag]+d);
const recovered=affinePlain.slice(0,lag);
for(let i=lag;i<76;i++)
  recovered.push(mod(inverse*(affineCipher[i]-b*recovered[i-lag]-d)));
assert.deepEqual(recovered,affinePlain);
const wrong=affinePlain.slice(0,lag);
for(let i=lag;i<76;i++)
  wrong.push(mod(inverse*(affineCipher[i]-(b+1)*wrong[i-lag]-d)));
assert(wrong.some((value,i)=>value!==affinePlain[i]));

console.log(JSON.stringify({
  source: 'LP1 p5 source-native GP29 last-seven-word p55 suffix hypothesis',
  original: 'LP2 physical p55 full76, last30 at local46',
  hypothesisProven:false,
  shortLagCases:87,
  shortLagCasePasses:0,
  unrestrictedAffineLagsWithAtLeastFourCribEquations:26,
  affineKeysCheckedPerLag:24389,
  affineZeroConflictCases:0,
  sourceSquareLag25Affine:affineResults[24],
  affineOriginal:affineResults,
  fullLengthAffineNativePlant:76,
  exactPlant:true,
  results,
  conclusion: 'Under this unproven crib, all keyless stationary lag1..29 feedback pairs fail exact original ciphertext; lag30 gives only nonlinguistic original-prefix reconstructions. No unknown authentic text or key.'
},null,2));

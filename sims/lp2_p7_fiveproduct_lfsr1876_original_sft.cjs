'use strict';
/**
 * P7 five original red words as GF29 LFSR coefficients; p8 Roman XIX = 19,
 * the one-based index of prime 67 in Gematria Primus. Compute the exact
 * generator order and independently test its additive pad on untouched LP2.
 *
 * Windows Node.js 22 single runnable file:
 *   node sims/lp2_p7_fiveproduct_lfsr1876_original_sft.cjs
 *
 * This is an algebraic route hypothesis and a key-independent exclusion
 * for one specific additive cipher, never a recovered LP2 plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const mod = n => ((n % 29) + 29) % 29;
const p7 = corpus.pages[7].indices;
const p8 = corpus.pages[8].indices;
const sourceWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11],
  [14, 28], [6, 28, 19]];
assert.deepEqual(p7.slice(-14), sourceWords.flat());
assert.deepEqual(ink.pages.find(p => p.page === 7).red_spans.map(s =>
  [s.start,s.length]), [[194,14]]);
const coeff = sourceWords.map(w => w.reduce((p, x) => mod(p*x), 1));
assert.deepEqual(coeff, [11,26,8,15,2]);
assert.equal(p8.slice(0,4).map(i => corpus.translit[i]).join(''), 'XIXM');
assert.equal(corpus.prime[18], 67, 'the 19th GP prime must be 67');
const product = (a,b) => {
  const z = Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    z[i+j]=mod(z[i+j]+a[i]*b[j]);
  return z;
};
const characteristic = [-coeff[4],-coeff[3],-coeff[2],
  -coeff[1],-coeff[0],1].map(mod);
const factored=product(product([9,1],[14,1]),[-6,-8,-5,1].map(mod));
assert.deepEqual(characteristic,factored,
  'source-defined characteristic polynomial factorization over GF29');
const pow29=(v,e)=>{let r=1;for(let j=0;j<e;j++)r=mod(r*v);return r;};
assert.equal(pow29(20,7),1);
assert.equal(pow29(15,28),1);
for(const p of [2,7])assert.notEqual(pow29(15,28/p),1);
/**
 * LFSR sequence with printed red-word products in lag1..5 order.
 * @param {number[]} seed exactly five mod29 symbols
 * @param {number} n requested output length
 */
function generate(seed,n){
  assert.equal(seed.length,5);
  const q=seed.slice();
  for(let t=5;t<n;t++)q.push(mod(coeff.reduce(
    (sum,c,j)=>sum+c*q[t-j-1],0)));
  return q.slice(0,n);
}
/** Verify the companion matrix is identity for the proposed period. */
function isIdentityAt(k){
  for(let b=0;b<5;b++){
    const seed=Array(5).fill(0);seed[b]=1;
    const x=generate(seed,k+5);
    for(let j=0;j<5;j++)if(x[k+j]!==seed[j])return false;
  }
  return true;
}
assert.ok(isIdentityAt(1876));
/** Specificity control: exhaust every word-product coefficient order. */
const alternatives=[];
function enumerateOrders(x,k=0){
 if(k===5){alternatives.push(x.slice());return;}
 for(let i=k;i<5;i++){
  [x[k],x[i]]=[x[i],x[k]];
  enumerateOrders(x,k+1);
  [x[k],x[i]]=[x[i],x[k]];
 }
}
enumerateOrders(coeff.slice());
assert.equal(alternatives.length,120);
function orderReturnsAt1876(w){
 for(let basis=0;basis<5;basis++){
  const state=Array(5).fill(0);state[basis]=1;
  for(let j=5;j<1881;j++)state.push(mod(w.reduce(
    (s,v,k)=>s+v*state[j-k-1],0)));
  for(let j=0;j<5;j++)if(state[1876+j]!==Number(j===basis))return false;
 }
 return true;
}
const eligiblePrintedOrders=alternatives.filter(orderReturnsAt1876);
assert.deepEqual(eligiblePrintedOrders,[
 [11,26,8,15,2],[26,8,11,15,2],
 [8,15,26,2,11],[15,11,2,8,26]
]);

for(const primeFactor of [2,7,67])
  assert.equal(isIdentityAt(1876/primeFactor),false,
    'LFSR order must contain '+primeFactor);
const seed=[23,2,5,2,19]; // source DH23 tuple; period independent of seed
const keystream=generate(seed,12956);
assert.deepEqual(keystream.slice(0,5),seed);
assert.ok(keystream.every((x,i)=>i<1876 || x===keystream[i-1876]));
const unknown=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const floral=corpus.pages.slice(40,54).flatMap(p=>p.indices);
assert.equal(unknown.length,12956);
assert.equal(floral.length,3008);
/** @param {number[]} x @param {number} lag */
function lagEqual(x,lag){
  let matches=0;
  for(let i=0;i+lag<x.length;i++)matches+=x[i]===x[i+lag]?1:0;
  return {n:x.length-lag,matches,rate:matches/(x.length-lag)};
}
const originalGlobal=lagEqual(unknown,1876);
const originalFloral=lagEqual(floral,1876);
/** @param {number[]} x */
const ciphertextDifferences=x=>x.slice(1).map((value,i)=>mod(value-x[i]));
const originalDifferenceGlobal=lagEqual(ciphertextDifferences(unknown),1876);
const originalDifferenceFloral=lagEqual(ciphertextDifferences(floral),1876);
assert.deepEqual([originalDifferenceGlobal.n,originalDifferenceGlobal.matches],[11079,389]);
assert.deepEqual([originalDifferenceFloral.n,originalDifferenceFloral.matches],[1131,41]);
/** Five-tap source-locked inverse of a ciphertext autoregressive feedback.
 * @param {number[]} cipher */
const fiveInnovation=cipher=>cipher.slice(5).map((c,i)=>mod(c-
  coeff.reduce((sum,a,j)=>sum+a*cipher[i+4-j],0)));
const originalInnovationGlobal=lagEqual(fiveInnovation(unknown),1876);
const originalInnovationFloral=lagEqual(fiveInnovation(floral),1876);
assert.deepEqual([originalInnovationGlobal.n,originalInnovationGlobal.matches],[11075,402]);
assert.deepEqual([originalInnovationFloral.n,originalInnovationFloral.matches],[1127,47]);
assert.deepEqual([originalGlobal.n,originalGlobal.matches],
  [11080,375]);
assert.deepEqual([originalFloral.n,originalFloral.matches],
  [1132,34]);
const native=encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt'));
assert.equal(native.length,62492);
assert.ok(native.length>43000+12956);
const nativeControl=(length,offset)=>{
  const plain=native.slice(offset,offset+length);
  const key=generate(seed,length);
  const encrypted=plain.map((x,i)=>mod(x+key[i]));
  const recovered=encrypted.map((x,i)=>mod(x-key[i]));
  assert.deepEqual(recovered,plain);
  const n=lagEqual(plain,1876),c=lagEqual(encrypted,1876);
  assert.deepEqual(c,n,'reused additive pad cancels exactly at lag 1876');
  return {offset,...n};
};
const nativeGlobal=[],nativeFloral=[];
for(let offset=0;offset<=40000;offset+=4000){
  nativeGlobal.push(nativeControl(unknown.length,offset));
  nativeFloral.push(nativeControl(floral.length,offset));
}
assert.ok(nativeGlobal.every(c=>c.matches>originalGlobal.matches),
  'all Gibran native controls must exceed original same-lag coincidences');
assert.ok(nativeFloral.every(c=>c.matches>originalFloral.matches),
  'all Gibran floral native controls must exceed original');
/**
 * The equality invariant is stronger than additive-pad cancellation:
 * ANY per-state permutation sigma_K shared at t and t+1876 preserves
 * cipher_i==cipher_(i+1876) iff plain_i==plain_(i+1876).
 * Plant an arbitrary nonadditive, GP29-bijective affine register for this.
 */
const firstNative=native.slice(0,unknown.length);
const bijectionAt=(p,k)=>mod((1+(k*7)%28)*p + k*11);
const affineEncoded=firstNative.map((p,i)=>bijectionAt(p,keystream[i]));
const affineDecoded=affineEncoded.map((v,i)=>{
  const k=keystream[i], a=1+(k*7)%28;
  return mod(pow29(a,27)*mod(v-k*11));
});
assert.deepEqual(affineDecoded,firstNative);
assert.deepEqual(lagEqual(affineEncoded,1876),lagEqual(firstNative,1876),
  'all-secret state-conditioned GP29 permutation preserves 1876-lag equality');
/**
 * Integrated differential family: C_i = C_(i-1) + sigma_(K_i)(P_i).
 * Previous ciphertext can change arbitrarily. Taking one ciphertext
 * difference removes it and restores the same repeated-state equality
 * invariant, for EVERY secret bijective sigma and 29^5 seed choices.
 */
const differentialCipher=[];
let previous=0;
for(let i=0;i<firstNative.length;i++){
  previous=mod(previous+bijectionAt(firstNative[i],keystream[i]));
  differentialCipher.push(previous);
}
const emittedDifferences=ciphertextDifferences([0,...differentialCipher]);
const differentialRecovered=emittedDifferences.map((delta,i)=>{
  const k=keystream[i], a=1+(k*7)%28;
  return mod(pow29(a,27)*mod(delta-k*11));
});
assert.deepEqual(differentialRecovered,firstNative);
assert.deepEqual(lagEqual(emittedDifferences,1876),lagEqual(firstNative,1876),
  'ciphertext first differences inherit the exact all-secret state equality invariant');
const nativeDifferenceGlobal=[],nativeDifferenceFloral=[];
for(let offset=0;offset<=40000;offset+=4000){
  nativeDifferenceGlobal.push(lagEqual(native.slice(
    offset+1,offset+unknown.length),1876));
  nativeDifferenceFloral.push(lagEqual(native.slice(
    offset+1,offset+floral.length),1876));
}
assert.ok(nativeDifferenceGlobal.every(x=>x.matches>originalDifferenceGlobal.matches));
assert.ok(nativeDifferenceFloral.every(x=>x.matches>originalDifferenceFloral.matches));
const nativeInnovationGlobal=[],nativeInnovationFloral=[];
for(let offset=0;offset<=40000;offset+=4000){
  nativeInnovationGlobal.push(lagEqual(native.slice(
    offset+5,offset+unknown.length),1876));
  nativeInnovationFloral.push(lagEqual(native.slice(
    offset+5,offset+floral.length),1876));
}
assert.ok(nativeInnovationGlobal.every(x=>x.matches>originalInnovationGlobal.matches));
assert.ok(nativeInnovationFloral.every(x=>x.matches>originalInnovationFloral.matches));
/**
 * Source-five-tap ciphertext-feedback plant:
 * C_i=Σ_j w_j*C_(i-j)+sigma_(K_i)(P_i) mod29.
 * It remains exactly reversible for EVERY secret 5-rune ciphertext IV.
 */
const innovationCipher=p7.slice(-5);
for(let i=5;i<firstNative.length;i++){
  const feedback=coeff.reduce((sum,a,j)=>sum+a*innovationCipher[i-1-j],0);
  innovationCipher.push(mod(feedback+bijectionAt(firstNative[i],keystream[i])));
}
const innovationEmitted=fiveInnovation(innovationCipher);
const innovationRecovered=innovationEmitted.map((delta,i)=>{
  const k=keystream[i+5], a=1+(k*7)%28;
  return mod(pow29(a,27)*mod(delta-k*11));
});
assert.deepEqual(innovationRecovered,firstNative.slice(5));
assert.deepEqual(lagEqual(innovationEmitted,1876),
  lagEqual(firstNative.slice(5),1876));
/** Disjoint native historical sources; exact data-derived gates, no threshold tuning. */
const additionalSources=[
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt'],
  ['Latin Vulgate','resources/control/latin-vulgate-latin26-wholewords.txt']
];
const additionalControls=additionalSources.map(([name,filename])=>{
  const text=encodeSourceNativeGP(read(filename));
  const sampleOffsets=Array.from({length:9},(_,i)=>
    Math.floor(i*(text.length-unknown.length)/8));
  const global=sampleOffsets.map(offset=>lagEqual(
    text.slice(offset,offset+unknown.length),1876));
  const floral=sampleOffsets.map(offset=>lagEqual(
    text.slice(offset,offset+3008),1876));
  const globalDifference=sampleOffsets.map(offset=>lagEqual(
    text.slice(offset+1,offset+unknown.length),1876));
  const floralDifference=sampleOffsets.map(offset=>lagEqual(
    text.slice(offset+1,offset+3008),1876));
  assert.ok(global.every(x=>x.matches>originalGlobal.matches));
  assert.ok(floral.every(x=>x.matches>originalFloral.matches));
  assert.ok(globalDifference.every(x=>x.matches>originalDifferenceGlobal.matches));
  assert.ok(floralDifference.every(x=>x.matches>originalDifferenceFloral.matches));
  const globalInnovation=sampleOffsets.map(offset=>lagEqual(
    text.slice(offset+5,offset+unknown.length),1876));
  const floralInnovation=sampleOffsets.map(offset=>lagEqual(
    text.slice(offset+5,offset+3008),1876));
  assert.ok(globalInnovation.every(x=>x.matches>originalInnovationGlobal.matches));
  assert.ok(floralInnovation.every(x=>x.matches>originalInnovationFloral.matches));
  return {name,calibratedRunes:text.length,
    sourceWindows:sampleOffsets.length,
    globalLag1876Same:global.map(x=>x.matches),
    floralLag1876Same:floral.map(x=>x.matches),
    globalLag1876DifferentialModelNativeTarget:globalDifference.map(x=>x.matches),
    floralLag1876DifferentialModelNativeTarget:floralDifference.map(x=>x.matches),
    globalLag1876FiveTapModelNativeTarget:globalInnovation.map(x=>x.matches),
    floralLag1876FiveTapModelNativeTarget:floralInnovation.map(x=>x.matches)};
});

assert.ok(nativeGlobal.every(c=>c.matches>originalGlobal.matches));
assert.ok(nativeFloral.every(c=>c.matches>originalFloral.matches));
const lag938=lagEqual(unknown,938);
console.log(JSON.stringify({
  source:'original p7 red five intact words, p8 red Roman XIX, original GP29',
  coefficients:coeff,
  characteristicPolynomial:'x^5-11x^4-26x^3-8x^2-15x-2 (mod29)',
  sourceFactorization:'(x+9)(x+14)(x^3-5x^2-8x-6) (mod29)',
  firstTwoRootOrders:[7,28],
  fullCompanionMatrixOrder:1876,
  allFiveWordCoefficientOrdersTested:120,
  ordersReturningAt1876:eligiblePrintedOrders,
  periodFactorization:'28*67',
  oneBasedNineteenthGPPrime:corpus.prime[18],
  assumptions:'unbroken mod29 additive stream, fixed fifth-order recurrence; lag1..lag5 coefficients in original printed word order, any secret five-symbol seed',
  untouchedOriginal:{
    global:originalGlobal,
    floralP40toP53:originalFloral,
    integratedDifferentialGlobal:originalDifferenceGlobal,
    integratedDifferentialFloralP40toP53:originalDifferenceFloral,
    fiveTapInnovationGlobal:originalInnovationGlobal,
    fiveTapInnovationFloralP40toP53:originalInnovationFloral,
    globalHalfPeriod:lag938
  },
  stateKeyedPermutationPlant:{
    family:'arbitrary state-keyed GF29-affine symbol bijection; independent multiplier and offset',
    plantedOriginalLength:affineDecoded.length,
    plaintextExactlyRecovered:true,
    sameLag1876:lagEqual(affineEncoded,1876)
  },
  integratedDifferentialPermutationPlant:{
    family:'C_i=C_(i-1)+secret_state_bijection(P_i) modulo29',
    originalLength:firstNative.length,
    exactPlaintextRecovery:JSON.stringify(differentialRecovered)===JSON.stringify(firstNative),
    repeatedPeriodEquality:lagEqual(emittedDifferences,1876)
  },
  fullFiveTapInnovationPlant:{
    family:'C_i=sum(w_j*C_(i-j))+secret_state_bijection(P_i) modulo29',
    originalLength:innovationCipher.length,
    firstFiveCipherIv:p7.slice(-5),
    exactPlaintextRecovery:innovationRecovered.length===firstNative.length-5,
    recoveredRemainder:innovationRecovered.length,
    repeatedPeriodEquality:lagEqual(innovationEmitted,1876)
  },
  additionalIndependentNativeSources:additionalControls,
  sourceNativeControls:{
    author:'Kahlil Gibran',
    calibratedRunes:native.length,
    independentlyEncryptedRecovered:true,
    global:nativeGlobal,
    floral:nativeFloral,
    integratedDifferentialNativeGlobal:nativeDifferenceGlobal,
    integratedDifferentialNativeFloral:nativeDifferenceFloral,
    fiveTapInnovationNativeGlobal:nativeInnovationGlobal,
    fiveTapInnovationNativeFloral:nativeInnovationFloral
  },
  result:'No shared 1876-period GP29 state-keyed bijection fits normal native-language plaintext for all 56 pages or the floral chapter in three original ciphertext receivers: direct, one-lag integrated difference, or source-fixed five-lag autoregressive feedback. All original lag1876 equality gates are seed-independent and immune to all secret per-state alphabet substitutions.',
  limitation:'Nonlinear feedback changing the key state, clock skips, independent per-page resets, non-GP alphabets, and additional layers remain possible. The 19th-prime correspondence does not prove creator intent.'
},null,2));

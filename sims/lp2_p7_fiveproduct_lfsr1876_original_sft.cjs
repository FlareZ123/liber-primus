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
assert.ok(nativeGlobal.every(c=>c.matches>=640),
  'authentic English controls should carry native-symbol lag coincidences');
assert.ok(nativeFloral.every(c=>c.matches>=50));
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
  periodFactorization:'28*67',
  oneBasedNineteenthGPPrime:corpus.prime[18],
  assumptions:'unbroken mod29 additive stream, fixed fifth-order recurrence; lag1..lag5 coefficients in original printed word order, any secret five-symbol seed',
  untouchedOriginal:{
    global:originalGlobal,
    floralP40toP53:originalFloral,
    globalHalfPeriod:lag938
  },
  sourceNativeControls:{
    author:'Kahlil Gibran',
    calibratedRunes:native.length,
    independentlyEncryptedRecovered:true,
    global:nativeGlobal,
    floral:nativeFloral
  },
  result:'No 1876-period, always-advancing additive GF29 pad generated from these five original coefficients yields source-native English plaintext on the entire original or p40-p53 original chapter. This conclusion is independent of all 29^5 possible seed states.',
  limitation:'Other output functions, differently advancing clocks, non-English registers and separate per-page seeds are not covered; the 19th-prime correspondence does not itself establish author intent.'
},null,2));

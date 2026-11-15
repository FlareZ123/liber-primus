'use strict';

/**
 * Complete *secret-coordinate-independent* Shamir necessary-condition test.
 *
 * For k shares y_j=f(x_j) in GF29, any secret f(x0) is a linear combination
 * with unknown Lagrange weights w_j, but the weights always sum to one.
 * Exhaust all 29^(k-1) possible weights for the original 3- and 5-share
 * source chapters. This over-approximates every choice of distinct x_j,
 * including hidden x0, without fitting a point to manuscript plaintext.
 * Run: node sims/lp2_prime_chapter_allsecret_shamir_weights_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} v */
function inverse(v) {
  for (let a = 1; a < 29; a++) if (mod(a * v) === 1) return a;
  throw new Error('no inverse');
}
/** General point interpolation weights, for positive source-native plants. */
function lagrange(xs, point) {
  const k = xs.length;
  const result = Array.from({length:k}, (_, j) => {
    let numerator = 1, denominator = 1;
    for (let m = 0; m < k; m++) {
      if (m === j) continue;
      numerator = mod(numerator * (point - xs[m]));
      denominator = mod(denominator * (xs[j] - xs[m]));
    }
    return mod(numerator * inverse(denominator));
  });
  assert.equal(mod(result.reduce((a,b) => a+b,0)),1);
  return result;
}
function ioc(stream) {
  const counts = new Uint16Array(29);
  for (const value of stream) counts[value]++;
  let pairCount = 0;
  for (const n of counts) pairCount += n*(n-1);
  return pairCount/(stream.length*(stream.length-1));
}
/**
 * @param {number[]} source
 * @param {number} k
 * @param {'contiguous'|'interleaved'} layout
 */
function shares(source,k,layout) {
  const n = source.length/k;
  assert.equal(n,Math.floor(n));
  return Array.from({length:k}, (_,j) => Uint8Array.from(
    {length:n},(_,t) => source[layout === 'contiguous' ? j*n+t : t*k+j]));
}
/** Evaluate a known w for the planted positive control. */
function apply(sh,w) {
  return Array.from({length:sh[0].length}, (_,t) =>
    mod(w.reduce((sum,z,j) => sum+z*sh[j][t],0)));
}
/**
 * Exhaust the full affine weight hyperplane sum(w)==1 without materializing
 * every candidate. Each candidate is evaluated on *all* original columns.
 * @param {Uint8Array[]} sh
 */
function exhaustiveMax(sh) {
  const k = sh.length;
  assert.ok(k===3 || k===5);
  const n = sh[0].length, hist = new Uint16Array(29);
  const base = sh[k-1];
  const delta = Array.from({length:k-1},(_,j) =>
    Array.from({length:29}, (_,a) => Uint8Array.from(
      {length:n},(_,t) => mod(a*(sh[j][t]-base[t])))));
  const limit = 29**(k-1);
  let maxPairs = -1, bestWeights = null, countAbove005 = 0;
  for(let index=0;index<limit;index++) {
    hist.fill(0);
    let q=index, weightSum=0;
    const w=[];
    for(let j=0;j<k-1;j++) {
      const v=q%29;
      q=(q-v)/29;
      w.push(v);
      weightSum+=v;
    }
    w.push(mod(1-weightSum));
    const z0=delta[0][w[0]],z1=delta[1][w[1]];
    if(k===3) {
      for(let t=0;t<n;t++) hist[(base[t]+z0[t]+z1[t])%29]++;
    } else {
      const z2=delta[2][w[2]],z3=delta[3][w[3]];
      for(let t=0;t<n;t++)
        hist[(base[t]+z0[t]+z1[t]+z2[t]+z3[t])%29]++;
    }
    let pairs=0;
    for(let i=0;i<29;i++) pairs += hist[i]*(hist[i]-1)/2;
    if(pairs>maxPairs) {
      maxPairs=pairs;
      bestWeights=w;
    }
    if(2*pairs/(n*(n-1))>=0.05)countAbove005++;
  }
  assert.equal(limit,k===3?841:707281);
  assert.ok(bestWeights!==null);
  assert.equal(mod(bestWeights.reduce((sum,z)=>sum+z,0)),1);
  return {tested:limit,highestIoC:2*maxPairs/(n*(n-1)),
    matchingPairs:maxPairs,bestWeights,countAtLeast005:countAbove005};
}
/** Synthesize a full random-coefficient Shamir threshold-k encoding. */
function nativePlant(plain,k,layout,xs) {
  const n=plain.length, source=Array(n*k).fill(0);
  for(let t=0;t<n;t++)for(let j=0;j<k;j++) {
    let value=plain[t],xp=1;
    for(let d=1;d<k;d++) {
      xp=mod(xp*xs[j]);
      value=mod(value+xp*mod(13+7*d+9*t));
    }
    source[layout==='contiguous'?j*n+t:t*k+j]=value;
  }
  return source;
}
const sections=[
  {first:0,last:2,k:3,n:243,abscissae:[3,11,17]},
  {first:3,last:7,k:5,n:229,abscissae:[3,7,11,17,23]}
];
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const results=[];
for(const {first,last,k,n,abscissae} of sections) {
  const original=corpus.pages.filter(p=>p.page>=first&&p.page<=last)
    .flatMap(p=>p.indices);
  assert.equal(original.length,k*n);
  for(const layout of ['contiguous','interleaved']) {
    const printed=shares(original,k,layout);
    const measured=exhaustiveMax(printed);
    const known=Array.from({length:n},(_,t)=>p57[t%p57.length]);
    const plant=nativePlant(known,k,layout,abscissae);
    const weights=lagrange(abscissae,0);
    assert.deepEqual(apply(shares(plant,k,layout),weights),known);
    assert.ok(measured.highestIoC<0.05);
    assert.equal(measured.countAtLeast005,0);
    assert.ok(ioc(known)>0.055);
    assert.ok(measured.highestIoC+0.01<ioc(known));
    results.push({chapter:'p'+first+'-p'+last,k,n,layout,...measured,
      plantedNativeIoC:ioc(known),plantWeights:weights,
      plantedRunesRecovered:n});
  }
}
assert.equal(results.length,4);
console.log(JSON.stringify({
  keyProperty:'sum of interpolation coefficients equals 1 modulo 29',
  originalStreamCandidatesTested:results.reduce((s,r)=>s+r.tested,0),
  originalStreamReadoutsAbove005:0,
  results
},null,2));

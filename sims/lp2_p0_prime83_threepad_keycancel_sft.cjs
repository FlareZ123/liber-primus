'use strict';

/**
 * Original p0 black-body 249=3*83 key-cancellation test.
 *
 * Upstream *hypothesis*: original p7's independently evidenced DH modulus23
 * points to the 23rd prime83, and p0's 13-dot delimiter separates exactly
 * 249 black runes = three aligned 83-rune lanes. If the lanes used the same
 * (unknown) GP29 additive pad without key skips, pairwise C differences
 * equal pairwise P differences. This is a key-independent necessary
 * condition; the source never commands the "23rd prime" conversion or
 * three-lane reading.
 *
 * One fixed row-major split, no key, phase, origin or word crib fitting.
 * Source-native GP29 English controls are LP1 known plaintext, held out from
 * the unigram model. Sampled controls are descriptive, not independent
 * formal p-values, because nearby LP1 windows overlap.
 *
 * Node.js22 CommonJS, Windows11, no dependencies or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = corpus.pages[0].indices;
assert.equal(source.length, 262);
const black = source.slice(13);
assert.equal(black.length, 249);

function nthPrime(n) {
  let candidate = 1, found = 0;
  while (found < n) {
    candidate++;
    let prime = true;
    for (let d = 2; d*d <= candidate; d++) {
      if (candidate % d === 0) { prime = false; break; }
    }
    if (prime) found++;
  }
  return candidate;
}
assert.equal(nthPrime(23), 83);
const L=83;
const mod29 = (n) => ((n % 29)+29)%29;
const alphabet = corpus.translit.map((token, index) => ({token,index}))
  .sort((a,b) => b.token.length-a.token.length);

/** @returns {number[]} */
function encodeLp1() {
  const plain = read('resources/liber-primus/lp1-plaintext-reference.txt')
    .replace(/^#.*$/gm, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .toUpperCase();
  const words = plain.match(/[A-Z]+/g) || [];
  const runes = [];
  for (let raw of words) {
    raw = raw.replace(/QU/g,'CW').replace(/K/g,'C')
      .replace(/V/g,'U').replace(/Z/g,'S');
    for (let i=0;i<raw.length;) {
      const hit = alphabet.find((item) => raw.startsWith(item.token,i));
      assert.ok(hit, 'unencodable solved plaintext: '+raw.slice(i));
      runes.push(hit.index);
      i+=hit.token.length;
    }
  }
  return runes;
}
const known = encodeLp1();
assert.ok(known.length > 3000);
const training = known.slice(0,Math.floor(known.length/2));
const heldout = known.slice(Math.floor(known.length/2));
assert.ok(heldout.length>=249);

const marginal = Array(29).fill(1);
for (const n of training) marginal[n]++;
const N = marginal.reduce((s,n)=>s+n,0);
const pm = marginal.map(n=>n/N);
const deltaModel = Array(29).fill(0);
for(let i=0;i<29;i++)
  for(let j=0;j<29;j++)
    deltaModel[mod29(i-j)]+=pm[i]*pm[j];
const weight = deltaModel.map(p=>Math.log(p*29));

/** @param {number[]} seq */
function score(seq) {
  assert.equal(seq.length,249);
  const lanes=[seq.slice(0,L),seq.slice(L,2*L),seq.slice(2*L,3*L)];
  const counts=Array(29).fill(0);
  const pairEquals=[];
  for(let i=0;i<3;i++)
    for(let j=i+1;j<3;j++){
      let equal=0;
      for(let k=0;k<L;k++){
        const d=mod29(lanes[i][k]-lanes[j][k]);
        counts[d]++;
        if(d===0)equal++;
      }
      pairEquals.push(equal);
    }
  const llr=counts.reduce((sum,n,i)=>sum+n*weight[i],0);
  return {llr,equal:counts[0],pairEquals};
}

/** Reproducible non-cryptographic native-plant/control generator. */
function rng(seed) {
  let x=seed>>>0;
  return ()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return x>>>0;
  };
}
const random = rng(0x3301f0aa);
/** @param {number[]} numbers */
const quantileRank=(numbers,n)=>numbers.filter(x=>x<=n).length/numbers.length;
const actual = score(black);
assert.deepEqual(actual.pairEquals,[5,4,5]);
assert.equal(actual.equal,14);

// 800 held-out source-native windows at independently fixed sampled positions.
// These are the actual score under three unknown plaintext strings, prior
// to encryption by a shared key. English windows preserve native correlations.
const native=[],uniform=[],planted=[],plantedFiltered=[];
let maxAdjust=0;
for(let t=0;t<800;t++){
  const at=random()%(heldout.length-249+1);
  const plain=heldout.slice(at,at+249);
  const pscore=score(plain);
  native.push(pscore.llr);
  const pnoise=Array.from({length:249},()=>random()%29);
  uniform.push(score(pnoise).llr);
  const pad=Array.from({length:83},()=>random()%29);
  const cipher=plain.map((v,i)=>mod29(v+pad[i%83]));
  // Check exact key cancellation for every pair of all 83 columns.
  const cb=score(cipher);
  assert.deepEqual(cb.pairEquals,pscore.pairEquals);
  assert.ok(Math.abs(cb.llr-pscore.llr)<1e-11);
  planted.push(cb.llr);
  let repairs=0;
  const filtered=cipher.slice();
  for(let i=1;i<filtered.length;i++){
    if(filtered[i]===filtered[i-1] && random()%100<81){
      filtered[i]=mod29(filtered[i]+1);
      repairs++;
    }
  }
  maxAdjust=Math.max(maxAdjust,repairs);
  plantedFiltered.push(score(filtered).llr);
}
const mean=(a)=>a.reduce((s,v)=>s+v,0)/a.length;
const sort=(a)=>[...a].sort((x,y)=>x-y);
const qs=(a)=>{const sorted=sort(a);return [0.05,0.5,0.95].map(p=>+sorted[Math.floor(p*(sorted.length-1))].toFixed(5));};
const summary={
  source:'LP2 original p0 black 249 runes = 3 × p_23 = 3×83',
  p7Premise:'DH23 interpreted as 23rd prime; unselected conditional human operation',
  original:{equal:actual.equal,pairEquals:actual.pairEquals,llr:+actual.llr.toFixed(5)},
  gpNativeModel:{training:training.length,heldout:heldout.length,alphabet:29},
  calibration:{
    native:{N:native.length,mean:+mean(native).toFixed(5),quantiles5_50_95:qs(native),rankOfOriginal:+quantileRank(native,actual.llr).toFixed(5)},
    independentUniform:{N:uniform.length,mean:+mean(uniform).toFixed(5),quantiles5_50_95:qs(uniform),rankOfOriginal:+quantileRank(uniform,actual.llr).toFixed(5)},
    sharedUnknown83Pad:{N:planted.length,mean:+mean(planted).toFixed(5),rankOfOriginal:+quantileRank(planted,actual.llr).toFixed(5)},
    sharedPadWithLocalAntidoublet:{N:plantedFiltered.length,mean:+mean(plantedFiltered).toFixed(5),rankOfOriginal:+quantileRank(plantedFiltered,actual.llr).toFixed(5),maxCorrectionsInOnePlant:maxAdjust}
  }
};
assert.ok(Number.isFinite(actual.llr));
assert.ok(planted.every((v,i)=>Math.abs(v-native[i])<1e-11));
console.log(JSON.stringify(summary,null,2));
console.log('PASS: key cancellation and true-shared-pad plants; original p0 body has no recovered plaintext');

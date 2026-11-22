'use strict';

/**
 * LP1 p05 explicitly prints MOBIUS; test its direct number-theoretic meaning
 * once on the source 121-rune p32 11x11 prime-canvas hypothesis.
 *
 * Two genuinely distinct, fixed divisor-zeta encoders and exact Möbius
 * inverses over GP29 ordinals: 1D for original 121-rune reading order; 2D
 * separable for the previously source-correlated 11x11 grid.
 *
 * No fitted prime/key, origin shift, sign, direction, rotor, ring reflow,
 * punctuation change or plaintext permutation. Both are reversible.
 *
 * Windows 11 / Node.js >=18, no dependencies:
 *   node sims/lp2_p32_mobius_divisor_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const R = corpus.pages[32].indices;
const prime = corpus.prime;
const roman = corpus.translit;
const SIZE = 11;
const MOD = 29;
const mod = n => ((n % MOD) + MOD) % MOD;
assert.equal(R.length, 121);
assert.equal(R.slice(0, SIZE).reduce((s,x)=>s+prime[x],0),563);
assert.equal(Array.from({length:SIZE},(_,i)=>prime[R[i*SIZE]])
  .reduce((s,x)=>s+x,0),569);

/** @param {number} n @returns {number} */
function mobius(n) {
  let factors=0;
  for(let p=2;p*p<=n;p++) {
    if(n%p) continue;
    n/=p;factors++;
    if(n%p===0) return 0;
    while(n%p===0) n/=p;
  }
  if(n>1) factors++;
  return factors%2?-1:1;
}

/** @param {number[]} input @returns {number[]} */
function oneForward(input) {
  return input.map((_,i)=>{
    const n=i+1;let s=0;
    for(let d=1;d<=n;d++) if(n%d===0) s+=input[d-1];
    return mod(s);
  });
}
/** @param {number[]} input @returns {number[]} */
function oneInverse(input) {
  return input.map((_,i)=>{
    const n=i+1;let s=0;
    for(let d=1;d<=n;d++) if(n%d===0) s+=mobius(n/d)*input[d-1];
    return mod(s);
  });
}

/**
 * @param {number[]} input 11x11 row-major original.
 * @returns {number[]}
 */
function gridForward(input) {
  assert.equal(input.length,SIZE*SIZE);
  return input.map((_,index)=>{
    const r=1+Math.floor(index/SIZE), c=1+index%SIZE;
    let s=0;
    for(let i=1;i<=r;i++) if(r%i===0)
      for(let j=1;j<=c;j++) if(c%j===0)
        s+=input[(i-1)*SIZE+j-1];
    return mod(s);
  });
}

/**
 * @param {number[]} input 11x11 row-major original.
 * @returns {number[]}
 */
function gridInverse(input) {
  assert.equal(input.length,SIZE*SIZE);
  return input.map((_,index)=>{
    const r=1+Math.floor(index/SIZE), c=1+index%SIZE;
    let s=0;
    for(let i=1;i<=r;i++) if(r%i===0)
      for(let j=1;j<=c;j++) if(c%j===0)
        s+=mobius(r/i)*mobius(c/j)*input[(i-1)*SIZE+j-1];
    return mod(s);
  });
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f=Array(MOD).fill(0);
  for(const x of a) f[x]++;
  return f.reduce((sum,n)=>sum+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @returns {string} */
const asLatin=a=>a.map(x=>roman[x]).join('');

function run() {
  const known=corpus.pages[57].indices;
  assert.equal(known.length,95);
  const control=[...known,...known.slice(0,26)];
  assert.equal(control.length,121);
  assert.deepEqual(oneInverse(oneForward(control)),control);
  assert.deepEqual(oneForward(oneInverse(R)),R);
  assert.deepEqual(gridInverse(gridForward(control)),control);
  assert.deepEqual(gridForward(gridInverse(R)),R);
  const one=oneInverse(R),two=gridInverse(R);
  assert(Math.abs(ioc(one)-0.03732782369146005)<1e-12);
  assert(Math.abs(ioc(two)-0.03457300275482093)<1e-12);
  console.log(JSON.stringify({
    originalImageWidthHeight:[563,569],
    p32OriginalRunes:121,
    sourceClue:'LP1 p05 exact MOBIUS magic-square word; not a direct p32 instruction',
    gpRegister:'canonical ordinal 0..28',
    originalIoC:ioc(R),
    sourceNativeSolvedControlIoC:ioc(known),
    sourceNativeReencryptsExactly:true,
    variants:[
      {name:'one-dimensional Dirichlet divisor Möbius inversion',
        ioc:ioc(one),roman:asLatin(one),indices:one},
      {name:'two-dimensional separable 11x11 divisor Möbius inversion',
        ioc:ioc(two),roman:asLatin(two),indices:two}
    ],
    conclusion:'Neither exact original candidate produces coherent GP29 plaintext. '+
      'A p32-specific divisor-sum forward cipher was never selected by the source.'
  },null,2));
}
run();

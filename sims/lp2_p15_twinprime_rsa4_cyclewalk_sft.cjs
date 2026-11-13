'use strict';

/**
 * Exact original-source four-GP-rune RSA cycle-walk proposal.
 * The two independently printed adjacent primes 3299 and 3301 define
 * n=10889999; all floral red GP-prime values give 3301-3294=7 as e.
 * The full 3316-rune floral register is 4 x the p15 prime 829.
 *
 * This is a finite cipher hypothesis, not a verified Cicada instruction.
 * SFT: node sims/lp2_p15_twinprime_rsa4_cyclewalk_sft.cjs (Node.js 22).
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {any} */
function json(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
}
const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const P = 3299, Q = 3301, N = P * Q, PHI = (P - 1) * (Q - 1);
const E = 7, D = 3109543, RADIX = 29, WIDTH = 4;
const DOMAIN = RADIX ** WIDTH;
assert.equal(N, 10889999);
assert.equal(PHI, 10883400);
assert.equal(E * D % PHI, 1);
assert.equal(DOMAIN, 707281);
assert.ok(N*N < Number.MAX_SAFE_INTEGER);

const floral = corpus.pages.slice(40,56).flatMap(page=>page.indices);
const body = corpus.pages.slice(40,56)
  .flatMap(page=>page.indices.slice(page.page===40?8:page.page===54?9:0));
const all = corpus.pages.slice(0,56).flatMap(page=>page.indices);
assert.deepEqual([floral.length,body.length,all.length],
  [3316,3299,12956]);
assert.equal(floral.length/WIDTH, 829);
const red = ink.pages.filter(page=>page.page>=40&&page.page<=55)
  .flatMap(page=>(page.red_spans||[])
    .map(s=>({page:page.page,start:s.start,len:s.length})));
assert.deepEqual(red,[
  {page:40,start:0,len:8},
  {page:53,start:128,len:51},
  {page:54,start:0,len:9}
]);
const redSum=red.reduce((sum,s)=>sum+corpus.pages[s.page].indices
  .slice(s.start,s.start+s.len)
  .reduce((total,v)=>total+corpus.prime[v],0),0);
assert.equal(redSum,3294);
assert.equal(Q-redSum,E);

/**
 * Modular products stay under 2^53 for this entire 24-bit RSA modulus,
 * so Number arithmetic is exact with integer multiplication.
 * @param {number} base @param {number} exponent @returns {number}
 */
function modPower(base,exponent){
  let result=1;
  let x=base%N;
  let n=exponent;
  while(n>0){
    if(n%2)result=result*x%N;
    x=x*x%N;
    n=Math.floor(n/2);
  }
  return result;
}

/**
 * Return to the complete 29^4 symbol alphabet by cycling the RSA bijection.
 * @param {number} value @param {number} exponent
 * @returns {{value:number,iterations:number}}
 */
function cycle(value,exponent){
  assert.ok(Number.isInteger(value)&&value>=0&&value<DOMAIN);
  let iterations=0;
  do{
    value=modPower(value,exponent);
    iterations++;
    assert.ok(iterations<=PHI);
  }while(value>=DOMAIN);
  return {value,iterations};
}

/**
 * High-first/low-first base29 four-rune blocks. Any trailing 1-3 runes
 * on the titleless body are diagnostically transmitted literally.
 * The complete 3316 and 12956 source scopes require no such convention.
 * @param {number[]} source
 * @param {number} exponent
 * @param {boolean} reverse
 * @returns {{out:number[],meanCycle:number,maxCycle:number}}
 */
function transform(source,exponent,reverse){
  const out=[];
  let total=0,maxCycle=0;
  for(let i=0;i+WIDTH<=source.length;i+=WIDTH){
    const original=source.slice(i,i+WIDTH);
    if(reverse)original.reverse();
    const x=original.reduce((a,d)=>a*RADIX+d,0);
    const found=cycle(x,exponent);
    let n=found.value;
    const digits=Array(WIDTH).fill(0);
    for(let j=WIDTH-1;j>=0;j--){
      digits[j]=n%RADIX;
      n=Math.floor(n/RADIX);
    }
    assert.equal(n,0);
    if(reverse)digits.reverse();
    out.push(...digits);
    total+=found.iterations;
    maxCycle=Math.max(maxCycle,found.iterations);
  }
  if(source.length%WIDTH)out.push(...source.slice(out.length));
  return {out,meanCycle:total/Math.floor(source.length/WIDTH),
    maxCycle};
}

/** @param {number[]} source @returns {number} */
function ioc(source){
  const hist=Array(RADIX).fill(0);
  for(const x of source)hist[x]++;
  return hist.reduce((s,h)=>s+h*(h-1),0)/
    (source.length*(source.length-1));
}
const expected={
  floral3316:{
    encrypt:[0.03442589246889254,0.03463621692529661],
    decrypt:[0.03447083203699964,0.03436639757508274]
  },
  body3299:{
    encrypt:[0.03443919919133111,0.03459581537011326],
    decrypt:[0.03443276542811823,0.034353538229696744]
  },
  all12956:{
    encrypt:[0.03447969668202171,0.03445124185423955],
    decrypt:[0.03446736387349803,0.03448610735930261]
  }
};
const results=[];
for(const [scope,source] of [
  ['floral3316',floral],['body3299',body],['all12956',all]]) {
  for(const [operation,exponent] of [['encrypt',E],['decrypt',D]]) {
    for(const reverse of [false,true]) {
      const decoded=transform(source,exponent,reverse);
      const restored=transform(decoded.out,
        operation==='decrypt'?E:D,reverse);
      assert.deepEqual(restored.out,source);
      assert.ok(Math.abs(ioc(decoded.out)-
        expected[scope][operation][Number(reverse)])<1e-14);
      results.push({
        scope,operation,reverse,
        fourRuneBlocks:Math.floor(source.length/WIDTH),
        orphanRunes:source.length%WIDTH,
        sourceIoC:ioc(source),decodedIoC:ioc(decoded.out),
        meanCycle:decoded.meanCycle,maxCycle:decoded.maxCycle,
        preview:decoded.out.slice(0,36)
          .map(v=>corpus.translit[v]).join('.')
      });
    }
  }
}

// The independent clear p57 plaintext is repeated only in this synthetic
// full-register plant; the original unedited ciphertext is never fitted.
const known=corpus.pages[57].indices;
assert.equal(known.length,95);
const nativePlant=Array.from({length:floral.length},
  (_,i)=>known[i%known.length]);
assert.ok(ioc(nativePlant)>0.05);
for(const reverse of [false,true]){
  const encrypted=transform(nativePlant,E,reverse);
  const decrypted=transform(encrypted.out,D,reverse);
  assert.deepEqual(decrypted.out,nativePlant);
}
// An independent exhaustive N-domain proof follows by CRT: for both
// primes, raising to e is invertible as gcd(e,p-1)=gcd(e,q-1)=1.
// Cycle walking any bijection over N restricts bijectively to 29^4.
console.log(JSON.stringify({
  originalParameters:{P,Q,N,PHI,E,D,DOMAIN,redPrimeSum:redSum},
  floral829FourRuneBlocks:floral.length/WIDTH,
  gpNativePlantIoC:ioc(nativePlant),
  originalTests:results,
  decision:'The exact source-parameter RSA pair of twin primes and e=7 fails as a direct four-GP-rune cycle-walk cipher; no original unknown LP2 plaintext.'
},null,2));

'use strict';

/**
 * Standalone original-input 2016 tree dimension to 2013 DH
 * key-mesh attack, on page32 11x11 GP29 candidate layout.
 *
 * The two signed-image dimensions 563x569 fix (g,p)=(563,569),
 * the p32 GP-prime top and left axes fix row/column exponents,
 * and the original 10x10 core is the receiver.
 *
 * Candidate, not authenticated by Cicada as an encryption equation.
 * Node.js 22 CommonJS, Windows, no dependencies.
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const page = n => source.pages.find(p => p.page === n).indices;
const c32 = page(32);
const c55 = page(55);
const modulus = 29;
assert.equal(c32.length, 121);
assert.equal(c55.length, 76);
const top = Array.from({length:11},(_,i)=>source.prime[c32[i]]);
const left = Array.from({length:11},(_,i)=>source.prime[c32[11*i]]);
assert.equal(top.reduce((a,b)=>a+b,0),563);
assert.equal(left.reduce((a,b)=>a+b,0),569);
assert.deepEqual(top,[73,5,101,19,101,3,43,107,13,19,79]);
assert.deepEqual(left,[73,23,5,23,79,59,53,79,59,109,7]);

/** @param {number} base @param {number} exponent @param {number} p @returns {number} */
function power(base, exponent, p) {
  let result=1;
  for(;exponent>0;exponent=Math.floor(exponent/2),base=base*base%p)
    if(exponent%2) result=result*base%p;
  return result;
}
assert.equal(power(563,568,569),1);
for(let i=1;i<568;i++)assert.notEqual(power(563,i,569),1,
  'image width must be primitive modulo prime image height');
const keys=[],inner=[];
for(let r=1;r<11;r++) {
  for(let col=1;col<11;col++) {
    // Two independent public exponentiations under published
    // DH tuple lead to the same DH shared secret.
    const publicRow = power(563, left[r], 569);
    const publicCol = power(563, top[col], 569);
    assert.equal(
      power(publicRow, top[col], 569),
      power(publicCol, left[r], 569)
    );
    keys.push(power(publicRow,top[col],569) % modulus);
    inner.push(c32[r*11+col]);
  }
}
assert.equal(keys.length,100);
assert.equal(inner.length,100);
const mod=x=>(x%modulus+modulus)%modulus;
const minus=(cipher, key)=>cipher.map((v,i)=>mod(v-key[i]));
const plus=(plain, key)=>plain.map((v,i)=>mod(v+key[i]));
const IOC=data=>{
  const histogram=Array.from({length:29},()=>0);
  for(const item of data) histogram[item]++;
  return histogram.reduce((v,n)=>v+n*(n-1),0)/(data.length*(data.length-1));
};
const native=x=>x.map(i=>source.translit[i]).join('-');
const decoded=minus(inner,keys);
assert.deepEqual(plus(decoded,keys),inner);
const candidate55=minus(c55,keys.slice(0,76));
assert.deepEqual(plus(candidate55,keys.slice(0,76)),c55);

// Authentic human-solved GP positive, 95-rune physical page57
// padded with the first five runes to fit exactly 100 core cells.
const solved=page(57);
assert.equal(solved.length,95);
const planted=[...solved,...solved.slice(0,5)];
const synthetic=plus(planted,keys);
assert.deepEqual(minus(synthetic,keys),planted);
const incorrect=keys.slice();
incorrect[41]=mod(incorrect[41]+1);
assert.notDeepEqual(minus(synthetic,incorrect),planted);
console.log(JSON.stringify({
  originalSource:'p32 (49.jpg) original121 and p55 (72.jpg) original76 GP29 runes; signed 2016 tree dimensions 563x569',
  sourceBoundaryPrimeSums:[top.reduce((a,b)=>a+b,0),
    left.reduce((a,b)=>a+b,0)],
  DH:{p:569,g:563,orderG:568,rowExponentCount:10,colExponentCount:10},
  candidate:'P[r,c]=C[r,c]-g^(topPrime[c]*leftPrime[r]) mod 569 mod 29, r,c=1..10',
  originalInterior:{runes:100,rawIOC:IOC(inner),decodedIOC:IOC(decoded),
    decodedGP:native(decoded)},
  genuineOtherTreePage55:{runes:76,rawIOC:IOC(c55),
    decodedIOC:IOC(candidate55),decodedGP:native(candidate55)},
  sourceReEncryption:'100/100 interior and 76/76 other tree page PASS',
  nativeSolvedPositive:'100/100 genuine p57 rune plant recovers',
  wrongKeyNegative:'PASS',
  identification:'no source-authenticated DH role assignment; outputs lack English'
},null,2));
console.log('PASS: original DH 100 interior, p55 holdout, 100 source-native positive, and wrong-key control');

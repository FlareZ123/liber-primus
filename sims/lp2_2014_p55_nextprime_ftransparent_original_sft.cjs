'use strict';

/**
 * Original 19 May 2014 IRC page-55 next-prime continuation:
 * test fixed original p55 with prime439 as its first key prime,
 * assuming all plaintext F runes bypass encryption as on solved p56.
 *
 * Node.js 22 CommonJS single-file test, no external packages or writes.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
assert.equal(corpus.pages.length,58);
assert.equal(corpus.translit[0],'F');
const c55=corpus.pages[55].indices;
const c56=corpus.pages[56].indices;
const known=corpus.pages[57].indices.slice(0,76);
assert.equal(c55.length,76);
assert.equal(c56.length,85);
assert.equal(known.length,76);
const primes=[];
for(let n=2;primes.length<300;n++) {
  let isPrime=true;
  for(let d=2;d*d<=n;d++) if(n%d===0) {isPrime=false;break;}
  if(isPrime)primes.push(n);
}
assert.equal(primes[83],433);
assert.equal(primes[84],439);
const mod=x=>((x%29)+29)%29;

/**
 * @param {number[]} cipher
 * @param {number} initialPrimeIndex
 * @param {Set<number>} bypassLocations
 * @returns {number[]}
 */
function decode(cipher,initialPrimeIndex,bypassLocations){
  let clock=initialPrimeIndex;
  return cipher.map((c,i)=>{
    if(bypassLocations.has(i)) {assert.equal(c,0);return 0;}
    return mod(c-(primes[clock++]-1));
  });
}
/** @param {number[]} plain @param {number} initialPrimeIndex */
function encode(plain,initialPrimeIndex){
  let clock=initialPrimeIndex;
  const bypass=new Set();
  const cipher=plain.map((p,i)=>{
    if(p===0) {bypass.add(i);return 0;}
    return mod(p+(primes[clock++]-1));
  });
  return {cipher,bypass};
}
// The actual solved p56 uses one known non-consuming F at index 56.
const p56=decode(c56,0,new Set([56]));
assert.deepEqual(p56.slice(0,5).map(i=>corpus.translit[i]),['A','N','E','N','D']);
assert.equal(primes[84],439);
// Check the exact original p55: no ciphertext F appears before local15.
const fsites=c55.flatMap((v,i)=>v===0?[i]:[]);
assert.deepEqual(fsites,[15,25,41]);
assert.equal(c55[7],corpus.translit.indexOf('X'));
const witness=[];
for(let mask=0;mask<8;mask++) {
  const bypass=new Set(fsites.filter((_,bit)=>(mask&(1<<bit))!==0));
  const p=decode(c55,84,bypass);
  const forbidden=p.flatMap((v,i)=>(v===0&&c55[i]!==0)?[i]:[]);
  assert(forbidden.includes(7));
  witness.push({mask,forbidden,first12:p.slice(0,12).map(i=>corpus.translit[i])});
}
// This full-f transparency extension recovers honest native-text plants.
const plant=encode(known,84);
assert.deepEqual(decode(plant.cipher,84,plant.bypass),known);
assert(plant.bypass.size>0);
console.log(JSON.stringify({
  source:'19 May 2014 original #cicadasolvers Freenode, line 181056',
  p56ConsumedPrimes:84,p56LastPrime:433,p55FirstPrime:439,
  p55CiphertextFLocations:fsites,allMasksRejected:witness.length,
  firstForbiddenPosition:7,
  firstForbiddenCiphertextRune:corpus.translit[c55[7]],
  firstForbiddenPlaintextRune:'F',
  masks:witness,plantRoundtrip:true
},null,2));

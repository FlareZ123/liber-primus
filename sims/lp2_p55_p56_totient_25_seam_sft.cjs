#!/usr/bin/env node
'use strict';
/**
 * LP2 p55: finite original p56 φ(prime) cipher transfer with the p55 p5-moth
 * 25-cell boundary's single physically visible ciphertext F at offset25.
 *
 * This is a source-motivated HYPOTHESIS, not an authenticated cipher selector.
 * Run: node sims/lp2_p55_p56_totient_25_seam_sft.cjs
 * No key/phase/skip sweeps. It tests just the frozen proposed clock.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const lookup = n => corpus.pages.find(page => page.page === n).indices;
const p55 = lookup(55), p56 = lookup(56), p57 = lookup(57);
assert.deepEqual([p55.length,p56.length,p57.length],[76,85,95]);
assert.equal(p55[25],0);
const primes = [];
for (let candidate=2;primes.length<90;candidate++) {
  let isPrime=true;
  for(let d=2;d*d<=candidate;d++) if(candidate%d===0){isPrime=false;break;}
  if(isPrime) primes.push(candidate);
}
/** Return original GP29 under the known positive p56 totient rule. */
function apply(input, skipAt, sign, mode='phi') {
  let clock=0;
  return input.map((rune,i)=>{
    if(i===skipAt) return rune;
    const value = primes[clock++]+(mode==='phi'?-1:0);
    return (rune+sign*value%29+29*100)%29;
  });
}
const solvedKnown = 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE';
const p56Plain = apply(p56,56,-1);
const transliterate=a=>a.map(index=>corpus.translit[index]).join('');
assert.equal(transliterate(p56Plain),solvedKnown);
assert.deepEqual(apply(p56Plain,56,+1),p56);
const p55Plain = apply(p55,25,-1);
const p55Negative = apply(p55,25,-1,'prime');
assert.deepEqual(apply(p55Plain,25,+1),p55);
const planted=[...p57.slice(0,25),0,...p57.slice(25,75)];
assert.equal(planted.length,76);
assert.deepEqual(apply(apply(planted,25,+1),25,-1),planted);
const ioc=a=>{
  const h=Array(29).fill(0);
  for(const r of a) h[r]++;
  return h.reduce((total,n)=>total+n*(n-1),0)/(a.length*(a.length-1));
};
const fpos=p55.flatMap((r,i)=>r===0?[i]:[]);
assert.deepEqual(fpos,[15,25,41]);
console.log(JSON.stringify({
  hypothesis:"LP1 p5 moth+25-square selects p55; apply the solved-p56 phi(prime) stream with only p55 F25 as a non-consuming literal",
  p55_cypher_F_offsets:fpos,
  p55_consumed_prime_keys:75,
  p55_ciphertext_runes:76,
  p55_raw_ioc:ioc(p55),
  p55_phi_prime_IoC:ioc(p55Plain),
  p55_wrong_prime_IoC:ioc(p55Negative),
  solved_p57_IoC:ioc(p57),
  p55_full_transliteration:transliterate(p55Plain),
  known_solved_p56_full_transliteration:transliterate(p56Plain),
  solved_p56_exact_control_passed:true,
  p55_forward_reconstruction_passed:true,
  source_native_75_rune_plant_passed:true,
  conclusion:"No intelligible p55 plaintext; source original does not establish this F-skip clock on p55."
},null,2));

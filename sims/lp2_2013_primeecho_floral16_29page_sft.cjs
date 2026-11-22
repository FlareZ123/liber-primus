#!/usr/bin/env node
'use strict';
/**
 * Exact 2013 prime_echo 16x29 row transfer to the sixteen original LP2
 * floral-bordered physical pages p40..55. All F masks are enumerated.
 * Historical selector is conditional; no offset or language-score search.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourceScript = read('resources/historical/cicada2013-os-original-prime-echo.sh');
const primes = [...sourceScript.matchAll(/echo\s*(?:-n\s*)?"(\d+)\t";\s*sleep/g)]
  .map(m => Number(m[1]));
assert.equal(primes.length, 464);
assert.equal(primes[173], 1033);
assert.equal(primes[463], 3301);
const rows = Array.from({length: 16}, (_, i) => primes.slice(i*29, (i+1)*29));
assert.ok(rows.every(r => r.length === 29));
const pages = corpus.pages.filter(p => p.page >= 40 && p.page <= 55);
assert.deepEqual(pages.map(p => p.page), Array.from({length:16},(_,i)=>40+i));
assert.equal(pages[10].indices.length, 0);
assert.equal(pages.reduce((n,p) => n+p.indices.length,0), 3316);
/** @param {number} x */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number[]} cipher @param {number[]} primesRow */
function reach(cipher, primesRow) {
  let states = new Set([0]);
  for(let i=0;i<cipher.length;i++) {
    const c=cipher[i], next=new Set();
    for(const phase of states) {
      // Genuine p56 rule: literal plaintext F outputs ciphertext F
      // without consuming a prime. A non-F plaintext always consumes.
      if(c===0) next.add(phase);
      if(mod(c-(primesRow[phase]-1))!==0) next.add((phase+1)%29);
    }
    if(!next.size) return {passed:false,offset:i,cipher:c,
      livePhases:[...states].sort((a,b)=>a-b),
      livePrimes:[...states].sort((a,b)=>a-b).map(j=>primesRow[j])};
    states=next;
  }
  return {passed:true,outputPhases:[...states].sort((a,b)=>a-b)};
}
/** @param {number[]} plain @param {number[]} primesRow */
function encrypt(plain,primesRow){
  const out=[];
  let phase=0;
  for(const p of plain) {
    if(p===0) {out.push(0); continue;}
    out.push(mod(p+primesRow[phase]-1));
    phase=(phase+1)%29;
  }
  return out;
}
const original = pages.map((page,j) => ({page:page.page,length:page.indices.length,
  primes: [rows[j][0],rows[j][28]],...reach(page.indices,rows[j])}));
const passing=original.filter(x=>x.passed).map(x=>x.page);
const failures=original.filter(x=>!x.passed);
const pt57=corpus.pages[57].indices;
assert.equal(pt57.length,95);
const plant=pages.map((p,j)=>{
  const plain=Array.from({length:p.indices.length},(_,i)=>pt57[i%95]);
  const encrypted=encrypt(plain,rows[j]);
  const check=reach(encrypted,rows[j]);
  assert.equal(check.passed,true,'positive plant at page '+p.page);
  return encrypted.length;
});
assert.equal(plant.reduce((a,b)=>a+b,0),3316);
const p56Text='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const tok=corpus.translit.map((text,index)=>({text,index})).sort((a,b)=>b.text.length-a.text.length);
const p56=[];
for(const word of p56Text.split(' '))for(let i=0;i<word.length;) {
  const item=tok.find(x=>word.startsWith(x.text,i));assert(item);
  p56.push(item.index);i+=item.text.length;
}
assert.equal(p56.length,85);
let ctr=0;
const reencrypted=p56.map(v=>v===0?0:mod(v+primes[ctr++]-1));
assert.deepEqual(reencrypted,corpus.pages[56].indices);
assert.equal(ctr,84);
console.log(JSON.stringify({
  hypothesis:'Original 2013 464 primes = sixteen source-ordered 29-prime rows for p40..55; p50 no rune output; every row repeated in its page',
  originalRuneTotal:3316,floralPageCount:16,keyRows:16,
  firstMarkedPrime:1033,finalPrime:3301,
  original, failingPages:failures.length,passingPages:passing,
  plantedOriginalGeometry:plant,p56Known85Exact:true,
  decision:'Any non-F->plaintext F conflict rejects the exact authentic-p56-key-transfer model at that page. No plaintext claimed.'
},null,2));

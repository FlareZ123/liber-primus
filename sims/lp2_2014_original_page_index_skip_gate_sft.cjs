'use strict';

/**
 * Freeze the independent June 26, 2014 page-position bypass conjecture:
 * source IRC L213433 "character position 56 on page 56 is not encoded".
 * Also freeze historical June/July page-power 57-page exponent.
 *
 * Exact original p56 positive control. Preserve all p54/p55 original rune
 * word separators; never infer success from an isolated English substring.
 *
 * node sims/lp2_2014_original_page_index_skip_gate_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const mod=x=>(x%29+29)%29;
function primesThrough(n){
  const arr=[];
  for(let k=2;arr.length<n;k++){
    let yes=true;
    for(let d=2;d*d<=k;d++)if(k%d===0){yes=false;break;}
    if(yes)arr.push(k);
  }
  return arr;
}
const primes=primesThrough(Math.max(...source.pages.map(p=>p.indices.length))+2);
/** @param {number} p @param {number} e */
function pow29(p,e){let a=1;for(let i=0;i<e;i++)a=mod(a*p);return a;}
/**
 * @param {number[]} arr
 * @param {number} e
 * @param {number} skip
 * @param {-1|1} sign
 */
function run(arr,e,skip,sign){
  let clock=0;
  return arr.map((x,i)=>i===skip?x:mod(x+sign*(pow29(primes[clock++],e)-1)));
}
/** @param {number[]} v */
function ioc(v){
 const h=Array(29).fill(0);
 for(const x of v){assert(Number.isInteger(x)&&x>=0&&x<29);h[x]++;}
 return h.reduce((s,n)=>s+n*(n-1),0)/(v.length*(v.length-1));
}
/** @param {string} s */
function ids(s){
 const alphabet=source.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
 const out=[];
 for(const word of s.split(' ')){
   for(let i=0;i<word.length;){
     const entry=alphabet.find(x=>word.startsWith(x.token,i));
     assert(entry,'Non-GP expected text '+word.slice(i));
     out.push(entry.index);i+=entry.token.length;
   }
 }
 return out;
}
const expected56=ids('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
const p=n=>source.pages.find(x=>x.page===n).indices;
assert.deepEqual(run(p(56),1,56,-1),expected56);
assert.deepEqual(run(expected56,1,56,+1),p(56));
assert.deepEqual(run(p(57),0,57,-1),p(57));
assert.deepEqual(run(p(57),0,57,+1),p(57));
const records=[];
for(const n of [54,55]){
 const cipher=p(n);
 for(const e of [57-n,1]){
   const plain=run(cipher,e,n,-1);
   assert.deepEqual(run(plain,e,n,+1),cipher);
   records.push({
    page:n,originalLength:cipher.length,
    exponent:e,bypassOffset:n,
    bypassOriginalRune:source.translit[cipher[n]],
    candidateIoC:ioc(plain),originalIoC:ioc(cipher),
    first100CandidateGP:plain.slice(0,100).map(x=>source.translit[x]).join(''),
    fullCandidateGP:plain.map(x=>source.translit[x]).join('')
   });
 }
}
console.log(JSON.stringify({
 source:'Pinned original 2014 IRC #cicadasolvers lines 200880/200887, 213433, 228615',
 hypothesis:'page-reset additive GP29 prime-power (57-p) with exactly one unchanged 0-based rune at position p, independent of rune value',
 evidence:'Historical contemporary solver speculation only, not Cicada-authored instruction',
 positive56:'85/85 native exact solve with bypass at index 56',positive57:'95/95 native identity',
 records,
 decision:'No immediate linguistic candidate on original p54 or p55 under either the frozen per-page exponent or a single outer phi(prime) pass; no independently recovered plaintext or key.'
},null,2));

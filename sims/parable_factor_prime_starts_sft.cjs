#!/usr/bin/env node
'use strict';

// Test whether the three source-derived prime factors of the solved p57
// Parable clauses can start the authentic p56 prime-totient stream on the
// three independently red-marked LP2 intervals p15, p40 and p53.
// No key permutation is selected by plaintext: all six assignments are
// enumerated, with continuous and per-page clocks.

const assert=require('node:assert/strict');
const {targets}=require('./red_quotient_totient_key_holdout.cjs');
const {decodePages,ioc}=require('./twin_prime_totient_holdout.cjs');

const MOD=29;
const mod=n=>(n%MOD+MOD)%MOD;
const factors=[1259,1031,1229]; // p57 body-clause sums in printed order
assert.equal(factors.reduce((a,b)=>a*b,1),1595277641);
function isPrime(n){
  if(n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
}
assert.ok(factors.every(isPrime));

function primeValuesFrom(start,count){
  assert.ok(isPrime(start));
  const limit=start+count*16+100;
  const composite=new Uint8Array(limit+1);
  for(let p=2;p*p<=limit;p++){
    if(!composite[p])for(let n=p*p;n<=limit;n+=p)composite[n]=1;
  }
  const out=[];
  for(let n=start;n<=limit&&out.length<count;n++)
    if(!composite[n])out.push(n);
  assert.equal(out.length,count,'sieve bound must cover requested prime stream');
  return out;
}
function keyFromPrimeValue(start,count){
  return primeValuesFrom(start,count).map(p=>mod(p-1));
}
function permutations(values){
  const out=[];
  function visit(a,k){
    if(k===a.length){out.push(a.slice());return;}
    for(let i=k;i<a.length;i++){
      [a[k],a[i]]=[a[i],a[k]];
      visit(a,k+1);
      [a[k],a[i]]=[a[i],a[k]];
    }
  }
  visit(values.slice(),0);
  return out;
}
function decode(spec,startPrime,reset){
  const n=spec.groups.flat().length;
  const key=keyFromPrimeValue(startPrime,n);
  const result=decodePages(spec.groups,key,0,-1,false,false,reset);
  assert.equal(result.flat().length,n);
  return result;
}
function run(){
  const specs=targets();
  assert.deepEqual(specs.map(s=>s.q.page),[15,40,53]);
  assert.deepEqual(specs.map(s=>s.q.quotient),[22,15,78]);
  assert.deepEqual(specs.map(s=>s.groups.flat().length),[1883,2400,299]);

  // Verify the custom prime-value stream and the imported decoder's exact
  // subtraction convention on a deterministic planted GP sequence.
  const plant=Array.from({length:257},(_,i)=>mod(i*11+7));
  const plantKey=keyFromPrimeValue(1259,plant.length);
  const cipher=plant.map((p,i)=>mod(p+plantKey[i]));
  assert.deepEqual(decodePages([cipher],plantKey,0,-1,false,false,false)[0],plant);

  const assignments=permutations(factors);
  assert.equal(assignments.length,6);
  const results=[];
  for(const starts of assignments)for(const reset of [false,true]){
    const scores=specs.map((spec,i)=>ioc(decode(spec,starts[i],reset)));
    results.push({starts,resetPerPage:reset,scores});
  }
  const naturalContinuous=results.find(x=>
    x.starts.join(',')===factors.join(',')&&!x.resetPerPage);
  const naturalReset=results.find(x=>
    x.starts.join(',')===factors.join(',')&&x.resetPerPage);
  const individualUpperEnvelopes=specs.map((_,i)=>
    Math.max(...results.map(x=>x.scores[i])));
  assert.ok(individualUpperEnvelopes.every(x=>x<0.04));

  const result={
    source:'Solved p57 body-clause GP-prime sums in printed order, matching the 2013 ID3 product',
    factorValues:factors,
    factorProduct:factors.reduce((a,b)=>a*b,1),
    keyRule:'consecutive ordinary primes beginning at each factor; K=(p-1) mod 29; decrypt by subtraction',
    targetSections:specs.map(s=>({
      label:s.label,redSource:s.q,length:s.groups.flat().length,
      originalIoC:ioc(s.groups)
    })),
    configurations:results.length,
    naturalPrintedOrder:{continuous:naturalContinuous,resetPerPage:naturalReset},
    individualUpperEnvelopes,
    roundTripControl:{runes:plant.length,exact:true},
    verdict:'No LP2 plaintext. All six factor-to-section assignments, with continuous and per-page key clocks, remain near random GP29 IoC. This rejects direct p56-style prime-totient running-key transfer from these three Parable prime values to these three red sections; it does not rule out other uses of the factors.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={primeValuesFrom,keyFromPrimeValue,permutations,decode,run};

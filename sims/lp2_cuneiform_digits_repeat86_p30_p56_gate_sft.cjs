'use strict';

/**
 * Cuneiform digit-sum / adjacent-repeat bridge gate.
 *
 * The p33-39 repeated cuneiform is conventionally read as the sexagesimal
 * component pairs (17,13) and (55,1), giving 1033 and 3301. Their four
 * literal components sum to 86. This SFT checks the exact unsolved LP2
 * adjacent-repeat count and the most direct row-sum receiver:
 * 17+13=30, 55+1=56. Since p56 is authentically solved by the phi(prime)
 * transparent-F cipher, transfer that exact inverse unchanged to p30.
 *
 * Run: node sims/lp2_cuneiform_digits_repeat86_p30_p56_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const digits = [17, 13, 55, 1];
assert.equal(17 * 60 + 13, 1033);
assert.equal(55 * 60 + 1, 3301);
assert.equal(digits.reduce((a,b)=>a+b,0), 86);
assert.deepEqual([17+13,55+1],[30,56]);

const pages = corpus.pages.filter((p)=>p.page<=55);
const repeatRunes = [];
for (const page of pages) {
  for (let i=0;i+1<page.indices.length;i++) {
    if (page.indices[i]===page.indices[i+1]) repeatRunes.push(page.indices[i]);
  }
}
assert.equal(repeatRunes.length,86);

const flat = pages.flatMap((p)=>p.indices);
let continuousRepeats=0;
for(let i=0;i+1<flat.length;i++) if(flat[i]===flat[i+1]) continuousRepeats++;
assert.equal(continuousRepeats,86);

/** @param {number} n */
function firstPrimes(n){
  const out=[];
  for(let x=2;out.length<n;x++){
    let prime=true;
    for(let d=2;d*d<=x;d++) if(x%d===0){prime=false;break;}
    if(prime) out.push(x);
  }
  return out;
}

const p30 = corpus.pages.find((p)=>p.page===30).indices;
const primes=firstPrimes(p30.length+100);

/*
 * Exact p56 inverse state machine: P=C-(prime-1) mod29; an original
 * ciphertext F may either be literal plaintext F without consuming the
 * key, or an ordinary encrypted non-F that consumes one prime.
 * Non-F ciphertext cannot decode to plaintext F under this mechanism.
 */
let live=new Set([0]);
let firstImpossible=null;
let maxStates=live.size;
for(let i=0;i<p30.length;i++){
  const next=new Set();
  for(const consumed of live){
    if(p30[i]===0) next.add(consumed);
    const plain=((p30[i]-(primes[consumed]-1))%29+29)%29;
    if(plain!==0) next.add(consumed+1);
  }
  live=next;
  maxStates=Math.max(maxStates,live.size);
  if(live.size===0){firstImpossible=i;break;}
}
assert.equal(firstImpossible,40);
assert.equal(live.size,0);

const counts=new Array(29).fill(0);
for(const x of repeatRunes) counts[x]++;
const n=repeatRunes.length;
const ioc=counts.reduce((s,c)=>s+c*(c-1),0)/(n*(n-1));

/** @param {number[]} values */
function show(values){return values.map((x)=>corpus.translit[x]).join('');}

const groups=[];let at=0;
for(const size of digits){groups.push(repeatRunes.slice(at,at+size));at+=size;}
assert.equal(at,86);
const reversalVariants={
  raw:repeatRunes,
  eachGroupReversed:groups.flatMap((g)=>[...g].reverse()),
  groupOrderReversed:[...groups].reverse().flat(),
  both:[...groups].reverse().flatMap((g)=>[...g].reverse())
};

console.log(JSON.stringify({
  classification:'exact source-number/repeat-count bridge; direct receiver negative',
  cuneiform:{
    components:digits,
    base60Values:[1033,3301],
    componentSum:86,
    rowSums:[30,56]
  },
  originalRepeats:{
    withinPage:repeatRunes.length,
    continuous:continuousRepeats,
    oneRunePerRepeatIoC:ioc,
    payload:show(repeatRunes),
    reversalPreviews:Object.fromEntries(
      Object.entries(reversalVariants).map(([k,v])=>[k,show(v)])
    )
  },
  p56ToP30Transfer:{
    p30Runes:p30.length,
    authenticMode:'P=C-(prime-1) mod29, plaintext-F non-consuming',
    firstImpossibleZeroBased:firstImpossible,
    maxLivePrimeCounters:maxStates,
    terminalStates:live.size
  }
},null,2));

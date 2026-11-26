'use strict';

const crypto = require('node:crypto');

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

/*
 * Treat the 86 repeat events as a source-selected period-86 key, not merely
 * as a payload. Three direct key derivations are tested on the complete
 * p0-p55 stream with global phase zero: repeated rune values, absolute
 * repeat positions mod 29, and first position followed by inter-repeat gaps
 * mod 29. Both additive Vigenere signs are tested; no phase/key search.
 */
const repeatPositions=[];
const repeatValues=[];
for(let i=1;i<flat.length;i++){
  if(flat[i]===flat[i-1]){
    repeatPositions.push(i);
    repeatValues.push(flat[i]);
  }
}
assert.deepEqual(repeatValues,repeatRunes);
assert.equal(repeatPositions.length,86);
const repeatKeys={
  repeatRuneValues:repeatRunes,
  repeatPositionsMod29:repeatPositions.map((x)=>x%29),
  firstPositionPlusGapsMod29:[
    repeatPositions[0],
    ...repeatPositions.slice(1).map((x,i)=>x-repeatPositions[i])
  ].map((x)=>x%29)
};
function mod29(x){return ((x%29)+29)%29;}
function streamIoC(values){
  const f=new Array(29).fill(0);
  for(const x of values)f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
const repeatVigenereResults=[];
const expectedRepeatIoC={
  repeatRuneValues:[0.03448269945279269,0.03451058232423752],
  repeatPositionsMod29:[0.03448086442621042,0.03450858047705686],
  firstPositionPlusGapsMod29:[0.03450955756913314,0.03447366730896569]
};
for(const [name,key] of Object.entries(repeatKeys)){
  assert.equal(key.length,86);
  for(const [signIndex,sign] of [-1,1].entries()){
    const plain=flat.map((x,i)=>mod29(x+sign*key[i%key.length]));
    const replay=plain.map((x,i)=>mod29(x-sign*key[i%key.length]));
    assert.deepEqual(replay,flat);
    const score=streamIoC(plain);
    assert.ok(Math.abs(score-expectedRepeatIoC[name][signIndex])<1e-12);
    repeatVigenereResults.push({
      key:name,
      keyLength:key.length,
      sign,
      keyText:show(key),
      ioc:score,
      sha256:crypto.createHash('sha256').update(Buffer.from(plain)).digest('hex'),
      prefix:show(plain.slice(0,180)),
      tail:show(plain.slice(-180))
    });
  }
}

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
  repeatDerivedVigenere:{
    inputIoC:streamIoC(flat),
    globalPhase:0,
    candidates:repeatVigenereResults
  },
  p56ToP30Transfer:{
    p30Runes:p30.length,
    authenticMode:'P=C-(prime-1) mod29, plaintext-F non-consuming',
    firstImpossibleZeroBased:firstImpossible,
    maxLivePrimeCounters:maxStates,
    terminalStates:live.size
  }
},null,2));

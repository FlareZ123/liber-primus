'use strict';
/**
 * Does the exact 51-rune red stanza of LP2 p53 encode three contemporary
 * 80-bit Tor-v2 hidden-service addresses? 51=3*17, and 17 native GP
 * base-29 digits have enough capacity for one 16-character Base32 address.
 *
 * Source-fixed known addresses come from the repository's historical 2014
 * onion-service byte manifest; their cryptographic attribution remains
 * as supplied by that source, not established by this test.
 *
 * Exact tests:
 *   (1) every permutation of three original addresses, both Base32
 *       character orientations, and both complete red-stanza orientations,
 *       with ANY unknown fixed permutation of all 29 GP digit labels;
 *       exact Hungarian 29x29 assignment scores 51 matching positions iff
 *       the substitution model can encode all three simultaneously;
 *   (2) the solved LP2 p56 prime/totient additive stream p_j-1, with an
 *       unknown constant GP shift and sign, forward or reversed prime
 *       clock, searched over the first two million actual prime indices;
 *       score exact first-17-symbol prefix, with a full 17 match required.
 *
 * Independent controls encode the three onions through a secret 29-symbol
 * permutation (requiring 51/51 exact inverse) and plant a 17-digit
 * onion using a hidden prime offset and additive sign/shift (requiring
 * a perfect 17-rune recovery).
 *
 * Node.js 22 CommonJS. This is a tightly bounded original-input hypothesis,
 * not an assertion that three known .onion addresses were printed in LP2.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { assignmentMax } = require('./outer_permutation_assignment.cjs');

const ROOT = path.join(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const onions = read('resources/cicada-hiddenservice-256-candidates.json')
  .sourceServices.map(service => service.url
    .replace(/^https?:\/\//,'').slice(0,16));
const red = corpus.pages.find(page => page.page === 53).indices.slice(128);
const ABC = 'abcdefghijklmnopqrstuvwxyz234567';
const M = 29, N = 51, BLOCK = 17;
const PRIME_LIMIT = 2_000_000;
const MOD = x => (x % M + M) % M;
assert.equal(red.length, N);
assert.equal(onions.length, 3);
assert(onions.every(addr => /^[a-z2-7]{16}$/.test(addr)));
assert.deepEqual(red.slice(0, BLOCK).includes(0), false);

/**
 * One little-endian or big-endian 80-bit 16-character .onion identifier,
 * expressed as 17 leading-zero-padded base29 GP digit indices.
 * @param {string} address
 * @param {boolean} reverseBase32
 * @returns {number[]}
 */
function toBase29(address, reverseBase32=false) {
  let integer = 0n;
  for (const letter of reverseBase32 ?
    [...address].reverse() : [...address]) {
    const digit = ABC.indexOf(letter);
    assert(digit >= 0);
    integer = (integer << 5n) | BigInt(digit);
  }
  const out = Array(BLOCK).fill(0);
  for (let i = BLOCK - 1; i >= 0; i--) {
    out[i] = Number(integer % 29n);
    integer /= 29n;
  }
  assert.equal(integer,0n);
  return out;
}

/** @param {number[]} observed @param {number[]} expected */
function permutedMatches(observed, expected) {
  assert.equal(observed.length,expected.length);
  const matrix=Array.from({length:M},()=>Array(M).fill(0));
  for(let i=0;i<observed.length;i++)matrix[observed[i]][expected[i]]++;
  return assignmentMax(matrix);
}

const ORDERS=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

/** @param {number[]} original */
function monoCases(original) {
  const rows=[];
  for (const reverseRed of [false,true]) {
    const input=reverseRed ? original.slice().reverse() : original;
    for (const reverseBase32 of [false,true]) {
      const digits=onions.map(addr=>toBase29(addr,reverseBase32));
      for (const order of ORDERS) {
        const target=order.flatMap(i=>digits[i]);
        const fit=permutedMatches(input,target);
        rows.push({reverseRed,reverseBase32,onionOrder:order,
          exactMatches:fit.score,forcedMismatches:N-fit.score});
      }
    }
  }
  rows.sort((a,b)=>b.exactMatches-a.exactMatches);
  return rows;
}

/** @param {number} boundCount */
function firstPrimesModulo29(boundCount=PRIME_LIMIT+100) {
  const bound=35_000_000;
  const composite=new Uint8Array(bound+1);
  for (let p=2;p*p<=bound;p++) if(!composite[p])
    for (let k=p*p;k<=bound;k+=p)composite[k]=1;
  const result=new Uint8Array(boundCount);
  let count=0;
  for(let p=2;p<=bound&&count<boundCount;p++) {
    if(!composite[p])result[count++]=p%M;
  }
  assert.equal(count,boundCount);
  return result;
}

/**
 * Look for an exact p56-style additive prime-stream crib in the first
 * 17 original red symbols. Unknown additive constant removes any fixed
 * p_j vs p_j-1 ambiguity. For each of two signs and prime-clock
 * orientations, the first observed rune fixes that constant.
 *
 * @param {number[]} observed
 * @param {number[]} plaintext
 * @param {Uint8Array} primes
 * @param {number} sign
 * @param {boolean} reverseClock
 */
function primePrefix(observed,plaintext,primes,sign,reverseClock) {
  const changes=observed.map((c,i)=>MOD(c-plaintext[i]));
  const desired=changes.map(x=>MOD(x-changes[0]));
  let maximum=0,bestStart=0,perfect=false;
  for(let start=reverseClock?BLOCK-1:0;start<PRIME_LIMIT;start++) {
    const original=primes[start];
    let run=1;
    while(run<BLOCK && MOD(sign *
      (primes[start+(reverseClock?-run:run)]-original)) === desired[run])
      run++;
    if(run>maximum){maximum=run;bestStart=start;}
    if(run===BLOCK){perfect=true;break;}
  }
  return {maximum,bestStart,perfect};
}

/** Planted pass for the exact 29-way substitution and unknown prime-offset solver. */
function positive(primes) {
  const random=[17,3,21,1,28,5,23,14,0,2,15,20,9,27,8,13,18,11,
    4,24,6,10,19,12,16,7,25,22,26];
  assert.equal(new Set(random).size,M);
  const clear=onions.flatMap(addr=>toBase29(addr));
  const encrypted=clear.map(x=>random[x]);
  assert.equal(permutedMatches(encrypted,clear).score,N);

  const pos=194_031,sign=-1,constant=9;
  const segment=toBase29(onions[1],true);
  const planted=segment.map((digit,i)=>
    MOD(digit+sign*primes[pos+i]+constant));
  const recovered=primePrefix(planted,segment,primes,sign,false);
  assert.equal(recovered.maximum,BLOCK);
  assert.equal(recovered.perfect,true);
  return {secretPermutationMatches:N,
    primeOriginalOffset:pos,primeRecoveredOneFullBlock:recovered.perfect,
    originalPrimePositionHits:recovered.maximum};
}

/** @param {number} seed */
function seededRandom(seed) {
  let s=seed>>>0;
  return () => {s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}

/** Full model-max source multiset conditional shuffles, not a p-value for all hypotheses. */
function shuffledNull(real,observedMax,replicates=400) {
  const random=seededRandom(0x51330153);
  const maxima=[];
  for(let r=0;r<replicates;r++) {
    const a=real.slice();
    for(let i=a.length-1;i>0;i--) {
      const j=random()%(i+1);
      [a[i],a[j]]=[a[j],a[i]];
    }
    maxima.push(monoCases(a)[0].exactMatches);
  }
  return {
    trials:replicates,
    meanMax:maxima.reduce((x,y)=>x+y,0)/replicates,
    max:Math.max(...maxima),
    asGoodAsObserved:maxima.filter(x=>x>=observedMax).length,
    addOneUpperTail:(1+maxima.filter(x=>x>=observedMax).length)/(replicates+1)
  };
}

function main() {
  const original=monoCases(red);
  const sourceNull=shuffledNull(red,original[0].exactMatches);
  const primes=firstPrimesModulo29();
  const synthetic=positive(primes);
  const firstAndReversed=[
    {name:'first17-original',symbols:red.slice(0,BLOCK)},
    {name:'last17-reversed',symbols:red.slice(N-BLOCK).reverse()}
  ];
  const primeRows=[];
  for(const chunk of firstAndReversed)
    for(const onion of onions)
      for(const reverseBase32 of [false,true])
        for(const reverseClock of [false,true])
          for(const sign of [-1,1]) {
            const target=toBase29(onion,reverseBase32);
            const result=primePrefix(chunk.symbols,target,primes,sign,reverseClock);
            primeRows.push({chunk:chunk.name,onion,reverseBase32,
              reverseClock,sign,...result});
          }
  primeRows.sort((a,b)=>b.maximum-a.maximum);
  assert(primeRows.every(x=>x.maximum<BLOCK),
    'Unexpected complete exact candidate! Independently verify plaintext.');
  const output={
    source:'LP2 p53 contiguous 51-runic red verse; three authenticated-as-source but unproven-purpose 2014 v2 onion labels',
    originalRedRunes:red.length,
    knownOnions:onions,
    positionalCapacity:'17 GP base29 digits per 80-bit onion v2 identifier, three consecutive blocks',
    arbitraryGlobalRuneMap:{
      models:original.length,unknownRunePermutation:'exact all 29! via Hungarian',
      best:original.slice(0,4),
      maxMatched:original[0].exactMatches,
      minimalForcedMismatch:N-original[0].exactMatches,
      conditionalNull:sourceNull
    },
    solvedP56PrimeStream:{
      models:primeRows.length,
      primeIndexStartsSearched:PRIME_LIMIT,
      unknownGlobalShiftEliminated:true,
      maxPrefix:primeRows[0].maximum,
      perfectFirst17Cribs:primeRows.filter(x=>x.perfect).length,
      top:primeRows.slice(0,5)
    },
    synthetic,
    verdict:'No source-fixed three-onion decoding by one secret fixed GP alphabet, or one continuous unknown-offset p56-style direct prime/totient stream over the first red block. Other addresses, KDFs, stateful and non-GP formats remain open.'
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)main();
module.exports={toBase29,monoCases,primePrefix,positive,main};

'use strict';

/**
 * LP2 original-source p15 Fibonacci-prime spiral -> p50 graph -> p27/p57
 * address bridge. No ciphertext/plaintext scoring or key search is used.
 * SFT: node sims/lp2_p15_p27_p57_43_79_201_graphbridge_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = grid.pages.flatMap((page) => page.tokens);
const graph = source.map((token) =>
  60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1]));
assert.equal(graph.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(graph)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const square = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const spiral = [[1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
const fib = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];

/** @param {number} count */
function firstPrimes(count) {
  const numbers = [];
  for(let candidate=2;numbers.length<count;candidate++) {
    if(numbers.every((p) => p*p>candidate || candidate%p!==0))
      numbers.push(candidate);
  }
  return numbers;
}
const ordinaryPrimes = firstPrimes(988);
const selectedPrime = fib.map((index) => ordinaryPrimes[index]);
const sourceSpiral = spiral.map(([row,col]) => square[row][col]);
assert.deepEqual(sourceSpiral, selectedPrime.map((p) => Math.abs(3301-p)));
assert.deepEqual(selectedPrime,
  [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]);
assert.equal(corpus.prime[corpus.translit.indexOf('P')], 43);
assert.equal(ordinaryPrimes.indexOf(1229)+1, 201);

const bridge = [
  {spiralOrdinal:7, prime:selectedPrime[6], address:selectedPrime[6]%256},
  {spiralOrdinal:8, prime:selectedPrime[7], address:selectedPrime[7]%256},
  {spiralOrdinal:13, prime:selectedPrime[12], address:selectedPrime[12]%256}
];
assert.deepEqual(bridge.map((x) => x.address), [43,79,201]);
const path43 = [43];
for(let i=0;i<7;i++)path43.push(graph[path43.at(-1)]);
assert.deepEqual(path43, [43,73,79,82,201,74,205,76]);
assert.equal(graph[graph[43]],79);
assert.equal(graph[graph[79]],201);

/** Strictly deterministic local xorshift32; shuffle original multiset. */
let state=0x15272014;
function rng() {
  state ^= state<<13;
  state ^= state>>>17;
  state ^= state<<5;
  return (state>>>0)/4294967296;
}
const table=graph.slice();
const trials=400000;
let exactTwoPlusTwo=0,orderedWithinFour=0,firstTwo=0,secondTwo=0,reach201ByFour=0;
for(let trial=0;trial<trials;trial++){
  for(let i=255;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [table[i],table[j]]=[table[j],table[i]];
  }
  const p1=table[43],p2=table[p1],p3=table[p2],p4=table[p3];
  if(p2===79)firstTwo++;
  if(table[table[79]]===201)secondTwo++;
  if(p4===201)reach201ByFour++;
  if(p2===79&&p4===201)exactTwoPlusTwo++;
  let now=43,seen79=false,match=false;
  for(let k=0;k<=4;k++){
    if(now===79)seen79=true;
    else if(now===201&&seen79)match=true;
    now=table[now];
  }
  if(match)orderedWithinFour++;
}
assert.deepEqual(
  {exactTwoPlusTwo,orderedWithinFour,firstTwo,secondTwo,reach201ByFour},
  {exactTwoPlusTwo:20,orderedWithinFour:75,firstTwo:1587,
    secondTwo:3110,reach201ByFour:3262}
);
console.log(JSON.stringify({
  interpretation:'first-party p15 spiral prime(Fibonacci+1), all modulo256 p50 cell IDs',
  sourceClaim:'p27 GP P/P prime43; p57 final PARABLE GP clause 201st ordinary prime',
  primeSpiral:selectedPrime,selectedBridge:bridge,
  originalPointerPath:path43,
  conditionalNull:{trials,seed:'0x15272014',fixed:'43 79 201 source addresses; original 256-byte multiset',
    exactTwoPlusTwo,orderedWithinFour,firstTwo,secondTwo,reach201ByFour}
},null,2));
console.log('PASS: authentic source Fibonacci/prime square and fixed address graph conditional check');

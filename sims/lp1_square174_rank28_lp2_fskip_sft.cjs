'use strict';
/**
 * Distinct LP1 p05 square-seeded prime/totient clock:
 *   square sum 1033 = p_174; clause prime-ordinal progression has stride 28.
 * Test the direct p56-authenticated additive totient inverse on original p0:
 *   K_j = phi(p_(174 + 28*j)) mod 29; P = C - K mod 29,
 * with every possible literal plaintext-F bypass retained.
 *
 * This is a finite source-derived candidate, not an authenticated key.
 * Node.js 22 CommonJS; read-only source SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = corpus.pages.find(p => p.page === 0).indices;
const solved = corpus.pages.find(p => p.page === 56).indices;
const native = corpus.pages.find(p => p.page === 57).indices;
assert.deepEqual([source.length, solved.length, native.length], [262, 85, 95]);
assert.equal(source.filter(x => x === 0).length, 14);
assert.equal(solved.filter(x => x === 0).length, 5);

const mod = n => (n % 29 + 29) % 29;
function firstPrimes(count) {
  const out = [];
  for (let x = 2; out.length < count; x++) {
    let isPrime = true;
    for (const p of out) {
      if (p * p > x) break;
      if (x % p === 0) { isPrime = false; break; }
    }
    if (isPrime) out.push(x);
  }
  return out;
}
const primes = firstPrimes(10000);
assert.equal(primes[173], 1033); // hidden 5x5 square sum = 174th prime
assert.equal(primes[174], 1039); // following LP1 sentence sum = 175th prime
assert.deepEqual([primes[146], primes[174], primes[202]], [853, 1039, 1237]);
const startRank = 174;
const stride = 28;
const key = consumed => mod(primes[startRank + stride * consumed - 1] - 1);
assert.equal(key(0), 17); // phi(1033) mod 29

/**
 * Every C=F may either bypass without consuming a key symbol or be shifted.
 * Every shifted result must be non-F, as in the authenticated p56 convention.
 * State merging by consumed-key count is exact for this fixed key schedule.
 */
function allFPaths(cipher, rank0, step, sign = -1) {
  let states = new Set([0]);
  let maxLive = 1;
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    const branches = [];
    for (const consumed of states) {
      const rank = rank0 + step * consumed;
      const prime = primes[rank - 1];
      const k = mod(prime - 1);
      const decoded = mod(cipher[i] + sign * k);
      branches.push({consumed, rank, prime, key:k, decoded,
        shiftedAllowed:decoded !== 0, bypassAllowed:cipher[i] === 0});
      if (decoded !== 0) next.add(consumed + 1);
      if (cipher[i] === 0) next.add(consumed);
    }
    if (!next.size) {
      return {valid:false, firstImpossible:i, beforeStates:[...states].sort((a,b)=>a-b),
        cipherIndex:cipher[i], branches, maxLive};
    }
    states = next;
    maxLive = Math.max(maxLive, states.size);
  }
  return {valid:true, firstImpossible:null, finalKeyStates:[...states].sort((a,b)=>a-b), maxLive};
}

// Main original-input decision: exact p56-style subtractive totient inverse,
// zero initial phase, first original p0 rune, no page/word resets.
const p0 = allFPaths(source, startRank, stride, -1);
assert.equal(p0.valid, false);
assert.equal(p0.firstImpossible, 137);
assert.deepEqual(p0.beforeStates, [132]);
assert.equal(p0.cipherIndex, 14); // GP X, not ciphertext F
assert.deepEqual(p0.branches, [{
  consumed:132, rank:3870, prime:36497, key:14, decoded:0,
  shiftedAllowed:false, bypassAllowed:false
}]);

// Authentic solved-p56 control: consecutive-prime totient key and the actual
// fourth ciphertext-F transparent bypass recover and re-encrypt all 85 runes.
const p56Plain = [];
const p56Reencoded = [];
let p56Clock = 0, fOccurrence = 0;
for (const c of solved) {
  if (c === 0) {
    fOccurrence++;
    if (fOccurrence === 4) {
      p56Plain.push(0);
      p56Reencoded.push(0);
      continue;
    }
  }
  const k = primes[p56Clock] - 1;
  const plain = mod(c - k);
  p56Plain.push(plain);
  p56Reencoded.push(mod(plain + k));
  p56Clock++;
}
assert.equal(p56Clock, 84);
assert.deepEqual(p56Reencoded, solved);
assert.equal(p56Plain.map(x => corpus.translit[x]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
const p56AllMask = allFPaths(solved, 1, 1, -1);
assert.ok(p56AllMask.valid);
assert.ok(p56AllMask.finalKeyStates.includes(84));

// Source-native positive plant under the candidate 174+28 schedule.
// This checks the candidate decoder's F handling and exact forward replay.
const p57Cipher = [];
let p57Clock = 0;
for (const plain of native) {
  if (plain === 0) p57Cipher.push(0);
  else {
    p57Cipher.push(mod(plain + key(p57Clock)));
    p57Clock++;
  }
}
const p57AllMask = allFPaths(p57Cipher, startRank, stride, -1);
assert.ok(p57AllMask.valid);
assert.ok(p57AllMask.finalKeyStates.includes(p57Clock));
const p57Recovered = [];
let p57DecodeClock = 0;
for (const c of p57Cipher) {
  if (c === 0) p57Recovered.push(0);
  else {
    p57Recovered.push(mod(c - key(p57DecodeClock)));
    p57DecodeClock++;
  }
}
assert.deepEqual(p57Recovered, native);
assert.equal(p57DecodeClock, p57Clock);
assert.deepEqual(p57Cipher.map((c,i) => c === 0 ? 0 :
  mod(p57Recovered[i] + key(p57Cipher.slice(0,i).filter(x => x !== 0).length))), p57Cipher);

console.log(JSON.stringify({
  status:'PASS',
  sourceSelector:{
    squareSum:1033, squarePrimeOrdinal:startRank,
    LP1ClausePrimeOrdinals:[147,175,203], stride,
    sourceContext:'LP1 p05 says primes and totient are sacred; the 5x5 square sum is 1033.'
  },
  candidate:{
    key:'phi(prime(174 + 28*j)) mod 29',
    inverse:'P = C - K mod 29',
    initialPhase:0, clock:'continuous from first original p0 rune',
    literalF:'every ciphertext F may bypass without consuming a key symbol'
  },
  originalP0:{
    runes:source.length, ciphertextF:14, valid:false,
    firstImpossibleRuneZeroBased:p0.firstImpossible,
    firstImpossibleRuneOneBased:p0.firstImpossible+1,
    ciphertextRune:corpus.translit[p0.cipherIndex],
    onlyPriorKeyConsumption:p0.beforeStates[0],
    forcedPrimeRank:p0.branches[0].rank,
    forcedPrime:p0.branches[0].prime,
    forcedTotientMod29:p0.branches[0].key,
    forbiddenPlaintext:corpus.translit[p0.branches[0].decoded],
    reason:'A non-F ciphertext X is forced to plaintext F; p56 permits F only as an unshifted ciphertext-F bypass.'
  },
  controls:{
    authenticP56:{exactPlaintext:true,exactReencryption:true,runes:solved.length,keyConsumed:p56Clock,
      allFMaskDPContainsTruePath:p56AllMask.finalKeyStates.includes(84)},
    plantedP57:{exactRecovery:true,exactReencryption:true,runes:native.length,keyConsumed:p57Clock,
      allFMaskDPContainsTruePath:p57AllMask.finalKeyStates.includes(p57Clock)}
  },
  decision:'The square-seeded zero-phase 174+28 direct p56-style prime-totient clock is impossible on original p0 under every literal-F bypass path. No unknown plaintext or author key recovered; other receivers/resets remain untested.'
}, null, 2));

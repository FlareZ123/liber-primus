'use strict';
/**
 * Source-selected 2014 LP1 prime-ordinal [147,175,203] rank-28
 * staircase, now with exact p56-authenticated literal-F bypass.
 * A valid decoding can bypass ciphertext F without advancing the key;
 * shifted ciphertext must never generate plaintext F.
 * Exhaustively explores every skip/keep mask via dynamic programming
 * on consumed-key index. Node.js 22 CommonJS, read-only Windows SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = corpus.pages.find(p => p.page === 0).indices;
const solved = corpus.pages.find(p => p.page === 56).indices;
const native = corpus.pages.find(p => p.page === 57).indices;
assert.deepEqual([source.length, solved.length, native.length], [262, 85, 95]);
assert.equal(source.filter(x => x === 0).length, 14);
assert.equal(solved.filter(x => x === 0).length, 5);
const mod = n => (n % 29 + 29) % 29;
/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let x = 2; out.length < count; x++) {
    let prime = true;
    for (const p of out) {
      if (p * p > x) break;
      if (x % p === 0) { prime = false; break; }
    }
    if (prime) out.push(x);
  }
  return out;
}
const primes = firstPrimes(10000);
assert.deepEqual([primes[146], primes[174], primes[202]], [853, 1039, 1237]);
/**
 * @param {'prime'|'totient'|'ordinal'} mode
 * @param {number} keyConsumed
 * @param {number} startRank
 * @param {number} stride
 * @returns {number}
 */
function keyValue(mode, keyConsumed, startRank, stride) {
  const rank = startRank + stride * keyConsumed;
  if (mode === 'ordinal') return rank;
  return primes[rank - 1] - Number(mode === 'totient');
}
/**
 * Exhaustively tracks every possible *key index* after each source rune.
 * Histories with identical key index have identical future options:
 * this merging loses no ability to finish even though their plaintexts differ.
 * When interpreting any C=F, two options are allowed: bypass F, consuming
 * no key, or decode a non-F with current key and consume one key.
 * @param {number[]} cipher
 * @param {'prime'|'totient'|'ordinal'} mode
 * @param {-1|1} sign
 * @param {number} startRank
 * @param {number} stride
 */
function allFPaths(cipher, mode, sign, startRank, stride) {
  let states = new Set([0]);
  let maxLive = 1;
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const consumed of states) {
      const k = keyValue(mode, consumed, startRank, stride);
      const decoded = mod(cipher[i] + sign * k);
      if (decoded !== 0) next.add(consumed + 1);
      if (cipher[i] === 0) next.add(consumed);
    }
    states = next;
    maxLive = Math.max(maxLive, states.size);
    if (!states.size) return {valid:false, firstImpossible:i, finalKeyStates:[], maxLive};
  }
  return {valid:true, firstImpossible:null, finalKeyStates:[...states].sort((a,b)=>a-b), maxLive};
}
const output = [];
for (const mode of ['prime', 'totient', 'ordinal']) {
  for (const sign of [-1, 1]) {
    const result = allFPaths(source, mode, sign, 147, 28);
    assert.equal(result.valid, false);
    output.push({mode, sign, ...result});
  }
}
assert.deepEqual(output.map(v=>v.firstImpossible), [3, 172, 2, 55, 35, 39]);

// Independent positive #1: the *genuine* known p56 prime/totient model.
// The historical F interruption is the fourth ciphertext F occurrence;
// all 85 source runes must re-encode exactly.
const decoded56 = [];
const reciphered56 = [];
let keyClock = 0, fOccurrence = 0;
for (const c of solved) {
  const skip = c === 0 && fOccurrence === 3;
  if (c === 0) fOccurrence++;
  if (skip) { decoded56.push(0); reciphered56.push(0); }
  else {
    const k = primes[keyClock] - 1;
    const p = mod(c - k);
    decoded56.push(p);
    reciphered56.push(mod(p + k));
    keyClock++;
  }
}
assert.equal(keyClock, 84);
assert.deepEqual(reciphered56, solved);
assert.equal(decoded56.map(x => corpus.translit[x]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
const p56AllMaskDP = allFPaths(solved, 'totient', -1, 1, 1);
assert.ok(p56AllMaskDP.valid);
assert.ok(p56AllMaskDP.finalKeyStates.includes(84));

// Independent positive #2: encrypt native solved p57 with the source-LP1
// rank-28 key and a literal F bypass. The exhausted decoder accepts its
// correct key consumption, so original p0 impossibility is discriminating.
const plants = [];
for (const mode of ['prime', 'totient', 'ordinal']) {
  for (const sign of [-1, 1]) {
    const encrypted = [];
    let consumed = 0;
    for (const plain of native) {
      if (plain === 0) encrypted.push(0);
      else {
        encrypted.push(mod(plain - sign * keyValue(mode, consumed, 147, 28)));
        consumed++;
      }
    }
    const result = allFPaths(encrypted, mode, sign, 147, 28);
    assert.ok(result.valid);
    assert.ok(result.finalKeyStates.includes(consumed));
    plants.push({mode, sign, encryptedRunes: encrypted.length, trueConsumedKey: consumed,
      countAllowedEndKeyStates:result.finalKeyStates.length});
  }
}
console.log(JSON.stringify({
  status:'PASS',
  source:'2014 LP1 p05 three sacred clauses: GP prime ranks 147,175,203',
  historicalF:'original solved LP2 p56 literal F does not advance key',
  originalP0Runes:source.length, originalP0CipherF:14, allSixExactOriginalResults:output,
  positiveKnownP56:{fullExactRecovery:true, clock:keyClock, possibleEndKeyStates:p56AllMaskDP.finalKeyStates},
  sourceNativePlants:plants,
  decision:'All six first-position rank28 prime/totient/ordinal clocks fail to decode even one complete original p0 under every F skip mask. Other clocks and mechanisms remain open.'
},null,2));

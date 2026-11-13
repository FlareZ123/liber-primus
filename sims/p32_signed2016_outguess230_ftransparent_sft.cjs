"use strict";
/**
 * Source-fixed 2016 OutGuess extraction seed 230 -> p32 prime-totient
 * transparent-F interpretation. This is a candidate, not an authorial key.
 * Run: node sims/p32_signed2016_outguess230_ftransparent_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const historical = read("resources/cicada2016-4gq25.md");
assert(historical.includes("seed: 230, len: 1136"));
const primes = [];
for (let value = 2; primes.length < 350; value++) {
  let isPrime = true;
  for (let d = 2; d * d <= value; d++) {
    if (value % d === 0) { isPrime = false; break; }
  }
  if (isPrime) primes.push(value);
}
assert.equal(primes[229], 1451);
assert.equal(primes[230], 1453);
const mod = n => ((n % 29) + 29) % 29;
const p32 = gp.pages[32].indices;
const p56 = gp.pages[56].indices;
assert.equal(p32.length, 121);
assert.deepEqual(p32.slice(0, 2), [20, 2]);
assert.equal(p56.length, 85);
assert.equal(gp.translit[0], "F");

/**
 * Complete feasibility for the p56 historical rule, with every possible
 * literal-F mask at C=0 retained. Initial ordinal is one-based.
 * @param {number[]} cipher
 * @param {number} initialOrdinal
 * @returns {{possible:boolean, firstImpossible:number, states:number}}
 */
function feasible(cipher, initialOrdinal) {
  let positions = new Set([initialOrdinal]);
  for (let offset = 0; offset < cipher.length; offset++) {
    const next = new Set();
    for (const ordinal of positions) {
      const c = cipher[offset];
      if (c === 0) next.add(ordinal); // Literal F, no prime consumed.
      // Ordinary encryption cannot produce a plaintext F: it would bypass.
      if (mod(c - (primes[ordinal - 1] - 1)) !== 0) next.add(ordinal + 1);
    }
    positions = next;
    if (positions.size === 0)
      return { possible:false, firstImpossible:offset, states:0 };
  }
  return { possible:true, firstImpossible:-1, states:positions.size };
}

/** @param {number[]} plain @param {number} initialOrdinal */
function encrypt(plain, initialOrdinal) {
  let ordinal = initialOrdinal;
  return plain.map(p => p === 0 ? 0 : mod(p + primes[ordinal++ - 1] - 1));
}
// Fully known genuine p56 prime-totient original-source positive control.
const solvedPhrase =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const tokens = gp.translit.map((token, index) => ({token,index}))
  .sort((a,b) => b.token.length - a.token.length);
function encode(s) {
  const out = [];
  for (const word of s.split(" ")) {
    for (let i = 0; i < word.length;) {
      const found = tokens.find(x => word.startsWith(x.token, i));
      assert(found, "unrepresentable source word " + word);
      out.push(found.index);
      i += found.token.length;
    }
  }
  return out;
}
const expected = encode(solvedPhrase);
let ordinal = 1;
const solved = p56.map((c, i) =>
  i === 56 ? 0 : mod(c - (primes[ordinal++ - 1] - 1)));
assert.equal(ordinal, 85);
assert.deepEqual(solved, expected);
assert.deepEqual(encrypt(expected, 1), p56);
assert.equal(feasible(p56, 1).possible, true);

// Synthetic independent 230th-prime plant confirms the proposed starting key
// and all genuine literal-F masks are supported for the entire solved page.
const planted = encrypt(expected, 230);
assert.equal(feasible(planted, 230).possible, true);

// Source-original p32 with independently observed 2016 extraction seed 230.
// C[0]=20, phi(p_230)=1450 ≡0, forces P[0]=20 (non-F).
// C[1]=2, phi(p_231)=1452 ≡2, forces P[1]=0 (F);
// but F always outputs C=0, contrary to the actual C[1]=2.
assert.equal(mod(primes[229] - 1), 0);
assert.equal(mod(primes[230] - 1), 2);
assert.equal(mod(p32[0] - (primes[229] - 1)), 20);
assert.equal(mod(p32[1] - (primes[230] - 1)), 0);
const gate = feasible(p32, 230);
assert.deepEqual(gate, {possible:false, firstImpossible:1, states:0});
console.log(JSON.stringify({
  candidate:"2016 OutGuess displayed seed230 as 1-based prime start on p32",
  sourceCipherFirstTwo:p32.slice(0,2),
  consecutivePrimes:primes.slice(229,231),
  primeTotientShiftsMod29:[0,2],
  knownSolvedP56Control:{runes:85, exactRecovery:true, exactReencryption:true},
  synthetic230Control:{runes:85, completeStateSurvival:true},
  p32:{runes:121, possibleUnderHistoricalFRule:false, firstImpossibleZeroBased:1},
  conclusion:"This one source-fixed transfer is impossible; no unknown plaintext or key recovered."
},null,2));

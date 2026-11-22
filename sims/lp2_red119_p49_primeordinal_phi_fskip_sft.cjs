"use strict";

/**
 * Source-fixed p3/p39 red-triad prime ordinals 33/40 as starting primes of
 * the authentic p56 prime-minus-one/F-transparent cipher, applied to both
 * complete (not page-truncated) sentences bracketing the 256-cell table.
 * Windows Node.js 22: node sims/lp2_red119_p49_primeordinal_phi_fskip_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8"
);
const parts = transcription.split(/^%$/m);
const runeIds = new Map(corpus.runes.map((rune, index) => [rune, index]));
assert.equal(parts.length, 57); // Runeless original physical p50 omitted.

/** @param {number} physicalPage @returns {string} */
function pageText(physicalPage) {
  assert.notEqual(physicalPage, 50);
  return parts[physicalPage < 50 ? physicalPage : physicalPage - 1]
    .replace(/[\/\r\n]/g, "");
}

/** @param {string} s @returns {number[]} */
function asIndices(s) {
  return [...s].flatMap(char => runeIds.has(char) ? [runeIds.get(char)] : []);
}

/** @param {string} s @returns {number} */
function wordCount(s) {
  return s.split(/[-.&$§]/).filter(part => asIndices(part).length > 0).length;
}

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  /** @type {number[]} */
  const primes = [];
  for (let candidate = 2; primes.length < n; candidate++) {
    let isPrime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(candidate);
  }
  return primes;
}

const primes = firstPrimes(400);
const mod = x => (x % 29 + 29) % 29;
assert.equal(primes[32], 137);
assert.equal(primes[39], 173);

for (const page of corpus.pages) {
  if (page.page === 50) {
    assert.equal(page.indices.length, 0);
  } else {
    assert.deepEqual(asIndices(pageText(page.page)), page.indices);
  }
}

const p48 = pageText(48);
const p49 = pageText(49);
const p51 = pageText(51);
const p52 = pageText(52);
const before = p48.slice(p48.lastIndexOf(".") + 1) +
  p49.slice(0, p49.lastIndexOf(".") + 1);
const after = p51 + p52.slice(0, p52.indexOf(".") + 1);
const beforeIndices = asIndices(before);
const afterIndices = asIndices(after);
assert.deepEqual([beforeIndices.length, afterIndices.length], [138, 170]);
assert.deepEqual([wordCount(before), wordCount(after)], [33, 40]);
assert.deepEqual([asIndices(p48.slice(p48.lastIndexOf(".") + 1)).length,
  asIndices(p49.slice(0, p49.lastIndexOf(".") + 1)).length], [72, 66]);
assert.deepEqual([asIndices(p51).length,
  asIndices(p52.slice(0, p52.indexOf(".") + 1)).length], [92, 78]);

/**
 * The genuine p56 encoder allows plaintext GP F (index 0) to be emitted
 * literally as ciphertext F, holding the key index. Ciphertext F may ALSO
 * be ordinary encryption of a NON-F plaintext rune and must spend the key.
 * @param {number[]} ciphertext
 * @param {number} primeStart zero-based prime ordinal, e.g. 32=33rd prime
 * @param {-1|1} sign P = C + sign*(prime[key]-1) mod 29
 * @returns {{firstFailure:number|null, terminalStates:number[], maxWidth:number}}
 */
function allLegalFHistories(ciphertext, primeStart, sign) {
  let states = new Set([0]);
  let maxWidth = 1;
  for (let i = 0; i < ciphertext.length; i++) {
    const cipher = ciphertext[i];
    const next = new Set();
    for (const used of states) {
      const shift = mod(primes[primeStart + used] - 1);
      // Encrypted NON-F branch; a plaintext F is never encrypted.
      if (mod(cipher + sign * shift) !== 0) next.add(used + 1);
      // Independently legal literal-F branch, consuming no prime.
      if (cipher === 0) next.add(used);
    }
    if (next.size === 0) {
      return { firstFailure: i, terminalStates: [], maxWidth };
    }
    states = next;
    maxWidth = Math.max(maxWidth, states.size);
  }
  return { firstFailure: null, terminalStates: [...states].sort((a,b)=>a-b), maxWidth };
}

/**
 * Independent positive: encrypt actual solved-p57 GP text under selected
 * starting prime, preserving genuine plaintext F; track its exact skip mask.
 * @param {number[]} clear
 * @param {number} primeStart
 * @param {-1|1} sign
 */
function positivePlant(clear, primeStart, sign) {
  let used = 0;
  const encoded = [];
  /** @type {boolean[]} */
  const transparent = [];
  for (const value of clear) {
    if (value === 0) {
      encoded.push(0);
      transparent.push(true);
    } else {
      encoded.push(mod(value - sign * mod(primes[primeStart + used] - 1)));
      transparent.push(false);
      used++;
    }
  }
  let decodedClock = 0;
  const recovered = encoded.map((cipher, i) => {
    if (transparent[i]) return 0;
    return mod(cipher + sign * mod(primes[primeStart + decodedClock++] - 1));
  });
  assert.deepEqual(recovered, clear);
  assert.equal(decodedClock, used);
  const reachable = allLegalFHistories(encoded, primeStart, sign);
  assert.equal(reachable.firstFailure, null);
  assert(reachable.terminalStates.includes(used));
  return { runes: clear.length, transparentFs: transparent.filter(Boolean).length,
    encryptedFs: encoded.filter((v, i) => v === 0 && !transparent[i]).length };
}

const p57 = corpus.pages[57].indices;
assert.equal(p57.length, 95);
const settings = [
  { name: "before_33words", ciphertext: beforeIndices, primeStart: 32 },
  { name: "after_40words", ciphertext: afterIndices, primeStart: 39 },
];
const results = [];
for (const item of settings) {
  const clear = Array.from({ length: item.ciphertext.length },
    (_, i) => p57[i % p57.length]);
  for (const sign of [-1, 1]) {
    const observed = allLegalFHistories(item.ciphertext, item.primeStart, sign);
    const planted = positivePlant(clear, item.primeStart, sign);
    assert.notEqual(observed.firstFailure, null);
    results.push({ sentence: item.name, runes: item.ciphertext.length,
      firstPrime: primes[item.primeStart], sign, ...observed, plant: planted });
  }
}
assert.deepEqual(results.map(r => r.firstFailure), [0, 58, 38, 43]);
console.log(JSON.stringify({
  finding: "All four source-frozen authentic-phi/F-transparent starting-prime transfers are impossible on original table-flanking ciphertext",
  controls: "Solved-p57 positive plaintext encrypts and decrypts exactly; all F-clock paths audited",
  startingPrimeOrdinals: [33, 40],
  originalResults: results,
  plaintextRecovered: 0
}, null, 2));

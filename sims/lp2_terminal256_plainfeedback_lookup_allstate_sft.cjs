"use strict";

/**
 * Single predeclared nonlinear terminal lookup/feedback model, issue #1167.
 * Exact original-input all-256-entry-state obstruction, with F transparency.
 *
 * No external libraries. Node.js 22 CommonJS.
 * Run as a standalone test file from any working directory.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} relative */
function json(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
}
/** @param {number} value @param {number} modulus */
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}
/** @param {number} count @returns {number[]} */
function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) {
      isPrime = false;
      break;
    }
    if (isPrime) out.push(n);
  }
  return out;
}

const source = json("resources/liber-primus/lp2-corpus.json");
const T = json("resources/liber-primus/lp2-grid-256.json")
  .pages.flatMap((p) => p.bytes);
const digest = crypto.createHash("sha256").update(Buffer.from(T))
  .digest("hex");
assert.equal(digest,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.equal(T.length, 256);
assert.equal(new Set(T).size, 161);
assert.equal(source.pages[55].indices.length, 76);
const c56 = source.pages[56].indices;
const clear57 = source.pages[57].indices;
assert.equal(c56.length, 85);
assert.equal(clear57.length, 95);

/**
 * Tokenize a supplied GP-letter spelling, longest rune first. Spaces
 * delimit words and do not consume a cipher state.
 * @param {string} text
 */
function tokenizeGP(text) {
  const tokens = source.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const result = [];
  for (const word of text.split(" ")) {
    for (let cursor = 0; cursor < word.length;) {
      const match = tokens.find((item) => word.startsWith(item.token, cursor));
      assert.ok(match, "Unsupported GP letter at: " + word.slice(cursor));
      result.push(match.index);
      cursor += match.token.length;
    }
  }
  return result;
}

const authentic56 = tokenizeGP(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(authentic56.length, 85);
const q = primes(85);
let primeClock = 0;
const independentlyDecrypted56 = c56.map((cipher, i) => {
  // The authentic original LP2 p56 has exactly one plaintext-F
  // transparent skip at this fixed printed position.
  if (i === 56) {
    assert.equal(cipher, 0);
    return 0;
  }
  return mod(cipher - (q[primeClock++] - 1), 29);
});
assert.equal(primeClock, 84);
assert.deepEqual(independentlyDecrypted56, authentic56);
assert.deepEqual(authentic56.flatMap((r, i) => r === 0 ? [i] : []), [56]);

/**
 * Frozen candidate, preserving original GP rune F as transparent symbol.
 * Byte state addresses a source-table cell. That cell's first-byte
 * integer selects an additive rank in the 28 non-F runes.
 * Only after non-F do the plaintext and table jointly select next cell.
 * This is a hypothesis: neither the signed text nor the table instructs
 * this exact update.
 *
 * @param {number[]} plain
 * @param {number} start
 * @returns {{cipher:number[],state:number}}
 */
function encrypt(plain, start) {
  assert(Number.isInteger(start) && start >= 0 && start < 256);
  let state = start;
  const cipher = [];
  for (const p of plain) {
    assert(Number.isInteger(p) && p >= 0 && p < 29);
    if (p === 0) {
      cipher.push(0);
      continue;
    }
    cipher.push(1 + mod(p - 1 + T[state] % 28, 28));
    state = T[(state + p) % 256];
  }
  return {cipher, state};
}

/**
 * Exact inverse of encrypt for arbitrary GP29 runes.
 * @param {number[]} cipher
 * @param {number} start
 * @returns {{plain:number[],state:number}}
 */
function decrypt(cipher, start) {
  assert(Number.isInteger(start) && start >= 0 && start < 256);
  let state = start;
  const plain = [];
  for (const c of cipher) {
    assert(Number.isInteger(c) && c >= 0 && c < 29);
    if (c === 0) {
      plain.push(0);
      continue;
    }
    const p = 1 + mod(c - 1 - T[state] % 28, 28);
    plain.push(p);
    state = T[(state + p) % 256];
  }
  return {plain, state};
}

/** @param {number[]} a @param {number[]} b */
function hits(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce((sum, value, i) => sum + Number(value === b[i]), 0);
}

const profile = Object.create(null);
let maxHits = -1;
let maxPrefix = -1;
const prefixTwoSeeds = [];
let completeStates = 0;
for (let start = 0; start < 256; start++) {
  // Grant every possible state after unknown p55, without a fitted key.
  const training = encrypt(authentic56, start);
  const firstMismatch = training.cipher.findIndex((v, i) => v !== c56[i]);
  const prefix = firstMismatch < 0 ? 85 : firstMismatch;
  profile[prefix] = (profile[prefix] || 0) + 1;
  const count = hits(training.cipher, c56);
  maxPrefix = Math.max(maxPrefix, prefix);
  maxHits = Math.max(maxHits, count);
  if (prefix === 85) completeStates += 1;
  if (prefix === 2) {
    // Diagnostic only: p56 already fails, so p57 is not a genuine holdout.
    const next = encrypt(clear57, training.state);
    prefixTwoSeeds.push({start, p56Hits: count,
      p57ClearHits: hits(next.cipher, clear57)});
  }
}
assert.deepEqual([profile[0], profile[1], profile[2]], [246, 8, 2]);
assert.equal(Object.keys(profile).length, 3);
assert.equal(maxPrefix, 2);
assert.equal(maxHits, 8);
assert.equal(completeStates, 0);
assert.deepEqual(prefixTwoSeeds, [
  {start:70, p56Hits:6, p57ClearHits:5},
  {start:132, p56Hits:8, p57ClearHits:5}
]);

// Complete known-native-GP positive, including the source's exact F bypass.
// This proves the stateful transport is bijective for known initial state.
const plant = [...authentic56, ...clear57];
const forward = encrypt(plant, 132);
const reverse = decrypt(forward.cipher, 132);
assert.deepEqual(reverse.plain, plant);
assert.deepEqual(encrypt(reverse.plain, 132), forward);
assert.equal(hits(reverse.plain, plant), 180);
assert.equal(hits(decrypt(encrypt(plant, 70).cipher, 70).plain, plant), 180);

const output = {
  status: "bounded source-conditional inverse FAILS at authentic p56",
  originalTableSHA256: digest,
  unknownP55Length: 76,
  authenticP56Length: 85,
  authenticP57Length: 95,
  stateSeedsTested: 256,
  stateUpdate: "T[(s+plaintext)%256] on non-F only",
  rank28Key: "T[s] mod28",
  trainingExactStates: completeStates,
  exactTrainingPrefixHistogram: profile,
  maximumTrainingHits: maxHits,
  twoRunePrefixCandidates: prefixTwoSeeds,
  firstContradiction: "No possible 8-bit entry state matches the first three p56 runes",
  validNativeGP180Positive: hits(reverse.plain, plant),
  recoveredUnknownPlaintext: false
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");

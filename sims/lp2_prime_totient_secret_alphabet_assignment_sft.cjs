"use strict";

/**
 * Exact 29! GP29 secret-alphabet recovery over the solved-p56 prime-totient
 * key schedule, applied to untouched unsolved physical LP2 p0..55.
 *
 * Two genuinely decrypting candidate models:
 *   (A) ciphertext C = sigma(P + sign*primeTotientClock) mod29
 *   (B) ciphertext C = P + tau(primeTotientClock) mod29
 *
 * Each maximum likelihood 29-symbol alphabet is solved exactly by a
 * minimum-cost Hungarian assignment, no brute force or hill climbing.
 * Fit only physical pp0..27, evaluate disjoint pp28..55 without refitting.
 * Both model-specific native-GP positive plants recover all 29 secret labels
 * and every planted plaintext rune; the actual original remains opaque.
 *
 * Node.js 20+ CommonJS. No writes, packages or network dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");

/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(ROOT, filename), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const alphabet = corpus.translit
  .map((name, index) => ({ name: name.toLowerCase(), index }))
  .sort((a, b) => b.name.length - a.name.length);

/** @param {string} text @returns {number[]} */
function toGP(text) {
  const source = text.toLowerCase().replace(/v/g, "u")
    .replace(/[kq]/g, "c").replace(/z/g, "s");
  const result = [];
  for (const word of source.match(/[a-z]+/gu) || []) {
    for (let pos = 0; pos < word.length;) {
      if (word.startsWith("ing", pos)) {
        result.push(21);
        pos += 3;
      } else {
        const token = alphabet.find((entry) => word.startsWith(entry.name, pos));
        assert(token, "Unrecognized control token " + word.slice(pos));
        result.push(token.index);
        pos += token.name.length;
      }
    }
  }
  return result;
}

const native = toGP(shakespeare);
assert.equal(native.length, 217644);
const freq = Array(29).fill(0);
for (const symbol of native) freq[symbol]++;
const logProb = freq.map((n) => Math.log((n + 1) / (native.length + 29)));

const original = [];
const pageOf = [];
const clocks = { book: [], page: [], chapter: [] };
const starts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);
let wholeBook = 0;
let chapterIndex = 0;
for (let page = 0; page < 56; page++) {
  if (starts.has(page)) chapterIndex = 0;
  const symbols = corpus.pages[page].indices;
  for (let i = 0; i < symbols.length; i++) {
    original.push(symbols[i]);
    pageOf.push(page);
    clocks.book.push(wholeBook++);
    clocks.page.push(i);
    clocks.chapter.push(chapterIndex++);
  }
}
assert.equal(original.length, 12956);
const cutoff = pageOf.indexOf(28);
assert.equal(cutoff, 6761);

/** @param {number} length @returns {number[]} */
function firstPrimes(length) {
  const limit = 20 * length;
  const sieve = new Uint8Array(limit + 1).fill(1);
  sieve[0] = sieve[1] = 0;
  for (let p = 2; p * p <= limit; p++) {
    if (!sieve[p]) continue;
    for (let j = p * p; j <= limit; j += p) sieve[j] = 0;
  }
  const output = [];
  for (let p = 2; p <= limit && output.length < length; p++) {
    if (sieve[p]) output.push(p);
  }
  assert.equal(output.length, length);
  return output;
}
const primeKey = firstPrimes(original.length).map((p) => (p - 1) % 29);

/**
 * Exact maximum-weight bipartite matching by the Hungarian algorithm.
 * Rows and columns both index the 29 GP29 symbols.
 *
 * @param {number[][]} score
 * @returns {number[]}
 */
function maximizeAssignment(score) {
  const n = score.length;
  assert.equal(n, 29);
  const u = Array(n + 1).fill(0);
  const v = Array(n + 1).fill(0);
  const rowAt = Array(n + 1).fill(0);
  const from = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    rowAt[0] = i;
    let current = 0;
    const min = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    do {
      used[current] = true;
      const row = rowAt[current];
      let delta = Infinity;
      let next = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cost = -score[row - 1][j - 1] - u[row] - v[j];
        if (cost < min[j]) {
          min[j] = cost;
          from[j] = current;
        }
        if (min[j] < delta) {
          delta = min[j];
          next = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[rowAt[j]] += delta;
          v[j] -= delta;
        } else {
          min[j] -= delta;
        }
      }
      current = next;
    } while (rowAt[current] !== 0);
    do {
      const previous = from[current];
      rowAt[current] = rowAt[previous];
      current = previous;
    } while (current !== 0);
  }
  const assignment = Array(n);
  for (let j = 1; j <= n; j++) assignment[rowAt[j] - 1] = j - 1;
  assert.equal(new Set(assignment).size, 29);
  return assignment;
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/**
 * Recover the full output alphabet sigma with no alphabet priors.
 * @param {number[]} cipher
 * @param {number[]} clock
 * @param {number} sign
 */
function outputAlphabet(cipher, clock, sign) {
  const scores = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (let i = 0; i < cutoff; i++) {
    const c = cipher[i];
    const shift = mod29(sign * primeKey[clock[i]]);
    for (let a = 0; a < 29; a++) {
      scores[c][a] += logProb[mod29(a - shift)];
    }
  }
  const inverse = maximizeAssignment(scores);
  const forward = Array(29);
  for (let c = 0; c < 29; c++) forward[inverse[c]] = c;
  const plain = cipher.map((c, i) => {
    const shift = mod29(sign * primeKey[clock[i]]);
    const p = mod29(inverse[c] - shift);
    assert.equal(forward[mod29(p + shift)], c);
    return p;
  });
  return { inverse, plain, ...languageScores(plain) };
}

/**
 * Recover all 29 unknown totient-residue key values by exact assignment.
 * @param {number[]} cipher
 * @param {number[]} clock
 */
function keyAlphabet(cipher, clock) {
  const scores = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (let i = 0; i < cutoff; i++) {
    const residue = primeKey[clock[i]];
    for (let a = 0; a < 29; a++) {
      scores[residue][a] += logProb[mod29(cipher[i] - a)];
    }
  }
  const keyMap = maximizeAssignment(scores);
  const plain = cipher.map((c, i) => {
    const shift = keyMap[primeKey[clock[i]]];
    const p = mod29(c - shift);
    assert.equal(mod29(p + shift), c);
    return p;
  });
  return { inverse: keyMap, plain, ...languageScores(plain) };
}

/** @param {number[]} plain */
function languageScores(plain) {
  let train = 0;
  let holdout = 0;
  for (let i = 0; i < plain.length; i++) {
    if (i < cutoff) train += logProb[plain[i]];
    else holdout += logProb[plain[i]];
  }
  return { train: train / cutoff, holdout: holdout / (plain.length - cutoff) };
}

const outputResults = [];
for (const [name, clock] of Object.entries(clocks)) {
  for (const sign of [1, -1]) {
    const solution = outputAlphabet(original, clock, sign);
    outputResults.push({
      clock: name, sign,
      train: solution.train,
      heldout: solution.holdout,
    });
  }
}
const keyResults = [];
for (const [name, clock] of Object.entries(clocks)) {
  const solution = keyAlphabet(original, clock);
  keyResults.push({
    clock: name, train: solution.train, heldout: solution.holdout,
  });
}
const bestOutput = outputResults.slice().sort((a, b) => b.heldout - a.heldout)[0];
const bestKey = keyResults.slice().sort((a, b) => b.heldout - a.heldout)[0];
assert.equal(bestOutput.clock, "book");
assert.equal(bestOutput.sign, -1);
assert(Math.abs(bestOutput.heldout + 4.20755) < 0.00001);
assert.equal(bestKey.clock, "book");
assert(Math.abs(bestKey.heldout + 4.23362884419) < 0.000001);

// The actual original ciphertext is never used to select a positive
// key. Plant two separate complete native-GP ciphers under a known
// hidden 29-symbol permutation, then recover every key label from
// training runes only and decrypt every heldout rune exactly.
const plantedKey = Array.from({ length: 29 }, (_, i) => (17 * i + 9) % 29);
const clock = clocks.chapter;
const plantedOutput = original.map((_, i) =>
  plantedKey[mod29(native[i] + primeKey[clock[i]])]);
const recoveredOutput = outputAlphabet(plantedOutput, clock, 1);
for (let c = 0; c < 29; c++) {
  assert.equal(plantedKey[recoveredOutput.inverse[c]], c);
}
assert.deepEqual(recoveredOutput.plain, native.slice(0, original.length));

const plantedShift = original.map((_, i) =>
  mod29(native[i] + plantedKey[primeKey[clock[i]]]));
const recoveredShift = keyAlphabet(plantedShift, clock);
assert.deepEqual(recoveredShift.inverse, plantedKey);
assert.deepEqual(recoveredShift.plain, native.slice(0, original.length));

console.log(JSON.stringify({
  original_runes: original.length, original_training: cutoff,
  original_untouched_holdout: original.length - cutoff,
  output_alphabet: outputResults,
  key_alphabet: keyResults,
  best_output: bestOutput,
  best_key: bestKey,
  authentic_original_unknown_plaintext_recovered: false,
  planted_output: {
    train: recoveredOutput.train, heldout: recoveredOutput.holdout,
    recovered_all_29_key_labels: true,
    recovered_all_12956_native_runes: true,
  },
  planted_shift: {
    train: recoveredShift.train, heldout: recoveredShift.holdout,
    recovered_all_29_key_labels: true,
    recovered_all_12956_native_runes: true,
  },
}, null, 2));

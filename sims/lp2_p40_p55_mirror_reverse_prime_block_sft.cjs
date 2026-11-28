#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJson = (relative) =>
  JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

const gp = readJson("resources/liber-primus/lp2-corpus.json");
const solved = readJson("resources/external/relikd-solved-gp29-native-v1.json");
const mod29 = (value) => ((value % 29) + 29) % 29;

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  if (value % 2 === 0) return value === 2;
  for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
    if (value % divisor === 0) return false;
  }
  return true;
}

const primes = [];
for (let candidate = 2; primes.length < 6000; candidate += 1) {
  if (isPrime(candidate)) primes.push(candidate);
}

const runeIndex = new Map(gp.runes.map((rune, index) => [rune, index]));
const p56Source = solved.sections.find((section) => section.name === "p56_an_end");
assert.ok(p56Source);

/** @param {string} source @returns {number[]} */
function runeIndices(source) {
  return [...source]
    .filter((character) => runeIndex.has(character))
    .map((character) => runeIndex.get(character));
}

/**
 * Authentic p56-style encoder. Plaintext F=0 emits literal F and holds the
 * prime cursor; every other rune consumes prime[k]-1.
 * @param {number[]} plain
 * @param {1|-1} sign
 * @returns {{cipher:number[], consumed:number}}
 */
function encryptForward(plain, sign) {
  const cipher = [];
  let consumed = 0;
  for (const value of plain) {
    if (value === 0) {
      cipher.push(0);
      continue;
    }
    const key = mod29(primes[consumed] - 1);
    cipher.push(mod29(value + sign * key));
    consumed += 1;
  }
  return { cipher, consumed };
}

/**
 * Exact reachability for the same cipher along a chosen traversal. State is
 * only the number of consumed primes. At C=0 both literal-F hold and a legal
 * consuming branch are retained; a consuming branch yielding P=0 is forbidden.
 * @param {{page:number,local:number,c:number}[]} traversal
 * @param {1|-1} sign
 */
function inverseReachability(traversal, sign) {
  let states = new Set([0]);
  let maximumStates = 1;
  for (let offset = 0; offset < traversal.length; offset += 1) {
    const { c } = traversal[offset];
    const next = new Set();
    for (const consumed of states) {
      if (c === 0) next.add(consumed);
      const key = mod29(primes[consumed] - 1);
      const plain = mod29(c - sign * key);
      if (plain !== 0) next.add(consumed + 1);
    }
    states = next;
    maximumStates = Math.max(maximumStates, states.size);
    if (states.size === 0) {
      return { complete: false, failureOffset: offset, maximumStates };
    }
  }
  return {
    complete: true,
    failureOffset: null,
    maximumStates,
    finalStates: [...states].sort((a, b) => a - b),
  };
}

/**
 * Construct a whole-block reverse-key plant: traverse plaintext from the end,
 * apply the authentic forward prime clock, then restore natural source order.
 * @param {number[]} plain
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encryptReverseBlock(plain, sign) {
  return encryptForward(plain.slice().reverse(), sign).cipher.reverse();
}

const p56Plain = runeIndices(p56Source.source_text);
const p56Cipher = gp.pages.find((page) => page.page === 56).indices;
assert.equal(p56Plain.length, 85);
assert.equal(p56Cipher.length, 85);
const authentic = encryptForward(p56Plain, 1);
assert.equal(authentic.consumed, 84);
assert.deepEqual(authentic.cipher, p56Cipher);

for (const sign of [1, -1]) {
  const plantCipher = encryptReverseBlock(p56Plain, sign);
  const plantTraversal = plantCipher
    .map((c, local) => ({ page: 56, local, c }))
    .reverse();
  const planted = inverseReachability(plantTraversal, sign);
  assert.equal(planted.complete, true);
}

const sectionNatural = [];
for (const page of gp.pages.filter((item) => item.page >= 40 && item.page <= 55)) {
  for (let local = 0; local < page.indices.length; local += 1) {
    sectionNatural.push({ page: page.page, local, c: page.indices[local] });
  }
}
assert.equal(sectionNatural.length, 3316);
assert.equal(gp.pages.find((page) => page.page === 50).indices.length, 0);
const sectionReverse = sectionNatural.slice().reverse();

const plus = inverseReachability(sectionReverse, 1);
const minus = inverseReachability(sectionReverse, -1);
assert.deepEqual(
  { complete: plus.complete, failureOffset: plus.failureOffset, maximumStates: plus.maximumStates },
  { complete: false, failureOffset: 17, maximumStates: 1 }
);
assert.deepEqual(
  { complete: minus.complete, failureOffset: minus.failureOffset, maximumStates: minus.maximumStates },
  { complete: false, failureOffset: 10, maximumStates: 1 }
);

const plusFailure = sectionReverse[plus.failureOffset];
const minusFailure = sectionReverse[minus.failureOffset];
assert.deepEqual(plusFailure, { page: 55, local: 58, c: 2 });
assert.deepEqual(minusFailure, { page: 55, local: 65, c: 28 });

const plusPrime = primes[17];
const plusKey = mod29(plusPrime - 1);
assert.equal(plusPrime, 61);
assert.equal(plusKey, 2);
assert.equal(mod29(plusFailure.c - plusKey), 0);

const minusPrime = primes[10];
const minusKey = mod29(minusPrime - 1);
assert.equal(minusPrime, 31);
assert.equal(minusKey, 1);
assert.equal(mod29(minusFailure.c + minusKey), 0);

console.log(JSON.stringify({
  status: "PASS",
  hypothesis: "p40-p55 bilateral frame -> one reflected section -> reverse allocation of the authenticated p56 prime-minus-one/F-hold key",
  sourceSection: { startPage: 40, endPage: 55, runes: sectionNatural.length },
  authenticP56Control: { runes: p56Plain.length, consumedPrimes: authentic.consumed, exact: true },
  plantedReverseBlockControls: { plus: "reachable", minus: "reachable" },
  original: {
    authenticSign: {
      sign: 1,
      complete: plus.complete,
      failureReverseOffset: plus.failureOffset,
      failure: plusFailure,
      primeIndex: 17,
      prime: plusPrime,
      key: plusKey,
      forcedPlain: 0,
      reason: "nonzero ciphertext would decode to plaintext F, forbidden by authentic literal-F hold rule"
    },
    mirroredSignSensitivity: {
      sign: -1,
      complete: minus.complete,
      failureReverseOffset: minus.failureOffset,
      failure: minusFailure,
      primeIndex: 10,
      prime: minusPrime,
      key: minusKey,
      forcedPlain: 0,
      reason: "nonzero ciphertext would decode to plaintext F"
    }
  },
  decision: "Reject whole-section reverse prime-block transfer at source origin 0 for p40-p55; do not retune prime origin or add resets without a new source selector."
}, null, 2));

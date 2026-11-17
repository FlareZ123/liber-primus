"use strict";

/**
 * Director #1341: exact F-transparent prime-totient cipher with one mandatory
 * extra key advance at each authentic word separator. The original solved
 * LP2 p56 specifies K[j] = phi(prime[j]) mod 29 and a non-consuming F.
 *
 * This source-fixed word-advance extension is an analyst hypothesis. Test
 * both original GP additive directions, with all ambiguous ciphertext-F
 * branches retained, on original p0 and a disjoint p40 page.
 *
 * Read-only one-file SFT, Windows 11 Node.js 22, no extra dependencies.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const originalBytes = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"));
assert.equal(crypto.createHash("sha256").update(originalBytes).digest("hex"),
  "58588725a006432a50a1c8d852b881e5e844ba32073e729b42e0f78074b17338");
const corpus = JSON.parse(originalBytes.toString("utf8"));
const raw = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const chunks = raw.split("%");
assert.equal(chunks.length, 57);
const runeNumber = new Map(corpus.runes.map((r, i) => [r, i]));
const pages = [];
let newWord = true;
for (let sourcePage = 0; sourcePage < chunks.length; sourcePage++) {
  const physical = sourcePage < 50 ? sourcePage : sourcePage + 1;
  const cipher = [], wordStart = [];
  for (const char of chunks[sourcePage]) {
    if (runeNumber.has(char)) {
      cipher.push(runeNumber.get(char));
      wordStart.push(newWord);
      newWord = false;
    } else if ("-.&$§".includes(char)) {
      newWord = true;
    } else {
      assert.ok("/\r\n\t 0123456789".includes(char), "Unknown original glyph");
    }
  }
  assert.deepEqual(cipher, corpus.pages[physical].indices);
  pages[physical] = {cipher, wordStart};
}
assert.equal(corpus.pages[50].indices.length, 0);
assert.equal(pages.slice(0, 56).reduce((n, p) => n + (p ? p.cipher.length : 0), 0), 12956);

/** @param {number} count @returns {number[]} */
function primes(count) {
  const list = [];
  for (let candidate = 2; list.length < count; candidate++) {
    let isPrime = true;
    for (const p of list) {
      if (p * p > candidate) break;
      if (candidate % p === 0) { isPrime = false; break; }
    }
    if (isPrime) list.push(candidate);
  }
  return list;
}
const key = primes(1024).map((p) => (p - 1) % 29);
const mod = (v) => ((v % 29) + 29) % 29;

/** Reproduce p56 actual, WITHOUT the hypothesized extra-word advances. */
const actual56 = pages[56].cipher, decoded56 = [];
let j = 0;
for (let i = 0; i < actual56.length; i++) {
  if (i === 56) {
    assert.equal(actual56[i], 0);
    decoded56.push(0);
  } else {
    decoded56.push(mod(actual56[i] - key[j++]));
  }
}
assert.equal(j, 84);
assert.equal(decoded56.slice(0, 10).map((n) => corpus.translit[n]).join(""), "ANENDWITHIN");

/**
 * Exhaust all legal all-plaintext-F choices. At a genuine word start,
 * j advances by one before reading any rune; physical page/line wraps
 * never advance. A non-F plaintext consumes one K[j]; F is literal 0
 * and consumes no ordinary key value. Ciphertext F can mean either.
 *
 * @param {number[]} cipher
 * @param {boolean[]} boundaries
 * @param {1|-1} sign
 * @returns {object}
 */
function compatible(cipher, boundaries, sign) {
  let states = new Set([0]), largestStateSet = 1, globalMaxKeyIndex = 0;
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set(), prior = [];
    for (const before of states) {
      const clock = before + (i > 0 && boundaries[i] ? 1 : 0);
      const k = key[clock];
      assert.ok(k !== undefined, "Prime-source key stream exceeded capacity");
      const plaintext = mod(cipher[i] - sign * k);
      const transparent = cipher[i] === 0;
      const encrypted = plaintext !== 0;
      prior.push({pointer: clock, key: k, plaintext, transparent, encrypted});
      if (transparent) next.add(clock);
      if (encrypted) next.add(clock + 1);
      globalMaxKeyIndex = Math.max(globalMaxKeyIndex, clock);
    }
    if (next.size === 0) {
      return {
        compatible: false, failOffset: i, ciphertextIndex: cipher[i],
        ciphertextRune: corpus.translit[cipher[i]],
        wordStart: boundaries[i],
        previousPaths: states.size, forcedAlternatives: prior,
        greatestPriorStateCount: largestStateSet,
        furthestPrimeKeyIndex: globalMaxKeyIndex
      };
    }
    states = next;
    largestStateSet = Math.max(largestStateSet, states.size);
  }
  return {compatible: true, finalKeyStates: states.size, greatestPriorStateCount: largestStateSet};
}

/** Exact forward source-model encryptor for genuine solved native GP text. */
function encrypt(plaintext, boundaries, sign) {
  let clock = 0;
  const out = [];
  const actualPointers = [];
  for (let i = 0; i < plaintext.length; i++) {
    if (i && boundaries[i]) clock++;
    if (plaintext[i] === 0) {
      out.push(0);
    } else {
      out.push(mod(plaintext[i] + sign * key[clock]));
      clock++;
    }
    actualPointers.push(clock);
  }
  return {out, actualPointers};
}

/** All synthetic true key paths must survive the ambiguous-F decoder. */
function nativePlant(plaintext, boundaries, sign) {
  const plant = encrypt(plaintext, boundaries, sign);
  const result = compatible(plant.out, boundaries, sign);
  assert.equal(result.compatible, true);
  let states = new Set([0]);
  for (let i = 0; i < plant.out.length; i++) {
    const next = new Set();
    for (const before of states) {
      const phase = before + (i && boundaries[i] ? 1 : 0);
      if (plant.out[i] === 0) next.add(phase);
      if (mod(plant.out[i] - sign * key[phase]) !== 0) next.add(phase + 1);
    }
    assert.ok(next.has(plant.actualPointers[i]), "True source key pointer pruned at " + i);
    states = next;
  }
  return {runes: plaintext.length, trueKeyPathRetained: true, lastKeyPointer: plant.actualPointers.at(-1)};
}

const positives = [];
for (const sign of [1, -1]) {
  positives.push({
    sign,
    solvedP56OriginalCipherRecovered: decoded56.length,
    solvedP56PlantedWithExtraWordAdvances: nativePlant(decoded56, pages[56].wordStart, sign),
    clearP57PlantedWithExtraWordAdvances: nativePlant(pages[57].cipher, pages[57].wordStart, sign)
  });
}

const results = [];
for (const p of [0, 40]) {
  for (const sign of [1, -1]) {
    const candidate = compatible(pages[p].cipher, pages[p].wordStart, sign);
    results.push({physicalPage: p, sign, ...candidate});
  }
}
assert.equal(results.length, 4);
assert.deepEqual(results.map((r) => r.failOffset), [175, 256, 34, 20]);
assert.deepEqual(results.map((r) => r.ciphertextRune), ["L", "NG", "G", "L"]);
assert.ok(results.every((r) => !r.compatible));
const solvedOriginalUnderExtraWordAdvance = [
  compatible(pages[56].cipher, pages[56].wordStart, 1),
  compatible(pages[56].cipher, pages[56].wordStart, -1)
];
assert.deepEqual(solvedOriginalUnderExtraWordAdvance.map((r) => r.failOffset), [13, 23]);

console.log(JSON.stringify({
  classification: "Source-constrained mathematical exclusion; no unknown plaintext recovered",
  source: "Actual solved LP2 p56 phi(prime) non-consuming plaintext F plus printed LP2 word separators",
  extension: "Deterministically consume exactly one extra prime pad at each genuine word boundary",
  keyStart: "prime 2, K0=1", sourceRuneCount: 12956, sourceWordCount: 2896,
  keyConsumption: "F never consumes an ordinary prime key; ciphertext F branches exactly",
  knownActualP56Opening: "ANENDWITHIN",
  calibratedSolvedTextPositive: positives,
  realP56UnderHypotheticalUniversalExtraWordRule: solvedOriginalUnderExtraWordAdvance,
  untouchedUnknownPageGates: results,
  conclusion: "Both original pages exclude the fixed one-extra-per-word cipher even granting every legal transparent-F path; do not treat this as an exclusion of probabilistic advances, arbitrary keys or repairs."
}, null, 2));
console.log("PASS authentic-prime source-word-advance ambiguous-F exact original gate");

"use strict";

/**
 * Original LP2 printed-word prefix information-capacity gate.
 *
 * Determines whether first two ciphertext symbols have the properties of a
 * standalone, independently uniform 29^2-valued public nonce, and proves
 * the short-word bottleneck for any length-preserving reversible cipher with
 * an independent nonce. The test assumes neither a secret key nor plaintext.
 *
 * Run from repository root: node sims/lp2_wordprefix_twoheader_capacity_source_sft.cjs
 * Node.js 22 / Windows 11, CommonJS, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const source = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(source("resources/liber-primus/lp2-corpus.json"));
const transcript = source("resources/liber-primus/lp2-transcription.txt");
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const original = pages.flatMap((p) => p.indices);
const lookup = new Map(corpus.runes.map((r, i) => [r, i]));
const joined = transcript.split("%").slice(0, 55).join("")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runes = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const words = (joined.match(runes) || [])
  .map((w) => Array.from(w, (r) => lookup.get(r)));
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original, "exact canonical rune/source alignment");
const oneRune = words.filter((w) => w.length === 1).length;
const twoRunes = words.filter((w) => w.length === 2).length;
assert.equal(oneRune, 83);
assert.equal(twoRunes, 448);

const byPosition = [new Uint32Array(29 * 29), new Uint32Array(29 * 29)];
const n = [0, 0];
const equal = [0, 0];
for (const w of words) {
  for (let i = 1; i < w.length; i++) {
    const group = i === 1 ? 0 : 1;
    byPosition[group][29 * w[i - 1] + w[i]]++;
    n[group]++;
    if (w[i - 1] === w[i]) equal[group]++;
  }
}
assert.deepEqual(n, [2813, 7247]);
assert.deepEqual(equal, [12, 51]);
assert.equal(n[0] + n[1], 10060);
const collidingPairs = Array.from(byPosition[0])
  .reduce((a, v) => a + v * (v - 1) / 2, 0);
const distinctPrefixes = byPosition[0].filter((x) => x > 0).length;
assert.equal(collidingPairs, 4886);
assert.equal(distinctPrefixes, 802);

// Exact binomial left tail for the two independent uniform public header runes.
function binomialLeft(nSamples, k, prob) {
  let current = Math.pow(1 - prob, nSamples);
  let total = current;
  for (let i = 0; i < k; i++) {
    current *= (nSamples - i) * prob / ((i + 1) * (1 - prob));
    total += current;
  }
  return total;
}
const iidP = binomialLeft(n[0], equal[0], 1 / 29);
assert(Math.abs(iidP / 3.2990723687054184e-28 - 1) < 1e-10);

// Exact two-sided Fisher: compare first-pair diagonal rate to all later
// within-word predecessor pairs, conditioning on both observed margins.
const maxN = n[0] + n[1];
const logs = new Float64Array(maxN + 1);
for (let i = 1; i <= maxN; i++) logs[i] = logs[i - 1] + Math.log(i);
const chooseLog = (a, b) => logs[a] - logs[b] - logs[a - b];
const successes = equal[0] + equal[1];
const draw = n[0];
const denominator = chooseLog(maxN, draw);
const hyper = (x) => Math.exp(chooseLog(successes, x)
  + chooseLog(maxN - successes, draw - x) - denominator);
const observed = hyper(equal[0]);
let fisher = 0;
for (let x = Math.max(0, draw - (maxN - successes));
  x <= Math.min(successes, draw); x++) {
  const prob = hyper(x);
  if (prob <= observed * (1 + 1e-9)) fisher += prob;
}
assert(Math.abs(fisher - 0.12283248510504177) < 1e-7);

/**
 * Capacity of an independent, fully recoverable word nonce at a fixed GP29
 * output word length, when at least alphabetSize plain words are legal.
 * @param {number} wordLength
 * @param {number} alphabetSize
 */
function maxNonceStates(wordLength, alphabetSize) {
  return Math.floor(29 ** wordLength / alphabetSize);
}
assert.equal(maxNonceStates(1, 2), 14);
assert.equal(maxNonceStates(2, 2), 420);
assert.equal(maxNonceStates(2, 24), 35);

// Synthetic positive: a complete, independent 14-state nonce for A and I
// can coexist with the same one-rune GP alphabet. A 15th nonce state cannot.
const message = [24, 10, 10, 24, 10];
const nonces = [0, 13, 7, 3, 12];
const cipher = message.map((p, i) => ((p === 24 ? 0 : 1) * 14 + nonces[i]));
const plainAgain = cipher.map((c) => c < 14 ? 24 : 10);
const nonceAgain = cipher.map((c) => c % 14);
assert.deepEqual(plainAgain, message);
assert.deepEqual(nonceAgain, nonces);
assert(cipher.every((c) => c >= 0 && c < 29));

console.log(JSON.stringify({
  corpus: {runicPages: pages.length, runes: original.length, words: words.length,
    oneRune, twoRunes},
  firstTwo: {sites: n[0], equal: equal[0], distinctPrefixes,
    collidingPairs, uniformRawHeaderExpectedEqual: n[0] / 29,
    iidUniformRawHeaderLeftTailP: iidP},
  laterWithinWord: {sites: n[1], equal: equal[1],
    firstVsLaterFisherTwoSidedP: fisher},
  nonceCapacity: {oneRunePlainAI: maxNonceStates(1, 2),
    twoRunePlain24Vocabulary: maxNonceStates(2, 24)},
  positive: {oneRunePlaintextSymbols: plainAgain.length,
    nonceStates: 14, recovered: true}
}, null, 2));
console.log("PASS: original and synthetic standalone-nonce source gate");

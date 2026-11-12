"use strict";
/**
 * SFT: source-visible red-rune suffix and a literal AN END / PARABLE mixing key.
 *
 * Uses the canonical original ink annotations, original GP29 pages, and solved
 * Cicada controls. Pure transposition/all-secret alphabet permutation is tested
 * by exact optimal one-gram assignment. The literal mix test reads solved
 * p56/p57 plaintext in concat/interleave orders as a repeating GP29 additive
 * key, zero-based from physical p54 and continuing through p55.
 *
 * Run: node sims/lp2_red225_mix_end_parable_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotated = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const solved = read("resources/liber-primus/lp1-plaintext-reference.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} s @returns {number[]} */
function gpEncode(s) {
  const clean = s.toUpperCase().replace(/ING/g, "NG")
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const tok = tokens.find(t => word.startsWith(t.s, i));
      assert.ok(tok, "No GP token at " + word + " / " + i);
      out.push(tok.i);
      i += tok.s.length;
    }
  }
  return out;
}
/** @param {number[]} a @returns {number[]} */
function counts(a) {
  const f = Array(29).fill(0);
  for (const i of a) f[i]++;
  return f;
}
/** @param {number[]} a @returns {string} */
function name(a) {
  return a.map(i => corpus.translit[i]).join("");
}
const red = annotated.pages.flatMap(p =>
  (p.red_spans || []).flatMap(s =>
    [...s.runes].map(r => corpus.runes.indexOf(r))));
assert.equal(red.length, 225);
assert.ok(red.every(i => i >= 0 && i < 29));
const red210 = red.slice(0, 210);
assert.equal(name(red.slice(-15)), "XIMAEJOESRPARABLE");
const rCounts = counts(red210);
assert.deepEqual(rCounts, [
  7,7,9,6,3,11,9,5,9,5,8,6,12,7,10,7,9,7,3,11,8,8,4,9,9,5,5,7,4
]);

const p56Text = solved.split("### 56\n")[1].split("### 57\n")[0]
  .replace(/[0-9a-f]{20,}/gi, "");
const p57Text = solved.split("### 57\n")[1];
const p56 = gpEncode(p56Text);
const p57 = gpEncode(p57Text);
assert.equal(p56.length, 85);
assert.deepEqual(p57, corpus.pages.find(p => p.page === 57).indices);
assert.equal(name(p56.slice(0, 5)), "ANEND");
assert.equal(name(p57.slice(0, 7)), "PARABLE");

const allEnglish = gpEncode(shakespeare);
const train = allEnglish.slice(0, Math.floor(allEnglish.length * 0.75));
const held = allEnglish.slice(Math.floor(allEnglish.length * 0.75));
assert.equal(train.length, 163233);
assert.equal(held.length, 54411);
const f1 = Array(29).fill(0);
const f2 = Array(841).fill(0);
const f3 = Array(24389).fill(0);
for (let i = 0; i < train.length; i++) {
  f1[train[i]]++;
  if (i > 0) f2[29 * train[i - 1] + train[i]]++;
  if (i > 1) f3[841 * train[i - 2] + 29 * train[i - 1] + train[i]]++;
}
const unigram = f1.map(x => Math.log((x + 1) / (train.length + 29)))
  .sort((a, b) => b - a);

/** Exact maximum log-likelihood over all 29! output relabelings.
 * @param {number[]} f @returns {number}
 */
function bestPermutationOneGram(f) {
  return f.slice().sort((a, b) => b - a)
    .reduce((acc, val, i) => acc + val * unigram[i], 0) / 210;
}
const originalPerm = bestPermutationOneGram(rCounts);
assert.ok(Math.abs(originalPerm - (-3.713486497783472)) < 1e-10);
const slideCounts = counts(held.slice(0, 210));
let bestHeldMin = Infinity;
let notBetter = 0;
let totalHeld = 0;
for (let at = 0; at + 210 <= held.length; at++) {
  if (at) {
    slideCounts[held[at - 1]]--;
    slideCounts[held[at + 209]]++;
  }
  const s = bestPermutationOneGram(slideCounts);
  totalHeld++;
  if (s <= originalPerm) notBetter++;
  bestHeldMin = Math.min(bestHeldMin, s);
}
assert.equal(totalHeld, 54202);
assert.equal(notBetter, 0);
assert.ok(Math.abs(bestHeldMin - (-3.0753973026952535)) < 1e-10);

/** @param {number[]} a @returns {number} */
function score(a) {
  let acc = 0;
  for (let i = 0; i < a.length; i++) {
    const v = a[i];
    let p = (f1[v] + 1) / (train.length + 29);
    if (i) p = (f2[29 * a[i - 1] + v] + 8 * p) /
      (f1[a[i - 1]] + 8);
    if (i > 1) p = (f3[841 * a[i - 2] + 29 * a[i - 1] + v] + 8 * p) /
      (f2[29 * a[i - 2] + a[i - 1]] + 8);
    acc += Math.log(p);
  }
  return acc / a.length;
}
/** @param {number[]} a @param {number[]} b @param {boolean} firstA
 * @returns {number[]}
 */
function interleave(a, b, firstA) {
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (firstA) {
      if (i < a.length) out.push(a[i]);
      if (i < b.length) out.push(b[i]);
    } else {
      if (i < b.length) out.push(b[i]);
      if (i < a.length) out.push(a[i]);
    }
  }
  return out;
}
const target = corpus.pages.filter(p => p.page === 54 || p.page === 55)
  .flatMap(p => p.indices);
assert.equal(target.length, 308);
const keys = [
  ["56then57", p56.concat(p57)],
  ["57then56", p57.concat(p56)],
  ["zip56then57", interleave(p56, p57, true)],
  ["zip57then56", interleave(p56, p57, false)]
];
const candidates = [];
for (const [keyName, key] of keys) {
  assert.equal(key.length, 180);
  for (const sign of [1, -1]) {
    const plain = target.map((c, i) => (c + sign * key[i % 180] + 29) % 29);
    const reinverted = plain.map((p, i) => (p - sign * key[i % 180] + 29) % 29);
    assert.deepEqual(reinverted, target);
    candidates.push({
      key: keyName, sign,
      score: score(plain),
      prefix: name(plain.slice(0, 30))
    });
  }
}
candidates.sort((a, b) => b.score - a.score);
assert.equal(candidates[0].key, "zip57then56");
assert.equal(candidates[0].sign, 1);
assert.ok(Math.abs(candidates[0].score - (-6.135996169216149)) < 1e-10);
let minNative = Infinity;
for (let at = 0; at + target.length <= held.length; at++) {
  minNative = Math.min(minNative, score(held.slice(at, at + target.length)));
}
assert.ok(Math.abs(minNative - (-2.7348194412313704)) < 1e-10);
assert.ok(candidates[0].score < minNative);
const nativePlant = held.slice(1000, 1000 + 308);
for (const [keyName, key] of keys) {
  const encrypted = nativePlant.map((p, i) => (p + key[i % 180]) % 29);
  const recovered = encrypted.map((c, i) => (c - key[i % 180] + 29) % 29);
  assert.deepEqual(recovered, nativePlant, keyName + " native plant");
}

/** Tensor-style two-block mix implied by hypothetical footer:
 * 225 = (3+5+7) + 2*(3*5*7).
 * First 210 red symbols are two aligned 3x5x7 arrays, with 8 source
 * axis-reflection variants of the second array and four frozen GF29
 * pairwise operations; no fitted secret key or chosen offset.
 */
const redA = red.slice(0, 105);
const redB = red.slice(105, 210);
assert.deepEqual([redA.length, redB.length, red.length - 210], [105, 105, 15]);
assert.equal(2 * 3 * 5 * 7 + (3 + 5 + 7), red.length);
/** @param {number[]} xs @returns {number} */
function optimalOneGram105(xs) {
  const freq = counts(xs).sort((a, b) => b - a);
  return freq.reduce((sum, n, i) => sum + n * unigram[i], 0) / xs.length;
}
/** @param {number} mask @returns {number[]} */
function flipTensor(mask) {
  const res = [];
  for (let i = 0; i < 105; i++) {
    const p = Math.floor(i / 35);
    const q = Math.floor((i % 35) / 7);
    const r = i % 7;
    const p1 = (mask & 4) ? 2 - p : p;
    const q1 = (mask & 2) ? 4 - q : q;
    const r1 = (mask & 1) ? 6 - r : r;
    res.push(redB[35 * p1 + 7 * q1 + r1]);
  }
  return res;
}
/** @param {number[]} left @param {number[]} right
 * @param {string} op @returns {number[]}
 */
function mix105(left, right, op) {
  return left.map((v, i) => {
    const b = right[i];
    const x = op === 'A-B' ? v - b
      : op === 'B-A' ? b - v
        : op === 'A+B' ? v + b : -v - b;
    return (x % 29 + 29) % 29;
  });
}
const ops = ['A-B', 'B-A', 'A+B', '-A-B'];
const matrixResults = [];
let bestMatrixTri = -Infinity;
let bestMatrixOne = -Infinity;
for (let mask = 0; mask < 8; mask++) {
  const b = flipTensor(mask);
  for (const op of ops) {
    const decode = mix105(redA, b, op);
    const triScore = score(decode);
    const oneUpper = optimalOneGram105(decode);
    matrixResults.push({ mask, op, triScore, oneUpper });
    bestMatrixTri = Math.max(bestMatrixTri, triScore);
    bestMatrixOne = Math.max(bestMatrixOne, oneUpper);
    // Source-native positive control for every frozen exact inverse.
    const known = held.slice(2000, 2105);
    const cA = known.map((v, i) => op === 'A-B' ? (v + b[i]) % 29
      : op === 'B-A' ? (b[i] - v + 29) % 29
        : op === 'A+B' ? (v - b[i] + 29) % 29
          : (29 - v - b[i] % 29 + 29) % 29);
    assert.deepEqual(mix105(cA, b, op), known);
  }
}
assert.equal(matrixResults.length, 32);
assert.ok(Math.abs(bestMatrixTri - (-5.705695742171942)) < 1e-10);
assert.ok(Math.abs(bestMatrixOne - (-3.2836892228210224)) < 1e-10);
let native105TriMin = Infinity;
let native105OneMin = Infinity;
for (let at = 0; at + 105 <= held.length; at++) {
  const sample = held.slice(at, at + 105);
  native105TriMin = Math.min(native105TriMin, score(sample));
  native105OneMin = Math.min(native105OneMin, optimalOneGram105(sample));
}
assert.ok(Math.abs(native105TriMin - (-2.949299113091671)) < 1e-10);
assert.ok(Math.abs(native105OneMin - (-3.118569236146767)) < 1e-10);
assert.ok(bestMatrixTri < native105TriMin);
assert.ok(bestMatrixOne < native105OneMin);
const redAOneUpper = optimalOneGram105(redA);
const redBOneUpper = optimalOneGram105(redB);
assert.ok(Math.abs(redAOneUpper - (-3.5502472721730935)) < 1e-10);
assert.ok(Math.abs(redBOneUpper - (-3.4277728760290422)) < 1e-10);
assert.ok(redAOneUpper < native105OneMin);
assert.ok(redBOneUpper < native105OneMin);

console.log(JSON.stringify({
  red_runes: 225, red_suffix: name(red.slice(-15)),
  red210_best_secret_unigram: originalPerm,
  heldout_210_windows: totalHeld,
  heldout_210_min_same_secret_optimization: bestHeldMin,
  heldout_210_not_better: notBetter,
  p54_p55_runes: target.length,
  p54_p55_raw_trigram: score(target),
  heldout_308_min_trigram: minNative,
  original_half_105_best_secret_unigram: {A: redAOneUpper, B: redBOneUpper, heldout105_min: native105OneMin},
  tensor_3x5x7: { variants: matrixResults.length,
    best_original_trigram: bestMatrixTri,
    worst_native_105_trigram: native105TriMin,
    best_original_any_secret_29alphabet_unigram: bestMatrixOne,
    worst_native_105_same_optimization: native105OneMin,
    positive_controls: matrixResults.length },
  candidate_scores: candidates
}, null, 2));

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
assert.equal(train.length, 164100);
assert.equal(held.length, 54700);
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
assert.ok(Math.abs(originalPerm - (-3.714927339506815)) < 1e-10);
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
assert.equal(totalHeld, 54491);
assert.equal(notBetter, 0);
assert.ok(Math.abs(bestHeldMin - (-3.074933014997416)) < 1e-10);

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
console.log(JSON.stringify({
  red_runes: 225, red_suffix: name(red.slice(-15)),
  red210_best_secret_unigram: originalPerm,
  heldout_210_windows: totalHeld,
  heldout_210_min_same_secret_optimization: bestHeldMin,
  heldout_210_not_better: notBetter,
  p54_p55_runes: target.length,
  p54_p55_raw_trigram: score(target),
  heldout_308_min_trigram: minNative,
  candidate_scores: candidates
}, null, 2));

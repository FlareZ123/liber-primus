"use strict";

/**
 * Exact original-source red60 key and solved-page anchor gate.
 * Bounded hypothesis, not an authenticated LP2 cipher.
 * Run: node sims/lp2_p53_p54_red60_p56_boundary_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (name) => JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", name), "utf8"));
const source = read("lp2-corpus.json");
const ink = read("lp2-ink-annotations.json");
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0)
    / (xs.length * (xs.length - 1));
}

/** @param {number[]} xs @param {number[]} key @returns {number[]} */
const decipher = (xs, key) =>
  xs.map((c, i) => mod(c + key[i % key.length]));

/** @param {number[]} xs @param {number[]} key @returns {number[]} */
const encipher = (xs, key) =>
  xs.map((p, i) => mod(p - key[i % key.length]));

/** @param {number} p @param {number} start @param {number} length */
function redSpan(p, start, length) {
  const annotation = ink.pages.find((v) => v.page === p);
  assert.ok(annotation);
  const span = annotation.red_spans.find((v) =>
    v.start === start && v.length === length);
  assert.ok(span);
  const original = source.pages[p].indices.slice(start, start + length);
  assert.deepEqual([...span.runes], original.map((v) => source.runes[v]));
  return original;
}

assert.deepEqual([53,54,55,56,57].map((n) => source.pages[n].indices.length),
  [179,232,76,85,95]);
const key = [...redSpan(53,128,51), ...redSpan(54,0,9)];
assert.equal(key.length,60);
const target = [
  ...source.pages[54].indices.slice(9),
  ...source.pages[55].indices,
  source.pages[56].indices[0],
];
assert.deepEqual([source.pages[54].indices.length-9,
  source.pages[55].indices.length,1],[223,76,1]);
assert.equal(target.length,300);
const plaintext = decipher(target,key);
assert.deepEqual(encipher(plaintext,key),target);

// Solved p56: first visible ciphertext rune AE(25), phi(2)=1,
// therefore known first plaintext rune A(24).
const A=source.translit.indexOf("A");
assert.equal(A,24);
assert.equal(target[299],25);
assert.equal(mod(target[299]-1),A);
assert.equal(key[59],source.translit.indexOf("M"));
assert.equal(plaintext[299],source.translit.indexOf("S"));
assert.notEqual(plaintext[299],A);

// Planted 300-symbol native-GP positive with known A at last symbol.
const native=source.pages[57].indices;
const planted=Array.from({length:300},(_,i)=>
  i===299?A:native[i%native.length]);
assert.deepEqual(decipher(encipher(planted,key),key),planted);
console.log(JSON.stringify({
  hypothesis:"p53 red51 + p54 red9 = 60-rune Stage04 GP29 additive key",
  redKeyLength:key.length,
  originalPositions:"p54 local9..231, all p55, p56 local0",
  totalSymbols:target.length,completeKeyCycles:5,
  expectedKnownFinalGP:"A",
  observedCandidateFinalGP:source.translit[plaintext[299]],
  rawIoC:ioc(target),candidateIoC:ioc(plaintext),
  candidateFirst50:plaintext.slice(0,50).map(i=>source.translit[i]).join(" "),
  exactOriginalRoundtrip:true,exactNativePositive:"300/300",
  decision:"Reject this cross-page key schedule; p56 first symbol contradicts known plaintext."
},null,2));

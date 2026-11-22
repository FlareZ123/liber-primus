"use strict";
/**
 * Direct p56-authenticated prime-totient cipher transfer to the newly isolated
 * p39:119..end unit. The input and two cuneiform start primes are source-fixed.
 * The start/reset assumption is hypothetical; no unknown plaintext is claimed.
 *
 * Run: node sims/p39_three_dot_prime_reset_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { primes, decrypt, encrypt, ioc } =
  require("./lp2_cuneiform_prime_totient_sft.cjs");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const annotations = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const page39 = corpus.pages.find((p) => p.page === 39).indices;
const page56 = corpus.pages.find((p) => p.page === 56).indices;
const red39 = annotations.pages.find((p) => p.page === 39);
assert.equal(page39.length, 240);
assert.ok(red39.red_spans.some((s) => s.start === 119 && s.length === 3));
assert.deepEqual(red39.large_punctuation.filter((x) => x[0] <= 122),
  [[119, 13, "red"], [122, 13, "red"]]);
const source = page39.slice(119);
assert.equal(source.length, 121);
const p = primes(600);
assert.equal(p[173], 1033);
assert.equal(p[463], 3301);
let index = 0;
const solved = page56.map((c, i) => i === 56 ? c :
  (c - ((p[index++] - 1) % 29) + 29) % 29);
assert.equal(solved.length, 85);
assert.equal(solved.map((v) => corpus.translit[v]).join("").slice(0, 21),
  "ANENDWITHINTHEDEEPWEB");
assert.ok(ioc(solved) > 0.07);
const candidates = [2, 1033, 3301].map((startPrime) => {
  const ordinal0 = p.indexOf(startPrime);
  assert.ok(ordinal0 >= 0);
  const plain = decrypt(source, ordinal0, p);
  assert.deepEqual(encrypt(plain, ordinal0, p), source);
  return {
    startPrime, ordinal: ordinal0 + 1,
    ioc: ioc(plain),
    prefix: plain.slice(0, 47).map((v) => corpus.translit[v]).join("")
  };
});
const measured = [0.03402203856749311, 0.03595041322314049,
  0.03567493112947658];
candidates.forEach((item, i) => {
  assert.ok(Math.abs(item.ioc - measured[i]) < 1e-12);
});
console.log(JSON.stringify({
  interpretation: "If p39's triad + 13-dot heading resets the solved p56 cipher",
  status: "All 2 original cuneiform-prime starts and neutral solved-prime start remain random-like",
  p56AuthenticSolvedControlIoc: ioc(solved),
  sourceCipherIoc: ioc(source),
  candidateResults: candidates
}, null, 2));

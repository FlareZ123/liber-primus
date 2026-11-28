#!/usr/bin/env node
"use strict";

/*
 * Director #3300: exact all-key original-cipher control for one changing
 * noncommutative GP29 affine action using the p56 public prime ordinal clock.
 *
 * F (rune index 0) is transparent and does not advance the action.
 * All other runes index 1..28 are represented by Z/28Z.
 * A_i(z) = 3^(prime_i) z + prime_i-1 (mod 28).
 * T_i = A_i o ... o A_1 o T_0, T_0(z)=u*z+v.
 * C_i = 1+T_i(P_i-1); inverse uses T_i^-1.
 * The public G_i=A_i o ... o A_1 can be exactly unrolled first.
 * Every secret T_0 is a fixed permutation of the unrolled GP28 output.
 * Therefore unrolled marginal IoC is an all-336-key invariant.
 *
 * The noncommutative action is a hypothesis, NOT an authenticated Cicada
 * operation; this is a fully reversible source-derived finite gate.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const solved = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "external",
    "relikd-solved-gp29-native-v1.json"), "utf8"));
const idx = new Map(corpus.runes.map((v, i) => [v, i]));
const solvedSections = solved.sections.map(section => ({
  name: section.name,
  numbers: [...section.source_text].filter(r => idx.has(r)).map(r => idx.get(r))
}));
const native = solvedSections.flatMap(section => section.numbers);
assert.equal(native.length, 2979);
const known56 = solvedSections.find(x => x.name === "p56_an_end").numbers;
const known57 = solvedSections.find(x => x.name === "p57_parable").numbers;
assert.equal(known56.length, 85);
assert.equal(known57.length, 95);
assert.deepEqual(known57, corpus.pages[57].indices);

function mod28(x) {
  const m = x % 28;
  return m < 0 ? m + 28 : m;
}
function unitInverse(a) {
  for (let x = 1; x < 28; x++)
    if (mod28(x * a) === 1) return x;
  throw Error("nonunit " + a);
}
const units = Array.from({ length: 28 }, (_, i) => i)
  .filter(a => { try { unitInverse(a); return true; } catch { return false; } });
assert.equal(units.length, 12);
const power3 = [1, 3, 9, 27, 25, 19]; // order 6 mod28
const primes = [];
let nextCandidate = 2;
function primeAt(i) {
  while (primes.length <= i) {
    let n = nextCandidate++;
    let prime = true;
    for (const p of primes) {
      if (p * p > n) break;
      if (n % p === 0) { prime = false; break; }
    }
    if (prime) primes.push(n);
  }
  return primes[i];
}
function action(q) {
  return [power3[q % 6], mod28(q - 1)];
}
function unroll(cipher, u = 1, v = 0) {
  assert(units.includes(u) && Number.isInteger(v) && v >= 0 && v < 28);
  let a = 1, b = 0, clock = 0;
  const unrolled = [], plaintext = [];
  const invU = unitInverse(u);
  for (const c of cipher) {
    assert(Number.isInteger(c) && c >= 0 && c <= 28);
    if (c === 0) {
      unrolled.push(0);
      plaintext.push(0); // literal F, no prime increment
      continue;
    }
    const [m, t] = action(primeAt(clock++));
    a = mod28(m * a);
    b = mod28(m * b + t);
    const r = mod28(unitInverse(a) * (c - 1 - b));
    unrolled.push(1 + r);
    plaintext.push(1 + mod28(invU * (r - v)));
  }
  return { unrolled, plaintext, clock };
}
function encode(plaintext, u, v) {
  assert(units.includes(u));
  assert(Number.isInteger(v) && v >= 0 && v < 28);
  let a = 1, b = 0, clock = 0;
  const output = [];
  for (const p of plaintext) {
    assert(Number.isInteger(p) && p >= 0 && p <= 28);
    if (p === 0) {
      output.push(0);
      continue;
    }
    const [m, t] = action(primeAt(clock++));
    a = mod28(m * a);
    b = mod28(m * b + t);
    output.push(1 + mod28(a * mod28(u * (p - 1) + v) + b));
  }
  return output;
}
function pairs(seq) {
  const h = new Int32Array(29);
  for (const x of seq) h[x]++;
  return h.reduce((z, x) => z + x * (x - 1), 0);
}
function ioc(seq) {
  return pairs(seq) / (seq.length * (seq.length - 1));
}
function windowReference(n) {
  assert(n <= native.length);
  let h = new Int32Array(29);
  for (let i = 0; i < n; i++) h[native[i]]++;
  let minPairs = Infinity, maxPairs = 0, below045 = 0;
  for (let start = 0; start <= native.length - n; start++) {
    const k = h.reduce((z, x) => z + x * (x - 1), 0);
    if (k < minPairs) minPairs = k;
    if (k > maxPairs) maxPairs = k;
    if (k / (n * (n - 1)) < .045) below045++;
    if (start + n < native.length) {
      h[native[start]]--;
      h[native[start + n]]++;
    }
  }
  return {
    windows: native.length - n + 1,
    minimumIoC: minPairs / (n * (n - 1)),
    maximumIoC: maxPairs / (n * (n - 1)),
    below045
  };
}

// Genuine noncommutativity on the first two primes, q=2,3.
assert.deepEqual(action(2), [9, 1]);
assert.deepEqual(action(3), [27, 2]);
assert.equal(mod28(27 * (9 * 0 + 1) + 2), 1);  // A_3 o A_2 at z=0
assert.equal(mod28(9 * (27 * 0 + 2) + 1), 19); // A_2 o A_3 at z=0

// Native known-plaintext positives, including GP p56 with genuine plaintext
// recovered in historical references, not the raw encrypted page56 register.
for (const pl of [known56, known57, native.slice(0, 1874)]) {
  for (const [u, v] of [[1, 0], [11, 7], [27, 26]]) {
    const ct = encode(pl, u, v);
    const got = unroll(ct, u, v).plaintext;
    assert.deepEqual(got, pl);
    assert.deepEqual(encode(got, u, v), ct);
    assert.equal(ct.filter(c => c === 0).length,
      pl.filter(p => p === 0).length);
  }
}
const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22],
  [0, 7], [40, 53]
];
const outputs = [];
for (const [from, to] of chapters) {
  const ciphertext = corpus.pages.slice(from, to + 1)
    .flatMap(page => page.indices);
  const decoded = unroll(ciphertext);
  const keyFreePairs = pairs(decoded.unrolled);
  assert.equal(pairs(decoded.plaintext), keyFreePairs);
  // All 336 initial affine seeds are exhausted as a *single exact invariant*.
  for (const u of units)
    for (let v = 0; v < 28; v++) {
      const p = unroll(ciphertext, u, v).plaintext;
      assert.equal(pairs(p), keyFreePairs);
      assert.deepEqual(encode(p, u, v), ciphertext);
    }
  // The 2,979-source-rune native compilation supplies contiguous length-
  // matched control windows. For the 3,008-rune floral chapter use its first
  // 1,874 ciphertext runes as a fixed, independent-length diagnostic.
  const compare = ciphertext.length <= native.length
    ? decoded.plaintext
    : unroll(ciphertext.slice(0, 1874)).plaintext;
  const control = windowReference(compare.length);
  const report = {
    chapter: "p" + from + "-" + to,
    runes: ciphertext.length,
    consumed: decoded.clock,
    ciphertextIoC: ioc(ciphertext),
    allKeyDecodedIoC: ioc(decoded.plaintext),
    allKeyPairs: keyFreePairs,
    allInitialStatesChecked: units.length * 28,
    referenceLength: compare.length,
    referenceWindows: control.windows,
    referenceMinIoC: control.minimumIoC,
    originalCompareIoC: ioc(compare),
    referenceBelow045: control.below045,
    preview: decoded.plaintext.slice(0, 45)
      .map(x => corpus.translit[x]).join("-")
  };
  assert(report.allKeyDecodedIoC < .045);
  assert(report.originalCompareIoC < .045);
  assert(report.referenceMinIoC > .055);
  assert.equal(report.referenceBelow045, 0);
  outputs.push(report);
  console.log(JSON.stringify(report));
}
console.log(JSON.stringify({
  status: "PASS",
  positiveControls: "3 native plaintexts x 3 seeds, exact 100% inverse",
  exactCipherOriginal: 6,
  secretStateSpace: units.length * 28,
  oneStepNoncommuteWitness: "left=1, right=19 at first two primes",
  solvedP57IoC: ioc(known57),
  all336PairInvariance: true,
  nativeReferenceRunes: native.length,
  firstPrime: primeAt(0),
  lastPrime: primes[primes.length - 1]
}));

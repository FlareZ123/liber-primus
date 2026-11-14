"use strict";

/**
 * Source-only floral red-heading quotient as a self-seeded finite-field
 * feedback key, rather than the previously tested cyclic quotient pad.
 *
 * Human hypothesis: an original red heading H with root x=24 gives a
 * quotient Q=H/(x-24). Use Q's exact coefficients as the initial LFSR
 * state and H's coefficients as its characteristic polynomial. Decode
 * the following *complete* original floral chapter by one GP29 add/sub.
 *
 * Run: node sims/lp2_floral_red_root24_quotient_lfsr_sft.cjs
 * No network or packages. Node 22 CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} f */
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} a */
function inverse(a) {
  for (let i = 1; i < 29; i++) if (mod(i * a) === 1) return i;
  throw new Error("Leading coefficient must be a field unit");
}
/** @param {number[]} values */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const x of values) freq[x]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
/** @param {number[]} H @param {number} root */
function quotient(H, root) {
  const Q = [H[0]];
  for (let i = 1; i < H.length - 1; i++) {
    Q.push(mod(H[i] + root * Q[Q.length - 1]));
  }
  assert.equal(mod(H[H.length - 1] + root * Q[Q.length - 1]), 0);
  return Q;
}
/**
 * Characteristic H, high-first: H[0]k[t]+...+H[d]k[t-d]=0.
 * @param {number[]} H @param {number[]} seed @param {number} n
 */
function makeKey(H, seed, n) {
  const degree = H.length - 1;
  assert.equal(seed.length, degree);
  const key = seed.slice();
  const unit = inverse(H[0]);
  while (key.length < n) {
    const index = key.length;
    let sum = 0;
    for (let j = 1; j <= degree; j++) {
      sum += H[j] * key[index - j];
    }
    key.push(mod(-unit * sum));
  }
  return key;
}
const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
const results = [];
for (const [first, last, redLength] of [[40, 53, 8], [54, 55, 9]]) {
  const originalRed = corpus.pages[first].indices.slice(0, redLength);
  const annot = ink.pages.find(entry => entry.page === first).red_spans[0];
  assert.equal(annot.length, redLength);
  assert.equal(annot.start, 0);
  assert.equal([...annot.runes].length, redLength);
  const H = originalRed[0] === 0 ? originalRed.slice(1) : originalRed;
  const seed = quotient(H, 24);
  const body = corpus.pages.slice(first, last + 1).flatMap(page =>
    page.indices.slice(page.page === first ? redLength : 0));
  assert.equal(body.length, first === 40 ? 3000 : 299);
  if (first === 40) {
    assert.deepEqual(H, [9, 19, 26, 6, 23, 25, 8]);
    assert.deepEqual(seed, [9, 3, 11, 9, 7, 19]);
  } else {
    assert.deepEqual(H, [24, 19, 21, 23, 27, 2, 14, 10, 19]);
    assert.deepEqual(seed, [24, 15, 4, 3, 12, 0, 14, 27]);
  }
  const key = makeKey(H, seed, body.length);
  const raw = ioc(body);
  const signs = [];
  for (const sign of [-1, 1]) {
    const decoded = body.map((v, i) => mod(v + sign * key[i]));
    const reencoded = decoded.map((v, i) => mod(v - sign * key[i]));
    assert.deepEqual(reencoded, body);
    const nativePlant = Array.from({length: body.length}, (_, i) =>
      solved[i % solved.length]);
    const planted = nativePlant.map((v, i) => mod(v - sign * key[i]));
    assert.deepEqual(planted.map((v, i) => mod(v + sign * key[i])),
      nativePlant);
    signs.push({sign, ioc: ioc(decoded),
      firstThirty: decoded.slice(0, 30).map(i => corpus.translit[i]).join("")});
  }
  results.push({
    originalChapter: [first, last], headerLength: redLength,
    originalBodyRunes: body.length, root: 24,
    coefficientOrder: "high-first", polynomial: H,
    quotientInitialState: seed, firstTenKey: key.slice(0, 10),
    rawIoC: raw, fixedSignCandidates: signs,
    nativePlantRecovered: body.length
  });
}
assert(Math.abs(results[0].fixedSignCandidates[0].ioc -
  0.034353228854062466) < 1e-12);
assert(Math.abs(results[0].fixedSignCandidates[1].ioc -
  0.03446548849616539) < 1e-12);
assert(Math.abs(results[1].fixedSignCandidates[0].ioc -
  0.033848847388386345) < 1e-12);
assert(Math.abs(results[1].fixedSignCandidates[1].ioc -
  0.034073309241094474) < 1e-12);
console.log(JSON.stringify({result: "original-input negative; no plaintext or key",
  fixedCandidateSignCount: 4, chapterTests: results}, null, 2));

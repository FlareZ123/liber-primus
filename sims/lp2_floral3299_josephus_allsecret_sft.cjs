"use strict";
/**
 * Frozen 3299-rune floral-ring Josephus inverse, using original LP2 sources.
 * Tests one-step GF(29) feedback under every secret fixed output permutation.
 * SFT: Node.js 22 CommonJS, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const mod29 = n => (n % 29 + 29) % 29;
const redAt = (p, start, len) => {
  const marks = ink.pages.find(x => x.page === p).red_spans;
  assert(marks.some(x => x.start === start && x.length === len));
  return corpus.pages[p].indices.slice(start, start + len);
};
assert.equal(redAt(40, 0, 8).length, 8);
assert.equal(redAt(53, 128, 51).length, 51);
assert.equal(redAt(54, 0, 9).length, 9);
const red = [...redAt(40, 0, 8), ...redAt(53, 128, 51),
  ...redAt(54, 0, 9)];
assert.equal(red.length, 68);
assert.equal(red.reduce((s, r) => s + corpus.prime[r], 0), 3294);
const body = corpus.pages.slice(40, 56).flatMap(p =>
  p.indices.slice(p.page === 40 ? 8 : p.page === 54 ? 9 : 0));
assert.equal(body.length, 3299);
assert.equal(3301 - 3294, 7);
const printed = [3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
// First fourteen indexed primes are below 3301; the last two exceed it.
// The printed square uses absolute differences, so invert with the known
// strictly increasing Fibonacci-prime sequence, not abs(3301 - cell).
const primes = printed.map((n, i) => i < 14 ? 3301 - n : 3301 + n);
assert.deepEqual(primes,
  [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507]);

/**
 * Remove the kth still-live glyph, repeatedly; negative direction
 * counts backwards from the same gap. No wrap optimization or phase fit.
 * @param {number} count
 * @param {number[]} steps
 * @param {1|-1} direction
 * @returns {number[]}
 */
function josephus(count, steps, direction) {
  const remaining = Array.from({length:count}, (_, i) => i);
  const indices = [];
  let cursor = 0;
  while (remaining.length) {
    const k = steps[indices.length % steps.length];
    cursor = ((cursor + (direction === 1 ? k - 1 : 1 - k))
      % remaining.length + remaining.length) % remaining.length;
    indices.push(remaining.splice(cursor, 1)[0]);
  }
  assert.equal(new Set(indices).size, count);
  return indices;
}
/** @param {number[]} values */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const value of values) {
    assert(value >= 0 && value < 29);
    hist[value]++;
  }
  return hist.reduce((s, n) => s + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
/**
 * Under R[i]=a*R[i-1]+h(P[i]) mod29, any secret bijection h
 * preserves this exact plaintext collision index.
 * @param {number[]} ordered
 * @param {number} a
 */
function feedback(ordered, a) {
  return ordered.slice(1).map((v, j) => mod29(v - a * ordered[j]));
}

const expected = [
  ["constant7", 1, 22, 0.034665176071085074],
  ["constant7", -1, 17, 0.03468871953535502],
  ["printed16", 1, 23, 0.03465689907192768],
  ["printed16", -1, 22, 0.034584613279286365],
  ["primes16", 1, 12, 0.03455260888254442],
  ["primes16", -1, 9, 0.034732863530861156],
];
const steps = {constant7:[7], printed16:printed, primes16:primes};
const results = [];
for (const [name, direction, bestA, bestIoc] of expected) {
  const order = josephus(body.length, steps[name], direction);
  const ordered = order.map(pos => body[pos]);
  assert.equal(ioc(ordered), ioc(body));
  const ranked = Array.from({length:29}, (_, a) =>
    ({a, ioc:ioc(feedback(ordered, a))}))
    .sort((u,v) => v.ioc - u.ioc || u.a - v.a);
  assert.equal(ranked[0].a, bestA);
  assert(Math.abs(ranked[0].ioc - bestIoc) < 1e-12);
  results.push({name, direction, best:ranked[0],
    deltaAtOne:ioc(feedback(ordered, 1)), testedCoefficients:29});
}
// Nonlinear secret 29-way alphabet; a planted source-native p57
// length-3298 runic passage must be recovered by its exact key.
const p57 = corpus.pages[57].indices;
assert.equal(p57.length, 95);
const h = Array.from({length:29}, (_, p) => mod29(p ** 5 + 7));
assert.equal(new Set(h).size, 29);
const inverse = Array(29).fill(-1);
h.forEach((v,p) => { inverse[v] = p; });
const native = Array.from({length:3298}, (_, j) => p57[j % p57.length]);
const alpha = 17, base = 24;
const order = josephus(body.length, [7], 1);
const generated = [base];
for (const p of native)
  generated.push(mod29(alpha * generated.at(-1) + h[p]));
const ciphertext = Array(body.length).fill(-1);
order.forEach((pos, j) => { ciphertext[pos] = generated[j]; });
const reread = order.map(pos => ciphertext[pos]);
assert.deepEqual(reread, generated);
const recovered = feedback(reread, alpha).map(v => inverse[v]);
assert.deepEqual(recovered, native);
assert(ioc(recovered) > 0.05);
assert(results.every(r => r.best.ioc < 0.04));
console.log(JSON.stringify({
  input:"original LP2 p40-55 body without the p40/p54 red headings",
  sourceRunes:body.length, redRunePrimeSum:3294, originalIoc:ioc(body),
  allSecretOneTapCoefficientCases:results.length * 29, results,
  nativeSolvedP57Plant: {recovered:recovered.length,
    nativeIoc:ioc(native), exactReencryption:true},
  verdict:"No ordinary native-GP-English text under any tested Josephus order, one-step feedback slope and fixed secret alphabet. No recovered original plaintext."
}, null, 2));

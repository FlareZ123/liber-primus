"use strict";

/**
 * Original LP2 p6-p8 red-word field coverage.
 * Seven predeclared source aggregators, 120 printed p7 product orders,
 * p7 black-dot GF29 5-share interpolation and DH equation checks.
 * All recovered numbers are conditional hypotheses, NOT decrypted prose.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeIndex = new Map(gp.runes.map((rune, index) => [rune, index]));
const mod = n => (n % 29 + 29) % 29;

function inverse(v) {
  for (let i = 1; i < 29; i++) if (mod(i * v) === 1) return i;
  throw Error("GF29 denominator not invertible");
}

function interpolation(xs, ys) {
  assert.equal(xs.length, 5);
  assert.equal(new Set(xs).size, 5);
  const coeff = Array(5).fill(0);
  for (let j = 0; j < 5; j++) {
    let poly = [1], denom = 1;
    for (let k = 0; k < 5; k++) {
      if (j === k) continue;
      const next = Array(poly.length + 1).fill(0);
      for (let i = 0; i < poly.length; i++) {
        next[i] = mod(next[i] - xs[k] * poly[i]);
        next[i + 1] = mod(next[i + 1] + poly[i]);
      }
      poly = next;
      denom = mod(denom * (xs[j] - xs[k]));
    }
    const scale = mod(ys[j] * inverse(denom));
    for (let i = 0; i < poly.length; i++) coeff[i] = mod(coeff[i] + poly[i] * scale);
  }
  assert.deepEqual(xs.map(x => coeff.reduceRight((acc, v) => mod(acc * x + v), 0)), ys);
  return coeff;
}

function printedPageWords(page) {
  const words = transcript[page].replace(/[\/\r\n&]/g, "")
    .split(/[-.\s§0-9$]+/g)
    .filter(word => [...word].some(ch => runeIndex.has(ch)));
  const ret = [];
  let offset = 0;
  for (const word of words) {
    const nums = [...word].map(ch => runeIndex.get(ch));
    assert.ok(nums.every(Number.isInteger));
    ret.push({start: offset, end: offset + nums.length, nums});
    offset += nums.length;
  }
  assert.deepEqual(ret.flatMap(x => x.nums),
    gp.pages.find(p => p.page === page).indices, "source page and original word alignment");
  return ret;
}

function redWords(page) {
  const spans = ink.pages.find(p => p.page === page).red_spans;
  assert.equal(spans.length, 1);
  const {start, length} = spans[0];
  const selected = printedPageWords(page)
    .filter(w => w.start >= start && w.end <= start + length)
    .map(w => w.nums);
  assert.deepEqual(selected.flat(),
    gp.pages.find(p => p.page === page).indices.slice(start, start + length),
    "all source red runes consumed");
  return selected;
}

const red6 = redWords(6), red7 = redWords(7), red8 = redWords(8);
assert.deepEqual(red6.map(x => x.length), [4, 1, 4, 2]);
assert.deepEqual(red7.map(x => x.length), [2, 4, 3, 2, 3]);
assert.deepEqual(red8.map(x => x.length), [4, 8]);

const ops = {
  indexProduct: a => a.reduce((z, x) => mod(z * x), 1),
  indexSum: a => mod(a.reduce((z, x) => z + x, 0)),
  primeProduct: a => a.reduce((z, x) => mod(z * gp.prime[x]), 1),
  primeSum: a => mod(a.reduce((z, x) => z + gp.prime[x], 0)),
  firstIndex: a => a[0],
  lastIndex: a => a[a.length - 1],
  length: a => a.length
};
const values = Object.entries(ops).map(([operation, fn]) => ({
  operation, p6: red6.map(fn), p7: red7.map(fn), p8: red8.map(fn)
}));
const product = values[0];
assert.deepEqual(product.p6, [13, 19, 14, 23]);
assert.deepEqual(product.p7, [11, 26, 8, 15, 2]);
assert.deepEqual(product.p8, [4, 3]);
assert.equal(red6[1][0], 19);
assert.equal(gp.translit[19], "M");
const dotHorizontal = [1, 2, 3, 4, 5], dotVertical = [3, 5, 1, 4, 2];
const H = interpolation(dotHorizontal, product.p7);
const V = interpolation(dotVertical, product.p7);
assert.deepEqual(H, [5, 6, 23, 26, 9]);
assert.deepEqual(V, [23, 18, 21, 22, 11]);
assert.equal(gp.pages.find(p => p.page === 8).indices.slice(12).length, 3**5);

function powmod(base, exponent, prime) {
  if (prime < 2) return NaN;
  let result = 1;
  for (let i = 0; i < exponent; i++) result = result * (base % prime) % prime;
  return result;
}
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i*i <= n; i++) if (n % i === 0) return false;
  return true;
}
function dhState(seven, B) {
  const coefficients = interpolation(dotHorizontal, seven);
  const [g, a, p] = coefficients;
  const [A, b, K] = seven.slice(2);
  const checks = {
    prime: isPrime(p), A: powmod(g, a, p) === A,
    B: powmod(g, b, p) === B,
    secret1: powmod(A, b, p) === K,
    secret2: powmod(B, a, p) === K
  };
  return {g, a, p, A, b, K, B, coefficients, valid: Object.values(checks).every(Boolean), checks};
}
const state = dhState(product.p7, product.p6[1]);
assert.equal(state.valid, true);
assert.deepEqual([state.p, state.g, state.a, state.b,
  state.A, state.B, state.K, product.p8[1], product.p8[0]],
  [23, 5, 6, 15, 8, 19, 2, 3, 4]);

function permutations(arr) {
  if (!arr.length) return [[]];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const remainder = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const suffix of permutations(remainder)) result.push([arr[i], ...suffix]);
  }
  return result;
}
const orders = permutations(product.p7);
assert.equal(orders.length, 120);
const matches = orders.filter(order => dhState(order, product.p6[1]).valid);
assert.deepEqual(matches, [product.p7], "one DH-consistent original p7 order in fixed family");
const alternative = values.slice(1).map(row => ({
  operation: row.operation, p6: row.p6, p7: row.p7, p8: row.p8,
  valid: dhState(row.p7, row.p6[1]).valid
}));
assert.ok(alternative.every(x => !x.valid), "none of six alternative red-word aggregators passes");

const plant = [7, 11, 3, 9, 17];
assert.deepEqual(interpolation(dotHorizontal, dotHorizontal.map(x =>
  plant.reduceRight((sum, coefficient) => mod(sum * x + coefficient), 0)
)), plant, "source-native GF29 planted calibration");

console.log(JSON.stringify({
  p6: product.p6, p7: product.p7, p8: product.p8,
  p6IsolatedRedM19: red6[1][0],
  p7DotInterpolationHorizontal: H, p7DotInterpolationVertical: V,
  dhState: state, inferredSecondPair: {q:product.p8[0], e:product.p8[1]},
  adjacentP8BlackRunes: 243,
  finiteControls: {aggregateFamilies: values.length,
    alternateOperations: alternative, allOrders: orders.length,
    originalOrderValidDH: matches.length, plantedInterpolation: "PASS"},
  disclaimer: "The nine DH-field correspondences are retrospective source-numeric hypotheses; no first-party instruction selects multiplication, Shamir GF29, field roles, or a LP2 body cipher. No new plaintext."
}, null, 2));

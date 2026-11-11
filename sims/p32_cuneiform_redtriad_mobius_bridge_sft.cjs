"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const MOD = 29;
const mod = (n) => ((n % MOD) + MOD) % MOD;

/** @param {number} a @returns {number} */
function inv(a) {
  for (let x = 1; x < MOD; x++) if (mod(a * x) === 1) return x;
  throw new Error("noninvertible field element");
}

/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function matMul(a, b) {
  return [
    [mod(a[0][0] * b[0][0] + a[0][1] * b[1][0]), mod(a[0][0] * b[0][1] + a[0][1] * b[1][1])],
    [mod(a[1][0] * b[0][0] + a[1][1] * b[1][0]), mod(a[1][0] * b[0][1] + a[1][1] * b[1][1])],
  ];
}

/** @param {number[][]} a @returns {number[][]} */
function matInv(a) {
  const det = mod(a[0][0] * a[1][1] - a[0][1] * a[1][0]);
  const d = inv(det);
  return [
    [mod(a[1][1] * d), mod(-a[0][1] * d)],
    [mod(-a[1][0] * d), mod(a[0][0] * d)],
  ];
}

/** @param {number[][]} a @param {number} n @returns {number[][]} */
function matPow(a, n) {
  let out = [[1, 0], [0, 1]];
  let base = a;
  let e = n;
  while (e > 0) {
    if (e & 1) out = matMul(out, base);
    base = matMul(base, base);
    e >>= 1;
  }
  return out;
}

/** @param {number[][]} a @returns {number[]} */
function pglNorm(a) {
  const flat = a.flat().map(mod);
  const first = flat.find((x) => x !== 0);
  assert.notEqual(first, undefined);
  const s = inv(first);
  return flat.map((x) => mod(x * s));
}

/** @param {number[][]} a @param {number[][]} b @returns {boolean} */
function samePGL(a, b) {
  return JSON.stringify(pglNorm(a)) === JSON.stringify(pglNorm(b));
}

/**
 * Apply a PGL2 matrix to P1(F29). null denotes projective infinity.
 * @param {number[][]} a
 * @param {number|null} x
 * @returns {number|null}
 */
function applyPGL(a, x) {
  if (x === null) return a[1][0] === 0 ? null : mod(a[0][0] * inv(a[1][0]));
  const den = mod(a[1][0] * x + a[1][1]);
  if (den === 0) return null;
  return mod((a[0][0] * x + a[0][1]) * inv(den));
}

/** @param {number[][]} a @returns {(number|null)[][]} */
function cycles(a) {
  const points = [...Array(MOD).keys(), null];
  const key = (x) => x === null ? "inf" : String(x);
  const seen = new Set();
  const out = [];
  for (const start of points) {
    if (seen.has(key(start))) continue;
    const cycle = [];
    let x = start;
    while (!seen.has(key(x))) {
      seen.add(key(x));
      cycle.push(x);
      x = applyPGL(a, x);
    }
    out.push(cycle);
  }
  return out;
}

/** @param {number[][]} a @returns {number} */
function projectiveOrder(a) {
  const identity = [[1, 0], [0, 1]];
  let p = identity;
  for (let n = 1; n <= 900; n++) {
    p = matMul(p, a);
    if (samePGL(p, identity)) return n;
  }
  throw new Error("projective order not found");
}

/** @param {number[][]} a @param {number|null} start @returns {number} */
function orbitLength(a, start) {
  const seen = new Map();
  const key = (x) => x === null ? "inf" : String(x);
  let x = start;
  for (let n = 0; n <= 900; n++) {
    const k = key(x);
    if (seen.has(k)) {
      assert.equal(seen.get(k), 0);
      return n;
    }
    seen.set(k, n);
    x = applyPGL(a, x);
  }
  throw new Error("orbit length not found");
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** One-based prime ordinal. @param {number} p @returns {number} */
function primeOrdinal(p) {
  assert.ok(isPrime(p));
  let count = 0;
  for (let n = 2; n <= p; n++) if (isPrime(n)) count++;
  return count;
}

const cuneiform = [1033, 3301];
const ranks = cuneiform.map(primeOrdinal);
assert.deepEqual(ranks, [174, 464]);
assert.deepEqual(ranks.map((x) => x / 29), [6, 16]);
assert.deepEqual(ranks.map((x) => x / 58), [3, 8]);

const p32 = corpus.pages.find((p) => p.page === 32);
assert.ok(p32);
assert.equal(p32.indices.length, 121);
const at = (r, c) => p32.indices[r * 11 + c];
const pv = (r, c) => corpus.prime[at(r, c)];
const side = {
  N: [pv(3, 4), pv(3, 5), pv(3, 6)],
  E: [pv(4, 7), pv(5, 7), pv(6, 7)],
  S: [pv(7, 4), pv(7, 5), pv(7, 6)],
  W: [pv(4, 3), pv(5, 3), pv(6, 3)],
};
const corner = { TL: pv(3, 3), TR: pv(3, 7), BR: pv(7, 7), BL: pv(7, 3) };
const sum = (a) => a.reduce((x, y) => x + y, 0);
assert.equal(sum(Object.values(side).flat()) + sum(Object.values(corner)), 1136);

/** @param {number} mask @returns {number[][]} */
function cornerMatrix(mask) {
  const s = { N: sum(side.N), E: sum(side.E), S: sum(side.S), W: sum(side.W) };
  if (mask & 1) s.W += corner.TL; else s.N += corner.TL;
  if (mask & 2) s.E += corner.TR; else s.N += corner.TR;
  if (mask & 4) s.E += corner.BR; else s.S += corner.BR;
  if (mask & 8) s.W += corner.BL; else s.S += corner.BL;
  return [[mod(s.N), mod(s.E)], [mod(s.S), mod(s.W)]];
}

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
/** @param {number} page @returns {number[]} */
function redTriad(page) {
  const record = ink.pages.find((p) => p.page === page);
  assert.ok(record);
  const span = record.red_spans.find((s) => s.start === 119 && s.length === 3);
  assert.ok(span);
  return [...span.runes].map((r) => {
    const i = runeIndex.get(r);
    assert.notEqual(i, undefined);
    return i;
  });
}
const red3 = redTriad(3);
const red39 = redTriad(39);
assert.deepEqual(red3, [13, 23, 2]);
assert.deepEqual(red39, [27, 5, 15]);

const target13 = mod(3301);
const targetCyclePrimeSum = ranks[0];
const correction = [ranks[0] / 58, 0, ranks[1] / 58];
assert.equal(target13, 24);
assert.deepEqual(correction, [3, 0, 8]);

const candidates = [];
for (let mask = 0; mask < 16; mask++) {
  const matrix = cornerMatrix(mask);
  const det = mod(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]);
  if (det === 0) continue;
  const cs = cycles(matrix);
  const finitePrimeSums = cs.map((cycle) =>
    cycle.filter((x) => x !== null).reduce((n, x) => n + corpus.prime[x], 0));
  const mappedTriad = red3.map((x) => applyPGL(matrix, x));
  const triadCorrection = mappedTriad.map((x, i) => x === null ? null : mod(red39[i] - x));
  candidates.push({ mask, matrix, order: projectiveOrder(matrix), f13: applyPGL(matrix, 13), finitePrimeSums, mappedTriad, triadCorrection });
}
const selectedByCuneiform = candidates.filter((x) =>
  x.f13 === target13 && x.finitePrimeSums.includes(targetCyclePrimeSum));
assert.equal(selectedByCuneiform.length, 1);
assert.equal(selectedByCuneiform[0].mask, 0);
const selectedByTriadBridge = candidates.filter((x) =>
  JSON.stringify(x.triadCorrection) === JSON.stringify(correction));
assert.equal(selectedByTriadBridge.length, 1);
assert.equal(selectedByTriadBridge[0].mask, 0);

const M7 = selectedByCuneiform[0].matrix;
assert.deepEqual(M7, [[14, 25], [25, 28]]);
assert.equal(projectiveOrder(M7), 7);
assert.deepEqual(red3.map((x) => applyPGL(M7, x)), [24, 5, 7]);
assert.deepEqual(selectedByCuneiform[0].triadCorrection, [3, 0, 8]);

const cycle174 = cycles(M7).find((cycle) =>
  cycle.filter((x) => x !== null).reduce((n, x) => n + corpus.prime[x], 0) === 174);
assert.ok(cycle174);
assert.ok(cycle174.includes(null));
assert.deepEqual(new Set(cycle174.filter((x) => x !== null)), new Set([2, 7, 8, 10, 11, 16]));

const A = [[11, 6], [6, 11]];
const Q16 = [[16, 9], [0, 1]];
assert.ok(samePGL(M7, matMul(matMul(Q16, matPow(A, 16)), matInv(Q16))));

const translation = (n) => [[1, mod(n)], [0, 1]];
const coordinateMaps = correction.map((n) => matMul(translation(n), M7));
const coordinateOrders = coordinateMaps.map(projectiveOrder);
const startOrbitLengths = coordinateMaps.map((a, i) => orbitLength(a, red3[i]));
assert.deepEqual(coordinateOrders, [14, 7, 15]);
assert.deepEqual(startOrbitLengths, [14, 7, 15]);
assert.deepEqual(red3.map((x, i) => applyPGL(coordinateMaps[i], x)), red39);
const jointPeriod = 210;

let state = red3.slice();
for (let n = 1; n <= jointPeriod; n++) {
  state = state.map((x, i) => applyPGL(coordinateMaps[i], x));
  if (n < jointPeriod) assert.notDeepEqual(state, red3);
}
assert.deepEqual(state, red3);

const headedPages = corpus.pages.filter((p) => p.page >= 33 && p.page <= 39);
const headedRunes = headedPages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(headedPages.length, 7);
assert.equal(headedRunes, 1680);
assert.equal(headedRunes / jointPeriod, 8);

const divisibleSevenPageWindows = [];
for (let first = 0; first + 6 <= 55; first++) {
  const pages = corpus.pages.filter((p) => p.page >= first && p.page <= first + 6);
  if (pages.length !== 7) continue;
  const runes = pages.reduce((n, p) => n + p.indices.length, 0);
  if (runes % jointPeriod === 0) divisibleSevenPageWindows.push([first, first + 6, runes, runes / jointPeriod]);
}
assert.deepEqual(divisibleSevenPageWindows, [[33, 39, 1680, 8]]);

console.log(JSON.stringify({
  cuneiform: { values: cuneiform, primeRanks: ranks, divide29: [6, 16], divide58: [3, 8] },
  redTriads: { p3: red3, p39: red39 },
  p32: { ringPrimeSum: 1136, selectedCornerMask: 0, M7, order: 7, map13: applyPGL(M7, 13), cycle174, p3Mapped: red3.map((x) => applyPGL(M7, x)), correction },
  coordinateRecurrence: { maps: coordinateMaps, orders: coordinateOrders, sourceOrbitLengths: startOrbitLengths, jointPeriod, firstStep: red3.map((x, i) => applyPGL(coordinateMaps[i], x)) },
  headedSection: { pages: [33, 39], runes: headedRunes, periods: headedRunes / jointPeriod, uniqueSevenPageDivisibility: divisibleSevenPageWindows },
  verdict: "Exact source-derived selector and red-triad state bridge; no plaintext readout is yet specified.",
}, null, 2));

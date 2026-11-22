"use strict";
/**
 * All-secret quadratic table-to-known-terminal-rune gate.
 * Original GP29 manuscript and printed 256-token table only.
 * CommonJS, Node.js 22. Run from repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const load = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", p), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const bytes = load("resources/liber-primus/lp2-grid-256.json").bytes;
const mod = (n) => ((n % 29) + 29) % 29;
assert.equal(bytes.length, 256);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);

const primes = [];
for (let n = 2; primes.length < 84; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
  if (prime) primes.push(n);
}
let clock = 0;
const plain56 = corpus.pages[56].indices.map((c, i) =>
  i === 56 ? c : mod(c - primes[clock++] + 1));
assert.equal(clock, 84);
assert.equal(plain56.slice(0, 5).map((i) => corpus.translit[i]).join(""), "ANEND");
const registers = [
  { name: "decrypted-p56-clear-p57", known: plain56.concat(corpus.pages[57].indices) },
  { name: "printed-p56-clear-p57", known: corpus.pages[56].indices.concat(corpus.pages[57].indices) }
];
assert.equal(registers[0].known.length, 180);

/** @returns {number[]} Original 32x8 table index ring walk, exterior first. */
function ringWalk(corner, reverse) {
  const out = [];
  for (let k = 0; k < 4; k++) {
    const t = k, b = 31 - k, l = k, r = 7 - k, ring = [];
    for (let c = l; c <= r; c++) ring.push(8 * t + c);
    for (let y = t + 1; y <= b; y++) ring.push(8 * y + r);
    for (let c = r - 1; c >= l; c--) ring.push(8 * b + c);
    for (let y = b - 1; y > t; y--) ring.push(8 * y + l);
    const corners = [8 * t + l, 8 * t + r, 8 * b + r, 8 * b + l];
    const seq = reverse ? ring.reverse() : ring;
    const pivot = seq.indexOf(corners[corner]);
    out.push(...seq.slice(pivot), ...seq.slice(0, pivot));
  }
  assert.equal(new Set(out).size, 256);
  return out;
}
const routes = [{ name: "row-major", indexes: Array.from({ length: 256 }, (_, i) => i) }];
for (let corner = 0; corner < 4; corner++)
  for (const reverse of [false, true])
    routes.push({ name: "ring-" + corner + "-" + reverse, indexes: ringWalk(corner, reverse) });
assert.equal(new Set(routes.map((r) => r.indexes.join(","))).size, 9);

/** All quadratic monomials of two original table residues, 6 unknown coefficients. */
function features(indexes, i, lag) {
  const x = bytes[indexes[i]] % 29;
  const y = bytes[indexes[(i - lag + 256) % 256]] % 29;
  return [1, x, y, x * x % 29, x * y % 29, y * y % 29];
}
/** Solve all unknown coefficients algebraically and count contradictory equations. */
function fit(rows) {
  const a = rows.map((r) => r.slice());
  const pivots = [];
  let rank = 0;
  for (let j = 0; j < 6; j++) {
    let pivot = -1;
    for (let i = rank; i < a.length; i++) if (a[i][j] !== 0) { pivot = i; break; }
    if (pivot === -1) continue;
    [a[pivot], a[rank]] = [a[rank], a[pivot]];
    let inv = 1;
    while (a[rank][j] * inv % 29 !== 1) inv++;
    for (let k = j; k < 7; k++) a[rank][k] = mod(a[rank][k] * inv);
    for (let i = rank + 1; i < a.length; i++) {
      const scale = a[i][j];
      for (let k = j; k < 7; k++) a[i][k] = mod(a[i][k] - scale * a[rank][k]);
    }
    pivots.push(j);
    rank++;
  }
  let contradictions = 0;
  for (let i = rank; i < a.length; i++) if (a[i][6] !== 0) contradictions++;
  const coefficients = Array(6).fill(0);
  for (let i = rank - 1; i >= 0; i--) {
    const col = pivots[i];
    let value = a[i][6];
    for (let j = col + 1; j < 6; j++) value -= a[i][j] * coefficients[j];
    coefficients[col] = mod(value);
  }
  return { rank, contradictions, coefficients };
}
const dot = (a, b) => mod(a.reduce((s, x, i) => s + x * b[i], 0));
const knownRows = (route, lag, known) =>
  known.map((target, i) => [...features(route.indexes, i + 76, lag), target]);

const results = [];
for (const route of routes) for (const register of registers) for (const lag of [1, 8]) {
  const solution = fit(knownRows(route, lag, register.known));
  assert.equal(solution.rank, 6);
  assert.ok(solution.contradictions > 0);
  results.push({
    route: route.name,
    register: register.name,
    lag,
    rank: solution.rank,
    contradictions: solution.contradictions
  });
}
assert.equal(results.length, 36);
assert.equal(Math.min(...results.map((r) => r.contradictions)), 163);

// Independent exactly recoverable six-coefficient synthetic plants, with
// all 76 source-position outer cells withheld from fitting.
const secret = [7, 4, 9, 3, 2, 5];
for (const route of [routes[0], routes[1], routes[8]]) for (const lag of [1, 8]) {
  const planted = Array.from({ length: 256 }, (_, i) => dot(features(route.indexes, i, lag), secret));
  const recovered = fit(knownRows(route, lag, planted.slice(76)));
  assert.equal(recovered.rank, 6);
  assert.equal(recovered.contradictions, 0);
  assert.deepEqual(recovered.coefficients, secret);
  const withheld = Array.from({ length: 76 }, (_, i) =>
    dot(features(route.indexes, i, lag), recovered.coefficients));
  assert.deepEqual(withheld, planted.slice(0, 76));
}
console.log(JSON.stringify({
  source: "original LP2 p55-p57 and numeric grid pp49-p51",
  runs: results.length,
  exactFits: 0,
  minimumContradictionsAfterRankSix: 163,
  plantedPositiveControls: 6,
  results
}, null, 2));

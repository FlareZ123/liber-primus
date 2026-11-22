"use strict";

/**
 * Source-bounded p32 / p50 eigenvalue-24 rank-one completion.
 * Run from the repository root with Node.js 22.
 * This is a cryptanalytic negative gate, not a historical cipher claim.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const N = 11;
const Q = 29;
const mod = (x) => ((x % Q) + Q) % Q;

/** @param {number} x A nonzero residue modulo 29. */
function inv(x) {
  for (let z = 1; z < Q; z++) if (mod(z * x) === 1) return z;
  throw new Error("Noninvertible GF29 residue: " + x);
}

const eye = Array.from({ length: N }, (_, i) =>
  Array.from({ length: N }, (_, j) => Number(i === j)));
const zeros = () => Array.from({ length: N }, () => Array(N).fill(0));
const add = (a, b) => a.map((r, i) => r.map((x, j) => mod(x + b[i][j])));
const scale = (a, s) => a.map((r) => r.map((x) => mod(s * x)));
const mult = (a, b) => a.map((r) => b[0].map((_, j) =>
  mod(r.reduce((sum, x, k) => sum + x * b[k][j], 0))));
const product = (a, v) => a.map((r) =>
  mod(r.reduce((sum, x, k) => sum + x * v[k], 0)));
const dot = (a, b) => mod(a.reduce((s, x, i) => s + x * b[i], 0));

/** @param {number[][]} matrix Any 11-by-11 matrix modulo 29. */
function eliminate(matrix, returnInverse) {
  const a = matrix.map((row, i) => returnInverse ? [...row, ...eye[i]] : [...row]);
  let rank = 0;
  for (let j = 0; j < N; j++) {
    let i = rank;
    while (i < N && a[i][j] === 0) i++;
    if (i === N) continue;
    [a[rank], a[i]] = [a[i], a[rank]];
    const factor = inv(a[rank][j]);
    for (let k = j; k < a[rank].length; k++)
      a[rank][k] = mod(factor * a[rank][k]);
    for (let h = 0; h < N; h++) {
      if (h === rank) continue;
      const coefficient = a[h][j];
      for (let k = j; k < a[h].length; k++)
        a[h][k] = mod(a[h][k] - coefficient * a[rank][k]);
    }
    rank++;
  }
  if (!returnInverse) return rank;
  assert.equal(rank, N, "Rank-one completion should be invertible");
  return a.map((row) => row.slice(N));
}

/** @param {number[]} glyphs Original GP indices, including any page tails. */
function packets(glyphs, matrix) {
  const out = [];
  for (let at = 0; at + N <= glyphs.length; at += N)
    out.push(...product(matrix, glyphs.slice(at, at + N)));
  return out;
}

function ioc(glyphs) {
  const f = Array(Q).fill(0);
  for (const symbol of glyphs) f[symbol]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) /
    (glyphs.length * (glyphs.length - 1));
}

const source = corpus.pages.find((x) => x.page === 32).indices;
assert.equal(source.length, 121);
assert.equal(grid.bytes.length, 256);
const A = Array.from({ length: N }, (_, i) => source.slice(i * N, (i + 1) * N));
const v = [13, 3, 26, 3, 2, 8, 12, 3, 26, 21, 1];
const w = [2, 23, 27, 4, 26, 9, 20, 22, 2, 9, 1];
assert.deepEqual(product(A, v), v.map((x) => mod(24 * x)));
assert.deepEqual(product(A[0].map((_, i) => A.map((row) => row[i])), w),
  w.map((x) => mod(24 * x)));
assert.equal(dot(w, v), 2);

// Source table byte slots, printed row-major, are polynomial coefficients
// in descending power order; Horner evaluation on the original p32 matrix.
let PA = zeros();
for (const byte of grid.bytes) PA = add(mult(PA, A), scale(eye, byte));
assert.equal(eliminate(PA, false), 10);
assert.deepEqual(product(PA, v), Array(N).fill(0));

// Unique rank-one 24-eigenprojector, normalized by left-right dot product.
const Pi = v.map((x) => w.map((y) => mod(inv(dot(w, v)) * x * y)));
assert.deepEqual(mult(Pi, Pi), Pi);
const T = add(PA, scale(Pi, 24));
const inverseT = eliminate(T, true);
assert.deepEqual(mult(T, inverseT), eye);
assert.deepEqual(mult(inverseT, T), eye);

// Authentic solved p57 source provides native GP29 data for exact positive control.
const solved = corpus.pages.find((x) => x.page === 57).indices;
assert.equal(solved.length, 95);
const control = solved.slice(0, 88);
assert.deepEqual(packets(packets(control, T), inverseT), control);

const pages = corpus.pages
  .filter((p) => p.page <= 55 && p.indices.length)
  .map((p) => p.indices);
const original = pages.flat();
assert.equal(original.length, 12956);
const tests = [];
for (const clock of ["book", "page"]) {
  const parts = clock === "book" ? [original] : pages;
  for (const direction of ["inverse", "forward"]) {
    const transform = direction === "inverse" ? inverseT : T;
    const roundTrip = direction === "inverse" ? T : inverseT;
    const output = parts.flatMap((p) => packets(p, transform));
    for (const part of parts)
      assert.deepEqual(packets(packets(part, transform), roundTrip),
        part.slice(0, Math.floor(part.length / N) * N));
    tests.push({ clock, direction, runes: output.length, ioc: ioc(output) });
  }
}
assert.deepEqual(tests.map((x) => x.runes), [12947, 12947, 12606, 12606]);
const expected = [
  0.03447973151208117, 0.03452166171866762,
  0.034495791436339004, 0.03447616886312991
];
tests.forEach((x, i) => assert.ok(Math.abs(x.ioc - expected[i]) < 1e-12));
console.log(JSON.stringify({
  hypothesis: "source-selected polynomial-matrix rank-one spectral completion",
  sourceRank: 10, completedRank: 11, normalization: "w.v=2, Pi=v w^T / 2",
  originalIoC: ioc(original), solvedControlIoC: ioc(solved),
  exactNativeControlRunes: control.length,
  results: tests, conclusion: "No original LP2 plaintext or historical key"
}, null, 2));

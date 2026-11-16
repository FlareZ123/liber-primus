"use strict";
/**
 * Original-input, language-blind continuation census after the published
 * 27x27 route's block 38. JSDoc + CommonJS; runnable on Windows Node 22.
 *
 * This tests the conditional mechanism proposed in the external Reports
 * 00-15, NOT an authenticated Cicada decoder. Every original source rune
 * comes from the canonical repository corpus; no plaintext candidate is
 * supplied to select a new key, node, or path.
 *
 * Run as a standalone file from the repository using Node 22.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"
));
const tape = corpus.pages.slice(0, 3).flatMap(page => page.indices);
assert.equal(tape.length, 729);
/** @param {number} row @param {number} col @returns {number} */
function cell(row, col) { return tape[(row - 1) * 27 + col - 1]; }
/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      result -= result / p;
      while (m % p === 0) m /= p;
    }
  }
  if (m > 1) result -= result / m;
  return result;
}
/** @param {number} n @returns {number} */
function mu(n) {
  let factors = 0;
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      m /= p;
      factors++;
      if (m % p === 0) return 0;
    }
  }
  return (factors + Number(m > 1)) % 2 ? -1 : 1;
}
/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
/** @param {number[]} p @returns {number} */
const n0 = p => 27 * (p[0] - 1) + p[1];
/** @param {number[]} p @returns {number} */
const n1 = p => 27 * (p[1] - 1) + 28 - p[0];
/** @param {number[]} p @returns {number} */
const n2 = p => 730 - n0(p);
/** @param {number[]} p @returns {number} */
const n3 = p => 730 - n1(p);
/** @param {number} x @param {number} modulus @returns {number} */
const mod = (x, modulus) => ((x % modulus) + modulus) % modulus;
const gp = corpus.prime;

/* Original block 38 from the published, still unverified walkthrough. */
const current = {
  B: [5, 17], E: [8, 17], L: [8, 17],
  M: [12, 13], Z: [13, 13],
  source: [16, 19, 28], S: 32, outer: 0, phase: 0,
  cipher: [[5, 17], [6, 17], [7, 17], [8, 17]]
};
assert.deepEqual(current.source,
  [cell(11, 13), cell(12, 13), cell(13, 13)]);
assert.deepEqual(current.cipher.map(([r,c]) => cell(r,c)), [26,14,14,21]);
assert.deepEqual(current.cipher.map(([r,c],i) =>
  mod(cell(r,c) - current.source[i % 3], 29)), [10,24,15,5]);

/* Fully frozen next-step forecasts from Reports 01-15. */
const mode = Math.floor(current.S / 7) % 4;
const reflected = mode === 1 || mode === 2;
const offset = mode === 0 || mode === 2 ? 1 : 0;
const phase = mod(offset + current.cipher.reduce((sum, p) =>
  sum + mu(reflected ? n2(p) : n0(p)), 0), 3);
const outer = mod(current.outer + mu(n1(current.L)), 2);
const signatures = [
  [[0,0,0], [1,1,1]],
  [[0,1,0], [1,-1,1]],
  [[0,-1,0], [1,0,1]]
];
const signature = signatures[phase][outer];
const axisScore = mu(n2(current.B) + n0(current.M)) +
  mu(gcd(n1(current.E), n2(current.E)));
const cipherAxis = axisScore > 0 ? "vertical" :
  axisScore < 0 ? "diagonal" : "horizontal";
const leftFirst = mod(mu(n3(current.E)) + phi(current.source[1]), 2);
const centerRowParity = mod(1 + current.B[1] + current.E[0] +
  current.M[0] + mu(n2(current.B)), 2);
const centerColParity = mod(1 + current.B[0] + current.E[0] +
  current.M[0], 2);
const endRowParity = mod(1 + current.phase + mu(n2(current.M)), 2);
const leftRowParity = mod(centerRowParity + 1 + current.phase +
  mu(current.M[0]), 2);
const currentMirror = Number(current.source[0] === current.source[2]);
const leftColParity = mod(current.B[0] + current.cipher.reduce((sum,p) =>
  sum + mu(n1(p)), 0) + currentMirror +
  mu(current.phase === 0 ? n2(current.M) :
    current.phase === 1 ? n3(current.M) : n0(current.M)), 2);
const q = Number(mu(n0(current.E)) === 0 && mu(n3(current.E)) === 0);
const z = Number(mu(n0(current.B)) === 0 && mu(n1(current.B)) === 0);
const exactRayOffset = q * (1 - z);
const mirror = Math.max(Math.abs(current.Z[0] - current.L[0]),
  Math.abs(current.Z[1] - current.L[1])) % 3 !== 2;
const axisGroup = Number(
  (mu(n1(current.M) + n2(current.Z)) < 0) ===
  (mu(n1(current.L) + n2(current.Z)) < 0));
const originalGp = current.source.reduce((sum, rune) => sum + gp[rune], 0);
assert.equal(originalGp, 239);
const diagonalBit = Number(mu(gcd(n1(current.M), n3(current.Z))) < 0) ^
  Number(mu(originalGp) > 0) ^
  Number(mu(n0(current.M) + n3(current.Z)) !== 0);
const sourceAxis = 2 * axisGroup + diagonalBit;
const radiusParity = mod(current.M[0] + current.M[1] +
  current.B[0] + current.B[1], 2) ^
  Number(mu(gcd(n2(current.Z), n2(current.L))) < 0) ^
  Number(mu(n1(current.B) + n1(current.E)) > 0);

const forecast = {phase,outer,signature,cipherAxis,leftFirst,
  centerRowParity,centerColParity,endRowParity,leftRowParity,
  leftColParity,exactRayOffset,mirror,sourceAxis,radiusParity};
assert.deepEqual(forecast, {
  phase: 1, outer: 0, signature: [0,1,0],
  cipherAxis: "diagonal", leftFirst: 1,
  centerRowParity: 0, centerColParity: 0,
  endRowParity: 1, leftRowParity: 1, leftColParity: 0,
  exactRayOffset: 0, mirror: false, sourceAxis: 0,
  radiusParity: 0
});
assert.equal(current.S % 7 === 6 && phase === 2, false);

/* Enumerate horizontal even-radius, even/even-center NON-mirror sources.
 * Preserve both original reading orientations and both center modes. */
const sources = [];
for (let row = 2; row <= 26; row += 2) {
  for (let col = 2; col <= 26; col += 2) {
    for (let radius = 2; radius <= 12; radius += 2) {
      if (col - radius < 1 || col + radius > 27) continue;
      const source = [cell(row,col-radius),cell(row,col),
        cell(row,col+radius)];
      if (source.includes(0) || source[0] === source[2]) continue;
      for (const transform of [false, true]) {
        for (const reverse of [false, true]) {
          const derived = reverse ? source.slice().reverse() : source.slice();
          if (transform) derived[1] = phi(derived[1]);
          if (derived.map(x => mu(phi(x))).join(",") !== "0,1,0")
            continue;
          sources.push({center:[row,col],radius,transform,reverse,
            alignedKey:[derived[1],derived[2],derived[0]]});
        }
      }
    }
  }
}

/* Enumerate every 3..27 odd-length NE/SE ciphertext ray with
 * leftmost-first convention and native next-mode leftmost check.
 * No English word or proposed continuation guides selection. */
const routes = [];
for (let row = 1; row <= 27; row += 2) {
  for (let col = 2; col <= 26; col += 2) {
    const dr = Math.abs(row - current.L[0]);
    const dc = Math.abs(col - current.L[1]);
    if (Math.min(dr, dc, Math.abs(dr-dc)) !== exactRayOffset) continue;
    for (const step of [-1,1]) {
      for (let length = 3; length <= 27; length += 2) {
        const end = [row + step*(length-1), col + length-1];
        if (end[0] < 1 || end[0] > 27 || end[1] > 27) break;
        if (mu(n1([row,col])) < 0) continue;
        routes.push({begin:[row,col],end,step,length});
      }
    }
  }
}

const counts = {};
const unique = new Map();
let combinations = 0;
for (const source of sources) {
  for (const route of routes) {
    const M = source.center, B = route.begin, E = route.end;
    if (mu(gcd(n0(M),n0(B))) === 0 ||
        mu(gcd(n1(M),n3(E))) === 0 ||
        mu(gcd(n0(M),n2(E))) === 0) continue;
    // Here leftmost is B: G2 is identical to G1.
    combinations++;
    counts[route.length] = (counts[route.length] || 0) + 1;
    const plain = Array.from({length:route.length},(_,i) =>
      corpus.translit[mod(cell(B[0] + route.step*i, B[1] + i) -
        source.alignedKey[i % 3], 29)]).join("");
    if (!unique.has(route.length)) unique.set(route.length,new Set());
    unique.get(route.length).add(plain);
  }
}
assert.equal(sources.length, 172);
assert.equal(routes.length, 132);
assert.equal(combinations, 21818);
assert.equal(unique.get(3).size, 3544);
assert.equal(unique.get(5).size, 3426);
const output = {classification:"conditional, unauthenticated",forecast,
  keyVariants:sources.length,routeVariants:routes.length,
  combinations,byLength:counts,
  distinctPlaintextsByLength:Object.fromEntries(
    Array.from(unique,([length,values]) => [length,values.size]))
};
console.log(JSON.stringify(output,null,2));

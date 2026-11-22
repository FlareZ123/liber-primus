"use strict";
/**
 * Finite original LP2 GP29 inverse selected by two PARABLE body primes.
 * The solved original p57 clause GP-prime sums [1259,1031,1229] provide
 * Blum primes 1259 and 1031, both 3 mod4; leftover prime 1229 seeds BBS.
 * The alternate historical 3301 seed and three conventional outputs are
 * bounded contrasts. No unidentified seeds or ciphertext score tuning.
 * Node 22, builtin modules, no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const gp = require("../resources/liber-primus/lp2-corpus.json");
const text = fs.readFileSync(path.join(ROOT,
  "resources/lp2-transcription.txt"), "utf8");
const index = new Map(gp.runes.map((r, i) => [r, i]));
const sums = text.split("%")[56].split(".")
  .map(t => [...t].reduce((sum, r) =>
    sum + (index.has(r) ? gp.prime[index.get(r)] : 0), 0))
  .filter(Boolean);
assert.deepEqual(sums, [449, 1259, 1031, 1229]);
const [primeP, primeQ, thirdPrime] = sums.slice(1);
assert.equal(primeP % 4, 3);
assert.equal(primeQ % 4, 3);
assert.equal(thirdPrime % 4, 1);
const MODULUS = primeP * primeQ;
assert.equal(MODULUS, 1298029);
assert(MODULUS * MODULUS < Number.MAX_SAFE_INTEGER);
const cipher = gp.pages.filter(p => p.page <= 55 && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(cipher.length, 12956);
const mod = x => (x % 29 + 29) % 29;
/** @param {number} seed */
function squared(seed) {
  let state = seed*seed % MODULUS;
  return () => {
    state = state*state % MODULUS;
    return state;
  };
}
/** @param {number} seed @param {boolean} little */
function bits(seed, little) {
  const next = squared(seed);
  return () => {
    let value = 0;
    for (let i = 0; i < 5; i++) {
      const bit = next() % 2;
      value |= bit << (little ? i : 4-i);
    }
    return value;
  };
}
/** @param {number} seed
 * @param {"residue"|"bits-big"|"bits-little"} mode
 */
function key(seed, mode) {
  const next = mode === "residue" ? squared(seed) :
    bits(seed, mode === "bits-little");
  const out = [];
  while (out.length < cipher.length) {
    const value = next();
    if (mode !== "residue" && value >= 29) continue;
    out.push(value % 29);
  }
  return out;
}
/** @param {number[]} data */
function ioc(data) {
  const hist = Array(29).fill(0);
  for (const i of data) hist[i]++;
  return hist.reduce((s, n) => s+n*(n-1), 0) /
    (data.length*(data.length-1));
}
const native = gp.pages[57].indices;
const planted = Array.from({length: cipher.length},
  (_, i) => native[i % native.length]);
const cases = [];
for (const seed of [thirdPrime, 3301]) for (
  const mode of ["residue", "bits-big", "bits-little"]) {
  const pad = key(seed, mode);
  const encrypted = planted.map((n, i) => mod(n+pad[i]));
  assert.deepEqual(encrypted.map((n, i) => mod(n-pad[i])), planted);
  for (const sign of [-1, 1]) {
    const decoded = cipher.map((n, i) => mod(n + sign*pad[i]));
    assert.deepEqual(decoded.map((n, i) => mod(n-sign*pad[i])),
      cipher);
    cases.push({seed, mode, sign, ioc: ioc(decoded),
      first60: decoded.slice(0, 60).map(n => gp.translit[n]).join("")});
  }
}
assert.equal(cases.length, 12);
assert(cases.every(x => x.ioc < 0.035));
const seen = new Map();
const next = squared(thirdPrime);
let cycle = null;
for (let i = 0; i <= MODULUS; i++) {
  const state = next();
  if (seen.has(state)) {
    cycle = {start: seen.get(state), repeat: i,
      length: i-seen.get(state)};
    break;
  }
  seen.set(state, i);
}
assert.deepEqual(cycle, {start: 0, repeat: 612, length: 612});
console.log(JSON.stringify({
  p57ClausePrimes: [primeP, primeQ, thirdPrime],
  BBSmodulus: MODULUS, naturalSeed: thirdPrime,
  sourceCycle: cycle, untouchedIoc: ioc(cipher),
  plantedIoc: ioc(planted), candidateCases: cases,
  conclusion: "No native GP29 plaintext under these source-fixed BBS additive masks"
}, null, 2));

"use strict";
/**
 * Original-input SFT: a conjectural number-theoretic reading of the Möbius-
 * like marks on LP2 and the explicit totient statement in solved LP1.
 * Test literal Dirichlet inverses over GF(29); no source selects a cipher.
 *
 * This is a source-motivated candidate with NO recovered LP2 plaintext.
 * Run: node sims/lp2_arithmetic_mobius_totient_inverse_sft.cjs
 *
 * Input registers: original base60 numeric grid (256 bytes, conditional
 * base60 interpretation) and all 12,956 unknown LP2 GP29 runes, book-
 * continuous, original source order. Item indices are 1-based, as required
 * for divisor arithmetic. No fitted keys, phases, resets or rearrangements.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} rel */
function json(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const db = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json");
const table = grid.bytes.map((v) => v % 29);
const unknown = db.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(table.length, 256);
assert.equal(unknown.length, 12956);
const mod = (v) => ((v % 29) + 29) % 29;

/** @param {number} n */
function totients(n) {
  const phi = Array.from({ length: n + 1 }, (_, i) => i);
  for (let p = 2; p <= n; p++) {
    if (phi[p] !== p) continue;
    for (let i = p; i <= n; i += p) phi[i] -= Math.floor(phi[i] / p);
  }
  return phi;
}

/**
 * Inverse Dirichlet convolution by either 1 or Euler's totient:
 * B(n) = SUM_{d|n} A(d) * kernel(n/d).
 * Both kernels have kernel(1)=1, giving a unique reversible inverse.
 *
 * @param {number[]} input
 * @param {"mobius"|"totient"} mode
 * @returns {number[]}
 */
function inverse(input, mode) {
  const nMax = input.length;
  const phi = totients(nMax);
  const a = new Array(nMax + 1).fill(0);
  const weight = (n) => mode === "mobius" ? 1 : phi[n];
  for (let n = 1; n <= nMax; n++) {
    let value = input[n - 1];
    for (let d = 1; d * d <= n; d++) {
      if (n % d !== 0) continue;
      const m = n / d;
      if (d < n) value -= weight(m) * a[d];
      if (d !== m && m < n) value -= weight(d) * a[m];
    }
    a[n] = mod(value);
  }
  return a.slice(1);
}

/**
 * Exact source-indexed forward Dirichlet convolution.
 * @param {number[]} source
 * @param {"mobius"|"totient"} mode
 * @returns {number[]}
 */
function forward(source, mode) {
  const phi = totients(source.length);
  const result = new Array(source.length).fill(0);
  const weight = (n) => mode === "mobius" ? 1 : phi[n];
  for (let d = 1; d <= source.length; d++) {
    for (let n = d; n <= source.length; n += d) {
      result[n - 1] = mod(result[n - 1] + source[d - 1] * weight(n / d));
    }
  }
  return result;
}

/** @param {number[]} a */
function metrics(a) {
  const counts = new Array(29).fill(0);
  for (const x of a) counts[x]++;
  const n = a.length;
  const doubles = a.slice(1).filter((v, i) => v === a[i]).length;
  return {
    ioc: Number((counts.reduce((s, x) => s + x * (x - 1), 0) /
      (n * (n - 1))).toFixed(6)),
    doubles
  };
}

const gp = db.translit.map((symbol, index) => ({ symbol, index }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
/** @param {string} text */
function encodeGp(text) {
  const out = [];
  for (const word of text.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const next = gp.find((v) => word.startsWith(v.symbol, i));
      assert(next, "Invalid GP word " + word);
      out.push(next.index);
      i += next.symbol.length;
    }
  }
  return out;
}

const control = encodeGp(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT " +
  "IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(control.length, 85);
for (const mode of ["mobius", "totient"]) {
  const planted = forward(control, mode);
  assert.deepEqual(inverse(planted, mode), control);
}

const expected = {
  table: {
    input: { ioc: 0.037163, doubles: 13 },
    mobius: { ioc: 0.034099, doubles: 5 },
    totient: { ioc: 0.034406, doubles: 11 }
  },
  unknown: {
    input: { ioc: 0.034478, doubles: 86 },
    mobius: { ioc: 0.034479, doubles: 477 },
    totient: { ioc: 0.034471, doubles: 451 }
  }
};
const observations = {};
for (const [name, source] of [["table", table], ["unknown", unknown]]) {
  const item = { input: metrics(source) };
  for (const mode of ["mobius", "totient"]) {
    const decoded = inverse(source, mode);
    assert.deepEqual(forward(decoded, mode), source);
    item[mode] = metrics(decoded);
    item[mode].preview = decoded.slice(0, 200)
      .map((v) => db.translit[v]).join("");
  }
  for (const label of ["input", "mobius", "totient"]) {
    assert.equal(item[label].ioc, expected[name][label].ioc);
    assert.equal(item[label].doubles, expected[name][label].doubles);
  }
  observations[name] = item;
}
console.log(JSON.stringify({
  scope: "Original p50 256 bytes and complete unknown LP2 12956 runes",
  model: "1-based Dirichlet inverses over GF29; conjectural Möbius, literal Euler totient",
  nativeGpPlant: "85/85, both kernels",
  observations,
  verdict: "No readable plaintext; bounded literal-inverse rejection"
}, null, 2));

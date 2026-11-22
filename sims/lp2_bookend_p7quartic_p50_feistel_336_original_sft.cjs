"use strict";
/**
 * Original 6,395-rune bookend Feistel attack, using the actual five red
 * p7 GP29 word-products as a quartic and printed p50 base60 digits as
 * optional Feistel rounds/offsets. No fitted key or plaintext cribs.
 *
 * SFT: node sims/lp2_bookend_p7quartic_p50_feistel_336_original_sft.cjs
 * Windows 11 / Node 22 / CommonJS / read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const original = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices || []);
assert.equal(original.length, 12956);
assert.equal(grid.bytes.length, 256);
const A = original.slice(0, 6561);
const C = original.slice(6561);
assert.equal(C.length, 6395);
assert.deepEqual(A.slice(-6), C.slice(-6));

/** Return the positive residue modulo 29. */
const mod29 = x => (x % 29 + 29) % 29;
/** Source p7 terminal wholly red words, zero-based GP products. */
const p7 = corpus.pages.find(p => p.page === 7).indices;
assert.equal(p7.length, 208);
const widths = [2, 4, 3, 2, 3], terminal = p7.slice(-14);
let offset = 0;
const coefficients = widths.map(w => {
  const value = terminal.slice(offset, offset + w)
    .reduce((a, v) => a * v % 29, 1);
  offset += w;
  return value;
});
assert.deepEqual(coefficients, [11, 26, 8, 15, 2]);
/** GP29 quartic selected by actual printed red word order. */
const F = x => mod29(11 + x * (26 + x * (8 + x * (15 + 2 * x))));

/** Multiply an element of GF(3^4) by x+1 (p7 polynomial mod 3). */
function mulGF81(x) {
  const digits = [0, 0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const t = x % 3;
    x = Math.floor(x / 3);
    digits[i] += t;
    digits[i + 1] += t;
  }
  const high = digits[4] % 3;
  for (let i = 0; i < 3; i++) digits[i] -= high;
  return digits.slice(0, 4).reduce((s, v, i) =>
    s + ((v % 3 + 3) % 3) * 3 ** i, 0);
}
const powers = [1];
while (powers.length < 80) powers.push(mulGF81(powers.at(-1)));
assert.equal(new Set(powers).size, 80);
assert.equal(mulGF81(powers[79]), 1);
const holes = new Set([2244, 2384, 2476, 2575, 2672]);
const positions = Array.from({ length: 6400 }, (_, i) => i)
  .filter(i => !holes.has(i));
assert.equal(positions.length, C.length);
const sources = {
  field: positions.map(i => A[
    powers[Math.floor(i / 80)] * 81 + powers[i % 80]
  ]),
  crop: positions.map(i => A[
    (Math.floor(i / 80) + 1) * 81 + i % 80 + 1
  ])
};
const bytes = C.map((_, i) => grid.bytes[(6561 + i - 1) % 256]);
assert.ok(bytes.every(v => Number.isInteger(v) && v >= 0 && v <= 255));

/**
 * A source-only Feistel candidate. With original input (K,C), apply
 * 1..5 or 5 rounds using F and a key shift from the two printed
 * radix60 digits, actual byte, or round number. Each round is
 * (a,b)->(b,a+sign*F(b+shift) mod 29), hence always invertible.
 *
 * @param {number} q The original p50 byte at this position.
 * @param {number} round Zero-based round index.
 * @param {string} shift Name of the unfitted offset grammar.
 * @returns {number}
 */
function keyOffset(q, round, shift) {
  const high = Math.floor(q / 60), low = q % 60;
  switch (shift) {
    case "zero": return 0;
    case "low": return low;
    case "high": return high;
    case "sum": return high + low;
    case "round": return round;
    case "lowround": return low + round;
    case "absbyte": return q;
    default: throw new Error("Unrecognized shift");
  }
}
/** @returns {number} Number of source-selected rounds. */
function nRounds(q, mode) {
  const high = Math.floor(q / 60);
  if (mode === "d+1") return high + 1;
  if (mode === "five") return 5;
  if (mode === "five-d") return 5 - high;
  throw new Error("Unrecognized round count");
}
/** @returns {[number, number]} Two Feistel output runes. */
function forward(a, b, q, sign, countMode, shift) {
  const count = nRounds(q, countMode);
  for (let round = 0; round < count; round++) {
    const k = keyOffset(q, round, shift);
    [a, b] = [b, mod29(a + sign * F(mod29(b + k)))];
  }
  return [a, b];
}
/** @returns {[number, number]} Exact inverse Feistel pair. */
function backward(a, b, q, sign, countMode, shift) {
  for (let round = nRounds(q, countMode) - 1; round >= 0; round--) {
    const k = keyOffset(q, round, shift);
    [a, b] = [mod29(b - sign * F(mod29(a + k))), a];
  }
  return [a, b];
}
/** Standard 29-rune empirical collision index. */
function IoC(data) {
  const h = Array(29).fill(0);
  for (const v of data) h[v]++;
  return h.reduce((s, v) => s + v * (v - 1), 0) /
    (data.length * (data.length - 1));
}
/** Empirical Shannon entropy, in bits per GP rune. */
function H(data) {
  const h = Array(29).fill(0);
  for (const v of data) h[v]++;
  return h.reduce((s, v) => v
    ? s - v / data.length * Math.log2(v / data.length) : s, 0);
}

const donor = encodeSourceNativeGP(
  read("resources/control/gibran_prophet_58585.txt")).slice(0, 6395);
assert.equal(donor.length, 6395);
const sourceNativeIoC = IoC(donor);
assert.ok(sourceNativeIoC > 0.05);

const results = [];
for (const [source, K] of Object.entries(sources))
for (const order of [0, 1])
for (const sign of [-1, +1])
for (const countMode of ["d+1", "five", "five-d"])
for (const shift of ["zero", "low", "high", "sum",
  "round", "lowround", "absbyte"]) {
  const lanes = [new Array(C.length), new Array(C.length)];
  for (let i = 0; i < C.length; i++) {
    const input = order ? [C[i], K[i]] : [K[i], C[i]];
    const pair = forward(...input, bytes[i], sign, countMode, shift);
    assert.deepEqual(
      backward(...pair, bytes[i], sign, countMode, shift),
      input
    );
    lanes[0][i] = pair[0];
    lanes[1][i] = pair[1];
  }
  for (let lane = 0; lane < 2; lane++)
    results.push({
      source, order, sign, countMode, shift, lane,
      IoC: IoC(lanes[lane]), entropy: H(lanes[lane])
    });
}
assert.equal(results.length, 336);
results.sort((a, b) => b.IoC - a.IoC);
assert.ok(results.every(r => r.IoC < 0.037 && r.entropy > 4.80));

// Positive invertibility plant: embed 6395 known GP-native runes in one
// output of an authentic full two-channel pair map. This establishes
// correctness of the reversible operation, not manuscript authenticity.
for (const [source, K] of Object.entries(sources)) {
  for (let i = 0; i < C.length; i++) {
    const output = [donor[i], K[i]];
    const planted = backward(...output, bytes[i], 1, "d+1", "low");
    assert.deepEqual(
      forward(...planted, bytes[i], 1, "d+1", "low"),
      output, source
    );
  }
}

console.log(JSON.stringify({
  status: "PASS",
  originalInput: "12,956 original unknown runes; 6,395 B-rune original full bookend paired register",
  printedSources: {
    p7Products: coefficients, p50Cells: grid.bytes.length,
    positions: positions.length, missing: [...holes]
  },
  models: results.length,
  rawCipherIoC: IoC(C),
  sourceNativeControlIoC: sourceNativeIoC,
  best: results.slice(0, 8),
  minimumIoC: results.at(-1).IoC,
  conclusion: "No source-fixed p7-quartic Feistel and p50 digit/round receiver here reaches native GP29 English frequencies; exact two-channel inverse holds throughout."
}, null, 2));

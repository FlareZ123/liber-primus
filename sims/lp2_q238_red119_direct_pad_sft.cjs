"use strict";
/**
 * Source-paired direct pad: p50 GF(29) quotient coefficients versus the two
 * p3/p39 119-rune prefixes. This is a finite proposed inverse, not a key claim.
 * Run: node sims/lp2_q238_red119_direct_pad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const grid = read("resources/liber-primus/lp2-grid-256.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const mod = (n) => (n % 29 + 29) % 29;

/**
 * @param {number[]} a Ascending-power polynomial over GF(29).
 * @param {number[]} b Ascending-power polynomial over GF(29).
 * @returns {number[]} Their ascending-power product.
 */
function mul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

/**
 * @param {number[]} c GP29 values.
 * @returns {number} Unbiased index of coincidence.
 */
function ioc(c) {
  const count = Array(29).fill(0);
  for (const x of c) count[x]++;
  return count.reduce((sum, v) => sum + v * (v - 1), 0) /
    (c.length * (c.length - 1));
}

assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(grid.bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const small = [
  [5, 1], [5, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const factor = small.reduce(mul, [28]);
assert.equal(factor.length, 17);
assert.equal(factor[16], 28);
const high = factor.slice().reverse();
const residual = grid.bytes.map(mod);
const quotient = [];
for (let i = 0; i <= residual.length - high.length; i++) {
  const digit = mod(residual[i] * 28); // leading divisor coefficient 28 is its own inverse
  quotient.push(digit);
  for (let j = 0; j < high.length; j++) {
    residual[i + j] = mod(residual[i + j] - digit * high[j]);
  }
}
assert(residual.every((v) => v === 0));
assert.equal(quotient.length, 240);
assert.deepEqual(quotient.slice(0, 2), [0, 1]); // padded zero + monic Q238
const pad = quotient.slice(2);
assert.equal(pad.length, 238);

function prefix(page) {
  const p = corpus.pages.find((part) => part.page === page);
  const red = ink.pages.find((part) => part.page === page);
  assert(p && red);
  assert(red.red_spans.some((s) => s.start === 119 && s.length === 3));
  assert(red.large_punctuation.some((s) => s[0] === 119 && s[1] === 13));
  assert(red.large_punctuation.some((s) => s[0] === 122 && s[1] === 13));
  return p.indices.slice(0, 119);
}
const a = prefix(3);
const b = prefix(39);
assert.equal(a.length + b.length, pad.length);
const source = [
  ["p3||p39", [...a, ...b]],
  ["p39||p3", [...b, ...a]]
];
const gp = corpus.translit;
const solved = corpus.pages.find((part) => part.page === 57).indices;
assert.equal(solved.length, 95);
const native = Array.from({ length: 238 }, (_, i) => solved[i % solved.length]);
assert(ioc(solved) > 0.055);
const results = [];

for (const [order, ciphertext] of source) {
  for (const direction of ["forward", "reverse"]) {
    const stream = direction === "forward" ? pad : pad.slice().reverse();
    for (const sign of [-1, 1]) {
      const decoded = ciphertext.map((v, i) => mod(v + sign * stream[i]));
      const replay = decoded.map((v, i) => mod(v - sign * stream[i]));
      assert.deepEqual(replay, ciphertext);
      const planted = native.map((v, i) => mod(v - sign * stream[i]));
      assert.deepEqual(planted.map((v, i) => mod(v + sign * stream[i])), native);
      const measured = ioc(decoded);
      assert(measured > 0.03 && measured < 0.04);
      results.push({
        order,
        quotient_direction: direction,
        inverse_sign: sign,
        decoded_ioc: Number(measured.toFixed(12)),
        first_40_gp: decoded.slice(0, 40).map((v) => gp[v]).join("-")
      });
    }
  }
}
assert.equal(results.length, 8);
console.log(JSON.stringify({
  source: "original LP2 pp3/p39 119-rune prefixes and 256-byte grid",
  full_quotient_slots: quotient.length,
  significant_q238_coefficients: 239,
  pad_slots_after_monic: pad.length,
  original_red_prefixes: [a.length, b.length],
  native_p57_ioc: ioc(solved),
  results
}, null, 2));
console.log("PASS: exact source quotient and eight direct original inverses; no plaintext");

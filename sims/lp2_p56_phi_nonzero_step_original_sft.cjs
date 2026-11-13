"use strict";

/**
 * Exact original-input inverse for a GP29 nonzero-step cipher with the
 * historically solved p56 prime-totient clock, projected to order 28.
 *
 * This is a source-motivated HYPOTHESIS. Cicada did not authenticate the
 * zero-step/EA rule, generator 15, or transfer of the p56 totient clock.
 *
 * SFT: node sims/lp2_p56_phi_nonzero_step_original_sft.cjs
 * Node 22, CommonJS, zero extra packages. Original manuscript is never edited.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const N = pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(pages.length, 55);
assert.equal(N, 12956);
assert.equal(corpus.pages[57].indices.length, 95);

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const out = [];
  for (let q = 2; out.length < n; q++) {
    let prime = true;
    for (const p of out) {
      if (p * p > q) break;
      if (q % p === 0) { prime = false; break; }
    }
    if (prime) out.push(q);
  }
  return out;
}
const primes = firstPrimes(N);
const powers = [];
const logarithm = Array(29).fill(-1);
for (let x = 1, e = 0; e < 28; e++, x = x * 15 % 29) {
  assert.equal(logarithm[x], -1, "15 must generate all 28 nonzero residues");
  logarithm[x] = e;
  powers.push(x);
}
assert.equal(new Set(powers).size, 28);

/** @param {number[]} p @param {number} start @param {-1|1} sign @returns {number[]} */
function encode(p, start, sign) {
  const c = [p[0]];
  for (let i = 1; i < p.length; i++) {
    const key = (primes[start + i] - 1) % 28;
    const exponent = ((p[i] - sign * key) % 28 + 28) % 28;
    c.push(p[i] === 28 ? c[i - 1] : (c[i - 1] + powers[exponent]) % 29);
  }
  return c;
}

/** @param {number[]} c @param {number} start @param {-1|1} sign @returns {number[]} */
function decode(c, start, sign) {
  const p = [c[0]];
  for (let i = 1; i < c.length; i++) {
    const delta = (c[i] - c[i - 1] + 29) % 29;
    const key = (primes[start + i] - 1) % 28;
    p.push(delta === 0 ? 28 : ((logarithm[delta] + sign * key) % 28 + 28) % 28);
  }
  return p;
}

/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const bins = Array(29).fill(0);
  for (const x of xs) { assert(x >= 0 && x < 29); bins[x]++; }
  return bins.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

const clear = corpus.pages[57].indices;
assert(Math.abs(ioc(clear) - 0.06270996640537514) < 1e-14);
const planted = [...clear];
planted[8] = 28;
for (const sign of [-1, 1]) {
  const cipher = encode(planted, 0, sign);
  assert.deepEqual(decode(cipher, 0, sign), planted, "95-rune solved-p57-shaped plant must invert");
  assert(cipher[8] === cipher[7], "EA zero step emits identical ciphertext rune");
}
let repeat = 0;
for (const page of pages) {
  for (let i = 1; i < page.indices.length; i++) repeat += Number(page.indices[i] === page.indices[i - 1]);
}
assert.equal(repeat, 86);

const output = [];
for (const clock of ["page", "book"]) {
  for (const sign of [-1, 1]) {
    let first = 0;
    const source = [], decoded = [];
    for (const page of pages) {
      const offset = clock === "book" ? first : 0;
      const p = decode(page.indices, offset, sign);
      assert.deepEqual(encode(p, offset, sign), page.indices, "original GP inverse/forward identity");
      source.push(...page.indices.slice(1));
      decoded.push(...p.slice(1));
      first += page.indices.length;
    }
    assert.equal(decoded.length, 12901);
    output.push({clock, sign, ioc: ioc(decoded), range: [Math.min(...Array.from({length:29}, (_,x)=>decoded.filter(z=>z===x).length)), Math.max(...Array.from({length:29}, (_,x)=>decoded.filter(z=>z===x).length))], head: decoded.slice(0, 28).map(i => corpus.translit[i]).join(" ")});
  }
}
const observed = [
  ["page", -1, 0.03527619095689355],
  ["page", 1, 0.03529104468195182],
  ["book", -1, 0.0352842427334219],
  ["book", 1, 0.03527107146913075]
];
for (let i = 0; i < observed.length; i++) {
  assert.equal(output[i].clock, observed[i][0]);
  assert.equal(output[i].sign, observed[i][1]);
  assert(Math.abs(output[i].ioc - observed[i][2]) < 1e-13, "frozen original score");
}
console.log(JSON.stringify({
  status: "PASS",
  originalRunes: N,
  pages: pages.length,
  repeats: repeat,
  nativeClearP57IoC: ioc(clear),
  rawOriginalIoC: ioc(pages.flatMap(p => p.indices)),
  plantedP57RunesRecovered: planted.length,
  results: output
}, null, 2));

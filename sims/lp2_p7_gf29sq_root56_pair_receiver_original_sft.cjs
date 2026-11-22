"use strict";
/**
 * Original LP2 p7 residual x^2-8 root56 as the strict, source-canonical
 * two-rune GF(29^2) page-clock receiver, director issue #2309.
 *
 * A source-visible residual factor gives the extension-field ring.
 * Treat each *global* consecutive ciphertext rune pair as a+bX in
 * F29[X]/(X^2-8). For page p of its first rune, multiply by X^(-p).
 * Root sign is the only explicitly predeclared rival.
 *
 * This is a bounded **conditional** decoder. Neither the p7/p8 manuscript
 * nor a period-signed message has yet authorized a paired-rune cipher,
 * the page clock origin, or decoding via the extension-field generator.
 *
 * Windows 11 Node.js 22, CommonJS, no packages, no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const rawPages = data.pages.filter(p => p.page <= 55);
assert.equal(rawPages.length, 56);
assert.equal(rawPages.find(p => p.page === 50).indices.length, 0);
const M = 29;
const mod = n => (n % M + M) % M;

/** @typedef {[number, number]} F29Pair */
/** @param {F29Pair} a @param {F29Pair} b @returns {F29Pair} */
function mul(a, b) {
  return [mod(a[0] * b[0] + 8 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0])];
}
/** @param {F29Pair} a @param {number} n @returns {F29Pair} */
function power(a, n) {
  assert(Number.isSafeInteger(n) && n >= 0);
  let result = [1, 0];
  for (let x = a, k = n; k > 0; k = Math.floor(k / 2)) {
    if (k % 2) result = mul(result, x);
    x = mul(x, x);
  }
  return result;
}
const P = x => mod(11 + 26 * x + 8 * x ** 2 + 15 * x ** 3 + 2 * x ** 4);
for (let x = 0; x < M; x++) {
  const rhs = mod(2 * (x - 3) * (x - 4) * (x ** 2 - 8));
  assert.equal(mod(P(x) - x), rhs);
}
assert.deepEqual([0, 1], power([0, 1], 1));
assert.deepEqual(power([0, 1], 28), [28, 0]);
assert.deepEqual(power([0, 1], 56), [1, 0]);
assert.deepEqual(power([0, M - 1], 28), [28, 0]);
assert.deepEqual(power([0, M - 1], 56), [1, 0]);
for (const sign of [1, -1]) {
  const gen = [0, mod(sign)];
  for (let n = 1; n < 56; n++) {
    assert.notDeepEqual(power(gen, n), [1, 0], "generator must have period56");
  }
  for (let n = 0; n < 56; n++) {
    const factor = power(gen, n);
    // Use exact iterative finite-field recurrence (no overflowing powers).
    const slow = [1, 0];
    for (let i = 0; i < n; i++) {
      const next = mul(slow, gen);
      slow[0] = next[0]; slow[1] = next[1];
    }
    assert.deepEqual(factor, slow);
    assert.equal(Number(factor[0] === 0) + Number(factor[1] === 0), 1,
      "power of X must be a monomial matrix on rune pairs");
    // Encipher/decrypt on a synthetic arbitrary pair.
    const x = [7, 19];
    assert.deepEqual(mul(mul(x, power(gen, (56 - n) % 56)), factor), x);
  }
}

const ciphertext = [], originPage = [];
const pageStarts = new Map();
for (const p of rawPages) {
  pageStarts.set(p.page, ciphertext.length);
  ciphertext.push(...p.indices);
  for (let i = 0; i < p.indices.length; i++) originPage.push(p.page);
}
assert.equal(ciphertext.length, 12956);
assert.equal(ciphertext.length % 2, 0);
const pagePairs = new Map();
for (let i = 0; i < ciphertext.length; i += 2) {
  const owner = originPage[i];
  if (!pagePairs.has(owner)) pagePairs.set(owner, []);
  pagePairs.get(owner).push(i);
}
assert.equal(pagePairs.has(50), false);

/** Exact GF29 frequency collision probability, invariant under symbol relabel. */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const value of a) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    count[value]++;
  }
  const n = a.length;
  return n <= 1 ? null :
    count.reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1));
}
/** Apply fixed source-natural page exponent to all pairs, unchanged layout. */
function apply(a, sign, decode) {
  assert.equal(a.length, ciphertext.length);
  const out = a.slice();
  const gen = [0, mod(sign)];
  for (let i = 0; i < a.length; i += 2) {
    const p = originPage[i];
    const exponent = decode ? (56 - p) % 56 : p;
    const pair = mul([a[i], a[i + 1]], power(gen, exponent));
    out[i] = pair[0];
    out[i + 1] = pair[1];
  }
  return out;
}
function physicalRange(a, lo, hi) {
  return rawPages.filter(p => p.page >= lo && p.page <= hi)
    .flatMap(p => a.slice(pageStarts.get(p.page), pageStarts.get(p.page) + p.indices.length));
}
function region(a) {
  const ranges = [[0, 0], [16, 21], [40, 53], [54, 55]];
  return Object.fromEntries(ranges.map(([lo, hi]) => {
    const take = physicalRange(a, lo, hi);
    return ["p" + lo + "-" + hi, {runes: take.length, ioc: ioc(take)}];
  }));
}
assert.equal(region(ciphertext)["p16-21"].runes, 1613);
assert.equal(region(ciphertext)["p40-53"].runes, 3008);
assert.equal(region(ciphertext)["p54-55"].runes, 308);

function byPairParityIoC(a, page) {
  const sites = pagePairs.get(page) || [];
  return [0, 1].map(parity => ioc(sites.map(i => a[i + parity])));
}
const results = [];
for (const sign of [1, -1]) {
  const received = apply(ciphertext, sign, true);
  const exact = apply(received, sign, false);
  assert.deepEqual(exact, ciphertext);
  // Generator p0 = 1: the entire original p0 is untouched, an exact
  // failure to decipher p0 with the unselected but natural zero-origin rule.
  assert.deepEqual(physicalRange(received, 0, 0), physicalRange(ciphertext, 0, 0));
  let parityInvariants = 0;
  for (const p of rawPages) {
    if (!pagePairs.has(p.page)) continue;
    const first = byPairParityIoC(ciphertext, p.page);
    const second = byPairParityIoC(received, p.page);
    // The monomial matrix swaps rune parity for every odd physical page.
    const expected = p.page % 2 ? [...first].reverse() : first;
    for (let j = 0; j < 2; j++) {
      if (expected[j] !== null) {
        assert.ok(Math.abs(expected[j] - second[j]) < 1e-15);
        parityInvariants++;
      }
    }
  }
  results.push({rootSign:sign,book: {runes: received.length, ioc:ioc(received)},
    regions:region(received),p0Unchanged:true,exactForwardReplay:true,
    originalParityIoCPreserved:parityInvariants});
}
// Source-native p57 controls with 95 genuine runes, repeated or trimmed
// to match original 12,956-symbol register exactly.
const parable = data.pages.find(p => p.page === 57).indices;
assert.equal(parable.length, 95);
const plant = Array.from({length:ciphertext.length},(_,i)=>parable[i % parable.length]);
for (const sign of [1, -1]) {
  const encoded = apply(plant, sign, false);
  const recovered = apply(encoded, sign, true);
  assert.deepEqual(recovered, plant);
}
console.log(JSON.stringify({
  source:"p7 original red products [11,26,8,15,2], residual x^2-8",
  result:"monomial 56-period GF29^2 generator is page-parity scaling/permutation",
  naturalClock:"GF29[X]/(X^2-8) as two global successive runes; X^(page number)",
  original:region(ciphertext),
  rootCandidates:results,
  independentNativePositive:"true solved p57 corpus planted and reencrypted/decrypted exactly"
}, null, 2));
console.log("PASS: original GP29 polynomial and GF29^2 order56, exact root± full-book inverse, intrinsic parity IoC invariant, and source-native positive.");

"use strict";

/**
 * Original-source eight-column and sixteen-prime lag-eight field-feedback
 * decoder. Source-fixed original LP2 data, no fitted key/phase/language.
 *
 * SFT: node sims/lp2_fibonacci_lag8_authored_key_schedule_sft.cjs
 * Node.js 22, CommonJS standard library only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} rel @returns {string} */
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes = grid.pages.flatMap((p) => p.bytes);
const primes16 = [2, 3, 5, 7, 13, 23, 43, 79,
  149, 263, 463, 829, 1481, 2593, 4507, 7817];
const keys = [
  ["printed-table-first-row", bytes.slice(0, 8)],
  ["printed-table-complete", bytes],
  ["p15-fibonacci-prime16", primes16],
  ["p15-fibonacci-totient16", primes16.map((x) => x - 1)]
];
const FIB = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
const ALL = Array.from({length: 56}, (_, n) => n)
  .filter((n) => corpus.pages[n].indices.length > 0);
/** @param {number} n @returns {number} */
const mod = (n) => ((n % 29) + 29) % 29;

/**
 * Let D_i=C_i-C_(i-1). Decode R_i=D_i-K_(i-9)*D_(i-8) mod29.
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {number[]}
 */
function decode(cipher, key) {
  const step = cipher.map((c, i) =>
    i ? mod(c - cipher[i - 1]) : 0);
  return step.slice(9).map((delta, offset) =>
    mod(delta - key[offset % key.length] * step[offset + 1]));
}

/**
 * Recompose every original rune from nine authentic IV runes and plaintext.
 * @param {number[]} iv
 * @param {number[]} plain
 * @param {number[]} key
 * @returns {number[]}
 */
function encode(iv, plain, key) {
  assert.equal(iv.length, 9);
  const cipher = iv.slice();
  const step = [0];
  for (let i = 1; i < iv.length; i++)
    step.push(mod(iv[i] - iv[i - 1]));
  for (let i = 0; i < plain.length; i++) {
    const current = cipher.length;
    const next = mod(plain[i] + key[i % key.length] * step[current - 8]);
    cipher.push(mod(cipher[current - 1] + next));
    step.push(next);
  }
  return cipher;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const v of values) count[v]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * Any page-specific secret permutation preserves each source residual bin
 * count. A single GP plaintext letter and any two different letters therefore
 * have absolute pagewise capacity ceilings.
 * @param {number[]} pages
 * @param {number[]} key
 * @returns {{one:number,two:number,total:number}}
 */
function capacity(pages, key) {
  let one = 0, two = 0, total = 0;
  for (const p of pages) {
    const decoded = decode(corpus.pages[p].indices, key);
    const h = Array(29).fill(0);
    for (const v of decoded) h[v]++;
    h.sort((a, b) => b - a);
    one += h[0];
    two += h[0] + h[1];
    total += decoded.length;
  }
  return {one, two, total};
}
function main() {
  assert.equal(ALL.length, 55);
  assert.equal(FIB.length, 10);
  assert.equal(corpus.pages.slice(0, 56)
    .reduce((n, p) => n + p.indices.length, 0), 12956);
  assert.equal(bytes.length, 256);
  assert.deepEqual(bytes.slice(0, 8),
    [203, 231, 167, 186, 97, 237, 126, 183]);
  assert.deepEqual(primes16.slice(0, 8),
    [2, 3, 5, 7, 13, 23, 43, 79]);
  assert.equal(corpus.pages[57].indices.length, 95);
  const solved = corpus.pages[57].indices;
  const expected = [
    {name: "printed-table-first-row", fibIoc: 0.03444276705823151,
      allIoc: 0.03449885311513817, one: 139, two: 262},
    {name: "printed-table-complete", fibIoc: 0.03442350332594235,
      allIoc: 0.03447553799636568, one: 134, two: 254},
    {name: "p15-fibonacci-prime16", fibIoc: 0.03437436115173531,
      allIoc: 0.034474468850035224, one: 124, two: 244},
    {name: "p15-fibonacci-totient16", fibIoc: 0.03439598370838641,
      allIoc: 0.03449900769051125, one: 142, two: 266}
  ];
  const results = [];
  for (let k = 0; k < keys.length; k++) {
    const [name, key] = keys[k];
    const f = FIB.flatMap(p => decode(corpus.pages[p].indices, key));
    const all = ALL.flatMap(p => decode(corpus.pages[p].indices, key));
    assert.equal(f.length, 2256);
    assert.equal(all.length, 12461);
    const cap = capacity(FIB, key);
    const obs = {name, fibIoc: ioc(f), allIoc: ioc(all),
      one: cap.one, two: cap.two};
    assert.equal(name, expected[k].name);
    for (const prop of ["fibIoc", "allIoc"]) {
      assert.ok(Math.abs(obs[prop] - expected[k][prop]) < 1e-12,
        name + " source data changed");
    }
    assert.deepEqual([cap.one, cap.two, cap.total],
      [expected[k].one, expected[k].two, 2256]);
    assert.ok(cap.one < 195 && cap.two < 386,
      "Source-native English reference minima not met");
    for (const p of ALL) {
      const original = corpus.pages[p].indices;
      assert.deepEqual(encode(original.slice(0, 9),
        decode(original, key), key), original);
    }
    for (const p of FIB) {
      const iv = corpus.pages[p].indices.slice(0, 9);
      const n = corpus.pages[p].indices.length - 9;
      const planted = Array.from({length: n},
        (_, i) => solved[i % solved.length]);
      assert.deepEqual(decode(encode(iv, planted, key), key), planted);
    }
    results.push({...obs, keyLength: key.length});
  }
  console.log(JSON.stringify({
    input: "unchanged LP2 original GP29 and printed 256-byte table",
    originalUnknownRunes: 12956, fibonacciTail: 2256,
    wholePageRoundTrips: 220, nativeGPPositivePageRoundTrips: 40,
    results,
    decision: "No source-fixed phase schedule yields direct GP-native text; all independent page substitution alphabets remain frequency-incompatible"
  }, null, 2));
}
if (require.main === module) main();
module.exports = {decode, encode, ioc, capacity, keys};

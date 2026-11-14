"use strict";

/**
 * Test the concrete 2014 seven-by-seven square -> archived HTML 133/331 ->
 * direct GP29 periodic-key reading, on authentic solved p56 and unknown p55.
 * Causal premise is provisional; this is not a recovered ciphertext key.
 * Run: node sims/lp2_stage11_html_7square_center331_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(base, name), "utf8");
const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/).map((part) => part.trim().split(/\s+/).map(Number));
assert.deepEqual(squares.map((s) => s.length), [25, 49, 25]);
for (const square of squares) {
  assert.ok(square.every((n, i) => n === square[square.length - i - 1]),
    "Every historical magic square is 180-degree centrosymmetric");
}
assert.deepEqual(squares.map((s) => s[Math.floor(s.length / 2)]), [809, 331, 91]);
assert.deepEqual(squares.map((s) => s.slice(0, Math.sqrt(s.length))
  .reduce((a, b) => a + b, 0)), [3301, 1033, 1033]);
const html = read("resources/cicada2014-onion7-index.html");
assert.match(html, /<title>133<\/title>/i);
assert.match(html, /<div id="331">/i);
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p56 = corpus.pages.find((p) => p.page === 56).indices;
assert.deepEqual([p55.length, p56.length], [76, 85]);

/** @param {number} n Positive integer. @returns {number} Euler's totient. */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let out = n;
  let remaining = n;
  for (let divisor = 2; divisor * divisor <= remaining; divisor++) {
    if (remaining % divisor === 0) {
      while (remaining % divisor === 0) remaining /= divisor;
      out -= out / divisor;
    }
  }
  if (remaining > 1) out -= out / remaining;
  return out;
}

/** @param {number} length Prime count. @returns {number[]} */
function firstPrimes(length) {
  const out = [];
  for (let n = 2; out.length < length; n++) {
    if (out.every((p) => n % p !== 0)) out.push(n);
  }
  return out;
}
const primes = firstPrimes(p56.length);
let clock = 0;
const known56 = p56.map((c, i) => i === 56
  ? c
  : (c - (primes[clock++]-1) % 29 + 29) % 29);
assert.equal(known56.slice(0, 5).map((v) => corpus.translit[v]).join(""), "ANEND");
assert.equal(clock, 84);

/** @param {number[]} cipher Original GP indices.
 *  @param {number[]} key Original 7x7 square projected into GP29.
 *  @param {number} phase Fixed key phase.
 *  @param {number} sign Addition or subtraction.
 *  @returns {number[]} Candidate GP indices.
 */
function decode(cipher, key, phase, sign) {
  return cipher.map((c, i) => (c + sign * key[(i + phase) % 49] % 29 + 29) % 29);
}
for (const [method, numbers] of [
  ["value", squares[1]],
  ["totient", squares[1].map(phi)]
]) {
  const key = numbers.map((n) => n % 29);
  // The exact source 180-degree reversal is identical: no reverse phase choice.
  assert.deepEqual(key, [...key].reverse());
  for (const sign of [-1, 1]) {
    const p56Matches = [0, 24].map((phase) => decode(p56, key, phase, sign)
      .filter((v, i) => v === known56[i]).length);
    const ranks = Array.from({length: 49}, (_, phase) =>
      decode(p56, key, phase, sign).filter((v, i) => v === known56[i]).length);
    const max = Math.max(...ranks);
    assert.ok(max <= 7, "Original known p56 unexpectedly fits the proposed direct key");
    for (const phase of [0, 24]) {
      const candidate = decode(p55, key, phase, sign);
      const recovered = candidate.map((v, i) =>
        (v - sign * key[(i + phase) % 49] % 29 + 29) % 29);
      assert.deepEqual(recovered, p55, "Forward re-encryption must recover original p55");
    }
    console.log(JSON.stringify({method, sign, p56Matches,
      bestOfAll49Phases: max,
      p55FromCenteredKey: decode(p55, key, 24, sign)
        .map((v) => corpus.translit[v]).join("")}));
  }
}
console.log("SOURCE BOUNDARY: 7x7 center=331 matches archived HTML id; all three squares "
  + "are rotationally symmetric. Tested direct periodic variants yield no "
  + "source-authenticated unknown plaintext or key.");

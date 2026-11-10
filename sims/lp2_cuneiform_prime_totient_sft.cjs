"use strict";
/**
 * Test the two repeated 1033/3301 cuneiform numerals as initial primes for
 * the historically solved page-56 additive prime-totient GP29 cipher.
 * Fixed visible starts are p33 start, second heading, and p34 start.
 * This is a finite original-source negative, not key or plaintext recovery.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const allCipher = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
const solved = corpus.pages.find((p) => p.page === 56).indices;
const prefixLength = (limit) => corpus.pages
  .filter((p) => p.page < limit).reduce((n, p) => n + p.indices.length, 0);

/** @param {number} count @returns {number[]} */
function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let valid = true;
    for (const p of out) {
      if (p * p > n) break;
      if (n % p === 0) { valid = false; break; }
    }
    if (valid) out.push(n);
  }
  return out;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const v of a) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/**
 * @param {number[]} cipher
 * @param {number} primeIndex
 * @param {number[]} p
 * @returns {number[]}
 */
function decrypt(cipher, primeIndex, p) {
  return cipher.map((c, i) => (c - ((p[primeIndex + i] - 1) % 29) + 29) % 29);
}

/**
 * @param {number[]} plain
 * @param {number} primeIndex
 * @param {number[]} p
 * @returns {number[]}
 */
function encrypt(plain, primeIndex, p) {
  return plain.map((v, i) => (v + p[primeIndex + i] - 1) % 29);
}

function main() {
  const starts = [prefixLength(33), prefixLength(33) + 91, prefixLength(34)];
  const end = prefixLength(40);
  assert.deepEqual(starts, [7960, 8051, 8174]);
  assert.equal(end, 9640);
  assert.equal(allCipher.length, 12956);
  const p = primes(2400);
  assert.equal(p[173], 1033); // 174th prime
  assert.equal(p[463], 3301); // 464th prime
  // Historical solved p56 has a literal F interrupt at rune 56.
  let j = 0;
  const controlPlain = solved.map((c, i) => i === 56
    ? c : (c - ((p[j++] - 1) % 29) + 29) % 29);
  assert.equal(controlPlain.map((v) => corpus.translit[v]).join("").slice(0, 21),
    "ANENDWITHINTHEDEEPWEB");
  assert.ok(ioc(controlPlain) > 0.06);
  const results = [];
  for (const start of starts) {
    const cipher = allCipher.slice(start, end);
    for (const sourcePrime of [1033, 3301]) {
      const primeIndex = p.indexOf(sourcePrime);
      const decoded = decrypt(cipher, primeIndex, p);
      assert.deepEqual(encrypt(decoded, primeIndex, p), cipher);
      assert.deepEqual(decrypt(encrypt(controlPlain, primeIndex, p), primeIndex, p),
        controlPlain);
      results.push({
        startGlobalRune: start,
        sourcePrime,
        sourcePrimeOrdinal: primeIndex + 1,
        runes: cipher.length,
        ioc: Number(ioc(decoded).toFixed(9)),
        prefixTranslit: decoded.slice(0, 80).map((v) => corpus.translit[v]).join("")
      });
    }
  }
  assert.equal(results.length, 6);
  assert.ok(results.every((r) => r.ioc < 0.035));
  console.log(JSON.stringify({
    status: "SOURCE-FROZEN DIRECT 1033/3301 PRIME-START NEGATIVE; NO UNKNOWN LP2 PLAINTEXT",
    originalRuneTargetEnd: end,
    authenticSolvedP56Control: {
      runes: controlPlain.length, ioc: Number(ioc(controlPlain).toFixed(9))
    },
    results
  }, null, 2));
}
if (require.main === module) main();
module.exports = { main, primes, ioc, decrypt, encrypt };

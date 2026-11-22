"use strict";

/**
 * Reconstruct the LP2 page-15 four-by-four square from Fibonacci-indexed
 * primes, reading outwards clockwise from its red central number 3299.
 *
 * Executable: node sims/fibonacci_prime_spiral.cjs
 * Uses genuine repository source inputs and authentic recovered LP1 runes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const mod = (n) => ((n % 29) + 29) % 29;
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/** @returns {number[][]} */
function readSquare() {
  const master = read("resources/transcriptions/liber_primus_master.txt");
  const blocks = master.match(/^(?:\d+(?:-\d+){3}\/(?:\r?\n|$)){4}/gm) || [];
  assert.equal(blocks.length, 1, "Expected one four-row four-column numeric square");
  const grid = blocks[0].trim().split(/\r?\n/u).map((line) =>
    line.replace(/\/$/u, "").split("-").map(Number));
  assert.equal(grid.length, 4);
  for (const row of grid) assert.equal(row.length, 4);
  assert.deepEqual(grid, [
    [3258, 3222, 3152, 3038],
    [3278, 3299, 3298, 2838],
    [3288, 3294, 3296, 2472],
    [4516, 1206, 708, 1820]
  ]);
  return grid;
}

/** @param {number} count @returns {number[]} */
function primeList(count) {
  const bound = 20000;
  const composite = new Uint8Array(bound + 1);
  const primes = [];
  for (let n = 2; n <= bound && primes.length < count; n++) {
    if (composite[n]) continue;
    primes.push(n);
    if (n * n <= bound)
      for (let multiple = n * n; multiple <= bound; multiple += n)
        composite[multiple] = 1;
  }
  assert.equal(primes.length, count);
  return primes;
}

/** @returns {number[]} */
function uniqueFibonacciPrimeRanks() {
  // F_0=0, F_1=1, F_2=1; the duplicate rank 2 occurs only once.
  let a = 0, b = 1;
  const ranks = [];
  while (ranks.length < 16) {
    const rank = a + 1;
    if (!ranks.includes(rank)) ranks.push(rank);
    [a, b] = [b, a + b];
  }
  return ranks;
}

/** @returns {number[][]} */
function clockwiseSpiral() {
  const moves = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let row = 1, col = 1, direction = 0, length = 1, turns = 0;
  const coordinates = [[row, col]];
  while (coordinates.length < 16) {
    for (let j = 0; j < length && coordinates.length < 16; j++) {
      row += moves[direction][0];
      col += moves[direction][1];
      assert.ok(row >= 0 && row < 4 && col >= 0 && col < 4);
      coordinates.push([row, col]);
    }
    direction = (direction + 1) % 4;
    if (++turns % 2 === 0) length++;
  }
  assert.equal(new Set(coordinates.map(([r, c]) => 4 * r + c)).size, 16);
  return coordinates;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const histogram = new Array(29).fill(0);
  for (const value of values) histogram[value]++;
  const n = values.length;
  return histogram.reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1));
}

/** @param {number[]} cipher @param {Record<string,number[]>} keys */
function scan(cipher, keys) {
  const scores = [];
  for (const [keyName, key] of Object.entries(keys)) {
    assert.equal(key.length, 16);
    for (let shift = 0; shift < 16; shift++) {
      for (const sign of [-1, 1]) {
        const plaintext = cipher.map((rune, i) =>
          mod(rune + sign * key[(i + shift) % 16]));
        scores.push({key: keyName, shift, sign, ioc: ioc(plaintext)});
      }
    }
  }
  scores.sort((a, b) => b.ioc - a.ioc);
  return {runes: cipher.length, ciphertextIoc: ioc(cipher),
    configurations: scores.length, highest: scores[0]};
}

function main() {
  const grid = readSquare();
  const coordinates = clockwiseSpiral();
  const observed = coordinates.map(([r, c]) => grid[r][c]);
  const ranks = uniqueFibonacciPrimeRanks();
  const allPrimes = primeList(ranks[ranks.length - 1]);
  const primes = ranks.map((rank) => allPrimes[rank - 1]);
  const predicted = primes.map((prime) => Math.abs(3301 - prime));
  assert.deepEqual(observed, predicted, "Every spiral cell must match exactly");
  assert.deepEqual(ranks, [1, 2, 3, 4, 6, 9, 14, 22,
    35, 56, 90, 145, 234, 378, 611, 988]);
  assert.deepEqual(primes, [2, 3, 5, 7, 13, 23, 43, 79,
    149, 263, 463, 829, 1481, 2593, 4507, 7817]);
  assert.deepEqual(observed, [3299, 3298, 3296, 3294, 3288, 3278,
    3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516]);

  const keys = {
    "clockwise-numbers": observed,
    "clockwise-primes": primes,
    "Fibonacci-prime-ranks": ranks,
    "printed-row-major": grid.flat(),
    "counterclockwise-numbers": observed.slice().reverse()
  };
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const pages = corpus.pages;
  const joined = (start, end) => pages.slice(start, end).flatMap((page) =>
    page.indices);
  const real = {
    nextPage16: scan(joined(16, 17), keys),
    followingPages16to22: scan(joined(16, 23), keys),
    allUnsolved: scan(joined(0, 56), keys)
  };

  // Genuine historically recovered GP rune plaintext, re-enciphered under
  // the proposed periodic additive key. This validates the scoring pipeline
  // without treating an artificially generated stream as actual LP2 evidence.
  const lp1 = require("./authentic_lp1_p03_p04_vigenere_recovery.cjs");
  const plain = lp1.plaintext.slice(0, 251);
  const synthetic = plain.map((rune, i) => mod(rune + observed[i % 16]));
  const recovered = synthetic.map((rune, i) => mod(rune - observed[i % 16]));
  assert.deepEqual(recovered, plain);
  assert.ok(ioc(plain) > 0.04);
  console.log(JSON.stringify({
    construction: "abs(3301 - prime(Fibonacci(n)+1)), unique Fibonacci values",
    originalScan: "32.jpg", lp2Page: 15, anchor: 3301,
    coordinates, primeRanks: ranks, primes, spiral: observed,
    exactMatches: 16, syntheticPositive: {
      actualSolvedGpRunes: plain.length,
      correctlyReproduced: recovered.length,
      plaintextIoc: ioc(plain),
      maskedIoc: ioc(synthetic)
    },
    candidateStreamTest: real,
    conclusion: "Exact original numerical construction; no validated LP2 decryption"
  }, null, 2));
}

if (require.main === module) main();
module.exports = {readSquare, primeList, uniqueFibonacciPrimeRanks,
  clockwiseSpiral, ioc, scan};

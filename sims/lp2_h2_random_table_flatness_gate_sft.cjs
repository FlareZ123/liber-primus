"use strict";

/**
 * Source-native blind H2 tableau-marginal gate.
 *
 * Independent H2 random-table plants reproduce original length and the
 * authenticated p56 successive-prime totient row clock, plus the published
 * q=0.81 repeated-cipher proposal rejection. Compare their raw GP29 index
 * of coincidence with untouched LP2 p0–55, using two independent English
 * registers. A cyclic, secret-base-permutation Latin tableau is the
 * structurally balanced competing model with the SAME stochastic skip.
 *
 * All secret tables and actual skipped pointer paths stay inside the plant
 * generator. Only ciphertext glyph frequencies and repeat counts score.
 * This is a marginal family test, NOT original decryption or key recovery.
 *
 * Node.js 22 CommonJS; no network, no file writes, deterministic.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = relative => fs.readFileSync(path.join(root, relative), "utf8");
const gp = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const gibran = load("resources/control/gibran_prophet_58585.txt");
const shakespeare = load("resources/control/shakespeare_first300k.txt");
const N = 29;
const original = gp.pages.filter(page => page.page < 56)
  .flatMap(page => page.indices);
const LENGTH = original.length;
assert.equal(LENGTH, 12956);
assert.equal(gp.translit.length, N);

const tokens = gp.translit.map((value, index) => ({value, index}))
  .sort((a, b) => b.value.length - a.value.length);

/** @param {string} word @returns {number[]} */
function wordToGP(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith("ING", i)) {
      out.push(21); i += 3;
    } else if (normalized.startsWith("IO", i)) {
      out.push(27); i += 2;
    } else {
      const t = tokens.find(t => normalized.startsWith(t.value, i));
      assert.ok(t, "GP29 spelling must exist");
      out.push(t.index); i += t.value.length;
    }
  }
  return out;
}

/** @param {string} source @returns {number[]} */
function toGP(source) {
  return (source.match(/[A-Za-z]+/g) || []).flatMap(wordToGP);
}
const texts = {gibran: toGP(gibran), shakespeare: toGP(shakespeare)};
assert.equal(texts.gibran.length, 62492);
assert.equal(texts.shakespeare.length, 217106);

/** @returns {number[]} Ordinary-prime φ mod 29, starting from prime 2. */
function primeRows() {
  const composite = new Uint8Array(550000);
  const rows = [];
  for (let p = 2; p < composite.length && rows.length < 18000; p++) {
    if (composite[p]) continue;
    rows.push((p - 1) % N);
    if (p * p < composite.length)
      for (let j = p * p; j < composite.length; j += p)
        composite[j] = 1;
  }
  assert.equal(rows.length, 18000);
  assert.equal(rows[9], 28); // φ(29) mod29, a unique row.
  assert.equal(rows.filter(row => row === 28).length, 1);
  return rows;
}
const rows = primeRows();

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  const rand = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  return {rand, index: size => Math.floor(rand() * size)};
}

/** @param {{index:(size:number)=>number}} random */
function permutation(random) {
  const out = Array.from({length: N}, (_, i) => i);
  for (let j = N - 1; j > 0; j--) {
    const k = random.index(j + 1);
    [out[j], out[k]] = [out[k], out[j]];
  }
  return out;
}

/** @param {number[]} cipher */
function stats(cipher) {
  const counts = new Uint32Array(N);
  let equalAdjacent = 0;
  for (let i = 0; i < cipher.length; i++) {
    counts[cipher[i]]++;
    if (i > 0 && cipher[i] === cipher[i - 1]) equalAdjacent++;
  }
  let equalPairs = 0;
  for (const count of counts)
    equalPairs += count * (count - 1);
  return {
    ioc: equalPairs / (cipher.length * (cipher.length - 1)),
    equalAdjacent
  };
}
const originalStats = stats(original);
assert.ok(Math.abs(originalStats.ioc - 0.03447839786450569) < 1e-12);
assert.equal(originalStats.equalAdjacent, 86);

/**
 * @param {number[]} plain
 * @param {number[][]} table
 * @param {{rand:()=>number}} random
 * @returns {Uint8Array}
 */
function encipher(plain, table, random) {
  const cipher = new Uint8Array(LENGTH);
  let pointer = 0, previous = -1;
  for (let i = 0; i < LENGTH; i++) {
    let emitted = table[rows[pointer]][plain[i]];
    while (emitted === previous && random.rand() < 0.81) {
      pointer++;
      emitted = table[rows[pointer]][plain[i]];
    }
    cipher[i] = emitted;
    previous = emitted;
    pointer++;
  }
  return cipher;
}

/**
 * @param {"gibran"|"shakespeare"} corpusName
 * @param {"random"|"cyclic"} mode
 * @param {number} trials
 * @param {number} seed
 */
function trialSet(corpusName, mode, trials, seed) {
  const source = texts[corpusName];
  const random = rng(seed);
  const frequencies = [], repeats = [];
  let atOrBelowOriginal = 0;
  for (let trial = 0; trial < trials; trial++) {
    const offset = random.index(source.length - LENGTH);
    const plain = source.slice(offset, offset + LENGTH);
    const table = mode === "random"
      ? Array.from({length: N}, () => permutation(random))
      : (() => {
          const shift = random.index(N);
          const base = permutation(random);
          return Array.from({length: N}, (_, row) =>
            Array.from({length: N}, (_, p) =>
              (base[p] + row + shift) % N));
        })();
    const result = stats(encipher(plain, table, random));
    frequencies.push(result.ioc);
    repeats.push(result.equalAdjacent);
    atOrBelowOriginal += Number(result.ioc <= originalStats.ioc);
  }
  frequencies.sort((a, b) => a - b);
  repeats.sort((a, b) => a - b);
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  return {
    corpus: corpusName, mode, trials, seed,
    meanIoc: mean(frequencies),
    minIoc: frequencies[0],
    fifthPercentileIoc: frequencies[Math.floor(trials * 0.05)],
    medianIoc: frequencies[Math.floor(trials * 0.5)],
    ninetyFifthPercentileIoc: frequencies[Math.floor(trials * 0.95)],
    maxIoc: frequencies.at(-1),
    matchesOriginalFlatness: atOrBelowOriginal,
    meanAdjacentRepeats: mean(repeats),
    fifthPercentileRepeats: repeats[Math.floor(trials * 0.05)],
    ninetyFifthPercentileRepeats: repeats[Math.floor(trials * 0.95)]
  };
}
const tests = [
  trialSet("gibran", "random", 1000, 0xC1CA3301),
  trialSet("shakespeare", "random", 600, 0xC1CA3302),
  trialSet("gibran", "cyclic", 1000, 0xCE1C3301)
];
assert.equal(tests[0].matchesOriginalFlatness, 0);
assert.equal(tests[1].matchesOriginalFlatness, 0);
assert.equal(tests[2].matchesOriginalFlatness, 108);
assert.ok(tests[0].minIoc > originalStats.ioc);
assert.ok(tests[1].minIoc > originalStats.ioc);
assert.ok(tests[2].minIoc < originalStats.ioc);
assert.ok(Math.abs(tests[0].meanIoc - 0.035337763679318825) < 1e-12);
assert.ok(Math.abs(tests[1].meanIoc - 0.03532377912047179) < 1e-12);
assert.ok(Math.abs(tests[2].meanIoc - 0.03450731928950153) < 1e-12);

console.log(JSON.stringify({
  claim: "Independent random H2 tableaux have a marginal flatness mismatch",
  original: originalStats,
  expectation: "1/29 + (English-IoC - 1/29) × sum(rowWeight²)",
  singleUseRow: "phi(prime29) mod29 = 28; never repeated for later primes",
  tests
}, null, 2));

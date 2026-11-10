"use strict";
/**
 * LP2 source Fibonacci root-key attack:
 * - p40 first red 8 rune sum /29 = 15
 * - p15 first red 9 rune sum /29 = 22, naming ordinary 22nd prime 79
 * - p15 second red span length 11
 * - p53 highlighted 51 rune sum /29 = 78
 * - GPprime[15] = 53, 53^11 mod79 = 30, x^2 = x+1 mod79
 * - 53^4 mod79 = 40, 53^15 mod79 = 15
 * The Fibonacci (15,22) pair evolves mod79 with period78. Exactly the
 * first sixteen source-defined 0..78 residues make an unpadded 128-bit
 * AES/ChaCha IV, matching the 4x4 visible square without choosing bit order.
 *
 * Both a direct mod29 GP-Fibonacci additive key with hidden collision skips
 * and this IV on eight authentic grid-column 256-bit keys are tested.
 * Original ciphertext results face matched source-preserving nulls and a
 * fully genuine English GP planted positive. No key is presumed authentic.
 * Node22 CommonJS. No write operations.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { originalBodies, originalKeys, viterbi } = require("./grid_stream_collision_viterbi.cjs");
const { search, plant, nulls } = require("./red_title_nonce_grid_viterbi.cjs");
const { train, encode } = require("./grid_keyskip_viterbi.cjs");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const CORPUS = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const INK = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const MOD = 29, WIDTH = 300, TOTAL = 8 * WIDTH, CYCLE = 78;
const pow = (x, n, p) => {
  let value = 1;
  for (let j = 0; j < n; j++) value = (value * x) % p;
  return value;
};

/** @returns {number[]} fully checked 78-residue seed-specific period */
function fibonacciCycle() {
  const redSum = (page, start, length) => {
    const pageInk = INK.pages.find(x => x.page === page);
    assert.ok(pageInk?.red_spans.some(s => s.start === start && s.length === length));
    const codes = CORPUS.pages[page].indices.slice(start, start + length);
    assert.equal(codes.length, length);
    return codes.reduce((sum, x) => sum + CORPUS.prime[x], 0);
  };
  assert.equal(redSum(40, 0, 8), 15 * 29);
  assert.equal(redSum(15, 0, 9), 22 * 29);
  assert.equal(redSum(15, 9, 11), 430);
  assert.equal(redSum(53, 128, 51), 78 * 29);
  assert.equal(CORPUS.prime[15], 53);
  assert.equal(pow(53, 4, 79), 40);
  assert.equal(pow(53, 11, 79), 30);
  assert.equal(pow(53, 15, 79), 15);
  assert.equal(pow(53, 78, 79), 1);
  const root = pow(53, 11, 79);
  assert.equal((root * root - root - 1) % 79, 0);
  let a = 15, b = 22;
  const result = [];
  for (let i = 0; i < CYCLE; i++) {
    assert.ok(i === 0 || a !== 15 || b !== 22, "early Fibonacci-cycle repeat");
    result.push(a);
    [a, b] = [b, (a + b) % 79];
  }
  assert.deepEqual([a, b], [15, 22]);
  assert.equal(new Set(result).size < CYCLE, true); // recurrence has revisits, pair does not
  return result;
}

/** @param {number[]} period */
function pad(period) {
  assert.equal(period.length, CYCLE);
  return Array.from({length: WIDTH + 35}, (_, i) => period[i % CYCLE] % MOD);
}
const mod = x => (x % MOD + MOD) % MOD;
/** @param {number} seed */
function random(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return x >>> 0;
  };
}

/** @param {number[][]} bodies @param {number[]} key @param {object} lm */
function direct(bodies, key, lm) {
  return [-1, 1].map(sign => {
    const details = bodies.map(c => viterbi(c, key, sign, lm));
    return {sign, perRune: details.reduce((s, x) => s + x.score, 0) / TOTAL,
      skipped: details.map(x => x.skips),
      prefixes: details.map(x => x.plaintext.slice(0, 55)
        .map(i => CORPUS.runes[i]).join(""))};
  }).sort((a, b) => b.perRune - a.perRune);
}

/** Actual source-language text enciphered using authentic source Fibonacci pad. */
function plantDirect(key, lm) {
  const heldout = encode(read("resources/control/shakespeare_first300k.txt").slice(205000));
  assert.ok(heldout.length >= TOTAL);
  const plain = Array.from({length: 8}, (_, i) =>
    heldout.slice(i * WIDTH, (i + 1) * WIDTH));
  const next = random(0x11337911);
  const actualSkipped = [];
  const cipher = plain.map(seq => {
    let j = 0, prev = -1, skips = 0;
    const result = [];
    for (const p of seq) {
      let c = mod(p + key[j]);
      if (c === prev && next() / 4294967296 < .81) {
        j++; skips++; c = mod(p + key[j]);
      }
      prev = c;
      result.push(c);
      j++;
    }
    actualSkipped.push(skips);
    return result;
  });
  const fit = direct(cipher, key, lm);
  const decoded = cipher.map(c => viterbi(c, key, 1, lm));
  const correct = plain.reduce((sum, p, i) =>
    sum + p.filter((x, j) => x === decoded[i].plaintext[j]).length, 0);
  assert.ok(correct > .9 * TOTAL);
  assert.equal(fit[0].sign, 1);
  return { sourceRunes: TOTAL, correctlyRecovered: correct, actualSkipped,
    inferredSkipped: decoded.map(x => x.skips),
    selectedSign: fit[0].sign, perRune: fit[0].perRune };
}

/** Same 78-letter multiset shuffled before periodic repetition and best-sign search. */
function directNull(bodies, period, lm, observed, trials = 120) {
  const rng = random(0x1164fe79);
  const scores = [];
  for (let t = 0; t < trials; t++) {
    const perm = period.slice();
    for (let i = perm.length - 1; i > 0; i--) {
      const j = rng() % (i + 1);
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    scores.push(direct(bodies, pad(perm), lm)[0].perRune);
  }
  scores.sort((a, b) => a - b);
  const hits = scores.filter(x => x >= observed).length;
  return { trials, sourceCycleHistogramPreserved: true,
    seed: "0x1164fe79", upperTailP: (hits + 1) / (trials + 1),
    exceed: hits, median: scores[Math.floor(trials / 2)],
    maximum: scores[scores.length - 1], minimum: scores[0] };
}
function run() {
  const cycle = fibonacciCycle(), iv = Buffer.from(cycle.slice(0, 16));
  const bodies = originalBodies(), keys = originalKeys();
  const lm = train(read("resources/control/shakespeare_first300k.txt").slice(0, 200000));
  const key = pad(cycle), ivs = keys.map(() => Buffer.from(iv));
  const directOriginal = direct(bodies, key, lm);
  const directPlant = plantDirect(key, lm);
  const dNull = directNull(bodies, cycle, lm, directOriginal[0].perRune);
  const aesOriginal = search(keys, bodies, ivs, lm);
  const aesPlant = plant(keys, ivs, lm);
  const aesNull = nulls(keys, bodies, ivs, lm, aesOriginal, 20);
  const result = {
    source: { redSpanQuotients: [15, 22, 78], secondP15RedLength: 11,
      gpPrime: 53, modulus: 79, f79FibonacciRoots: [30, 50],
      root30ExponentBase53: 11, root30Order: 78,
      root53Exp4: 40, root53Exp15: 15,
      sourceFibonacciPeriod: CYCLE, cyclePrefix: cycle.slice(0, 20),
      ivHex: iv.toString("hex") },
    directRuneFibonacciSkipModel: {
      original: directOriginal, planted: directPlant, nulls: dNull },
    fibonacciIvOnAuthenticGrid: {
      original: aesOriginal, planted: aesPlant, nulls: aesNull },
    declaration: "Candidate source recurrence exact; its use as a cipher key or IV is unproven. No decryption without genuine readable original LP2 plaintext."
  };
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  return result;
}
if (require.main === module) run();
module.exports = { fibonacciCycle, pad, direct, plantDirect, directNull, run };

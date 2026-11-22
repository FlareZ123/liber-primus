"use strict";

// Source-only signed/unsigned p15 4x4 matrix feedback, complete 29^4-key test.
// Read-only single-file Node 22 SFT: no output files and no external dependencies.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const mod = (v) => ((v % 29) + 29) % 29;
/** @param {string} p */
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const cipher = corpus.pages.filter((p) => p.page >= 16 && p.page <= 22)
  .flatMap((p) => p.indices);
assert.equal(cipher.length, 1744);
const LIMIT = 320;
const PAIRS = 29 * 29;
const TOTAL = PAIRS * PAIRS;
const ORIGINAL = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];
const matrix = (signed) => ORIGINAL.map((row, i) =>
  row.map((v, j) => mod(i === 3 && signed && j < 2 ? -v : v)));

/** @param {number[][]} m @param {number[]} v */
function times(m, v) {
  return m.map((row) => mod(row.reduce((s, x, j) => s + x * v[j], 0)));
}
/** @param {number[][]} a @param {number[][]} b */
function matmul(a, b) {
  return a.map((row) => row.map((_, j) =>
    mod(row.reduce((s, x, k) => s + x * b[k][j], 0))));
}
function ident() { return Array.from({ length: 4 }, (_, i) =>
  Array.from({ length: 4 }, (_, j) => Number(i === j))); }
function sameMatrix(a, b) {
  return a.every((row, i) => row.every((v, j) => v === b[i][j]));
}
function coincident(v, lag) {
  let count = 0;
  for (let i = 0; i + lag < v.length; i++)
    count += Number(v[i] === v[i + lag]);
  return count;
}
function pairNumerator(v) {
  const h = new Int32Array(29);
  for (const x of v) h[x]++;
  let n = 0;
  for (const count of h) n += count * (count - 1);
  return n;
}

/**
 * Inverse: P_t = C_t + sign*S_t mod29, sign = -1 or +1.
 * State: S_(t+1) = M*S_t + C_t mod29, 4-rune blocks.
 * @param {number[][]} m @param {number[]} c @param {number[]} seed @param {number} sign
 */
function decipher(m, c, seed, sign) {
  assert.equal(c.length % 4, 0);
  let state = seed.slice();
  const out = [];
  for (let k = 0; k < c.length; k += 4) {
    const block = c.slice(k, k + 4);
    out.push(...block.map((v, i) => mod(v + sign * state[i])));
    const next = times(m, state);
    state = next.map((v, i) => mod(v + block[i]));
  }
  return out;
}
/** Inverse of decipher for positive plant. */
function encipher(m, plain, seed, sign) {
  assert.equal(plain.length % 4, 0);
  let state = seed.slice();
  const out = [];
  for (let k = 0; k < plain.length; k += 4) {
    const block = plain.slice(k, k + 4);
    const c = block.map((v, i) => mod(v - sign * state[i]));
    out.push(...c);
    const next = times(m, state);
    state = next.map((v, i) => mod(v + c[i]));
  }
  return out;
}

/**
 * Plaintext feedback changes the state driver:
 * P_t = C_t + sign*S_t; S_(t+1) = M*S_t + P_t.
 */
function decipherPlain(m, c, seed, sign) {
  assert.equal(c.length % 4, 0);
  let state = seed.slice();
  const out = [];
  for (let k = 0; k < c.length; k += 4) {
    const block = c.slice(k, k + 4);
    const p = block.map((v, i) => mod(v + sign * state[i]));
    out.push(...p);
    const next = times(m, state);
    state = next.map((v, i) => mod(v + p[i]));
  }
  return out;
}
function encipherPlain(m, plain, seed, sign) {
  assert.equal(plain.length % 4, 0);
  let state = seed.slice();
  const out = [];
  for (let k = 0; k < plain.length; k += 4) {
    const block = plain.slice(k, k + 4);
    const c = block.map((v, i) => mod(v - sign * state[i]));
    out.push(...c);
    const next = times(m, state);
    state = next.map((v, i) => mod(v + block[i]));
  }
  return out;
}
function feedbackMatrix(m, sign) {
  return m.map((row, i) => row.map((v, j) => mod(v + sign * Number(i === j))));
}

/** Precompute all signed scalar contributions of the two 29^2 seed halves. */
function masks(m) {
  const a = new Uint8Array(LIMIT * PAIRS);
  const b = new Uint8Array(LIMIT * PAIRS);
  let power = ident();
  for (let t = 0; t < LIMIT / 4; t++) {
    for (let coordinate = 0; coordinate < 4; coordinate++) {
      const row = power[coordinate], offset = (t * 4 + coordinate) * PAIRS;
      for (let x = 0; x < 29; x++)
        for (let y = 0; y < 29; y++) {
          const pair = x * 29 + y;
          a[offset + pair] = mod(row[0] * x + row[1] * y);
          b[offset + pair] = mod(row[2] * x + row[3] * y);
        }
    }
    power = matmul(m, power);
  }
  return { a, b };
}

/** Complete 707,281-state enumeration on a frozen untouched original prefix. */
function exhaustive(m, sign, feedback) {
  const decode = feedback === "plain" ? decipherPlain : decipher;
  const base = decode(m, cipher.slice(0, LIMIT), [0, 0, 0, 0], sign);
  const { a, b } = masks(feedback === "plain" ? feedbackMatrix(m, sign) : m);
  const hist = new Int16Array(29);
  let best = -1, bestIndex = -1, above045 = 0, above050 = 0;
  for (let ab = 0; ab < PAIRS; ab++) {
    for (let cd = 0; cd < PAIRS; cd++) {
      hist.fill(0);
      for (let pos = 0; pos < LIMIT; pos++) {
        const offset = pos * PAIRS;
        let val = base[pos] + sign * (a[offset + ab] + b[offset + cd]);
        if (val < 0) val += 29;
        if (val < 0) val += 29;
        if (val >= 29) val -= 29;
        if (val >= 29) val -= 29;
        hist[val]++;
      }
      let score = 0;
      for (let j = 0; j < 29; j++) score += hist[j] * (hist[j] - 1);
      if (score > best) { best = score; bestIndex = ab * PAIRS + cd; }
      if (score >= 4592) above045++;
      if (score >= 5104) above050++;
    }
  }
  // Independent direct decoder verifies optimized two-half mask arithmetic.
  const ab = Math.floor(bestIndex / PAIRS), cd = bestIndex % PAIRS;
  const seed = [Math.floor(ab / 29), ab % 29, Math.floor(cd / 29), cd % 29];
  assert.equal(pairNumerator(decode(m, cipher.slice(0, LIMIT), seed, sign)), best);
  return { feedback, sign, candidateStates: TOTAL, bestNumerator: best,
    bestIoC: best / (LIMIT * (LIMIT - 1)), bestSeed: seed,
    above045, above050 };
}

// Calibrate against independently preserved native-GP English texts.
const alpha = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
function gpWord(word) {
  const w = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
  const out = [];
  for (let i = 0; i < w.length;) {
    const t = alpha.find((x) => w.startsWith(x.s, i));
    if (!t) return [];
    out.push(t.i);
    i += t.s.length;
  }
  return out;
}
const sources = [
  ["resources/control/shakespeare_first300k.txt", 218800, 683, 5346, 39],
  ["resources/control/gibran_prophet_58585.txt", 63114, 197, 5530, 41],
  ["resources/control/emerson_essays_2944.txt", 324630, 1014, 5146, 42],
];
const controls = [];
let native;
for (const [file, exactSize, expectedWindows, expectedMin, expectedLagMin] of sources) {
  const gp = (read(file).match(/[A-Za-z]+/g) || []).flatMap(gpWord);
  assert.equal(gp.length, exactSize);
  if (file.includes("gibran")) native = gp.slice(0, LIMIT);
  const nums = [];
  for (let k = 0; k + LIMIT <= gp.length; k += LIMIT)
    nums.push(pairNumerator(gp.slice(k, k + LIMIT)));
  assert.equal(nums.length, expectedWindows);
  assert.equal(Math.min(...nums), expectedMin);
  const lags = [];
  for (let k = 0; k + 1744 <= gp.length; k += 1744)
    lags.push(coincident(gp.slice(k, k + 1744), 812));
  assert.equal(Math.min(...lags), expectedLagMin);
  controls.push({ name: file, nativeRunes: gp.length,
    windows320: nums.length, minimumIoCNumerator: Math.min(...nums),
    minimumIoC: Math.min(...nums) / (LIMIT * (LIMIT - 1)),
    minimumLag812Matches1744: Math.min(...lags) });
}

const complete = [];
const expectedNumerators = {
  "cipher,true,-1": 4128, "cipher,true,1": 4144,
  "cipher,false,-1": 4160, "cipher,false,1": 4134,
  "plain,true,-1": 4122, "plain,true,1": 4138,
  "plain,false,-1": 4096, "plain,false,1": 4084,
};
for (const feedback of ["cipher", "plain"]) {
  for (const signed of [true, false]) {
    const m = matrix(signed);
    for (const sign of [-1, 1]) {
      const result = exhaustive(m, sign, feedback);
      assert.equal(result.bestNumerator,
        expectedNumerators[feedback + "," + String(signed) + "," + String(sign)]);
      assert.equal(result.above045, 0);
      assert.equal(result.above050, 0);
      // Genuine source-native text planted under a fixed hidden initial state.
      const seed = [13, 23, 2, 0];
      const encrypt = feedback === "plain" ? encipherPlain : encipher;
      const decrypt = feedback === "plain" ? decipherPlain : decipher;
      const plant = encrypt(m, native, seed, sign);
      assert.deepEqual(decrypt(m, plant, seed, sign), native);
      assert.ok(pairNumerator(native) > result.bestNumerator);
      result.matrix = signed ? "signed-fibonacci" : "literally-printed";
      result.plantedRunesRecovered = native.length;
      complete.push(result);
    }
  }
}
// Entire hidden-initial-state family of signed plaintext feedback:
const signedM = matrix(true);
const e = signedM.map((row, i) => row.map((v, j) => mod(v - Number(i === j))));
let power = ident(), firstOrder = 0;
for (let k = 1; k <= 203; k++) {
  power = matmul(e, power);
  if (sameMatrix(power, ident())) { firstOrder = k; break; }
}
assert.equal(firstOrder, 203);
function plainFeedback(seed) {
  let state = seed.slice(), out = [];
  for (let k = 0; k < cipher.length; k += 4) {
    const block = cipher.slice(k, k + 4);
    const p = block.map((v, i) => mod(v - state[i]));
    out.push(...p);
    const next = times(signedM, state);
    state = next.map((v, i) => mod(v + p[i]));
  }
  return out;
}
const lag = coincident(plainFeedback([0, 0, 0, 0]), 812);
assert.equal(lag, 31);
for (const seed of [[13, 23, 2, 0], [10, 3, 20, 22], [28, 28, 28, 28]])
  assert.equal(coincident(plainFeedback(seed), 812), lag);

console.log(JSON.stringify({
  original: "LP2 physical pp16-22, first 320 of exact 1744 source GP29 runes",
  sourceMatrix: "p15 printed 4x4 Fibonacci-prime magnitudes, both literal and two-sign-restored",
  model: "four-rune additive ciphertext/plaintext feedback, each of eight source/sign/update models exhausts all 29^4 hidden initial states",
  controls,
  originalEightFeedbackFamilies: complete,
  plainFeedback: {
    signedEOrder: firstOrder,
    algebraicAllSeedInvariant: "E=M-I; E^203=I; every seed's mask repeats after 203 blocks = 812 runes",
    originalLag812Matches: lag,
    comparisons: cipher.length - 812,
    belowNativeControlMinima: controls.every((c) => c.minimumLag812Matches1744 > lag),
  },
  evidenceBoundary: "No authenticated creator opcode, plaintext, external key or final address; excluded exact four-symbol feedback families only.",
}, null, 2));

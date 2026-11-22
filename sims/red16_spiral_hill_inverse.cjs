"use strict";
/**
 * Source-constrained 4x4 Hill inverse: the sixteen original red LP2 spans
 * and sixteen cells of page-15 Fibonacci-prime spiral.
 *
 * This is a deliberately finite cryptanalytic hypothesis, not a decipherment.
 * The model and the original/heldout split are declared below.  Node 22 CJS.
 * Run: node sims/red16_spiral_hill_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { clockwiseSpiral } = require("./fibonacci_prime_spiral.cjs");
const { encodeGP } = require("./exponent_feedback_lookup_attack.cjs");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
const length = pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(length, 12956);
const idx = new Map(corpus.runes.map((s, i) => [s, i]));
const red = ink.pages.filter(p => p.page < 56)
  .flatMap(p => (p.red_spans || []).map(s => ({
    page: p.page,
    count: [...s.runes].length,
    primeSum: [...s.runes].reduce((n, r) => n + corpus.prime[idx.get(r)], 0)
  })));
assert.equal(red.length, 16);
assert.equal(red.reduce((n, r) => n + r.count, 0), 213);

const spiral = clockwiseSpiral();
const rowMajor = Array.from({ length: 16 }, (_, i) => [Math.floor(i / 4), i % 4]);
const mod = (n) => (n % 29 + 29) % 29;

/** @param {number[][]} a @returns {number[][] | null} */
function inverse(a) {
  const aug = Array.from({ length: 4 }, (_, i) => [
    ...a[i].map(mod),
    ...Array.from({ length: 4 }, (_, j) => Number(i === j))
  ]);
  for (let j = 0; j < 4; j++) {
    const k = aug.findIndex((r, i) => i >= j && r[j] !== 0);
    if (k < 0) return null;
    [aug[j], aug[k]] = [aug[k], aug[j]];
    let recip = 1;
    while (mod(recip * aug[j][j]) !== 1) recip++;
    assert.ok(recip < 29);
    aug[j] = aug[j].map(x => mod(recip * x));
    for (let i = 0; i < 4; i++) {
      if (i === j) continue;
      const factor = aug[i][j];
      aug[i] = aug[i].map((v, col) => mod(v - factor * aug[j][col]));
    }
  }
  return aug.map(row => row.slice(4));
}

/**
 * @param {number[]} values
 * @param {number[][]} locations
 * @returns {number[][]}
 */
function makeMatrix(values, locations) {
  const m = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let i = 0; i < 16; i++) {
    const [r, c] = locations[i];
    m[r][c] = mod(values[i]);
  }
  return m;
}

/**
 * Apply Hill blocks, leaving unfilled partial blocks and pre-phase seeds
 * as literal cleartext; the same treatment is used in both directions.
 * @param {number[][]} streams
 * @param {number[][]} m
 * @param {"page"|"book"} reset
 * @param {number} phase
 * @returns {number[][]}
 */
function apply(streams, m, reset, phase) {
  const source = reset === "book" ? [streams.flat()] : streams;
  return source.map(part => {
    const output = part.slice();
    for (let i = phase; i + 3 < part.length; i += 4) {
      for (let r = 0; r < 4; r++) {
        let value = 0;
        for (let c = 0; c < 4; c++) value += m[r][c] * part[i + c];
        output[i + r] = mod(value);
      }
    }
    return output;
  });
}

/** @param {number[]} letters @returns {number} */
function ioc(letters) {
  const h = new Uint32Array(29);
  for (const n of letters) h[n]++;
  return h.reduce((a, n) => a + n * (n - 1), 0) /
    (letters.length * (letters.length - 1));
}

const english = encodeGP(read("resources/control/shakespeare_first300k.txt"));
const priorCounts = Array(29).fill(0.5);
for (const x of english.slice(0, Math.floor(english.length * .6))) priorCounts[x]++;
const priorTotal = priorCounts.reduce((a, n) => a + n, 0);
const logPrior = priorCounts.map(n => Math.log(29 * n / priorTotal));
/** @param {number[]} letters @returns {number} */
function lang(letters) {
  return letters.reduce((a, x) => a + logPrior[x], 0) / letters.length;
}

const original = pages.map(p => p.indices);
const originalLengths = original.map(x => x.length);
const trainCut = originalLengths.slice(0, 28).reduce((a, x) => a + x, 0);
const configs = [];
for (const source of ["primeSum", "count"]) {
  for (const [placement, coords] of [
    ["spiral", spiral], ["row-major", rowMajor],
    ["reverse-spiral", spiral.slice().reverse()]
  ]) {
    const m = makeMatrix(red.map(x => x[source]), coords);
    const inv = inverse(m);
    assert.ok(inv, source + "/" + placement + " unexpectedly singular");
    for (const reset of ["page", "book"]) {
      for (let phase = 0; phase < 4; phase++) {
        configs.push({ source, placement, reset, phase, m, inv });
      }
    }
  }
}
assert.equal(configs.length, 48);

/** @param {number[][]} pgs */
function evaluate(pgs) {
  const count = pgs.flat().length;
  assert.equal(count, 12956);
  return configs.map(config => {
    const d = apply(pgs, config.inv, config.reset, config.phase).flat();
    return {
      config,
      trainLogGain: lang(d.slice(0, trainCut)),
      holdLogGain: lang(d.slice(trainCut)),
      trainIoC: ioc(d.slice(0, trainCut)),
      holdIoC: ioc(d.slice(trainCut))
    };
  }).sort((a, b) => b.trainLogGain - a.trainLogGain);
}

/** @param {number[][]} a @param {number[][]} b */
function exact(a, b) {
  const x = a.flat(), y = b.flat();
  assert.equal(x.length, y.length);
  return x.reduce((n, v, i) => n + Number(v === y[i]), 0);
}

/** @param {ReturnType<typeof evaluate>[number]} record */
function brief(record) {
  const { config, ...score } = record;
  const { source, placement, reset, phase } = config;
  return { source, placement, reset, phase,
    ...Object.fromEntries(Object.entries(score)
      .map(([k, value]) => [k, +value.toFixed(8)])) };
}
function main() {
  const scores = evaluate(original);
  const best = scores[0].config;
  const decrypt = apply(original, best.inv, best.reset, best.phase);
  const roundTrip = apply(decrypt, best.m, best.reset, best.phase);
  assert.equal(exact(original, roundTrip), 12956);
  const sourcePlant = english.slice(Math.floor(english.length * .6),
    Math.floor(english.length * .6) + length);
  assert.equal(sourcePlant.length, length);
  let p = 0;
  const plaintext = originalLengths.map(n => sourcePlant.slice(p, p += n));
  const trueConfig = configs.find(x => x.source === "primeSum" &&
    x.placement === "spiral" && x.reset === "page" && x.phase === 2);
  const synthetic = apply(plaintext, trueConfig.m,
    trueConfig.reset, trueConfig.phase);
  const plantedCandidates = evaluate(synthetic);
  const recovered = apply(synthetic, trueConfig.inv,
    trueConfig.reset, trueConfig.phase);
  assert.equal(exact(plaintext, recovered), length);
  assert.equal(exact(synthetic,
    apply(recovered, trueConfig.m, trueConfig.reset, trueConfig.phase)),
    length);
  const report = {
    hypothesis: "16 verified red span sums/counts on page-15 4x4 Fibonacci spiral",
    redCount: red.length, redRuneCount: red.reduce((a, x) => a + x.count, 0),
    redPrimeSums: red.map(x => x.primeSum),
    originalRuneCount: length, trainCount: trainCut,
    ciphertextIoC: +ioc(original.flat()).toFixed(8),
    alternatives: configs.length,
    originalBestTrain: brief(scores[0]),
    originalHeldoutAtTrainWinner: brief(scores[0]),
    originalBestHeldoutPostselected:
      brief(scores.slice().sort((a, b) => b.holdLogGain - a.holdLogGain)[0]),
    originalExactRoundTrip: exact(original, roundTrip),
    plantedTrueConfig: brief(plantedCandidates.find(x => x.config === trueConfig)),
    plantedWinner: brief(plantedCandidates[0]),
    plantedCorrectlyRecovered: exact(plaintext, recovered),
    plantedCiphertextIoC: +ioc(synthetic.flat()).toFixed(8),
    plantedPlaintextIoC: +ioc(plaintext.flat()).toFixed(8),
    conclusion: "No original plaintext/key. Direct source-spiral Hill model has no heldout GP-English signal."
  };
  console.log(JSON.stringify(report, null, 2));
  if (plantedCandidates[0].config !== trueConfig)
    throw new Error("Planted blind training failed to recover true 4x4 matrix and framing");
}
if (require.main === module) main();
module.exports = { inverse, makeMatrix, apply, evaluate };

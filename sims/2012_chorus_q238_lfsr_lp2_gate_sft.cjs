"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const readText = (p) => fs.readFileSync(path.join(root, p), "utf8");
const readJSON = (p) => JSON.parse(readText(p));
const mod = (x) => ((x % 29) + 29) % 29;

const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const grid = readJSON("resources/liber-primus/lp2-grid-256.json");
const midi = readJSON("im-results/2012-midi-chorus-p36-238-inputs.json");
const chorusSource = readText("resources/control/cicada2012_blake_chorus.txt");
const shakespeare = readText("resources/control/shakespeare_first300k.txt");
const chorus = chorusSource
  .split("BEGIN SOURCE TEXT")[1]
  .split("END SOURCE TEXT")[0]
  .replace(/[^A-Za-z]/g, "")
  .toUpperCase();

function multiplyPolynomials(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

// The four low-degree factors of the p50 table polynomial, low coefficient first.
const factors = [
  [25, 10, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const divisor = factors.reduce(multiplyPolynomials, [28]);
const remainder = grid.bytes.slice().reverse().map(mod);
const Q = Array(239).fill(0);

for (let i = 238; i >= 0; i--) {
  const coefficient = mod(remainder[i + 16] * 28);
  Q[i] = coefficient;
  for (let j = 0; j < 17; j++) {
    remainder[i + j] = mod(remainder[i + j] - coefficient * divisor[j]);
  }
}

assert.ok(remainder.every((x) => x === 0), "Q238 division remainder must vanish");
assert.equal(Q.length, 239);
assert.equal(Q[238], 1, "Q238 must be monic");
assert.equal(Q[0], 5, "Q238 constant coefficient is source-derived 5");

const qHash = crypto
  .createHash("sha256")
  .update(Buffer.from(Q.slice().reverse()))
  .digest("hex");
assert.equal(
  qHash,
  "9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3",
  "Q238 high-to-low coefficient hash must match the established factor"
);

// The reciprocal must also be monic. Since Q[0] = 5, 5^-1 = 6 in GF(29).
const inverseConstant = 6;
const Qreciprocal = Q.slice().reverse().map((x) => mod(x * inverseConstant));
assert.equal(Qreciprocal[238], 1);

const SYMBOL = {
  F: 0, U: 1, TH: 2, O: 3, R: 4, C: 5, G: 6, W: 7, H: 8, N: 9,
  I: 10, J: 11, EO: 12, P: 13, X: 14, S: 15, T: 16, B: 17, E: 18,
  M: 19, L: 20, NG: 21, OE: 22, D: 23, A: 24, AE: 25, Y: 26,
  IA: 27, EA: 28
};

const gpSingle = (letter) => {
  const alias = letter === "K" || letter === "Q"
    ? "C"
    : letter === "V"
      ? "U"
      : letter === "Z"
        ? "S"
        : letter;
  return SYMBOL[alias];
};

const midiAlphabet = "abcdefghijklmnoprstuvwy";
const seedForms = {
  "GP single-letter": [...chorus].map(gpSingle),
  "Latin A=0": [...chorus].map((x) => x.charCodeAt(0) - 65),
  "2012 MIDI 23-letter rank": [...chorus].map((x) => midiAlphabet.indexOf(x.toLowerCase())),
  "2012 raw note-plus-delta mod 29": midi.first_cycle_note_plus_delta_sums.map(mod)
};

assert.equal(chorus.length, 238, "2012 chorus length");
for (const [name, seed] of Object.entries(seedForms)) {
  assert.equal(seed.length, 238, name + " seed length");
  assert.ok(seed.every((x) => Number.isInteger(x) && x >= 0 && x < 29), name + " seed range");
}

const p36 = corpus.pages.find((p) => p.page === 36).indices;
assert.equal(p36.length, 238, "LP2 p36 length");
const ciphertext = corpus.pages.slice(0, 56).flatMap((p) => p.indices);
const N = ciphertext.length;
assert.equal(N, 12956, "LP2 p0-p55 ciphertext length");

function lfsr(seed, polynomial, length) {
  assert.equal(seed.length, 238);
  assert.equal(polynomial.length, 239);
  assert.equal(polynomial[238], 1, "feedback polynomial must be monic");
  const state = seed.slice();
  while (state.length < length) {
    const t = state.length;
    let sum = 0;
    for (let j = 0; j < 238; j++) {
      sum += polynomial[j] * state[t - 238 + j];
    }
    state.push(mod(-sum));
  }
  return state;
}

function mutualInformation(a, b) {
  assert.equal(a.length, b.length);
  const n = a.length;
  const joint = new Uint32Array(29 * 29);
  const countA = new Uint32Array(29);
  const countB = new Uint32Array(29);
  for (let i = 0; i < n; i++) {
    const x = a[i];
    const y = b[i];
    joint[29 * x + y]++;
    countA[x]++;
    countB[y]++;
  }
  let bits = 0;
  for (let x = 0; x < 29; x++) {
    for (let y = 0; y < 29; y++) {
      const count = joint[29 * x + y];
      if (count) {
        bits += (count / n) * Math.log2((count * n) / (countA[x] * countB[y]));
      }
    }
  }
  return bits;
}

const variants = [];
for (const [seedName, seed] of Object.entries(seedForms)) {
  for (const [polynomialName, polynomial] of [["Q238", Q], ["normalized reciprocal Q238", Qreciprocal]]) {
    for (const [seedDirection, orderedSeed] of [["forward", seed], ["reversed", seed.slice().reverse()]]) {
      const state = lfsr(orderedSeed, polynomial, N + 238);
      for (const [streamStart, offset] of [["including initial state", 0], ["after initial state", 238]]) {
        const key = state.slice(offset, offset + N);
        variants.push({
          seedName,
          polynomialName,
          seedDirection,
          streamStart,
          mi: mutualInformation(ciphertext, key),
          key
        });
      }
    }
  }
}

assert.equal(variants.length, 32);
variants.sort((a, b) => b.mi - a.mi);
const best = variants[0];

// Multiple-comparison-corrected null: 200 replicates, each taking the maximum
// over 32 independent uniform key streams of the same length.
let rng = 0x33012012;
function randomUnit() {
  rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
  return rng / 4294967296;
}
const replicates = 200;
const keysPerReplicate = 32;
const nullMaxima = [];
for (let r = 0; r < replicates; r++) {
  let maximum = -Infinity;
  for (let k = 0; k < keysPerReplicate; k++) {
    const randomKey = Array.from({ length: N }, () => Math.floor(randomUnit() * 29));
    maximum = Math.max(maximum, mutualInformation(ciphertext, randomKey));
  }
  nullMaxima.push(maximum);
}
nullMaxima.sort((a, b) => a - b);
const nullSummary = {
  replicates,
  keysPerReplicate,
  median: nullMaxima[100],
  p95: nullMaxima[190],
  p99: nullMaxima[198],
  maximum: nullMaxima[199]
};

// Positive control: a held-out native GP29 Shakespeare segment encrypted under
// the same source-selected key and a fixed affine outer permutation.
function encodeEnglish(text) {
  const source = text.toUpperCase()
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < source.length; i++) {
    if (!/[A-Z]/.test(source[i])) continue;
    let token = source[i];
    let advance = 1;
    if (source.slice(i, i + 3) === "ING") {
      token = "NG";
      advance = 3;
    } else if (Object.prototype.hasOwnProperty.call(SYMBOL, source.slice(i, i + 2))) {
      token = source.slice(i, i + 2);
      advance = 2;
    }
    if (Object.prototype.hasOwnProperty.call(SYMBOL, token)) out.push(SYMBOL[token]);
    i += advance - 1;
  }
  return out;
}

const native = encodeEnglish(shakespeare).slice(200000, 200000 + N);
assert.equal(native.length, N, "held-out native control length");
const sigma = (x) => mod(7 * x + 3);
const plantedCiphertext = native.map((plain, i) => sigma(mod(plain + best.key[i])));
const plantedMI = mutualInformation(plantedCiphertext, best.key);
const independentNativeMI = mutualInformation(native, best.key);

const result = {
  hypothesis: "2012 chorus as a GF(29) Q238 LFSR seed for LP2",
  sourceAlignment: {
    chorusLetters: chorus.length,
    p36Runes: p36.length,
    unknownLp2Runes: N
  },
  q238: {
    coefficientOrder: "low-to-high",
    constant: Q[0],
    leading: Q[238],
    reciprocalNormalization: "multiply reversed coefficients by 6 because 5^-1 = 6 mod 29",
    sha256HighToLow: qHash
  },
  testedVariantCount: variants.length,
  bestVariant: {
    seed: best.seedName,
    polynomial: best.polynomialName,
    seedDirection: best.seedDirection,
    streamStart: best.streamStart,
    mutualInformationBits: best.mi
  },
  sourceScores: variants.map((v) => ({
    seed: v.seedName,
    polynomial: v.polynomialName,
    seedDirection: v.seedDirection,
    streamStart: v.streamStart,
    mutualInformationBits: v.mi
  })),
  nullMaximumDistribution: nullSummary,
  positiveControl: {
    construction: "native GP29 Shakespeare; C = (7 * (P + K) + 3) mod 29",
    plantedMutualInformationBits: plantedMI,
    independentNativeMutualInformationBits: independentNativeMI
  },
  decision: "No source-key alignment: the best of 32 source variants is below the median of the 32-key random-null maxima, while the fixed-bijection positive control is strongly detected."
};

assert.ok(best.mi < nullSummary.median, "source best should remain below null median");
assert.ok(plantedMI > 0.5, "positive control should be strongly detected");
assert.ok(independentNativeMI < 0.08, "independent native control should remain near baseline");

console.log(JSON.stringify(result, null, 2));

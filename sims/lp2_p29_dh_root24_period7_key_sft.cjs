"use strict";

// Source-constrained scalar period-7 key test for the p29 G-adic residual
// and the p50/(H*G) quotient. Node.js 22, built-ins only, read-only inputs.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(rootDir, name), "utf8"));
const readText = (name) =>
  fs.readFileSync(path.join(rootDir, name), "utf8").replace(/\r/g, "");

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");
const lp1 = readText("resources/liber-primus/lp1-plaintext-reference.txt");
const M = 29;
const mod = (x) => ((x % M) + M) % M;

function inverse(x) {
  for (let k = 1; k < M; k += 1) {
    if (mod(k * x) === 1) return k;
  }
  throw new Error("No inverse in GF(29)");
}

function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

function addPolynomial(a, b, sign = 1) {
  const n = Math.max(a.length, b.length);
  const aa = Array(n - a.length).fill(0).concat(a);
  const bb = Array(n - b.length).fill(0).concat(b);
  return aa.map((x, i) => mod(x + sign * bb[i]));
}

function dividePolynomial(a, b) {
  assert(a.length >= b.length && b[0] !== 0);
  const rem = a.slice();
  const quotient = [];
  const leadingInverse = inverse(b[0]);
  for (let i = 0; i <= a.length - b.length; i += 1) {
    const factor = mod(rem[i] * leadingInverse);
    quotient.push(factor);
    for (let j = 0; j < b.length; j += 1) {
      rem[i + j] = mod(rem[i + j] - factor * b[j]);
    }
  }
  return { quotient, remainder: rem.slice(quotient.length) };
}

function power(base, exponent) {
  let result = 1;
  let x = mod(base);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = mod(result * x);
    x = mod(x * x);
    e = Math.floor(e / 2);
  }
  return result;
}

function ioc(values) {
  const counts = Array(M).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const p29 = corpus.pages.find((page) => page.page === 29).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
const table = grid.bytes.map(mod);
assert.equal(p29.length, 277);
assert.equal(table.length, 256);
assert.equal(p57.length, 95);

const G = [15, 5, 27];       // p39 red triad, high-first
const H = [24, 26, 3];       // signed-2013 BASE29 3301 -> 3QO
const G2 = multiply(G, G);
const HG = multiply(H, G);
assert.deepEqual(G2, [22, 5, 23, 9, 4]);
assert.deepEqual(HG, [12, 17, 11, 21, 23]);

// Exact existing p29/table congruence:
// P = S + 2G + G^2 R, with left-zero-padding for polynomial degree alignment.
const difference = addPolynomial(
  addPolynomial(p29, table, -1),
  G.map((x) => mod(2 * x)),
  -1
);
const residualDivision = dividePolynomial(difference, G2);
assert.deepEqual(residualDivision.remainder, [0, 0, 0, 0]);
const R = residualDivision.quotient;
assert.equal(R.length, 273);

// Independent table quotient by the source-derived H*G factor.
const tableDivision = dividePolynomial(table, HG);
assert.deepEqual(tableDivision.remainder, [0, 0, 0, 0]);
const Q = tableDivision.quotient;
assert.equal(Q.length, 252);
assert.equal(R.length, 39 * 7);
assert.equal(Q.length, 36 * 7);

// The red-triad root 24 has multiplicative order 7 in GF(29).
// Its reciprocal 23 is the coefficient-reversal orientation.
assert.equal(power(24, 7), 1);
assert.equal(power(23, 7), 1);
for (let k = 1; k < 7; k += 1) {
  assert.notEqual(power(24, k), 1);
  assert.notEqual(power(23, k), 1);
}
assert.equal(mod(24 * 23), 1);

// K=2 is reconstructed by the source-selected p29 word-30 H4/DH packet.
const K = 2;
function keyFor(root) {
  const key = Array.from({ length: 7 }, (_, i) =>
    mod(K * power(root, i))
  );
  assert.equal(key[0], K);
  assert.equal(mod(key[0] * power(root, 7)), key[0]);
  assert(key.every((x) => x !== 0));
  return key;
}

function apply(values, key, operation) {
  return values.map((value, i) => {
    const k = key[i % key.length];
    if (operation === "add") return mod(value + k);
    if (operation === "subtract") return mod(value - k);
    if (operation === "multiply") return mod(value * k);
    if (operation === "divide") return mod(value * inverse(k));
    throw new Error("Unknown operation");
  });
}

const inverseOperation = {
  add: "subtract",
  subtract: "add",
  multiply: "divide",
  divide: "multiply",
};

const tokens = corpus.translit
  .map((symbol, index) => ({ symbol, index }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

const prose = lp1
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith("#") &&
    !line.trim().startsWith("["))
  .join(" ")
  .replace(/[0-9a-f]{64,}/gi, " ")
  .toUpperCase();

const language = [];
for (const word of prose.match(/[A-Z]+/g) || []) {
  for (let i = 0; i < word.length;) {
    const token = tokens.find((candidate) =>
      word.startsWith(candidate.symbol, i)
    );
    if (token) {
      language.push(token.index);
      i += token.symbol.length;
    } else {
      i += 1;
    }
  }
}

const split = Math.floor(language.length * 0.8);
const training = language.slice(0, split);
const heldout = language.slice(split);
const trigramCounts = new Map();
let trigramTotal = 0;
for (let i = 0; i + 2 < training.length; i += 1) {
  const key = training[i] * 841 +
    training[i + 1] * 29 + training[i + 2];
  trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
  trigramTotal += 1;
}

function trigramScore(values) {
  let totalLog = 0;
  for (let i = 0; i + 2 < values.length; i += 1) {
    const key = values[i] * 841 + values[i + 1] * 29 + values[i + 2];
    totalLog += Math.log(
      ((trigramCounts.get(key) || 0) + 0.05) /
      (trigramTotal + 0.05 * 29 ** 3)
    );
  }
  return totalLog / (values.length - 2);
}

function heldoutWindowSummary(length) {
  const scores = [];
  for (let i = 0; i + length <= heldout.length; i += 1) {
    scores.push(trigramScore(heldout.slice(i, i + length)));
  }
  scores.sort((a, b) => a - b);
  assert(scores.length > 0);
  return {
    count: scores.length,
    worst: scores[0],
    median: scores[Math.floor(scores.length / 2)],
    best: scores.at(-1),
  };
}

const operations = ["add", "subtract", "multiply", "divide"];
const objects = [
  { name: "p29 G-adic residual R", values: R },
  { name: "p50 quotient S/(H*G)", values: Q },
];
const results = [];
const controls = [];

for (const object of objects) {
  for (const orientation of ["forward", "reverse"]) {
    const values = orientation === "forward"
      ? object.values.slice()
      : object.values.slice().reverse();
    const root = orientation === "forward" ? 24 : 23;
    const key = keyFor(root);
    const windows = heldoutWindowSummary(values.length);

    for (const operation of operations) {
      const output = apply(values, key, operation);
      const plant = Array.from(
        { length: values.length },
        (_, i) => p57[i % p57.length]
      );
      const encryptedPlant = apply(
        plant, key, inverseOperation[operation]
      );
      const recoveredPlant = apply(encryptedPlant, key, operation);
      assert.deepEqual(recoveredPlant, plant);

      const score = trigramScore(output);
      const coincidence = ioc(output);
      // Every fixed candidate is below every matched native-English window.
      assert(score < windows.worst);

      results.push({
        object: object.name,
        orientation,
        root,
        operation,
        length: values.length,
        key,
        ioc: coincidence,
        trigramNatsPerRune: score,
        heldoutWorst: windows.worst,
        heldoutMedian: windows.median,
        heldoutBest: windows.best,
        opening: output.slice(0, 70)
          .map((value) => corpus.translit[value]).join(""),
      });
      controls.push({
        object: object.name,
        orientation,
        operation,
        recovered: recoveredPlant.length,
        exact: true,
      });
    }
  }
}

assert.equal(results.length, 16);
assert.equal(controls.length, 16);
assert(controls.every((control) => control.exact));

console.log(JSON.stringify({
  source: {
    p29Runes: p29.length,
    p50Bytes: table.length,
    G: G,
    H: H,
    K: K,
    residualRunes: R.length,
    tableQuotientRunes: Q.length,
  },
  keyDerivation: {
    forwardRoot: 24,
    reverseRoot: 23,
    rootOrder: 7,
    forwardKey: keyFor(24),
    reverseKey: keyFor(23),
    phase: 0,
    period: 7,
  },
  languageModel: {
    source: "LP1 plaintext reference",
    trainingRunes: training.length,
    heldoutRunes: heldout.length,
  },
  results,
  positiveControls: controls,
  decision: "The source-derived scalar period-7 additive and multiplicative key streams do not recover native GP29 prose from either exact residual. No phase, seed, sign, or alphabet mapping was fitted.",
}, null, 2));

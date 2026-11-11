"use strict";

// Apply the already-derived GF(29^2) DH candidate to the source-defined
// 1,468-rune p33 cuneiform body, with pairing reset at its marked start.
// This is a bounded consumer test, not an authenticated LP2 cipher.
// Run from repository root:
//   node sims/p33_cuneiform_hfield_dh_shared_key_sft.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const readText = file => fs.readFileSync(path.join(root, file), "utf8");

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const table = readJson("resources/liber-primus/lp2-grid-256.json");
const trans = corpus.translit;
const M = 29;
const mod = (x, n = M) => ((x % n) + n) % n;

function polyMul(a, b) {
  const r = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      r[i + j] = mod(r[i + j] + a[i] * b[j]);
  return r;
}
function polyDiv(a, b) {
  assert.ok(a.length >= b.length && b[0] !== 0);
  const r = a.map(x => mod(x));
  const q = [];
  const inverse = Array.from({ length: 28 }, (_, i) => i + 1)
    .find(v => mod(v * b[0]) === 1);
  assert.notEqual(inverse, undefined);
  for (let i = 0; i <= a.length - b.length; i++) {
    const v = mod(r[i] * inverse);
    q.push(v);
    for (let j = 0; j < b.length; j++)
      r[i + j] = mod(r[i + j] - v * b[j]);
  }
  return { q, r: r.slice(q.length) };
}

// GF(29)[X]/(X^2+18X+11): X^2 = 11X+18.
// A pair [a,b] represents aX+b, preserving printed pair order.
function fieldMul([a, b], [c, d]) {
  return [
    mod(11 * a * c + a * d + b * c),
    mod(18 * a * c + b * d),
  ];
}
function fieldPow(value, exponent) {
  assert.ok(Number.isSafeInteger(exponent) && exponent >= 0);
  let x = value;
  let n = exponent;
  let out = [0, 1];
  while (n > 0) {
    if (n % 2) out = fieldMul(out, x);
    n = Math.floor(n / 2);
    x = fieldMul(x, x);
  }
  return out;
}
function ioc(values) {
  const counts = Array(M).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
function transform(source, factor) {
  assert.equal(source.length % 2, 0);
  const out = [];
  for (let i = 0; i < source.length; i += 2)
    out.push(...fieldMul([source[i], source[i + 1]], factor(i / 2)));
  return out;
}
function inverseFactor(factor) {
  // Every factor used below is in the order-280 subgroup.
  return fieldPow(factor, 279);
}
function gpEnglish(text) {
  const index = new Map(trans.map((token, i) => [token, i]));
  const normalized = text.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let matched = false;
      for (const width of [3, 2, 1]) {
        const token = word.slice(i, i + width);
        if (index.has(token)) {
          out.push(index.get(token));
          i += width;
          matched = true;
          break;
        }
      }
      if (!matched) throw new Error("Unmapped control text at " + word.slice(i));
    }
  }
  return out;
}
function trigramModel(train) {
  const counts = new Uint32Array(M ** 3);
  for (let i = 2; i < train.length; i++)
    counts[train[i - 2] * 841 + train[i - 1] * 29 + train[i]]++;
  const denominator = train.length - 2 + counts.length * 0.2;
  return values => {
    let total = 0;
    for (let i = 2; i < values.length; i++) {
      const n = values[i - 2] * 841 + values[i - 1] * 29 + values[i];
      total += Math.log((counts[n] + 0.2) / denominator);
    }
    return total / (values.length - 2);
  };
}
const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) <= tolerance,
    actual + " differs from " + expected);

// Reconstruct the p29/p50 H-field DH candidate from the original inputs.
const H = [24, 26, 3]; // signed 2013 BASE29 3301 = 3QO, increasing powers
const G = [15, 5, 27]; // p39 red triad, increasing powers
const p29 = corpus.pages.find(page => page.page === 29).indices;
const tableBytes = table.bytes.map(value => mod(value));
assert.equal(p29.length, 277);
assert.equal(tableBytes.length, 256);
const pOverG = polyDiv(p29, G);
const sOverHG = polyDiv(tableBytes, polyMul(H, G));
assert.deepEqual(pOverG.r, [0, 0]);
assert.deepEqual(sOverHG.r, [0, 0, 0, 0]);
const A = polyDiv(pOverG.q, H).r;
const B = polyDiv(sOverHG.q, H).r;
assert.deepEqual(A, [19, 16]);
assert.deepEqual(B, [6, 5]);

const generator = [1, 0]; // X has order 840 in this field.
const discreteLogs = new Map();
for (let exponent = 0; exponent < 840; exponent++)
  discreteLogs.set(fieldPow(generator, exponent).join(","), exponent);
assert.equal(discreteLogs.size, 840);
const a = discreteLogs.get(A.join(","));
const b = discreteLogs.get(B.join(","));
assert.equal(a, 261);
assert.equal(b, 423);
const K = fieldPow(generator, a * b);
const Kinv = fieldPow(K, 279);
assert.deepEqual(K, [7, 1]);
assert.deepEqual(Kinv, [10, 17]);
assert.deepEqual(fieldPow(K, 280), [0, 1]);
assert.deepEqual(fieldMul(K, Kinv), [0, 1]);

// The original-image/source-defined cuneiform body starts at p33 local91
// and ends immediately before p39 local119. Its 1,468 symbols are 734 pairs.
// It begins at global rune 8,051 (odd), so this local pairing differs from
// the whole-book pair grouping tested in the earlier p29 H-field SFT.
const pages = corpus.pages
  .filter(page => page.page >= 33 && page.page <= 39)
  .sort((x, y) => x.page - y.page);
assert.equal(pages.length, 7);
const body = [
  ...pages[0].indices.slice(91),
  ...pages.slice(1, -1).flatMap(page => page.indices),
  ...pages[6].indices.slice(0, 119),
];
const globalStart = corpus.pages
  .filter(page => page.page < 33)
  .reduce((sum, page) => sum + page.indices.length, 0) + 91;
assert.equal(body.length, 1468);
assert.equal(globalStart, 8051);
assert.equal(globalStart % 2, 1);
assert.equal(body.length / 2, 734);

const models = [
  { name: "static-K", factor: () => K },
  { name: "static-K-inverse", factor: () => Kinv },
  { name: "progressive-K^(j+1)", factor: j => fieldPow(K, j + 1) },
  { name: "progressive-K^-(j+1)", factor: j => fieldPow(K, mod(-(j + 1), 280)) },
];

const emerson = gpEnglish(readText("resources/control/emerson_essays_2944.txt"))
  .slice(0, 50000);
const gibran = gpEnglish(readText("resources/control/gibran_prophet_58585.txt"));
const score = trigramModel(emerson);
const holdoutScores = [];
for (let start = 0; start + body.length <= gibran.length; start += 29)
  holdoutScores.push(score(gibran.slice(start, start + body.length)));
holdoutScores.sort((x, y) => x - y);
const q = fraction => holdoutScores[Math.floor(holdoutScores.length * fraction)];

const results = [];
for (const model of models) {
  const output = transform(body, model.factor);
  const recovered = transform(output, j => inverseFactor(model.factor(j)));
  assert.deepEqual(recovered, body);

  const plant = gibran.slice(500, 500 + body.length);
  assert.equal(plant.length, body.length);
  const plantedCipher = transform(plant, j => inverseFactor(model.factor(j)));
  assert.deepEqual(transform(plantedCipher, model.factor), plant);

  results.push({
    model: model.name,
    ioc: ioc(output),
    trigram_nats_per_rune: score(output),
    preview: output.slice(0, 96).map(index => trans[index]).join(""),
    original_round_trip_exact: true,
    synthetic_positive_control_exact: true,
  });
}
close(ioc(body), 0.03431255096222248);
close(score(body), -11.83876324803373);
close(results[0].trigram_nats_per_rune, -11.778813278296791);
close(results[1].trigram_nats_per_rune, -11.894797687158041);
close(results[2].trigram_nats_per_rune, -11.914608515982664);
close(results[3].trigram_nats_per_rune, -11.836567737823055);
assert.equal(holdoutScores.length, 2126);
close(holdoutScores[0], -8.301531231707067);
assert.equal(results.filter(result =>
  result.trigram_nats_per_rune >= holdoutScores[0]).length, 0);

console.log(JSON.stringify({
  classification: "bounded negative; no p33 cuneiform plaintext recovered",
  source_derived_hfield_DH: {
    H, G, A, B, discrete_logs: { a, b }, generator_order: 840,
    shared_candidate_K: K, K_inverse: Kinv, K_order: 280,
    caveat: "The field/DH interpretation is provisional; the 2013 worked DH example itself is modulo 23.",
  },
  target: {
    source_unit: "p33 local91 through p39 local118 inclusive",
    runes: body.length,
    pairs: body.length / 2,
    global_start: globalStart,
    global_pair_parity: globalStart % 2,
    first_rune: trans[body[0]],
    last_rune: trans[body[body.length - 1]],
  },
  raw: { ioc: ioc(body), trigram_nats_per_rune: score(body) },
  models: results,
  native_gibran_holdout: {
    length: body.length,
    stride: 29,
    windows: holdoutScores.length,
    minimum: holdoutScores[0],
    q10: q(0.10),
    median: q(0.50),
    q90: q(0.90),
    maximum: holdoutScores[holdoutScores.length - 1],
  },
  candidates_entering_native_range: 0,
  positive_control: "All four models invert a native-GP plant exactly and re-encrypt the original body exactly.",
  decision: "Retire only the four source-local pairwise static/progressive consumers of K on this 1,468-rune body. Do not infer that the exact p29/p50 H-field congruence is a plaintext key.",
}, null, 2) + "\n");

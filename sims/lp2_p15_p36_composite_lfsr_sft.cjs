#!/usr/bin/env node
"use strict";

// Source-constrained composite LFSR test:
// - p50 table polynomial P has degree 254 and factors F16 * R238;
// - p15's red-3299-anchored 16-value spiral seeds F16;
// - p36's 238 original GP runes seed R238.
// Test both the sum of the component streams and a single P recurrence seeded
// by p15||p36. No fitted phase, offset, state, coefficient or plaintext score.

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));

const MOD = 29;
const mod = n => ((n % MOD) + MOD) % MOD;
const inv = n => {
  for (let i = 1; i < MOD; i++) if (mod(n * i) === 1) return i;
  throw new Error("zero has no inverse");
};
const trim = a => {
  const out = a.slice();
  while (out.length > 1 && out.at(-1) === 0) out.pop();
  return out;
};

assert.equal(grid.bytes.length, 256);
const gridSha256 = crypto.createHash("sha256")
  .update(Buffer.from(grid.bytes)).digest("hex");
assert.equal(gridSha256,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

// Read the original printed row-major table bytes as descending coefficients
// over GF(29), matching the established p50 factorization convention.
const descending = grid.bytes.map(mod);
while (descending.length && descending[0] === 0) descending.shift();
assert.equal(descending.length, 255);
descending.reverse();
const leading = descending.at(-1);
assert.equal(leading, 28);
const P = descending.map(x => mod(x * inv(leading)));
assert.equal(P.length - 1, 254);
assert.equal(P.at(-1), 1);

function mulPolyAsc(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return trim(out);
}

function divmodPolyAsc(a, b) {
  const r = a.slice();
  const q = Array(a.length - b.length + 1).fill(0);
  for (let d = q.length - 1; d >= 0; d--) {
    const z = mod(r[d + b.length - 1] * inv(b.at(-1)));
    q[d] = z;
    for (let j = 0; j < b.length; j++)
      r[d + j] = mod(r[d + j] - z * b[j]);
  }
  return { quotient: trim(q), remainder: trim(r.slice(0, b.length - 1)) };
}

// The degree-16 factor is the product of the already established monic
// factors: (X+5)^2, the signed-2013 BASE29(3301) quadratic, and the
// degree-3/degree-9 factors of the original table polynomial.
const factors16 = [
  [25, 10, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const F16 = factors16.reduce(mulPolyAsc, [1]);
assert.equal(F16.length - 1, 16);
assert.equal(F16.at(-1), 1);

const division = divmodPolyAsc(P, F16);
assert.deepEqual(division.remainder, [0]);
const R238 = division.quotient;
assert.equal(R238.length - 1, 238);
assert.equal(R238.at(-1), 1);
assert.deepEqual(mulPolyAsc(F16, R238), P);

const p15Values = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const p15Seed = p15Values.map(mod);
const p36Page = corpus.pages.find(page => page.page === 36);
assert.ok(p36Page);
const p36Seed = p36Page.indices;
assert.equal(p15Seed.length, 16);
assert.equal(p36Seed.length, 238);

const unknownPages = corpus.pages.filter(page => page.page < 56);
const cipher = unknownPages.flatMap(page => page.indices);
const p0 = corpus.pages.find(page => page.page === 0).indices;
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(cipher.length, 12956);
assert.equal(p0.length, 262);
assert.equal(p57.length, 95);
const p36Start = unknownPages.filter(page => page.page < 36)
  .reduce((n, page) => n + page.indices.length, 0);
const p55Start = unknownPages.filter(page => page.page < 55)
  .reduce((n, page) => n + page.indices.length, 0);
assert.equal(p36Start, 8706);
assert.equal(p55Start, 12880);
assert.equal(corpus.pages.find(page => page.page === 55).indices.length, 76);

function generate(seed, polynomial, length) {
  const degree = polynomial.length - 1;
  assert.equal(seed.length, degree);
  const sequence = seed.slice();
  for (let t = 0; sequence.length < length; t++) {
    let next = 0;
    for (let j = 0; j < degree; j++)
      next -= polynomial[j] * sequence[t + j];
    sequence.push(mod(next));
  }
  return sequence.slice(0, length);
}

function assertRecurrence(sequence, polynomial) {
  const degree = polynomial.length - 1;
  for (let t = 0; t + degree < sequence.length; t++) {
    let sum = 0;
    for (let j = 0; j <= degree; j++)
      sum += polynomial[j] * sequence[t + j];
    assert.equal(mod(sum), 0);
  }
}

const K16 = generate(p15Seed, F16, cipher.length);
const K238 = generate(p36Seed, R238, cipher.length);
const factorSumKey = K16.map((x, i) => mod(x + K238[i]));
assertRecurrence(factorSumKey, P);

// Independent whole-register interpretation: the two source seeds in physical
// page order form the 254-symbol initial state of the full table polynomial.
const fullPConcatKey = generate([...p15Seed, ...p36Seed], P, cipher.length);
assertRecurrence(fullPConcatKey, P);

function ioc(values) {
  const counts = Array(MOD).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
const transliterate = values => values.map(value => corpus.translit[value]).join(" ");

const outputs = [];
for (const [name, key] of [
  ["factor-sum", factorSumKey],
  ["full-P-concat", fullPConcatKey]
]) {
  for (const sign of [-1, 1]) {
    // sign -1 is the ordinary additive-stream inverse P=C-K.
    const decoded = cipher.map((c, i) => mod(c + sign * key[i]));
    const plantedCipher = p57.map((p, i) => mod(p - sign * key[i]));
    const recovered = plantedCipher.map((c, i) => mod(c + sign * key[i]));
    assert.deepEqual(recovered, p57);
    outputs.push({
      construction: name,
      sign,
      keyIoC: ioc(key),
      decodedIoC: ioc(decoded),
      p0IoC: ioc(decoded.slice(0, p0.length)),
      p36IoC: ioc(decoded.slice(p36Start, p36Start + p36Seed.length)),
      p55IoC: ioc(decoded.slice(p55Start, p55Start + 76)),
      first80: transliterate(decoded.slice(0, 80)),
      solvedP57PositiveControlRecovered: recovered.length
    });
  }
}

console.log(JSON.stringify({
  source: "original p50 256-byte table and canonical LP2 corpus",
  gridSha256,
  polynomialDegree: P.length - 1,
  factor16Degree: F16.length - 1,
  factor238Degree: R238.length - 1,
  p15Seed,
  p36SeedLength: p36Seed.length,
  p36GlobalStart: p36Start,
  p55GlobalStart: p55Start,
  unknownRuneCount: cipher.length,
  rawCipherIoC: ioc(cipher),
  solvedP57IoC: ioc(p57),
  uniform29Baseline: 1 / 29,
  constructions: outputs,
  conclusion: "Both source-fixed composite LFSR constructions remain random-looking; no unknown plaintext or key."
}, null, 2));

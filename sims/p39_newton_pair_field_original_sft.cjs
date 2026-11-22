#!/usr/bin/env node
'use strict';

// Full pair-valued p39 Newton-jet gate over the original LP2 unknown stream.
// Node 22; no third-party dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const annotations = readJson('resources/liber-primus/lp2-ink-annotations.json');
const english = fs.readFileSync('resources/control/shakespeare_first300k.txt', 'utf8');

const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;
const add = (x, y) => [mod(x[0] + y[0]), mod(x[1] + y[1])];
const sub = (x, y) => [mod(x[0] - y[0]), mod(x[1] - y[1])];
const mul = (x, y) => [
  mod(x[0] * y[0] + 8 * x[1] * y[1]),
  mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
];
const norm = (x) => mod(x[0] * x[0] + 3 * x[0] * x[1] - 8 * x[1] * x[1]);
const inv29 = (x) => {
  for (let y = 1; y < MOD; y++) if (mod(x * y) === 1) return y;
  throw new Error('non-invertible base-field element');
};
const inv = (x) => {
  const n = inv29(norm(x));
  return [mod((x[0] + 3 * x[1]) * n), mod(-x[1] * n)];
};
const isZero = (x) => x[0] === 0 && x[1] === 0;
const evalPoly = (coeff, x) => {
  let z = [0, 0];
  for (const c of coeff) {
    z = mul(z, x);
    z[0] = mod(z[0] + c);
  }
  return z;
};

const unknownPages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const cipher = unknownPages.flatMap((p) => p.indices);
assert.equal(unknownPages.length, 55, '55 rune-bearing pages among LP2 pages 0–55');
assert.equal(cipher.length, 12956, 'original unknown-rune count');
assert.equal(cipher.length % 2, 0);
assert.equal(grid.bytes.length, 256, 'original 256-byte table');

const redSpans = annotations.pages.flatMap((p) =>
  (p.red_spans || []).map((s) => ({ page: p.page, start: s.start, runes: s.runes }))
);
assert.deepEqual(
  redSpans.filter((s) => s.page === 3 && s.start === 119).map((s) => s.runes),
  [[13, 23, 2]],
  'p3 red field-defining triad'
);
assert.deepEqual(
  redSpans.filter((s) => s.page === 39 && s.start === 119).map((s) => s.runes),
  [[27, 5, 15]],
  'p39 red polynomial-jet triad'
);

const coeff = grid.bytes.map(mod); // high-to-low coefficients of the original table polynomial
const derivative = coeff.slice(0, -1).map((c, i) => mod(c * (coeff.length - 1 - i)));
const u = [0, 1]; // u² = 3u + 8, from the p3 red triad
const clock = [];
let state = [1, 0];
for (let exponent = 0; exponent < 840; exponent++) {
  const value = evalPoly(coeff, state);
  const slope = evalPoly(derivative, state);
  const singular = isZero(slope);
  // Match the established field-clock convention at the two derivative-zero states.
  const displacement = singular ? [0, 0] : mul(value, inv(slope));
  const newton = sub(state, displacement);
  clock.push({ exponent, state, value, slope, displacement, newton, singular });
  state = mul(state, u);
}
const rootPhase = clock.find((x) => x.state[0] === 15 && x.state[1] === 0)?.exponent;
assert.equal(rootPhase, 690, 'u^690 = 15');
const anchored = clock[rootPhase];
assert.deepEqual(anchored.value, [27, 0], 'P(15) = 27');
assert.deepEqual(anchored.slope, [5, 0], "P'(15) = 5");
assert.deepEqual(anchored.displacement, [17, 0], 'P(15)/P\'(15) = 17');
assert.deepEqual(anchored.newton, [27, 0], '15 - 17 = 27');
const singularExponents = clock.filter((x) => x.singular).map((x) => x.exponent);
assert.deepEqual(singularExponents, [180, 360]);

const pairs = Array.from({ length: cipher.length / 2 }, (_, i) => [cipher[2 * i], cipher[2 * i + 1]]);
const streamNames = ['value', 'slope', 'displacement', 'newton'];
const keys = Object.fromEntries(streamNames.map((name) => [
  name,
  Array.from({ length: pairs.length }, (_, i) => clock[(rootPhase + i) % 840][name])
]));
const zeroCounts = Object.fromEntries(streamNames.map((name) => [
  name, keys[name].filter(isZero).length
]));
assert.deepEqual(zeroCounts, { value: 24, slope: 16, displacement: 32, newton: 31 });

function gpEncode(text) {
  const tokenIndex = new Map(corpus.translit.map((s, i) => [s, i]));
  const out = [];
  for (let word of (text.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const two = word.slice(i, i + 2);
      if (tokenIndex.has(two)) {
        out.push(tokenIndex.get(two));
        i += 2;
      } else {
        if (tokenIndex.has(word[i])) out.push(tokenIndex.get(word[i]));
        i++;
      }
    }
  }
  return out;
}
const gp = gpEncode(english);
assert.ok(gp.length > 162956, 'Shakespeare reference corpus long enough');
const tri = new Uint32Array(29 ** 3);
const bi = new Uint32Array(29 ** 2);
for (let i = 2; i < 100000; i++) {
  tri[gp[i - 2] * 841 + gp[i - 1] * 29 + gp[i]]++;
  bi[gp[i - 2] * 29 + gp[i - 1]]++;
}
const lm = Float64Array.from({ length: 29 ** 3 }, (_, i) =>
  Math.log((tri[i] + 0.25) / (bi[Math.floor(i / 29)] + 7.25))
);
const languageScore = (a) => {
  let total = 0;
  for (let i = 2; i < a.length; i++) total += lm[a[i - 2] * 841 + a[i - 1] * 29 + a[i]];
  return total / (a.length - 2);
};
const ioc = (a) => {
  const h = new Uint32Array(29);
  for (const x of a) h[x]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};
const applyAdditive = (input, key, sign) => {
  const out = new Uint8Array(input.length);
  for (let i = 0; i < key.length; i++) {
    const z = sign === 1 ? add([input[2 * i], input[2 * i + 1]], key[i])
                         : sub([input[2 * i], input[2 * i + 1]], key[i]);
    out[2 * i] = z[0];
    out[2 * i + 1] = z[1];
  }
  return Array.from(out);
};

const raw = { ioc: ioc(cipher), trigram: languageScore(cipher) };
const reference = gp.slice(150000, 150000 + cipher.length);
const referenceScore = { ioc: ioc(reference), trigram: languageScore(reference) };
const tests = [];
let positiveControls = 0;
for (const name of streamNames) {
  const key = keys[name];
  for (const sign of [-1, 1]) {
    // sign +1 means C+K; sign -1 means C-K.
    const output = applyAdditive(cipher, key, sign);
    const plantedCipher = applyAdditive(reference, key, -sign);
    const recovered = applyAdditive(plantedCipher, key, sign);
    assert.deepEqual(recovered, reference, 'native-GP planted positive control');
    positiveControls++;
    tests.push({
      stream: name,
      operation: sign === 1 ? 'C+K' : 'C-K',
      zeroCount: zeroCounts[name],
      ioc: ioc(output),
      trigram: languageScore(output)
    });
  }
}
const bestByScore = [...tests].sort((a, b) => b.trigram - a.trigram)[0];
const bestByIoC = [...tests].sort((a, b) => b.ioc - a.ioc)[0];
assert.equal(positiveControls, 8);
assert.ok(tests.every((x) => x.trigram < raw.trigram), 'all eight original-input candidates score below raw');
assert.equal(bestByScore.stream, 'newton');
assert.equal(bestByScore.operation, 'C+K');

const result = {
  classification: 'bounded source-fixed full pair-valued p39 Newton-jet original-input negative',
  source: {
    gridBytes: grid.bytes.length,
    gridBytesSha256: crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
    field: 'GF(29)[u]/(u^2 - 3u - 8)',
    rootPhase,
    singularExponents,
    p39Anchor: { P15: anchored.value, Pprime15: anchored.slope, displacement15: anchored.displacement, newton15: anchored.newton }
  },
  original: { runes: cipher.length, fieldPairs: pairs.length, raw },
  nativeReference: referenceScore,
  zeroCounts,
  tests,
  bestByScore,
  bestByIoC,
  positiveControls: { exactRoundTrips: positiveControls, passed: true },
  interpretation: 'All eight source-fixed additive pair-field outputs are worse than the raw ciphertext under the native-GP trigram model. Multiplicative inversion is undefined because every stream contains zero field elements.'
};
console.log(JSON.stringify(result, null, 2));

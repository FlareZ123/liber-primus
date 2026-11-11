'use strict';

/**
 * All-secret 51x127 GF(29^2) additive row+column mask obstruction.
 *
 * Original source: p3 red irreducible quadratic specifies GF(29^2);
 * p39 red (X-24)^2 divides original 256-byte grid polynomial, leaving 254
 * GP29 coefficients = 127 field elements; p53 red end has 51 runes.
 * The original full ciphertext after its first two runes is 12954 = 51*127*2.
 *
 * Hypothesis:
 *   C[r,j] = P[r,j] + U[r] + V[j]  in GF(29^2)
 * for ANY unknown row/column field keys U,V.
 *
 * Both additive field coordinates are independent mod29. Fourier-harmonic
 * singular values of each 51x127 digit matrix are unchanged under all
 * 841^(51+127-1) distinct row/column field-key masks. The test includes
 * arbitrary secret-key plants and an 81% soft repeat-suppression perturbation.
 *
 * Run: node sims/lp2_51x127_field_additive_spectral_sft.cjs
 * Node 22 CommonJS, no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const originals = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const R = 51, C = 127, GP = 29, N = R * C * 2;
assert.equal(originals.length, N + 2);
assert.ok(ink.pages.find(p => p.page === 53).red_spans
  .some(x => x.start === 128 && x.length === R));
assert.equal(grid.bytes.length, 256);
const poly = grid.bytes.map(x => x % GP);
for (let i = 0; i < 254; i++) {
  const v = poly[i];
  poly[i + 1] = (poly[i + 1] - 10 * v + GP * 10) % GP;
  poly[i + 2] = (poly[i + 2] - 25 * v + GP * 25) % GP;
}
assert.deepEqual(poly.slice(254), [0, 0]);

const cipher = originals.slice(2);
const alphabet = new Map(corpus.translit.map((x, i) => [x, i]));
/** @param {string} source */
function gpEnglish(source) {
  const text = source.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/[^A-Z]/g, '');
  const result = [];
  for (let i = 0; i < text.length;) {
    const pair = text.slice(i, i + 2);
    if (alphabet.has(pair)) {
      result.push(alphabet.get(pair));
      i += 2;
    } else {
      if (alphabet.has(text[i])) result.push(alphabet.get(text[i]));
      i++;
    }
  }
  return result;
}
/** @param {number[]} symbols */
function components(symbols) {
  assert.equal(symbols.length, N);
  return [
    Array.from({length: R * C}, (_, i) => symbols[2 * i]),
    Array.from({length: R * C}, (_, i) => symbols[2 * i + 1])
  ];
}
const harmonic = Array.from({length: 15}, (_, k) =>
  Array.from({length: GP}, (_, t) => [
    Math.cos(2 * Math.PI * k * t / GP),
    Math.sin(2 * Math.PI * k * t / GP)
  ]));
/**
 * Leading singular value of the specified field-coordinate Fourier matrix.
 * @param {number[]} symbols 51 x 127 GP29 component
 * @param {number} k Fourier harmonic
 */
function singular(symbols, k) {
  assert.equal(symbols.length, R * C);
  const re = new Float64Array(R * R), im = new Float64Array(R * R);
  const wave = harmonic[k];
  for (let r = 0; r < R; r++) {
    re[r * R + r] = C;
    for (let s = 0; s < r; s++) {
      let x = 0, y = 0;
      for (let j = 0; j < C; j++) {
        const delta = (symbols[r * C + j] - symbols[s * C + j] + GP) % GP;
        x += wave[delta][0];
        y += wave[delta][1];
      }
      re[r * R + s] = re[s * R + r] = x;
      im[r * R + s] = y;
      im[s * R + r] = -y;
    }
  }
  let vr = new Float64Array(R).fill(1 / Math.sqrt(R));
  let vi = new Float64Array(R), eig = 0;
  for (let t = 0; t < 70; t++) {
    const ar = new Float64Array(R), ai = new Float64Array(R);
    for (let r = 0; r < R; r++)
      for (let s = 0; s < R; s++) {
        const i = r * R + s;
        ar[r] += re[i] * vr[s] - im[i] * vi[s];
        ai[r] += re[i] * vi[s] + im[i] * vr[s];
      }
    let norm2 = 0;
    for (let r = 0; r < R; r++) norm2 += ar[r] ** 2 + ai[r] ** 2;
    eig = Math.sqrt(norm2);
    for (let r = 0; r < R; r++) {
      vr[r] = ar[r] / eig;
      vi[r] = ai[r] / eig;
    }
  }
  return Math.sqrt(eig);
}
/** @param {number} seed */
function randomizer(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}
/**
 * @param {number[]} plain 12954 native GP runes
 * @param {number} seed
 * @param {boolean} repair
 */
function plant(plain, seed, repair) {
  const rng = randomizer(seed);
  const row = Array.from({length: 2 * R}, () => Math.floor(rng() * GP));
  const col = Array.from({length: 2 * C}, () => Math.floor(rng() * GP));
  const output = plain.map((x, i) => {
    const r = Math.floor(i / (2 * C));
    const j = Math.floor((i % (2 * C)) / 2);
    const part = i % 2;
    return (x + row[2 * r + part] + col[2 * j + part]) % GP;
  });
  const plainBack = output.map((x, i) => {
    const r = Math.floor(i / (2 * C));
    const j = Math.floor((i % (2 * C)) / 2);
    const part = i % 2;
    return (x - row[2 * r + part] - col[2 * j + part] + 2 * GP) % GP;
  });
  assert.deepEqual(plainBack, plain);
  let overwritten = 0;
  if (repair)
    for (let i = 1; i < output.length; i++)
      if (output[i] === output[i - 1] && rng() < 0.81) {
        const candidate = Math.floor(rng() * 28);
        output[i] = candidate >= output[i - 1] ? candidate + 1 : candidate;
        overwritten++;
      }
  return {output, overwritten};
}
/** @param {number[]} x */
function adjacentRepeats(x) {
  let n = 0;
  for (let i = 1; i < x.length; i++) n += Number(x[i] === x[i - 1]);
  return n;
}
const sourceOriginal = components(cipher);
const originalSpectrum = sourceOriginal.map(part =>
  Array.from({length: 14}, (_, i) => singular(part, i + 1)));
const register = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
const controls = [];
for (let s = 0; s < register.length; s++) {
  const [name, file] = register[s];
  const native = gpEnglish(read(file));
  for (let t = 0; t < 4; t++) {
    const start = Math.floor(t * (native.length - N - 1) / 3);
    const plain = native.slice(start, start + N);
    assert.equal(plain.length, N);
    const seed = 0x33770000 + s * 32 + t;
    const scores = components(plain).map(part => singular(part, 4));
    const encrypted = plant(plain, seed, false);
    const encryptedScores = components(encrypted.output).map(part =>
      singular(part, 4));
    for (let i = 0; i < 2; i++)
      assert(Math.abs(scores[i] - encryptedScores[i]) < 1e-8);
    const corrected = plant(plain, seed, true);
    const correctedScores = components(corrected.output).map(part =>
      singular(part, 4));
    controls.push({
      source: name, start,
      nativeK4: scores, encryptedK4: encryptedScores,
      repairedK4: correctedScores,
      rewrittenDoublets: corrected.overwritten,
      remainingDoublets: adjacentRepeats(corrected.output)
    });
  }
}
const originalMax = Math.max(...originalSpectrum.flat());
const repairedMin = Math.min(...controls.flatMap(x => x.repairedK4));
assert(repairedMin > originalMax);
console.log(JSON.stringify({
  source: 'p3 GF841, p39 red factor, grid quotient 127 field values, p53 red 51, 12954 original suffix',
  model: 'C[r,j] = P[r,j]+U[r]+V[j] over GF29^2',
  allSecretKeys: '841^(51+127-1) distinct additive field pads',
  sourceOriginalRunes: cipher.length,
  originalSpectrum: originalSpectrum.map(scores => ({
    k4: scores[3], maximum: Math.max(...scores),
    strongestHarmonic: scores.indexOf(Math.max(...scores)) + 1
  })),
  originalMax, repairedMin, controls,
  conclusion: 'Key-independent native-GP-English direct field-additive exclusion under frozen source layout; no plaintext'
}, null, 2));

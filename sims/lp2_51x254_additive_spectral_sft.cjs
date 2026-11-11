'use strict';

/**
 * Source-exact 51x254 LP2 all-secret row+column additive pad spectral gate.
 *
 * The last 51 runes of p53 are original red ink. Dividing the printed
 * 256-byte table polynomial by the p39 red (x-24)^2 factor yields 254
 * coefficients. The original LP2 length after its first two runes is
 * 12954 = 51*254. This is a candidate physical layout, not an authenticated
 * cipher instruction. Its direct native-GP hypothesis is
 *
 *   C[r,c] = P[r,c] + row_key[r] + column_key[c] (mod 29).
 *
 * For each k, exp(2pi*i*k*C/29) differs from the unknown plaintext matrix
 * only by unit-modulus diagonal factors; singular values are unchanged for
 * ANY of the 29^(51+254-1) secret pad choices. We test the unmodified
 * original and source-English controls, then model adjacent-repeat repair.
 *
 * Run: node sims/lp2_51x254_additive_spectral_sft.cjs
 * Node 22, CommonJS, no external packages or network.
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
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const ROWS = 51, COLS = 254, MOD = 29, LENGTH = ROWS * COLS;
assert.equal(original.length, LENGTH + 2);
const actual = original.slice(2);
const p53 = corpus.pages.find(p => p.page === 53);
const marked = ink.pages.find(p => p.page === 53).red_spans;
assert.equal(p53.indices.length, 179);
assert.ok(marked.some(x => x.start === 128 && x.length === 51));
assert.equal(grid.bytes.length, 256);
const quotient = grid.bytes.map(x => x % MOD);
for (let i = 0; i < 254; i++) {
  const v = quotient[i];
  quotient[i + 1] = (quotient[i + 1] - 10 * v + 29 * 10) % MOD;
  quotient[i + 2] = (quotient[i + 2] - 25 * v + 29 * 25) % MOD;
}
assert.deepEqual(quotient.slice(254), [0, 0]);

const tr = new Map(corpus.translit.map((x, i) => [x, i]));
/** @param {string} text */
function encode(text) {
  const s = text.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/[^A-Z]/g, '');
  const output = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (tr.has(pair)) {
      output.push(tr.get(pair));
      i += 2;
    } else {
      if (tr.has(s[i])) output.push(tr.get(s[i]));
      i++;
    }
  }
  return output;
}
const sources = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
].map(([name, p]) => ({name, symbols: encode(read(p))}));
assert(sources.every(x => x.symbols.length > LENGTH));

const cos = Array.from({length: 15}, (_, k) =>
  Float64Array.from({length: 29}, (_, x) => Math.cos(2 * Math.PI * k * x / 29)));
const sin = Array.from({length: 15}, (_, k) =>
  Float64Array.from({length: 29}, (_, x) => Math.sin(2 * Math.PI * k * x / 29)));

/**
 * Largest complex singular value of exp(2pi*i*k*matrix/29).
 * Hermitian 51x51 Gram matrix, 65 deterministic power iterations.
 * @param {number[]} values
 * @param {number} harmonic
 */
function singular(values, harmonic) {
  assert.equal(values.length, LENGTH);
  const br = new Float64Array(ROWS * ROWS);
  const bi = new Float64Array(ROWS * ROWS);
  const cs = cos[harmonic], sn = sin[harmonic];
  for (let r = 0; r < ROWS; r++) {
    br[r * ROWS + r] = COLS;
    for (let s = 0; s < r; s++) {
      let a = 0, b = 0;
      for (let j = 0; j < COLS; j++) {
        const d = (values[r * COLS + j] - values[s * COLS + j] + 29) % 29;
        a += cs[d];
        b += sn[d];
      }
      br[r * ROWS + s] = br[s * ROWS + r] = a;
      bi[r * ROWS + s] = b;
      bi[s * ROWS + r] = -b;
    }
  }
  let vr = new Float64Array(ROWS).fill(1 / Math.sqrt(ROWS));
  let vi = new Float64Array(ROWS);
  let eigenvalue = 0;
  for (let t = 0; t < 65; t++) {
    const wr = new Float64Array(ROWS), wi = new Float64Array(ROWS);
    for (let r = 0; r < ROWS; r++)
      for (let s = 0; s < ROWS; s++) {
        const i = r * ROWS + s;
        wr[r] += br[i] * vr[s] - bi[i] * vi[s];
        wi[r] += br[i] * vi[s] + bi[i] * vr[s];
      }
    let norm2 = 0;
    for (let r = 0; r < ROWS; r++) norm2 += wr[r] ** 2 + wi[r] ** 2;
    eigenvalue = Math.sqrt(norm2);
    for (let r = 0; r < ROWS; r++) {
      vr[r] = wr[r] / eigenvalue;
      vi[r] = wi[r] / eigenvalue;
    }
  }
  return Math.sqrt(eigenvalue);
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
/** @param {number[]} plain @param {number} seed @param {boolean} repair */
function plant(plain, seed, repair) {
  const rng = randomizer(seed);
  const row = Array.from({length: ROWS}, () => Math.floor(rng() * MOD));
  const col = Array.from({length: COLS}, () => Math.floor(rng() * MOD));
  const encrypted = plain.map((x, i) =>
    (x + row[Math.floor(i / COLS)] + col[i % COLS]) % MOD);
  let overwritten = 0;
  if (repair)
    for (let i = 1; i < encrypted.length; i++)
      if (encrypted[i] === encrypted[i - 1] && rng() < 0.81) {
        const rank = Math.floor(rng() * 28);
        encrypted[i] = rank >= encrypted[i - 1] ? rank + 1 : rank;
        overwritten++;
      }
  return {encrypted, overwritten};
}
/** @param {number[]} input */
function repeats(input) {
  let n = 0;
  for (let i = 1; i < input.length; i++) n += Number(input[i] === input[i - 1]);
  return n;
}
const originalSpectrum = Array.from({length: 14},
  (_, i) => singular(actual, i + 1));
const observations = [];
for (let s = 0; s < sources.length; s++) {
  const {name, symbols} = sources[s];
  for (let t = 0; t < 4; t++) {
    const start = Math.floor(t * (symbols.length - LENGTH - 1) / 3);
    const plain = symbols.slice(start, start + LENGTH);
    const seed = 0x33550000 + s * 32 + t;
    const native = singular(plain, 4);
    const exact = plant(plain, seed, false);
    const encrypted = singular(exact.encrypted, 4);
    assert(Math.abs(native - encrypted) < 1e-8);
    // Soft repair is a model-matched perturbation, not a reversible cipher.
    const repaired = plant(plain, seed, true);
    observations.push({
      name, sourceStart: start,
      nativeK4: native,
      encryptedK4: encrypted,
      repairedK4: singular(repaired.encrypted, 4),
      plainRuneCount: plain.length,
      unrepairedDoublets: repeats(exact.encrypted),
      repairedDoublets: repeats(repaired.encrypted),
      rewrittenRunes: repaired.overwritten
    });
  }
}
const bestOriginal = Math.max(...originalSpectrum);
assert(Math.min(...observations.map(x => x.repairedK4)) > bestOriginal);
console.log(JSON.stringify({
  source: '12954 = 51 red p53 runes x 254 quotient coefficients; first 2 original runes omitted',
  originalRunes: actual.length, rowCount: ROWS, colCount: COLS,
  model: 'C[r,c] = P[r,c] + U[r] + V[c] mod29',
  unrestrictedSecretKeyFamily: 'all 29^(51+254-1) possible row and column pads',
  originalSpectrum, originalBest: bestOriginal,
  originalK4: originalSpectrum[3],
  nativeControls: observations,
  conclusion: 'All-secret direct native-GP-English 51x254 additive row/column architecture rejected under declared register and controls; no plaintext'
}, null, 2));

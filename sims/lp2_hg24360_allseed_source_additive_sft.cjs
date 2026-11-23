'use strict';

/**
 * Original-source finite all-IV test for the signed-H × p39-red-G order-4
 * GF(29) additive keystream. Run with Node.js 22 from any working directory:
 * node sims/lp2_hg24360_allseed_source_additive_sft.cjs
 *
 * A native solved-Cicada positive is included. The candidate LFSR opcode is
 * hypothetical, not authenticated as an instruction from Cicada.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = name => JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
const src = read('lp2-corpus.json');
const grid = read('lp2-grid-256.json');
const P = 29;
const HG = [23, 21, 11, 17, 12];
const LENGTH = 256;
const mod = x => (x % P + P) % P;

/** @param {number} a @returns {number} */
function inverse(a) {
  for (let k = 1; k < P; k++) if (mod(a * k) === 1) return k;
  throw new Error('noninvertible coefficient');
}

/**
 * @param {number[]} coefficients Ascending polynomial coefficients.
 * @param {number[]} divisor Ascending nonzero polynomial coefficients.
 * @returns {number[]} Remainder in GF(29).
 */
function remainder(coefficients, divisor) {
  const out = coefficients.map(mod);
  const inv = inverse(divisor[divisor.length - 1]);
  for (let i = out.length - divisor.length; i >= 0; i--) {
    const t = mod(out[i + divisor.length - 1] * inv);
    for (let j = 0; j < divisor.length; j++) {
      out[i + j] = mod(out[i + j] - t * divisor[j]);
    }
  }
  return out.slice(0, divisor.length - 1);
}

/**
 * @param {number[]} seed Initial four GP29 symbols.
 * @param {number} n Desired number of positions.
 * @returns {number[]} Source-factor recurrence.
 */
function stream(seed, n) {
  const k = seed.slice();
  while (k.length < n) {
    const i = k.length;
    k.push(mod(-17 * (23 * k[i - 4] + 21 * k[i - 3] +
      11 * k[i - 2] + 17 * k[i - 1])));
  }
  return k.slice(0, n);
}

/**
 * @param {ArrayLike<number>} a
 * @returns {number} Numerator of unbiased GP29 IoC.
 */
function collisionScore(a) {
  const f = new Uint16Array(P);
  for (const x of a) f[x]++;
  let count = 0;
  for (const v of f) count += v * (v - 1);
  return count;
}

const red = src.pages.find(p => p.page === 39).indices.slice(119, 122);
assert.deepEqual(red, [27, 5, 15]);
assert.deepEqual(src.pages.filter(p => p.page <= 55)
  .reduce((n, p) => n + p.indices.length, 0), 12956);
assert.deepEqual(grid.bytes.length, 256);
assert.deepEqual(grid.bytes.slice(0, 4).map(mod), [0, 28, 22, 12]);
const H = [3, 26, 24];
assert.deepEqual(HG, [23, 21, 11, 17, 12]);
const c = grid.bytes.slice().reverse();
for (const [g, expected] of [
  [H, [0, 0]], [red, [0, 0]], [HG, [0, 0, 0, 0]]]) {
  assert.deepEqual(remainder(c, g), expected);
}
const nativeSeed = grid.bytes.slice(0, 4).map(mod);
const period = 24360;
const full = stream(nativeSeed, 2 * period);
assert.deepEqual(full.slice(0, period), full.slice(period));
for (const primeFactor of [2, 3, 5, 7, 29]) {
  const shorter = period / primeFactor;
  assert.notDeepEqual(full.slice(0, period),
    full.slice(shorter, shorter + period));
}

/** @type {Uint8Array[]} Four unit-seeded keystream basis vectors. */
const basis = Array.from({ length: 4 }, (_, j) => {
  const e = [0, 0, 0, 0];
  e[j] = 1;
  return Uint8Array.from(stream(e, LENGTH));
});
const multiply = Array.from({ length: 29 }, (_, a) =>
  Uint8Array.from({ length: 29 }, (_, b) => (a * b) % P));

/**
 * Exhaustively evaluate every 29^4 seed, with the unmodified source order,
 * one continuous clock per 256-rune window and no fitted symbol relabeling.
 * The plus sign needs no separate pass: negating all 4 seeds includes it.
 *
 * @param {number[]} cipher First 256 contiguous source GP29 symbols.
 * @returns {{score:number,seed:number[],above38:number,above40:number,above42:number}}
 */
function exhaust(cipher) {
  assert.equal(cipher.length, LENGTH);
  const freq = new Uint16Array(P);
  const partial = new Uint8Array(LENGTH);
  let best = -1;
  let seed = [];
  let above38 = 0;
  let above40 = 0;
  let above42 = 0;
  const denom = LENGTH * (LENGTH - 1);
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      for (let cc = 0; cc < 29; cc++) {
        for (let i = 0; i < LENGTH; i++) {
          partial[i] = mod(cipher[i] - basis[0][i] * a -
            basis[1][i] * b - basis[2][i] * cc);
        }
        for (let d = 0; d < 29; d++) {
          freq.fill(0);
          for (let i = 0; i < LENGTH; i++) {
            const z = partial[i] - multiply[basis[3][i]][d];
            freq[z < 0 ? z + 29 : z]++;
          }
          let score = 0;
          for (const v of freq) score += v * (v - 1);
          if (score > best) {
            best = score;
            seed = [a, b, cc, d];
          }
          if (score / denom >= 0.038) above38++;
          if (score / denom >= 0.040) above40++;
          if (score / denom >= 0.042) above42++;
        }
      }
    }
  }
  return { score: best, seed, above38, above40, above42 };
}

/**
 * @param {number} first
 * @param {number} last
 * @returns {number[]} Original pages, no invented separators or glyphs.
 */
function span(first, last) {
  return src.pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices);
}

// Positive original-author solved-LP1 textual control (page 6 koan),
// preserved as a separate editor-normalized source: no unknown text planted.
const lp1 = fs.readFileSync(path.resolve(__dirname, '..', 'resources',
  'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8');
const koan = 'A MAN DECIDED TO GO' +
  lp1.split('### 6')[1].split('### 7')[0]
    .split('A MAN DECIDED TO GO')[1];
const canonical = koan.replace(/[^A-Z]/g, '')
  .replace(/[KVZQ]/g, x => ({ K: 'C', V: 'U', Z: 'S', Q: 'C' })[x]);
const tokens = src.translit.slice().sort((a, b) => b.length - a.length);
const ranking = new Map(src.translit.map((token, rank) => [token, rank]));
const native = [];
let pos = 0;
while (native.length < LENGTH) {
  const token = tokens.find(t => canonical.startsWith(t, pos));
  assert.ok(token, 'native positive GP29 encoding must cover source text');
  native.push(ranking.get(token));
  pos += token.length;
}
assert.equal(collisionScore(native), 4254);
const plantSeed = [11, 18, 15, 12];
const plantPad = stream(plantSeed, LENGTH);
const encrypted = native.map((x, i) => mod(x + plantPad[i]));
assert.deepEqual(encrypted.map((x, i) => mod(x - plantPad[i])), native);
assert.equal(collisionScore(encrypted), 2264);
console.log('POSITIVE', JSON.stringify({
  source: 'LP1 original solved koan, source-native GP29 transliteration',
  length: native.length, nativeIoC: collisionScore(native) / (LENGTH * 255),
  ciphertextIoC: collisionScore(encrypted) / (LENGTH * 255),
  exactRecovery: true
}));

for (const w of [
  { label: 'p16-21:first256', start: 16, end: 21,
    expectedScore: 2694, expectedSeed: [11, 18, 15, 12] },
  { label: 'p40-55:first256', start: 40, end: 55,
    expectedScore: 2736, expectedSeed: [26, 0, 28, 28] },
  { label: 'p51-55:first256', start: 51, end: 55,
    expectedScore: 2736, expectedSeed: [24, 1, 6, 24] }
]) {
  const observed = exhaust(span(w.start, w.end).slice(0, LENGTH));
  assert.equal(observed.score, w.expectedScore, w.label);
  assert.deepEqual(observed.seed, w.expectedSeed, w.label);
  assert.equal(observed.above42, 0, w.label);
  console.log('ALL_IV', JSON.stringify({
    ...observed, label: w.label, originalRunes: LENGTH, testedKeys: 29 ** 4,
    maxIoC: observed.score / (LENGTH * 255)
  }));
}
console.log('PASS: finite HG24360 all-IV original-source exclusion; zero unknown plaintext');

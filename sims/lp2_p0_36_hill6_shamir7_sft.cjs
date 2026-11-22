'use strict';

/**
 * Source-frozen inverses for the 36-byte P50 zero bracket and the
 * 36-rune P0 corridor identified by the 2014 HTML 133/331 addresses.
 * Tests a 6x6 Hill matrix and a seven-share GF29 quotient receiver.
 * These operations are hypotheses; neither is an authenticated LP2 cipher.
 * Node.js 22 CommonJS SFT: node sims/lp2_p0_36_hill6_shamir7_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
/** @param {string} relative */
const json = relative => JSON.parse(read(relative));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const html = read('resources/historical/stage11-2014-index.html');
const bytes = grid.bytes;
const Q = 29;
const mod = n => ((n % Q) + Q) % Q;
const inverseNumber = n => {
  for (let i = 1; i < Q; i++) if (mod(n * i) === 1) return i;
  throw new Error('noninvertible GF29 residue ' + n);
};
assert.equal(bytes.length, 256);
assert.deepEqual(bytes.flatMap((value, i) => value === 0 ? [i] : []), [192, 229]);
assert.equal(Number(html.match(/<title>(\d+)<\/title>/)[1]), 133);
assert.equal(Number(html.match(/<div id="(\d+)">/)[1]), 331);
const start = bytes[133], end = bytes[331 % 256];
assert.deepEqual([start, end], [141, 177]);
const bracket = bytes.slice(193, 229);
assert.equal(bracket.length, 36);

const firstPage = read('resources/liber-primus/lp2-transcription.txt').split('%')[0];
const runeIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const words = [];
const reconstructed = [];
let current = [];
for (const glyph of Array.from(firstPage + '.')) {
  const index = runeIndex.get(glyph);
  if (index !== undefined) {
    current.push(index);
    reconstructed.push(index);
  } else if ('-.,'.includes(glyph) && current.length) {
    words.push({start: reconstructed.length - current.length, indices: current});
    current = [];
  }
}
assert.deepEqual(reconstructed, corpus.pages[0].indices);
assert.equal(words.length, 59);
assert.equal(words[32].start, start);
assert.equal(words[40].start, end);
const lengths = words.slice(32, 40).map(w => w.indices.length);
assert.deepEqual(lengths, [4, 6, 3, 4, 8, 7, 3, 1]);
const cipher = corpus.pages[0].indices.slice(start, end);
const plantedPlain = corpus.pages[57].indices.slice(0, 36);
assert.equal(cipher.length, 36);
assert.equal(plantedPlain.length, 36);

/** @param {number[]} values */
function render(values) {
  let at = 0;
  return lengths.map(size => {
    const token = values.slice(at, at + size)
      .map(value => corpus.translit[value]).join('');
    at += size;
    return token;
  }).join(' ');
}
/** @param {number[]} values */
function ioc(values) {
  const frequencies = Array(Q).fill(0);
  values.forEach(value => { frequencies[value]++; });
  return frequencies.reduce((s, v) => s + v * (v - 1), 0) /
    (values.length * (values.length - 1));
}
const matrix = Array.from({length: 6}, (_, row) =>
  bracket.slice(row * 6, row * 6 + 6).map(mod));
/** @param {number[][]} M */
const transpose = M => M[0].map((_, col) => M.map(row => row[col]));
/** @param {number[][]} M @param {number[]} v */
const matVec = (M, v) => M.map(row =>
  mod(row.reduce((sum, x, i) => sum + x * v[i], 0)));
/** @param {number[][]} M */
function invertMatrix(M) {
  const size = M.length;
  const a = M.map((row, i) => [
    ...row, ...Array.from({length: size}, (_, j) => +(i === j))]);
  for (let col = 0; col < size; col++) {
    const pivot = a.findIndex((row, index) => index >= col && row[col] !== 0);
    assert(pivot >= 0, 'bracket key must have full rank');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const scale = inverseNumber(a[col][col]);
    for (let j = 0; j < 2 * size; j++) a[col][j] = mod(a[col][j] * scale);
    for (let i = 0; i < size; i++) if (i !== col) {
      const factor = a[i][col];
      for (let j = 0; j < 2 * size; j++)
        a[i][j] = mod(a[i][j] - factor * a[col][j]);
    }
  }
  return a.map(row => row.slice(size));
}
/** @param {number[][]} M @param {number[]} stream */
function hill(M, stream) {
  const output = [];
  for (let i = 0; i < stream.length; i += 6)
    output.push(...matVec(M, stream.slice(i, i + 6)));
  return output;
}
const hillReadouts = [];
for (const [orientation, M] of [
  ['source-rows', matrix], ['source-columns', transpose(matrix)]
]) {
  const im = invertMatrix(M);
  for (const [direction, op] of [['decrypt', im], ['encrypt', M]]) {
    const candidate = hill(op, cipher);
    const inverseOp = direction === 'decrypt' ? M : im;
    assert.deepEqual(hill(inverseOp, candidate), cipher);
    assert.deepEqual(hill(im, hill(M, plantedPlain)), plantedPlain);
    hillReadouts.push({
      orientation, direction, ioc: ioc(candidate),
      plaintext: render(candidate)
    });
  }
}

// The authenticated 2013 BASE29(3301)=3QO factor H and original p39 red
// polynomial G are expressed high-coefficient-first. Their product divides
// the source table in GF29; its formal quotient has 252 slots = 7x36.
const H = [24, 26, 3], G = [15, 5, 27];
const factor = Array(5).fill(0);
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
  factor[i + j] = mod(factor[i + j] + H[i] * G[j]);
assert.deepEqual(factor, [12, 17, 11, 21, 23]);
const remainder = bytes.map(mod);
const quotient = [];
for (let i = 0; i < 252; i++) {
  const value = mod(remainder[i] * inverseNumber(factor[0]));
  quotient.push(value);
  for (let j = 0; j < factor.length; j++)
    remainder[i + j] = mod(remainder[i + j] - value * factor[j]);
}
assert.deepEqual(remainder.slice(252), [0, 0, 0, 0]);
assert.equal(quotient[0], 0);

// Lagrange reconstruction of a 36-rune secret at x=0 from seven source
// quotient rows interpreted as shares at x=1,...,7. The share grammar
// remains an unverified hypothesis; no hidden share indices are optimized.
const shares = Array.from({length: 7}, (_, i) =>
  quotient.slice(36 * i, 36 * (i + 1)));
const weights = Array.from({length: 7}, (_, i) => {
  let numerator = 1, denominator = 1;
  for (let j = 0; j < 7; j++) if (j !== i) {
    numerator = mod(numerator * (-(j + 1)));
    denominator = mod(denominator * ((i + 1) - (j + 1)));
  }
  return mod(numerator * inverseNumber(denominator));
});
assert.deepEqual(weights, [7, 8, 6, 23, 21, 22, 1]);
const secret = Array.from({length: 36}, (_, col) =>
  mod(shares.reduce((sum, share, i) =>
    sum + weights[i] * share[col], 0)));
const lagrangeReadouts = [];
for (const sign of [-1, 1]) {
  const candidate = cipher.map((value, i) => mod(value + sign * secret[i]));
  assert.deepEqual(candidate.map((value, i) =>
    mod(value - sign * secret[i])), cipher);
  const plant = plantedPlain.map((value, i) =>
    mod(value - sign * secret[i]));
  assert.deepEqual(plant.map((value, i) =>
    mod(value + sign * secret[i])), plantedPlain);
  lagrangeReadouts.push({sign, ioc: ioc(candidate),
    plaintext: render(candidate)});
}
const output = {
  source: '2014 HTML 133/331; original grid indices 193..228; original p0 141..176',
  originalWordRunes: lengths,
  originalCipher: render(cipher),
  hill6: hillReadouts,
  factor, quotientSlots: quotient.length,
  sevenShareInterpolation: lagrangeReadouts,
  plantedExactRecovery: 36,
  verdict: 'Neither fixed receiver recovers coherent original GP-English; no plaintext or key is established.'
};
console.log(JSON.stringify(output, null, 2));

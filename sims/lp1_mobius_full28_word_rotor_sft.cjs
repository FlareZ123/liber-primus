#!/usr/bin/env node
'use strict';

// Compare the source-motivated full p05 28-cycle with the existing p16 six-step
// rotor on original LP2. Node.js 22, no packages. The 2016 phrase
// "Its words are the map" motivates resetting at canonical printed word boundaries.

const fs = require('node:fs');
const assert = require('node:assert/strict');
const { parseLP2Words } = require('./lp2_word_pages.cjs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const parsed = parseLP2Words(fs.readFileSync('resources/lp2-transcription.txt', 'utf8'));
const controlText = fs.readFileSync('resources/control/emerson_essays_2944.txt', 'utf8');

const mod = x => ((x % 29) + 29) % 29;
function invMod(a) {
  a = mod(a);
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error('non-invertible residue ' + a);
}
function matMul(A, B) {
  return [
    [mod(A[0][0] * B[0][0] + A[0][1] * B[1][0]), mod(A[0][0] * B[0][1] + A[0][1] * B[1][1])],
    [mod(A[1][0] * B[0][0] + A[1][1] * B[1][0]), mod(A[1][0] * B[0][1] + A[1][1] * B[1][1])]
  ];
}
function matPow(A, n) {
  let out = [[1, 0], [0, 1]], base = A;
  while (n > 0) {
    if (n & 1) out = matMul(out, base);
    base = matMul(base, base);
    n = Math.floor(n / 2);
  }
  return out;
}
function matInv(A) {
  const d = mod(A[0][0] * A[1][1] - A[0][1] * A[1][0]);
  const di = invMod(d);
  return [
    [mod(A[1][1] * di), mod(-A[0][1] * di)],
    [mod(-A[1][0] * di), mod(A[0][0] * di)]
  ];
}
function applyPGL2(A, x) {
  const [a, b] = A[0], [c, d] = A[1];
  if (x === null) return c === 0 ? null : mod(a * invMod(c));
  const den = mod(c * x + d);
  return den === 0 ? null : mod((a * x + b) * invMod(den));
}
function projectiveOrder(A) {
  for (let n = 1; n <= 60; n++) {
    const P = matPow(A, n);
    if (P[0][1] === 0 && P[1][0] === 0 && P[0][0] === P[1][1] && P[0][0] !== 0) return n;
  }
  throw new Error('projective order > 60');
}

const M05 = [[11, 6], [6, 11]];
const M16 = [[28, 9], [9, 28]];
const M16Inv = matInv(M16);
assert.equal(projectiveOrder(M05), 28);
assert.equal(projectiveOrder(M16), 14);
const M05Power6 = matPow(M05, 6);
const scalar = mod(M16[0][0] * invMod(M05Power6[0][0]));
assert.deepEqual(M16, M05Power6.map(row => row.map(x => mod(scalar * x))));

// Reconstruct the 28-cycle from the p05 MOBIUS cell's GP-prime sum 226 -> 23.
// The omitted fixed point is 1; the other fixed point 28 is EA.
const seed = 226 % 29;
assert.equal(seed, 23);
const cyclePoints = [], cycleSymbols = [];
let point = seed;
for (let i = 0; i < 28; i++) {
  assert.notEqual(point, 1);
  assert.notEqual(point, 28);
  cyclePoints.push(point);
  cycleSymbols.push(point === null ? 1 : point);
  point = applyPGL2(M05, point);
}
assert.equal(point, seed);
assert.equal(new Set(cycleSymbols).size, 28);
assert.deepEqual(cycleSymbols.slice().sort((a, b) => a - b), [...Array(28).keys()]);

function symbolToPoint(symbol) {
  if (symbol === 28) return 28;
  const at = cycleSymbols.indexOf(symbol);
  assert.ok(at >= 0);
  return cyclePoints[at];
}
function pointToSymbol(projectivePoint) {
  if (projectivePoint === 28) return 28;
  const at = cyclePoints.findIndex(x => x === projectivePoint);
  assert.ok(at >= 0);
  return cycleSymbols[at];
}

// Canonical word parser carries 32 words across physical page boundaries.
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const wordCipher = parsed.words.map(w => [...w.runes].map(r => runeToIndex.get(r)));
const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.deepEqual(wordCipher.flat(), ciphertext);
const wordLengths = wordCipher.map(w => w.length);
const rotorSpecs = [
  { name: 'M05^j', matrix: M05, inverse: matInv(M05), period: 28 },
  { name: 'M05^-j', matrix: matInv(M05), inverse: M05, period: 28 },
  { name: 'M16^j', matrix: M16, inverse: M16Inv, period: 14 },
  { name: 'M16^-j', matrix: M16Inv, inverse: M16, period: 14 }
];

function applyWordRotor(words, matrix, period) {
  const powers = Array.from({ length: period }, (_, i) => matPow(matrix, i));
  return words.map(word => word.map((symbol, position) =>
    pointToSymbol(applyPGL2(powers[position % period], symbolToPoint(symbol)))));
}

// The scoring model matches the existing p05/p16 report: Emerson-trained GP
// trigrams with additive smoothing, plus IoC and top-12 rune mass.
const translit = corpus.translit;
const gp = new Map(translit.map((s, i) => [s, i]));
gp.set('ING', 21);
function englishToGPWords(text) {
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const words = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    const out = [];
    for (let i = 0; i < word.length;) {
      let found = false;
      for (const n of [3, 2, 1]) {
        const token = word.slice(i, i + n);
        if (gp.has(token)) {
          out.push(gp.get(token));
          i += n;
          found = true;
          break;
        }
      }
      if (!found) throw new Error('unmapped control text at ' + word.slice(i));
    }
    words.push(out);
  }
  return words;
}
const controlWords = englishToGPWords(controlText);
const control = controlWords.flat();
const tri = new Map();
for (let i = 0; i + 2 < control.length; i++) {
  const key = control[i] * 841 + control[i + 1] * 29 + control[i + 2];
  tri.set(key, (tri.get(key) || 0) + 1);
}
const alpha = 0.05;
const denominator = control.length - 2 + alpha * 29 ** 3;
function metrics(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  const ioc = f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
  const top12 = f.slice().sort((x, y) => y - x).slice(0, 12).reduce((s, n) => s + n, 0) / a.length;
  let score = 0;
  for (let i = 0; i + 2 < a.length; i++) {
    const key = a[i] * 841 + a[i + 1] * 29 + a[i + 2];
    score += Math.log(((tri.get(key) || 0) + alpha) / denominator);
  }
  return { ioc, top12, trigram: score / (a.length - 2) };
}
function withinWordTrigram(words) {
  let score = 0, count = 0;
  for (const word of words) for (let i = 0; i + 2 < word.length; i++) {
    const key = word[i] * 841 + word[i + 1] * 29 + word[i + 2];
    score += Math.log(((tri.get(key) || 0) + alpha) / denominator);
    count++;
  }
  return score / count;
}

const models = rotorSpecs.map(spec => {
  const decoded = applyWordRotor(wordCipher, spec.matrix, spec.period);
  const recovered = applyWordRotor(decoded, spec.inverse, spec.period);
  assert.deepEqual(recovered.flat(), ciphertext);
  return {
    direction: spec.name,
    period: spec.period,
    metrics: metrics(decoded.flat()),
    withinWordTrigram: withinWordTrigram(decoded),
    preview: decoded.slice(0, 18).map(w => w.map(i => translit[i]).join('')).join(' '),
    firstRuneUnchanged: decoded.every((w, i) => w[0] === wordCipher[i][0])
  };
});

// Exact positive controls: a contiguous native Emerson GP stream is split
// into the original 2,896 word lengths, encoded, then recovered in both
// rotor directions. This tests implementation, not key authenticity.
let offset = 0;
const plantWords = wordLengths.map(length => {
  const word = control.slice(offset, offset + length);
  offset += length;
  return word;
});
assert.equal(offset, 12956);
const plantChecks = rotorSpecs.map(spec => {
  const encrypted = applyWordRotor(plantWords, spec.matrix, spec.period);
  const recovered = applyWordRotor(encrypted, spec.inverse, spec.period);
  assert.deepEqual(recovered, plantWords);
  return { direction: spec.name, recoveredRunes: recovered.flat().length, exact: true };
});

console.log(JSON.stringify({
  source: {
    M05, M16, seed,
    projectiveOrders: { M05: projectiveOrder(M05), M16: projectiveOrder(M16) },
    cycleSymbols,
    clock: 'zero-based rune offset within each canonical printed word',
    wordCount: parsed.words.length,
    crossPageWords: parsed.crossPageWords,
    runeCount: parsed.runeCount
  },
  baseline: {
    metrics: metrics(ciphertext),
    withinWordTrigram: withinWordTrigram(wordCipher)
  },
  nativeControl: {
    metrics: metrics(control.slice(0, 12956)),
    withinWordTrigram: withinWordTrigram(controlWords)
  },
  models,
  positiveControls: plantChecks,
  verdict: 'The full source-seeded M05 28-cycle and its inverse, alongside the M16 six-step controls, remain ciphertext-like as zero-based word-local rotors; no LP2 plaintext or authentic key.'
}, null, 2));

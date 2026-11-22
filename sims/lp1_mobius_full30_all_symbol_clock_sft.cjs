#!/usr/bin/env node
'use strict';

// Test the source-derived full 30-symbol PGL2 alphabet with a global
// position clock. Spaces are the remaining fixed projective point and
// consume a clock step. Node.js 22, no third-party packages.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { parseLP2Words } = require('./lp2_word_pages.cjs');

const MOD = 29;
const M05 = [[11, 6], [6, 11]];
const M16 = [[28, 9], [9, 28]];
const mod = x => ((x % MOD) + MOD) % MOD;
function inv(a) {
  a = mod(a);
  for (let x = 1; x < MOD; x++) if (mod(a * x) === 1) return x;
  throw new Error('noninvertible residue');
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
  const di = inv(d);
  return [
    [mod(A[1][1] * di), mod(-A[0][1] * di)],
    [mod(-A[1][0] * di), mod(A[0][0] * di)]
  ];
}
function applyPGL2(A, x) {
  const [a, b] = A[0], [c, d] = A[1];
  if (x === null) return c === 0 ? null : mod(a * inv(c));
  const denominator = mod(c * x + d);
  return denominator === 0 ? null : mod((a * x + b) * inv(denominator));
}
function projectiveOrder(A) {
  for (let n = 1; n <= 60; n++) {
    const P = matPow(A, n);
    if (P[0][1] === 0 && P[1][0] === 0 && P[0][0] === P[1][1] && P[0][0] !== 0) return n;
  }
  throw new Error('projective order > 60');
}

const M05Power6 = matPow(M05, 6);
const scalar = mod(M16[0][0] * inv(M05Power6[0][0]));
assert.deepEqual(M16, M05Power6.map(row => row.map(x => mod(scalar * x))));
assert.equal(projectiveOrder(M05), 28);
assert.equal(projectiveOrder(M16), 14);

const seed = 226 % MOD;
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
assert.deepEqual(cycleSymbols.slice().sort((a, b) => a - b), [...Array(28).keys()]);
assert.equal(new Set(cyclePoints.map(x => x === null ? 'infinity' : x).concat([1, 28])).size, 30);
for (const matrix of [M05, M16]) {
  assert.equal(applyPGL2(matrix, 1), 1);
  assert.equal(applyPGL2(matrix, 28), 28);
}

const SPACE = null;
function symbolToPoint(symbol) {
  if (symbol === SPACE) return 1;
  if (symbol === 28) return 28;
  const at = cycleSymbols.indexOf(symbol);
  assert.ok(at >= 0, 'symbol not in source-derived 28-cycle');
  return cyclePoints[at];
}
function pointToSymbol(projectivePoint) {
  if (projectivePoint === 1) return SPACE;
  if (projectivePoint === 28) return 28;
  const at = cyclePoints.findIndex(x => x === projectivePoint);
  assert.ok(at >= 0, 'projective point not in source-derived alphabet');
  return cycleSymbols[at];
}

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const parsed = parseLP2Words(raw);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const words = parsed.words.map(w => [...w.runes].map(r => runeToIndex.get(r)));
const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.deepEqual(words.flat(), ciphertext);
const wordLengths = words.map(w => w.length);

function withSpaces(wordList) {
  const stream = [];
  wordList.forEach((word, i) => {
    stream.push(...word);
    if (i + 1 < wordList.length) stream.push(SPACE);
  });
  return stream;
}
const originalStream = withSpaces(words);
assert.equal(originalStream.length, 15851);
assert.equal(originalStream.filter(x => x === SPACE).length, 2895);

function transformGlobal(stream, matrix, period) {
  const powers = Array.from({ length: period }, (_, i) => matPow(matrix, i));
  return stream.map((symbol, i) =>
    pointToSymbol(applyPGL2(powers[i % period], symbolToPoint(symbol))));
}
function splitWords(stream) {
  const out = [];
  let word = [];
  for (const symbol of stream) {
    if (symbol === SPACE) { out.push(word); word = []; }
    else word.push(symbol);
  }
  out.push(word);
  return out;
}

const controlText = fs.readFileSync(path.join(root, 'resources/control/emerson_essays_2944.txt'), 'utf8');
const translit = corpus.translit;
const gp = new Map(translit.map((s, i) => [s, i]));
gp.set('ING', 21);
function englishToGPWords(text) {
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    const encoded = [];
    for (let i = 0; i < word.length;) {
      let found = false;
      for (const n of [3, 2, 1]) {
        const token = word.slice(i, i + n);
        if (gp.has(token)) {
          encoded.push(gp.get(token));
          i += n;
          found = true;
          break;
        }
      }
      if (!found) throw new Error('unmapped control text at ' + word.slice(i));
    }
    out.push(encoded);
  }
  return out;
}
const controlWords = englishToGPWords(controlText);
const control = controlWords.flat();
const trigramCounts = new Map();
for (let i = 0; i + 2 < control.length; i++) {
  const key = control[i] * 841 + control[i + 1] * 29 + control[i + 2];
  trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
}
const alpha = 0.05;
const denominator = control.length - 2 + alpha * 29 ** 3;
function metrics(symbols) {
  const frequencies = Array(29).fill(0);
  for (const symbol of symbols) frequencies[symbol]++;
  const ioc = frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
  const top12 = frequencies.slice().sort((a, b) => b - a).slice(0, 12)
    .reduce((sum, n) => sum + n, 0) / symbols.length;
  let score = 0;
  for (let i = 0; i + 2 < symbols.length; i++) {
    const key = symbols[i] * 841 + symbols[i + 1] * 29 + symbols[i + 2];
    score += Math.log(((trigramCounts.get(key) || 0) + alpha) / denominator);
  }
  return { ioc, top12, trigram: score / (symbols.length - 2) };
}
function withinWordTrigram(wordList) {
  let score = 0, count = 0;
  for (const word of wordList) for (let i = 0; i + 2 < word.length; i++) {
    const key = word[i] * 841 + word[i + 1] * 29 + word[i + 2];
    score += Math.log(((trigramCounts.get(key) || 0) + alpha) / denominator);
    count++;
  }
  return score / count;
}

const specs = [
  { name: 'M05^i', matrix: M05, inverse: matInv(M05), period: 28 },
  { name: 'M05^-i', matrix: matInv(M05), inverse: M05, period: 28 },
  { name: 'M16^i', matrix: M16, inverse: matInv(M16), period: 14 },
  { name: 'M16^-i', matrix: matInv(M16), inverse: M16, period: 14 }
];
const models = specs.map(spec => {
  const decoded = transformGlobal(originalStream, spec.matrix, spec.period);
  const recovered = transformGlobal(decoded, spec.inverse, spec.period);
  assert.deepEqual(recovered, originalStream);
  const decodedWords = splitWords(decoded);
  const flat = decodedWords.flat();
  return {
    name: spec.name,
    metrics: metrics(flat),
    withinWordTrigram: withinWordTrigram(decodedWords),
    preview: decodedWords.slice(0, 24).map(w => w.map(i => translit[i]).join('')).join(' '),
    wordInitialUnchanged: decodedWords.filter((w, i) => w[0] === words[i][0]).length,
    spacesPreserved: decoded.filter(x => x === SPACE).length
  };
});

const plantFlat = control.slice(0, 12956);
let offset = 0;
const plantWords = wordLengths.map(length => {
  const word = plantFlat.slice(offset, offset + length);
  offset += length;
  return word;
});
assert.equal(offset, 12956);
const plantStream = withSpaces(plantWords);
const positiveControls = specs.map(spec => {
  const encrypted = transformGlobal(plantStream, spec.matrix, spec.period);
  const recovered = transformGlobal(encrypted, spec.inverse, spec.period);
  assert.deepEqual(recovered, plantStream);
  return {
    name: spec.name,
    exact: true,
    runes: splitWords(recovered).flat().length,
    spaces: recovered.filter(x => x === SPACE).length
  };
});

console.log(JSON.stringify({
  source: {
    M05, M16, M05Power6, scalar,
    projectiveOrders: { M05: 28, M16: 14 },
    seed,
    cycleSymbols,
    fixedPoints: { space: 1, EA: 28 },
    alphabet: '29 GP runes + one word separator = 30 points of P1(F29)'
  },
  corpus: {
    words: words.length,
    runes: ciphertext.length,
    spaces: originalStream.filter(x => x === SPACE).length,
    streamSymbols: originalStream.length,
    crossPageWords: parsed.crossPageWords
  },
  baseline: {
    metrics: metrics(ciphertext),
    withinWordTrigram: withinWordTrigram(words)
  },
  models,
  positiveControls,
  verdict: 'All four global all-symbol PGL2 positional rotors remain ciphertext-like; all planted controls recover exactly.'
}, null, 2));

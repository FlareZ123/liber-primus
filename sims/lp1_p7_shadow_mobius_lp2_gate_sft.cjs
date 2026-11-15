#!/usr/bin/env node
'use strict';

// Source-constrained LP1 p7 "shadow/MOBIUS" matrix tests against original LP2.
// Node.js 22; no third-party packages. Run from repository root:
//   node sims/lp1_p7_shadow_mobius_lp2_gate_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { parseLP2Words } = require('./lp2_word_pages.cjs');

const MOD = 29;
const SPACE = 29; // 30th projective symbol
const ALPHABET = 30;
const M = [[11, 22], [15, 6]]; // [272,138;131,151] mod 29
const MT = [[11, 15], [22, 6]];
const mod = x => ((x % MOD) + MOD) % MOD;
const mod30 = x => ((x % ALPHABET) + ALPHABET) % ALPHABET;

function inv(a) {
  a = mod(a);
  for (let x = 1; x < MOD; x++) if (mod(a * x) === 1) return x;
  throw new Error('noninvertible residue');
}
function matMul(A, B) {
  return [
    [mod(A[0][0] * B[0][0] + A[0][1] * B[1][0]),
     mod(A[0][0] * B[0][1] + A[0][1] * B[1][1])],
    [mod(A[1][0] * B[0][0] + A[1][1] * B[1][0]),
     mod(A[1][0] * B[0][1] + A[1][1] * B[1][1])]
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
  const determinant = mod(A[0][0] * A[1][1] - A[0][1] * A[1][0]);
  const di = inv(determinant);
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
    if (P[0][1] === 0 && P[1][0] === 0 &&
        P[0][0] === P[1][1] && P[0][0] !== 0) return n;
  }
  throw new Error('projective order exceeds 60');
}
function projectiveOrbit(A, start) {
  const points = [];
  let x = start;
  while (!points.includes(x)) {
    points.push(x);
    x = applyPGL2(A, x);
  }
  return { points, repeat: x };
}
function symbolToPoint(symbol) {
  return symbol === SPACE ? null : symbol;
}
function pointToSymbol(point) {
  return point === null ? SPACE : point;
}
function transformProjectiveClock(stream, matrix, phase) {
  const powers = Array.from({ length: 30 }, (_, i) => matPow(matrix, i));
  return stream.map((symbol, i) =>
    pointToSymbol(applyPGL2(powers[(i + phase) % 30], symbolToPoint(symbol))));
}
function transformWordKey(words, key, sign) {
  return words.map(word => word.map((symbol, i) => mod(symbol + sign * key[i % key.length])));
}
function transformProgressive30(stream, sign) {
  return stream.map((symbol, i) => mod30(symbol + sign * (i % 30)));
}
function withSpaces(words) {
  const stream = [];
  words.forEach((word, i) => {
    stream.push(...word);
    if (i + 1 < words.length) stream.push(SPACE);
  });
  return stream;
}
function splitWords(stream) {
  const out = [];
  let word = [];
  for (const symbol of stream) {
    if (symbol === SPACE) {
      out.push(word);
      word = [];
    } else {
      word.push(symbol);
    }
  }
  out.push(word);
  return out;
}

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const parsed = parseLP2Words(raw);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);

const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const words = parsed.words.map(w => [...w.runes].map(r => runeToIndex.get(r)));
const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.deepEqual(words.flat(), ciphertext);
const originalStream = withSpaces(words);
assert.equal(originalStream.length, 15851);
assert.equal(originalStream.filter(x => x === SPACE).length, 2895);

const translit = corpus.translit;
const gp = new Map(translit.map((s, i) => [s, i]));
gp.set('ING', 21);
function englishToGPWords(text) {
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  return (normalized.match(/[A-Z]+/g) || []).map(word => {
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
    return encoded;
  });
}
const controlText = fs.readFileSync(
  path.join(root, 'resources/control/emerson_essays_2944.txt'), 'utf8');
const controlWords = englishToGPWords(controlText);
const control = controlWords.flat();
const trigramCounts = new Map();
for (let i = 0; i + 2 < control.length; i++) {
  const key = control[i] * 841 + control[i + 1] * 29 + control[i + 2];
  trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
}
const alpha = 0.05;
const denominator = control.length - 2 + alpha * 29 ** 3;

function metrics(runes, wordList) {
  const frequencies = Array(29).fill(0);
  for (const symbol of runes) {
    assert.ok(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
    frequencies[symbol]++;
  }
  const ioc = frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
  const top12 = frequencies.slice().sort((a, b) => b - a).slice(0, 12)
    .reduce((sum, n) => sum + n, 0) / runes.length;
  let allScore = 0, allCount = 0;
  for (let i = 0; i + 2 < runes.length; i++) {
    const key = runes[i] * 841 + runes[i + 1] * 29 + runes[i + 2];
    allScore += Math.log(((trigramCounts.get(key) || 0) + alpha) / denominator);
    allCount++;
  }
  let wordScore = 0, wordCount = 0;
  for (const word of wordList) {
    for (let i = 0; i + 2 < word.length; i++) {
      const key = word[i] * 841 + word[i + 1] * 29 + word[i + 2];
      wordScore += Math.log(((trigramCounts.get(key) || 0) + alpha) / denominator);
      wordCount++;
    }
  }
  return {
    runes: runes.length,
    words: wordList.length,
    spaces: wordList.length - 1,
    ioc,
    top12,
    allTrigram: allScore / allCount,
    withinWordTrigram: wordScore / wordCount,
    preview: wordList.slice(0, 12)
      .map(w => w.map(i => translit[i]).join('')).join(' ')
  };
}
const rawMetrics = metrics(ciphertext, words);
let controlOffset = 0;
const sourceShapedControl = words.map(word => {
  const part = control.slice(controlOffset, controlOffset + word.length);
  controlOffset += word.length;
  return part;
});
assert.equal(controlOffset, 12956);
const nativeMetrics = metrics(sourceShapedControl.flat(), sourceShapedControl);

const matrices = [
  { name: 'M-row-major', matrix: M },
  { name: 'M-shadow-transpose', matrix: MT }
];
for (const item of matrices) {
  assert.equal(projectiveOrder(item.matrix), 30);
  assert.equal(projectiveOrder(matInv(item.matrix)), 30);
  const orbit = projectiveOrbit(item.matrix, 18);
  assert.equal(orbit.points.length, 30);
  assert.equal(orbit.repeat, 18);
  assert.equal(new Set(orbit.points.map(x => x === null ? 'infinity' : x)).size, 30);
  item.orbit = orbit.points;
  item.wordKey = orbit.points.filter(x => x !== null);
  assert.equal(item.wordKey.length, 29);
  assert.deepEqual(item.wordKey.slice().sort((a, b) => a - b),
    [...Array(29).keys()]);
}

// Interpretation A: canonical P^1(F29) coordinates, with GP rune i = i
// and the printed word separator = infinity. Test only source phases 0 and 18.
const projectiveClockResults = [];
const plantStream = withSpaces(sourceShapedControl);
for (const item of matrices) {
  for (const phase of [0, 18]) {
    for (const direction of [1, -1]) {
      const decodeMatrix = direction === 1 ? item.matrix : matInv(item.matrix);
      const encodeMatrix = direction === 1 ? matInv(item.matrix) : item.matrix;
      const decoded = transformProjectiveClock(originalStream, decodeMatrix, phase);
      const recovered = transformProjectiveClock(decoded, encodeMatrix, phase);
      assert.deepEqual(recovered, originalStream);
      const decodedWords = splitWords(decoded);
      projectiveClockResults.push({
        matrix: item.name, phase, direction,
        ...metrics(decodedWords.flat(), decodedWords)
      });

      const plantedCipher = transformProjectiveClock(plantStream, encodeMatrix, phase);
      const plantedPlain = transformProjectiveClock(plantedCipher, decodeMatrix, phase);
      assert.deepEqual(plantedPlain, plantStream);
    }
  }
}

// Interpretation B: the finite 29-point orbit from seed 18 is a 29-symbol
// additive key, reset at each printed word. Infinity is the word boundary.
const wordKeyResults = [];
for (const item of matrices) {
  for (const sign of [1, -1]) {
    const decoded = transformWordKey(words, item.wordKey, sign);
    const recovered = transformWordKey(decoded, item.wordKey, -sign);
    assert.deepEqual(recovered, words);
    wordKeyResults.push({
      matrix: item.name, sign,
      key: item.wordKey,
      ...metrics(decoded.flat(), decoded)
    });
    const plantedCipher = transformWordKey(sourceShapedControl, item.wordKey, -sign);
    const plantedPlain = transformWordKey(plantedCipher, item.wordKey, sign);
    assert.deepEqual(plantedPlain, sourceShapedControl);
  }
}

// Interpretation C: map the 30 symbols in orbit order. Under this coordinate
// choice the projective action is exactly a progressive 30-symbol Caesar shift.
const progressiveResults = [];
for (const sign of [1, -1]) {
  const decoded = transformProgressive30(originalStream, sign);
  const recovered = transformProgressive30(decoded, -sign);
  assert.deepEqual(recovered, originalStream);
  const decodedWords = splitWords(decoded);
  progressiveResults.push({
    sign, ...metrics(decodedWords.flat(), decodedWords)
  });
  const plantedCipher = transformProgressive30(plantStream, -sign);
  const plantedPlain = transformProgressive30(plantedCipher, sign);
  assert.deepEqual(plantedPlain, plantStream);
}

console.log(JSON.stringify({
  source: {
    originalClue: '272 138 shadows 131 151; 18; MOBIUS',
    M, MT,
    determinantMod29: mod(M[0][0] * M[1][1] - M[0][1] * M[1][0]),
    projectiveOrder: 30,
    seed18OrbitM: matrices[0].orbit.map(x => x === null ? 'infinity' : x),
    seed18OrbitMT: matrices[1].orbit.map(x => x === null ? 'infinity' : x),
    wordKeyM: matrices[0].wordKey,
    wordKeyMT: matrices[1].wordKey
  },
  sourceCorpus: {
    words: words.length,
    runes: ciphertext.length,
    crossPageWords: parsed.crossPageWords,
    full30SymbolStream: originalStream.length,
    spaces: originalStream.length - ciphertext.length
  },
  rawMetrics,
  sourceShapedNativeControlMetrics: nativeMetrics,
  projectiveClockResults,
  wordKeyResults,
  progressiveResults,
  positiveControls: {
    projectiveClock: projectiveClockResults.length,
    wordKey: wordKeyResults.length,
    progressive: progressiveResults.length,
    exactRoundTrips: true
  }
}, null, 2));

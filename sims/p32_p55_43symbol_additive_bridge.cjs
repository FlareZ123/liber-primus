#!/usr/bin/env node
'use strict';

// Test the one-to-one GP29 additive/Beaufort bridge between:
//   A) the 43-rune output of the frozen 2016 p50-byte -> p32 compass SFT, and
//   B) the 43 p55 interior runes selected by "shed our own circumferences".
// Only source-fixed forward/reverse alignments are tested. No phase, shuffle,
// arbitrary key, or per-symbol mapping search is performed.

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/lp2-transcription.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');

const MOD = 29;
const mod = (n, m = MOD) => ((n % m) + m) % m;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const token = i => corpus.translit[i];
const tokens = xs => xs.map(token);
const ioc = xs => {
  const f = Array(MOD).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};

// Reproduce the existing source-fixed p50[84:127] -> p32 11x11 compass route.
const p32 = corpus.pages.find(p => p.page === 32).indices;
assert.strictEqual(p32.length, 121);
assert.strictEqual(grid.bytes[83], 193);
assert.strictEqual(grid.bytes[127], 193);
const routeBytes = grid.bytes.slice(84, 127);
assert.strictEqual(routeBytes.length, 43);
const directions = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1],
];
let row = 3, col = 0;
const visitedPositions = [];
for (const b of routeBytes) {
  const [dy, dx] = directions[b & 7];
  const distance = b >> 3;
  row = mod(row + dy * distance, 11);
  col = mod(col + dx * distance, 11);
  visitedPositions.push(row * 11 + col);
}
const visited = visitedPositions.map(pos => p32[pos]);
assert.strictEqual(visited.length, 43);
assert.deepStrictEqual([row, col], [3, 4]);

// Reproduce the p55 physical-word interior: remove the first and last rune
// from each printed p55 word, including the incoming one-rune carry segment.
const physicalPages = transcription.split('%');
const p55Words = physicalPages[54].replace(/\/\s*/g, '').match(/[\u16A0-\u16FF]+/gu) || [];
const p55WordLengths = p55Words.map(w => Array.from(w).length);
const inner55 = p55Words.flatMap(w => Array.from(w).slice(1, -1)).map(r => runeIndex.get(r));
assert.deepStrictEqual(p55WordLengths, [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.strictEqual(inner55.length, 43);

// Positive language control: the first 43 body runes of solved p57, after
// the seven-rune PARABLE heading.
const p57Runes = physicalPages[56].match(/[\u16A0-\u16FF]/gu) || [];
const p57Body = p57Runes.slice(7).map(r => runeIndex.get(r));
assert.strictEqual(p57Body.length, 88);
const p57Control = p57Body.slice(0, 43);

// Match the repository's GP29 Shakespeare trigram model parameters.
const DIGRAPHS = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };
const LETTERS = {
  A: 24, B: 17, C: 5, D: 23, E: 18, F: 0, G: 6, H: 8, I: 10, J: 11,
  K: 5, L: 20, M: 19, N: 9, O: 3, P: 13, Q: 5, R: 4, S: 15, T: 16,
  U: 1, V: 1, W: 7, X: 14, Y: 26, Z: 15,
};
function encodeGP(s) {
  s = s.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const d = DIGRAPHS[s.slice(i, i + 2)];
    if (d !== undefined) { out.push(d); i++; }
    else out.push(LETTERS[s[i]]);
  }
  return out;
}
const training = encodeGP(shakespeare.slice(0, 240000));
const unigramCounts = new Uint32Array(MOD);
const bigramCounts = new Uint32Array(MOD * MOD);
const trigramCounts = new Uint32Array(MOD * MOD * MOD);
for (let i = 0; i < training.length; i++) {
  unigramCounts[training[i]]++;
  if (i) bigramCounts[training[i - 1] * MOD + training[i]]++;
  if (i > 1) trigramCounts[(training[i - 2] * MOD + training[i - 1]) * MOD + training[i]]++;
}
const unigram = Array.from({ length: MOD }, (_, i) =>
  Math.log((unigramCounts[i] + 1) / (training.length + MOD)));
const bigram = Array.from({ length: MOD * MOD }, (_, ix) => {
  const a = Math.floor(ix / MOD), b = ix % MOD;
  return Math.log((bigramCounts[ix] + 12 * Math.exp(unigram[b])) / (unigramCounts[a] + 12));
});
const trigram = Array.from({ length: MOD * MOD * MOD }, (_, ix) => {
  const a = Math.floor(ix / (MOD * MOD));
  const b = Math.floor(ix / MOD) % MOD;
  const c = ix % MOD;
  return Math.log((trigramCounts[ix] + 9 * Math.exp(bigram[b * MOD + c])) /
    (bigramCounts[a * MOD + b] + 9));
});
function trigramLogMean(xs) {
  if (xs.length < 3) return null;
  let sum = 0;
  for (let i = 2; i < xs.length; i++)
    sum += trigram[(xs[i - 2] * MOD + xs[i - 1]) * MOD + xs[i]];
  return sum / (xs.length - 2);
}

const outputs = [];
for (const reverse of [false, true]) {
  const C = reverse ? inner55.slice().reverse() : inner55.slice();
  const K = reverse ? visited.slice().reverse() : visited.slice();
  for (const [operation, fn] of [
    ['C-K', (c, k) => mod(c - k)],
    ['C+K', (c, k) => mod(c + k)],
    ['K-C', (c, k) => mod(k - c)],
  ]) {
    const out = C.map((c, i) => fn(c, K[i]));
    outputs.push({
      alignment: reverse ? 'reverse' : 'forward',
      operation,
      tokens: tokens(out),
      ioc: ioc(out),
      gpShakespeareTrigramLogMean: trigramLogMean(out),
    });
  }
}

// Arithmetic positive control: a known p57 plaintext segment encrypted with
// this key by addition must be recovered by C-K exactly.
const syntheticCipher = p57Control.map((p, i) => mod(p + visited[i]));
const syntheticRecovered = syntheticCipher.map((c, i) => mod(c - visited[i]));
assert.deepStrictEqual(syntheticRecovered, p57Control);

const report = {
  source: {
    p50ByteInterval: [84, 127],
    p50BracketCells: [83, 127],
    p50BracketValueBase60: 193,
    routeStartRowCol: [3, 0],
    routeEndRowCol: [row, col],
    routeDistinctCells: new Set(visitedPositions).size,
    p55PrintedWordLengths: p55WordLengths,
    p55InteriorLength: inner55.length,
    p57Control: 'first 43 body runes after 7-rune PARABLE heading',
  },
  streams: {
    p32CompassVisited: tokens(visited),
    p55Interior: tokens(inner55),
    p57PlaintextControl: tokens(p57Control),
  },
  controls: {
    p57ControlIoC: ioc(p57Control),
    p57ControlGpShakespeareTrigramLogMean: trigramLogMean(p57Control),
    syntheticAdditiveRecoveryPassed: true,
    trainingCharacters: 240000,
    trainingRunes: training.length,
  },
  outputs,
  conclusion: 'The six fixed one-to-one GP29 additive/Beaufort alignments are not plaintext. This rejects only direct stationary pairing; it does not test or exclude nonlinear, stateful, or differently keyed mechanisms.',
};
console.log(JSON.stringify(report, null, 2));

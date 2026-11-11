#!/usr/bin/env node
'use strict';

// Test two fixed 43-symbol source bridges to the p55 interior:
//   A) the frozen 2016 p50-byte -> p32 compass stream;
//   B) the signature-verified 2016 message's 43 word GP-prime sums.
// The p55 interior is selected by "shed our own circumferences". No phase,
// reversal, arbitrary key, or per-symbol mapping search is performed.

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/lp2-transcription.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const signed2016 = read('resources/historical/cicada2016-4gq25-outguess.asc');

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

// The clear-signed body has 43 alphabetic words. Exclude the numeric 3301
// and mixed alphanumeric key ID 7A35090F; retain OpenPGP as a word.
const signedBody = signed2016
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----\r?\nHash:.*?\r?\n\r?\n/, '')
  .split(/^-----BEGIN PGP SIGNATURE-----/m)[0];
const signedWords = (signedBody.match(/[A-Za-z0-9]+/g) || [])
  .filter(word => /^[A-Za-z]+$/.test(word));
assert.strictEqual(signedWords.length, 43);
const signedWordPrimeSums = signedWords.map(word =>
  encodeGP(word).reduce((sum, rune) => sum + corpus.prime[rune], 0));
const signedWordPrimeKey = signedWordPrimeSums.map(sum => mod(sum));

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

// Fixed direct reading of the signed message's "numbers": one GP-prime sum
// per alphabetic word, reduced mod29, paired in source order with p55's 43
// interior runes. Test only the two ordinary additive directions.
const signedPrimeMinus = inner55.map((c, i) => mod(c - signedWordPrimeKey[i]));
const signedPrimePlus = inner55.map((c, i) => mod(c + signedWordPrimeKey[i]));
const signedPrimeMinusScore = trigramLogMean(signedPrimeMinus);
const signedPrimePlusScore = trigramLogMean(signedPrimePlus);
const p55RawScore = trigramLogMean(inner55);
const signedPrimeSyntheticCipher = p57Control.map((p, i) => mod(p + signedWordPrimeKey[i]));
const signedPrimeSyntheticRecovered = signedPrimeSyntheticCipher.map((c, i) =>
  mod(c - signedWordPrimeKey[i]));
assert.deepStrictEqual(signedPrimeSyntheticRecovered, p57Control);

// Same-multiset order control: 10,000 deterministic Fisher-Yates permutations
// of the 43 fixed key values, scoring only C-K.
const shuffleCount = 10000;
let shuffleState = 0x45c1d0;
function nextShuffleU32() {
  shuffleState ^= shuffleState << 13;
  shuffleState ^= shuffleState >>> 17;
  shuffleState ^= shuffleState << 5;
  return shuffleState >>> 0;
}
const shuffleScores = [];
for (let trial = 0; trial < shuffleCount; trial++) {
  const shuffledKey = signedWordPrimeKey.slice();
  for (let i = shuffledKey.length - 1; i > 0; i--) {
    const j = nextShuffleU32() % (i + 1);
    [shuffledKey[i], shuffledKey[j]] = [shuffledKey[j], shuffledKey[i]];
  }
  shuffleScores.push(trigramLogMean(inner55.map((c, i) => mod(c - shuffledKey[i]))));
}
shuffleScores.sort((a, b) => a - b);
const observedPrimeMinus = signedPrimeMinusScore;
const shuffleGreaterEqual = shuffleScores.filter(score => score >= observedPrimeMinus).length;
const shuffleLess = shuffleScores.filter(score => score < observedPrimeMinus).length;
const shuffleEqual = shuffleCount - shuffleGreaterEqual - shuffleLess;
const shuffleQuantile = q => shuffleScores[Math.floor(q * (shuffleCount - 1))];

const signedPrimeSumKeyResult = {
  signedWords,
  primeSums: signedWordPrimeSums,
  keyMod29: signedWordPrimeKey,
  p55Cipher: tokens(inner55),
  cMinusK: {
    tokens: tokens(signedPrimeMinus),
    ioc: ioc(signedPrimeMinus),
    gpShakespeareTrigramLogMean: signedPrimeMinusScore,
    p55InteriorSegments: p55WordLengths.map(n => Math.max(0, n - 2)),
  },
  cPlusK: {
    tokens: tokens(signedPrimePlus),
    ioc: ioc(signedPrimePlus),
    gpShakespeareTrigramLogMean: signedPrimePlusScore,
  },
  p55Raw: { ioc: ioc(inner55), gpShakespeareTrigramLogMean: p55RawScore },
  sameMultisetKeyOrderShuffle: {
    seed: '0x45c1d0',
    trials: shuffleCount,
    greaterOrEqual: shuffleGreaterEqual,
    addOneUpperTail: (shuffleGreaterEqual + 1) / (shuffleCount + 1),
    observedRankFraction: (shuffleLess + 0.5 * shuffleEqual) / shuffleCount,
    quantiles: {
      q05: shuffleQuantile(0.05),
      median: shuffleQuantile(0.5),
      q95: shuffleQuantile(0.95),
      q99: shuffleQuantile(0.99),
    },
  },
  syntheticP57AdditiveRecoveryPassed: true,
};

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
    signedMessagePrimeKeySyntheticRecoveryPassed: true,
    trainingCharacters: 240000,
    trainingRunes: training.length,
  },
  outputs,
  signedMessagePrimeSumKey: signedPrimeSumKeyResult,
  conclusion: 'The six fixed p32-compass additive/Beaufort alignments and the direct source-order 43-word GP-prime-sum key do not recover p55 plaintext. This rejects only these stationary additive readings; it does not test or exclude nonlinear, stateful, or differently keyed mechanisms.',
};
console.log(JSON.stringify(report, null, 2));

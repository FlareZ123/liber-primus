'use strict';
/**
 * Source-fixed 29x8 p54 tail test using the eight-rune red heading as a
 * stable columnar key. The p54 A/24 offset leaves 232 bytes (29x8).
 * Node.js 22, CommonJS; no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const json = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const text = f => fs.readFileSync(path.join(root, f), 'utf8');
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const page = n => corpus.pages.find(p => p.page === n).indices;
const cipher = page(54);
const tail = grid.bytes.slice(24);
const key = cipher.slice(1, 9);
const keyOrder = key.map((value, index) => ({value, index}))
  .sort((a, b) => a.value - b.value || a.index - b.index)
  .map(x => x.index);
assert.deepEqual([cipher.length, cipher[0], tail.length], [232, 24, 232]);
assert.deepEqual(key, [19, 21, 23, 27, 2, 14, 10, 19]);
assert.deepEqual(keyOrder, [4, 6, 5, 0, 7, 1, 2, 3]);

const mod = n => (n % 29 + 29) % 29;
const readDown = values => keyOrder.flatMap(col =>
  Array.from({length: 29}, (_, row) => values[row * 8 + col]));
function undoColumnar(values) {
  const output = Array(232);
  let at = 0;
  for (const col of keyOrder)
    for (let row = 0; row < 29; row++)
      output[row * 8 + col] = values[at++];
  return output;
}
assert.deepEqual(undoColumnar(readDown(tail)), tail);
assert.deepEqual(readDown(undoColumnar(tail)), tail);

const transforms = [
  {name: 'table-read-down', c: cipher, b: readDown(tail)},
  {name: 'table-inverse', c: cipher, b: undoColumnar(tail)},
  {name: 'cipher-read-down', c: readDown(cipher), b: tail},
  {name: 'cipher-inverse', c: undoColumnar(cipher), b: tail}
];
const byteMaps = [
  {name: 'byte-mod29', fn: b => b % 29},
  {name: 'byte-floor29/256', fn: b => Math.floor(29 * b / 256)},
  {name: 'byte-mod28', fn: b => b % 28}
];

function gpEncode(source) {
  const tokenIndex = new Map(corpus.translit.map((token, index) => [token, index]));
  tokenIndex.set('ING', 21);
  const normalized = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let matched = false;
      for (const n of [3, 2, 1]) {
        const token = word.slice(i, i + n);
        if (tokenIndex.has(token)) {
          output.push(tokenIndex.get(token));
          i += n;
          matched = true;
          break;
        }
      }
      assert(matched, 'unmapped GP token');
    }
  }
  return output;
}

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const emerson = gpEncode(text('resources/control/emerson_essays_2944.txt'));
assert(emerson.length >= 50_000);
const trigramCounts = new Uint32Array(29 ** 3);
for (let i = 2; i < 50_000; i++)
  trigramCounts[emerson[i - 2] * 841 + emerson[i - 1] * 29 + emerson[i]]++;
const alpha = 0.2;
const denominator = 49_998 + trigramCounts.length * alpha;
function trigramScore(values) {
  let total = 0;
  for (let i = 2; i < values.length; i++)
    total += Math.log((trigramCounts[values[i - 2] * 841 +
      values[i - 1] * 29 + values[i]] + alpha) / denominator);
  return total / (values.length - 2);
}

const models = [];
for (const transform of transforms) {
  for (const map of byteMaps) {
    const keyStream = transform.b.map(map.fn);
    for (const operation of ['C-K', 'C+K', 'K-C']) {
      const decoded = transform.c.map((c, i) => operation === 'C-K' ?
        mod(c - keyStream[i]) : operation === 'C+K' ?
        mod(c + keyStream[i]) : mod(keyStream[i] - c));
      const reencryption = decoded.map((p, i) => operation === 'C-K' ?
        mod(p + keyStream[i]) : operation === 'C+K' ?
        mod(p - keyStream[i]) : mod(keyStream[i] - p));
      assert.deepEqual(reencryption, transform.c);
      models.push({
        transform: transform.name, byteMap: map.name, operation,
        ioc: ioc(decoded), gpTrigram: trigramScore(decoded),
        preview: decoded.slice(0, 24).map(x => corpus.translit[x]).join(' ')
      });
    }
  }
}
assert.equal(models.length, 36);
models.sort((a, b) => b.gpTrigram - a.gpTrigram);

const gibran = gpEncode(text('resources/control/gibran_prophet_58585.txt'));
const holdoutScores = [];
for (let i = 0; i + 232 <= gibran.length; i += 29)
  holdoutScores.push(trigramScore(gibran.slice(i, i + 232)));
holdoutScores.sort((a, b) => a - b);
const median = holdoutScores[Math.floor(holdoutScores.length / 2)];
const q10 = holdoutScores[Math.floor(holdoutScores.length * 0.1)];
const q90 = holdoutScores[Math.floor(holdoutScores.length * 0.9)];
const best = models[0];
assert(best.gpTrigram < holdoutScores[0],
  'A candidate above the worst held-out native-English window requires review');

const plant = gibran.slice(1024, 1256);
const plantKey = readDown(tail).map(b => b % 29);
const syntheticCipher = plant.map((p, i) => mod(p + plantKey[i]));
const recovered = syntheticCipher.map((c, i) => mod(c - plantKey[i]));
assert.deepEqual(recovered, plant);

console.log(JSON.stringify({
  classification: 'bounded negative; no p54 plaintext or key',
  source: {
    p54Runes: cipher.length, firstRuneGPIndex: cipher[0],
    tableSkip: 24, tableTailBytes: tail.length,
    matrixShape: [29, 8], redHeadingKeyGPIndices: key,
    stableAscendingKeyColumnOrderZeroBased: keyOrder
  },
  testedFamily: {
    gridOrCipherColumnTransforms: transforms.map(x => x.name),
    byteMaps: byteMaps.map(x => x.name),
    additiveDirections: ['C-K', 'C+K', 'K-C'],
    modelCount: models.length,
    noPhaseOrFreePermutation: true
  },
  original: {ioc: ioc(cipher), gpTrigram: trigramScore(cipher)},
  bestCandidates: models.slice(0, 8),
  gibranHoldout: {
    windowLength: 232, stride: 29, count: holdoutScores.length,
    worst: holdoutScores[0], q10, median, q90
  },
  positiveControl: {
    source: 'Gibran native-GP symbols [1024,1256)',
    recovered: recovered.length, exact: recovered.every((x, i) => x === plant[i])
  },
  conclusion: 'The heading-keyed 29x8 columnar/additive p54-tail family remains far below native-GP English. This does not authenticate the 24+232 frame or exclude other source-selected operations.'
}, null, 2));

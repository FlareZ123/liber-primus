'use strict';

/**
 * Unmixed Jordan-channel readout of the source-signed LP2 p15 matrix.
 *
 * Independent original algebra:
 *   source p15 4x4 M has eigenvalues (8,17,24,24) over GF29;
 *   original p29 polynomial kills the (24) primary component;
 *   original p30 polynomial kills both (8),(17) components.
 * Thus the p29+p30 source pair motivates testing these four canonical
 * eigen/Jordan coordinate streams, without fitting 29^4 possible bases.
 *
 * Source-native GP positive is exact. Original means no plaintext claim.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const MOD = 29;
/** @param {number} a */
const mod = a => ((a % MOD) + MOD) % MOD;
/** @param {number} a */
function inverseScalar(a) {
  for (let x = 1; x < MOD; x++) if (mod(a * x) === 1) return x;
  throw new Error('Noninvertible residue');
}
/**
 * @param {number[][]} matrix
 * @returns {{rows:number[][],pivots:number[]}}
 */
function rref(matrix) {
  const rows = matrix.map(line => line.map(mod));
  let row = 0;
  const pivots = [];
  for (let col = 0; col < rows[0].length && row < rows.length; col++) {
    let target = row;
    while (target < rows.length && rows[target][col] === 0) target++;
    if (target === rows.length) continue;
    [rows[target], rows[row]] = [rows[row], rows[target]];
    const scalar = inverseScalar(rows[row][col]);
    rows[row] = rows[row].map(x => mod(x * scalar));
    for (let other = 0; other < rows.length; other++) {
      if (other === row || rows[other][col] === 0) continue;
      const factor = rows[other][col];
      rows[other] = rows[other].map((x, k) =>
        mod(x - factor * rows[row][k]));
    }
    pivots.push(col);
    row++;
  }
  return { rows, pivots };
}
/** @param {number[][]} a */
function invert(a) {
  const n = a.length;
  const aug = a.map((row, i) =>
    row.concat(Array.from({ length: n }, (_, j) => +(i === j))));
  const rr = rref(aug);
  assert.deepEqual(rr.pivots.slice(0, n), [0, 1, 2, 3]);
  const identity = rr.rows.map(row => row.slice(0, n));
  assert.deepEqual(identity, Array.from({ length: n },
    (_, i) => Array.from({ length: n }, (_, j) => +(i === j))));
  return rr.rows.map(row => row.slice(n));
}
/** @param {number[][]} a @param {number[][]} b */
function multiply(a, b) {
  return a.map(row => b[0].map((_, j) =>
    mod(row.reduce((sum, x, i) => sum + x * b[i][j], 0))));
}
/** @param {number[][]} a @param {number[]} v */
function matVec(a, v) {
  return a.map(row => mod(row.reduce((sum, x, i) =>
    sum + x * v[i], 0)));
}
const I4 = Array.from({ length: 4 }, (_, i) =>
  Array.from({ length: 4 }, (_, j) => +(i === j)));

const M = [
  [10, 3, 20, 22],
  [1, 22, 21, 25],
  [11, 17, 19, 7],
  [8, 12, 12, 22]
];

// Source matrix has only one ordinary eigenvector for eigenvalue24.
// Its fourth coordinate must therefore be a generalized eigenvector.
const ev8 = [28, 4, 10, 1];
const ev17 = [1, 7, 4, 1];
const ev24 = [27, 3, 13, 1];
const gv24 = [1, 6, 20, 0];
for (const [v, lambda] of [[ev8, 8], [ev17, 17], [ev24, 24]]) {
  assert.deepEqual(matVec(M, v), v.map(x => mod(lambda * x)));
}
const jordanError = matVec(M, gv24).map((x, i) =>
  mod(x - 24 * gv24[i]));
assert.deepEqual(jordanError, ev24);

const columns = [ev8, ev17, ev24, gv24];
const E = Array.from({ length: 4 }, (_, i) =>
  columns.map(v => v[i]));
const EInverse = invert(E);
assert.deepEqual(EInverse, [
  [26, 26, 17, 14],
  [16, 1, 25, 23],
  [16, 2, 16, 22],
  [14, 0, 24, 6]
]);
assert.deepEqual(multiply(E, EInverse), I4);
assert.deepEqual(multiply(EInverse, E), I4);
const J = [
  [8, 0, 0, 0],
  [0, 17, 0, 0],
  [0, 0, 24, 1],
  [0, 0, 0, 24]
];
assert.deepEqual(multiply(M, E), multiply(E, J));

/** @param {number[]} sourceRunes */
function toCoordinates(sourceRunes) {
  assert.equal(sourceRunes.length % 4, 0);
  const streams = [[], [], [], []];
  for (let start = 0; start < sourceRunes.length; start += 4) {
    const block = sourceRunes.slice(start, start + 4);
    const values = matVec(EInverse, block);
    for (let k = 0; k < 4; k++) streams[k].push(values[k]);
  }
  return streams;
}
/** @param {number[][]} streams */
function fromCoordinates(streams) {
  assert.equal(streams.length, 4);
  assert.ok(streams.every(row => row.length === streams[0].length));
  const output = [];
  for (let i = 0; i < streams[0].length; i++) {
    output.push(...matVec(E, streams.map(row => row[i])));
  }
  return output;
}

/** @param {string} sourceText */
function encodeToGP(sourceText) {
  const alphabet = new Map(corpus.translit.map((name, i) =>
    [name.toLowerCase(), i]));
  const text = sourceText.toLowerCase().replace(/qu/g, 'cw')
    .replace(/v/g, 'u').replace(/k/g, 'c').replace(/z/g, 's')
    .replace(/ing/g, 'ng').replace(/io/g, 'ia');
  const output = [];
  for (let i = 0; i < text.length;) {
    const pair = text.slice(i, i + 2);
    if (alphabet.has(pair)) {
      output.push(alphabet.get(pair));
      i += 2;
    } else if (alphabet.has(text[i])) {
      output.push(alphabet.get(text[i]));
      i++;
    } else i++;
  }
  return output;
}
const train = encodeToGP(shakespeare.slice(0, 200000));
assert.equal(train.length, 144904);
const count = new Float64Array(30 * 30 * 29);
const prior = new Float64Array(30 * 30);
{
  let a = 29, b = 29;
  for (const value of train) {
    count[(a * 30 + b) * 29 + value]++;
    prior[a * 30 + b]++;
    a = b;
    b = value;
  }
}
for (let a = 0; a < 30; a++) for (let b = 0; b < 30; b++) {
  for (let c = 0; c < 29; c++) {
    const i = (a * 30 + b) * 29 + c;
    count[i] = Math.log((count[i] + 0.2) /
      (prior[a * 30 + b] + 29 * 0.2));
  }
}
/** @param {number[]} values */
function score(values) {
  let a = 29, b = 29, sum = 0;
  for (const x of values) {
    sum += count[(a * 30 + b) * 29 + x];
    a = b;
    b = x;
  }
  return sum / values.length;
}
/** @param {number[]} values */
function indexOfCoincidence(values) {
  const freqs = Array(29).fill(0);
  for (const x of values) freqs[x]++;
  return freqs.reduce((s, f) => s + f * (f - 1), 0) /
    (values.length * (values.length - 1));
}
const nativeP57 = corpus.pages[57].indices;
assert.equal(nativeP57.length, 95);
const nativeHeldout = encodeToGP(shakespeare.slice(250000)).slice(0, 308);
const plainStreams = Array.from({ length: 4 }, (_, k) =>
  Array.from({ length: 420 },
    (_, i) => nativeP57[(i + 17 * k) % nativeP57.length]));
assert.deepEqual(toCoordinates(fromCoordinates(plainStreams)), plainStreams);
const nativeControl = plainStreams.map(values => score(values));
assert.ok(nativeControl.every(s => s > -3.5));

const receivers = [
  ['p29p30', corpus.pages.slice(29, 31).flatMap(x => x.indices)],
  ['p33p39', corpus.pages.slice(33, 40).flatMap(x => x.indices)],
  ['p54p55', corpus.pages.slice(54, 56).flatMap(x => x.indices)]
];
const results = receivers.map(([name, text]) => {
  const channels = toCoordinates(text);
  assert.deepEqual(fromCoordinates(channels), text);
  return {
    name, inputRunes: text.length,
    inputScore: score(text),
    channels: channels.map(values => ({
      n: values.length, score: score(values),
      ioc: indexOfCoincidence(values),
      first70: values.slice(0, 70).map(i => corpus.translit[i]).join('')
    })),
    paired: [
      channels[0].flatMap((v, i) => [v, channels[1][i]]),
      channels[2].flatMap((v, i) => [v, channels[3][i]])
    ].map(values => ({ n: values.length, score: score(values),
      ioc: indexOfCoincidence(values) }))
  };
});
assert.deepEqual(results.map(x => x.inputRunes), [540, 1680, 308]);
assert.ok(Math.abs(results[0].channels[1].score - (-4.15664164298713)) < 1e-9);
assert.ok(Math.abs(results[2].channels[2].score - (-4.215102268080848)) < 1e-9);
assert.ok(Math.abs(results[2].channels[2].ioc - (0.04818865345181134)) < 1e-9);
assert.ok(Math.abs(score(nativeHeldout) - (-2.4445153142275746)) < 1e-9);
assert.ok(results.every(x => x.channels.every(c => c.score < -4.15)));


// Most directly sourced receiver: the original p15-starting 1894-rune
// chapter. Two trailing runes do not fill a four-symbol block. Rather than
// fabricate padding or drop arbitrary text, enumerate the THREE possible
// 1892-rune complete-block contiguous windows, retaining all source glyphs
// in the master corpus.
const allUnknown = corpus.pages.slice(0, 56).flatMap(p => p.indices);
const ownChapterStart = 729 + 1145 + 1738;
const ownChapter = allUnknown.slice(ownChapterStart, ownChapterStart + 1894);
assert.equal(ownChapter.length, 1894);
const ownSourceWindows = Array.from({ length: 3 }, (_, shift) => {
  const original = ownChapter.slice(shift, shift + 1892);
  const channels = toCoordinates(original);
  assert.deepEqual(fromCoordinates(channels), original);
  return {
    sourceStartShift: shift,
    sourceSymbols: original.length,
    channelScores: channels.map(score),
    channelIoCs: channels.map(indexOfCoincidence)
  };
});
assert.ok(Math.abs(ownSourceWindows[1].channelScores[1] -
  (-4.277173134927186)) < 1e-9);
assert.ok(ownSourceWindows.every(w => w.channelScores.every(x => x < -4.25)));


// Every other Jordan chain with the same fixed eigenvector is
// gv24 + t * ev24, t in GF29. Its exact coordinate change is
// z[2]' = z[2] - t*z[3]. This is the WHOLE one-parameter ambiguity
// of that generalized eigenvector, so do not select a value after seeing
// original language scores. Enumerate all 29 without fixing a secret crib.
const gaugeReceivers = [
  ...receivers,
  ...Array.from({ length: 3 }, (_, shift) =>
    ['p15phase' + shift, ownChapter.slice(shift, shift + 1892)])
];
const allJordanGauges = gaugeReceivers.map(([name, original]) => {
  const [a, b, c, d] = toCoordinates(original);
  const options = Array.from({ length: 29 }, (_, gauge) => ({
    gauge,
    score: score(c.map((x, i) => mod(x - gauge * d[i])))
  })).sort((x, y) => y.score - x.score);
  return { source: name, n: original.length / 4,
    bestGauge: options[0].gauge,
    bestScore: options[0].score,
    medianScore: options[14].score,
    worstScore: options[28].score,
    gaugesTested: options.length };
});
assert.equal(allJordanGauges.length, 6);
assert.ok(allJordanGauges.every(x => x.gaugesTested === 29));
assert.ok(allJordanGauges.every(x => x.bestScore < -3.98));
assert.ok(Math.abs(allJordanGauges[2].bestScore -
  (-3.9889928545342617)) < 1e-9);

console.log(JSON.stringify({
  source: 'signed p15 GF29 matrix, p29/p30 complementary eigen factors',
  allJordanGauges,
  localP15Chapter: ownSourceWindows,
  jordanBasis: E,
  jordanInverse: EInverse,
  nativeP57PositiveScores: nativeControl,
  independentEnglishHeldoutScore: score(nativeHeldout),
  original: results,
  statement: 'No native-GP original plaintext under canonical Jordan/eigenchannel readout'
}, null, 2));

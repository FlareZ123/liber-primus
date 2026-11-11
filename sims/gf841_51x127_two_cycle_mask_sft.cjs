#!/usr/bin/env node
'use strict';

// Source-locked GF(29^2) two-cycle mask test.
// Inputs are the repository's original LP2 corpus and 256-byte numeric grid.
// No phases, rotations, keys, or parameters are fitted.

const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const readJSON = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const readText = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const grid = readJSON('resources/liber-primus/lp2-grid-256.json');
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;

function add(x, y) { return [mod(x[0] + y[0]), mod(x[1] + y[1])]; }
function sub(x, y) { return [mod(x[0] - y[0]), mod(x[1] - y[1])]; }
function mul(x, y) {
  // u^2 = 8 + 3u, from the p3 red triad [13,23,2].
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
  ];
}
function pow(x, n) {
  let result = [1, 0], base = x;
  while (n > 0) {
    if (n & 1) result = mul(result, base);
    base = mul(base, base);
    n = Math.floor(n / 2);
  }
  return result;
}
function inverse(x) {
  if (x[0] === 0 && x[1] === 0) throw new Error('zero has no field inverse');
  return pow(x, 839);
}
function multiplicativeOrder(x) {
  let v = [1, 0];
  for (let n = 1; n <= 840; n++) {
    v = mul(v, x);
    if (v[0] === 1 && v[1] === 0) return n;
  }
  return null;
}

function quotientPairs(bytes) {
  if (!Array.isArray(bytes) || bytes.length !== 256) throw new Error('expected original 256-byte grid');
  const work = bytes.map(mod);
  const q = [];
  // Fixed-width division by the monic p39 factor (X-24)^2 = X^2+10X+25.
  for (let i = 0; i < 254; i++) {
    const x = work[i];
    q.push(x);
    work[i + 1] = mod(work[i + 1] - 10 * x);
    work[i + 2] = mod(work[i + 2] - 25 * x);
  }
  if (work[254] !== 0 || work[255] !== 0) throw new Error('p39 quotient remainder is nonzero');
  return Array.from({ length: 127 }, (_, i) => [q[2 * i], q[2 * i + 1]]);
}

function stats(rows) {
  const forward = rows.map(row => row.filter(([a, b]) => a + 29 * b < 256).length);
  const canonical = rows.map(row => row.filter(([a, b]) => 29 * a + b < 256).length);
  const summarize = counts => ({
    completeRows: counts.filter(x => x === 127).length,
    total: counts.reduce((a, b) => a + b, 0),
    min: Math.min(...counts),
    max: Math.max(...counts),
    mean: counts.reduce((a, b) => a + b, 0) / counts.length,
    perRow: counts
  });
  return { canonical: summarize(canonical), reversed: summarize(forward) };
}

function decodePair(c, k, mode) {
  if (mode === 'C-K') return sub(c, k);
  if (mode === 'C+K') return add(c, k);
  if (mode === 'C/K') return mul(c, inverse(k));
  if (mode === 'C*K') return mul(c, k);
  throw new Error('unknown decode mode ' + mode);
}
function encodePair(p, k, mode) {
  if (mode === 'C-K') return add(p, k);
  if (mode === 'C+K') return sub(p, k);
  if (mode === 'C/K') return mul(p, k);
  if (mode === 'C*K') return mul(p, inverse(k));
  throw new Error('unknown encode mode ' + mode);
}
function mapRows(rows, mask, fn) {
  return rows.map((row, r) => row.map((pair, j) => fn(pair, mask[r][j])));
}
function flatten(rows) { return rows.flat(2); }

const page32 = corpus.pages.find(p => p.page === 32);
if (!page32 || page32.indices.length !== 121) throw new Error('p32 is not the expected 11x11 rune grid');
const leftPrime = corpus.prime[page32.indices[53]];
const rightPrime = corpus.prime[page32.indices[67]];
const zL = [mod(leftPrime), mod(rightPrime)];
const zR = [mod(rightPrime), mod(leftPrime)];
const orderL = multiplicativeOrder(zL);
const orderR = multiplicativeOrder(zR);
if (leftPrime !== 101 || rightPrime !== 11 || orderL !== 84 || orderR !== 10) {
  throw new Error('p32 antipodal field selector changed');
}

const Q = quotientPairs(grid.bytes);
if (Q.length !== 127 || Q.some(q => q[0] === 0 && q[1] === 0)) {
  throw new Error('source quotient is not 127 nonzero field pairs');
}
const sourceRunes = corpus.pages
  .filter(p => p.page <= 55)
  .sort((a, b) => a.page - b.page)
  .flatMap(p => p.indices);
if (sourceRunes.length !== 12956 || sourceRunes[0] !== 15 || sourceRunes[1] !== 8) {
  throw new Error('original 12,956-rune source/header mismatch');
}
const payload = sourceRunes.slice(2);
if (payload.length !== 51 * 127 * 2) throw new Error('51x127 pair framing mismatch');
const rows = Array.from({ length: 51 }, (_, r) =>
  Array.from({ length: 127 }, (_, j) => payload.slice(254 * r + 2 * j, 254 * r + 2 * j + 2))
);

const zLPowers = Array.from({ length: 51 }, (_, r) => pow(zL, r));
const zRPowers = Array.from({ length: 127 }, (_, j) => pow(zR, j));
const mask = Array.from({ length: 51 }, (_, r) =>
  Array.from({ length: 127 }, (_, j) => mul(mul(zLPowers[r], zRPowers[j]), Q[j]))
);
const modes = ['C-K', 'C+K', 'C/K', 'C*K'];

const digraphs = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };
const letters = {
  A: 24, B: 17, C: 5, D: 23, E: 18, F: 0, G: 6, H: 8, I: 10,
  J: 11, K: 5, L: 20, M: 19, N: 9, O: 3, P: 13, Q: 5, R: 4,
  S: 15, T: 16, U: 1, V: 1, W: 7, X: 14, Y: 26, Z: 15
};
function nativeGP(raw) {
  const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const words = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG').match(/[A-Z]+/g) || [];
  const out = [];
  for (const word of words) {
    const encoded = [];
    for (let j = 0; j < word.length;) {
      const token = tokens.find(x => word.startsWith(x.s, j));
      if (!token) { encoded.length = 0; break; }
      encoded.push(token.i);
      j += token.s.length;
    }
    out.push(...encoded);
  }
  return out;
}
function train(symbols) {
  const h = new Map();
  let n = 0;
  for (let i = 0; i + 2 < symbols.length; i++) {
    const k = symbols[i] * 841 + symbols[i + 1] * 29 + symbols[i + 2];
    h.set(k, (h.get(k) || 0) + 1);
    n++;
  }
  return { h, n };
}
function score(symbols, model) {
  let s = 0;
  const denominator = model.n + 0.1 * 29 ** 3;
  for (let i = 0; i + 2 < symbols.length; i++) {
    const k = symbols[i] * 841 + symbols[i + 1] * 29 + symbols[i + 2];
    s += Math.log(((model.h.get(k) || 0) + 0.1) / denominator);
  }
  return s / Math.max(1, symbols.length - 2);
}
function windowStats(symbols, model, n) {
  if (symbols.length < n) throw new Error('control corpus shorter than target window');
  const max = symbols.length - n;
  const values = [];
  for (let i = 0; i < 300; i++) values.push(score(symbols.slice(Math.floor(i * max / 299), Math.floor(i * max / 299) + n), model));
  values.sort((a, b) => a - b);
  return { min: values[0], median: values[149], max: values[299] };
}

const shakespeare = nativeGP(readText('resources/control/shakespeare_first300k.txt'));
const gibran = nativeGP(readText('resources/control/gibran_prophet_58585.txt'));
const emerson = nativeGP(readText('resources/control/emerson_essays_2944.txt'));
const languageModel = train(shakespeare);
const controls = {
  shakespeare: windowStats(shakespeare, languageModel, payload.length),
  gibran: windowStats(gibran, languageModel, payload.length),
  emerson: windowStats(emerson, languageModel, payload.length)
};
const rawScore = score(payload, languageModel);

const operations = [];
for (const mode of modes) {
  const decodedRows = mapRows(rows, mask, (c, k) => decodePair(c, k, mode));
  const decoded = flatten(decodedRows);
  const reencodedRows = mapRows(decodedRows, mask, (p, k) => encodePair(p, k, mode));
  const reencoded = flatten(reencodedRows);
  operations.push({
    mode,
    byteValidity: stats(decodedRows),
    trigramScore: score(decoded, languageModel),
    ioc: (() => {
      const counts = new Uint32Array(29);
      for (const x of decoded) counts[x]++;
      return counts.reduce((s, n) => s + n * (n - 1), 0) / (decoded.length * (decoded.length - 1));
    })(),
    originalRoundTrip: reencoded.every((x, i) => x === payload[i])
  });
}

// Deterministic positive controls: every mode must invert a native 6,477-byte plant.
const plantBytes = Array.from({ length: 51 * 127 }, (_, i) => (73 * i + 41) % 256);
const plantRows = Array.from({ length: 51 }, (_, r) =>
  Array.from({ length: 127 }, (_, j) => {
    const b = plantBytes[r * 127 + j];
    return [Math.floor(b / 29), b % 29];
  })
);
const positiveControls = modes.map(mode => {
  const encryptedRows = mapRows(plantRows, mask, (p, k) => encodePair(p, k, mode));
  const recoveredRows = mapRows(encryptedRows, mask, (c, k) => decodePair(c, k, mode));
  const exact = recoveredRows.every((row, r) =>
    row.every((pair, j) => pair[0] === plantRows[r][j][0] && pair[1] === plantRows[r][j][1])
  );
  const valid = recoveredRows.flat().filter(([a, b]) => 29 * a + b < 256).length;
  return { mode, exact, canonicalBytes: valid, expectedBytes: 51 * 127 };
});

const result = {
  source: {
    p32Offset53: { runeIndex: page32.indices[53], gpPrime: leftPrime },
    p32Offset67: { runeIndex: page32.indices[67], gpPrime: rightPrime },
    zL,
    zR,
    orderL,
    orderR,
    productOfOrders: orderL * orderR,
    quotientPairs: Q.length,
    zeroQuotientPairs: Q.filter(q => q[0] === 0 && q[1] === 0).length,
    header: sourceRunes.slice(0, 2),
    payloadRunes: payload.length,
    rows: 51,
    columns: 127
  },
  baseline: {
    rawIoC: (() => {
      const counts = new Uint32Array(29);
      for (const x of payload) counts[x]++;
      return counts.reduce((s, n) => s + n * (n - 1), 0) / (payload.length * (payload.length - 1));
    })(),
    rawTrigramScore: rawScore,
    rawByteValidity: stats(rows),
    nativeControls: controls
  },
  operations,
  positiveControls,
  randomByteExpectation: 51 * 127 * 256 / 841
};
if (operations.some(x => !x.originalRoundTrip) || positiveControls.some(x => !x.exact || x.canonicalBytes !== x.expectedBytes)) {
  throw new Error('round-trip / positive-control failure');
}
console.log(JSON.stringify(result, null, 2));

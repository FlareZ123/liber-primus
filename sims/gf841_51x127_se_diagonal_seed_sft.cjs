#!/usr/bin/env node
'use strict';

// Source-locked test of the p57-derived SE diagonal as a row seed.
// The 51x127 field register is row-major; D[r] = C[r,r].
// Each row uses the original 127 p39 quotient pairs and the p3 primitive u.
// No phases, rotations, or fitted seeds are searched.

const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const readJSON = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const readText = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const grid = readJSON('resources/liber-primus/lp2-grid-256.json');
const mod = x => ((x % 29) + 29) % 29;
const add = (x, y) => [mod(x[0] + y[0]), mod(x[1] + y[1])];
const sub = (x, y) => [mod(x[0] - y[0]), mod(x[1] - y[1])];
const mulU = x => [mod(8 * x[1]), mod(x[0] + 3 * x[1])];

function quotientPairs(bytes) {
  if (!Array.isArray(bytes) || bytes.length !== 256) throw new Error('expected original 256-byte grid');
  const work = bytes.map(mod), q = [];
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
  const canonical = rows.map(row => row.filter(([a, b]) => 29 * a + b < 256).length);
  const reversed = rows.map(row => row.filter(([a, b]) => a + 29 * b < 256).length);
  const summarize = counts => ({
    fullRows: counts.filter(x => x === 127).length,
    total: counts.reduce((a, b) => a + b, 0),
    min: Math.min(...counts),
    max: Math.max(...counts),
    mean: counts.reduce((a, b) => a + b, 0) / counts.length
  });
  return { canonical: summarize(canonical), reversed: summarize(reversed) };
}
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
  const max = symbols.length - n, values = [];
  for (let i = 0; i < 300; i++) values.push(score(symbols.slice(Math.floor(i * max / 299), Math.floor(i * max / 299) + n), model));
  values.sort((a, b) => a - b);
  return { min: values[0], median: values[149], max: values[299] };
}

const sourceRunes = corpus.pages.filter(p => p.page <= 55).sort((a, b) => a.page - b.page).flatMap(p => p.indices);
if (sourceRunes.length !== 12956 || sourceRunes[0] !== 15 || sourceRunes[1] !== 8) throw new Error('original source/header mismatch');
const payload = sourceRunes.slice(2);
if (payload.length !== 51 * 127 * 2) throw new Error('51x127 pair framing mismatch');
const rows = Array.from({ length: 51 }, (_, r) =>
  Array.from({ length: 127 }, (_, j) => payload.slice(254 * r + 2 * j, 254 * r + 2 * j + 2))
);
const diagonalSeeds = Array.from({ length: 51 }, (_, r) => rows[r][r].slice());
const Q = quotientPairs(grid.bytes);
if (Q.length !== 127) throw new Error('expected 127 quotient pairs');

function decode(outSign, stateSign) {
  return rows.map((row, r) => {
    let state = diagonalSeeds[r].slice();
    return row.map((cipher, j) => {
      const plain = outSign < 0 ? sub(cipher, state) : add(cipher, state);
      const advanced = mulU(state);
      state = stateSign < 0 ? sub(advanced, Q[j]) : add(advanced, Q[j]);
      return plain;
    });
  });
}
function encode(plainRows, outSign, stateSign) {
  return plainRows.map((row, r) => {
    let state = diagonalSeeds[r].slice();
    return row.map((plain, j) => {
      const cipher = outSign < 0 ? add(plain, state) : sub(plain, state);
      const advanced = mulU(state);
      state = stateSign < 0 ? sub(advanced, Q[j]) : add(advanced, Q[j]);
      return cipher;
    });
  });
}

const shakespeare = nativeGP(readText('resources/control/shakespeare_first300k.txt'));
const gibran = nativeGP(readText('resources/control/gibran_prophet_58585.txt'));
const emerson = nativeGP(readText('resources/control/emerson_essays_2944.txt'));
const model = train(shakespeare);
const controls = {
  shakespeare: windowStats(shakespeare, model, payload.length),
  gibran: windowStats(gibran, model, payload.length),
  emerson: windowStats(emerson, model, payload.length)
};
const operations = [];
for (const outSign of [-1, 1]) {
  for (const stateSign of [-1, 1]) {
    const plainRows = decode(outSign, stateSign);
    const encodedRows = encode(plainRows, outSign, stateSign);
    const flat = plainRows.flat(2);
    const counts = new Uint32Array(29);
    for (const x of flat) counts[x]++;
    operations.push({
      outSign,
      stateSign,
      byteValidity: stats(plainRows),
      trigramScore: score(flat, model),
      ioc: counts.reduce((s, n) => s + n * (n - 1), 0) / (flat.length * (flat.length - 1)),
      originalRoundTrip: encodedRows.every((row, r) =>
        row.every((pair, j) => pair[0] === rows[r][j][0] && pair[1] === rows[r][j][1])
      )
    });
  }
}

// Positive controls hold the extracted diagonal seeds fixed and verify the recurrence inverse.
const plantBytes = Array.from({ length: 51 * 127 }, (_, i) => (73 * i + 41) % 256);
const plantRows = Array.from({ length: 51 }, (_, r) =>
  Array.from({ length: 127 }, (_, j) => {
    const b = plantBytes[r * 127 + j];
    return [Math.floor(b / 29), b % 29];
  })
);
const positiveControls = [];
for (const outSign of [-1, 1]) {
  for (const stateSign of [-1, 1]) {
    const encrypted = encode(plantRows, outSign, stateSign);
    // Decode the plant with the same fixed diagonal key sequence.
    const recovered = encrypted.map((row, r) => {
      let state = diagonalSeeds[r].slice();
      return row.map((cipher, j) => {
        const plain = outSign < 0 ? sub(cipher, state) : add(cipher, state);
        const advanced = mulU(state);
        state = stateSign < 0 ? sub(advanced, Q[j]) : add(advanced, Q[j]);
        return plain;
      });
    });
    positiveControls.push({
      outSign,
      stateSign,
      exact: recovered.every((row, r) =>
        row.every((pair, j) => pair[0] === plantRows[r][j][0] && pair[1] === plantRows[r][j][1])
      ),
      canonicalBytes: recovered.flat().filter(([a, b]) => 29 * a + b < 256).length
    });
  }
}

const rawCounts = new Uint32Array(29);
for (const x of payload) rawCounts[x]++;
console.log(JSON.stringify({
  source: {
    header: sourceRunes.slice(0, 2),
    payloadRunes: payload.length,
    rows: 51,
    columns: 127,
    diagonalCells: 51,
    diagonalSeeds: diagonalSeeds.map(pair => pair.map(x => corpus.translit[x]).join(' '))
  },
  baseline: {
    rawByteValidity: stats(rows),
    rawIoC: rawCounts.reduce((s, n) => s + n * (n - 1), 0) / (payload.length * (payload.length - 1)),
    rawTrigramScore: score(payload, model),
    nativeControls: controls
  },
  operations,
  positiveControls
}, null, 2));
if (operations.some(x => !x.originalRoundTrip) || positiveControls.some(x => !x.exact || x.canonicalBytes !== 51 * 127)) {
  throw new Error('round-trip / positive-control failure');
}

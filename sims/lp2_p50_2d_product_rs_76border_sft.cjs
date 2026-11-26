#!/usr/bin/env node
'use strict';

// Exact source test for a systematic 2-D Reed–Solomon product code.
// The 30x6 interior is the data rectangle; the 76-cell one-cell border
// consists of two horizontal and two vertical parity symbols.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const tokens = source.pages.flatMap(page => page.tokens);
assert.strictEqual(tokens.length, 256);
assert.deepStrictEqual(source.pages.map(page => [page.rows, page.cols]), [[10, 8], [13, 8], [9, 8]]);

const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');

function decodeTokens(alphabet) {
  return tokens.map(token => {
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0, 'token outside selected alphabet: ' + token);
    return hi * alphabet.length + lo;
  });
}

const values60 = decodeTokens(alphabet60);
const values59 = decodeTokens(alphabet59);
assert.deepStrictEqual(values60, source.bytes, 'base60 decode must reproduce canonical source bytes');

function add(a, b, field) {
  return field.kind === '257' ? (a + b) % 257 : (a ^ b);
}
function sub(a, b, field) {
  return field.kind === '257' ? (a - b + 257) % 257 : (a ^ b);
}
function mul(a, b, field) {
  if (field.kind === '257') return (a * b) % 257;
  let out = 0;
  while (b) {
    if (b & 1) out ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 0x100) a ^= field.poly;
  }
  return out;
}
function pow(a, n, field) {
  let out = 1;
  while (n) {
    if (n & 1) out = mul(out, a, field);
    a = mul(a, a, field);
    n >>>= 1;
  }
  return out;
}
function inv(a, field) {
  assert.notStrictEqual(a, 0, 'zero has no multiplicative inverse');
  return pow(a, field.kind === '257' ? 255 : 254, field);
}
function evaluateLagrange(xs, ys, x, field) {
  let out = 0;
  for (let i = 0; i < xs.length; i++) {
    let numerator = 1;
    let denominator = 1;
    for (let j = 0; j < xs.length; j++) {
      if (j === i) continue;
      numerator = mul(numerator, sub(x, xs[j], field), field);
      denominator = mul(denominator, sub(xs[i], xs[j], field), field);
    }
    const basis = mul(numerator, inv(denominator, field), field);
    out = add(out, mul(ys[i], basis, field), field);
  }
  return out;
}

function predictBorder(flat, field, order) {
  assert.strictEqual(flat.length, 256);
  const grid = Array.from({ length: 32 }, () => Array(8).fill(null));

  // Freeze the printed interior: rows 1..30, columns 1..6.
  for (let y = 1; y <= 30; y++) {
    for (let x = 1; x <= 6; x++) grid[y][x] = flat[y * 8 + x];
  }

  if (order === 'row-first') {
    // Each interior row is an RS(8,6) word: predict its two side symbols.
    for (let y = 1; y <= 30; y++) {
      const xs = [1, 2, 3, 4, 5, 6];
      const ys = xs.map(x => grid[y][x]);
      grid[y][0] = evaluateLagrange(xs, ys, 0, field);
      grid[y][7] = evaluateLagrange(xs, ys, 7, field);
    }
    // Each completed column is an RS(32,30) word: predict top and bottom.
    for (let x = 0; x < 8; x++) {
      const ys = Array.from({ length: 30 }, (_, i) => i + 1);
      const values = ys.map(y => grid[y][x]);
      grid[0][x] = evaluateLagrange(ys, values, 0, field);
      grid[31][x] = evaluateLagrange(ys, values, 31, field);
    }
  } else if (order === 'column-first') {
    // Same tensor-product interpolation in the opposite order.
    for (let x = 1; x <= 6; x++) {
      const ys = Array.from({ length: 30 }, (_, i) => i + 1);
      const values = ys.map(y => grid[y][x]);
      grid[0][x] = evaluateLagrange(ys, values, 0, field);
      grid[31][x] = evaluateLagrange(ys, values, 31, field);
    }
    for (let y = 0; y < 32; y++) {
      const xs = [1, 2, 3, 4, 5, 6];
      const values = xs.map(x => grid[y][x]);
      grid[y][0] = evaluateLagrange(xs, values, 0, field);
      grid[y][7] = evaluateLagrange(xs, values, 7, field);
    }
  } else {
    throw new Error('unknown interpolation order');
  }

  const border = [];
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 8; x++) {
      if (y === 0 || y === 31 || x === 0 || x === 7) {
        border.push({ y, x, predicted: grid[y][x], actual: flat[y * 8 + x] });
      }
    }
  }
  assert.strictEqual(border.length, 76);
  return border;
}

function countMatches(predictions) {
  return predictions.filter(item => item.predicted === item.actual).length;
}
function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state;
  };
}
function makePositivePlant(field) {
  const next = xorshift(0x3301);
  const coefficient = Array.from({ length: 30 }, () =>
    Array.from({ length: 6 }, () => field.kind === '257' ? next() % 257 : next() & 255)
  );
  function evaluateBivariate(x, y) {
    let out = 0;
    for (let j = 29; j >= 0; j--) {
      let row = 0;
      for (let i = 5; i >= 0; i--) {
        row = add(mul(row, x, field), coefficient[j][i], field);
      }
      out = add(mul(out, y, field), row, field);
    }
    return out;
  }
  return Array.from({ length: 32 }, (_, y) =>
    Array.from({ length: 8 }, (_, x) => evaluateBivariate(x, y))
  ).flat();
}

const fields = [
  { name: 'GF(256)/0x11b', kind: '256', poly: 0x11b },
  { name: 'GF(256)/0x11d', kind: '256', poly: 0x11d },
  { name: 'GF(257)', kind: '257', poly: 0 }
];
const originalResults = [];
for (const [radix, values] of [['base60', values60], ['base59-drop-f', values59]]) {
  for (const field of fields) {
    const rowFirst = predictBorder(values, field, 'row-first');
    const columnFirst = predictBorder(values, field, 'column-first');
    assert.deepStrictEqual(
      rowFirst.map(item => item.predicted),
      columnFirst.map(item => item.predicted),
      'tensor-product extension must be independent of interpolation order'
    );
    const matches = countMatches(rowFirst);
    const sideMatches = rowFirst.filter(item => item.y > 0 && item.y < 31 && item.predicted === item.actual).length;
    const topBottomMatches = rowFirst.filter(item => (item.y === 0 || item.y === 31) && item.predicted === item.actual).length;
    originalResults.push({
      radix,
      field: field.name,
      border_matches: matches,
      border_total: 76,
      side_matches,
      side_total: 60,
      top_bottom_matches: topBottomMatches,
      top_bottom_total: 16
    });
  }
}

const positiveControls = [];
for (const field of fields) {
  const plant = makePositivePlant(field);
  const rowFirst = predictBorder(plant, field, 'row-first');
  const columnFirst = predictBorder(plant, field, 'column-first');
  assert.deepStrictEqual(
    rowFirst.map(item => item.predicted),
    columnFirst.map(item => item.predicted)
  );
  const matches = countMatches(rowFirst);
  assert.strictEqual(matches, 76, 'planted bivariate polynomial must recover all border symbols');
  positiveControls.push({ field: field.name, border_matches: matches, border_total: 76 });
}

assert(originalResults.every(result => result.border_matches === 0));
console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-grid-256.json',
  source_tokens: tokens.length,
  shape: '32x8',
  data_rectangle: '30x6 = 180',
  parity_border: '76',
  coordinates: 'x=0..7, y=0..31; interior x=1..6, y=1..30',
  code: 'tensor product RS(8,6) x RS(32,30), bivariate degree <6 in x and <30 in y',
  original: originalResults,
  positive_controls: positiveControls
}, null, 2));

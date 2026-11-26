#!/usr/bin/env node
'use strict';

// Source-locked tests of the p50 76/180 partition against the exact
// 256-rune receiver p55 || p53 || first rune of p54.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const tokens = grid.pages.flatMap(p => p.tokens);
assert(tokens.length === 256, 'expected 256 printed table cells');
assert(grid.pages.map(p => p.rows).join('|') === '10|13|9', 'unexpected physical page split');
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
function decodeToken(token, alphabet, radix) {
  assert(token.length === 2, 'non-two-character token');
  const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0, 'token outside selected alphabet: ' + token);
  return radix * a + b;
}
const bytes60 = tokens.map(t => decodeToken(t, alphabet60, 60));
const bytes59 = tokens.map(t => decodeToken(t, alphabet59, 59));

const perimeter = [];
for (let c = 0; c < 8; c++) perimeter.push(c);
for (let r = 1; r < 32; r++) perimeter.push(r * 8 + 7);
for (let c = 6; c >= 0; c--) perimeter.push(31 * 8 + c);
for (let r = 30; r >= 1; r--) perimeter.push(r * 8);
const interior = [];
for (let r = 1; r < 31; r++) for (let c = 1; c < 7; c++) interior.push(r * 8 + c);
assert(perimeter.length === 76 && interior.length === 180, 'wrong perimeter/interior dimensions');
const order = perimeter.concat(interior);
assert(new Set(order).size === 256, 'perimeter/interior do not partition all cells');

const page = n => corpus.pages.find(p => p.page === n).indices;
const p53 = page(53), p54 = page(54), p55 = page(55);
assert(p53.length === 179 && p54.length > 0 && p54[0] === 24 && p55.length === 76,
  'receiver segment lengths or enlarged red A changed');
const target = p55.concat(p53, [p54[0]]);
assert(target.length === 256, 'receiver must contain exactly 256 runes');
const translit = n => corpus.translit[n] === undefined ? '[' + n + ']' : corpus.translit[n];
const render = a => a.map(translit).join('');
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) { if (x >= 0 && x < 29) f[x]++; }
  return f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

// Read the candidate key as the outer ring clockwise from top-left, then
// the 30x6 interior in row-major order. Test direct GP29 projections only.
function directPad(bytes, projection, sign) {
  const out = target.map((c, i) => {
    const raw = bytes[order[i]];
    const k = projection === 'mod29' ? raw % 29 : raw & 31;
    return (c + sign * k + 29 * 2) % 29;
  });
  return { ioc: ioc(out), text: render(out) };
}
function xorPad(bytes) {
  const out = target.map((c, i) => c ^ (bytes[order[i]] & 31));
  return { invalid: out.filter(x => x > 28).length, ioc: ioc(out), text: render(out) };
}

// Each physical row has eight distinct tokens. Their ascending numeric
// order is identical under both candidate radices.
const rows = Array.from({ length: 32 }, (_, r) => tokens.slice(r * 8, r * 8 + 8));
const rowPerms60 = rows.map(row => row.map((token, i) => ({ token, i, value: decodeToken(token, alphabet60, 60) }))
  .sort((a, b) => a.value - b.value).map(x => x.i));
const rowPerms59 = rows.map(row => row.map((token, i) => ({ token, i, value: decodeToken(token, alphabet59, 59) }))
  .sort((a, b) => a.value - b.value).map(x => x.i));
assert(rowPerms60.every((p, i) => p.join(',') === rowPerms59[i].join(',')), 'row order depends on radix');
assert(rows.every(row => new Set(row).size === 8), 'a row contains a repeated token');

function rowTransform(input, inverse, descending) {
  const out = Array(256);
  for (let r = 0; r < 32; r++) {
    const p = descending ? rowPerms60[r].slice().reverse() : rowPerms60[r];
    for (let j = 0; j < 8; j++) {
      if (inverse) out[r * 8 + p[j]] = input[r * 8 + j];
      else out[r * 8 + j] = input[r * 8 + p[j]];
    }
  }
  return out;
}
for (const descending of [false, true]) {
  const forward = rowTransform(target, false, descending);
  const restored = rowTransform(forward, true, descending);
  assert(restored.every((x, i) => x === target[i]), 'row permutation inverse failed');
  const inverse = rowTransform(target, true, descending);
  const restored2 = rowTransform(inverse, false, descending);
  assert(restored2.every((x, i) => x === target[i]), 'inverse row permutation failed');
}

const bytePads = {};
for (const [name, bytes] of [['base60', bytes60], ['base59-drop-f', bytes59]]) {
  bytePads[name] = {
    mod29_subtract: directPad(bytes, 'mod29', -1),
    mod29_add: directPad(bytes, 'mod29', 1),
    low5_subtract: directPad(bytes, 'low5', -1),
    low5_add: directPad(bytes, 'low5', 1),
    low5_xor: xorPad(bytes)
  };
}
const rowResults = {
  ascending_gather: rowTransform(target, false, false),
  ascending_inverse: rowTransform(target, true, false),
  descending_gather: rowTransform(target, false, true),
  descending_inverse: rowTransform(target, true, true)
};
const rowsRendered = Object.fromEntries(Object.entries(rowResults).map(([k, v]) => [k, {
  ioc: ioc(v), text: render(v)
}]));

console.log(JSON.stringify({
  source: {
    table_shape: '32x8', table_pages: '10|13|9', cells: 256,
    perimeter_cells: perimeter.length, interior_cells: interior.length,
    perimeter_then_interior: true,
    receiver: { p55: p55.length, p53: p53.length, p54_first: 1, total: target.length },
    row_permutations_radix_invariant: true,
    row_unique: true,
    original_receiver_ioc: ioc(target)
  },
  direct_byte_pad: bytePads,
  rowwise_rank_transposition: {
    permutations: rowPerms60.map(p => p.join('')),
    outputs: rowsRendered
  }
}, null, 2));

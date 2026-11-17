#!/usr/bin/env node
'use strict';
/**
 * Original LP2 p55 and source p50 ranked 5x5: bounded two-square/four-square gate.
 * Read-only Windows 11 / Node 22 single-file test. Source squareness and
 * the GP25 projection are hypotheses; no cryptographic key is authenticated.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} file @returns {any} */
function read(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', file), 'utf8'));
}
const corpus = read('lp2-corpus.json');
const grid = read('base60-grid.json');
const latin = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
const original = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(original.length, 76);
const support = [...new Set(original)].sort((a, b) => a - b);
assert.equal(support.length, 25);
assert.deepEqual(Array.from({ length: 29 }, (_, i) => i).filter((i) => !support.includes(i)), [3, 9, 16, 26]);
const cipher = original.map((n) => latin[support.indexOf(n)]).join('');

const cells = grid.rows.flat();
assert.equal(cells.length, 256);
const tokens = Array.from({ length: 25 }, (_, i) => cells[(21 + Math.floor(i / 5)) * 8 + 1 + i % 5]);
const values = tokens.map((t) => grid.alphabet.length * grid.alphabet.indexOf(t[0]) + grid.alphabet.indexOf(t[1]));
assert.equal(new Set(values).size, 25);

/** @param {boolean} descending @param {number} orientation */
function rankedKey(descending, orientation) {
  const order = Array.from({ length: 25 }, (_, i) => i)
    .sort((a, b) => descending ? values[b] - values[a] : values[a] - values[b]);
  const chars = Array(25);
  order.forEach((pos, rank) => { chars[pos] = latin[rank]; });
  let rows = Array.from({ length: 5 }, (_, i) => chars.slice(5 * i, 5 * i + 5));
  if (orientation >= 4) rows = rows.map((row) => row.slice().reverse());
  for (let turn = 0; turn < orientation % 4; turn++) {
    rows = Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => rows[4 - c][r]));
  }
  return rows.flat().join('');
}
/** @param {string} square @param {string} ch @returns {[number, number]} */
function coord(square, ch) {
  const n = square.indexOf(ch);
  assert(n >= 0);
  return [Math.floor(n / 5), n % 5];
}
/**
 * Conventional four-square: ciphertext symbols are read in top-right and
 * bottom-left squares. Plaintext symbols are in both unkeyed diagonals.
 * @param {string} s @param {string} tr @param {string} bl
 */
function fourDecrypt(s, tr, bl) {
  assert.equal(s.length % 2, 0);
  let out = '';
  for (let i = 0; i < s.length; i += 2) {
    const [r1, c1] = coord(tr, s[i]);
    const [r2, c2] = coord(bl, s[i + 1]);
    out += latin[5 * r1 + c2] + latin[5 * r2 + c1];
  }
  return out;
}
/** @param {string} s @param {string} tr @param {string} bl */
function fourEncrypt(s, tr, bl) {
  assert.equal(s.length % 2, 0);
  let out = '';
  for (let i = 0; i < s.length; i += 2) {
    const [r1, c1] = coord(latin, s[i]);
    const [r2, c2] = coord(latin, s[i + 1]);
    out += tr[5 * r1 + c2] + bl[5 * r2 + c1];
  }
  return out;
}
/**
 * Two-square rectangle involution. Swapped rows or swapped columns gives
 * the two conventional axis orientations. The same operation reverses it.
 * @param {string} s @param {string} a @param {string} b @param {boolean} swapRows
 */
function twoSquare(s, a, b, swapRows) {
  assert.equal(s.length % 2, 0);
  let out = '';
  for (let i = 0; i < s.length; i += 2) {
    const [r1, c1] = coord(a, s[i]);
    const [r2, c2] = coord(b, s[i + 1]);
    out += swapRows ? a[5 * r2 + c1] + b[5 * r1 + c2]
      : a[5 * r1 + c2] + b[5 * r2 + c1];
  }
  return out;
}
/** @param {string} s */
function ioc(s) {
  const counts = Array(25).fill(0);
  for (const ch of s) counts[latin.indexOf(ch)]++;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0) / (s.length * (s.length - 1));
}
const plant = 'THEPRIMESARESACREDANDTHEREISASTORYUNDERTHESURFACE'.repeat(2).slice(0, 76);
assert.equal(plant.length, 76);
const trials = [];
for (const descending of [false, true]) {
  for (let orientation = 0; orientation < 8; orientation++) {
    const key = rankedKey(descending, orientation);
    assert.equal(new Set(key).size, 25);
    for (let placement = 0; placement < 4; placement++) {
      const tr = placement & 1 ? key : latin;
      const bl = placement & 2 ? key : latin;
      const plain = fourDecrypt(cipher, tr, bl);
      assert.equal(fourEncrypt(plain, tr, bl), cipher);
      assert.equal(fourDecrypt(fourEncrypt(plant, tr, bl), tr, bl), plant);
      trials.push({ type: 'four-square', descending, orientation, placement,
        ioc: ioc(plain), text: plain });
      for (const swapRows of [false, true]) {
        const out = twoSquare(cipher, tr, bl, swapRows);
        assert.equal(twoSquare(out, tr, bl, swapRows), cipher);
        assert.equal(twoSquare(twoSquare(plant, tr, bl, swapRows), tr, bl, swapRows), plant);
        trials.push({ type: 'two-square', descending, orientation, placement, swapRows,
          ioc: ioc(out), text: out });
      }
    }
  }
}
assert.equal(trials.length, 192);
const maxIoc = Math.max(...trials.map((t) => t.ioc));
assert.equal(maxIoc, 0.04736842105263158, 'Frozen original source regression');
const best = (type) => trials.filter((t) => t.type === type)
  .sort((a, b) => b.ioc - a.ioc)[0];
console.log(JSON.stringify({
  original: 'physical LP2 p55, 76 runes; physical p50 ranked 5x5, row21..25 col1..5',
  GP25Projection: 'observed p55 alphabet mapped to alphabetic Latin25, not author-selected',
  trials: { fourSquare: 64, twoSquare: 128, distinctPlaintexts: new Set(trials.map((t) => t.text)).size },
  squareOrientations: 8,
  numericalRankDirections: 2,
  sourceCipherReencryption: 'PASS 192/192',
  nativePlaintextPlantedControls: 'PASS 192/192',
  bestFourSquare: best('four-square'),
  bestTwoSquare: best('two-square'),
  maxIoc,
  result: 'No coherent p55 plaintext in this finite source-derived square family'
}, null, 2));

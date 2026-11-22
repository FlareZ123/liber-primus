'use strict';

/**
 * Original center-page 13x8 table with independent historical GP29 key lengths.
 * Fixed byte inverses and GP29 native-code inverses, plus exact plants.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const center = grid.pages.find(page => page.page === 50);
assert.equal(center.rows, 13);
assert.equal(center.cols, 8);
assert.equal(center.tokens.length, 104);

const alpha60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alpha59 = alpha60.replace('f', '');
const K13 = 'FIRFUMFERENFE';
const K8 = 'DIUINITY';
const gp13 = [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18];
const gp8 = [23, 10, 1, 10, 9, 10, 16, 26];
const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109];
assert.equal(K13.length, center.rows);
assert.equal(K8.length, center.cols);
assert.deepEqual(gp13.map(i => corpus.translit[i]).join(''), K13);
assert.deepEqual(gp8.map(i => corpus.translit[i]).join(''), K8);
const source60 = center.tokens.map(t => 60 * alpha60.indexOf(t[0]) + alpha60.indexOf(t[1]));
const source59 = center.tokens.map(t => 59 * alpha59.indexOf(t[0]) + alpha59.indexOf(t[1]));
assert.deepEqual(source60, center.bytes);

const keys = [
  { name: 'latin', row: Array.from(K13, x => x.charCodeAt(0)), col: Array.from(K8, x => x.charCodeAt(0)) },
  { name: 'gp', row: gp13, col: gp8 },
  { name: 'prime', row: gp13.map(x => primes[x]), col: gp8.map(x => primes[x]) },
];
const byteModes = ['xor', 'plus', 'minus', 'rowMinusCol', 'colMinusRow', 'keyMinusByte'];

/** @param {number} b @param {number} r @param {number} c @param {string} op */
function decodeByte(b, r, c, op) {
  let v;
  switch (op) {
    case 'xor': v = b ^ r ^ c; break;
    case 'plus': v = b + r + c; break;
    case 'minus': v = b - r - c; break;
    case 'rowMinusCol': v = b + r - c; break;
    case 'colMinusRow': v = b - r + c; break;
    case 'keyMinusByte': v = r + c - b; break;
    default: throw new Error(op);
  }
  return (v % 256 + 256) % 256;
}
function printable(v) { return v >= 32 && v <= 126; }
function runLength(a) {
  let run = 0, max = 0;
  for (const v of a) {
    run = printable(v) ? run + 1 : 0;
    max = Math.max(max, run);
  }
  return max;
}
let bestPrint = 0, bestRun = 0, tested = 0, winners = [];
for (const [radix, bytes] of [['base60', source60], ['base59', source59]]) {
  for (const k of keys) {
    for (const op of byteModes) {
      const out = bytes.map((b, i) => decodeByte(b, k.row[Math.floor(i / 8)], k.col[i % 8], op));
      const print = out.filter(printable).length;
      const maxRun = runLength(out);
      tested++;
      bestRun = Math.max(bestRun, maxRun);
      if (print > bestPrint) { bestPrint = print; winners = []; }
      if (print === bestPrint) winners.push(radix + '/' + k.name + '/' + op);
    }
  }
}
assert.equal(tested, 36);
assert.equal(bestPrint, 47);
assert.equal(bestRun, 6);
assert.ok(winners.includes('base60/gp/keyMinusByte'));
assert.ok(winners.includes('base59/gp/keyMinusByte'));

/** @param {number} x */
function mod29(x) { return (x % 29 + 29) % 29; }
const gpModes = [
  (b, r, c) => mod29(b - r - c),
  (b, r, c) => mod29(b + r + c),
  (b, r, c) => mod29(b - r + c),
  (b, r, c) => mod29(b + r - c),
];
let bestIoc = 0;
for (const bytes of [source60, source59]) {
  for (const decoder of gpModes) {
    const runes = bytes.map((b, i) => decoder(b, gp13[Math.floor(i / 8)], gp8[i % 8]));
    const counts = Array(29).fill(0);
    runes.forEach(r => counts[r]++);
    const pairs = counts.reduce((sum, n) => sum + n * (n - 1), 0);
    bestIoc = Math.max(bestIoc, pairs / (104 * 103));
  }
}
assert.ok(Math.abs(bestIoc - 0.0412621359223301) < 1e-13);

// Full-length byte-message plant under the source-selected 13x8 GP key values.
const plantedSentence = 'WITHIN THE CIRCUMFERENCE FIND DIVINITY ';
const clearByte = Array.from({ length: 104 }, (_, i) => plantedSentence.charCodeAt(i % plantedSentence.length));
const encByte = clearByte.map((x, i) => (x + gp13[Math.floor(i / 8)] + gp8[i % 8]) % 256);
const backByte = encByte.map((b, i) => decodeByte(b, gp13[Math.floor(i / 8)], gp8[i % 8], 'minus'));
assert.deepEqual(backByte, clearByte);

// Full-length GP29-message plant, using the independently solved p57's real runes.
const known = [...corpus.pages[57].indices];
assert.equal(known.length, 95);
const clearGP = Array.from({ length: 104 }, (_, i) => known[i % known.length]);
const encGP = clearGP.map((x, i) => mod29(x + gp13[Math.floor(i / 8)] + gp8[i % 8]));
const backGP = encGP.map((b, i) => mod29(b - gp13[Math.floor(i / 8)] - gp8[i % 8]));
assert.deepEqual(backGP, clearGP);

console.log('Center original physical p50:', center.rows, 'rows x', center.cols, 'columns, 104 tokens');
console.log('Independent solved keys:', K13, '/', K8);
console.log('Direct ASCII candidates:', tested, 'maximum printable', bestPrint, '/104, longest run', bestRun);
console.log('Best candidate(s):', winners.join(', '));
console.log('Direct GP29 candidates:', 8, 'highest IoC', bestIoc.toFixed(10));
console.log('Planted original solved-rune and ASCII messages recover 104/104 each.');
console.log('PASS: direct two-dimensional key combination does not recover literal ASCII or native GP prose.');

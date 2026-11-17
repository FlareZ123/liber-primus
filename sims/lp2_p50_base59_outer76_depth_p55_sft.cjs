'use strict';
// The single source-frozen #1334 outer-ring -> graph-depth original p55 inverse.
// Node.js 22, Windows 11, read-only. No graph walk/search/phase fitting.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const tokens = grid.rows.flat();
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(tokens.length, 256);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.ok(tokens.every((t) => !t.includes('f')));

/** @param {string} abc @returns {number[]} */
function addresses(abc) {
  return tokens.map((t) => abc.indexOf(t[0]) * abc.length + abc.indexOf(t[1]));
}

/**
 * Number of directed address transitions to any cyclic state.
 * The one-root base59 graph has a unique zero-depth state at address 189.
 * @param {number[]} graph
 * @returns {number[]}
 */
function depths(graph) {
  assert.ok(graph.every((x) => Number.isInteger(x) && x >= 0 && x < 256));
  const result = Array(256).fill(-1);
  for (let start = 0; start < 256; start++) {
    const visited = new Map();
    const trail = [];
    let position = start;
    while (result[position] < 0 && !visited.has(position)) {
      visited.set(position, trail.length);
      trail.push(position);
      position = graph[position];
    }
    if (visited.has(position)) {
      for (const i of trail.slice(visited.get(position))) result[i] = 0;
    }
    for (let i = trail.length - 1; i >= 0; i--) {
      if (result[trail[i]] < 0) result[trail[i]] = result[graph[trail[i]]] + 1;
    }
  }
  assert.ok(result.every((x) => Number.isInteger(x) && x >= 0));
  return result;
}

/** @param {number} x @returns {number} */
const mod29 = (x) => ((x % 29) + 29) % 29;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}

// Clockwise edge of the *physical* 32-row by 8-column printed table.
const boundary = [];
for (let col = 0; col < 8; col++) boundary.push(col);
for (let row = 1; row < 32; row++) boundary.push(row * 8 + 7);
for (let col = 6; col >= 0; col--) boundary.push(31 * 8 + col);
for (let row = 30; row >= 1; row--) boundary.push(row * 8);
assert.equal(boundary.length, 76);
assert.equal(new Set(boundary).size, 76);
const cipher = corpus.pages[55].indices;
const solvedControl = corpus.pages[57].indices.slice(0, 76);
assert.equal(cipher.length, 76);
assert.equal(solvedControl.length, 76);

for (const [radix, alphabet] of [[59, alphabet59], [60, alphabet60]]) {
  const map = addresses(alphabet);
  const depth = depths(map);
  assert.equal(Math.max(...depth), radix === 59 ? 38 : 24);
  if (radix === 59) {
    assert.equal(map[189], 189);
    assert.equal(depth[189], 0);
  }
  const key = boundary.map((i) => depth[i] % 29);
  for (const sign of [1, -1]) {
    const inverse = cipher.map((x, i) => mod29(x + sign * key[i]));
    assert.deepEqual(
      inverse.map((x, i) => mod29(x - sign * key[i])), cipher);
    const planted = solvedControl.map((x, i) => mod29(x - sign * key[i]));
    assert.deepEqual(planted.map((x, i) => mod29(x + sign * key[i])), solvedControl);
    const text = inverse.map((x) => corpus.translit[x]).join('');
    console.log(JSON.stringify({
      radix, sign, sourceRingLength: boundary.length,
      graphRoot: radix === 59 ? 189 : 'cycles',
      outputIoC: Number(ioc(inverse).toFixed(10)),
      transliteration: text,
      plantedSolvedP57SymbolsRecovered: solvedControl.length,
      originalRunesExactlyReencrypted: cipher.length,
      decision: 'No authentic 76-rune plaintext or key from this frozen direct depth mapping',
    }));
  }
}

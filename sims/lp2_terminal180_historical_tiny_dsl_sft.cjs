'use strict';

/**
 * Frozen 48-program original-source terminal-table DSL gate.
 * Node.js 22, CommonJS, read-only inputs.
 * A bounded test of direct table->GP transport, not a p55 decoder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const bytes = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-grid-256.json'), 'utf8')).bytes;
const mod = (n) => ((n % 29) + 29) % 29;
const nibble = (n) => ((n & 15) << 4) | (n >> 4);

function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let k = 2; k * k <= n; k++) if (n % k === 0) prime = false;
    if (prime) out.push(n);
  }
  return out;
}

function solved56() {
  const C = corpus.pages[56].indices;
  const prime = primes(100);
  let clock = 0;
  const P = C.map((x, i) => {
    if (i === 56) {
      assert.equal(x, 0, 'independent literal F bypass');
      return 0;
    }
    return mod(x - (prime[clock++] - 1));
  });
  assert.equal(clock, 84);
  assert.equal(P.length, 85);
  assert.equal(P.map((x) => corpus.translit[x]).join(''),
    'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
  return P;
}

const row = [];
for (let r = 1; r < 31; r++) for (let c = 1; c < 7; c++) row.push(r * 8 + c);
function ring(depth) {
  const x = [], top = depth, left = depth;
  const bottom = 31 - depth, right = 7 - depth;
  for (let c = left; c <= right; c++) x.push(top * 8 + c);
  for (let r = top + 1; r <= bottom; r++) x.push(r * 8 + right);
  for (let c = right - 1; c >= left; c--) x.push(bottom * 8 + c);
  for (let r = bottom - 1; r > top; r--) x.push(r * 8 + left);
  return x;
}
const shells = [1, 2, 3].flatMap(ring);
assert.deepEqual([ring(0).length, ring(1).length, ring(2).length, ring(3).length],
  [76, 68, 60, 52]);
assert.equal(row.length, 180);
assert.equal(new Set(row).size, 180);
assert.equal(shells.length, 180);
assert.equal(new Set(shells).size, 180);
assert.equal(bytes.length, 256);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[57].indices.length, 95);

const target = solved56().concat(corpus.pages[57].indices);
assert.equal(target.length, 180);

/**
 * Converts source byte positions into runes under one frozen program.
 * @param {number[]} grid
 * @param {number[]} positions
 * @param {'identity'|'nibble'} codec
 * @param {'literal'|'delta'|'cumulative'} mode
 * @param {1|-1} sign
 * @returns {number[]}
 */
function decode(grid, positions, codec, mode, sign) {
  const v = positions.map((p) => mod(codec === 'nibble' ? nibble(grid[p]) : grid[p]));
  let state = 0;
  return v.map((x, i) => {
    if (mode === 'literal') state = x;
    if (mode === 'delta') state = mod(x - (i > 0 ? v[i - 1] : 0));
    if (mode === 'cumulative') state = mod(state + x);
    return mod(sign * state);
  });
}

const results = [];
for (const [walk, positions] of [['row', row], ['rings', shells]]) {
  for (const direction of [1, -1]) {
    const indices = direction === 1 ? positions : [...positions].reverse();
    for (const codec of ['identity', 'nibble']) {
      for (const mode of ['literal', 'delta', 'cumulative']) {
        for (const sign of [1, -1]) {
          const output = decode(bytes, indices, codec, mode, sign);
          const score = (from, until) => output.slice(from, until)
            .reduce((s, v, j) => s + Number(v === target[from + j]), 0);
          results.push({
            walk, direction, codec, mode, sign,
            training85: score(0, 85),
            heldout95: score(85, 180),
            total180: score(0, 180)
          });
        }
      }
    }
  }
}
assert.equal(results.length, 48);
results.sort((a, b) =>
  b.training85 - a.training85 || b.heldout95 - a.heldout95);
assert.equal(results[0].training85, 8);
assert.equal(results[0].heldout95, 5);
assert.equal(Math.max(...results.map((r) => r.heldout95)), 7);
assert.equal(Math.max(...results.map((r) => r.total180)), 13);

// Independent native-plaintext controls: generate a 180-byte table
// from actual p57 symbols under each linear stream mode and verify
// that the corresponding terminal decoder reproduces every rune.
const plant = Array.from({length: 180}, (_, i) =>
  corpus.pages[57].indices[i % 95]);
for (const codec of ['identity', 'nibble']) {
  for (const mode of ['literal', 'delta', 'cumulative']) {
    for (const sign of [1, -1]) {
      const correct = plant.map((v) => mod(sign * v));
      const raw = correct.map((v, i) => mode === 'literal' ? v :
        mode === 'delta' ?
          mod(correct.slice(0, i + 1).reduce((s, y) => s + y, 0)) :
          mod(v - (i ? correct[i - 1] : 0)));
      const synthetic = Array(256).fill(0);
      row.forEach((location, i) => {
        synthetic[location] = codec === 'nibble' ? nibble(raw[i]) : raw[i];
      });
      assert.deepEqual(decode(synthetic, row, codec, mode, sign), plant);
    }
  }
}
console.log(JSON.stringify({
  originalTableCells: bytes.length,
  knownP56: 85, knownP57: 95,
  originalPrograms: results.length,
  trueNativePositivePlants: 12,
  selection: 'maximize exact p56 first85 match, freeze, then score p57 last95',
  bestOriginalProgram: results[0],
  maxHeldout95AcrossAllPrograms: Math.max(...results.map((r) => r.heldout95)),
  maxTotal180AcrossAllPrograms: Math.max(...results.map((r) => r.total180)),
  allResults: results
}, null, 2));

'use strict';
/**
 * Source-typed reconstruction of last five ORIGINAL p50 table bytes.
 * Independent original clues: 2013 signed H over GF29, p39 red G,
 * source-derived DH carry [A,g,b,K], LP2 p23 rune count 213, p0 GF257.
 *
 * This is an in-sample finite parity compatibility test, NOT blind evidence
 * or plaintext recovery. No tunable offsets, phases, plaintext scores.
 * Windows Node 22 CommonJS; read-only, zero external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative */
const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const table = grid.byte_rows.flat();
const M = 841;
const P = 257;
const START = 251;
const H = [3, 26, 24]; // authenticated 2013 BASE29 quadratic, ascending.
const red = ink.pages.find(p => p.page === 39).red_spans[0];
assert.equal(red.runes, 'ᛡᚳᛋ');
assert.equal(red.start, 119);
const G = Array.from(red.runes, r => corpus.runes.indexOf(r));
assert.deepEqual(G, [27, 5, 15]);
const divisors = [H, G];
/** @param {number} x @param {number} [modulus] */
function mod(x, modulus = M) { return (x % modulus + modulus) % modulus; }
/** @param {number} a @param {number} [modulus] */
function inverse(a, modulus = M) {
  let [oldR, r] = [modulus, mod(a, modulus)];
  let [oldT, t] = [0, 1];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldT, t] = [t, oldT - q * t];
  }
  assert.equal(oldR, 1, 'Pivot must be a unit modulo 29²');
  return mod(oldT, modulus);
}
/**
 * Remainder of descending high-first polynomial by ascending quadratic.
 * Returns [constant, X] mod M, preserving original byte lifts.
 * @param {number[]} values @param {number[]} d
 */
function remainder(values, d) {
  const iv = inverse(d[2]);
  let r0 = 0, r1 = 0;
  for (const value of values) {
    [r0, r1] = [mod(value - r1 * d[0] * iv),
                mod(r0 - r1 * d[1] * iv)];
  }
  return [r0, r1];
}
/** @param {number[]} values */
const allRemainders = values => divisors.flatMap(d => remainder(values, d));
/** @param {number[]} values @param {number} base */
function evaluate(values, base) {
  return values.reduce((acc, v) => mod(acc * base + v, P), 0);
}
/** @param {number[][]} matrix @param {number[]} rhs */
function solveFour(matrix, rhs) {
  const a = matrix.map((row, i) => [...row, mod(rhs[i])]);
  for (let col = 0; col < 4; col += 1) {
    let pivot = col;
    while (pivot < 4 && a[pivot][col] % 29 === 0) pivot += 1;
    assert.ok(pivot < 4, 'Printed quadratics have a nonsingular tail matrix');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const factor = inverse(a[col][col]);
    for (let j = col; j < 5; j += 1) a[col][j] = mod(a[col][j] * factor);
    for (let i = 0; i < 4; i += 1) {
      if (i === col) continue;
      const z = a[i][col];
      for (let j = col; j < 5; j += 1) {
        a[i][j] = mod(a[i][j] - z * a[col][j]);
      }
    }
  }
  return a.map(row => row[4]);
}

// The source-derived 2013 DH register [A=8,g=5,b=15,K=2]
// specifies the original reported X and constant carry digits. This
// assignment was discovered after seeing the full table; it is NOT a
// preregistered target. [H_const,H_X,G_const,G_X], modulo 29²:
const target = [29 * 5, 29 * 8, 29 * 2, 29 * 15];
assert.deepEqual(target, [145, 232, 58, 435]);
assert.equal(corpus.pages[23].indices.length, 213);
assert.equal(table.length, 256);
assert.equal(grid.rows.length, 32);
assert.equal(grid.rows[0].length, 8);
assert.ok(table.every(x => Number.isInteger(x) && x >= 0 && x <= 255));

// No inspection of the last five values until AFTER inverse completion.
const prefix = table.slice(0, START);
const blank = prefix.concat(Array(5).fill(0));
const base = allRemainders(blank);
const basis = Array.from({ length: 5 }, (_, i) => {
  const vector = Array(256).fill(0);
  vector[START + i] = 1;
  return allRemainders(vector);
});
const columns = Array.from({ length: 4 },
  (_, i) => Array.from({ length: 5 }, (_, j) => basis[j][i]));
const matrix = columns.map(row => row.slice(1));
const candidates = [];
for (let first = 0; first <= 255; first += 1) {
  const rhs = target.map((t, i) => mod(t - base[i] - columns[i][0] * first));
  const rest = solveFour(matrix, rhs);
  if (rest.every(v => v >= 0 && v <= 255)) {
    const tail = [first, ...rest];
    const reconstructed = prefix.concat(tail);
    assert.deepEqual(allRemainders(reconstructed), target);
    candidates.push({ tail, root213: evaluate(reconstructed, 213) });
  }
}
assert.deepEqual(candidates, [
  {tail: [30, 177, 46, 71, 35], root213: 128},
  {tail: [230, 180, 36, 189, 80], root213: 0}
]);
const winners = candidates.filter(x => x.root213 === 0);
assert.equal(winners.length, 1);
assert.deepEqual(winners[0].tail, table.slice(START));
assert.deepEqual(grid.rows.flat().slice(START), ['3o', '30', '0a', '39', '1K']);

// Exact GF29 factor positivity, independent of what root213 says.
assert.deepEqual(allRemainders(table).map(v => v % 29), [0, 0, 0, 0]);
// Exactly one original p50 GF257 root and the selected p23 count.
assert.deepEqual(Array.from({length:P}, (_,i)=>i)
  .filter(x => evaluate(table, x) === 0), [213]);
console.log(JSON.stringify({
  claim:'Joint GF(29²) H/G DH-carry and GF257 root213 five-byte tail closure',
  source:{prefixLength:START,tableLength:256,tailLength:5,
    p23Runes:213,H,G,target,tailStartCell:251},
  candidateTailsBeforeRoot:candidates,
  uniqueRoot213Tail:winners[0].tail,
  unchangedPrintedTokens:grid.rows.flat().slice(START),
  controls:{
    historicalSourceTargetsPostObserved:true,
    fiveOriginalByteMatches:5,
    sourcePolynomialRootUnique:213,
    originalHAndGmod29Divisible:true
  },
  conclusion:'Exact in-sample cross-modulus closure; no independent plaintext/key, no authenticated checksum opcode'
}, null, 2));

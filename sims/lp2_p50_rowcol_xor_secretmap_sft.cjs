'use strict';

/**
 * SFT: original 32x8 table as an unknown GP29-byte codebook plus independently
 * unknown row/column XOR masks, with the 180 known p56/p57 runes as training.
 * Run with Node.js 22 from any working directory; all source paths are relative
 * to this script. Read-only, deterministic, exact GF(2) elimination.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const table = read('resources/liber-primus/base60-grid.json').byte_rows;
assert.equal(table.length, 32);
assert.ok(table.every((row) => row.length === 8 && row.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)));
const p56 = corpus.pages.find((p) => p.page === 56).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.equal(p56[56], 0);

function firstPrimes(count) {
  const values = [];
  for (let n = 2; values.length < count; n++) {
    if (values.every((p) => n % p !== 0)) values.push(n);
  }
  return values;
}

// Authentic p56 prime-totient decoder: plaintext F is a literal bypass at 56.
const primes = firstPrimes(84);
const plain56 = [];
let keyPosition = 0;
for (let i = 0; i < p56.length; i++) {
  if (i === 56) plain56.push(0);
  else plain56.push((p56[i] - ((primes[keyPosition++] - 1) % 29) + 29) % 29);
}
assert.equal(keyPosition, 84);
assert.deepEqual(plain56.slice(0, 5), [24, 9, 18, 9, 23]); // AN END
assert.deepEqual(p57.slice(0, 7), [13, 24, 4, 24, 17, 20, 18]); // PARABLE

const rowMajor = [];
for (let r = 1; r <= 30; r++) {
  for (let c = 1; c <= 6; c++) rowMajor.push([r, c]);
}
function spiral(clockwise) {
  const cells = [];
  let top = 1;
  let bottom = 30;
  let left = 1;
  let right = 6;
  while (top <= bottom && left <= right) {
    if (clockwise) {
      for (let c = left; c <= right; c++) cells.push([top, c]);
      for (let r = top + 1; r <= bottom; r++) cells.push([r, right]);
      if (top < bottom) for (let c = right - 1; c >= left; c--) cells.push([bottom, c]);
      if (left < right) for (let r = bottom - 1; r > top; r--) cells.push([r, left]);
    } else {
      for (let r = top; r <= bottom; r++) cells.push([r, left]);
      for (let c = left + 1; c <= right; c++) cells.push([bottom, c]);
      if (left < right) for (let r = bottom - 1; r >= top; r--) cells.push([r, right]);
      if (top < bottom) for (let c = right - 1; c > left; c--) cells.push([top, c]);
    }
    top++;
    bottom--;
    left++;
    right--;
  }
  assert.equal(cells.length, 180);
  assert.equal(new Set(cells.map(([r, c]) => r * 8 + c)).size, 180);
  return cells;
}
const cw = spiral(true);
const ccw = spiral(false);
const paths = [
  ['row-major', rowMajor],
  ['row-major-reverse', [...rowMajor].reverse()],
  ['clockwise', cw],
  ['counterclockwise', ccw],
  ['clockwise-reverse', [...cw].reverse()],
  ['counterclockwise-reverse', [...ccw].reverse()],
];

/**
 * Test every possible byte map M[GP29], row pad R[32], column pad C[8].
 * Each known cell imposes T[r,c] = M[P_i] XOR R[r] XOR C[c].
 * The 69 formal unknowns are independent 8-bit values; elimination is over
 * GF(2) with byte-valued right sides. No English score or fitted map required.
 *
 * @param {number[]} known length-180 source GP29 indices
 * @param {number[][]} cells interior coordinates
 * @param {number[][]} bytes 32x8 numeric table
 * @returns {{rank: number, contradictions: number, firstContradiction: number}}
 */
function check(known, cells, bytes) {
  assert.equal(known.length, 180);
  assert.equal(cells.length, 180);
  const pivots = Array(69).fill(null);
  let rank = 0;
  let contradictions = 0;
  let firstContradiction = -1;
  for (let i = 0; i < known.length; i++) {
    const [r, c] = cells[i];
    assert.ok(Number.isInteger(known[i]) && known[i] >= 0 && known[i] < 29);
    let bits = (1n << BigInt(known[i])) ^
      (1n << BigInt(29 + r)) ^
      (1n << BigInt(61 + c));
    let value = bytes[r][c];
    for (let bit = 0; bit < 69; bit++) {
      if ((bits & (1n << BigInt(bit))) === 0n) continue;
      if (pivots[bit] !== null) {
        bits ^= pivots[bit][0];
        value ^= pivots[bit][1];
      } else {
        pivots[bit] = [bits, value];
        rank++;
        break;
      }
    }
    if (bits === 0n && value !== 0) {
      contradictions++;
      if (firstContradiction < 0) firstContradiction = i;
    }
  }
  return { rank, contradictions, firstContradiction };
}

// Source-native positive: planted table obeys a secret, nonstandard 29-byte
// codebook and independent row/column XOR masks; decoder must accept exactly.
const knownSolved = plain56.concat(p57);
const planted = table.map((row) => [...row]);
const secretMap = Array.from({ length: 29 }, (_, i) => (i * 73 + 7) & 255);
for (let i = 0; i < rowMajor.length; i++) {
  const [r, c] = rowMajor[i];
  planted[r][c] = secretMap[knownSolved[i]] ^
    ((r * 67 + 14) & 255) ^ ((c * 37 + 41) & 255);
}
const control = check(knownSolved, rowMajor, planted);
assert.equal(control.contradictions, 0);
assert.equal(control.rank, 57);
console.log('positive plant:', JSON.stringify(control));

const expected = {
  solved: [123, 123, 123, 123, 123, 123],
  cipher: [117, 116, 117, 117, 117, 117],
};
for (const [register, known] of [
  ['solved', knownSolved],
  ['cipher', p56.concat(p57)],
]) {
  paths.forEach(([label, cells], index) => {
    const result = check(known, cells, table);
    assert.equal(result.contradictions, expected[register][index]);
    assert.equal(result.rank, register === 'solved' ? 57 : 63);
    console.log(register, label, JSON.stringify(result));
  });
}
console.log('PASS: no original 180-rune register admits the frozen all-secret 2D XOR decoder.');

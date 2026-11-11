'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const { prime, translit } = corpus;
const mod = (n, m = 29) => ((n % m) + m) % m;
const text = (indices) => indices.map((i) => translit[i]).join('');

const p32 = corpus.pages.find((p) => p.page === 32);
const p55 = corpus.pages.find((p) => p.page === 55);
assert(p32 && p55);
assert.equal(p32.indices.length, 121);
assert.equal(p55.indices.length, 76);
assert.equal(2838 % 121, 55); // possible target-page pointer, not a cipher instruction

// The four interior cells of the HOME→BUDS p32 diagonal are B/M/IA/NG.
const keyPositions = [45, 57, 69, 81];
const keyIndices = keyPositions.map((i) => p32.indices[i]);
assert.deepEqual(keyIndices, [17, 19, 27, 21]);
assert.deepEqual(keyIndices.map((i) => translit[i]), ['B', 'M', 'IA', 'NG']);
const keyPrimes = keyIndices.map((i) => prime[i]);
assert.deepEqual(keyPrimes, [61, 71, 107, 79]);
assert.equal(keyPrimes.reduce((a, b) => a + b, 0), 318);

// Canonical p55 word stream: line-wrap slashes are not word boundaries.
const rawP55 = transcript.split('%')[54].replace(/\/\\s*/gu, '');
const p55Words = rawP55.match(/[\\u16A0-\\u16FF]+/gu) || [];
const p55FullFromWords = p55Words.flatMap((word) => [...word]).map((rune) => runeIndex.get(rune));
assert.deepEqual(p55FullFromWords, p55.indices);
assert.deepEqual(p55Words.map((word) => [...word].length), [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const p55Shed = p55Words.flatMap((word) => [...word].slice(1, -1)).map((rune) => runeIndex.get(rune));
assert.equal(p55Shed.length, 43);

// Fixed direct additive-key interpretations of the four interior runes.
const keyVariants = [
  { name: 'GP ordinal', key: keyIndices },
  { name: 'prime mod 29', key: keyPrimes.map((p) => mod(p)) },
  { name: 'totient(prime) mod 29', key: keyPrimes.map((p) => mod(p - 1)) }
];
const vigenereResults = [];
for (const [scope, cipher] of [['p55 full 76', p55.indices], ['p55 shed 43', p55Shed]]) {
  for (const variant of keyVariants) {
    for (const sign of [-1, 1]) {
      const output = cipher.map((value, i) => mod(value + sign * variant.key[i % 4]));
      vigenereResults.push({ scope, key: variant.name, sign, output: text(output) });
    }
  }
}

// Treat the printed p15 4×4 number table as a Hill-4 key, both raw and
// entrywise Euler-phi residues. This is a bounded direct interpretation.
const p15Square = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
function eulerPhi(n) {
  let result = n;
  let remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p !== 0) continue;
    while (remaining % p === 0) remaining /= p;
    result = (result / p) * (p - 1);
  }
  if (remaining > 1) result = (result / remaining) * (remaining - 1);
  return result;
}
const rawMatrix = p15Square.map((row) => row.map((n) => mod(n)));
const phiMatrix = p15Square.map((row) => row.map((n) => mod(eulerPhi(n))));
function inverseMod(a) {
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error('noninvertible pivot');
}
function transpose(matrix) {
  return matrix[0].map((_, j) => matrix.map((row) => row[j]));
}
function matrixInverse(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => row.map((x) => mod(x)).concat(
    Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
  ));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    if (pivot === n) return null;
    [a[pivot], a[col]] = [a[col], a[pivot]];
    const scale = inverseMod(a[col][col]);
    a[col] = a[col].map((x) => mod(x * scale));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      a[row] = a[row].map((x, j) => mod(x - factor * a[col][j]));
    }
  }
  return a.map((row) => row.slice(n));
}
function leftMultiply(matrix, vector) {
  return matrix.map((row) => mod(row.reduce((sum, x, j) => sum + x * vector[j], 0)));
}
function rightMultiply(vector, matrix) {
  return matrix[0].map((_, j) => mod(vector.reduce((sum, x, i) => sum + x * matrix[i][j], 0)));
}
const hill4Results = [];
for (const [kind, base] of [['raw mod 29', rawMatrix], ['phi(entry) mod 29', phiMatrix]]) {
  for (const [orientation, matrix] of [['printed', base], ['transpose', transpose(base)]]) {
    const inverse = matrixInverse(matrix);
    assert(inverse, kind + ' ' + orientation + ' should be invertible');
    for (const side of ['left', 'right']) {
      const output = [];
      for (let i = 0; i < p55.indices.length; i += 4) {
        const block = p55.indices.slice(i, i + 4);
        output.push(...(side === 'left' ? leftMultiply(inverse, block) : rightMultiply(block, inverse)));
      }
      hill4Results.push({ key: kind, orientation, side, output: text(output) });
    }
  }
}

// Four-column transposition using the interior-rune key's ascending order.
// GP indices [17,19,27,21] and prime weights [61,71,107,79] both give
// column order [0,1,3,2].
function columnar(cipher, order, readMode) {
  const rows = 19;
  const cols = 4;
  const output = Array(rows * cols);
  if (readMode === 'columns') {
    let cursor = 0;
    for (const col of order) {
      for (let row = 0; row < rows; row++) output[row * cols + col] = cipher[cursor++];
    }
  } else {
    for (let row = 0; row < rows; row++) {
      for (let j = 0; j < cols; j++) output[row * cols + order[j]] = cipher[row * cols + j];
    }
  }
  return output;
}
const columnarResults = [];
for (const [keyOrder, order] of [['ascending', [0, 1, 3, 2]], ['reverse', [2, 3, 1, 0]]]) {
  for (const readMode of ['columns', 'rows']) {
    columnarResults.push({ keyOrder, readMode, output: text(columnar(p55.indices, order, readMode)) });
  }
}

const result = {
  status: 'bounded direct-readout negatives; no plaintext recovered',
  p55: { page: 55, runes: p55.indices.length, words: p55Words.length, shedInteriorRunes: p55Shed.length },
  p32InteriorKey: { positions: keyPositions, runes: text(keyIndices), primeWeights: keyPrimes, primeSum: 318 },
  p55Pointer: { selectedBy: '2838 mod 121', residue: 55, pageRuneCount: p55.indices.length },
  vigenereResults,
  hill4Results,
  columnarResults
};
process.stdout.write(JSON.stringify(result, null, 2) + '\\n');

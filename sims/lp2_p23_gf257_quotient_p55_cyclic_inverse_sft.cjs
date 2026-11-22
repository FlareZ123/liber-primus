'use strict';
// Frozen original-cipher test for Director issue #2149.
// GP29 cyclic convolution with first 76 coefficients of GF257 quotient B/(X-213).
// Node.js 22 / CommonJS; read-only, deterministic. No external packages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(base, 'base60-grid.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8');
const source = grid.byte_rows.flat();
const c23 = corpus.pages[23].indices;
const ciphertext = corpus.pages[55].indices;
const solved = corpus.pages[57].indices.slice(0, 76);
const N = 76;

/** @param {number} value @param {number} [modulus] */
function mod(value, modulus = 29) {
  return ((value % modulus) + modulus) % modulus;
}

/** @param {number} value */
function inverse29(value) {
  for (let i = 1; i < 29; i += 1) {
    if (mod(value * i) === 1) return i;
  }
  throw new Error('Noninvertible GP29 pivot');
}

/** @param {number[]} highFirst @param {number} x */
function evaluate(highFirst, x) {
  return highFirst.reduce((acc, v) => mod(acc * x + v, 257), 0);
}

/** @param {number[]} key @param {number[]} plain */
function convolution(key, plain) {
  return Array.from({ length: N }, (_, i) => mod(
    key.reduce((acc, v, j) => acc + v * plain[mod(i - j, N)], 0)
  ));
}

/** @param {number[]} key @param {number[]} enc */
function decrypt(key, enc) {
  const a = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N + 1 }, (_, j) => j === N ? enc[i] : key[mod(i - j, N)])
  );
  for (let col = 0; col < N; col += 1) {
    let pivot = col;
    while (pivot < N && a[pivot][col] === 0) pivot += 1;
    assert.ok(pivot < N, 'Source-selected convolution key must be reversible');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const factor = inverse29(a[col][col]);
    for (let j = col; j <= N; j += 1) a[col][j] = mod(a[col][j] * factor);
    for (let row = 0; row < N; row += 1) {
      if (row === col) continue;
      const rate = a[row][col];
      for (let j = col; j <= N; j += 1) {
        a[row][j] = mod(a[row][j] - rate * a[col][j]);
      }
    }
  }
  return a.map(row => row[N]);
}

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

assert.equal(source.length, 256);
assert.equal(c23.length, 213);
assert.equal(ciphertext.length, N);
assert.equal(solved.length, N);
assert.deepEqual(
  Array.from({ length: 257 }, (_, i) => i).filter(x => evaluate(source, x) === 0),
  [213],
  'The input has changed from the original GF257 root213 table'
);

// Descending/high-first synthetic division by (X - 213), with exact zero remainder.
const quotient = [source[0]];
for (let i = 1; i < 255; i += 1) {
  quotient.push(mod(source[i] + 213 * quotient[i - 1], 257));
}
assert.equal(mod(source[255] + 213 * quotient[254], 257), 0);
const key = quotient.slice(0, N).map(x => mod(x));
assert.deepEqual(key.slice(0, 8), [0, 8, 23, 17, 9, 7, 4, 14]);

// The transcription omits runeless physical p50, so p55 is section54.
// Original / newline is a continuation, and hyphens terminate printed fragments.
const section = transcription.split(/\r?\n%\r?\n/)[54]
  .replace(/\/\r?\n/g, '')
  .replace(/\r?\n/g, '');
const runeSet = new Set(corpus.runes);
const printed = section.split(/[-.&$§]/)
  .map(s => [...s].filter(r => runeSet.has(r)))
  .filter(a => a.length > 0);
const lengths = printed.map(a => a.length);
assert.equal(printed.length, 17);
assert.deepEqual(printed.flat().map(r => corpus.runes.indexOf(r)), ciphertext);
assert.deepEqual(lengths, [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);

// The same fixed unknown-page operation exactly recovers an authentic
// solved-p57 plaintext when it is deliberately encrypted under this key.
const plantedCipher = convolution(key, solved);
assert.deepEqual(decrypt(key, plantedCipher), solved, 'positive control');
const candidate = decrypt(key, ciphertext);
assert.deepEqual(convolution(key, candidate), ciphertext, 'exact original replay');

// No fitting or re-phasing is done on the ciphertext or the held-out tail.
// Segmentation is inherited from the 17 physically printed p55 fragments.
let at = 0;
const words = lengths.map(length => {
  const word = candidate.slice(at, at + length);
  at += length;
  return word.map(x => corpus.translit[x]).join('');
});
assert.equal(at, N);
console.log('p23 original runes:', c23.length);
console.log('p50 exact GF257 root: 213, quotient GF29 prefix, 76 coefficients');
console.log('Original p55 rune count / printed fragments:', N, printed.length);
console.log('Original ciphertext IoC:', ioc(ciphertext).toFixed(9));
console.log('Deconvolved candidate IoC:', ioc(candidate).toFixed(9));
console.log('Authentic p57 native plaintext control IoC:', ioc(solved).toFixed(9));
console.log('Candidate (fixed original word boundaries):', words.join(' '));
console.log('PASS: source-root division, exact 76/76 planted recovery, exact 76/76 original replay');

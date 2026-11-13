'use strict';

/**
 * LP2 original-source SFT: p15 Fibonacci prime-ordinal Hill-4 modulo 28
 * applied to the 28 nonzero predecessor steps in the unsolved rune text.
 * Node.js 22, CommonJS, read-only. No language-driven key/phase fitting.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const MOD = 28;

/** Original p15 physical page / scan 32.jpg, printed layout. */
const PRINTED = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const FIBONACCI = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const SPIRAL = [
  [1, 1], [1, 2], [2, 2], [2, 1],
  [2, 0], [1, 0], [0, 0], [0, 1],
  [0, 2], [0, 3], [1, 3], [2, 3],
  [3, 3], [3, 2], [3, 1], [3, 0]
];
const INVERSE = [
  [12, 1, 4, 17],
  [8, 0, 14, 7],
  [19, 18, 0, 20],
  [7, 16, 1, 18]
];

function primes(count) {
  const found = [];
  for (let n = 2; found.length < count; n += 1) {
    if (found.every((p) => p * p > n || n % p !== 0)) found.push(n);
  }
  return found;
}

/** Exact determinant modulo28, avoiding any large-integer roundoff. */
function determinant28(matrix) {
  if (matrix.length === 1) return ((matrix[0][0] % MOD) + MOD) % MOD;
  const value = matrix[0].reduce((sum, entry, column) => {
    const minor = matrix.slice(1).map((row) => row.filter((_, j) => j !== column));
    return sum + (column % 2 ? -1 : 1) * (entry % MOD) * determinant28(minor);
  }, 0);
  return ((value % MOD) + MOD) % MOD;
}

function buildMatrix() {
  const originalPrimes = primes(FIBONACCI.at(-1) + 1);
  const matrices = Object.fromEntries(['ordinal', 'fibonacci', 'prime', 'printed'].map((key) =>
    [key, Array.from({ length: 4 }, () => Array(4).fill(0))]));
  for (let i = 0; i < 16; i += 1) {
    const [r, c] = SPIRAL[i];
    const ordinal = FIBONACCI[i] + 1;
    const prime = originalPrimes[ordinal - 1];
    assert.equal(PRINTED[r][c], Math.abs(3301 - prime));
    matrices.ordinal[r][c] = ordinal;
    matrices.fibonacci[r][c] = FIBONACCI[i];
    matrices.prime[r][c] = prime;
    matrices.printed[r][c] = PRINTED[r][c];
  }
  const determinants = Object.fromEntries(Object.entries(matrices).map(([name, matrix]) =>
    [name, determinant28(matrix)]));
  assert.deepEqual(determinants, { ordinal: 19, fibonacci: 21, prime: 24, printed: 24 });
  assert.deepEqual(matrices.ordinal.map((row) => row.map(mod28)),
    [[14, 22, 7, 0], [9, 1, 2, 6], [6, 4, 3, 5], [8, 23, 14, 10]]);
  assert.equal(originalPrimes[987], 7817);
  return matrices.ordinal.map((row) => row.map(mod28));
}

function transpose(matrix) {
  return matrix.map((row, i) => row.map((_, j) => matrix[j][i]));
}

function mod28(value) {
  return ((value % MOD) + MOD) % MOD;
}

function multiply(matrix, block) {
  return matrix.map((row) => mod28(row.reduce((sum, m, i) => sum + m * block[i], 0)));
}

function checkInverse(matrix, inverse) {
  for (let column = 0; column < 4; column += 1) {
    const basis = [0, 0, 0, 0];
    basis[column] = 1;
    assert.deepEqual(multiply(inverse, multiply(matrix, basis)), basis);
    assert.deepEqual(multiply(matrix, multiply(inverse, basis)), basis);
  }
}

const A = buildMatrix();
checkInverse(A, INVERSE);
checkInverse(transpose(A), transpose(INVERSE));

const LOG15 = Array(29).fill(-1);
const POWER15 = Array(28).fill(0);
let power = 1;
for (let i = 0; i < 28; i += 1) {
  assert.equal(LOG15[power], -1);
  LOG15[power] = i;
  POWER15[i] = power;
  power = (15 * power) % 29;
}
assert.equal(power, 1);
assert.deepEqual(LOG15.slice(1).slice().sort((a, b) => a - b), Array.from({ length: 28 }, (_, i) => i));

/** Invert a page-anchored or chapter-continuous difference stream, with 0 as an EA marker. */
function ranks(cipher, encoding) {
  const payload = [];
  const markers = [];
  for (let i = 1; i < cipher.length; i += 1) {
    const delta = (cipher[i] - cipher[i - 1] + 29) % 29;
    if (delta === 0) {
      markers.push(i);
    } else {
      payload.push(encoding === 'cyclic' ? delta - 1 : LOG15[delta]);
    }
  }
  return { payload, markers };
}

function decoded(payload, decoder) {
  const output = [];
  for (let i = 0; i + 3 < payload.length; i += 4) {
    output.push(...multiply(decoder, payload.slice(i, i + 4)));
  }
  return output;
}

function ioc(values, symbols = 28) {
  const counts = Array(symbols).fill(0);
  for (const digit of values) {
    assert.ok(digit >= 0 && digit < symbols);
    counts[digit] += 1;
  }
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (values.length * (values.length - 1));
}

const targets = corpus.pages.filter((page) => page.page >= 16 && page.page <= 22);
const all = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
assert.equal(all.length, 55);
assert.equal(all.reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(targets.length, 7);
assert.equal(targets.reduce((sum, page) => sum + page.indices.length, 0), 1744);

const originals = [];
for (const page of all) {
  const { markers, payload } = ranks(page.indices, 'cyclic');
  originals.push({ page: page.page, length: page.indices.length, markers: markers.length, payload: payload.length });
}
assert.equal(originals.reduce((sum, page) => sum + page.markers, 0), 86);
assert.equal(originals.reduce((sum, page) => sum + page.payload, 0), 12815);
assert.equal(targets.reduce((sum, page) => sum + originals.find((r) => r.page === page.page).markers, 0), 10);

/** Exactly source-starting chapter pp16-22, with either page IVs or a single chapter IV. */
const models = [];
for (const encoding of ['cyclic', 'field-power']) {
  for (const orientation of ['printed', 'transpose']) {
    for (const transformation of ['inverse', 'forward']) {
      const decoder = orientation === 'printed'
        ? (transformation === 'inverse' ? INVERSE : A)
        : (transformation === 'inverse' ? transpose(INVERSE) : transpose(A));
      for (const scope of ['page-iv', 'chapter-iv']) {
        const streams = scope === 'page-iv' ? targets.map((page) => page.indices) : [targets.flatMap((page) => page.indices)];
        const parts = streams.map((stream) => ranks(stream, encoding === 'cyclic' ? 'cyclic' : 'field-power'));
        const output = parts.flatMap((part) => decoded(part.payload, decoder));
        const markerCount = parts.reduce((sum, part) => sum + part.markers.length, 0);
        const lost = parts.reduce((sum, part) => sum + part.payload.length % 4, 0);
        assert.equal(output.length + lost + markerCount + streams.length, 1744);
        models.push({
          encoding, orientation, transformation, scope,
          length: output.length, markers: markerCount, trailing: lost,
          ioc: ioc(output),
          opening: output.slice(0, 30).map((digit) => corpus.translit[digit]).join('.')
        });
      }
    }
  }
}
assert.equal(models.length, 16);
models.sort((a, b) => b.ioc - a.ioc);

const reference = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(reference.length, 95);
assert.ok(reference.every((digit) => digit < 28));
const positive = reference.slice(0, 92);
const expected = positive.flatMap((_, i) => i % 4 === 0 ? multiply(A, positive.slice(i, i + 4)) : []);
assert.equal(expected.length, positive.length);
for (const encoding of ['cyclic', 'field-power']) {
  const cipher = [11];
  let markerCount = 0;
  for (let i = 0; i < expected.length; i += 1) {
    if (i % 11 === 7) {
      cipher.push(cipher.at(-1)); // explicit reversible EA bypass
      markerCount += 1;
    }
    const jump = encoding === 'cyclic' ? expected[i] + 1 : POWER15[expected[i]];
    cipher.push((cipher.at(-1) + jump) % 29);
  }
  const parsed = ranks(cipher, encoding);
  assert.equal(parsed.markers.length, markerCount);
  assert.deepEqual(parsed.payload, expected);
  assert.deepEqual(decoded(parsed.payload, INVERSE), positive);
}
assert.ok(models[0].ioc < 0.04, 'The frozen direct inverse unexpectedly requires language inspection');
console.log(JSON.stringify({
  source: 'p15 original 4x4 Fibonacci prime ordinals',
  modulus: 28,
  matrix: A,
  determinant_mod28: 19,
  inverse: INVERSE,
  target: 'original physical pp16-22',
  source_runes: 1744,
  candidates: models.length,
  best: models[0],
  native_solved_p57_ioc: ioc(reference),
  all: models,
  positive: '92 / 92 recovered under both reversible step encodings with repeated-rune EA bypass'
}, null, 2));
console.log('PASS: original LP2, explicit source matrix, invertible mod28, original negative, both known-plaintext plants');

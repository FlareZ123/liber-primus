'use strict';
/**
 * Source-exact Stage10 1033-square spectral-transfer test against two intact LP2
 * seven-rune-aligned chapters. Windows 11, Node.js 22, built-ins only.
 * This is a cipher *hypothesis* test. It cannot certify author intent.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const FIELD = 29;

/** @param {number} x @returns {number} */
const m29 = (x) => ((x % FIELD) + FIELD) % FIELD;

/** @param {number} a @returns {number} */
function inverse(a) {
  const v = m29(a);
  assert.notEqual(v, 0, 'singular scalar');
  for (let i = 1; i < FIELD; i += 1) {
    if (v * i % FIELD === 1) return i;
  }
  throw new Error('not invertible');
}

/** @param {number} n @returns {number[][]} */
const identity = (n) =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => +(i === j)));

/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function multiply(a, b) {
  assert.equal(a[0].length, b.length);
  return a.map((row) => b[0].map((_, j) =>
    m29(row.reduce((sum, value, k) => sum + value * b[k][j], 0))));
}

/** @param {number[][]} matrix @param {number[]} vector @returns {number[]} */
function apply(matrix, vector) {
  return matrix.map((row) =>
    m29(row.reduce((sum, x, j) => sum + x * vector[j], 0)));
}

/** @param {number[][]} matrix @param {number} scale @returns {number[][]} */
function addDiagonal(matrix, scale) {
  return matrix.map((row, i) => row.map((v, j) =>
    m29(v + (i === j ? scale : 0))));
}

/** @param {number[][]} a @returns {number[]} */
function characteristic(a) {
  const n = a.length;
  let running = identity(n);
  const coefficients = [1];
  for (let k = 1; k <= n; k += 1) {
    const next = multiply(a, running);
    const trace = next.reduce((sum, row, j) => sum + row[j], 0);
    const coefficient = m29(-trace * inverse(k));
    coefficients.push(coefficient);
    running = addDiagonal(next, coefficient);
  }
  return coefficients;
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polynomialMultiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      out[i + j] = m29(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

/** @param {number[]} polynomial @param {number[][]} a @returns {number[][]} */
function polynomialAtMatrix(polynomial, a) {
  const n = a.length;
  let value = Array.from({ length: n }, () => Array(n).fill(0));
  for (const coefficient of polynomial) {
    value = addDiagonal(multiply(value, a), coefficient);
  }
  return value;
}

/** @param {number[][]} matrix @returns {number[][]} */
function nullspace(matrix) {
  const a = matrix.map((r) => r.map(m29));
  const height = a.length;
  const width = a[0].length;
  const pivots = [];
  let rank = 0;
  for (let col = 0; col < width && rank < height; col += 1) {
    const row = a.findIndex((v, i) => i >= rank && v[col] !== 0);
    if (row < 0) continue;
    [a[rank], a[row]] = [a[row], a[rank]];
    const factor = inverse(a[rank][col]);
    a[rank] = a[rank].map((v) => m29(v * factor));
    for (let i = 0; i < height; i += 1) {
      if (i === rank) continue;
      const value = a[i][col];
      a[i] = a[i].map((v, j) => m29(v - value * a[rank][j]));
    }
    pivots.push(col);
    rank += 1;
  }
  const free = Array.from({ length: width }, (_, i) => i)
    .filter((i) => !pivots.includes(i));
  return free.map((col) => {
    const v = Array(width).fill(0);
    v[col] = 1;
    for (let i = 0; i < pivots.length; i += 1) {
      v[pivots[i]] = m29(-a[i][col]);
    }
    return v;
  });
}

/** @param {number[]} v @returns {number[]} */
function normalized(v) {
  const first = v.find((x) => x !== 0);
  assert.notEqual(first, undefined);
  return v.map((x) => m29(x * inverse(first)));
}

/** @param {number[][]} input @returns {number[][]} */
function matrixInverse(input) {
  const n = input.length;
  const a = input.map((row, i) => [...row, ...identity(n)[i]]);
  for (let j = 0; j < n; j += 1) {
    const pivot = a.findIndex((row, i) => i >= j && row[j] !== 0);
    assert.notEqual(pivot, -1, 'singular transfer matrix');
    [a[j], a[pivot]] = [a[pivot], a[j]];
    const scale = inverse(a[j][j]);
    a[j] = a[j].map((v) => m29(v * scale));
    for (let i = 0; i < n; i += 1) {
      if (i === j) continue;
      const factor = a[i][j];
      a[i] = a[i].map((v, k) => m29(v - factor * a[j][k]));
    }
  }
  return a.map((row) => row.slice(n));
}

/** @param {string} contents @returns {number[][][]} */
function readStage10(contents) {
  const blocks = contents.trim().split(/\r?\n\s*\r?\n/);
  assert.equal(blocks.length, 3, 'three historical squares');
  const matrices = blocks.map((block) =>
    block.trim().split(/\r?\n/).map((line) =>
      line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(matrices.map((m) => m.length), [5, 7, 5]);
  for (const [j, m] of matrices.entries()) {
    const total = j === 0 ? 3301 : 1033;
    for (const row of m) {
      assert.equal(row.length, m.length);
      assert.equal(row.reduce((s, v) => s + v, 0), total);
    }
  }
  return matrices.map((m) => m.map((row) => row.map(m29)));
}

/**
 * Canonical source-only change of basis:
 * linear eigenspaces in the authentic 5-square CHANGE-root order H,A,E;
 * then the two irreducible quadratic nullspaces, sorted as written.
 * Each vector is the first RREF free-column null vector, normalized so its
 * first nonzero component is 1. A quadratic's second vector is M times it.
 * @param {number[][]} seven @returns {number[][]}
 */
function spectralBasis(seven) {
  const columns = [];
  for (const eigenvalue of [8, 24, 18]) {
    const root = nullspace(addDiagonal(seven, -eigenvalue));
    assert.equal(root.length, 1);
    columns.push(normalized(root[0]));
  }
  for (const quadratic of [[1, -5, -13], [1, 8, 8]]) {
    const kernel = nullspace(polynomialAtMatrix(quadratic, seven));
    assert.equal(kernel.length, 2);
    const v = normalized(kernel[0]);
    columns.push(v, apply(seven, v));
  }
  return Array.from({ length: 7 }, (_, i) => columns.map((v) => v[i]));
}

/** @param {number[]} text @param {number[][]} key @returns {number[]} */
function transform(text, key) {
  assert.equal(text.length % 7, 0);
  const output = [];
  for (let i = 0; i < text.length; i += 7) {
    output.push(...apply(key, text.slice(i, i + 7)));
  }
  return output;
}

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const histogram = Array(FIELD).fill(0);
  for (const rune of data) {
    assert.ok(Number.isInteger(rune) && rune >= 0 && rune < 29);
    histogram[rune] += 1;
  }
  return histogram.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}

/** @param {number} actual @param {number} expected @returns {void} */
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12,
    'original IoC mismatch: ' + actual + ' versus ' + expected);
}

const historical = fs.readFileSync(
  path.join(ROOT, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const [first3301, seven1033, five1033] = readStage10(historical);
assert.equal(first3301.length, 5);
const roots5 = [5, 8, 24, 21, 18];
const factors5 = roots5.reduce(
  (poly, root) => polynomialMultiply(poly, [1, m29(-root)]), [1]);
assert.deepEqual(characteristic(five1033), factors5);
const factors7 = [
  [1, -8], [1, -24], [1, -18],
  [1, -5, -13], [1, 8, 8]
];
const expected7 = factors7.reduce(
  (poly, factor) => polynomialMultiply(poly, factor), [1]);
assert.deepEqual(characteristic(seven1033), expected7);
assert.deepEqual(expected7, [1, 11, 22, 26, 13, 16, 18, 27]);
const S = spectralBasis(seven1033);
const Sinverse = matrixInverse(S);
assert.deepEqual(multiply(S, Sinverse), identity(7));
assert.deepEqual(multiply(Sinverse, S), identity(7));
assert.deepEqual(
  multiply(multiply(Sinverse, seven1033), S),
  [[8, 0, 0, 0, 0, 0, 0],
   [0, 24, 0, 0, 0, 0, 0],
   [0, 0, 18, 0, 0, 0, 0],
   [0, 0, 0, 0, 13, 0, 0],
   [0, 0, 0, 1, 5, 0, 0],
   [0, 0, 0, 0, 0, 0, 21],
   [0, 0, 0, 0, 0, 1, 21]]);
console.log('SPECTRAL_COMMON roots_1033 [8,24,18] extra_unforced [8,24]');

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const byPage = new Map(corpus.pages.map((p) => [p.page, p.indices]));
/** @param {number} first @param {number} last @returns {number[]} */
const concatenate = (first, last) =>
  Array.from({ length: last - first + 1 }, (_, i) => byPage.get(first + i))
    .flat();
const solved = byPage.get(57);
assert.equal(solved.length, 95);
for (const [first, last, length, rawExpected, sExpected, inverseExpected] of [
  [8, 14, 1729, 0.03446048347364137, 0.034287106655527706,
    0.0343533781033781],
  [33, 39, 1680, 0.03436002155478034, 0.03450041124251964,
    0.034257210924870246]
]) {
  const source = concatenate(first, last);
  assert.equal(source.length, length);
  const fromPhysical = transform(source, S);
  const fromEigen = transform(source, Sinverse);
  close(ioc(source), rawExpected);
  close(ioc(fromPhysical), sExpected);
  close(ioc(fromEigen), inverseExpected);
  assert.deepEqual(transform(fromPhysical, Sinverse), source);
  assert.deepEqual(transform(fromEigen, S), source);

  const positive = Array.from({ length }, (_, j) => solved[j % solved.length]);
  assert.deepEqual(transform(transform(positive, S), Sinverse), positive);
  assert.deepEqual(transform(transform(positive, Sinverse), S), positive);
  assert.ok(ioc(positive) > 0.05);
  const stats = [ioc(source), ioc(fromPhysical), ioc(fromEigen)]
    .map((x) => x.toFixed(9));
  console.log('SOURCE p' + first + '-p' + last +
    ' n=' + length + ' IoC raw/S/Sinv=' + stats.join('/'));
  console.log('SOURCE_FIRST_28_S ' + fromPhysical.slice(0, 28).join(','));
  console.log('SOURCE_FIRST_28_SINV ' + fromEigen.slice(0, 28).join(','));
}

/**
 * Authenticated key-transfer receiver: source 256-cell grid / (H*G)
 * yields exactly 252 GP29 coefficients = three 84-rune lanes.
 * The authentic solved p56 uses 84 consumed prime-totient GP29 keys.
 * Allow both original three-lane serializations and either 7×7 basis.
 * Equality-pattern disagreements are key-independent for *all* 29!
 * possible secret fixed GP29 output alphabet permutations.
 */
const grid = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
const bytes = grid.rows.flat().map((token) => {
  assert.equal(token.length, 2);
  const high = grid.alphabet.indexOf(token[0]);
  const low = grid.alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  const value = 60 * high + low;
  assert.ok(value >= 0 && value <= 255);
  return value;
});
const divisor = polynomialMultiply(
  [24, 26, 3], [15, 5, 27]);
assert.deepEqual(divisor, [12, 17, 11, 21, 23]);
const remainder = bytes.map(m29);
const quotient = [];
for (let i = 0; i < 252; i += 1) {
  const coefficient = m29(remainder[i] * inverse(divisor[0]));
  quotient.push(coefficient);
  for (let j = 0; j < divisor.length; j += 1) {
    remainder[i + j] = m29(remainder[i + j] - coefficient * divisor[j]);
  }
}
assert.deepEqual(remainder.slice(252), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 10), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28]);

/** @param {number} n @returns {boolean} */
const isPrime = (n) => {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }
  return true;
};
const primes = [];
for (let n = 2; primes.length < 84; n += 1) {
  if (isPrime(n)) primes.push(n);
}
const trueP56Key = primes.map((prime) => m29(prime - 1));
assert.deepEqual(trueP56Key.slice(0, 10), [1, 2, 4, 6, 10, 12, 16, 18, 22, 28]);
assert.equal(byPage.get(56).length, 85);
assert.equal(byPage.get(56)[56], 0, 'actual one literal skipped F rune');

function equalityDisagreements(source, target) {
  assert.equal(source.length, target.length);
  let disagreement = 0;
  for (let i = 0; i < source.length; i += 1) {
    for (let j = i + 1; j < source.length; j += 1) {
      disagreement += +( (source[i] === source[j]) !==
                          (target[i] === target[j]) );
    }
  }
  return disagreement;
}
assert.equal(equalityDisagreements(
  trueP56Key.map((v) => m29(7 * v + 3)), trueP56Key), 0);
assert.deepEqual(transform(transform(trueP56Key, S), Sinverse), trueP56Key);
assert.equal(equalityDisagreements(
  transform(transform(trueP56Key, S), Sinverse), trueP56Key), 0);

const sourceTransfer = [];
for (const layout of ['contiguous', 'interleaved']) {
  for (let lane = 0; lane < 3; lane += 1) {
    const raw = layout === 'contiguous'
      ? quotient.slice(lane * 84, (lane + 1) * 84)
      : quotient.filter((_, i) => i % 3 === lane);
    for (const [operator, matrix] of [
      ['identity', null], ['S', S], ['Sinverse', Sinverse]
    ]) {
      const attempt = matrix ? transform(raw, matrix) : raw;
      sourceTransfer.push({
        layout, lane, operator,
        disagreements: equalityDisagreements(attempt, trueP56Key),
        equalSymbols: attempt.reduce((sum, v, j) =>
          sum + +(v === trueP56Key[j]), 0)
      });
    }
  }
}
assert.equal(sourceTransfer.length, 18);
const minimum = Math.min(...sourceTransfer.map((x) => x.disagreements));
const maxDirect = Math.max(...sourceTransfer.map((x) => x.equalSymbols));
assert.equal(minimum, 191);
assert.equal(maxDirect, 8);
const winner = sourceTransfer.find((r) => r.disagreements === minimum);
assert.deepEqual(
  [winner.layout, winner.lane, winner.operator],
  ['contiguous', 1, 'S']);
console.log('ORIGINAL_KEY_TRANSFER 18 layouts, key-independent equality mismatches minimum=' +
  minimum + ', max exact symbols=' + maxDirect +
  ', best contiguous middle84 after S');

console.log('SELFTEST_PASS original squares, charpolys, canonical basis, 3409 original runes, solved-native positives, 84-prime authenticated-key transfer');

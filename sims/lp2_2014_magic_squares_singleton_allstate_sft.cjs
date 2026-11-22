'use strict';

/**
 * Source-locked original LP2 singleton-word test of 2014 Cicada 5x5, 7x7, 5x5
 * magic-square state evolution. Uses CommonJS and Node 22 built-ins only.
 * The scalar key sequence is allowed every initial state satisfying the
 * matrix characteristic polynomial, a superclass of linear matrix projections.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const historical = fs.readFileSync(
  path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const squares = historical.trim().split(/\r?\n\s*\r?\n/).map((block) =>
  block.trim().split(/\r?\n/).map((line) =>
    line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map((a) => a.length), [5, 7, 5]);
for (let i = 0; i < squares.length; i += 1) {
  const size = squares[i].length;
  const target = [3301, 1033, 1033][i];
  assert.ok(squares[i].every((row) =>
    row.length === size && row.reduce((sum, value) => sum + value, 0) === target));
}

const MODULUS = 29;
/** @param {number} n @returns {number} */
const mod = (n) => ((n % MODULUS) + MODULUS) % MODULUS;

/** @param {number} n @returns {number} */
function inverse(n) {
  for (let j = 1; j < MODULUS; j += 1) {
    if (mod(n * j) === 1) return j;
  }
  throw new Error('No GF29 inverse for zero');
}

/**
 * Multiply matrices over GF29, retaining conventional row/column order.
 * @param {number[][]} a
 * @param {number[][]} b
 * @returns {number[][]}
 */
function multiply(a, b) {
  return a.map((row) => b[0].map((_, j) =>
    mod(row.reduce((sum, value, k) => sum + value * b[k][j], 0))));
}

/**
 * Faddeev-LeVerrier characteristic polynomial, descending coefficients.
 * Its divisions by 1,...,7 are all valid over GF29.
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function characteristicPolynomial(matrix) {
  const n = matrix.length;
  const a = matrix.map((row) => row.map(mod));
  let b = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => Number(i === j)));
  const polynomial = [1];
  for (let k = 1; k <= n; k += 1) {
    const ab = multiply(a, b);
    const trace = ab.reduce((sum, row, i) => sum + row[i], 0);
    const coefficient = mod(-trace * inverse(k));
    polynomial.push(coefficient);
    b = ab.map((row, i) => row.map((value, j) =>
      mod(value + (i === j ? coefficient : 0))));
  }
  assert.ok(b.every((row) => row.every((value) => value === 0)),
    'Characteristic polynomial must annihilate its matrix');
  return polynomial;
}

/**
 * Each row is the linear function of the completely unrestricted first n
 * key states that yields K_at_position under the source characteristic
 * recurrence, where the first symbol advances the key once.
 * @param {number[]} polynomial
 * @param {number} maximum
 * @returns {number[][]}
 */
function recurrenceRows(polynomial, maximum) {
  const n = polynomial.length - 1;
  const rows = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => Number(i === j)));
  for (let index = n; index <= maximum; index += 1) {
    const row = Array(n).fill(0);
    for (let back = 0; back < n; back += 1) {
      const factor = mod(-polynomial[n - back]);
      const previous = rows[index - n + back];
      for (let col = 0; col < n; col += 1) {
        row[col] = mod(row[col] + factor * previous[col]);
      }
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Express a row as a linear combination of independent basis rows over GF29.
 * Returns null precisely when the row is independent of that basis.
 * @param {number[]} target
 * @param {number[][]} basis
 * @returns {number[] | null}
 */
function express(target, basis) {
  const n = target.length;
  const count = basis.length;
  if (count === 0) return target.every((v) => v === 0) ? [] : null;
  const equations = Array.from({ length: n }, (_, j) =>
    [...basis.map((row) => row[j]), target[j]]);
  const pivotCols = [];
  let rank = 0;
  for (let col = 0; col < count; col += 1) {
    let found = -1;
    for (let row = rank; row < n; row += 1) {
      if (equations[row][col] !== 0) { found = row; break; }
    }
    if (found < 0) continue;
    [equations[rank], equations[found]] = [equations[found], equations[rank]];
    const scale = inverse(equations[rank][col]);
    equations[rank] = equations[rank].map((value) => mod(value * scale));
    for (let row = 0; row < n; row += 1) {
      if (row === rank) continue;
      const factor = equations[row][col];
      equations[row] = equations[row].map((value, j) =>
        mod(value - factor * equations[rank][j]));
    }
    pivotCols.push(col);
    rank += 1;
    if (rank === n) break;
  }
  if (equations.slice(rank).some((row) => row[count] !== 0)) return null;
  const coefficients = Array(count).fill(0);
  for (let i = 0; i < pivotCols.length; i += 1) {
    coefficients[pivotCols[i]] = equations[i][count];
  }
  return coefficients;
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function dot(a, b) {
  return mod(a.reduce((sum, value, i) => sum + value * b[i], 0));
}

/**
 * Search all GP-A, GP-I, GP-O possible plaintext assignments on an
 * independent spanning subset, with no restriction on the unknown key seed.
 * A dependent observed row must match one of the same three plaintext types.
 * @param {Array<{offset:number,cipher:number}>} events
 * @param {number[][]} rows
 * @returns {{count:number,rank:number,basisIndices:number[]}}
 */
function countConsistentStates(events, rows) {
  const basis = [];
  const basisIndices = [];
  for (let i = 0; i < events.length; i += 1) {
    const row = rows[events[i].offset];
    if (express(row, basis) === null) {
      basis.push(row);
      basisIndices.push(i);
    }
  }
  const expressions = events.map((event) => express(rows[event.offset], basis));
  assert.ok(expressions.every((coefficients) => coefficients !== null));
  const singletonPlain = [24, 10, 3];
  let survivors = 0;
  for (let mask = 0; mask < 3 ** basis.length; mask += 1) {
    let digits = mask;
    const keyBasis = basisIndices.map((i) => {
      const selected = singletonPlain[digits % 3];
      digits = Math.floor(digits / 3);
      return mod(events[i].cipher - selected);
    });
    if (events.every((event, i) =>
      singletonPlain.includes(mod(event.cipher - dot(expressions[i], keyBasis))))) {
      survivors += 1;
    }
  }
  return { count: survivors, rank: basis.length, basisIndices };
}

const parsed = parseSharedCorpus();
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
const originalRunes = corpus.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices.map((index) => corpus.runes[index])).join('');
assert.equal(parsed.words.map((word) => word.runes).join(''), originalRunes);
const events = [];
let offset = 0;
for (const word of parsed.words) {
  if (word.length === 1) {
    events.push({ offset, cipher: corpus.runes.indexOf(word.runes) });
  }
  offset += word.length;
}
assert.equal(offset, 12956);
assert.equal(events.length, 83);
assert.deepEqual(events.slice(0, 13).map((e) => [e.offset, e.cipher]), [
  [176, 28], [244, 15], [350, 9], [530, 1], [644, 0],
  [792, 21], [967, 8], [1025, 7], [1062, 2],
  [1250, 27], [1316, 26], [1545, 19], [1814, 8],
]);

const knownPolynomials = [
  [1, 5, 17, 27, 27, 19],
  [1, 11, 22, 26, 13, 16, 18, 27],
  [1, 11, 27, 7, 5, 26],
];
const expectedFirstFailure = [5, 12, 5];
console.log('SOURCE: original 2014 5x5 / 7x7 / 5x5 squares, exact LP2 83 one-rune words');
for (let i = 0; i < squares.length; i += 1) {
  const polynomial = characteristicPolynomial(squares[i]);
  assert.deepEqual(polynomial, knownPolynomials[i]);
  const rows = recurrenceRows(polynomial, events.at(-1).offset);
  let failure = 0;
  const counts = [];
  for (let m = 1; m <= 13; m += 1) {
    const result = countConsistentStates(events.slice(0, m), rows);
    counts.push([m, result.rank, result.count]);
    if (result.count === 0) {
      failure = m;
      break;
    }
  }
  assert.equal(failure, expectedFirstFailure[i],
    'Original input must reach precisely the source-bound certificate');
  const complete = countConsistentStates(events, rows);
  assert.equal(complete.count, 0);

  // Positive original-length singleton plant from the actual square action,
  // not a merely charpoly-compatible but unrealizable scalar recurrence.
  let state = Array.from({ length: squares[i].length }, (_, j) => j + 1);
  const initialKeys = [];
  for (let j = 0; j < squares[i].length; j += 1) {
    initialKeys.push(state[0]);
    state = squares[i].map((row) => dot(row, state));
  }
  const fake = events.map((event, index) => ({
    offset: event.offset,
    cipher: mod([24, 10, 3][index % 3] + dot(rows[event.offset], initialKeys)),
  }));
  assert.ok(countConsistentStates(fake, rows).count > 0,
    'Actual 2014-square-state A/I/O plant must survive all 83 original slots');
  const solved = corpus.pages.find((page) => page.page === 57).indices;
  for (let pos = 0; pos < solved.length; pos += 1) {
    const enc = mod(solved[pos] + dot(rows[pos], initialKeys));
    assert.equal(mod(enc - dot(rows[pos], initialKeys)), solved[pos]);
  }
  console.log('SQUARE=' + [3301, 1033, 1033][i] + ' (' + squares[i].length +
    'x' + squares[i].length + ') charpoly=' + polynomial.join(','));
  console.log('ORIGINAL first failure at singleton #' + failure +
    ' offsets=' + events.slice(0, failure).map((e) => e.offset).join(','));
  console.log('ORIGINAL prefix [events, rank, surviving assignments]=' +
    JSON.stringify(counts));
  console.log('CONTROL: all 83 source-shaped A/I/O sites and 95 solved GP runes PASS');
}
console.log('DECISION: no homogeneous GF29 direct additive square-charpoly key over original printed words');

/**
 * Multiplication by (X-1) over GF29 gives a strict superclass for any
 * arbitrary fixed output bias added to a source-matrix running key.
 * @param {number[]} polynomial
 * @returns {number[]}
 */
function withConstantBias(polynomial) {
  const out = Array(polynomial.length + 1).fill(0);
  for (let i = 0; i < polynomial.length; i += 1) {
    out[i] = mod(out[i] + polynomial[i]);
    out[i + 1] = mod(out[i + 1] - polynomial[i]);
  }
  return out;
}

for (let i = 0; i < squares.length; i += 1) {
  const polynomial = withConstantBias(characteristicPolynomial(squares[i]));
  const rows = recurrenceRows(polynomial, events.at(-1).offset);
  let failure = 0;
  const prefix = [];
  for (let n = 1; n <= events.length; n += 1) {
    const result = countConsistentStates(events.slice(0, n), rows);
    if (n <= 18 || result.count === 0) prefix.push([n, result.rank, result.count]);
    if (result.count === 0) { failure = n; break; }
  }
  assert.ok(failure > 0, 'Original ciphertext must exclude whole-book affine matrix recurrence');
  const size = squares[i].length;
  let state = Array.from({ length: size }, (_, j) => j + 1);
  const initialKeys = [];
  for (let j = 0; j < size + 1; j += 1) {
    initialKeys.push(mod(state[0] + 7));
    state = squares[i].map((row) => dot(row, state));
  }
  const fake = events.map((event, index) => ({
    offset: event.offset,
    cipher: mod([24, 10, 3][index % 3] + dot(rows[event.offset], initialKeys)),
  }));
  assert.ok(countConsistentStates(fake, rows).count > 0,
    'Actual source-square output with arbitrary constant bias must remain consistent');
  console.log('AFFINE-BIAS SQUARE=' + [3301, 1033, 1033][i] + ' (' + size + 'x' + size +
    ') charpoly=' + polynomial.join(',') + ' first_failure=' + failure);
  console.log('AFFINE original [event,rank,live assignments]=' + JSON.stringify(prefix));
  console.log('CONTROL: source-matrix+bias-7 planted all 83 singletons PASS');
}
console.log('DECISION: no direct additive homogeneous or constant-bias square-state whole-book key');

/**
 * The source ciphertext's extreme underproduction of repeated adjacent runes
 * independently motivates a DIFFERENCE register. We test the same authentic
 * matrix clock with D[n]=C[n]-C[n-1] instead of raw C[n]. Every one-rune
 * original word away from a page start has a legitimate previous rune.
 */
const originalIndices = corpus.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(originalIndices.length, 12956);
const pageStarts = new Set();
let cursor = 0;
for (const page of corpus.pages.filter((page) => page.page <= 55)) {
  if (page.indices.length) pageStarts.add(cursor);
  cursor += page.indices.length;
}
assert.equal(cursor, 12956);
const deltaEvents = events.filter((event) => event.offset > 0 && !pageStarts.has(event.offset))
  .map((event) => ({
    offset: event.offset,
    cipher: mod(originalIndices[event.offset] - originalIndices[event.offset - 1]),
  }));
console.log('DELTA: original within-page standalone words=' + deltaEvents.length +
  ' of ' + events.length + ' total');
for (let i = 0; i < squares.length; i += 1) {
  for (const withBias of [false, true]) {
    const poly = characteristicPolynomial(squares[i]);
    const polynomial = withBias ? withConstantBias(poly) : poly;
    const rows = recurrenceRows(polynomial, originalIndices.length - 1);
    let fail = 0;
    let last = null;
    for (let m = 1; m <= deltaEvents.length; m += 1) {
      const res = countConsistentStates(deltaEvents.slice(0, m), rows);
      last = res;
      if (res.count === 0) { fail = m; break; }
    }
    const size = squares[i].length;
    let state = Array.from({ length: size }, (_, j) => j + 1);
    const initialKeys = [];
    for (let j = 0; j < polynomial.length - 1; j += 1) {
      initialKeys.push(mod(state[0] + (withBias ? 7 : 0)));
      state = squares[i].map((row) => dot(row, state));
    }
    const clear = originalIndices.map((value, pos) =>
      pos % 29);
    for (const [j, event] of deltaEvents.entries()) {
      clear[event.offset] = [24, 10, 3][j % 3];
    }
    const encoded = [];
    let previous = 7;
    for (let pos = 0; pos < clear.length; pos += 1) {
      const decodedDelta = mod(clear[pos] + dot(rows[pos], initialKeys));
      const current = mod(previous + decodedDelta);
      encoded.push(current);
      previous = current;
    }
    const planted = deltaEvents.map((event) => ({
      offset: event.offset,
      cipher: mod(encoded[event.offset] - encoded[event.offset - 1]),
    }));
    assert.ok(countConsistentStates(planted, rows).count > 0,
      'Native-English singleton and actual source-matrix delta plant must survive');
    console.log('DELTA square=' + [3301, 1033, 1033][i] + ' (' + size + 'x' +
      size + ') withBias=' + withBias + ' firstFailure=' + fail +
      ' finalSurvivors=' + last.count + ' rank=' + last.rank);
    if (fail) console.log('DELTA original contradiction at rune=' +
      deltaEvents[fail - 1].offset + ' (singleton ' + fail + ')');
    else console.log('DELTA ORIGINAL KEY SURVIVES: requires independent word-level validation');
  }
}

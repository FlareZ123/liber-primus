'use strict';

/**
 * Test whether the p50 table's 180 known interior positions determine a
 * short, fully secret GF(29)-linear keystream for its 76 unknown outer cells.
 *
 * The data pairing is motivated by an original 32x8 table (76 perimeter,
 * 180 interior) and original pages p55 (76), p56 (85), p57 (95).
 * It is a hypothesis, NOT a recovered Cicada decoding instruction.
 *
 * Run: node sims/lp2_p50_inner180_gf29_lfsr_source_sft.cjs
 * Node.js 22; no third-party dependencies or file writes.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {any} */
const load = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/base60-grid.json');
const rows = grid.byte_rows;
assert.equal(rows.length, 32);
assert(rows.every(row => row.length === 8));

/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number} a @returns {number} */
function inv(a) {
  assert.notEqual(mod(a), 0);
  for (let b = 1; b < 29; b++) if (mod(a * b) === 1) return b;
  throw new Error('GF29 inverse missing');
}
/** @param {number} amount @returns {number[]} */
function primes(amount) {
  const result = [];
  for (let n = 2; result.length < amount; n++) {
    let isPrime = true;
    for (let p = 2; p * p <= n; p++) if (n % p === 0) { isPrime = false; break; }
    if (isPrime) result.push(n);
  }
  return result;
}
/** @param {string} words @returns {number[]} */
function readGp(words) {
  const vocabulary = corpus.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const output = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const next = vocabulary.find(({token}) => word.startsWith(token, i));
      assert(next, 'GP token required in ' + word.slice(i));
      output.push(next.index);
      i += next.token.length;
    }
  }
  return output;
}
const expectedP56 = readGp(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
);
const c56 = corpus.pages.find(p => p.page === 56).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.deepEqual([expectedP56.length, c56.length, p57.length], [85, 85, 95]);
const prime = primes(100);
let j = 0;
const decodedP56 = c56.map((glyph, i) => {
  if (i === 56) { assert.equal(glyph, 0); return 0; }
  return mod(glyph - (prime[j++] - 1));
});
assert.equal(j, 84);
assert.deepEqual(decodedP56, expectedP56);
const knownPlain = decodedP56.concat(p57);
const knownPrinted = c56.concat(p57);
assert.equal(knownPlain.length, 180);

/** @param {number} r @param {number} c @returns {number} */
const at = (r, c) => r * 8 + c;
const outside = [];
for (let c = 0; c < 8; c++) outside.push(at(0, c));
for (let r = 1; r < 32; r++) outside.push(at(r, 7));
for (let c = 6; c >= 0; c--) outside.push(at(31, c));
for (let r = 30; r > 0; r--) outside.push(at(r, 0));
assert.equal(outside.length, 76);
const insideRows = [];
const insideSnake = [];
const insideColumns = [];
const insideColumnSnake = [];
for (let r = 1; r < 31; r++) {
  for (let c = 1; c < 7; c++) insideRows.push(at(r, c));
  for (let c = 0; c < 6; c++) insideSnake.push(at(r, r % 2 ? c + 1 : 6 - c));
}
for (let c = 1; c < 7; c++) {
  for (let r = 1; r < 31; r++) insideColumns.push(at(r, c));
  for (let r = 0; r < 30; r++) insideColumnSnake.push(
    at(c % 2 ? r + 1 : 30 - r, c)
  );
}
const routes = {
  rows: insideRows,
  reversedRows: insideRows.slice().reverse(),
  rowSnake: insideSnake,
  columns: insideColumns,
  columnSnake: insideColumnSnake
};
const allCells = outside.concat(insideRows);
assert.equal(new Set(allCells).size, 256);
assert.deepEqual(allCells.slice(76), insideRows);
const bytes = rows.flat();

/**
 * Exact Berlekamp-Massey over the prime field GF(29).
 * All unknown recurrence coefficients are permitted.
 * C[0]=1 and sum(C[j]*s[n-j],j=0..L)=0 for n>=L.
 * @param {number[]} series
 * @returns {{degree:number,coefficients:number[]}}
 */
function berlekampMassey(series) {
  let C = [1], B = [1], degree = 0, m = 1, previous = 1;
  for (let n = 0; n < series.length; n++) {
    let delta = 0;
    for (let i = 0; i <= degree; i++) delta = mod(delta + (C[i] || 0) * series[n-i]);
    if (delta === 0) { m++; continue; }
    const old = C.slice(), ratio = mod(delta * inv(previous));
    for (let i = 0; i < B.length; i++) C[i+m] = mod((C[i+m] || 0) - ratio * B[i]);
    if (2 * degree <= n) {
      degree = n + 1 - degree;
      B = old;
      previous = delta;
      m = 1;
    } else m++;
  }
  const coefficients = Array.from({length: degree + 1}, (_, i) => C[i] || 0);
  for (let n = degree; n < series.length; n++) {
    let residue = 0;
    for (let k = 0; k <= degree; k++)
      residue = mod(residue + coefficients[k] * series[n-k]);
    assert.equal(residue, 0, 'recurrence fails at known position ' + n);
  }
  return {degree, coefficients};
}
/** @param {number[]} sequence @param {number[]} coefficients @returns {number[]} */
function extendBackward(sequence, coefficients) {
  const L = coefficients.length - 1;
  assert.notEqual(coefficients[L], 0, 'oldest tap must be invertible');
  const key = Array(76).fill(0).concat(sequence);
  for (let i = 75; i >= 0; i--) {
    const n = i + L;
    let rest = key[n];
    for (let j = 1; j < L; j++) rest = mod(rest + coefficients[j] * key[n-j]);
    key[i] = mod(-rest * inv(coefficients[L]));
  }
  return key;
}

const source = {};
for (const [name, cells] of Object.entries(routes)) {
  assert.equal(cells.length, 180);
  assert.equal(new Set(cells).size, 180);
  source[name] = {};
  for (const [register, plaintext] of [['solved', knownPlain], ['printed', knownPrinted]]) {
    const key = cells.map((cell, i) => mod(bytes[cell] - plaintext[i]));
    const result = berlekampMassey(key);
    source[name][register] = result.degree;
  }
}
assert.deepEqual(source, {
  rows: { solved: 90, printed: 91 },
  reversedRows: { solved: 90, printed: 90 },
  rowSnake: { solved: 90, printed: 90 },
  columns: { solved: 90, printed: 90 },
  columnSnake: { solved: 90, printed: 90 }
});

// Verify the entire known-plaintext attack and missing-page recovery on a
// deliberately encrypted independent 12-state source-geometry-shaped plant.
/** @param {number[]} init @param {number[]} taps @param {number} count */
function emit(init, taps, count) {
  const L = taps.length, key = init.slice();
  assert.equal(key.length, L);
  while (key.length < count) {
    let next = 0;
    for (let j = 1; j <= L; j++)
      next = mod(next + taps[j-1] * key[key.length-j]);
    key.push(next);
  }
  return key;
}
const secretSeed = [2, 3, 5, 7, 11, 13, 17, 19, 23, 0, 2, 8];
const taps = [1, 2, 3, 5, 8, 13, 21, 4, 7, 11, 15, 1];
const syntheticKey = emit(secretSeed, taps, 256);
const unknownPlain = p57.slice(0, 76);
const syntheticTable = Array(256).fill(0);
for (let i = 0; i < 256; i++) {
  const cell = allCells[i];
  const plaintext = i < 76 ? unknownPlain[i] : knownPlain[i-76];
  syntheticTable[cell] = mod(plaintext + syntheticKey[i]);
}
const recoveredSuffix = insideRows.map((cell, i) =>
  mod(syntheticTable[cell] - knownPlain[i]));
assert.deepEqual(recoveredSuffix, syntheticKey.slice(76));
const fitted = berlekampMassey(recoveredSuffix);
assert.equal(fitted.degree, taps.length);
assert.notEqual(fitted.coefficients.at(-1), 0);
const recoveredKey = extendBackward(recoveredSuffix, fitted.coefficients);
assert.deepEqual(recoveredKey, syntheticKey);
const recoveredUnknown = outside.map((cell, i) =>
  mod(syntheticTable[cell] - recoveredKey[i]));
assert.deepEqual(recoveredUnknown, unknownPlain);

console.log(JSON.stringify({
  originalPages: {p55: 76, p56: 85, p57: 95},
  printedTable: {rows: 32, columns: 8, outer: 76, inner: 180},
  sourceObserved: source,
  universalBound: 'No homogeneous GF29 recurrence of order <=89 can generate any tested complete 180-symbol known-inner residual.',
  syntheticPlant: { trueOrder: 12, recoveredOrder: fitted.degree,
    originalKeyRecovered: recoveredKey.length,
    hiddenP55RunesRecovered: recoveredUnknown.length },
  actualUnknownP55PlaintextRecovered: false
}, null, 2));

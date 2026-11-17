'use strict';

/**
 * Complete original-source 30-row interior quartic-decoder test.
 * A 32x8 table has a 30x6 interior, sized exactly to the 180 authenticated
 * GP29 plaintext symbols on LP2 p56/p57. The historical source-derived H*G
 * factor has degree four, motivating a bounded row-local degree<=4 inverse.
 *
 * Each row receives independent arbitrary secret polynomial coefficients.
 * No unknown p55 ciphertext/putative plaintext is fitted.
 * Node 22, CommonJS, read-only reference files.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(base, file), 'utf8'));
const table = read('resources/liber-primus/base60-grid.json');
const book = read('resources/liber-primus/lp2-corpus.json');
const mod = (v) => (v % 29 + 29) % 29;
const page = (i) => book.pages.find((p) => p.page === i);
assert.equal(table.rows.length, 32);
assert.equal(table.byte_rows.length, 32);
assert.ok(table.byte_rows.every((r) => r.length === 8));
assert.equal(crypto.createHash('sha256').update(Buffer.from(table.byte_rows.flat())).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(page(55).indices.length, 76);
assert.equal(page(56).indices.length, 85);
assert.equal(page(57).indices.length, 95);

const solved = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const alphabet = book.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} text @returns {number[]} */
function gp(text) {
  const values = [];
  for (let i = 0; i < text.length;) {
    if (text[i] === ' ') { i++; continue; }
    const t = alphabet.find((x) => text.startsWith(x.token, i));
    assert.ok(t, 'unknown GP token at ' + i);
    values.push(t.index);
    i += t.token.length;
  }
  return values;
}
/** @param {number} count @returns {number[]} */
function primes(count) {
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (prime) result.push(n);
  }
  return result;
}
const plain56 = gp(solved);
assert.equal(plain56.length, 85);
const ps = primes(85);
let clock = 0;
const decoded = page(56).indices.map((c, i) =>
  i === 56 ? 0 : mod(c - (ps[clock++] - 1)));
assert.equal(clock, 84);
assert.deepEqual(decoded, plain56);
const known = plain56.concat(page(57).indices);
const printed = page(56).indices.concat(page(57).indices);
assert.equal(known.length, 180);

/** @param {string} chars @returns {number[][]} */
function originalRows(chars) {
  return table.rows.map((row) => row.map((token) => {
    const hi = chars.indexOf(token[0]), lo = chars.indexOf(token[1]);
    assert.ok(token.length === 2 && hi >= 0 && lo >= 0);
    return chars.length * hi + lo;
  }));
}
const base60 = originalRows(table.alphabet);
assert.deepEqual(base60, table.byte_rows);
const base59 = originalRows(table.alphabet.replace('f', ''));

/**
 * Solve every row polynomial of degree<=d with unrestricted coefficients
 * over GF29, using exact RREF and free coefficients set to zero.
 * @param {number[]} x
 * @param {number[]} y
 * @param {number} d
 * @returns {{consistent:boolean,rank:number,coefficients:number[]}}
 */
function solve(x, y, d) {
  assert.equal(x.length, y.length);
  const a = x.map((v, i) => {
    const out = [1];
    for (let j = 1; j <= d; j++) out.push(mod(out[j - 1] * v));
    out.push(y[i]);
    return out;
  });
  const pivotColumns = [];
  let pivot = 0;
  for (let c = 0; c <= d && pivot < a.length; c++) {
    let at = pivot;
    while (at < a.length && a[at][c] === 0) at++;
    if (at === a.length) continue;
    [a[pivot], a[at]] = [a[at], a[pivot]];
    let inverse = 1;
    while (mod(inverse * a[pivot][c]) !== 1) inverse++;
    for (let j = c; j <= d + 1; j++) a[pivot][j] = mod(a[pivot][j] * inverse);
    for (let r = 0; r < a.length; r++) {
      if (r === pivot) continue;
      const factor = a[r][c];
      for (let j = c; j <= d + 1; j++) a[r][j] = mod(a[r][j] - factor * a[pivot][j]);
    }
    pivotColumns.push(c);
    pivot++;
  }
  const consistent = !a.slice(pivot).some((row) => row[d + 1] !== 0);
  const coefficients = Array(d + 1).fill(0);
  pivotColumns.forEach((col, row) => { coefficients[col] = a[row][d + 1]; });
  return {consistent, rank: pivot, coefficients};
}
/** @param {number[]} coeff @param {number} x */
function evaluate(coeff, x) {
  let result = 0;
  for (let i = coeff.length - 1; i >= 0; i--) result = mod(result * x + coeff[i]);
  return result;
}

/**
 * Test original rows against every possible independent row-local polynomial.
 * The original 6 known pair coordinates are frozen row-major interior cells.
 * @param {number[][]} rows
 * @param {number[]} symbols
 */
function assess(rows, symbols) {
  const minimumDegree = [];
  const collisionRows = [];
  for (let r = 0; r < 30; r++) {
    const x = rows[r + 1].slice(1, 7).map(mod);
    const y = symbols.slice(r * 6, r * 6 + 6);
    const collision = x.some((v, i) =>
      x.some((w, j) => i < j && v === w && y[i] !== y[j]));
    if (collision) collisionRows.push(r);
    let first = -1;
    for (let d = 0; d <= 5; d++) {
      if (solve(x, y, d).consistent) {first = d; break;}
    }
    assert.equal(collision, first === -1);
    minimumDegree.push(first);
  }
  return {
    minimumDegree,
    countByDegree0to5: Array.from({length: 6}, (_, d) =>
      minimumDegree.filter((n) => n === d).length),
    quarticCompatibleInteriorRows: minimumDegree.map((n, i) =>
      n >= 0 && n <= 4 ? i : null).filter((n) => n !== null),
    collisionRows,
    arbitraryFunctionCompatibleRows: 30 - collisionRows.length,
  };
}

const authentic = assess(base60, known);
const alternate = assess(base59, known);
const asPrinted = assess(base60, printed);
assert.deepEqual(authentic.countByDegree0to5, [0, 0, 0, 0, 2, 20]);
assert.deepEqual(authentic.quarticCompatibleInteriorRows, [2, 8]);
assert.deepEqual(authentic.collisionRows, [1, 7, 9, 11, 16, 19, 20, 23]);
assert.equal(authentic.arbitraryFunctionCompatibleRows, 22);
assert.deepEqual(alternate.countByDegree0to5, [0, 0, 0, 0, 3, 21]);
assert.deepEqual(alternate.quarticCompatibleInteriorRows, [2, 15, 28]);
assert.deepEqual(alternate.collisionRows, [9, 11, 16, 17, 22, 24]);
assert.deepEqual(asPrinted.countByDegree0to5, [0, 0, 0, 0, 2, 20]);
assert.deepEqual(asPrinted.quarticCompatibleInteriorRows, [7, 14]);
assert.deepEqual(asPrinted.collisionRows, [1, 2, 9, 11, 16, 19, 20, 23]);

// An explicit local contradiction needs no fitting and excludes every
// deterministic GF29-valued row function, even of unlimited degree:
// Printed table row 3, columns 3/5 have "0F"/"1g": same residue 15,
// but known plaintext targets TH/N are distinct.
assert.deepEqual([table.rows[2][2], table.rows[2][4]], ['0F', '1g']);
assert.deepEqual([base60[2][2] % 29, base60[2][4] % 29], [15, 15]);
assert.deepEqual([book.translit[known[7]], book.translit[known[9]]], ['TH', 'N']);

// Full synthetic decoder positive: independently chosen quartic in every row,
// including rows with repeated x coordinates, fits ALL 180 known slots.
// Where >=5 distinct x points permit unique recovery, the same fitted
// coefficients predict both withheld original table perimeter columns.
const plant = [];
const plantedBorder = [];
const recoverableRows = [];
for (let r = 0; r < 30; r++) {
  const coeff = [mod(r), mod(3 * r + 5), mod(2 * r + 7),
    mod(4 * r + 11), mod(5 * r + 13)];
  const x = base60[r + 1].slice(1, 7).map(mod);
  plant.push(...x.map((v) => evaluate(coeff, v)));
  const fit = solve(x, x.map((v) => evaluate(coeff, v)), 4);
  assert.ok(fit.consistent);
  if (fit.rank === 5) {
    recoverableRows.push(r);
    for (const c of [0, 7]) {
      const value = evaluate(fit.coefficients, mod(base60[r + 1][c]));
      assert.equal(value, evaluate(coeff, mod(base60[r + 1][c])));
      plantedBorder.push(value);
    }
  }
}
const plantReport = assess(base60, plant);
assert.deepEqual(plantReport.collisionRows, []);
assert.equal(plantReport.quarticCompatibleInteriorRows.length, 30);
assert.equal(recoverableRows.length, 28);
assert.equal(plantedBorder.length, 56);
assert.deepEqual([16, 19], Array.from({length: 30}, (_, i) => i)
  .filter((i) => !recoverableRows.includes(i)));
console.log(JSON.stringify({
  decision: 'authentic row-quartic interior mapping impossible; no unknown plaintext',
  assumptions: 'row-major 30x6 interior; x=table byte mod29; known p56 plaintext + clear p57',
  originalBase60: authentic,
  alternateBase59: alternate,
  asPrintedP56: asPrinted,
  witness: {tableRow1based: 3, columns1based: [3, 5],
    printedTokens: ['0F', '1g'], xMod29: [15, 15],
    authenticatedGPOutputs: ['TH', 'N']},
  plantedPositive: {compatibleRows: 30, uniqueQuintupleRows: recoverableRows.length,
    independentlyRecoveredBorderCells: plantedBorder.length}
}, null, 2));

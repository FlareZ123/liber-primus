'use strict';

/**
 * Source-exact original-grid test: scan every original red-rune span as a GF(29)
 * polynomial in each of the two source-natural reading directions.
 * Usage: node sims/lp2_red_span_grid_factor_uniqueness_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8'));
}
/** @param {number} x */
function mod(x) {
  return ((x % 29) + 29) % 29;
}
/** @param {number} x */
function inv(x) {
  for (let i = 1; i < 29; i += 1) {
    if (mod(x * i) === 1) return i;
  }
  throw new Error('Noninvertible coefficient');
}
/**
 * Euclidean remainder of ascending-coefficient polynomials over GF29.
 * @param {number[]} source
 * @param {number[]} factor
 * @returns {number[]}
 */
function remainder(source, factor) {
  const a = source.slice();
  const g = factor.slice();
  while (g.length > 0 && g[g.length - 1] === 0) g.pop();
  assert.ok(g.length >= 2, 'Only genuine nonconstant factors are tested');
  const degree = g.length - 1;
  const top = inv(g[degree]);
  for (let i = a.length - 1; i >= degree; i -= 1) {
    const scale = mod(a[i] * top);
    for (let j = 0; j <= degree; j += 1) {
      a[i - degree + j] = mod(a[i - degree + j] - scale * g[j]);
    }
  }
  return a.slice(0, degree);
}
/** @param {number[]} source @param {number[]} factor */
function divides(source, factor) {
  return remainder(source, factor).every(x => x === 0);
}

const ink = load('lp2-ink-annotations.json');
const corpus = load('lp2-corpus.json');
const table = load('base60-grid.json');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const pageByNumber = new Map(corpus.pages.map(page => [page.page, page]));
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
);
const polynomial = bytes.map(byte => byte % 29).reverse();
assert.equal(divides(polynomial, [3, 26, 24]), true, 'Independent signed 2013 BASE29 factor');
assert.equal(divides(polynomial, [27, 5, 15]), true, 'Original p39 red factor');
assert.equal(divides(polynomial, [15, 5, 27]), false, 'Reverse p39 is not a factor');

const rows = [];
for (const page of ink.pages) {
  const source = pageByNumber.get(page.page);
  assert.ok(source);
  for (const span of page.red_spans || []) {
    const indices = Array.from(span.runes, rune => {
      const index = runeIndex.get(rune);
      assert.notEqual(index, undefined);
      return index;
    });
    assert.equal(indices.length, span.length);
    assert.deepEqual(source.indices.slice(span.start, span.start + span.length), indices);
    for (const direction of ['forward', 'reverse']) {
      const candidate = direction === 'forward' ? indices : indices.slice().reverse();
      const residual = remainder(polynomial, candidate);
      rows.push({
        page: page.page, start: span.start, length: span.length,
        direction, zero: residual.every(x => x === 0),
        nonzeroCoefficients: residual.filter(x => x !== 0).length,
      });
    }
  }
}
assert.equal(rows.length, 36, '18 red spans in two source-native directions');
const exact = rows.filter(row => row.zero);
assert.deepEqual(exact, [
  { page: 39, start: 119, length: 3, direction: 'forward',
    zero: true, nonzeroCoefficients: 0 },
]);

// Independent, visually determined terminal 256-rune block is a negative control:
// p54 has 232 original runes followed by the first 24 p55 runes on its first line.
const chapter256 = pageByNumber.get(54).indices.concat(pageByNumber.get(55).indices.slice(0, 24));
assert.equal(chapter256.length, 256);
assert.deepEqual(remainder(chapter256.slice().reverse(), [3, 26, 24]), [19, 4]);
assert.deepEqual(remainder(chapter256.slice().reverse(), [27, 5, 15]), [18, 23]);

console.log('Original source bytes: 256; red spans: 18; directional hypotheses: 36');
console.log('Unique exact red factor: p39 offset119, GP [27,5,15], forward');
console.log('Signed 2013 factor GP [3,26,24] divides original table: YES');
console.log('Independent chapter-p54+24 ciphertext satisfies neither factor: YES');
console.log('No unknown LP2 plaintext or author-selected polynomial consumer recovered.');

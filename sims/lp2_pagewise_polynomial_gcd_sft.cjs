'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const FIELD = 29;
const inverse = Array(FIELD).fill(0);
for (let a = 1; a < FIELD; a++) {
  for (let b = 1; b < FIELD; b++) {
    if ((a * b) % FIELD === 1) {
      inverse[a] = b;
      break;
    }
  }
}

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % FIELD) + FIELD) % FIELD;
}

/** @param {number[]} input @returns {number[]} */
function trim(input) {
  const p = input.slice();
  while (p.length > 1 && p[p.length - 1] === 0) p.pop();
  return p;
}

/** Return the remainder of a(X) divided by b(X) in GF(29)[X]. Coefficients are ascending. 
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function remainder(a, b) {
  const r = trim(a);
  const den = trim(b);
  assert(den.some(Boolean), 'nonzero divisor required');
  const leadInverse = inverse[den[den.length - 1]];
  while (r.length >= den.length && r.some(Boolean)) {
    const offset = r.length - den.length;
    const quotient = mod(r[r.length - 1] * leadInverse);
    for (let i = 0; i < den.length; i++) {
      r[offset + i] = mod(r[offset + i] - quotient * den[i]);
    }
    while (r.length > 1 && r[r.length - 1] === 0) r.pop();
  }
  return r;
}

/** Monic greatest common divisor in GF(29)[X].
 * @param {number[]} x
 * @param {number[]} y
 * @returns {number[]}
 */
function gcd(x, y) {
  let a = trim(x);
  let b = trim(y);
  while (b.some(Boolean)) {
    const r = remainder(a, b);
    a = b;
    b = r;
  }
  const k = inverse[a[a.length - 1]];
  assert(k !== 0);
  return a.map(v => mod(k * v));
}

/** Multiply two polynomials in ascending order over GF(29).
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function product(a, b) {
  const c = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      c[i + j] = mod(c[i + j] + a[i] * b[j]);
    }
  }
  return trim(c);
}

/** Original page begins with the highest coefficient, so reverse into ascending representation. */
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
const polys = pages.map(p => p.indices.slice().reverse());

const histogram = {};
const overlaps = [];
for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    const common = gcd(polys[i], polys[j]);
    const degree = common.length - 1;
    histogram[degree] = (histogram[degree] ?? 0) + 1;
    if (degree >= 2) {
      overlaps.push({ pages: [pages[i].page, pages[j].page], degree, polynomial: common });
    }
  }
}
assert.deepEqual(histogram, { 0: 1399, 1: 85, 2: 1 });
assert.deepEqual(overlaps, [{ pages: [27, 48], degree: 2, polynomial: [0, 6, 1] }]);

const p27 = pages.findIndex(p => p.page === 27);
const p48 = pages.findIndex(p => p.page === 48);
assert.equal(polys[p27][0], 0);
assert.equal(polys[p48][0], 0);
const wrongSource = polys[p48].slice();
wrongSource[0] = 1;
assert.deepEqual(gcd(polys[p27], wrongSource), [1]);

const factor = [1, 3, 5, 1];
const plantedA = product(polys[0], factor);
const plantedB = product(polys[1], factor);
assert(gcd(plantedA, plantedB).length - 1 >= 3);

console.log(JSON.stringify({
  corpus: 'resources/liber-primus/lp2-corpus.json',
  field: FIELD,
  pages: pages.length,
  pairs: 1485,
  gcd_degree_histogram: histogram,
  quadratic_overlap: overlaps,
  wrong_source_gcd: gcd(polys[p27], wrongSource),
  planted_gcd_degree: gcd(plantedA, plantedB).length - 1,
  conclusion: 'No page pair shares a factor of degree >= 3; no common higher-degree fixed generator over all pages.'
}, null, 2));

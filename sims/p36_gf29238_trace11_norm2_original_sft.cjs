'use strict';

/**
 * Original LP2 p36 GF(29^238) trace/norm and independently fixed 2013 DH-number gate.
 * Evidence scope: a source-only numerical relation, with no plaintext claim.
 * Reads the original byte table and GP29 page corpus; no outside library.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'resources', 'liber-primus');
const bytes = JSON.parse(fs.readFileSync(path.join(source, 'base60-grid.json'), 'utf8')).byte_rows.flat();
const corpus = JSON.parse(fs.readFileSync(path.join(source, 'lp2-corpus.json'), 'utf8'));
const degree = 238;
const mod = n => (n % 29 + 29) % 29;

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let n = 1; n < 29; n++) if (mod(x * n) === 1) return n;
  throw Error('nonzero finite-field scalar required');
}

/** @param {number[]} a @returns {number[]} */
function trim(a) {
  while (a.length && a[a.length - 1] === 0) a.pop();
  return a;
}

/** @param {number[]} a @param {number[]} b @returns {[number[],number[]]} */
function divide(a, b) {
  assert.ok(b.length);
  const r = trim(a.slice());
  const q = Array(Math.max(0, r.length - b.length + 1)).fill(0);
  const scale = inverse(b[b.length - 1]);
  while (r.length >= b.length) {
    const offset = r.length - b.length;
    const c = mod(r[r.length - 1] * scale);
    q[offset] = c;
    for (let i = 0; i < b.length; i++) r[offset + i] = mod(r[offset + i] - c * b[i]);
    trim(r);
  }
  return [trim(q), r];
}
assert.equal(bytes.length, 256);
let quotient = trim(bytes.slice().reverse().map(x => x % 29));
for (const f of [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
]) {
  const [q, remainder] = divide(quotient, f);
  assert.equal(remainder.length, 0, 'source factor must divide table polynomial');
  quotient = q;
}
const R = quotient.map(x => mod(x * inverse(quotient[quotient.length - 1])));
assert.equal(R.length, degree + 1);
assert.equal(R[degree], 1);

// Newton sums yield the trace functional on polynomial elements of F29[X]/(R).
const powerSums = Array(degree).fill(0);
powerSums[0] = degree % 29;
for (let k = 1; k < degree; k++) {
  let v = k * R[degree - k];
  for (let j = 1; j < k; j++) v += R[degree - j] * powerSums[k - j];
  powerSums[k] = mod(-v);
}

/** @param {number[]} element @returns {number} */
function fieldTrace(element) {
  return mod(element.reduce((sum, x, i) => sum + x * powerSums[i], 0));
}

/**
 * Independent trace implementation: sum of the diagonal of the 238x238
 * multiplication-by-element matrix, without Newton sums.
 * @param {number[]} element
 * @returns {number}
 */
function matrixTrace(element) {
  let total = 0;
  for (let i = 0; i < degree; i++) {
    const remainder = Array(degree + i).fill(0);
    for (let j = 0; j < degree; j++) remainder[i + j] = element[j];
    for (let k = remainder.length - 1; k >= degree; k--) {
      const c = remainder[k];
      if (c === 0) continue;
      for (let j = 0; j < degree; j++) {
        remainder[k - degree + j] = mod(remainder[k - degree + j] - c * R[j]);
      }
      remainder[k] = 0;
    }
    total = mod(total + remainder[i]);
  }
  return total;
}

/** @param {number} base @param {number} exponent @returns {number} */
function power(base, exponent) {
  let result = 1;
  while (exponent > 0) {
    if (exponent % 2) result = mod(result * base);
    base = mod(base * base);
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

/**
 * Euclidean Sylvester resultant Res(R,element), equal to the full field norm.
 * @param {number[]} A
 * @param {number[]} B
 * @returns {number}
 */
function resultant(A, B) {
  let f = trim(A.slice());
  let g = trim(B.slice());
  let value = 1;
  while (g.length > 1) {
    const d = f.length - 1;
    const e = g.length - 1;
    const [, remainder] = divide(f, g);
    if (!remainder.length) return 0;
    value = mod(value * ((d * e) % 2 ? 28 : 1)
      * power(g[g.length - 1], d - remainder.length + 1));
    f = g;
    g = remainder;
  }
  return mod(value * power(g[0], f.length - 1));
}

const p36 = corpus.pages[36].indices;
assert.equal(p36.length, degree);
const trace = fieldTrace(p36);
const norm = resultant(R, p36);
assert.equal(trace, 11);
assert.equal(norm, 2);
assert.equal(matrixTrace(p36), trace, 'independent multiplication-matrix trace');
assert.equal(matrixTrace([1, ...Array(degree - 1).fill(0)]), degree % 29);
assert.equal(resultant(R, [1]), 1);

const reverse = p36.slice().reverse();
assert.equal(fieldTrace(reverse), 21);
assert.equal(matrixTrace(reverse), 21);
assert.equal(resultant(R, reverse), 26);

const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length >= degree);
const controls = [];
for (const page of pages) {
  for (const [part, vector] of [
    ['first', page.indices.slice(0, degree)],
    ['last', page.indices.slice(-degree)]
  ]) {
    for (const reversed of [false, true]) {
      const v = reversed ? vector.slice().reverse() : vector;
      controls.push({page: page.page, part, reversed, trace: fieldTrace(v), norm: resultant(R, v)});
    }
  }
}
assert.equal(pages.length, 36);
assert.equal(controls.length, 144);
assert.deepEqual(controls.filter(x => x.trace === 11 && x.norm === 2),
  [
    {page: 36, part: 'first', reversed: false, trace: 11, norm: 2},
    {page: 36, part: 'last', reversed: false, trace: 11, norm: 2}
  ]);

// Source-multiset permutation control, fixed pseudorandom experiment.
let seed = 0x16330611;
/** @returns {number} */
function randomUint32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
let traceHits = 0;
let normHits = 0;
let jointHits = 0;
const permutations = 400;
for (let k = 0; k < permutations; k++) {
  const sample = p36.slice();
  for (let j = sample.length - 1; j > 0; j--) {
    const i = randomUint32() % (j + 1);
    [sample[i], sample[j]] = [sample[j], sample[i]];
  }
  const t = fieldTrace(sample);
  const n = resultant(R, sample);
  if (t === 11) traceHits++;
  if (n === 2) normHits++;
  if (t === 11 && n === 2) jointHits++;
}
assert.deepEqual([traceHits, normHits, jointHits], [10, 18, 0]);

// One literal candidate consumer: 238-runic field blocks -> one field norm
// and one field trace. Neither output contains recognizable GP prose.
const original = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
assert.equal(original.length, 12956);
const normStream = [];
const traceStream = [];
for (let i = 0; i + degree <= original.length; i += degree) {
  const block = original.slice(i, i + degree);
  normStream.push(resultant(R, block));
  traceStream.push(fieldTrace(block));
}
assert.equal(normStream.length, 54);
assert.deepEqual(normStream.slice(0, 7), [2, 7, 4, 9, 22, 13, 18]);
assert.deepEqual(traceStream.slice(0, 7), [18, 17, 24, 6, 24, 15, 27]);

console.log(JSON.stringify({
  source: 'LP2 original 256-byte table, complete p36 runes, 2013 DH operator numbers',
  field: 'GF(29^238)',
  p36: {trace, norm, matrixTrace: matrixTrace(p36), reversed: {trace: 21, norm: 26}},
  controls: {pageCount: pages.length, sourceWindows: controls.length, targetMatches: controls.filter(x => x.trace === 11 && x.norm === 2)},
  shuffleControl: {seed: '0x16330611', permutations, traceHits, normHits, jointHits},
  directBlockReadout: {
    runeBlocks: normStream.length,
    norms: normStream,
    traces: traceStream,
    normGP: normStream.map(x => corpus.translit[x]).join(' '),
    traceGP: traceStream.map(x => corpus.translit[x]).join(' ')
  },
  classification: 'Source-only numeric correspondence and negative direct block readout; no recovered unknown LP2 plaintext.'
}, null, 2));

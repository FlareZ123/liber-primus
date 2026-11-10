'use strict';
/**
 * Original-source marked-quadratic cross-page arithmetic.
 *
 * Experimental status: exact inter-artifact relation, no decipherment.
 * Uses only committed original LP2 rune and byte sources; no fitted key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const grid = read('resources/liber-primus/lp2-grid-256.json');
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw new RangeError('Noninvertible element of GF(29): ' + x);
}

/** @param {number[]} a @returns {number[]} */
function trim(a) {
  const i = a.findIndex(x => x !== 0);
  return i < 0 ? [0] : a.slice(i);
}

/**
 * Conventional descending-coefficient polynomial division over GF(29).
 * @param {number[]} source
 * @param {number[]} factor
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(source, factor) {
  const a = trim(source.map(mod));
  const b = trim(factor.map(mod));
  assert(!(b.length === 1 && b[0] === 0));
  if (a.length < b.length) return {quotient:[0],remainder:a};
  const r = a.slice();
  const q = [];
  const unit = inverse(b[0]);
  for (let i = 0; i <= a.length - b.length; i++) {
    const v = mod(r[i] * unit);
    q.push(v);
    for (let j = 0; j < b.length; j++) r[i+j] = mod(r[i+j] - v * b[j]);
  }
  return {quotient:q,remainder:trim(r.slice(a.length - b.length + 1))};
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function gcd(a, b) {
  let x = trim(a.map(mod));
  let y = trim(b.map(mod));
  while (!(y.length === 1 && y[0] === 0)) {
    const next = divide(x, y).remainder;
    x = y;
    y = next;
  }
  const unit = inverse(x[0]);
  return x.map(v => mod(v * unit));
}

/** @param {number[]} a @param {number} root @returns {[number,number]} */
function valueAndDerivative(a, root) {
  let value = 0;
  let derivative = 0;
  for (const x of a) {
    derivative = mod(derivative * root + value);
    value = mod(value * root + x);
  }
  return [value, derivative];
}

/** @param {number[]} a @returns {number} */
function coincidence(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((s, x) => s + x * (x - 1), 0) / (a.length * (a.length - 1));
}

function main() {
  assert.equal(grid.bytes.length, 256);
  assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  const marked = ink.pages.find(p => p.page === 39).red_spans
    .find(s => s.start === 119 && s.length === 3);
  const mark = [...marked.runes].map(g => corpus.runes.indexOf(g));
  assert.deepEqual(mark, [27,5,15]);
  const factor = mark.slice().reverse(); // 15 X^2 + 5 X + 27
  assert.deepEqual(factor, [15,5,27]);

  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
  const doublePages = [];
  const singlePages = [];
  const rotationHits = [];
  let nullNoHit = 1;
  for (const page of pages) {
    const [value, derivative] = valueAndDerivative(page.indices, 24);
    if (value === 0) singlePages.push(page.page);
    if (value === 0 && derivative === 0) doublePages.push(page.page);
    let hits = 0;
    const a = page.indices;
    for (let shift = 0; shift < a.length; shift++) {
      const [v,d] = valueAndDerivative(a.slice(shift).concat(a.slice(0,shift)), 24);
      if (v === 0 && d === 0) hits++;
    }
    if (hits) rotationHits.push({page:page.page,hits,total:a.length});
    nullNoHit *= 1 - hits / a.length;
  }
  assert.deepEqual(singlePages, [10,11,29,36]);
  assert.deepEqual(doublePages, [29]);

  const p29 = pages.find(p => p.page === 29).indices;
  assert.equal(p29.length, 277);
  const p29Divide = divide(p29, factor);
  const gridDivide = divide(grid.bytes, factor);
  assert.deepEqual(p29Divide.remainder, [0]);
  assert.deepEqual(gridDivide.remainder, [0]);
  assert.equal(p29Divide.quotient.length, 275);
  assert.equal(gcd(p29, grid.bytes).join(','), '1,10,25');
  assert(Math.abs(coincidence(p29Divide.quotient) - 0.034054412740544125) < 1e-12);

  // Conventional polynomial Euclidean division, not a decoded instruction.
  const ratio = divide(p29, grid.bytes);
  assert.equal(ratio.quotient.length, 23);
  assert.equal(ratio.remainder.length, 254);
  assert.deepEqual(ratio.quotient, [27,20,4,17,16,18,16,11,8,28,18,16,5,23,12,10,8,25,14,14,15,20,17]);

  const originalRotation = rotationHits.find(r => r.page === 29);
  assert.deepEqual(originalRotation, {page:29,hits:3,total:277});
  const anyRotationProbability = 1 - nullNoHit;
  assert(Math.abs(anyRotationProbability - 0.10847160919347021) < 1e-12);

  console.log(JSON.stringify({
    classification:'EXACT SHARED FACTOR; NO UNKNOWN PLAINTEXT',
    sourceMarker:{page:39,localStart:119,GP:mark,descendingFactor:factor,root:24},
    gridBytes:256,p29Runes:p29.length,
    root24PageHits:singlePages,doubleRoot24PageHits:doublePages,
    gcdTablePage29:[1,10,25],
    page29QuotientRunes:p29Divide.quotient.length,
    gridQuotientSlots:gridDivide.quotient.length,
    page29QuotientIoC:coincidence(p29Divide.quotient),
    page29TableEuclideanQuotientRunes:ratio.quotient.length,
    euclideanQuotientTranslit:ratio.quotient.map(x=>corpus.translit[x]).join(''),
    cyclicShiftNull:{perPageDoubleRootHits:rotationHits,
      anyPageConditionalProbability:anyRotationProbability,
      page29ConditionalProbability:3/277},
    conclusion:'The original table and p29 share the marked p39 double-root factor. Quotients do not reveal language; selection and significance remain unresolved.'
  },null,2));
}
if (require.main === module) main();
module.exports = {divide,gcd,valueAndDerivative,main};

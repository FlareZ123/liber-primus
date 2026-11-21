'use strict';

/**
 * LP2 original-source SFT: p23 red center + p39 red triad divide table p49–51.
 * Node.js 22 CommonJS, Windows-compatible; run from repository root.
 * Read-only, no dependencies and no inferred plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const source = (name) => path.join(process.cwd(), 'resources', 'liber-primus', name);
const json = (name) => JSON.parse(fs.readFileSync(source(name), 'utf8'));
const digest = (x) => crypto.createHash('sha256').update(x).digest('hex');
const mod = (x) => (x % 29 + 29) % 29;
const originalH = [3, 26, 24]; // Signed 2013 BASE29 3301 -> 3QO.
const originalG = [27, 5, 15]; // Physical p39 isolated red triad.

for (const [name, sha] of [
  ['40.jpg', 'd31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee'],
  ['56.jpg', 'd1b7ea5a6ffb79709753e3565d1d46e05edbe3d82ca70c3ed6065d46b131bd00'],
  ['66.jpg', 'aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335'],
  ['67.jpg', 'bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776'],
  ['68.jpg', '2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b'],
]) assert.equal(digest(fs.readFileSync(source(name))), sha, name);

const ink = json('lp2-ink-annotations.json');
const corpus = json('lp2-corpus.json');
const grid = json('lp2-grid-256.json');
const pages = fs.readFileSync(source('lp2-transcription.txt'), 'utf8').split('%');
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));
const bytes = grid.pages.flatMap((p) => p.bytes);
assert.equal(pages.length, 57); // Runeless p50 is absent from this transcription.
assert.equal(bytes.length, 256);
assert.equal(digest(Buffer.from(bytes)), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const inverse = Array(29).fill(0);
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) if (a * b % 29 === 1) inverse[a] = b;
}

/** @param {number[]} stream @param {number[]} polynomial @returns {number[] | null} */
function remainderQuadratic(stream, polynomial) {
  const [a, b, c] = polynomial;
  if (c === 0) return null;
  const ic = inverse[c];
  let r0 = 0, r1 = 0;
  for (const value of stream) {
    const next = mod(value - r1 * a * ic);
    r1 = mod(r0 - r1 * b * ic);
    r0 = next;
  }
  return [r0, r1];
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
  return result;
}

/** @param {number[]} stream @param {number[]} polynomial */
function divideDescending(stream, polynomial) {
  const a = stream.map(mod), degree = polynomial.length - 1, q = [];
  const leadingInverse = inverse[polynomial[degree]];
  for (let i = 0; i < stream.length - degree; i++) {
    const value = mod(a[i] * leadingInverse);
    q.push(value);
    for (let j = 0; j <= degree; j++)
      a[i + j] = mod(a[i + j] - value * polynomial[degree - j]);
  }
  return { quotient: q, remainder: a.slice(-degree) };
}

const spans = [];
for (const page of ink.pages) {
  const raw = pages[page.page > 50 ? page.page - 1 : page.page];
  let cursor = 0;
  const values = [], separators = [];
  for (const rune of raw) {
    if (index.has(rune)) {
      values.push(index.get(rune));
      cursor++;
    }
    if ('-.$&§'.includes(rune)) separators.push(cursor);
  }
  assert.equal(values.length, page.rune_count);
  for (const marked of page.red_spans || []) {
    const digits = [...marked.runes].map((rune) => index.get(rune));
    assert.deepEqual(values.slice(marked.start, marked.start + marked.length), digits);
    const bounds = separators
      .filter((n) => n > marked.start && n < marked.start + marked.length)
      .map((n) => n - marked.start);
    const starts = [];
    for (const n of bounds) {
      if (n >= 2 && n + 1 <= digits.length) starts.push(n - 2);
      if (n >= 1 && n + 2 <= digits.length) starts.push(n - 1);
    }
    spans.push({
      page: page.page, offset: marked.start, digits, bounds, starts,
      centered: digits.length % 2 === 0 && bounds.includes(digits.length / 2),
    });
  }
}
assert.equal(spans.length, 18);
const central = spans.filter((span) => span.centered);
assert.deepEqual(central.map((span) => span.page), [23]);
assert.deepEqual(central[0].bounds, [2, 8, 11]);
assert.deepEqual(central[0].digits,
  [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26]);
const redH = central[0].digits.slice(6, 9);
assert.deepEqual(redH, [23, 6, 10]);
assert.deepEqual(redH, originalH.map((digit) => mod(27 * digit)));
assert.deepEqual(spans.find((span) => span.page === 39).digits, originalG);
assert.deepEqual(remainderQuadratic(bytes, redH), [0, 0]);
assert.deepEqual(remainderQuadratic(bytes, originalG), [0, 0]);
assert.deepEqual(remainderQuadratic(bytes, central[0].digits.slice(7, 10)), [25, 25]);

const crossing = spans.flatMap((span) => span.starts.map((i) => ({
  page: span.page, offset: span.offset + i, digits: span.digits.slice(i, i + 3),
})));
assert.equal(crossing.length, 69);
const matches = crossing.filter((row) => {
  const r = remainderQuadratic(bytes, row.digits);
  return r && r.every((digit) => digit === 0);
});
assert.deepEqual(matches, [{ page: 23, offset: 6, digits: [23, 6, 10] }]);

const rg = multiply(redH, originalG);
assert.deepEqual(rg, [12, 16, 7, 24, 5]);
const { quotient: q, remainder } = divideDescending(bytes, rg);
assert.equal(q.length, 252);
assert.deepEqual(remainder, [0, 0, 0, 0]);
assert.deepEqual(q.slice(0, 12), [0, 23, 10, 15, 28, 2, 3, 4, 20, 15, 4, 6]);
const oldQ = divideDescending(bytes, multiply(originalH, originalG)).quotient;
assert.deepEqual(q, oldQ.map((digit) => mod(14 * digit))); // No independent new key entropy.
const damaged = bytes.slice();
damaged[0] = (damaged[0] + 1) % 256;
assert.ok(divideDescending(damaged, rg).remainder.some((n) => n !== 0));

// Exhaustive monic quadratic factor list for the exact unchanged 256-byte table.
const factors = [];
for (let a = 0; a < 29; a++)
  for (let b = 0; b < 29; b++)
    if (remainderQuadratic(bytes, [a, b, 1]).every((n) => n === 0))
      factors.push([a, b]);
assert.deepEqual(factors, [[11, 18], [25, 10]]);

function isFactor(a, b, c) {
  if (c === 0) return false;
  const aa = a * inverse[c] % 29, bb = b * inverse[c] % 29;
  return factors.some(([x, y]) => x === aa && y === bb);
}

// Null: shuffle each true red span's original rune multiset independently,
// retaining all 35 original within-red word breaks and both 2|1,1|2 reads.
let seed = 0x25eed157;
function randomInt(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}
const runs = 200000;
let anyHit = 0, centerHit = 0;
const histogram = [0, 0, 0, 0, 0, 0];
for (let t = 0; t < runs; t++) {
  let hits = 0, centralHit = false;
  for (const span of spans) {
    const permuted = span.digits.slice();
    for (let j = permuted.length - 1; j > 0; j--) {
      const k = randomInt(j + 1);
      [permuted[j], permuted[k]] = [permuted[k], permuted[j]];
    }
    for (const i of span.starts) {
      if (isFactor(permuted[i], permuted[i + 1], permuted[i + 2])) {
        hits++;
        if (span.page === 23 && (i === 6 || i === 7)) centralHit = true;
      }
    }
  }
  if (hits >= 1) anyHit++;
  if (centralHit) centerHit++;
  histogram[Math.min(hits, 5)]++;
}
assert.equal(anyHit, 25122);
assert.equal(centerHit, 824);
assert.deepEqual(histogram, [174878, 23533, 1528, 61, 0, 0]);

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
const page = (n) => corpus.pages.find((p) => p.page === n).indices;
for (const [name, original] of [
  ['p23', page(23)], ['p55', page(55)], ['posttable p51+p52', [...page(51), ...page(52)]],
]) {
  const minus = original.map((digit, i) => mod(digit - q[i % 252]));
  const plus = original.map((digit, i) => mod(digit + q[i % 252]));
  console.log(name + ': length=' + original.length + ', IoC original=' + ioc(original).toFixed(9)
    + ', C-Q=' + ioc(minus).toFixed(9) + ', C+Q=' + ioc(plus).toFixed(9));
}
console.log('PASS: 18 source red spans, unique p23 midpoint, 69 boundary candidates');
console.log('PASS: p23 red H (scalar27), p39 red G, 256-byte four-zero syndrome, Q length252');
console.log('NULL: ' + anyHit + '/' + runs + ' any factor; ' + centerHit + '/' + runs + ' p23 center');
console.log('NO PLAINTEXT: reversible quotient key reads remain ciphertext-like');

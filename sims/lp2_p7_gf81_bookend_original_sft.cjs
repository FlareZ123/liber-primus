'use strict';

/**
 * Source-fixed GF(3^4) / 81²→80² candidate, original GP29 ciphertext.
 * Read-only, single-file Windows Node 22 test.
 * Run: node sims/lp2_p7_gf81_bookend_original_sft.cjs
 *
 * The 81/80 interpretation is a hypothesis. It is not an LP2 decipherment.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const ink = require('../resources/liber-primus/lp2-ink-annotations.json');

const mod3 = (v) => ((v % 3) + 3) % 3;
const idx = (v, i) => Math.floor(v / 3 ** i) % 3;
const source = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(source.length, 12956);

const p7 = corpus.pages[7];
const marked = ink.pages.find((p) => p.page === 7).red_spans;
assert.equal(marked.length, 1);
assert.equal(marked[0].start, 194);
assert.equal(marked[0].length, 14);
const lastRed = p7.indices.slice(194);
assert.equal(lastRed.length, 14);
assert.equal(lastRed.map((n) => corpus.runes[n]).join(''), marked[0].runes);
const redWordLengths = [2, 4, 3, 2, 3];
let at = 0;
const products = redWordLengths.map((len) => {
  let product = 1;
  for (let j = 0; j < len; j++) product = (product * lastRed[at++]) % 29;
  return product;
});
assert.equal(at, 14);
assert.deepEqual(products, [11, 26, 8, 15, 2]);

// Five source GP products interpreted as ascending quartic coefficients modulo 3.
const residue = products.map((n) => n % 3);
assert.equal(residue[4], 2);
const f = residue.map((n) => (2 * n) % 3); // Make the leading term monic.
assert.deepEqual(f, [1, 1, 1, 0, 1]);

// Exact GF(3) irreducibility: a degree-four polynomial has no linear or
// quadratic factors iff it has no roots and is divisible by no monic quadratic.
for (let v = 0; v < 3; v++) {
  const value = f.reduce((sum, coeff, i) => sum + coeff * v ** i, 0);
  assert.notEqual(value % 3, 0, 'quartic must lack GF(3) roots');
}
for (let a = 0; a < 3; a++) {
  for (let b = 0; b < 3; b++) {
    const rem = f.slice();
    for (let degree = 4; degree >= 2; degree--) {
      const top = rem[degree];
      rem[degree] = 0;
      rem[degree - 1] = mod3(rem[degree - 1] - top * a);
      rem[degree - 2] = mod3(rem[degree - 2] - top * b);
    }
    assert.ok(rem[0] !== 0 || rem[1] !== 0, 'quartic must lack quadratic factors');
  }
}

/** @param {number} a Field element encoded as four little-endian ternary digits. */
/** @param {number} b Field element encoded as four little-endian ternary digits. */
function multiply(a, b) {
  const c = Array(7).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) c[i + j] = mod3(c[i + j] + idx(a, i) * idx(b, j));
  }
  for (let degree = 6; degree >= 4; degree--) {
    const high = c[degree];
    for (let j = 0; j < 4; j++) c[degree - 4 + j] = mod3(c[degree - 4 + j] - high * f[j]);
    c[degree] = 0;
  }
  return c[0] + 3 * c[1] + 9 * c[2] + 27 * c[3];
}

let power = 1;
const units = [];
for (let i = 0; i < 80; i++) {
  units.push(power);
  power = multiply(power, 4); // x+1, a primitive GF(81)* element.
}
assert.equal(power, 1);
assert.equal(new Set(units).size, 80);
assert.deepEqual(units.slice(0, 6), [1, 4, 16, 28, 45, 17]);

const head = source.slice(0, 6561);
const rawTail = source.slice(6561);
assert.equal(head.length, 81 ** 2);
assert.equal(rawTail.length, 80 ** 2 - 5);
// Exact duplicate two-word bookend, first ends at the 81² cut.
assert.deepEqual(source.slice(6555, 6561), source.slice(12950, 12956));

// Five physically printed paragraph ordinals, in source order.
// Their positions as EMPTY CELLS after successive insertion are fixed in
// im-results/bookend-81x81-80x80-ordinal-insertion.md.
const ordinalSlots = [2244, 2384, 2476, 2575, 2672];
const tail = rawTail.slice();
for (const slot of ordinalSlots) tail.splice(slot, 0, -1);
assert.equal(tail.length, 6400);
assert.deepEqual(ordinalSlots.map((n) => [Math.floor(n / 80), n % 80]), [
  [28, 4], [29, 64], [30, 76], [32, 15], [33, 32],
]);

/** @param {number} r Row 0..79. @param {number} c Column 0..79. */
function fieldKey(r, c) {
  return head[81 * units[r] + units[c]];
}

/** @param {number[]} input 6400-slot register, with -1 for five ordinals. */
/** @param {number} sign -1 or +1 in GP29. */
function apply(input, sign) {
  const result = [];
  for (let r = 0; r < 80; r++) {
    for (let c = 0; c < 80; c++) {
      const token = input[r * 80 + c];
      if (token < 0) continue;
      result.push(((token + sign * fieldKey(r, c)) % 29 + 29) % 29);
    }
  }
  return result;
}

/** @param {number[]} values GP29 indices. */
function metrics(values) {
  const counts = Array(29).fill(0);
  values.forEach((n) => counts[n]++);
  return {
    ioc: counts.reduce((a, b) => a + b * (b - 1), 0) / (values.length * (values.length - 1)),
    top12: counts.sort((a, b) => b - a).slice(0, 12).reduce((a, b) => a + b, 0),
  };
}

/** An all-secret, row/column-local glyph-map necessary-condition test. */
function mapConflicts(transpose, byColumn) {
  const maps = Array.from({ length: 80 }, () => Array(29).fill(-1));
  let revisits = 0;
  let contradictions = 0;
  for (let r = 0; r < 80; r++) {
    for (let c = 0; c < 80; c++) {
      const out = tail[80 * r + c];
      if (out < 0) continue;
      const src = head[81 * units[transpose ? c : r] + units[transpose ? r : c]];
      const group = byColumn ? c : r;
      const old = maps[group][src];
      if (old !== -1) {
        revisits++;
        if (old !== out) contradictions++;
      } else maps[group][src] = out;
    }
  }
  return { revisits, contradictions };
}

console.log('P7 red word products:', products);
console.log('Irreducible quartic over GF(3), low→high:', f);
console.log('GF81 nonzero generator x+1 has period:', units.length);
console.log('81² / (80² - 5) registers:', head.length, rawTail.length);
console.log('Known solved p57 GP29:', metrics(corpus.pages[57].indices));
console.log('Original full unknown ciphertext:', metrics(source));
for (const sign of [-1, 1]) {
  const decoded = apply(tail, sign);
  const stat = metrics(decoded);
  console.log('Original GF81 field-indexed additive', sign, stat,
    'first GP indices', decoded.slice(0, 24));
  assert.ok(stat.ioc < 0.04, 'unexpected original result requires investigation');
}
for (const transpose of [false, true]) {
  for (const byColumn of [false, true]) {
    const stat = mapConflicts(transpose, byColumn);
    console.log('Arbitrary secret row/column glyph-map', { transpose, byColumn, ...stat });
    assert.ok(stat.contradictions > 4000, 'new source relationship requires investigation');
  }
}

// Fully source-native 6395-rune POSITIVE: a genuine solved GP paragraph is
// encrypted with the exact unchanged 6400-slot field key and all five holes.
const solved = corpus.pages[57].indices;
const planted = tail.slice();
const expected = [];
let k = 0;
for (let r = 0; r < 80; r++) {
  for (let c = 0; c < 80; c++) {
    const slot = 80 * r + c;
    if (planted[slot] < 0) continue;
    const plain = solved[k++ % solved.length];
    expected.push(plain);
    planted[slot] = (plain + fieldKey(r, c)) % 29;
  }
}
assert.equal(expected.length, 6395);
assert.deepEqual(apply(planted, -1), expected);
console.log('Native solved-p57 planted round trip: PASS (synthetic, not LP2 plaintext)');
console.log('GF81 original-source decision: direct additive and secret row/column maps NEGATIVE');

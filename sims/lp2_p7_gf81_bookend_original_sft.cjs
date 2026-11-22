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

const p8 = corpus.pages[8];
const p8Red = ink.pages.find((p) => p.page === 8).red_spans;
assert.equal(p8Red.length, 1);
assert.equal(p8Red[0].start, 0);
assert.equal(p8Red[0].length, 12);
assert.equal(p8.runic_count - 12, 243); // The full black body is exactly 3^5 runes.
const p8SourceRed = p8.indices.slice(0, 12);
assert.equal(p8SourceRed.map((n) => corpus.runes[n]).join(''), p8Red[0].runes);
const p8WordProducts = [[0, 4], [4, 12]].map(([start, end]) =>
  p8SourceRed.slice(start, end).reduce((acc, rune) => (acc * rune) % 29, 1));
assert.deepEqual(p8WordProducts, [4, 3]); // Original source printed words XIXM / UXMCTHPOB.
assert.equal(p8SourceRed.at(-1), 17);


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
function multiply(a, b, modulus = f) {
  const c = Array(7).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) c[i + j] = mod3(c[i + j] + idx(a, i) * idx(b, j));
  }
  for (let degree = 6; degree >= 4; degree--) {
    const high = c[degree];
    for (let j = 0; j < 4; j++) c[degree - 4 + j] = mod3(c[degree - 4 + j] - high * modulus[j]);
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

assert.equal(units[5], p8SourceRed.at(-1)); // First P8 red product = x+1, ^5 = last red GP index.
assert.equal(p8WordProducts[0], 4); // x+1 in the ternary polynomial basis.
assert.equal(p8WordProducts[1], 3); // x in that same basis.

/**
 * Exhaust only the 29² alternative GP29 quartics already fixed by the
 * independently published constraints P(3)=3, P(4)=4 and P'(4)=17.
 * This is a conditional source-mathematics counterfactual, not a text cipher sweep.
 * @param {number[]} poly Monic degree-4 coefficients in GF(3), low degree first.
 */
function isIrreducible(poly) {
  for (let v = 0; v < 3; v++) {
    if (poly.reduce((a, q, i) => a + q * v ** i, 0) % 3 === 0) return false;
  }
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const rem = poly.slice();
      for (let degree = 4; degree >= 2; degree--) {
        const high = rem[degree];
        rem[degree] = 0;
        rem[degree - 1] = mod3(rem[degree - 1] - high * a);
        rem[degree - 2] = mod3(rem[degree - 2] - high * b);
      }
      if (rem[0] === 0 && rem[1] === 0) return false;
    }
  }
  return true;
}

/** @param {number} value GF81 element. @param {number} power Nonnegative exponent. @param {number[]} polynomial */
function powerField(value, power, polynomial) {
  let out = 1;
  let base = value;
  let exponent = power;
  while (exponent > 0) {
    if (exponent % 2 === 1) out = multiply(out, base, polynomial);
    base = multiply(base, base, polynomial);
    exponent = Math.floor(exponent / 2);
  }
  return out;
}

// Exact algebraic selector from ORIGINAL P8 alone: with the printed products
// 4=x+1 and 3=x, fifth-power target 17=2+2x+x²:
// (x+1)^5 - (x²+2x+2) = (x-1) * (x⁴+x²+x+1) over GF(3).
const binomial5 = [1, 2, 1, 1, 2, 1];
const target17 = [2, 2, 1, 0, 0, 0];
const polynomialDifference = binomial5.map((value, i) => mod3(value - target17[i]));
const productPolynomial = Array(6).fill(0);
for (let i = 0; i < f.length; i++) {
  productPolynomial[i] = mod3(productPolynomial[i] + 2 * f[i]);
  productPolynomial[i + 1] = mod3(productPolynomial[i + 1] + f[i]);
}
assert.deepEqual(polynomialDifference, [2, 0, 0, 1, 2, 1]);
assert.deepEqual(productPolynomial, polynomialDifference);
let monicQuartics = 0;
let irreducibleQuartics = 0;
const fifthPowerPolynomials = [];
for (let q0 = 0; q0 < 3; q0++) {
  for (let q1 = 0; q1 < 3; q1++) {
    for (let q2 = 0; q2 < 3; q2++) {
      for (let q3 = 0; q3 < 3; q3++) {
        const candidate = [q0, q1, q2, q3, 1];
        monicQuartics++;
        if (isIrreducible(candidate)) irreducibleQuartics++;
        if (powerField(4, 5, candidate) === 17) fifthPowerPolynomials.push(candidate);
      }
    }
  }
}
assert.equal(monicQuartics, 81);
assert.equal(irreducibleQuartics, 18);
assert.deepEqual(fifthPowerPolynomials, [f]); // Unique monic quartic, even among reducible ones.

let alternativeCount = 0;
let irreducibleCount = 0;
let primitiveCount = 0;
const fifthPowerMatches = [];
for (let a3 = 0; a3 < 29; a3++) {
  for (let a4 = 0; a4 < 29; a4++) {
    const a2 = ((16 - 11 * a3 - 81 * a4) % 29 + 29) % 29;
    const a1 = ((1 - 37 * a3 - 175 * a4 - 7 * a2) % 29 + 29) % 29;
    const a0 = ((3 - 27 * a3 - 81 * a4 - 3 * a1 - 9 * a2) % 29 + 29) % 29;
    const a = [a0, a1, a2, a3, a4];
    alternativeCount++;
    const val29 = (z) => a.reduce((sum, q, i) => sum + q * z ** i, 0) % 29;
    const derivative29 = a.reduce((sum, q, i) => sum + i * q * 4 ** Math.max(0, i - 1), 0) % 29;
    assert.equal(val29(3), 3);
    assert.equal(val29(4), 4);
    assert.equal(derivative29, 17);
    if (a4 % 3 === 0) continue;
    const multiplier = a4 % 3;
    const poly = a.map((v) => (v * multiplier) % 3); // multiplier^-1 = multiplier in GF3.
    if (!isIrreducible(poly)) continue;
    irreducibleCount++;
    const primitive = powerField(4, 80, poly) === 1 &&
      powerField(4, 40, poly) !== 1 && powerField(4, 16, poly) !== 1;
    if (primitive) primitiveCount++;
    if (powerField(4, 5, poly) === 17) fifthPowerMatches.push({ coefficients: a, primitive });
  }
}
assert.equal(alternativeCount, 841);
assert.equal(irreducibleCount, 114);
assert.equal(primitiveCount, 54);
assert.equal(fifthPowerMatches.length, 6);
assert.ok(fifthPowerMatches.every((candidate) => candidate.primitive));
assert.ok(fifthPowerMatches.some(({ coefficients }) =>
  coefficients.every((v, i) => v === products[i])));


// Direct p8 3^5 interpretation gate: its 243 original black rune residues
// are not a full cyclic ternary de Bruijn sequence of order 5.
const p8BlackTrits = p8.indices.slice(12).map((n) => n % 3);
assert.equal(p8BlackTrits.length, 243);
/** @param {number[]} trits Integer values 0,1,2. */
function cyclicFiveWindowCount(trits) {
  const seen = new Set();
  for (let i = 0; i < trits.length; i++) {
    let state = 0;
    for (let j = 0; j < 5; j++) state = state * 3 + trits[(i + j) % trits.length];
    seen.add(state);
  }
  return seen.size;
}
assert.equal(cyclicFiveWindowCount(p8BlackTrits), 161);
// Independent 243-symbol de Bruijn positive: Fredricksen–Kessler–Maiorana.
function deBruijn3Order5() {
  const alphabetSize = 3;
  const order = 5;
  const work = Array(alphabetSize * order + 1).fill(0);
  const output = [];
  function visit(t, p) {
    if (t > order) {
      if (order % p === 0) for (let i = 1; i <= p; i++) output.push(work[i]);
    } else {
      work[t] = work[t - p];
      visit(t + 1, p);
      for (let i = work[t - p] + 1; i < alphabetSize; i++) {
        work[t] = i;
        visit(t + 1, t);
      }
    }
  }
  visit(1, 1);
  return output;
}
const positiveDeBruijn = deBruijn3Order5();
assert.equal(positiveDeBruijn.length, 243);
assert.equal(cyclicFiveWindowCount(positiveDeBruijn), 243);

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
console.log('Original P8 red products, final rune, and black length:',
  p8WordProducts, p8SourceRed.at(-1), p8.runic_count - 12);
console.log('GF81 (x+1)^5 = P8 final red index:', units[5]);
console.log('Unique monic quartic among 81 satisfying P8 primitive fifth-power relation:', fifthPowerPolynomials);
console.log('Conditional 841 P8-fixed quartics: irreducible, primitive, fifth-hits:',
  irreducibleCount, primitiveCount, fifthPowerMatches.length);
console.log('All six fifth-hit GP29 coefficient vectors:', fifthPowerMatches);
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
console.log('P8 black 243 trit cyclic five-window distinct states:',
  cyclicFiveWindowCount(p8BlackTrits), '(positive 243)');
console.log('GF81 original-source decision: direct additive, secret row/column maps and direct de Bruijn NEGATIVE');

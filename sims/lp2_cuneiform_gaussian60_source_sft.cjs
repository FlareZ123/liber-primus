'use strict';

/**
 * Original-source, no-fitted-key GP29 test of the Gaussian (sum-of-two-squares)
 * interpretation of cuneiform primes 1033 and 3301.
 *
 * The two-square decomposition, matrix action, phase-zero clock and choice of
 * receiver are researcher hypotheses, not authenticated Cicada instructions.
 * Run from the repository root: node sims/lp2_cuneiform_gaussian60_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8')).byte_rows;
const mod = (x, n = 29) => ((x % n) + n) % n;
const I = [[1, 0], [0, 1]];

/** @param {number} n @returns {[number, number]} */
function canonicalSquares(n) {
  for (let a = 0; a * a <= n; a++) {
    const b = Math.round(Math.sqrt(n - a * a));
    if (b >= a && a * a + b * b === n) return [a, b];
  }
  throw new Error('Not a sum of two integer squares: ' + n);
}

/** @param {number[][]} a @param {number[][]} b */
function mul(a, b) {
  return [
    [mod(a[0][0] * b[0][0] + a[0][1] * b[1][0]),
      mod(a[0][0] * b[0][1] + a[0][1] * b[1][1])],
    [mod(a[1][0] * b[0][0] + a[1][1] * b[1][0]),
      mod(a[1][0] * b[0][1] + a[1][1] * b[1][1])]
  ];
}

/** @param {number[][]} base @param {number} length */
function powers(base, length) {
  const out = [I];
  for (let i = 1; i <= length; i++) out.push(mul(out[i - 1], base));
  return out;
}

/** @param {number[]} input @param {number[][][]} mats */
function blockTransform(input, mats) {
  assert.equal(input.length % 2, 0);
  const out = [];
  for (let j = 0; j < input.length / 2; j++) {
    const a = input[2 * j];
    const b = input[2 * j + 1];
    const M = mats[j % 60];
    out.push(mod(M[0][0] * a + M[0][1] * b));
    out.push(mod(M[1][0] * a + M[1][1] * b));
  }
  return out;
}

/** @param {number[]} input @param {number} alphabet */
function ioc(input, alphabet = 29) {
  const count = Array(alphabet).fill(0);
  input.forEach(x => { assert(x >= 0 && x < alphabet); count[x]++; });
  return count.reduce((sum, n) => sum + n * (n - 1), 0) / (input.length * (input.length - 1));
}

/** @param {number} a */
function inverse29(a) {
  for (let k = 1; k < 29; k++) if (mod(a * k) === 1) return k;
  throw new Error('Noninvertible GF29 residue: ' + a);
}

/**
 * Natural projective coordinate: GP29 rune x means [x:1], 29 means [1:0].
 * @param {number[][]} M @param {number} x
 */
function projective(M, x) {
  const numerator = x === 29 ? M[0][0] : mod(M[0][0] * x + M[0][1]);
  const denominator = x === 29 ? M[1][0] : mod(M[1][0] * x + M[1][1]);
  return denominator === 0 ? 29 : mod(numerator * inverse29(denominator));
}

/** @param {number[][]} rows */
function clockwisePerimeter(rows) {
  assert.equal(rows.length, 32);
  rows.forEach(row => assert.equal(row.length, 8));
  const out = rows[0].slice();
  for (let r = 1; r < 32; r++) out.push(rows[r][7]);
  for (let c = 6; c >= 0; c--) out.push(rows[31][c]);
  for (let r = 30; r >= 1; r--) out.push(rows[r][0]);
  assert.equal(out.length, 76);
  return out;
}

function main() {
  assert.deepEqual(canonicalSquares(1033), [3, 32]);
  assert.deepEqual(canonicalSquares(3301), [30, 49]);
  // Original row order: 1033 = 3^2+32^2; 3301 = 30^2+49^2.
  const M = [[3, mod(32)], [mod(30), mod(49)]];
  const N = [[9, 3], [1, 26]];
  assert.deepEqual(M, [[3, 3], [1, 20]]);
  assert.equal(mod(3 * 49 - 32 * 30), 28);
  assert.deepEqual(mul(M, N), I);
  assert.deepEqual(mul(N, M), I);
  const forward = powers(M, 60);
  const backward = powers(N, 60);
  assert.deepEqual(forward[15], [[17, 0], [0, 17]]);
  assert.deepEqual(forward[30], [[28, 0], [0, 28]]);
  assert.deepEqual(forward[60], I);
  assert(forward.slice(1, 60).every(a => JSON.stringify(a) !== JSON.stringify(I)));
  for (let i = 0; i < 60; i++) assert.deepEqual(mul(forward[i], backward[i]), I);

  // Two independent original receiver clocks: full 7-page span, and the
  // actual rune-bracketed section (p33 offset91 to p39 offset119).
  const full = corpus.pages.slice(33, 40).flatMap(page => page.indices);
  const bracketed = corpus.pages[33].indices.slice(91)
    .concat(corpus.pages.slice(34, 39).flatMap(page => page.indices),
      corpus.pages[39].indices.slice(0, 119));
  assert.equal(full.length, 1680);  // 840 pairs = exactly 14 x 60
  assert.equal(bracketed.length, 1468);  // 734 pairs; independent original brackets

  for (const [label, source, expected] of [
    ['full pages', full, [0.03465356362914433, 0.03436711194305]],
    ['actual bracket', bracketed, [0.03464130953641326, 0.034651525198323145]]
  ]) {
    for (const [j, mats, inverse] of [[0, forward, backward], [1, backward, forward]]) {
      const output = blockTransform(source, mats);
      const value = ioc(output);
      assert(Math.abs(value - expected[j]) < 1e-14);
      assert.deepEqual(blockTransform(output, inverse), source);
      console.log(label + ', ' + (j ? 'M^-j' : 'M^j') +
        ': runes=' + output.length + ', IoC=' + value.toFixed(12) +
        ', prefix=' + output.slice(0, 30).map(x => corpus.translit[x]).join(' '));
    }
  }

  // A separate, explicitly hypothetical transport uses table-perimeter
  // bytes as projective powers. Since M^15 is scalar, exponents are mod15.
  const ring = clockwisePerimeter(grid);
  const target = corpus.pages[55].indices;
  assert.equal(target.length, 76);
  for (const sign of [1, -1]) {
    const decoded = target.map((x, i) =>
      projective(forward[mod(sign * ring[i], 15)], x));
    const reversed = decoded.map((x, i) =>
      projective(forward[mod(-sign * ring[i], 15)], x));
    assert.deepEqual(reversed, target);
    const poles = decoded.flatMap((x, i) => x === 29 ? [i] : []);
    assert.deepEqual(poles, sign > 0 ? [13, 19, 21, 32, 58] : [56, 59]);
    const hist = Array(30).fill(0);
    decoded.forEach(x => { hist[x]++; });
    const gpRate = hist.slice(0, 29).reduce((n, count) =>
      n + count * (count - 1), 0) / (76 * 75);
    const expected = sign > 0 ? 0.030877192982456142 : 0.0343859649122807;
    assert(Math.abs(gpRate - expected) < 1e-14);
    console.log('p55 projective, sign=' + sign +
      ': poles=' + poles.join(',') + ', GP29 pair IoC=' + gpRate.toFixed(12));
  }

  // Complete 1680-rune positive plant: p57's genuine clear rune text,
  // no guessed source key, all 14 cycles of the derived order60 matrix.
  const known = corpus.pages[57].indices;
  assert.equal(known.length, 95);
  const plain = Array.from({ length: 1680 }, (_, i) => known[i % known.length]);
  for (const [encrypt, decrypt] of [[forward, backward], [backward, forward]]) {
    assert.deepEqual(blockTransform(blockTransform(plain, encrypt), decrypt), plain);
  }
  console.log('PASS: 1033/3301 sum-of-squares gives M order60; no original GP plaintext from fixed inverses.');
}

main();

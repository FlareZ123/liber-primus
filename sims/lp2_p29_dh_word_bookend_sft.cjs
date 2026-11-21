'use strict';

/**
 * Original p29 whole-word boundary to the independently authenticated 2013 DH23
 * worked example. Research SFT: a finite exact source test, not a plaintext claim.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(repoRoot, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const originalText = fs.readFileSync(
  path.join(repoRoot, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const p29 = pages.find((page) => page.page === 29);
assert(p29);
assert.equal(pages.length, 55);
assert.equal(p29.indices.length, 277);

const signedDh = Object.freeze({
  p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2,
});
const mod29 = (value) => ((value % 29) + 29) % 29;

/** @param {number} base @param {number} power @param {number} prime */
function powMod(base, power, prime) {
  let value = 1;
  for (let step = 0; step < power; step++) value = (value * base) % prime;
  return value;
}

assert.equal(powMod(signedDh.g, signedDh.a, signedDh.p), signedDh.A);
assert.equal(powMod(signedDh.g, signedDh.b, signedDh.p), signedDh.B);
assert.equal(powMod(signedDh.B, signedDh.a, signedDh.p), signedDh.K);

const startExpected = [signedDh.K, signedDh.p, signedDh.a];
const endExpected = [signedDh.a, signedDh.A, signedDh.B];
assert.deepEqual(p29.indices.slice(0, 3), startExpected);
assert.deepEqual(p29.indices.slice(-3), endExpected);

const p29Print = originalText.split('%')[29].trim();
assert.match(p29Print, /^ᚦᛞᚷ-/u, 'First three runes must be a complete printed word');
assert.match(p29Print, /-ᚷᚻᛗ\/\s*$/u, 'Last three runes must be a complete printed word');

const G = [mod29(-signedDh.K), signedDh.g, signedDh.b];
assert.deepEqual(G, [27, 5, 15]);
const root = 3301 % 29;
const gAtRoot = mod29(G[0] + G[1] * root + G[2] * root * root);
const gDerivative = mod29(G[1] + 2 * G[2] * root);
assert.deepEqual([gAtRoot, gDerivative], [0, 0]);

/** Polynomial coefficients are in original high-to-low source order.
 *  @param {number[]} coefficients
 *  @param {number} at
 */
function evalPoly(coefficients, at) {
  return coefficients.reduce((v, c) => mod29(v * at + c), 0);
}

const derivative = p29.indices.slice(0, -1).map(
  (v, i) => mod29(v * (p29.indices.length - 1 - i))
);
assert.equal(evalPoly(p29.indices, root), 0);
assert.equal(evalPoly(derivative, root), 0);

const dhValues = new Set(Object.values(signedDh));
assert.equal(dhValues.size, 7);
const ranking = pages.map((page) => ({
  page: page.page,
  six: [...page.indices.slice(0, 3), ...page.indices.slice(-3)],
  hits: [...page.indices.slice(0, 3), ...page.indices.slice(-3)]
    .filter((value) => dhValues.has(value)).length,
})).sort((x, y) => y.hits - x.hits || x.page - y.page);
assert.equal(ranking[0].page, 29);
assert.equal(ranking[0].hits, 6);
assert.equal(ranking[1].hits, 4);
assert.equal(ranking.filter((page) => page.hits === 6).length, 1);

console.log('Input: 55 original rune-bearing LP2 p0..55 pages, 12,956 rune symbols.');
console.log('Source: 2013 signed DH23 worked example, state:', signedDh);
console.log('p29 complete first word GP indices:', startExpected, '(K,p,a)');
console.log('p29 complete last word GP indices:', endExpected, '(a,A,B)');
console.log('p39 red G = (-K,g,b) =', G, '= 15(X-24)^2 mod 29');
console.log('p29 P(24) and formal derivative P\'(24):',
  evalPoly(p29.indices, root), evalPoly(derivative, root));
console.log('Boundary six-value DH membership; top three:',
  JSON.stringify(ranking.slice(0, 3)));

/** Locked three-row DH bookend Hill candidate, original source print order. */
const M = [startExpected, endExpected, G];
const p39 = pages.find((page) => page.page === 39);
assert(p39);
assert.equal(p39.indices.length, 240);
assert.deepEqual(p39.indices.slice(119, 122), G);
const body39 = p39.indices.filter((_, index) => index < 119 || index >= 122);
assert.equal(body39.length, 237);

/** @param {number[][]} source */
function inverse3(source) {
  const q = source.map((row, i) => row.concat(
    [0, 1, 2].map((j) => Number(i === j))));
  for (let j = 0; j < 3; j++) {
    const pivot = q.findIndex((row, k) => k >= j && row[j] !== 0);
    assert(pivot >= 0);
    [q[j], q[pivot]] = [q[pivot], q[j]];
    const fieldInverse = [1, ...Array.from({ length: 27 }, (_, k) => k + 2)]
      .find((value) => mod29(value * q[j][j]) === 1);
    assert(fieldInverse);
    q[j] = q[j].map((value) => mod29(value * fieldInverse));
    for (let i = 0; i < 3; i++) {
      if (i === j) continue;
      const factor = q[i][j];
      q[i] = q[i].map((value, k) => mod29(value - factor * q[j][k]));
    }
  }
  return q.map((row) => row.slice(3));
}

/** @param {number[]} input @param {number[][]} matrix */
function hill3(input, matrix) {
  assert.equal(input.length % 3, 0);
  const output = [];
  for (let i = 0; i < input.length; i += 3) {
    for (let row = 0; row < 3; row++) {
      output.push(mod29(input[i] * matrix[row][0] +
        input[i + 1] * matrix[row][1] + input[i + 2] * matrix[row][2]));
    }
  }
  return output;
}

/** @param {number[]} input */
function coincidence(input) {
  const counts = Array(29).fill(0);
  input.forEach((v) => counts[v]++);
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}

const inverseM = inverse3(M);
assert.deepEqual(inverseM, [[15, 14, 13], [16, 2, 22], [16, 7, 8]]);
const decoded39 = hill3(body39, inverseM);
assert.deepEqual(hill3(decoded39, M), body39);
const solvedP57 = corpus.pages.find((page) => page.page === 57);
assert(solvedP57);
const clear93 = solvedP57.indices.slice(0, 93);
assert.deepEqual(hill3(hill3(clear93, M), inverseM), clear93);
assert(Math.abs(coincidence(decoded39) - 0.032789816205392265) < 1e-12);
console.log('Frozen p39 237-rune, red3-excluded Hill3 consumer:');
console.log('M:', M, 'inverse:', inverseM);
console.log('Decoded p39 IoC:', coincidence(decoded39),
  'unmodified IoC:', coincidence(body39));
console.log('p39 decoded first72 GP: ',
  decoded39.slice(0, 72).map((v) => corpus.translit[v]).join(' '));
console.log('Original 237/237 re-encryption and solved p57 93/93 plant pass.');

console.log('PASS. Exact source-index linkage. No deciphered LP2 text or');
console.log('independently sourced instruction selecting this DH bookend grammar.');

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
console.log('PASS. Exact source-index linkage. No deciphered LP2 text or');
console.log('independently sourced instruction selecting this DH bookend grammar.');

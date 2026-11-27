'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Fixed H pair transform used by the existing state-route reports.
 * @param {number} x
 * @param {number} y
 * @returns {[number, number]}
 */
function H(x, y) {
  return [((x - y) % 29 + 29) % 29, (x + y) % 29];
}

/**
 * Modular exponentiation for the small historical DH values.
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function modPow(base, exponent, modulus) {
  let result = 1n;
  let b = BigInt(base % modulus);
  let e = BigInt(exponent);
  const m = BigInt(modulus);

  while (e > 0n) {
    if ((e & 1n) === 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(result);
}

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));

assert.equal(corpus.translit[5], 'C');
assert.equal(corpus.runes[5], 'ᚳ');
assert.equal(corpus.translit[23], 'D');
assert.equal(corpus.runes[23], 'ᛞ');

const p25 = corpus.pages.find((page) => page.page === 25);
assert.ok(p25);
const p25Object = p25.indices.slice(144, 150);
assert.deepEqual(p25Object, [18, 3, 20, 10, 11, 16]);

const Kg = H(p25Object[0], p25Object[5]);
const Ag = H(21, 13);
const KA = H(5, 3);
assert.deepEqual(Kg, [2, 5]);
assert.deepEqual(Ag, [8, 5]);
assert.deepEqual(KA, [2, 8]);

const p = 23;
const g = 5;
const a = 6;
const b = 15;
const A = modPow(g, a, p);
const B = modPow(g, b, p);
const KFromA = modPow(A, b, p);
const KFromB = modPow(B, a, p);

assert.equal(A, 8);
assert.equal(B, 19);
assert.equal(KFromA, 2);
assert.equal(KFromB, 2);

console.log('Mayfly/DH23 semantic-selector arithmetic witness');
console.log('GP index 23:', corpus.runes[23], corpus.translit[23], '(Dæg/day semantic anchor)');
console.log('GP index 5 :', corpus.runes[5], corpus.translit[5], '(Cēn/torch-fire semantic anchor)');
console.log('p25 source object:', p25Object);
console.log('H(outer) = [K,g]:', Kg);
console.log('state triangle [K,g], [A,g], [K,A]:', Kg, Ag, KA);
console.log('DH p,g,a,b,A,B,K:', [p, g, a, b, A, B, KFromA]);
console.log('PASS: all source-corpus arithmetic identities reproduce exactly.');
console.log('NOTE: semantic species-name interpretation is documented evidence, not computationally proved here.');

'use strict';
/** Source-fixed original LP2 p8 255/243 GF(256) Reed–Solomon gate.
 * Node.js 22, Windows 11, CommonJS; no writes or command-line parameters.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const original = gp.pages[8].indices;
assert.equal(original.length, 255);
assert.equal(ink.pages.find((p) => p.page === 8).red_spans[0].length, 12);
assert.equal(original.slice(12).length, 243);
assert.equal(original.at(-1), 12); // Carried p8->p9 rune, not deleted.
const exp = Array(255);
const log = Array(256).fill(-1);
let x = 1;
for (let i = 0; i < 255; i++) {
  exp[i] = x;
  log[x] = i;
  x <<= 1;
  if (x & 256) x ^= 0x11d;
}
assert.equal(x, 1);
assert.equal(new Set(exp).size, 255);
/** @param {number} a @param {number} b @returns {number} */
function multiply(a, b) {
  return a === 0 || b === 0 ? 0 : exp[(log[a] + log[b]) % 255];
}
/** @param {number[]} input @param {number} firstRoot @returns {number[]} */
function syndromes(input, firstRoot) {
  return Array.from({ length: 12 }, (_, j) => {
    const root = exp[(firstRoot + j) % 255];
    return input.reduce((v, b) => multiply(v, root) ^ b, 0);
  });
}
/** @param {number[]} data @param {number} firstRoot @returns {number[]} */
function encode(data, firstRoot) {
  let generator = [1];
  for (let j = 0; j < 12; j++) {
    const root = exp[(firstRoot + j) % 255];
    const next = Array(generator.length + 1).fill(0);
    for (let k = 0; k < generator.length; k++) {
      next[k] ^= generator[k];
      next[k + 1] ^= multiply(generator[k], root);
    }
    generator = next;
  }
  let dividend = [...data, ...Array(12).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const factor = dividend[i];
    for (let j = 0; j < generator.length; j++) {
      dividend[i + j] ^= multiply(factor, generator[j]);
    }
  }
  return [...data, ...dividend.slice(data.length)];
}
for (const b of [0, 1]) {
  const planted = encode(original.slice(12), b);
  assert.equal(planted.length, 255);
  assert.deepEqual(syndromes(planted, b), Array(12).fill(0));
  assert.deepEqual(planted.slice(0, 243), original.slice(12));
}
const prime = original.map((x) => gp.prime[x]);
assert(prime.every((v) => Number.isInteger(v) && v >= 0 && v <= 255));
for (const [representation, input] of [['GP-index byte', original], ['GP-prime-weight byte', prime]]) {
  for (const [order, code] of [
    ['printed red12 then black243', input],
    ['black243 then red12', [...input.slice(12), ...input.slice(0, 12)]],
    ['printed reverse', [...input].reverse()],
  ]) {
    for (const b of [0, 1]) {
      const found = syndromes(code, b);
      assert.equal(found.filter((x) => x !== 0).length, 12);
      console.log(JSON.stringify({
        representation, order, primitivePolynomial: '0x11d', rootsFrom: b,
        nonzeroSyndromes: 12, leadingSyndromes: found.slice(0, 3),
        verdict: 'not a direct systematic RS(255,243) codeword'
      }));
    }
  }
}
console.log('PASS authentic p8 original255, red12 black243, carried last rune, 12 test families nonzero, genuine RS positives zero syndromes');

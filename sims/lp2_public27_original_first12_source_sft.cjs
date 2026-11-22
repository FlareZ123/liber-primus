'use strict';

/**
 * Source-exact audit of the first two local blocks of an external LP2 27x27
 * candidate. The chosen coordinates, two block lengths and arithmetic were
 * published in 2026 by 2retooz270703; they are NOT independently authenticated
 * 2014 decoding instructions. They do yield the stated first 12 GP symbols
 * on our independent canonical original 729-rune cipher stream.
 *
 * SFT: node sims/lp2_public27_original_first12_source_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const pages = source.pages.filter((page) => page.page <= 2);
assert.deepEqual(pages.map((page) => page.indices.length), [262, 266, 201]);
const grid = pages.flatMap((page) => page.indices);
assert.equal(grid.length, 729);

/** @param {number} r One-based row @param {number} c One-based column */
function at(r, c) {
  assert.ok(r >= 1 && r <= 27 && c >= 1 && c <= 27);
  return grid[27 * (r - 1) + c - 1];
}

/** @param {number} n @returns {number} */
function phi(n) {
  assert.ok(Number.isInteger(n) && n >= 1);
  let count = 0;
  for (let i = 1; i <= n; i++) {
    let a = i, b = n;
    while (b) [a, b] = [b, a % b];
    if (a === 1) count++;
  }
  return count;
}

/** @param {number} n @returns {-1|0|1} */
function mu(n) {
  assert.ok(Number.isInteger(n) && n >= 1);
  let m = n;
  let factors = 0;
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue;
    m /= p;
    if (m % p === 0) return 0;
    factors++;
    while (m % p === 0) m /= p;
  }
  if (m > 1) factors++;
  return factors % 2 ? -1 : 1;
}

/** @param {number[]} sourceNode @returns {{derived:number[],phase:number,key:number[]}} */
function derivedKey(sourceNode) {
  assert.equal(sourceNode.length, 3);
  const derived = [sourceNode[0], phi(sourceNode[1]), sourceNode[2]];
  const signature = derived.map((i) => mu(phi(i)));
  const phase = ((signature.reduce((sum, x) => sum + x, 0) % 3) + 3) % 3;
  return {derived,phase,key:derived.slice(phase).concat(derived.slice(0,phase))};
}

/** @param {number[]} cipher @param {number[]} key @returns {number[]} */
function decrypt(cipher, key) {
  return cipher.map((x, i) => ((x - key[i % key.length]) % 29 + 29) % 29);
}

/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function encrypt(plain, key) {
  return plain.map((x, i) => (x + key[i % key.length]) % 29);
}

const node1 = [at(13, 11), at(13, 12), at(13, 13)];
assert.deepEqual(node1, [25, 11, 28]);
const {derived: derived1, phase: phase1, key: key1} = derivedKey(node1);
assert.deepEqual([derived1,phase1,key1], [[25, 10, 28],0,[25,10,28]]);
const start1 = 27 * (13 - 1) + 25 - 1;
const cipher1 = grid.slice(start1, start1 + 7); // ordinary row-major wrap
assert.deepEqual(cipher1, [20, 25, 9, 2, 13, 1, 14]);
const plain1 = decrypt(cipher1, key1);
assert.deepEqual(plain1, [24, 15, 10, 6, 3, 2, 18]);
assert.deepEqual(encrypt(plain1, key1), cipher1);
assert.equal(plain1.map((i)=>source.translit[i]).join(''), 'ASIGOTHE');

const end1row = 14, end1col = 4; // last original ciphertext cell of block 1
assert.equal(at(end1row, end1col), cipher1.at(-1));
const node2 = [at(14, 4), at(14, 5), at(14, 6)];
assert.deepEqual(node2, [14,22,14]);
const {derived:derived2,phase:phase2,key:key2} = derivedKey(node2);
assert.deepEqual([derived2,phase2,key2], [[14,10,14],2,[14,14,10]]);
const cipher2 = Array.from({length:5}, (_,i)=>at(14,14+i));
assert.deepEqual(cipher2, [21,13,12,3,18]);
const plain2 = decrypt(cipher2, key2);
assert.deepEqual(plain2, [7,28,2,18,4]);
assert.deepEqual(encrypt(plain2, key2), cipher2);
assert.equal(plain2.map((i)=>source.translit[i]).join(''), 'WEATHER');
console.log('PASS: reproduced 12 original-input GP symbols ASIGOTHEWEATHER.');
console.log('Conditional external route: the source selects no independent unique rule for its later blocks; full three-page decipherment remains unestablished.');

'use strict';

/**
 * Exact original-source GP29 test of the printed 3301 root across all 55
 * unknown rune pages and the complete 256-cell base60 p50 table.
 * Run: node sims/lp2_p29_p50_root24_fullbook_sft.cjs
 * No source bytes are changed, fitted, shifted, or searched.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @typedef {{page:number,indices:number[],runic_count:number}} RunePage */
/** @typedef {{pages:RunePage[]}} Book */
/** @typedef {{alphabet:string,rows:string[][]}} Grid */

/** @type {Book} */
const book = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
/** @type {Grid} */
const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const modulus = 29;
const root = 3301 % modulus;
assert.equal(root, 24);

/** @param {number} x */
const mod = (x) => ((x % modulus) + modulus) % modulus;

/** @param {number} x */
function inverse(x) {
  for (let y = 1; y < modulus; y++) {
    if (mod(x * y) === 1) return y;
  }
  throw new Error('Nonunit coefficient in GF29');
}

/**
 * Hasse coefficients of P(root + Y) from original HIGH-FIRST printed digits.
 * @param {number[]} highFirst
 * @param {number} at
 * @param {number} order
 * @param {number} ring
 * @returns {number[]}
 */
function jets(highFirst, at, order, ring) {
  const coefficients = Array(order + 1).fill(0);
  for (const digit of highFirst) {
    for (let j = order; j >= 1; j--) {
      coefficients[j] = (at * coefficients[j] + coefficients[j - 1]) % ring;
    }
    coefficients[0] = (at * coefficients[0] + digit) % ring;
  }
  return coefficients;
}

/** @param {number[]} values */
function trim(values) {
  while (values.length && values[values.length - 1] === 0) values.pop();
  return values;
}

/** @param {number[]} dividend @param {number[]} divisor */
function remainder(dividend, divisor) {
  const a = trim(dividend.map(mod));
  const b = trim(divisor.map(mod));
  assert.ok(b.length > 0);
  const inverseLead = inverse(b[b.length - 1]);
  while (a.length >= b.length) {
    const scale = mod(a[a.length - 1] * inverseLead);
    const start = a.length - b.length;
    for (let j = 0; j < b.length; j++) a[start + j] = mod(a[start + j] - scale * b[j]);
    trim(a);
  }
  return a;
}

/** @param {number[]} first @param {number[]} second */
function gcd(first, second) {
  let a = trim(first.map(mod));
  let b = trim(second.map(mod));
  while (b.length) [a, b] = [b, remainder(a, b)];
  if (!a.length) return [];
  const leadInverse = inverse(a[a.length - 1]);
  return a.map((x) => mod(x * leadInverse));
}

assert.equal(grid.alphabet.length, 60);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
const table = grid.rows.flat().map((token) =>
  60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1]));
assert.equal(table.length, 256);
assert.ok(table.every((n) => n >= 0 && n <= 255));

const runePages = book.pages.filter((item) => item.page >= 0 && item.page <= 55 && item.indices.length);
assert.equal(runePages.length, 55);
const getPage = (page) => runePages.find((item) => item.page === page).indices;
const page29 = getPage(29);
assert.equal(page29.length, 277);

const singleRoots24 = [];
const doubleRoots24 = [];
const singleRoots13 = [];
for (const page of runePages) {
  const [v24, d24] = jets(page.indices, root, 1, modulus);
  if (v24 === 0) {
    singleRoots24.push([page.page, d24]);
    if (d24 === 0) doubleRoots24.push(page.page);
  }
  const [v13, d13] = jets(page.indices, 13, 1, modulus);
  if (v13 === 0) singleRoots13.push([page.page, d13]);
}
assert.deepEqual(singleRoots24, [[10, 6], [11, 9], [29, 0], [36, 27]]);
assert.deepEqual(doubleRoots24, [29]);
assert.deepEqual(singleRoots13, [[20, 22]]);

const g = gcd(page29.slice().reverse(), table.slice().reverse());
assert.deepEqual(g, [25, 10, 1]); // (X-24)^2, exact common factor

const jets29 = [jets(page29, root, 3, modulus), jets(table, root, 3, modulus)];
const jets841 = [jets(page29, root, 3, modulus * modulus),
  jets(table, root, 3, modulus * modulus)];
assert.deepEqual(jets29, [[0, 0, 27, 6], [0, 0, 26, 6]]);
assert.deepEqual(jets841, [[522, 319, 85, 151], [667, 609, 722, 818]]);
assert.equal(jets841[0][0] / modulus, 18);
assert.equal(jets841[1][0] / modulus, 23);

// Physical p39's red triad must instead be interpreted LOW-FIRST to vanish
// at the same root; no authored mixed-orientation instruction is known.
const red39 = getPage(39).slice(119, 122);
assert.deepEqual(red39, [27, 5, 15]);
assert.deepEqual(jets(red39.slice().reverse(), root, 2, modulus), [0, 0, 15]);
assert.deepEqual(jets(red39, root, 1, modulus), [27, 25]);

console.log('Physical unknown GP pages:', runePages.length);
console.log('Printed 3301 mod29 root:', root);
console.log('Original page zeros at24 with derivative:', JSON.stringify(singleRoots24));
console.log('Original page double roots at24:', JSON.stringify(doubleRoots24));
console.log('Independent control roots at13:', JSON.stringify(singleRoots13));
console.log('p29 and p50 exact GF29 GCD (ascending coefficients):', JSON.stringify(g));
console.log('p29/p50 source Hasse jets mod29:', JSON.stringify(jets29));
console.log('p29/p50 source Hasse jets mod841:', JSON.stringify(jets841));
console.log('The arithmetic is conditional on mixed coefficient direction and does not decrypt LP2.');

'use strict';

/**
 * Original-source, read-only SFT for Director #2297.
 * Node.js 22 / CommonJS, runnable as:
 * node sims/lp2_p8_berggren_source_selector_sft.cjs
 *
 * Uses only the original GP29 corpus, ink annotations and printed page
 * transcription. Evaluates the proposed p8 3-4-5 -> Berggren 3^5 route
 * without fitting ciphertext, tuning a decryption key, or claiming plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(base, 'lp2-ink-annotations.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8')
  .replace(/\r\n/g, '\n');

const page8 = corpus.pages.find((item) => item.page === 8);
const page9 = corpus.pages.find((item) => item.page === 9);
const ink8 = ink.pages.find((item) => item.page === 8);

/** @param {number[]} values @returns {number} */
function gpProduct(values) {
  return values.reduce((acc, value) => (acc * value) % 29, 1);
}

assert.equal(page8.indices.length, 255, 'Physical page 8 must have 255 runes');
assert.equal(ink8.red_spans.length, 1);
assert.equal(ink8.red_spans[0].start, 0);
assert.equal(ink8.red_spans[0].length, 12);
assert.deepEqual(page8.indices.slice(0, 4), [14, 10, 14, 19]);
assert.equal(gpProduct(page8.indices.slice(0, 4)), 4, 'Printed red word 1');
assert.equal(gpProduct(page8.indices.slice(4, 12)), 3, 'Printed red word 2');
assert.equal(page8.indices.length - 12, 243, 'Black rune count including carry');

const carry = page8.indices.at(-1);
const p9PageFragment = page9.indices.slice(0, 5);
const wholeWord = [carry, ...p9PageFragment];
assert.equal(carry, 12, 'Authentic last p8 rune is EO/GP12');
assert.deepEqual(p9PageFragment, [26, 7, 25, 6, 11]);
assert.ok(
  transcript.includes('ᛇ/\n%\nᚣᚹᚫᚷᛄ-'),
  'The printed p8/p9 page break is inside the same word'
);
assert.equal(gpProduct(p9PageFragment), 5, 'Only five-rune page fragment yields 5');
assert.equal(gpProduct(wholeWord), 2, 'Full six-rune printed word yields 2');
assert.equal(gpProduct([4, 3]), 12, 'Red product 4*3 equals carry ordinal');
assert.equal((2 * 17) % 29, 5, 'Suppressing GP12 multiplies by inverse(12)=17');

/**
 * Historical Berggren/Barning/Hall matrices for primitive Pythagorean triples.
 * Each output retains a^2+b^2=c^2.
 * @type {number[][][]}
 */
const matrices = [
  [[1, -2, 2], [2, -1, 2], [2, -2, 3]],
  [[1, 2, 2], [2, 1, 2], [2, 2, 3]],
  [[-1, 2, 2], [-2, 1, 2], [-2, 2, 3]]
];

/** @param {number[][]} matrix @param {number[]} triple @returns {number[]} */
function child(matrix, triple) {
  return matrix.map((row) => row.reduce((sum, coefficient, index) =>
    sum + coefficient * triple[index], 0));
}

/** @param {number[]} branchOrder @returns {number[][]} */
function descendantsAtDepth5(branchOrder) {
  let level = [[3, 4, 5]];
  for (let depth = 0; depth < 5; depth += 1) {
    level = level.flatMap((triple) =>
      branchOrder.map((branch) => child(matrices[branch], triple)));
  }
  return level;
}

assert.deepEqual(matrices.map((m) => child(m, [3, 4, 5])), [
  [5, 12, 13], [21, 20, 29], [15, 8, 17]
]);

const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0]];
const residueSignatures = new Set();
for (const order of orders) {
  const leaves = descendantsAtDepth5(order);
  assert.equal(leaves.length, 243);
  assert.equal(new Set(leaves.map((triple) => triple.join(','))).size, 243);
  for (const [a, b, c] of leaves) {
    assert.equal(a * a + b * b, c * c);
  }
  const residue = leaves.map((triple) => triple[2] % 29);
  residueSignatures.add(residue.join(','));
  console.log(
    'ORDER', order.join(''), 'LEAVES', leaves.length,
    'HYPOTENUSE_GP29_FIRST10', residue.slice(0, 10).join(','),
    'HYPOTENUSE_GP29_DISTINCT', new Set(residue).size
  );
}
assert.equal(residueSignatures.size, 6,
  'Six unfixed branch conventions give six distinct 243-symbol values');

// Stronger than the six-fold branch ambiguity: exact all-secret fixed
// monoalphabetic GP29 obstruction to any direct tree-leaf symbol readout.
// An arbitrary 29! bijection permutes symbol labels but cannot change the
// sorted 29-bin histogram. Branch-order permutations cannot change it either.
const originalBlack = page8.indices.slice(12);
/** @param {number[]} symbols @returns {number[]} */
function sortedFrequencySignature(symbols) {
  return Array.from({ length: 29 }, (_, value) =>
    symbols.filter((symbol) => symbol === value).length).sort((a, b) => b - a);
}
const originalSignature = sortedFrequencySignature(originalBlack);
const coordinateOutputs = [
  { label: 'first-leg', f: (triple) => triple[0] % 29 },
  { label: 'second-leg', f: (triple) => triple[1] % 29 },
  { label: 'hypotenuse', f: (triple) => triple[2] % 29 },
  { label: 'perimeter', f: (triple) =>
    (triple[0] + triple[1] + triple[2]) % 29 }
];
const baseLeaves = descendantsAtDepth5(orders[0]);
for (const coordinate of coordinateOutputs) {
  const signature = sortedFrequencySignature(baseLeaves.map(coordinate.f));
  assert.notDeepEqual(signature, originalSignature,
    coordinate.label + ' cannot be direct p8 GP29 under ANY secret bijection');
  console.log('NO_FIXED_ALPHABET_DIRECT_LEAF_READOUT',
    coordinate.label,
    'ORIGINAL_SORTED29', originalSignature.join(','),
    'LEAF_SORTED29', signature.join(','));
}


console.log('ORIGINAL_P8_RED_GP_PRODUCTS', 4, 3);
console.log('ORIGINAL_P8_BLACK_RUNES', 243, 'LAST_RUNIC_CARRY_GP', carry);
console.log('P9_FIVE_RUNE_FRAGMENT_GP_PRODUCT', gpProduct(p9PageFragment));
console.log('P8_TO_P9_COMPLETE_WORD_GP_PRODUCT', gpProduct(wholeWord));
console.log('BERGGREN_BRANCH_ORDERS_NOT_SELECTED_BY_SOURCE', residueSignatures.size);
console.log('PASS: all original-source counts, continuous word and branch ambiguity assertions');

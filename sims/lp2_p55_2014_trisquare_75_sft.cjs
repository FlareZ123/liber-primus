'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const squareSource = fs.readFileSync(path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const matrices = squareSource.trim().split(/\r?\n\s*\r?\n/).map(block =>
  block.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrices.map(rows => [rows.length, rows[0].length]), [[5, 5], [7, 7], [5, 5]]);

const numbers = [matrices[0].flat(), matrices[1].slice(1, -1).flatMap(row => row.slice(1, -1)), matrices[2].flat()];
assert.deepEqual(numbers.map(row => row.length), [25, 25, 25]);

const page = corpus.pages[55].indices;
assert.equal(page.length, 76);
assert.equal(page[0], 21); // NG, continuation of a preceding-page printed word.
const body = page.slice(1);
const alphabet = [...new Set(body)].sort((a, b) => a - b);
assert.equal(alphabet.length, 25);
const absent = Array.from({length: 29}, (_, i) => i).filter(index => !alphabet.includes(index));
assert.deepEqual(absent, [3, 9, 16, 26]); // O N T Y
const pageSegments = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(pageSegments.reduce((a, b) => a + b, 0), 76);
assert.equal(pageSegments.slice(1).filter(size => size % 3 !== 0).length, 10);
assert.equal(body.length % 3, 0);

/**
 * Assign the 25 original GP ciphertext symbols to each historical numeric
 * grid by stable numerical ranks. Equal historical numbers use printed
 * row-major order; no cipher/plaintext score is consulted.
 * @param {'asc'|'desc'} direction
 * @returns {number[][]}
 */
function makeSquares(direction) {
  return numbers.map(values => {
    const ranked = values.map((value, position) => ({value, position})).sort((a, b) =>
      direction === 'asc' ? a.value - b.value || a.position - b.position :
        b.value - a.value || a.position - b.position);
    const grid = Array(25);
    for (let i = 0; i < 25; i++) grid[ranked[i].position] = alphabet[i];
    assert.equal(new Set(grid).size, 25);
    return grid;
  });
}

/**
 * Classical Tri-Square C1/C2/C3 ciphertext trigraph to P1/P2 plaintext
 * digraph inverse, using the three ranked source squares in original order.
 * @param {number[]} input
 * @param {number[][]} squares
 * @returns {number[]}
 */
function decrypt(input, squares) {
  assert.equal(input.length % 3, 0);
  const [first, second, third] = squares;
  const output = [];
  for (let j = 0; j < input.length; j += 3) {
    const [c1, c2, c3] = input.slice(j, j + 3);
    const a = first.indexOf(c1), b = third.indexOf(c2), c = second.indexOf(c3);
    assert.ok(a >= 0 && b >= 0 && c >= 0);
    output.push(first[Math.floor(b / 5) * 5 + a % 5]);
    output.push(second[Math.floor(c / 5) * 5 + b % 5]);
  }
  return output;
}

/**
 * Deterministic genuine Tri-Square encipherment for an exact positive plant.
 * Filler row and column are predefined, and all 50 clear GP symbols recover.
 * @param {number[]} input
 * @param {number[][]} squares
 * @returns {number[]}
 */
function encrypt(input, squares) {
  assert.equal(input.length % 2, 0);
  const [first, second, third] = squares;
  const output = [];
  for (let j = 0; j < input.length; j += 2) {
    const a = first.indexOf(input[j]);
    const b = second.indexOf(input[j + 1]);
    assert.ok(a >= 0 && b >= 0);
    const trigraph = [
      first[((j * 7 + 1) % 5) * 5 + a % 5],
      third[Math.floor(a / 5) * 5 + b % 5],
      second[Math.floor(b / 5) * 5 + (j * 3 + 2) % 5],
    ];
    output.push(...trigraph);
  }
  return output;
}

/**
 * Symbol index of coincidence.
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((total, count) => total + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

const control = corpus.pages[57].indices.filter(index => alphabet.includes(index)).slice(0, 50);
assert.equal(control.length, 50);
const clear = corpus.pages[57].indices;
const cleanWindows = clear.slice(0, clear.length - 49).filter((_, start) =>
  clear.slice(start, start + 50).every(index => alphabet.includes(index)));
assert.equal(cleanWindows.length, 0);

const predicted = {
  'asc/printed': 0.052244897959183675,
  'asc/reversed': 0.04081632653061224,
  'desc/printed': 0.037551020408163265,
  'desc/reversed': 0.035918367346938776,
};

for (const rank of ['asc', 'desc']) {
  const squares = makeSquares(rank);
  assert.deepEqual(squares.map(row => new Set(row).size), [25, 25, 25]);
  assert.deepEqual(decrypt(encrypt(control, squares), squares), control);
  for (const [name, source] of [
    ['printed', body],
    ['reversed', body.slice().reverse()],
  ]) {
    const output = decrypt(source, squares);
    assert.equal(output.length, 50);
    const reencrypted = encrypt(output, squares);
    assert.deepEqual(decrypt(reencrypted, squares), output);
    const measured = ioc(output);
    assert.ok(Math.abs(measured - predicted[rank + '/' + name]) < 1e-12);
    console.log(rank + '/' + name + ': ioc=' + measured.toFixed(12) +
      ', text=' + output.map(index => corpus.translit[index]).join('.'));
  }
}
// Matched familywise null: retain every actual rune count, but permute the
// original 75-body positions. Both rank keys and both directions are tested
// together. The best apparent IoC must survive the full four-case selection.
let rngState = 0x9a84a5d3;
function nextRandom() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) / 4294967296;
}
const keys = [makeSquares('asc'), makeSquares('desc')];
const observedMax = predicted['asc/printed'];
let atLeast = 0;
let sumBest = 0;
for (let draw = 0; draw < 20000; draw++) {
  const shuffled = body.slice();
  for (let k = shuffled.length - 1; k > 0; k--) {
    const j = Math.floor(nextRandom() * (k + 1));
    [shuffled[k], shuffled[j]] = [shuffled[j], shuffled[k]];
  }
  const reversed = shuffled.slice().reverse();
  const scores = [
    ioc(decrypt(shuffled, keys[0])),
    ioc(decrypt(shuffled, keys[1])),
    ioc(decrypt(reversed, keys[0])),
    ioc(decrypt(reversed, keys[1])),
  ];
  const best = Math.max(...scores);
  sumBest += best;
  if (best >= observedMax - 1e-12) atLeast++;
}
assert.equal(atLeast, 2569);
assert.ok(Math.abs(sumBest / 20000 - 0.046169346938775536) < 1e-10);
console.log('Four-case familywise preserved-multiset permutation: 2569/20000 nulls >= observed best IoC; add-one p=' + ((atLeast + 1) / 20001).toFixed(7));

console.log('PASS: 2014 three-square original-input Tri-Square test, four exact inverses, four 50/50 source-rune positive plants; no plaintext identified.');

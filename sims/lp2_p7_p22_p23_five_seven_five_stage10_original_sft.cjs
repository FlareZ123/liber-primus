'use strict';

/**
 * Original-scan p7 five disks, p22 seven detached engraving dots, p23
 * five disks -> historical Stage10 5/7/5 matrix consumer.
 *
 * This is a conditional, source-selected *direct cipher* test, not a
 * claim that the authors specified this operation. The p22 engraving
 * is mirrored reuse of solved LP1 art; the dot counts might be incidental.
 *
 * Node.js 22, CommonJS, read-only SFT:
 *   node sims/lp2_p7_p22_p23_five_seven_five_stage10_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const source = read('resources/cicada2014-openpuff-magic-squares.txt');
const matrices = source.trim().split(/\r?\n\s*\r?\n/gu)
  .map(block => block.trim().split(/\r?\n/gu)
    .map(line => line.trim().split(/\s+/gu).map(Number)));
assert.deepEqual(matrices.map(m => m.length), [5, 7, 5]);
assert(matrices.every(m => m.every(row => row.length === m.length)));
assert.deepEqual(matrices[0][0], [434, 1311, 312, 278, 966]);
assert.deepEqual(matrices[1][0], [7, 375, 236, 190, 27, 17, 181]);
assert.deepEqual(matrices[2][0], [272, 138, 341, 131, 151]);

/** @param {number} n */
const mod = n => (n % 29 + 29) % 29;
/** @param {number[][]} matrix */
const transpose = matrix => matrix[0].map((_, j) => matrix.map(row => row[j]));

/**
 * Gauss-Jordan in the published GP29 prime field.
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
function inverse(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => row.map(mod)
    .concat(Array.from({length:n}, (_, j) => Number(i === j))));
  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && !a[pivot][i]) pivot++;
    assert(pivot < n, 'historical matrix must be invertible in GP29');
    [a[i], a[pivot]] = [a[pivot], a[i]];
    let inv = 1;
    while (mod(a[i][i] * inv) !== 1) inv++;
    a[i] = a[i].map(v => mod(v * inv));
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const factor = a[r][i];
      a[r] = a[r].map((v, j) => mod(v - factor * a[i][j]));
    }
  }
  return a.map(row => row.slice(n));
}

/**
 * One homogeneous, non-overlapping, whole-block Hill operation;
 * no key, clock, rune or word boundary is fitted.
 * @param {number[][]} matrix
 * @param {number[]} input
 */
function transform(matrix, input) {
  const n = matrix.length;
  assert.equal(input.length % n, 0);
  const output = [];
  for (let pos = 0; pos < input.length; pos += n) {
    for (let row = 0; row < n; row++) {
      let value = 0;
      for (let col = 0; col < n; col++)
        value += matrix[row][col] * input[pos + col];
      output.push(mod(value));
    }
  }
  return output;
}

/** @param {number[]} input */
function ioc(input) {
  const count = Array(29).fill(0);
  for (const symbol of input) count[symbol]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0)
    / (input.length * (input.length - 1));
}

const sections = [
  {lo:3, hi:7, skipPage:null, skip:0, matrix:0, source:'five-dot p7 terminal'},
  {lo:8, hi:22, skipPage:15, skip:20, matrix:1,
    source:'seven physical engraving dots p22 terminal'},
  {lo:23, hi:26, skipPage:23, skip:16, matrix:2, source:'five-dot p23 opener'},
];
const expectedSourceLengths = [1145, 3632, 1021];
const expectedSelectedLengths = [1145, 3612, 1005];
const knownP57 = corpus.pages[57].indices;
assert.equal(knownP57.length, 95);
assert(Math.abs(ioc(knownP57) - 0.06270996640537514) < 1e-14);
const output = [];

for (let i = 0; i < sections.length; i++) {
  const section = sections[i];
  const pages = corpus.pages.filter(p => p.page >= section.lo && p.page <= section.hi);
  const raw = pages.flatMap(p => p.indices);
  assert.equal(raw.length, expectedSourceLengths[i]);
  if (section.skipPage !== null) {
    const record = ink.pages.find(p => p.page === section.skipPage);
    assert(record);
    assert.equal(record.red_spans.reduce((n, s) => n + s.length, 0),
      section.skip);
    assert.equal(record.red_spans[0].start, 0);
  }
  const symbols = pages.flatMap(p => p.indices.slice(
    p.page === section.skipPage ? section.skip : 0));
  assert.equal(symbols.length, expectedSelectedLengths[i]);
  const n = matrices[section.matrix].length;
  assert.equal(symbols.length % n, 0);
  const sourceMatrix = matrices[section.matrix].map(row => row.map(mod));
  const sourceInverse = inverse(sourceMatrix);
  const orientations = [
    ['M', sourceMatrix], ['inverse M', sourceInverse],
    ['transpose M', transpose(sourceMatrix)],
    ['inverse transpose M', inverse(transpose(sourceMatrix))],
  ];
  const scores = [];
  for (const [orientation, key] of orientations) {
    const recovered = transform(key, symbols);
    assert.deepEqual(transform(inverse(key), recovered), symbols);
    const degree = ioc(recovered);
    assert(degree < 0.04, 'direct output not close to source-native English');
    scores.push({orientation, ioc: Number(degree.toFixed(9)),
      first12: recovered.slice(0, 12).map(j => corpus.translit[j]).join(' ')});
  }
  const planted = knownP57.slice(0, Math.floor(95 / n) * n);
  assert.deepEqual(transform(sourceInverse, transform(sourceMatrix, planted)),
    planted);
  output.push({
    source:section.source, physicalPages:[section.lo,section.hi],
    originalRunes:raw.length, visuallyExcludedRedRunes:section.skip,
    exactMatrixInputRunes:symbols.length,
    order:n, blocks:symbols.length / n,
    sourceIoC:Number(ioc(symbols).toFixed(9)), orientations:scores,
    sourceNativePositive:planted.length + '/' + planted.length + ' roundtrip'
  });
}
console.log(JSON.stringify({
  status:'PASS: all three exact source matrices invert, original outputs nonprose',
  sourceSelection:'conditional five/seven/five visual->Stage10 square mapping',
  note:'p22 7 dots belong to a mirrored reused-LP1 drawing, no authorial opcode',
  recoveredUnknownPlaintext:false,
  sections:output
}, null, 2));

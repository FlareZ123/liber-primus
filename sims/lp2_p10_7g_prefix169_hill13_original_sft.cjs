'use strict';

/**
 * LP2 p10 source-located 13x13 Hill-key test, no fitted keys.
 * Original 7-G is after exactly 13^2 GP runes, and the remaining
 * 94 runes comprise seven whole 13-rune blocks plus three residual runes.
 * The 13 comes from the page polynomial's P'(7)=C and GP prime(C)=13.
 *
 * Windows11 Node22 SFT:
 *   node sims/lp2_p10_7g_prefix169_hill13_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8').split('%');
const mod = value => (value % 29 + 29) % 29;
const n = 13;
/** @param {number} value @returns {number} */
function inverseScalar(value) {
  for (let j = 1; j < 29; j++) if (mod(value * j) === 1) return j;
  throw new Error('zero scalar is not invertible');
}
/** @param {number[][]} matrix @returns {{inverse:number[][], determinant:number}} */
function invertMatrix(matrix) {
  const augmented = matrix.map((row, i) => row.concat(
    Array.from({length:n}, (_, j) => Number(i === j))));
  let determinant = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && augmented[pivot][col] === 0) pivot++;
    assert.ok(pivot < n, 'source matrix must be nonsingular');
    if (pivot !== col) {
      [augmented[col], augmented[pivot]] =
        [augmented[pivot], augmented[col]];
      determinant = mod(-determinant);
    }
    const value = augmented[col][col];
    determinant = mod(determinant * value);
    const scale = inverseScalar(value);
    for (let k = 0; k < 2*n; k++)
      augmented[col][k] = mod(augmented[col][k] * scale);
    for (let j = 0; j < n; j++) {
      if (j === col) continue;
      const factor = augmented[j][col];
      for (let k = 0; k < 2*n; k++)
        augmented[j][k] =
          mod(augmented[j][k] - factor * augmented[col][k]);
    }
  }
  return {inverse:augmented.map(row => row.slice(n)), determinant};
}
/** @param {number[][]} matrix @returns {number[][]} */
const transpose = matrix => matrix.map((_, i) =>
  matrix.map(row => row[i]));
/**
 * @param {number[][]} matrix
 * @param {number[]} data exactly seven consecutive 13-rune blocks
 * @returns {number[]}
 */
function transform(matrix, data) {
  assert.equal(data.length, 91);
  const output = [];
  for (let i = 0; i < 7; i++) {
    const block = data.slice(i*n,(i+1)*n);
    for (const row of matrix)
      output.push(mod(row.reduce((sum, value, j) =>
        sum + value * block[j], 0)));
  }
  return output;
}
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const value of data) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1),0) /
    (data.length*(data.length-1));
}
const p10 = corpus.pages[10].indices;
assert.equal(p10.length, 263);
const glyphSet = new Set(corpus.runes);
const mark = source[10].indexOf('-7-ᚷ-');
assert.ok(mark >= 0);
const prefixLength = [...source[10].slice(0,mark)]
  .filter(ch=>glyphSet.has(ch)).length;
assert.equal(prefixLength,169);
assert.equal(corpus.prime[5],13);
assert.equal(corpus.prime[6],17);
assert.equal(13*13+7*13+3,263);
const matrix = Array.from({length:n}, (_,i) =>
  p10.slice(n*i,n*(i+1)));
const tail = p10.slice(prefixLength);
const sevenBlocks = tail.slice(0,91);
assert.equal(tail.length,94);
assert.deepEqual(tail.slice(91),[22,24,10]);
const row = invertMatrix(matrix);
assert.equal(row.determinant,26);
const column = invertMatrix(transpose(matrix));
assert.equal(column.determinant,26);
const solved = corpus.pages[57].indices;
assert.equal(solved.length,95);
assert.ok(ioc(solved)>0.06);
const native91 = solved.slice(0,91);
const candidates = [];
for (const [orientation, key, keyInverse] of [
  ['row-major',matrix,row.inverse],
  ['column-major',transpose(matrix),column.inverse]
]) {
  assert.deepEqual(transform(keyInverse,transform(key,native91)),native91);
  assert.deepEqual(transform(key,transform(keyInverse,native91)),native91);
  for (const [direction, op,opInverse] of [
    ['forward',key,keyInverse],
    ['inverse',keyInverse,key]
  ]) {
    const output = transform(op,sevenBlocks);
    assert.deepEqual(transform(opInverse,output),sevenBlocks);
    candidates.push({orientation,direction,runes:output.length,
      ioc:ioc(output), first60:output.slice(0,60)
        .map(i=>corpus.translit[i]).join('')});
  }
}
assert.deepEqual(candidates.map(x=>x.ioc),[
  0.036874236874236875, 0.04249084249084249,
  0.039316239316239315, 0.03833943833943834
]);
assert.ok(candidates.every(x=>x.ioc<0.045));
console.log(JSON.stringify({
  source:{page:10,originalRuneCount:p10.length,prefixBeforeInline7:169,
    keyMatrixRank:13,keyDeterminantMod29:26,
    numberOf13RuneBlocks:7,originalSuffixRunes:tail.length,
    unmatchedThreeRunes:tail.slice(91).map(i=>corpus.translit[i])},
  directFullBlockReadouts:candidates,
  authenticSolvedP57NativePlantsRecovered:4,
  everyOriginalSourceBlockReconstructed:true,
  conclusion:'The source-selected full-rank 13x13 Hill matrix gives no '+
    'unknown 91-rune paragraph under either direct orientation/direction.'+
    ' No opcode or key has been authenticated.'
},null,2));

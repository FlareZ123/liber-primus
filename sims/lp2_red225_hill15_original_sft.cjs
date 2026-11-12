'use strict';

/**
 * Source-fixed 15x15 GP29 Hill-key experiment on Liber Primus.
 *
 * Evidence: all 225 visibly red runes, including the solved-page red spans,
 * are laid out as 15 contiguous rows of 15. Original ciphertext clocks:
 * full unknown physical pages 0..55, and those pages with red runes deleted.
 * No key is fitted against candidate plaintext.
 *
 * Run from any current working directory with Node.js.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const N = 15;
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;
const byRune = new Map(corpus.runes.map((r, i) => [r, i]));

const spans = new Map(ink.pages.map(p => [p.page, p.red_spans || []]));
const red = ink.pages.flatMap(p => (p.red_spans || [])
  .flatMap(s => Array.from(s.runes, rune => {
    assert.ok(byRune.has(rune), 'unknown printed rune');
    return byRune.get(rune);
  })));
assert.equal(red.length, 225);
const key = Array.from({ length: N }, (_, i) => red.slice(i * N, (i + 1) * N));

function inverse(matrix) {
  const augmented = matrix.map((row, i) => row.concat(
    Array.from({ length: N }, (_, j) => Number(j === i))));
  let determinant = 1;
  for (let j = 0; j < N; j++) {
    let pivot = j;
    while (pivot < N && augmented[pivot][j] === 0) pivot++;
    assert.ok(pivot < N, 'source matrix is singular');
    if (pivot !== j) {
      [augmented[pivot], augmented[j]] = [augmented[j], augmented[pivot]];
      determinant = mod(-determinant);
    }
    const value = augmented[j][j];
    determinant = mod(determinant * value);
    const vInverse = Array.from({ length: MOD - 1 }, (_, k) => k + 1)
      .find(x => mod(value * x) === 1);
    assert.notEqual(vInverse, undefined);
    augmented[j] = augmented[j].map(x => mod(x * vInverse));
    for (let r = 0; r < N; r++) {
      if (r === j) continue;
      const factor = augmented[r][j];
      augmented[r] = augmented[r].map((x, c) =>
        mod(x - factor * augmented[j][c]));
    }
  }
  const result = augmented.map(row => row.slice(N));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let value = 0;
      for (let k = 0; k < N; k++) value += matrix[i][k] * result[k][j];
      assert.equal(mod(value), Number(i === j), 'inverse matrix check');
    }
  }
  return { determinant, result };
}

function transpose(matrix) {
  return matrix[0].map((_, j) => matrix.map(row => row[j]));
}

function blocks(source, matrix) {
  const dest = [];
  for (let off = 0; off + N <= source.length; off += N) {
    for (let i = 0; i < N; i++) {
      let value = 0;
      for (let j = 0; j < N; j++) value += matrix[i][j] * source[off + j];
      dest.push(mod(value));
    }
  }
  return dest;
}

function coincidence(source) {
  const hist = new Array(MOD).fill(0);
  source.forEach(v => hist[v]++);
  return hist.reduce((acc, n) => acc + n * (n - 1), 0) /
    (source.length * (source.length - 1));
}

const unknown = corpus.pages.filter(p => p.page <= 55);
const whole = unknown.flatMap(p => p.indices);
const black = unknown.flatMap(p => {
  const redPosition = new Set(spans.get(p.page)?.flatMap(s =>
    Array.from({ length: s.length }, (_, i) => s.start + i)) || []);
  return p.indices.filter((_, i) => !redPosition.has(i));
});
assert.equal(whole.length, 12956);
assert.equal(black.length, 12743);
const { determinant, result: keyInverse } = inverse(key);
assert.equal(determinant, 8, 'source red key determinant');
const sourcePage = n => corpus.pages.find(p => p.page === n).indices;
const solved = sourcePage(57);
const p55Body75 = sourcePage(55).slice(1);
const terminal255 = p55Body75.concat(sourcePage(56), solved);
const p53PlusP54 = sourcePage(53).concat(sourcePage(54).slice(0, 1));
assert.equal(p55Body75.length, 75);
assert.equal(terminal255.length, 255);
assert.equal(p53PlusP54.length, 180);
const solvedPlant = solved.slice(0, 90);
const transposed = transpose(key);
const inverseTransposed = transpose(keyInverse);
assert.deepEqual(blocks(blocks(solvedPlant, transposed), inverseTransposed),
  solvedPlant, 'transposed authentic positive control');
assert.deepEqual(blocks(blocks(solvedPlant, key), keyInverse), solvedPlant,
  'authentic GP-native p57 positive control');

console.log(JSON.stringify({
  source: 'all 225 red GP29 runes, source-order 15x15 over GF29',
  determinant,
  nativeSolvedP57IoC: coincidence(solved),
  nativeSolvedPlantIoC: coincidence(solvedPlant),
  unknownOriginalIoC: coincidence(whole),
  unknownBlackIoC: coincidence(black),
  originalClockResults: [
    { name: 'unknown full original', input: whole },
    { name: 'unknown black only', input: black },
    { name: 'physical p55 body 75', input: p55Body75 },
    { name: 'terminal p55 body plus p56 and p57 255', input: terminal255 },
    { name: 'p53 plus first rune of p54, 180', input: p53PlusP54 }
  ].map(({ name, input }) => {
    const decoded = blocks(input, keyInverse);
    const reversed = blocks(input, key);
    const transposedInverse = blocks(input, inverseTransposed);
    const transposedForward = blocks(input, transposed);
    assert.deepEqual(blocks(decoded, key), input.slice(0, decoded.length),
      'complete original ciphertext reencryption');
    return {
      name,
      sourceSymbols: input.length,
      decodedSymbols: decoded.length,
      inverseIoC: coincidence(decoded),
      forwardIoC: coincidence(reversed),
      inverseTransposeIoC: coincidence(transposedInverse),
      forwardTransposeIoC: coincidence(transposedForward),
      plaintextPrefix: decoded.slice(0, 80).map(i => corpus.translit[i]).join('')
    };
  })
}, null, 2));

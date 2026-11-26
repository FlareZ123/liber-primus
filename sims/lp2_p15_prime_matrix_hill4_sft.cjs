#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const native = JSON.parse(fs.readFileSync(path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'), 'utf8'));

const GP_RUNE_ORDER = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚩ', 'ᚱ', 'ᚳ', 'ᚷ', 'ᚹ', 'ᚻ', 'ᚾ',
  'ᛁ', 'ᛄ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ',
  'ᛚ', 'ᛝ', 'ᛟ', 'ᛞ', 'ᚪ', 'ᚫ', 'ᚣ', 'ᛡ', 'ᛠ'
];
const GP_INDEX = new Map(GP_RUNE_ORDER.map((rune, index) => [rune, index]));
const MODULUS = 29;
const mod = value => ((value % MODULUS) + MODULUS) % MODULUS;

const visibleGrid = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const fibonacciOrdinals = [
  [13, 21, 34, 55],
  [8, 0, 1, 89],
  [5, 3, 2, 144],
  [987, 610, 377, 233]
];
const spiralPositions = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];

function firstPrimes(count) {
  let limit = 10000;
  while (true) {
    const composite = new Uint8Array(limit + 1);
    const found = [];
    for (let n = 2; n <= limit; n++) {
      if (composite[n]) continue;
      found.push(n);
      if (n * n <= limit) {
        for (let k = n * n; k <= limit; k += n) composite[k] = 1;
      }
    }
    if (found.length >= count) return found.slice(0, count);
    limit *= 2;
  }
}
const primeList = firstPrimes(988);
const primeGrid = fibonacciOrdinals.map(row => row.map(f => primeList[f]));

assert.deepEqual(primeGrid, [
  [43, 79, 149, 263],
  [23, 2, 3, 463],
  [13, 7, 5, 829],
  [7817, 4507, 2593, 1481]
]);
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    assert.equal(Math.abs(3301 - primeGrid[r][c]), visibleGrid[r][c]);
  }
}

const fullTarget = corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices);
const nextChapter = corpus.pages.filter(page => page.page >= 16 && page.page <= 22).flatMap(page => page.indices);
assert.equal(fullTarget.length, 12956);
assert.equal(fullTarget.length % 4, 0);
assert.equal(nextChapter.length, 1744);
assert.equal(nextChapter.length % 4, 0);

const nativeRunes = native.sections
  .filter(section => section.name !== 'p56_an_end' && section.name !== 'p57_parable')
  .flatMap(section => [...section.source_text]
    .filter(rune => GP_INDEX.has(rune))
    .map(rune => GP_INDEX.get(rune)));
assert.equal(nativeRunes.length, 2799);
const nativeControl = nativeRunes.slice(0, 1744);
assert.equal(nativeControl.length, 1744);

function inverseMod(value) {
  for (let candidate = 1; candidate < MODULUS; candidate++) {
    if (mod(value * candidate) === 1) return candidate;
  }
  throw new Error('No inverse modulo 29 for ' + value);
}

function determinantMod(matrix) {
  const work = matrix.map(row => row.slice());
  let determinant = 1;
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    while (pivot < 4 && work[pivot][col] === 0) pivot++;
    if (pivot === 4) return 0;
    if (pivot !== col) {
      [work[pivot], work[col]] = [work[col], work[pivot]];
      determinant = mod(-determinant);
    }
    const value = work[col][col];
    determinant = mod(determinant * value);
    const reciprocal = inverseMod(value);
    for (let row = col + 1; row < 4; row++) {
      const factor = mod(work[row][col] * reciprocal);
      for (let j = col; j < 4; j++) {
        work[row][j] = mod(work[row][j] - factor * work[col][j]);
      }
    }
  }
  return determinant;
}

function inverseMatrix(matrix) {
  const work = matrix.map((row, index) => [
    ...row,
    ...Array.from({ length: 4 }, (_, j) => index === j ? 1 : 0)
  ]);
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    while (pivot < 4 && work[pivot][col] === 0) pivot++;
    if (pivot === 4) throw new Error('Singular 4x4 matrix over GF(29)');
    [work[pivot], work[col]] = [work[col], work[pivot]];
    const reciprocal = inverseMod(work[col][col]);
    work[col] = work[col].map(value => mod(value * reciprocal));
    for (let row = 0; row < 4; row++) {
      if (row === col) continue;
      const factor = work[row][col];
      work[row] = work[row].map((value, j) => mod(value - factor * work[col][j]));
    }
  }
  return work.map(row => row.slice(4));
}

function transform(tape, matrix, orientation) {
  assert.equal(tape.length % 4, 0);
  const output = [];
  for (let offset = 0; offset < tape.length; offset += 4) {
    const block = tape.slice(offset, offset + 4);
    if (orientation === 'column') {
      for (let row = 0; row < 4; row++) {
        let value = 0;
        for (let col = 0; col < 4; col++) value += matrix[row][col] * block[col];
        output.push(mod(value));
      }
    } else {
      for (let col = 0; col < 4; col++) {
        let value = 0;
        for (let row = 0; row < 4; row++) value += block[row] * matrix[row][col];
        output.push(mod(value));
      }
    }
  }
  return output;
}

function indexOfCoincidence(tape) {
  const counts = Array(29).fill(0);
  for (const value of tape) counts[value]++;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (tape.length * (tape.length - 1));
}

function matrixFor(grid, layout) {
  const flat = grid.flat().map(mod);
  const values = layout === 'printed-row-major'
    ? flat
    : spiralPositions.map(position => flat[position]);
  return Array.from({ length: 4 }, (_, row) => values.slice(row * 4, row * 4 + 4));
}

const results = [];
for (const [representation, grid] of [
  ['literal-printed-values', visibleGrid],
  ['recovered-fibonacci-indexed-primes', primeGrid]
]) {
  for (const layout of ['printed-row-major', 'spiral-reflow']) {
    const matrix = matrixFor(grid, layout);
    const determinant = determinantMod(matrix);
    assert.notEqual(determinant, 0);
    const inverse = inverseMatrix(matrix);

    // Source-native 1,744-rune plant: both matrix directions and vector conventions
    // must invert exactly before the original ciphertext is scored.
    for (const orientation of ['column', 'row']) {
      assert.deepEqual(
        transform(transform(nativeControl, matrix, orientation), inverse, orientation),
        nativeControl
      );
      assert.deepEqual(
        transform(transform(nativeControl, inverse, orientation), matrix, orientation),
        nativeControl
      );
    }

    for (const orientation of ['column', 'row']) {
      for (const [operator, key] of [['inverse', inverse], ['direct', matrix]]) {
        for (const [scope, source] of [['full-p0-p55', fullTarget], ['following-p16-p22', nextChapter]]) {
          const output = transform(source, key, orientation);
          results.push({
            scope,
            representation,
            layout,
            orientation,
            operator,
            determinant,
            ioc: Number(indexOfCoincidence(output).toFixed(8))
          });
        }
      }
    }
  }
}

const summary = {
  source: 'LP2 physical p15 original 4x4 numerical spiral; 3301 and the red 3299 origin',
  primeGrid,
  primeGridModulo29: matrixFor(primeGrid, 'printed-row-major'),
  primeGridDeterminantModulo29: determinantMod(matrixFor(primeGrid, 'printed-row-major')),
  primeGridInverseModulo29: inverseMatrix(matrixFor(primeGrid, 'printed-row-major')),
  fullTarget: {
    runes: fullTarget.length,
    divisibleByFour: fullTarget.length % 4 === 0,
    ioc: Number(indexOfCoincidence(fullTarget).toFixed(8))
  },
  followingChapter: {
    runes: nextChapter.length,
    divisibleByFour: nextChapter.length % 4 === 0,
    ioc: Number(indexOfCoincidence(nextChapter).toFixed(8))
  },
  nativeControl: {
    runes: nativeControl.length,
    ioc: Number(indexOfCoincidence(nativeControl).toFixed(8)),
    allMatrixPlantsRecovered: true
  },
  candidateIocRange: [
    Math.min(...results.map(row => row.ioc)),
    Math.max(...results.map(row => row.ioc))
  ],
  results
};

const rendered = JSON.stringify(summary, null, 2) + '\n';
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), rendered);
}
console.log(rendered);

'use strict';

/**
 * SFT: test whether the p27 19-rune red title can be a single fixed affine
 * combination of four 19-rune p55 layers. All arithmetic is in F29.
 *
 * An exact rank obstruction covers every possible coefficient vector
 * (29^5 choices, including the constant); no coefficient sweep is needed.
 * Original source: resources/liber-primus/lp2-corpus.json.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const title = corpus.pages.find((page) => page.page === 27).indices.slice(0, 19);
assert.equal(p55.length, 76);
assert.equal(title.length, 19);

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % 29) + 29) % 29;
}

/**
 * Compute row rank over F29, retaining exact integer arithmetic.
 * @param {number[][]} vectors
 * @returns {number}
 */
function rank(vectors) {
  const a = vectors.map((row) => row.map(mod));
  const n = a.length;
  const width = a[0].length;
  let pivotRow = 0;
  for (let column = 0; column < width && pivotRow < n; column++) {
    let chosen = pivotRow;
    while (chosen < n && a[chosen][column] === 0) chosen++;
    if (chosen === n) continue;
    [a[chosen], a[pivotRow]] = [a[pivotRow], a[chosen]];
    const val = a[pivotRow][column];
    let inv = 1;
    while (mod(val * inv) !== 1) inv++;
    for (let j = column; j < width; j++) {
      a[pivotRow][j] = mod(a[pivotRow][j] * inv);
    }
    for (let row = 0; row < n; row++) {
      if (row === pivotRow) continue;
      const factor = a[row][column];
      for (let j = column; j < width; j++) {
        a[row][j] = mod(a[row][j] - factor * a[pivotRow][j]);
      }
    }
    pivotRow++;
  }
  return pivotRow;
}

/** @param {number[][]} layers @param {number[]} expected @returns {boolean} */
function affineCanProduce(layers, expected) {
  const constant = Array(19).fill(1);
  const basis = [...layers, constant];
  return rank(basis) === rank([...basis, expected]);
}

const rawRows = Array.from({ length: 4 }, (_, i) =>
  p55.slice(i * 19, (i + 1) * 19),
);

/**
 * @param {number} flipMask
 * @param {(index: number) => number} projection
 * @returns {number[][]}
 */
function rows(flipMask, projection) {
  return rawRows.map((row, k) =>
    ((flipMask >> k) & 1 ? row.slice().reverse() : row).map(projection),
  );
}

const projections = {
  ordinal: (index) => index,
  'prime-mod29': (index) => corpus.prime[index] % 29,
};

const summary = {};
for (const [name, projection] of Object.entries(projections)) {
  let fits = 0;
  let checked = 0;
  for (let mask = 0; mask < 16; mask++) {
    const layers = rows(mask, projection);
    assert.equal(rank([...layers, Array(19).fill(1)]), 5);
    for (let targetReversed = 0; targetReversed < 2; targetReversed++) {
      const t = (targetReversed ? title.slice().reverse() : title).map(projection);
      if (affineCanProduce(layers, t)) fits++;
      checked++;
    }
  }
  assert.equal(checked, 32);
  assert.equal(fits, 0);
  summary[name] = { sourceCases: checked, exactAffineMatches: fits };
}

// Positive control: deliberately construct an output from the same four rows,
// with two reversed rows, five nontrivial F29 coefficients, and reverse its
// complete 19-column reading order.
for (const [name, projection] of Object.entries(projections)) {
  const plantedRows = rows(0b0101, projection);
  const planted = Array.from({ length: 19 }, (_, j) =>
    mod(3 * plantedRows[0][j] + 5 * plantedRows[1][j]
      + 7 * plantedRows[2][j] + 11 * plantedRows[3][j] + 13),
  );
  assert(affineCanProduce(plantedRows, planted));
  assert(affineCanProduce(plantedRows, planted.slice().reverse().reverse()));
  summary[name].syntheticPositivePassed = true;
}

console.log(JSON.stringify({
  test: 'p55-fold-to-p27-title-four-layer-affine-F29',
  p55Runes: p55.length,
  p27TitleRunes: title.length,
  coefficientsPerModel: 29 ** 5,
  sourceHypotheses: 16 * 2 * 2,
  summary,
}, null, 2));

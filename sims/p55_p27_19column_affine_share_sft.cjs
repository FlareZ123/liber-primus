'use strict';

/**
 * SFT: test whether the p27 19-rune red title can be a fixed low-degree
 * polynomial of four consecutive 19-rune p55 rows over F29.
 *
 * Exact rank obstructions cover every 29^5 affine coefficient vector and
 * every 29^15 quadratic coefficient vector without enumerating keys.
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

/**
 * @param {number[][]} layers
 * @param {1 | 2} degree
 * @returns {number[][]}
 */
function polynomialBasis(layers, degree) {
  const basis = [Array(19).fill(1), ...layers];
  if (degree === 2) {
    for (let i = 0; i < 4; i++) {
      for (let j = i; j < 4; j++) {
        basis.push(layers[i].map((value, k) => mod(value * layers[j][k])));
      }
    }
  }
  return basis;
}

/**
 * @param {number[][]} layers
 * @param {number[]} expected
 * @param {1 | 2} degree
 * @returns {boolean}
 */
function polynomialCanProduce(layers, expected, degree) {
  const basis = polynomialBasis(layers, degree);
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
  let affineFits = 0;
  let quadraticFits = 0;
  let checked = 0;
  for (let mask = 0; mask < 16; mask++) {
    const layers = rows(mask, projection);
    assert.equal(rank(polynomialBasis(layers, 1)), 5);
    assert.equal(rank(polynomialBasis(layers, 2)), 15);
    for (let targetReversed = 0; targetReversed < 2; targetReversed++) {
      const t = (targetReversed ? title.slice().reverse() : title).map(projection);
      assert.equal(rank([...polynomialBasis(layers, 1), t]), 6);
      assert.equal(rank([...polynomialBasis(layers, 2), t]), 16);
      if (polynomialCanProduce(layers, t, 1)) affineFits++;
      if (polynomialCanProduce(layers, t, 2)) quadraticFits++;
      checked++;
    }
  }
  assert.equal(checked, 32);
  assert.equal(affineFits, 0);
  assert.equal(quadraticFits, 0);
  summary[name] = {
    sourceCases: checked,
    affineBasisRank: 5,
    quadraticBasisRank: 15,
    affineWithTitleRank: 6,
    quadraticWithTitleRank: 16,
    exactAffineMatches: affineFits,
    exactQuadraticMatches: quadraticFits,
  };
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
  assert(polynomialCanProduce(plantedRows, planted, 1));
  assert(polynomialCanProduce(plantedRows, planted, 2));
  const plantedQuadratic = Array.from({ length: 19 }, (_, j) =>
    mod(3 * plantedRows[0][j] * plantedRows[1][j]
      + 5 * plantedRows[2][j] * plantedRows[2][j]
      + 7 * plantedRows[3][j] + 11),
  );
  assert(polynomialCanProduce(plantedRows, plantedQuadratic, 2));
  summary[name].syntheticAffineAndQuadraticPositivesPassed = true;
}

console.log(JSON.stringify({
  test: 'p55-fold-to-p27-title-four-layer-degree-1-or-2-F29',
  p55Runes: p55.length,
  p27TitleRunes: title.length,
  affineCoefficientChoicesPerModel: 29 ** 5,
  quadraticCoefficientChoicesPerModel: 29 ** 15,
  sourceHypotheses: 16 * 2 * 2,
  summary,
}, null, 2));

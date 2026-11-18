'use strict';

/**
 * Reproduce the p57 FIND -> p28 -> maximal prime-run -> p29/p30 selector.
 * This verifies a source-constrained navigation bridge. It does not decrypt LP2.
 *
 * Run from repository root:
 *   node sims/lp2_p57_find28_primerun_p29p30_selector_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MOD = 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

/** @param {number} value @param {number} modulus @returns {number} */
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  if (value % 2 === 0) return value === 2;
  for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @param {number} value @returns {boolean} */
function isPrimeSimple(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @param {number} ordinal one-based prime ordinal @returns {number} */
function nthPrime(ordinal) {
  let seen = 0;
  for (let candidate = 2; ; candidate++) {
    if (!isPrimeSimple(candidate)) continue;
    seen++;
    if (seen === ordinal) return candidate;
  }
}

/** @param {string} source @param {Map<string, number>} runeIndex @returns {number[][]} */
function pageWords(source, runeIndex) {
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  for (const char of source) {
    if (runeIndex.has(char)) {
      current.push(runeIndex.get(char));
    } else if (current.length && '-.$&§'.includes(char)) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/** @param {string} token @param {string} alphabet @returns {number} */
function tokenValue(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {number[]} coefficients descending coefficients @param {number} x @returns {{value:number, derivative:number}} */
function polynomialValueAndDerivative(coefficients, x) {
  let value = 0;
  let derivative = 0;
  for (const coefficient of coefficients) {
    derivative = mod(derivative * x + value, MOD);
    value = mod(value * x + coefficient, MOD);
  }
  return {value, derivative};
}

/** @param {number} value @returns {number} */
function inverseMod29(value) {
  const x = mod(value, MOD);
  for (let candidate = 1; candidate < MOD; candidate++) {
    if (mod(x * candidate, MOD) === 1) return candidate;
  }
  throw new Error(`No inverse for ${value}`);
}

/** @param {number[][]} input @returns {number} */
function determinantMod29(input) {
  const matrix = input.map(row => row.map(value => mod(value, MOD)));
  let determinant = 1;
  for (let column = 0; column < matrix.length; column++) {
    let pivot = column;
    while (pivot < matrix.length && matrix[pivot][column] === 0) pivot++;
    if (pivot === matrix.length) return 0;
    if (pivot !== column) {
      [matrix[pivot], matrix[column]] = [matrix[column], matrix[pivot]];
      determinant = mod(-determinant, MOD);
    }
    const pivotValue = matrix[column][column];
    determinant = mod(determinant * pivotValue, MOD);
    const inverse = inverseMod29(pivotValue);
    for (let row = column + 1; row < matrix.length; row++) {
      const factor = mod(matrix[row][column] * inverse, MOD);
      for (let col = column; col < matrix.length; col++) {
        matrix[row][col] = mod(matrix[row][col] - factor * matrix[column][col], MOD);
      }
    }
  }
  return determinant;
}

/** @param {number[][]} matrix @param {number} x @returns {number} */
function charValue(matrix, x) {
  return determinantMod29(matrix.map((row, r) =>
    row.map((value, c) => mod((r === c ? x : 0) - value, MOD))));
}

/** @param {number} x @returns {number} */
function expectedCharacteristicValue(x) {
  return mod((x - 8) * (x - 17) * (x - 24) * (x - 24), MOD);
}

function run() {
  const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
  const transcription = read('resources/liber-primus/lp2-transcription.txt');
  const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

  // The canonical transcription omits the rune-free p50 segment. Its final
  // segment is physical p57, the solved PARABLE page.
  const p57Source = transcription.split('%').at(-1);
  const p57Words = pageWords(p57Source, runeIndex);
  assert.equal(p57Words.length, 20);
  const p57Names = p57Words.map(word => word.map(index => corpus.translit[index]).join(''));
  const findIndex = p57Names.indexOf('FIND');
  assert(findIndex >= 0);
  const findAddress = p57Words[findIndex].reduce((sum, index) => sum + index, 0);
  assert.equal(findAddress, 42);

  const tokens = grid.pages.flatMap(page => page.tokens);
  assert.equal(tokens.length, 256);
  const findToken = tokens[findAddress];
  assert.equal(findToken, '0S');
  assert.equal(tokenValue(findToken, grid.alphabet), 28);
  assert.equal(tokenValue(findToken, grid.alphabet.replace('f', '')), 28);

  const pageCounts = new Map(corpus.pages
    .filter(page => page.page <= 55)
    .map(page => [page.page, page.runic_count]));
  assert.equal(pageCounts.get(28), 269);
  assert(isPrime(pageCounts.get(28)));

  // Extend from the FIND-selected page while adjacent physical page lengths
  // remain prime. The boundaries are fixed by the first non-prime neighbors.
  let left = 28;
  let right = 28;
  while (left > 0 && isPrime(pageCounts.get(left - 1))) left--;
  while (right < 55 && isPrime(pageCounts.get(right + 1))) right++;
  assert.deepEqual([left, right], [28, 31]);
  const selectedRun = [];
  for (let page = left; page <= right; page++) {
    selectedRun.push(pageCounts.get(page));
  }
  assert.deepEqual(selectedRun, [269, 277, 263, 269]);
  assert.equal(pageCounts.get(27), 234);
  assert.equal(pageCounts.get(32), 121);
  assert(!isPrime(pageCounts.get(27)) && !isPrime(pageCounts.get(32)));

  // Census every maximal consecutive prime-length run on unknown p0-p55.
  /** @type {{start:number,end:number,counts:number[]}[]} */
  const primeRuns = [];
  for (let page = 0; page <= 55;) {
    if (!isPrime(pageCounts.get(page))) {
      page++;
      continue;
    }
    const start = page;
    const counts = [];
    while (page <= 55 && isPrime(pageCounts.get(page))) {
      counts.push(pageCounts.get(page));
      page++;
    }
    primeRuns.push({start, end: page - 1, counts});
  }
  const maxLength = Math.max(...primeRuns.map(item => item.counts.length));
  assert.equal(maxLength, 4);
  assert.deepEqual(primeRuns.filter(item => item.counts.length === maxLength), [
    {start: 28, end: 31, counts: [269, 277, 263, 269]}
  ]);

  // Literal endpoint shedding leaves exactly the two middle pages.
  assert.equal(selectedRun[0], selectedRun.at(-1));
  const innerPages = [29, 30];
  assert.equal(pageCounts.get(29) + pageCounts.get(30), 540);
  assert.equal(540 % 4, 0);

  // Reconstruct the established p15 Fibonacci-prime generator before taking
  // absolute values. Only the final two spiral terms are negative.
  const printed = [
    [3258, 3222, 3152, 3038],
    [3278, 3299, 3298, 2838],
    [3288, 3294, 3296, 2472],
    [4516, 1206, 708, 1820]
  ];
  const spiral = [
    [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
    [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]
  ];
  const fib = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
  const signed = Array.from({length: 4}, () => Array(4).fill(0));
  for (let i = 0; i < spiral.length; i++) {
    const [row, column] = spiral[i];
    const delta = 3301 - nthPrime(fib[i] + 1);
    assert.equal(Math.abs(delta), printed[row][column]);
    signed[row][column] = delta;
  }
  assert.deepEqual(signed[3], [-4516, -1206, 708, 1820]);
  const matrix = signed.map(row => row.map(value => mod(value, MOD)));
  assert.deepEqual(matrix, [
    [10,3,20,22],
    [1,22,21,25],
    [11,17,19,7],
    [8,12,12,22]
  ]);

  // A degree-four characteristic polynomial is fixed by five field values.
  // These checks prove chi_M(X)=(X-8)(X-17)(X-24)^2 over GF(29).
  for (let x = 0; x < 5; x++) {
    assert.equal(charValue(matrix, x), expectedCharacteristicValue(x));
  }

  const p29 = corpus.pages.find(page => page.page === 29).indices;
  const p30 = corpus.pages.find(page => page.page === 30).indices;
  assert.equal(p29.length, 277);
  assert.equal(p30.length, 263);
  const p29At24 = polynomialValueAndDerivative(p29, 24);
  assert.deepEqual(p29At24, {value: 0, derivative: 0});
  assert.equal(polynomialValueAndDerivative(p30, 8).value, 0);
  assert.equal(polynomialValueAndDerivative(p30, 17).value, 0);

  // Page-wide controls: these factor signatures are unique among the 55
  // rune-bearing unknown physical pages.
  const unknownRunePages = corpus.pages.filter(page => page.page <= 55 && page.runic_count > 0);
  const double24Pages = unknownRunePages.filter(page => {
    const check = polynomialValueAndDerivative(page.indices, 24);
    return check.value === 0 && check.derivative === 0;
  }).map(page => page.page);
  const roots8and17Pages = unknownRunePages.filter(page =>
    polynomialValueAndDerivative(page.indices, 8).value === 0 &&
    polynomialValueAndDerivative(page.indices, 17).value === 0
  ).map(page => page.page);
  assert.deepEqual(double24Pages, [29]);
  assert.deepEqual(roots8and17Pages, [30]);

  return {
    classification: 'source-constrained selector bridge; no unknown plaintext recovered',
    find: {gp0Address: findAddress, token: findToken, decodedPage: 28},
    maximalPrimeRun: {pages: [28,29,30,31], counts: selectedRun, uniqueLongest: true},
    shedEndpoints: {outerCounts: [269,269], innerPages, innerRuneCount: 540, fourRuneBlocks: 135},
    p15Characteristic: '(X-8)(X-17)(X-24)^2 over GF(29)',
    innerSpectralFactors: {
      p29: '(X-24)^2',
      p30: '(X-8)(X-17)'
    },
    decision: 'FIND-selected p28 fixes the unique longest prime-length page run; literal endpoint shedding selects p29+p30, which carry the complementary p15 spectral factors. Existing direct Hill consumers remain negative.'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = {run, isPrime, polynomialValueAndDerivative, determinantMod29};

/**
 * Source-original 2014 Cicada three OpenPuff magic squares:
 * an exact mod29 reflection identity for the first and last 5x5 sources.
 *
 * Source: resources/cicada2014-openpuff-magic-squares.txt
 * Full original integer powers, exact gcd certificates, actual LP2 GP29
 * receiver and source-native plaintext plant. No fitted cipher keys.
 *
 * Windows Node22 SFT:
 * node sims/lp2_2014_two_magic_squares_gp29_reflection_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');

/**
 * @param {number[][]} source
 * @returns {bigint[][]}
 */
function bigMatrix(source) { return source.map(row => row.map(BigInt)); }
/** @param {number} n @returns {bigint[][]} */
function identity(n) { return Array.from({ length: n }, (_, r) =>
  Array.from({ length: n }, (_, c) => r === c ? 1n : 0n)); }
/** @param {number} n @returns {bigint[][]} */
function reversal(n) { return Array.from({ length: n }, (_, r) =>
  Array.from({ length: n }, (_, c) => r + c === n - 1 ? 1n : 0n)); }
/** @param {bigint[][]} a @param {bigint[][]} b @returns {bigint[][]} */
function multiply(a, b) {
  const n = a.length;
  assert.equal(b.length, n);
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) =>
      a[r].reduce((sum, v, k) => sum + v * b[k][c], 0n)));
}
/** @param {bigint[][]} a @param {number} exponent @returns {bigint[][]} */
function power(a, exponent) {
  assert(exponent >= 0 && Number.isInteger(exponent));
  let x = a;
  let n = exponent;
  let out = identity(a.length);
  while (n > 0) {
    if (n % 2) out = multiply(out, x);
    x = multiply(x, x);
    n = Math.floor(n / 2);
  }
  return out;
}
/** @param {bigint} x @param {bigint} y @returns {bigint} */
function gcd(x, y) {
  x = x < 0n ? -x : x;
  y = y < 0n ? -y : y;
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}
/** @param {bigint[][]} a @param {bigint[][]} b @returns {bigint} */
function gcdResidual(a, b) {
  return a.flatMap((r, i) => r.map((x, j) => x - b[i][j]))
    .reduce((acc, value) => gcd(acc, value), 0n);
}
/** @param {bigint} value @returns {bigint} */
function mod29(value) { return ((value % 29n) + 29n) % 29n; }
/** @param {bigint[][]} value @returns {bigint[][]} */
function reduce29(value) { return value.map(row => row.map(mod29)); }
/** @param {bigint[][]} value @returns {number[][]} */
function number29(value) { return reduce29(value).map(row => row.map(Number)); }
/**
 * @param {number[][]} matrix
 * @param {number[]} vector
 * @returns {number[]}
 */
function vector29(matrix, vector) {
  assert.equal(matrix.length, vector.length);
  return matrix.map(row => row.reduce((sum, value, i) =>
    (sum + value * vector[i]) % 29, 0));
}
/**
 * Characteristic polynomial of 5x5 over GF29 via Newton identities.
 * Returns leading coefficient first: x^5+c1*x^4+...+c5.
 * All divisors 1..5 are units modulo29.
 * @param {bigint[][]} source
 * @returns {number[]}
 */
function characteristic5(source) {
  const matrix = number29(source);
  const n = matrix.length;
  assert.equal(n, 5);
  const multiply29 = (a, b) => a.map(row =>
    b[0].map((_, j) => row.reduce((sum, v, k) => (sum + v * b[k][j]) % 29, 0)));
  const mod = x => ((x % 29) + 29) % 29;
  let current = number29(identity(5));
  const coefficients = [1];
  const traces = [];
  for (let k = 1; k <= 5; k++) {
    current = multiply29(current, matrix);
    const trace = current.reduce((sum, row, i) => sum + row[i], 0) % 29;
    // For Newton's identities we need traces of all powers, not only k.
    // The traces are collected and reused from the already-computed powers.
    traces.push(trace);
    let numerator = 0;
    for (let j = 1; j <= k; j++) {
      numerator = mod(numerator + coefficients[k - j] * traces[j - 1]);
    }
    const inverse = Array.from({ length: 28 }, (_, i) => i + 1)
      .find(x => (x * k) % 29 === 1);
    coefficients.push(mod(-numerator * inverse));
  }
  return coefficients;
}

/** @param {number[]} roots @returns {number[]} */
function polynomialFromRoots(roots) {
  let ascending = [1];
  for (const value of roots) {
    const next = Array(ascending.length + 1).fill(0);
    for (let i = 0; i < ascending.length; i++) {
      next[i] = ((next[i] - ascending[i] * value) % 29 + 29) % 29;
      next[i + 1] = (next[i + 1] + ascending[i]) % 29;
    }
    ascending = next;
  }
  return [...ascending].reverse();
}

/** @param {bigint[][]} input @param {number[]} coefficients */
function polynomialOnMatrix(input, coefficients) {
  const M = number29(input);
  const n = M.length;
  const mul = (a, b) => a.map(row =>
    b[0].map((_, j) => row.reduce((sum, v, k) => (sum + v * b[k][j]) % 29, 0)));
  let state = number29(identity(n));
  for (let i = 1; i < coefficients.length; i++) {
    state = mul(state, M);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        state[r][c] = (state[r][c] + (r === c ? coefficients[i] : 0)) % 29;
      }
    }
  }
  return state;
}

/** @param {number[]} seq @returns {{ioc:number,top12:number}} */
function score(seq) {
  const hist = Array(29).fill(0);
  for (const x of seq) hist[x]++;
  const n = seq.length;
  return {
    ioc: hist.reduce((sum, v) => sum + v * (v - 1), 0) / (n * (n - 1)),
    top12: [...hist].sort((a, b) => b - a).slice(0, 12).reduce((s, v) => s + v, 0)
  };
}

function main() {
  const sourcePath = path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt');
  const sections = fs.readFileSync(sourcePath, 'utf8').trim().split(/\r?\n\s*\r?\n/);
  const squares = sections.map(section => section.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(squares.map(s => [s.length, ...new Set(s.map(r => r.length))]),
    [[5, 5], [7, 7], [5, 5]]);
  const [first3301, middle7, last1033] = squares;
  assert.equal(first3301[0].reduce((s, v) => s + v, 0), 3301);
  assert.equal(last1033[0].reduce((s, v) => s + v, 0), 1033);
  assert.deepEqual(first3301[0], [434, 1311, 312, 278, 966]);
  assert.deepEqual(last1033[0], [272, 138, 341, 131, 151]);
  assert.equal(middle7[3][3], 331);
  const first = bigMatrix(first3301), last = bigMatrix(last1033);
  const J = reversal(5), U = Array.from({ length: 5 }, () => Array(5).fill(1n));
  const negJ = J.map(row => row.map(x => -x));
  const meanReverse = U.map((row, r) => row.map((x, c) => 12n * x - J[r][c]));
  // These are integer equalities ONLY after reduction mod29.
  // The gcd is evaluated on enormous ORIGINAL-ENTRY powers, not on a
  // GF29 matrix chosen after seeing any unencrypted LP2 output.
  const first28 = power(first, 28);
  const last14 = power(last, 14);
  const firstGcd = gcdResidual(first28, meanReverse);
  const lastGcd = gcdResidual(last14, negJ);
  assert.equal(firstGcd, 29n);
  assert.equal(lastGcd, 29n);
  assert.deepEqual(reduce29(first28), reduce29(meanReverse));
  assert.deepEqual(reduce29(last14), reduce29(negJ));
  assert.deepEqual(reduce29(power(first, 56)), identity(5));
  assert.deepEqual(reduce29(power(last, 28)), identity(5));
  // Native modular orders are sharp: 3301 square 56; 1033 square 28.
  for (let k = 1; k < 56; k++) {
    assert.notDeepEqual(reduce29(power(first, k)), identity(5));
  }
  for (let k = 1; k < 28; k++) {
    assert.notDeepEqual(reduce29(power(last, k)), identity(5));
  }
  // Their conjugation-free half-period state laws are involutions.
  assert.deepEqual(reduce29(multiply(first28, first28)), identity(5));
  assert.deepEqual(reduce29(multiply(last14, last14)), identity(5));
  // The two 5x5 original matrices themselves are invertible mod29.
  const firstInverse = reduce29(power(first, 55));
  const lastInverse = reduce29(power(last, 27));
  assert.deepEqual(reduce29(multiply(first, firstInverse)), identity(5));
  assert.deepEqual(reduce29(multiply(last, lastInverse)), identity(5));

  // The actual solved LP1 *WARNING* prints "DO NOT EDIT OR CHANGE
  // THIS BOOK". The five GP-index runes of the literal word CHANGE are
  // [C,H,A,NG,E]=[5,8,24,21,18], not six Latin letters.
  // Freeze exactly the three 5-rune distinct-symbol words occurring in
  // that first solved warning and compare their *unordered* native
  // GP-index multisets to the final original 1033-matrix eigenvalues.
  const warningSource = fs.readFileSync(path.join(root, 'resources',
    'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8');
  const warning = warningSource.split('### 1')[1].split('### 3')[0];
  assert(warning.includes('DO NOT EDIT OR CHANGE THIS BOOK'));
  const warningWords = (warning.match(/[A-Z]+/g) || [])
    .map(word => ({ word, runes: encodeSourceNativeGP(word) }))
    .filter(entry => entry.runes.length === 5 && new Set(entry.runes).size === 5);
  assert.deepEqual([...new Set(warningWords.map(entry => entry.word))].sort(),
    ['CHANGE', 'WARNING', 'WORDS']);
  const change = encodeSourceNativeGP('CHANGE');
  assert.deepEqual(change, [5, 8, 24, 21, 18]);
  const targetRoots = [...change].sort((a, b) => a - b);
  const matches = warningWords
    .filter(entry => [...entry.runes].sort((a, b) => a - b)
      .every((v, i) => v === targetRoots[i]))
    .map(entry => entry.word);
  assert.deepEqual(matches, ['CHANGE']);
  const finalCharacteristic = characteristic5(last);
  assert.deepEqual(finalCharacteristic, [1, 11, 27, 7, 5, 26]);
  assert.deepEqual(polynomialFromRoots(change), finalCharacteristic);
  assert.deepEqual(polynomialOnMatrix(last, finalCharacteristic),
    number29(Array.from({ length: 5 }, () => Array(5).fill(0n))));
  assert.notDeepEqual(polynomialOnMatrix(first, finalCharacteristic),
    number29(Array.from({ length: 5 }, () => Array(5).fill(0n))));
  // Falsification control: 4 unit cell changes, preserving the complete
  // 1033 row sums, column sums, both major diagonals and 180-degree
  // centrosymmetry, DESTROY the spectral CHANGE word.
  const magicPreservingPerturbation = [
    [0, 0, 0, 0, 0],
    [1, 0, 0, 0, -1],
    [0, 0, 0, 0, 0],
    [-1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0]
  ];
  const counterfactual = last.map((row, i) =>
    row.map((x, j) => x + BigInt(magicPreservingPerturbation[i][j])));
  for (let i = 0; i < 5; i++) {
    assert.equal(counterfactual[i].reduce((s, x) => s + x, 0n), 1033n);
    assert.equal(counterfactual.reduce((s, row) => s + row[i], 0n), 1033n);
    for (let j = 0; j < 5; j++) {
      assert.equal(counterfactual[i][j], counterfactual[4 - i][4 - j]);
    }
  }
  assert.equal(counterfactual.reduce((s, row, i) => s + row[i], 0n), 1033n);
  assert.equal(counterfactual.reduce((s, row, i) => s + row[4 - i], 0n), 1033n);
  const counterfactualPolynomial = characteristic5(counterfactual);
  assert.deepEqual(counterfactualPolynomial, [1, 11, 13, 27, 2, 22]);
  assert.notDeepEqual(counterfactualPolynomial, finalCharacteristic);

  const original = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const tape = original.pages.filter(p => p.page <= 55).flatMap(p => p.indices || []);
  assert.equal(tape.length, 12956);
  const bookend = tape.slice(6561);
  assert.equal(bookend.length, 5 * 1279);
  const numericTable = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
  const source256Bytes = numericTable.pages.flatMap(page => page.bytes);
  assert.equal(source256Bytes.length, 256);
  const firstPowers = Array.from({ length: 56 }, (_, exponent) =>
    number29(power(first, exponent)));
  const lastPowers = Array.from({ length: 28 }, (_, exponent) =>
    number29(power(last, exponent)));
  const invertLast = number29(lastInverse), forwardLast = number29(last);
  const invertFirst = number29(firstInverse);
  const native = encodeSourceNativeGP(fs.readFileSync(
    path.join(root, 'resources', 'control', 'gibran_prophet_58585.txt'), 'utf8'));
  assert(native.length >= bookend.length);
  const direct = [], alternate = [], back = [], planted = [];
  const byteClockFirst = [], byteClockLast = [];
  for (let i = 0; i < bookend.length; i += 5) {
    const originalFive = bookend.slice(i, i + 5);
    // Freeze the conventional base60 source p49-51 table byte stream as
    // one exponent per five-rune block, repeated in printed byte order.
    const sourceByte = source256Bytes[(i / 5) % 256];
    const firstRound = firstPowers[(56 - sourceByte % 56) % 56];
    const lastRound = lastPowers[(28 - sourceByte % 28) % 28];
    byteClockFirst.push(...vector29(firstRound, originalFive));
    byteClockLast.push(...vector29(lastRound, originalFive));
    const actualOne = vector29(invertLast, originalFive);
    direct.push(...actualOne);
    alternate.push(...vector29(invertFirst, originalFive));
    assert.deepEqual(vector29(forwardLast, actualOne), originalFive);
    const plainFive = native.slice(i, i + 5);
    const cipherFive = vector29(forwardLast, plainFive);
    planted.push(...vector29(invertLast, cipherFive));
    back.push(...cipherFive);
  }
  assert.deepEqual(planted, native.slice(0, bookend.length));
  assert.equal(back.length, bookend.length);
  // Both source-defined standalone Hill inverses still have original
  // nearly uniform GP29 first-order statistics.
  assert(score(direct).ioc < 0.04);
  assert(score(alternate).ioc < 0.04);
  assert(score(planted).ioc > 0.045);
  assert.equal(score(byteClockFirst).ioc, 0.03441972940327413);
  assert.equal(score(byteClockLast).ioc, 0.03448282608573372);

  console.log(JSON.stringify({
    source: 'resources/cicada2014-openpuff-magic-squares.txt',
    historical_dimensions: squares.map(s => s.length),
    first_five_magic_sum: 3301,
    final_five_magic_sum: 1033,
    source_warning_word_spectral_correspondence: {
      original_lp1_warning_five_distinct_GP_words: ['CHANGE', 'WARNING', 'WORDS'],
      exact_matching_anagram: matches,
      CHANGE_native_GP_runes: change,
      original_final1033_square_charpoly_mod29: finalCharacteristic,
      word_CHANGE_product_polynomial_equals_charpoly: true,
      counterfactual_preserves_1033_magic_and_centrosymmetry: true,
      counterfactual_4_cell_unit_perturbation_charpoly: counterfactualPolynomial,
      counterfactual_BREAKS_CHANGE_factorization: true,
      source_alphabet_order_from_spectrum: 'UNDETERMINED'
    },
    original_integer_modulus_uniqueness: {
      gcd_first_power28_minus_twice_mean_plus_reversal: String(firstGcd),
      gcd_last_power14_plus_reversal: String(lastGcd)
    },
    exact_gp29_operations: {
      first3301_order: 56,
      first3301_power28: '12*ALL_ONES minus REVERSE',
      third1033_order: 28,
      third1033_power14: 'negative REVERSE',
      inverse_first3301: number29(firstInverse),
      inverse_third1033: number29(lastInverse)
    },
    original_B_6395_1279_vector_inverses: {
      first3301_p50_source_bytes_as_block_exponents: score(byteClockFirst),
      third1033_p50_source_bytes_as_block_exponents: score(byteClockLast),
      first3301_one_round: score(alternate),
      last1033_one_round: score(direct),
      actual_native_english_6395_plant: score(planted)
    },
    source_ciphertext_exact_forward_replay: true,
    known_GP29_prose_plant_exact_roundtrip: true,
    unknown_plaintext_recovered: false
  }, null, 2));
}
main();

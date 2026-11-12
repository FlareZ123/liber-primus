'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const book = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8')).bytes;
const p55 = book.pages[55].indices;
const p56cipher = book.pages[56].indices;
const p57plain = book.pages[57].indices;
const MOD = 29;
const UNKNOWN = 76;
const KNOWN = 180;

/** @param {number} value @returns {number} */
const mod = value => (value % MOD + MOD) % MOD;

/**
 * Longest-token-first GP29 plaintext parse. Unmodified independent solved p56.
 * @param {string} text
 * @returns {number[]}
 */
function toGp(text) {
  const letters = book.translit.map((s, index) => ({ s, index }))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (let word of text.split(' ')) {
    while (word) {
      const part = letters.find(x => word.startsWith(x.s));
      assert.ok(part, 'Unrecognized GP segment in ' + word);
      out.push(part.index);
      word = word.slice(part.s.length);
    }
  }
  return out;
}

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const result = [];
  for (let i = 2; result.length < n; i++) {
    let prime = true;
    for (let j = 2; j * j <= i; j++) if (i % j === 0) { prime = false; break; }
    if (prime) result.push(i);
  }
  return result;
}

const originalP56Plain = toGp(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
);
assert.deepEqual([p55.length, p56cipher.length, p57plain.length], [76, 85, 95]);
assert.equal(originalP56Plain.length, 85);
const primes = firstPrimes(85);
let primeClock = 0;
const decryptedP56 = p56cipher.map((value, i) => {
  if (i === 56) {
    assert.equal(value, 0, 'Authentic p56 F clock interrupt');
    return 0;
  }
  return mod(value - (primes[primeClock++] - 1));
});
assert.deepEqual(decryptedP56, originalP56Plain);
assert.equal(primeClock, 84);

assert.equal(table.length, 256);
// Fixed original grid outer circumference, starting upper-left, clockwise.
const ring = [];
for (let c = 0; c < 8; c++) ring.push(table[c] % MOD);
for (let r = 1; r < 32; r++) ring.push(table[8 * r + 7] % MOD);
for (let c = 6; c >= 0; c--) ring.push(table[31 * 8 + c] % MOD);
for (let r = 30; r >= 1; r--) ring.push(table[8 * r] % MOD);
assert.equal(ring.length, UNKNOWN);
// One monic degree-76 polynomial with the 76 perimeter byte residues.
const generatorHigh = [1, ...ring];
const generatorLow = [...generatorHigh].reverse();
assert.equal(generatorLow[0], 5);

/** @returns {number[][]} */
function powersOfX() {
  const powers = Array.from({ length: 256 }, () => Array(UNKNOWN).fill(0));
  powers[0][0] = 1;
  for (let n = 1; n < 256; n++) {
    const overflow = powers[n - 1][UNKNOWN - 1];
    const target = powers[n];
    for (let j = 1; j < UNKNOWN; j++) target[j] = powers[n - 1][j - 1];
    for (let j = 0; j < UNKNOWN; j++) {
      target[j] = mod(target[j] - overflow * generatorLow[j]);
    }
  }
  return powers;
}
const powers = powersOfX();

/**
 * Solve the 76 first coefficients of a monic degree-255 GF29 polynomial,
 * given its last180 coefficients and exact divisibility by generator.
 * All row/column choices are fixed before inspecting p55 ciphertext.
 * @param {number[]} suffix
 * @returns {number[]}
 */
function completeCodeword(suffix) {
  assert.equal(suffix.length, KNOWN);
  const matrix = Array.from({ length: UNKNOWN }, () => Array(UNKNOWN + 1).fill(0));
  for (let c = 0; c < UNKNOWN; c++) {
    for (let r = 0; r < UNKNOWN; r++) matrix[r][c] = powers[255 - c][r];
  }
  for (let c = 0; c < KNOWN; c++) {
    const v = suffix[c];
    for (let r = 0; r < UNKNOWN; r++) {
      matrix[r][UNKNOWN] = mod(matrix[r][UNKNOWN] - v * powers[179 - c][r]);
    }
  }
  for (let col = 0; col < UNKNOWN; col++) {
    let pivot = col;
    while (pivot < UNKNOWN && matrix[pivot][col] === 0) pivot++;
    assert.notEqual(pivot, UNKNOWN, 'Singular source-selected codeword completion');
    [matrix[col], matrix[pivot]] = [matrix[pivot], matrix[col]];
    const inverse = Array.from({ length: MOD }, (_, i) => i)
      .find(v => v * matrix[col][col] % MOD === 1);
    assert.ok(inverse);
    for (let j = col; j <= UNKNOWN; j++) matrix[col][j] = mod(matrix[col][j] * inverse);
    for (let row = 0; row < UNKNOWN; row++) {
      if (row === col) continue;
      const factor = matrix[row][col];
      if (!factor) continue;
      for (let j = col; j <= UNKNOWN; j++) {
        matrix[row][j] = mod(matrix[row][j] - factor * matrix[col][j]);
      }
    }
  }
  const prefix = matrix.map(row => row[UNKNOWN]);
  const check = Array(UNKNOWN).fill(0);
  for (let i = 0; i < 256; i++) {
    const c = i < UNKNOWN ? prefix[i] : suffix[i - UNKNOWN];
    for (let j = 0; j < UNKNOWN; j++) {
      check[j] = mod(check[j] + c * powers[255 - i][j]);
    }
  }
  assert.ok(check.every(v => v === 0), 'Completed polynomial must be divisible');
  return prefix;
}

/**
 * Create an authentic native-GP prefix plant in the exact codeword family.
 * @param {number[]} expected
 * @returns {number[]}
 */
function makeNativePrefixPlant(expected) {
  assert.equal(expected.length, UNKNOWN);
  const quotient = Array(KNOWN).fill(0);
  for (let i = 0; i < UNKNOWN; i++) {
    let contribution = 0;
    for (let j = 1; j <= i; j++) contribution += generatorHigh[j] * quotient[i - j];
    quotient[i] = mod(expected[i] - contribution);
  }
  const codeword = Array(256).fill(0);
  for (let i = 0; i < KNOWN; i++) {
    for (let j = 0; j < generatorHigh.length; j++) {
      codeword[i + j] = mod(codeword[i + j] + quotient[i] * generatorHigh[j]);
    }
  }
  assert.deepEqual(codeword.slice(0, UNKNOWN), expected);
  return codeword.slice(UNKNOWN);
}
/** @param {number[]} symbols */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const x of symbols) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (symbols.length * (symbols.length - 1));
}

const native = p57plain.slice(0, UNKNOWN);
const plantSuffix = makeNativePrefixPlant(native);
assert.deepEqual(completeCodeword(plantSuffix), native);

const solvedSuffix = [...originalP56Plain, ...p57plain];
const candidate = completeCodeword(solvedSuffix);
assert.equal(candidate.length, p55.length);
console.log(JSON.stringify({
  source: 'original 32x8 GP29-reduced perimeter, terminal p55-p57 source pages',
  sourcePhysicalCount: [p55.length, originalP56Plain.length, p57plain.length],
  monicGeneratorDegree: UNKNOWN,
  generatorConstant: generatorLow[0],
  reconstructedRuneCount: candidate.length,
  publishedP55CipherIoC: ioc(p55),
  predictedP55PlainIoC: ioc(candidate),
  nativeSolvedP57ControlIoC: ioc(native),
  completedNativePlantRunes: native.length,
  predictedGp: candidate.map(i => book.translit[i]).join('')
}, null, 2));

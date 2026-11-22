'use strict';

/**
 * Conditional cross-page modular fingerprint and exact one-token erasure inversion.
 * Reads only original-derived LP2 source objects; never changes any input.
 * Run with Node.js 22 from any working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {any} */
const load = (filename) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', filename), 'utf8'));
const corpus = load('lp2-corpus.json');
const annotations = load('lp2-ink-annotations.json');
const grid = load('base60-grid.json');
const M = 1031n;

/** @param {bigint} n @param {bigint} exponent @param {bigint} modulus @returns {bigint} */
function powMod(n, exponent, modulus) {
  let result = 1n;
  let base = n % modulus;
  for (let exp = exponent; exp > 0n; exp /= 2n) {
    if (exp % 2n === 1n) result = result * base % modulus;
    base = base * base % modulus;
  }
  return result;
}

/** @param {number[]} values @param {bigint} modulus @returns {bigint} */
function byteIntegerRemainder(values, modulus) {
  return values.reduce((a, value) => (a * 256n + BigInt(value)) % modulus, 0n);
}

assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8 && row.every((token) => /^[0-4][0-9A-Za-x]{1}$/.test(token))));
const flat = grid.rows.flat();
const original = grid.byte_rows.flat();
assert.equal(original.length, 256);
assert.equal(flat.join('').length, 512);
assert.deepEqual(flat.map((token) => grid.alphabet.indexOf(token[0]) * 60 + grid.alphabet.indexOf(token[1])), original);
assert.equal(
  createHash('sha256').update(Buffer.from(original)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
);

// The middle original solved p57 imperative is present verbatim as 30 GP29 runes.
const clause = 'WE MUST SHED OUR OWN CIRCUMFERENCES'.replaceAll(' ', '');
const runeNames = [...corpus.translit].sort((a, b) => b.length - a.length);
/** @type {number[]} */
const clauseIndexes = [];
for (let i = 0; i < clause.length;) {
  const token = runeNames.find((name) => clause.startsWith(name, i));
  assert.ok(token, 'GP token missing at original-source clause character ' + i);
  clauseIndexes.push(corpus.translit.indexOf(token));
  i += token.length;
}
const p57 = corpus.pages.find((p) => p.page === 57);
assert.ok(p57);
assert.equal(p57.indices.length, 95);
assert.deepEqual(p57.indices.slice(37, 37 + clauseIndexes.length), clauseIndexes);
const clausePrimeSum = clauseIndexes.reduce((sum, idx) => sum + corpus.prime[idx], 0);
assert.equal(clausePrimeSum, 1031);

/** @param {number} page @returns {number} */
function redPrimeSum(page) {
  const entry = annotations.pages.find((p) => p.page === page);
  assert.ok(entry);
  const source = entry.red_spans.find((span) => span.start === 0);
  assert.ok(source);
  return [...source.runes].reduce((sum, rune) => {
    const idx = corpus.runes.indexOf(rune);
    assert.notEqual(idx, -1);
    return sum + corpus.prime[idx];
  }, 0);
}
const red27 = redPrimeSum(27);
const red54 = redPrimeSum(54);
assert.equal(red27, 1109);
assert.equal(red54, 597);
assert.equal(red27 - red54, 512);
const target = BigInt(red27 - red54);
assert.equal(target, 512n);
assert.equal(M, BigInt(clausePrimeSum));
assert.equal(byteIntegerRemainder(original, M), target);

// Both disputed radix alphabets and six natural geometric readings, unfitted.
const rowsReversed = [...grid.rows].reverse();
const col = Array.from({ length: 8 }, (_, x) => grid.rows.map((row) => row[x])).flat();
const readings = [
  ['row-major', flat],
  ['reverse', [...flat].reverse()],
  ['column-major', col],
  ['reverse-columns', [...col].reverse()],
  ['reverse-row-cells', grid.rows.flatMap((row) => [...row].reverse())],
  ['reverse-rows', rowsReversed.flat()],
];
/** @type {{order:string, radix:number, residue:number}[]} */
const alternatives = [];
for (const [order, words] of readings) {
  for (const [radix, digits] of [[60, grid.alphabet], [59, grid.alphabet.replace('f', '')]]) {
    const bytes = words.map((token) => radix * digits.indexOf(token[0]) + digits.indexOf(token[1]));
    assert.ok(bytes.every((value) => value >= 0 && value < 256));
    alternatives.push({ order, radix, residue: Number(byteIntegerRemainder(bytes, M)) });
  }
}
assert.equal(alternatives.filter((entry) => entry.residue === 512).length, 1);
assert.deepEqual(alternatives.find((entry) => entry.residue === 512), {
  order: 'row-major', radix: 60, residue: 512,
});

// Independently omit each source byte from the congruence and infer it using
// the other 255 intact cells plus only the cross-page 1031/512 targets.
/** @type {bigint[]} */
const weights = Array(256);
weights[255] = 1n;
for (let i = 254; i >= 0; i--) weights[i] = weights[i + 1] * 256n % M;
let recovered = 0;
for (let missing = 0; missing < original.length; missing++) {
  let knownSum = 0n;
  for (let j = 0; j < original.length; j++) {
    if (j !== missing) knownSum = (knownSum + BigInt(original[j]) * weights[j]) % M;
  }
  const inverse = powMod(weights[missing], M - 2n, M);
  assert.equal(weights[missing] * inverse % M, 1n);
  const restored = (target - knownSum + M) * inverse % M;
  assert.ok(restored >= 0n && restored < 256n, 'Erasure at ' + missing + ' has no byte-valued completion');
  assert.equal(Number(restored), original[missing], 'Wrong inferred original source byte at ' + missing);
  recovered++;
}

// Since each coefficient is invertible mod1031, any single replacement
// of one 8-bit value must change the checksum. Verify all possible deltas.
for (const weight of weights) {
  for (let delta = -255; delta <= 255; delta++) {
    if (delta === 0) continue;
    assert.notEqual(BigInt(delta) * weight % M, 0n);
  }
}

// Separately reconstruct the final SIX bytes from the first 250 known bytes,
// the previously published factor F, new 1031/512 relation, and original-source
// H2013 and G39 GF29 quadratic constraints. The factors were selected post hoc.
const F = 36528277968n;
const head250 = original.slice(0, 250).reduce((a, byte) => a * 256n + BigInt(byte), 0n);
const padWidth = 256n ** 6n;
const modulo = (x, modulus) => ((x % modulus) + modulus) % modulus;
const requiredF = modulo(-head250 * padWidth, F);
const requiredM = modulo(target - head250 * padWidth, M);
const inverseFmodM = powMod(F % M, M - 2n, M);
assert.equal((F * inverseFmodM) % M, 1n);
const firstSuffix = requiredF + F * modulo((requiredM - requiredF) * inverseFmodM, M);
const lcm = F * M;
/** @param {bigint} x @returns {number[]} */
const sixBytes = (x) => Array.from({ length: 6 }, (_, i) => Number((x >> BigInt((5 - i) * 8)) & 255n));
/** @param {number[]} values @param {number[]} divisor @returns {number[]} */
function polyRemainderGF29(values, divisor) {
  const coefficients = values.map((n) => n % 29).reverse();
  const scale = Number(powMod(BigInt(divisor[divisor.length - 1]), 27n, 29n));
  for (let i = coefficients.length - divisor.length; i >= 0; i--) {
    const q = (coefficients[i + divisor.length - 1] * scale) % 29;
    for (let j = 0; j < divisor.length; j++) {
      coefficients[i + j] = ((coefficients[i + j] - q * divisor[j]) % 29 + 29) % 29;
    }
  }
  return coefficients.slice(0, divisor.length - 1);
}
const h2013 = [3, 26, 24];
const g39 = [27, 5, 15];
assert.deepEqual(polyRemainderGF29(original, h2013), [0, 0]);
assert.deepEqual(polyRemainderGF29(original, g39), [0, 0]);
/** @type {{suffix: string, h: number[], g: number[]}[]} */
const lastSixCandidates = [];
for (let x = firstSuffix; x < padWidth; x += lcm) {
  const possible = original.slice(0, 250).concat(sixBytes(x));
  const h = polyRemainderGF29(possible, h2013);
  const g = polyRemainderGF29(possible, g39);
  lastSixCandidates.push({ suffix: x.toString(16).padStart(12, '0'), h, g });
}
assert.equal(lastSixCandidates.length, 8);
const fullConstraints = lastSixCandidates.filter((candidate) => candidate.h.every((v) => v === 0) && candidate.g.every((v) => v === 0));
assert.deepEqual(fullConstraints.map((candidate) => candidate.suffix), ['ace6b424bd50']);
assert.deepEqual(original.slice(250), [172, 230, 180, 36, 189, 80]);

console.log(JSON.stringify({
  originalBytes: original.length,
  printedCharacters: flat.join('').length,
  originalByteSha256: createHash('sha256').update(Buffer.from(original)).digest('hex'),
  p57: { clauseOffset: 37, runes: clauseIndexes.length, primeSum: clausePrimeSum },
  p27RedPrimeSum: red27,
  p54RedPrimeSum: red54,
  expectedRemainder: Number(target),
  canonicalRemainder: Number(byteIntegerRemainder(original, M)),
  readings: alternatives,
  recoveredIndependentErasures: recovered,
  sixByteSuffix: { candidateCountAfterIntegerCongruences: lastSixCandidates.length, uniqueAfterOriginalTwoGF29Quadratics: fullConstraints[0].suffix, candidates: lastSixCandidates },
  singleByteErrorsProvablyDetected: true,
  claim: 'Conditional arithmetic codeword; NO authenticated Cicada checksum or unknown plaintext',
}, null, 2));

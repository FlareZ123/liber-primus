'use strict';

/**
 * Original LP2 p23-p26 five-strand / literal 2013 SSSS format gate.
 *
 * Run from repository root: node sims/lp2_p23_26_ssss_format_capacity_sft.cjs
 * Inputs: original page-aligned GP29 indices from resources/liber-primus/lp2-corpus.json.
 * Historical implementation: B. Poettering ssss 0.5, especially field_size_valid,
 * field_init, field_print, combine, and encode_mpz.
 * See im-results/lp2-p23-26-ssss-original-format-gate.md for exact scope.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const sourcePages = [23, 24, 25, 26];
const lengths = sourcePages.map(p => corpus.pages[p].indices.length);
assert.deepEqual(lengths, [213, 270, 273, 265]);
const body = [
  ...corpus.pages[23].indices.slice(16),
  ...corpus.pages[24].indices,
  ...corpus.pages[25].indices,
  ...corpus.pages[26].indices,
];
assert.equal(body.length, 1005);
assert.ok(body.every(d => Number.isInteger(d) && d >= 0 && d < 29));

const strands = Array.from({ length: 5 }, (_, col) =>
  body.filter((_, position) => position % 5 === col));
assert.deepEqual(strands.map(s => s.length), [201, 201, 201, 201, 201]);

/** @param {number[]} digits @returns {bigint} */
function packBase29(digits) {
  return digits.reduce((value, digit) => value * 29n + BigInt(digit), 0n);
}

/** @param {bigint} n @param {number} len @returns {number[]} */
function unpackBase29(n, len) {
  const out = Array(len).fill(0);
  for (let i = len - 1; i >= 0; i--) {
    out[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return out;
}
const values = strands.map(packBase29);
for (let i = 0; i < strands.length; i++) {
  assert.deepEqual(unpackBase29(values[i], 201), strands[i]);
}

const maxima = 29n ** 201n - 1n;
const exactBitsToRepresentEveryStrand = maxima.toString(2).length;
const minPackedBytes = Math.ceil(exactBitsToRepresentEveryStrand / 8);
assert.equal(exactBitsToRepresentEveryStrand, 977);
assert.equal(minPackedBytes, 123);
assert.ok(maxima >= (1n << 176n));
assert.ok(maxima < (1n << 984n));
assert.ok(201 > 128); // cannot pass 201 literal bytes as one ssss 0.5 share

const historicShares = [
  '02-41cc481a51fe77f91600f593c1db2ce9babd2626ea6e',
  '03-7678a5f6b72042d839151b34b02ffe161cf997fed484',
  '05-fcd82965b6632ea25d80edc3e58baafb4b2938895cbd',
  '07-f3adb3aacb0b4336fa28178bc1e5edce940c16ce5caa',
  '08-b970e507dbc4ac115a273126f62671654c480fce32e5',
];
for (const share of historicShares) {
  assert.match(share, /^(?:0[1-9]|10)-[0-9a-f]{44}$/);
}
const historicalFieldBits = historicShares[0].split('-')[1].length * 4;
assert.equal(historicalFieldBits, 176);
const historicalBytes = historicalFieldBits / 8;
assert.equal(historicalBytes, 22);

const numerator = 29n ** 201n;
const denominator = 1n << 984n;
const perShareCoverage = Number(numerator * 100000000000000000n / denominator) / 1e17;
const fullFiveCoverage = perShareCoverage ** 5;
const result = {
  sourcePages,
  sourcePageRuneLengths: lengths,
  redHeadingRunesRemoved: 16,
  bodyRunes: body.length,
  visibleDots: 5,
  printedQuintetColumnLengths: strands.map(s => s.length),
  historicalSSSS05: {
    sampleShareIdentifiersDecimal: [2, 3, 5, 7, 8],
    sampleHexDigitsEach: 44,
    shareBytes: historicalBytes,
    fieldBits: historicalFieldBits,
    fieldPolynomial: 'x^176+x^11+x^3+x^2+1',
    original2013Control: 'sims/2013_pklmx_reproduce.py',
  },
  reversibleBase29Capacity: {
    strandSymbols: 201,
    alphabetSize: 29,
    informationBits: 201 * Math.log2(29),
    bitsForEveryPossibleStrand: exactBitsToRepresentEveryStrand,
    minimumWholeBytes: minPackedBytes,
    supportedSsssFieldBits: minPackedBytes * 8,
    fieldPolynomialFor984: 'x^984+x^24+x^9+x^3+1',
    fractionOf984BitFieldCoveredPerFixedWidthStrand: perShareCoverage,
    jointFiveFractionUnderIndependentUniform984BitShares: fullFiveCoverage,
    samplePackedHexPrefixes: values.map(x => x.toString(16).padStart(246, '0').slice(0, 16)),
  },
  interpretation:
    'The 2013 literal 176-bit share cannot reversibly contain any unrestricted 201-rune strand. ' +
    'SSSS 0.5 can use a larger field, but no original source specifies base29 packing, 984-bit shares, ' +
    'five decimal share identifiers, or byte output semantics. At threshold five, interpolation ' +
    'of any five distinct share values is automatic and cannot authenticate a candidate by itself.',
};
console.log(JSON.stringify(result, null, 2));

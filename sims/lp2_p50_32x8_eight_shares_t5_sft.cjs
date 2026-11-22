'use strict';
/**
 * Original LP2 p50 32x8 printed byte grid as eight Shamir shares of
 * a 32-byte secret (threshold 5), a source-motivated 2013-Cicada precedent.
 * Each printed row = one byte across eight shares; any five shares
 * determine remaining three by a degree<=4 field polynomial.
 *
 * Frozen source-plausible fields: standard AES GF(2^8)/0x11B, Reed-Solomon
 * GF(2^8)/0x11D, and the separately source-derived prime field GF(257).
 * The share x-coordinates are the original left-to-right column numbers
 * 1,...,8. No phase, subset or orientation is fitted to the original data.
 * Windows Node.js 22: node sims/lp2_p50_32x8_eight_shares_t5_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources/liber-primus/base60-grid.json'), 'utf8'));
assert.equal(source.rows.length, 32);
assert.equal(source.byte_rows.length, 32);
assert.equal(source.alphabet.length, 60);

/** @type {number[][]} */
const data = source.rows.map((row, i) => {
  assert.equal(row.length, 8);
  const bytes = row.map((token, j) => {
    assert.equal(token.length, 2);
    const left = source.alphabet.indexOf(token[0]);
    const right = source.alphabet.indexOf(token[1]);
    assert.ok(left >= 0 && right >= 0);
    const value = 60 * left + right;
    assert.ok(value >= 0 && value <= 255);
    assert.equal(value, source.byte_rows[i][j]);
    return value;
  });
  return bytes;
});
assert.equal(data.flat().length, 256);

/** @param {number} poly The irreducible byte polynomial, 0x11B or 0x11D. */
function byteField(poly) {
  /**
   * @param {number} a
   * @param {number} b
   */
  function mul(a, b) {
    let acc = 0;
    for (let n = 0; n < 8; n++) {
      if ((b & 1) !== 0) acc ^= a;
      b >>>= 1;
      const high = a & 128;
      a = (a << 1) & 255;
      if (high) a ^= (poly & 255);
    }
    return acc;
  }
  /**
   * @param {number} base
   * @param {number} exp
   */
  function pow(base, exp) {
    let output = 1;
    for (; exp > 0; exp >>>= 1, base = mul(base, base)) {
      if (exp & 1) output = mul(output, base);
    }
    return output;
  }
  return {
    name: 'GF(256)/0x' + poly.toString(16),
    modulus: 256,
    add: (a, b) => a ^ b,
    sub: (a, b) => a ^ b,
    mul,
    inv: (a) => {
      assert.ok(a > 0 && a < 256);
      return pow(a, 254);
    }
  };
}

function primeField() {
  return {
    name: 'GF(257)',
    modulus: 257,
    add: (a, b) => (a + b) % 257,
    sub: (a, b) => (a - b + 257) % 257,
    mul: (a, b) => a * b % 257,
    inv: (a) => {
      assert.ok(a > 0 && a < 257);
      let output = 1;
      let base = a;
      for (let exp = 255; exp > 0; exp >>>= 1, base = base * base % 257) {
        if (exp & 1) output = output * base % 257;
      }
      return output;
    }
  };
}

/**
 * @typedef {ReturnType<typeof byteField>} Field
 * @param {Field} f
 * @param {number[]} firstFive
 * @param {number} x
 * @returns {number}
 */
function interpolate(f, firstFive, x) {
  assert.equal(firstFive.length, 5);
  let total = 0;
  for (let j = 0; j < 5; j++) {
    let basis = 1;
    for (let k = 0; k < 5; k++) {
      if (k === j) continue;
      const numerator = f.sub(x, k + 1);
      const denominator = f.sub(j + 1, k + 1);
      basis = f.mul(basis, f.mul(numerator, f.inv(denominator)));
    }
    total = f.add(total, f.mul(firstFive[j], basis));
  }
  return total;
}

/**
 * @param {Field} f
 * @param {number[]} coeffs
 * @param {number} x
 */
function polynomial(f, coeffs, x) {
  return coeffs.reduceRight((y, c) => f.add(f.mul(y, x), c), 0);
}

const fields = [byteField(0x11b), byteField(0x11d), primeField()];
const expectedMatches = [2, 0, 0];
const expectedMismatchCases = [
  [13, 5], [20, 6]
];
for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
  const f = fields[fieldIndex];
  /** @type {Array<{row:number,column:number,predicted:number,actual:number}>} */
  const matches = [];
  /** @type {Array<{row:number,column:number,predicted:number,actual:number}>} */
  const mismatches = [];
  for (let i = 0; i < data.length; i++) {
    const firstFive = data[i].slice(0, 5);
    for (let col = 5; col < 8; col++) {
      const predicted = interpolate(f, firstFive, col + 1);
      const actual = data[i][col];
      const record = {row: i, column: col, predicted, actual};
      if (predicted === actual) matches.push(record);
      else mismatches.push(record);
    }
  }
  assert.equal(matches.length + mismatches.length, 96);
  assert.equal(matches.length, expectedMatches[fieldIndex]);
  if (fieldIndex === 0) {
    assert.deepEqual(matches.map((v) => [v.row, v.column]),
      expectedMismatchCases);
  }

  // Positive plant: freeze 32 independently generated degree4 polynomials
  // with all original source-shaped 32x8 dimensions. Hold out columns6–8,
  // recover them from 1–5 exactly, and reconstruct every secret at x=0.
  const secrets = [];
  for (let i = 0; i < 32; i++) {
    const coeff = Array.from({length: 5},
      (_, j) => (1 + i * 17 + j * 53) % f.modulus);
    const plantedRow = Array.from({length: 8},
      (_, j) => polynomial(f, coeff, j + 1));
    secrets.push(coeff[0]);
    assert.equal(interpolate(f, plantedRow.slice(0, 5), 0), coeff[0]);
    for (let j = 5; j < 8; j++) {
      assert.equal(interpolate(f, plantedRow.slice(0, 5), j + 1),
        plantedRow[j], 'Native-byte t5 planted held-out share mismatch');
    }
  }
  assert.equal(secrets.length, 32);
  console.log(JSON.stringify({
    field: f.name,
    authenticSourceBytes: 256,
    allegedEightSharesOf32Bytes: true,
    historicalThreshold: 5,
    authenticPredictions: 96,
    observedMatches: matches.length,
    observedMismatches: mismatches.length,
    accidentalMatches: matches,
    plantedHeldoutMatches: 96,
    plantedSecretMatches: 32
  }));
}
console.log('PASS: original 32×8 base60-to-byte mapping, original three-field ' +
  '5-of-8 share negative, and 96/96 + 32/32 planted key/share positives.');

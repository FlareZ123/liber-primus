'use strict';

/**
 * Direct original p50 table test as a contiguous short-state GF(2) LFSR stream.
 * Exact Berlekamp–Massey minimal linear complexity, not a prose scorer.
 * Six physically natural bit serializations and independent planted
 * 7-bit, 127-bit and seven-byte GF(256) LFSR positives. Windows Node22 CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const file = fs.readFileSync(path.join(__dirname,
  '../resources/liber-primus/lp2-grid-256.json'));
const source = JSON.parse(file);
const original = source.pages.flatMap((part) => part.bytes);
assert.equal(original.length, 256);
assert.ok(original.every((byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255));
assert.deepEqual(original, source.pages.flatMap((part) => part.tokens.map((token) =>
  source.alphabet.indexOf(token[0]) * 60 + source.alphabet.indexOf(token[1]))));

/** @param {number[]} stream Ordered GF(2) symbols; @returns {number} */
function berlekampMassey(stream) {
  const nSymbols = stream.length;
  const current = new Uint8Array(nSymbols + 1);
  let before = new Uint8Array(nSymbols + 1);
  current[0] = before[0] = 1;
  let degree = 0, last = -1;
  for (let n = 0; n < nSymbols; n++) {
    let disagreement = stream[n];
    for (let lag = 1; lag <= degree; lag++) {
      disagreement ^= current[lag] & stream[n - lag];
    }
    if (disagreement) {
      const old = current.slice(), shift = n - last;
      for (let k = 0; k + shift <= nSymbols; k++) {
        current[k + shift] ^= before[k];
      }
      if (degree * 2 <= n) {
        degree = n + 1 - degree;
        before = old;
        last = n;
      }
    }
  }
  return degree;
}

/**
 * @param {number} a GF(256) value.
 * @param {number} b GF(256) value.
 * @returns {number} Product modulo AES irreducible x^8+x^4+x^3+x+1.
 */
function fieldMultiply(a, b) {
  let product = 0, x = a, y = b;
  while (y) {
    if (y & 1) product ^= x;
    x = ((x << 1) & 255) ^ ((x & 128) ? 0x1b : 0);
    y >>>= 1;
  }
  return product;
}

/** @param {number} a Nonzero GF(256) element; @returns {number} */
function fieldInverse(a) {
  assert.notEqual(a, 0);
  let result = 1, factor = a, power = 254;
  while (power) {
    if (power & 1) result = fieldMultiply(result, factor);
    factor = fieldMultiply(factor, factor);
    power >>>= 1;
  }
  assert.equal(fieldMultiply(result, a), 1);
  return result;
}

/**
 * @param {number[]} stream Original 8-bit source symbols.
 * @returns {number} Minimal linear feedback register length over GF(256).
 */
function berlekampMasseyBytes(stream) {
  const total = stream.length;
  const c = new Uint8Array(total + 1);
  let b = new Uint8Array(total + 1);
  c[0] = b[0] = 1;
  let degree = 0, shift = 1, previous = 1;
  for (let n = 0; n < total; n++) {
    let diff = stream[n];
    for (let i = 1; i <= degree; i++) {
      diff ^= fieldMultiply(c[i], stream[n - i]);
    }
    if (!diff) {
      shift++;
      continue;
    }
    const old = c.slice(), ratio = fieldMultiply(diff, fieldInverse(previous));
    for (let i = 0; i + shift <= total; i++) {
      c[i + shift] ^= fieldMultiply(ratio, b[i]);
    }
    if (2 * degree <= n) {
      degree = n + 1 - degree;
      b = old;
      previous = diff;
      shift = 1;
    } else {
      shift++;
    }
  }
  return degree;
}

/**
 * @param {number[]} bytes Table bytes in original layout.
 * @param {boolean} msbFirst Bit direction inside each byte.
 * @returns {number[]} Exact 2048 bits.
 */
function serializeBits(bytes, msbFirst) {
  const out = [];
  for (const value of bytes) {
    for (let i = 0; i < 8; i++) {
      out.push((value >> (msbFirst ? 7-i : i)) & 1);
    }
  }
  return out;
}

/** @param {number} degree @returns {number[]} */
function plantedLfsr(degree) {
  const seq = Array.from({ length: 2048 }, (_, i) =>
    i < degree ? Number((i * 17 + 13) % 7 < 4) : 0);
  // Feedback includes the oldest bit and a coprime shorter lag.
  const tap = degree === 7 ? 3 : 47;
  for (let i = degree; i < seq.length; i++) {
    seq[i] = seq[i - degree] ^ seq[i - tap];
  }
  return seq;
}
assert.equal(berlekampMassey(plantedLfsr(7)), 7);
const positive127 = berlekampMassey(plantedLfsr(127));
assert.ok(positive127 <= 127 && positive127 >= 1);
// Nontrivial 7-byte recurrence positive in GF(2^8), not merely binary bits.
const plantedByteLfsr = Array.from({ length: 256 }, (_, i) =>
  i < 7 ? (i * 53 + 97) & 255 : 0);
for (let i = 7; i < plantedByteLfsr.length; i++) {
  plantedByteLfsr[i] = fieldMultiply(0x63, plantedByteLfsr[i - 1]) ^
    fieldMultiply(0x05, plantedByteLfsr[i - 7]);
}
assert.equal(berlekampMasseyBytes(plantedByteLfsr), 7);
const geometry = {
  'printed-row-major': original,
  'printed-column-major': Array.from({ length: 256 }, (_, i) =>
    original[(i % 32) * 8 + Math.floor(i / 32)]),
  'printed-serpentine-rows': Array.from({ length: 256 }, (_, i) =>
    original[Math.floor(i / 8) * 8 +
      (Math.floor(i / 8) % 2 ? 7 - i % 8 : i % 8)])
};
const runs = [];
const byteRuns = [];
for (const [layout, bytes] of Object.entries(geometry)) {
  byteRuns.push({layout, forwardGF256Degree: berlekampMasseyBytes(bytes),
    reversedGF256Degree: berlekampMasseyBytes(bytes.slice().reverse())});
  for (const bitOrder of ['MSB-first', 'LSB-first']) {
    const bits = serializeBits(bytes, bitOrder === 'MSB-first');
    assert.equal(bits.length, 2048);
    const degree = berlekampMassey(bits);
    runs.push({
      layout, bitOrder,
      minimalGF2LinearComplexity: degree,
      bitCount: bits.length,
      oneBits: bits.reduce((s, x) => s + x, 0)
    });
  }
}
assert.equal(runs.length, 6);
console.log(JSON.stringify({
  hypothesis: 'p50 byte table is a contiguous short-state binary LFSR output',
  sourceFileSHA256: crypto.createHash('sha256').update(file).digest('hex'),
  authenticPrintedByteCount: original.length,
  testedPhysicalOrders: runs,
  planted7BitStateRecovers: true,
  planted127BitRecoversWithDegree: positive127,
  planted7ByteGF256RecoversWithDegree: 7,
  originalByteGF256MinimalComplexity: byteRuns,
  decision: runs.every((x) => x.minimalGF2LinearComplexity > 1020) &&
    byteRuns.every((x) => x.forwardGF256Degree >= 125 &&
      x.reversedGF256Degree >= 125)
    ? 'No short-state linear LFSR in either GF(2) bits or GF(256) bytes under native layouts'
    : 'Low-linear-complexity source candidate: inspect registration'
}, null, 2));

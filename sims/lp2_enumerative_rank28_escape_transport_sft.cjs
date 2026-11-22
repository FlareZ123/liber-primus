'use strict';

/**
 * Original-input reversible GP29->rank28 byte transport with fully explicit
 * repeated-rune side information. Claimed Director Issue #875.
 *
 * One fixed codec, frozen before inspecting original output:
 * - source-visible visual-chapter reset; first rune is an 8-bit IV
 * - 16-bit original rune length, 16-bit repeat count (both big-endian)
 * - colex combinadic rank of all adjacent-equality sites
 * - ordinary successive symbols rank in ascending GP29 order excluding prev
 * - all nonrepeat ranks form a big-endian base28 integer
 * - exact fixed bit widths ceil(log2 binom(m,k)), ceil(log2 28^(m-k))
 * - order: exception-mask bits, then base28-data bits; MSB-first bytes
 * - only trailing zero-pad bits after these two integer fields
 *
 * The 5-byte n/k/IV prefix is a codec header, not an LP2 plaintext or a
 * candidate historical payload header. The payload begins immediately
 * after that prefix. No secret mapping, key, clock search or frame scanning.
 *
 * Node.js 22: node sims/lp2_enumerative_rank28_escape_transport_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const original = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
assert.equal(original.translit.length, 29);

/** @param {number} n @param {number} k @returns {bigint} */
function binomial(n, k) {
  assert.ok(Number.isSafeInteger(n) && Number.isSafeInteger(k));
  assert.ok(n >= 0 && k >= 0);
  if (k > n) return 0n; // The combinatorial number system uses C(s,i)=0 for s<i.
  const r = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= r; i++) {
    value = value * BigInt(n - r + i) / BigInt(i);
  }
  return value;
}

/** @param {bigint} capacity @returns {number} */
function bitWidth(capacity) {
  assert.ok(capacity >= 1n);
  return (capacity - 1n).toString(2).length === 1 && capacity === 1n
    ? 0
    : (capacity - 1n).toString(2).length;
}

/** @param {number[]} positions @returns {bigint} */
function colexRank(positions) {
  let rank = 0n;
  for (let i = 0; i < positions.length; i++) {
    assert.ok(positions[i] >= i);
    if (i) assert.ok(positions[i] > positions[i - 1]);
    rank += binomial(positions[i], i + 1);
  }
  return rank;
}

/**
 * Inverse combinatorial number system, with k fixed and m sites.
 * @param {bigint} rank
 * @param {number} m
 * @param {number} k
 * @returns {number[]}
 */
function unrankColex(rank, m, k) {
  assert.ok(rank >= 0n && rank < binomial(m, k));
  const positions = Array(k);
  let upper = m - 1;
  for (let i = k; i >= 1; i--) {
    let low = i - 1, high = upper;
    while (low < high) {
      const mid = Math.floor((low + high + 1) / 2);
      if (binomial(mid, i) <= rank) low = mid;
      else high = mid - 1;
    }
    positions[i - 1] = low;
    rank -= binomial(low, i);
    upper = low - 1;
  }
  assert.equal(rank, 0n);
  return positions;
}

/** @param {bigint} value @param {number} width @returns {string} */
function fixedBits(value, width) {
  assert.ok(value >= 0n && value < (1n << BigInt(width)));
  return width === 0 ? '' : value.toString(2).padStart(width, '0');
}

/** @param {string} bits @returns {Buffer} */
function bitsToBytes(bits) {
  const padded = bits.padEnd(Math.ceil(bits.length / 8) * 8, '0');
  const out = Buffer.alloc(padded.length / 8);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(padded.slice(i * 8, i * 8 + 8), 2);
  }
  return out;
}

/** @param {Buffer} bytes @returns {string} */
function bytesToBits(bytes) {
  return [...bytes].map((b) => b.toString(2).padStart(8, '0')).join('');
}

/**
 * @param {number[]} indices Original GP29 symbols.
 * @returns {{frame:Buffer, payload:Buffer, repeatPositions:number[], iv:number,
 * maskBits:number, rankBits:number, count:number}}
 */
function encode(indices) {
  assert.ok(indices.length >= 1 && indices.length <= 65535);
  assert.ok(indices.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
  const m = indices.length - 1;
  const repeatPositions = [];
  let value = 0n;
  for (let i = 1; i < indices.length; i++) {
    const previous = indices[i - 1], current = indices[i];
    if (current === previous) {
      repeatPositions.push(i - 1);
    } else {
      const rank = current < previous ? current : current - 1;
      assert.ok(rank >= 0 && rank < 28);
      value = value * 28n + BigInt(rank);
    }
  }
  const k = repeatPositions.length;
  const maskCapacity = binomial(m, k);
  const maskRank = colexRank(repeatPositions);
  assert.ok(maskRank < maskCapacity);
  const dataCapacity = 28n ** BigInt(m - k);
  const maskBits = bitWidth(maskCapacity);
  const rankBits = bitWidth(dataCapacity);
  assert.ok(value < dataCapacity);
  const payloadBits = fixedBits(maskRank, maskBits) + fixedBits(value, rankBits);
  const payload = bitsToBytes(payloadBits);
  const header = Buffer.alloc(5);
  header.writeUInt16BE(indices.length, 0);
  header.writeUInt16BE(k, 2);
  header[4] = indices[0];
  return {
    frame: Buffer.concat([header, payload]),
    payload, repeatPositions,
    iv: indices[0], maskBits, rankBits, count: k
  };
}

/**
 * All side information comes from the 5-byte self-framing header.
 * Fixed-width fields and padding are validated, so the inverse is unique.
 * @param {Buffer} frame
 * @returns {number[]}
 */
function decode(frame) {
  assert.ok(frame.length >= 5);
  const length = frame.readUInt16BE(0), k = frame.readUInt16BE(2);
  const iv = frame[4];
  assert.ok(length >= 1 && k <= length - 1 && iv < 29);
  const m = length - 1;
  const maskCapacity = binomial(m, k);
  const dataCapacity = 28n ** BigInt(m - k);
  const maskBits = bitWidth(maskCapacity);
  const rankBits = bitWidth(dataCapacity);
  const totalBits = maskBits + rankBits;
  assert.equal(frame.length, 5 + Math.ceil(totalBits / 8));
  const payloadBits = bytesToBits(frame.subarray(5));
  assert.ok(/^0*$/.test(payloadBits.slice(totalBits)), 'Nonzero final pad');
  const maskRank = BigInt('0b' + (payloadBits.slice(0, maskBits) || '0'));
  let value = BigInt('0b' + (payloadBits.slice(maskBits, totalBits) || '0'));
  assert.ok(maskRank < maskCapacity && value < dataCapacity);
  const events = new Set(unrankColex(maskRank, m, k));
  const digits = Array(m - k);
  for (let i = digits.length - 1; i >= 0; i--) {
    digits[i] = Number(value % 28n);
    value /= 28n;
  }
  assert.equal(value, 0n);
  const indices = [iv];
  let digitIndex = 0;
  for (let j = 0; j < m; j++) {
    const prev = indices[indices.length - 1];
    if (events.has(j)) {
      indices.push(prev);
    } else {
      const d = digits[digitIndex++];
      indices.push(d < prev ? d : d + 1);
    }
  }
  assert.equal(digitIndex, digits.length);
  assert.equal(indices.length, length);
  return indices;
}

/** @param {number[]} cipher @returns {number} */
function repeats(cipher) {
  let count = 0;
  for (let i = 1; i < cipher.length; i++) if (cipher[i] === cipher[i - 1]) count++;
  return count;
}

/** @param {Buffer} bytes @returns {boolean} */
function hasFrozenMagic(bytes) {
  const h = bytes.toString('hex');
  return [
    '1f8b08', // gzip, deflate method
    '425a6831', '425a6832', '425a6833', // BZip2 known leading levels
    '504b0304', // ZIP local file header
    '89504e470d0a1a0a', // PNG
    'fd377a585a00', // XZ
    '377abcaf271c', // 7z
    '255044462d', // %PDF-
    '7f454c46', // ELF
    '0061736d', // wasm
    '53514c69746520666f726d6174203300' // SQLite
  ].some((magic) => h.startsWith(magic));
}

const p57 = original.pages[57].indices;
assert.equal(p57.length, 95);
const p57Frame = encode(p57);
assert.deepEqual(decode(p57Frame.frame), p57);

// An intentionally planted file-signature control goes through the SAME
// decoder. With no repeated symbol, maskCapacity=1 => maskBits=0.
// Put the bytes 1F 8B 08 in the leading most-significant bits of the
// base28 integer. Zero-fill the remainder. Never use this plant to
// select a key, phase or packing convention for real LP2.
const plantLength = 500;
const plantDigits = plantLength - 1;
const plantBits = bitWidth(28n ** BigInt(plantDigits));
const knownGzip = 0x1f8b08n;
const plantValue = knownGzip << BigInt(plantBits - 24);
assert.ok(plantValue < 28n ** BigInt(plantDigits));
const plantRanks = Array(plantDigits);
let remainingPlant = plantValue;
for (let i = plantDigits - 1; i >= 0; i--) {
  plantRanks[i] = Number(remainingPlant % 28n);
  remainingPlant /= 28n;
}
const plantedSource = [24];
for (const rank of plantRanks) {
  const prev = plantedSource[plantedSource.length - 1];
  plantedSource.push(rank < prev ? rank : rank + 1);
}
assert.equal(repeats(plantedSource), 0);
const plantFrame = encode(plantedSource);
assert.deepEqual(decode(plantFrame.frame), plantedSource);
assert.equal(plantFrame.maskBits, 0);
assert.equal(plantFrame.payload.subarray(0, 3).toString('hex'), '1f8b08');
assert.ok(hasFrozenMagic(plantFrame.payload));

// Immutable source-visible visual chapter clocks: the last chapter includes
// the original p54->p55 carried word, so no artificial page reset is added.
const tests = [
  { id: 'p54-55', start: 54, end: 55, count: 308, repeatCount: 3 },
  { id: 'p0-2', start: 0, end: 2, count: 729, repeatCount: 4 },
  { id: 'p40-53', start: 40, end: 53, count: 3008, repeatCount: 18 }
];
const report = [];
for (const test of tests) {
  const indices = original.pages.slice(test.start, test.end + 1)
    .flatMap((page) => page.indices);
  assert.equal(indices.length, test.count);
  assert.equal(repeats(indices), test.repeatCount);
  const encoded = encode(indices);
  assert.equal(encoded.count, test.repeatCount);
  assert.deepEqual(decode(encoded.frame), indices);
  const payload = encoded.payload;
  const printable = [...payload].filter((byte) => byte >= 32 && byte <= 126).length;
  report.push({
    source: test.id,
    runes: indices.length, repetitions: encoded.count,
    maskBits: encoded.maskBits, nonrepeatBits: encoded.rankBits,
    frameBytes: encoded.frame.length, payloadBytes: payload.length,
    payloadSha256: crypto.createHash('sha256').update(payload).digest('hex'),
    first16PayloadHex: payload.subarray(0, 16).toString('hex'),
    first32Printable: payload.subarray(0, 32).toString('latin1')
      .replace(/[^\x20-\x7e]/g, '.'),
    printableBytes: printable,
    originalExactRoundtrip: true,
    frozenWholeFrameMagic: hasFrozenMagic(payload)
  });
}
process.stdout.write(JSON.stringify({
  codec: 'colex repeat-mask plus 28-rank big integer; fixed MSB-first fields',
  header: 'length:uint16BE, repeatCount:uint16BE, firstGPindex:uint8',
  controls: {
    nativeP57: '95/95 rune-exact roundtrip',
    syntheticGzip: 'exact planted 1f8b08 preserved via all 500 native 29-valued rune positions'
  },
  original: report,
  claimLimit: 'Finite bitstream inversion; no creator opcode, genuine plaintext or original binary format authenticated'
}, null, 2) + '\n');

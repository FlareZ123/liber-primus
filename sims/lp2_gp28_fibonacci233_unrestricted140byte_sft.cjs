'use strict';

/**
 * Original LP2 source-gated 55×233 radix28 → 55×140-byte block test.
 * This finite negative does not infer a binary codec or a secret alphabet.
 * Uses only standard Node.js modules and the checked-in original LP2 corpus.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const inputPath = path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json');
const inputText = fs.readFileSync(inputPath, 'utf8');
const corpus = JSON.parse(inputText);
const pages = corpus.pages.filter(p => p.page <= 55);
assert.equal(pages.length, 56);
assert.equal(pages.reduce((total, p) => total + p.indices.length, 0), 12956);

const RADIX = 28n;
const WIDTH = 233;
const PACKET_BYTES = 140;
const PACKETS = 55;
const LIMIT = 256n ** BigInt(PACKET_BYTES);
assert.ok(RADIX ** BigInt(WIDTH) >= LIMIT);

/**
 * @param {number[][]} pageSymbols Original 56 physical page glyph sequences.
 * @param {'cyclic'|'sorted'} convention Fixed, source-defined predecessor rank.
 * @returns {{digits:number[],doublets:number,ivCount:number}}
 */
function nonzeroStepDigits(pageSymbols, convention) {
  const digits = [];
  let doublets = 0;
  let ivCount = 0;
  for (const page of pageSymbols) {
    if (!page.length) continue;
    ivCount++;
    for (let i = 1; i < page.length; i++) {
      const previous = page[i - 1];
      const current = page[i];
      if (current === previous) {
        doublets++;
        continue;
      }
      const digit = convention === 'cyclic'
        ? (current - previous + 29) % 29 - 1
        : current - Number(current > previous);
      assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 28);
      digits.push(digit);
    }
  }
  return { digits, doublets, ivCount };
}

/**
 * @param {number[]} digits A 233-digit packet in the selected reading order.
 * @returns {bigint} Its radix-28 integer.
 */
function toInteger(digits) {
  let value = 0n;
  for (const d of digits) {
    assert.ok(Number.isInteger(d) && d >= 0 && d < 28);
    value = value * RADIX + BigInt(d);
  }
  return value;
}

/**
 * @param {bigint} value Nonnegative 140-byte integer.
 * @returns {number[]} Exactly 233 base28 digits, leading zeros included.
 */
function toDigits(value) {
  assert.ok(value >= 0n && value < LIMIT);
  const digits = Array(WIDTH).fill(0);
  for (let i = WIDTH - 1; i >= 0; i--) {
    digits[i] = Number(value % RADIX);
    value /= RADIX;
  }
  assert.equal(value, 0n);
  return digits;
}

/** @param {bigint} value A valid 140-byte integer. */
function toBytes(value) {
  assert.ok(value >= 0n && value < LIMIT);
  const bytes = Buffer.alloc(PACKET_BYTES);
  for (let i = PACKET_BYTES - 1; i >= 0; i--) {
    bytes[i] = Number(value & 255n);
    value >>= 8n;
  }
  return bytes;
}

/** @param {Buffer} bytes Exactly 140 byte values. */
function fromBytes(bytes) {
  assert.equal(bytes.length, PACKET_BYTES);
  let x = 0n;
  for (const b of bytes) x = x * 256n + BigInt(b);
  return x;
}

/** @param {number[]} digits Exact continuous 12,815-rank register. */
function scan(digits) {
  assert.equal(digits.length, PACKETS * WIDTH);
  const variants = [];
  for (const reverse of [false, true]) {
    const invalid = [];
    const headers = [];
    const leaders = new Set();
    for (let p = 0; p < PACKETS; p++) {
      const block = digits.slice(p * WIDTH, (p + 1) * WIDTH);
      leaders.add(reverse ? block.at(-1) : block[0]);
      if (reverse) block.reverse();
      const value = toInteger(block);
      if (value >= LIMIT) invalid.push(p);
      headers.push(value.toString(16).padStart(PACKET_BYTES * 2, '0').slice(0, 16));
    }
    variants.push({
      packetDigitDirection: reverse ? 'reversed within each 233-digit block' : 'original',
      invalidPacketIndices0Based: invalid,
      validPackets: PACKETS - invalid.length,
      distinctPacketLeaders: leaders.size,
      firstEightPacketHexPrefixes: headers.slice(0, 8)
    });
  }
  return variants;
}

/**
 * Build the exact original-shaped GP29 rune structure with arbitrary
 * 28-rank symbols at original non-doublet positions. IV and exact
 * doublet mask are copied from the original source, not optimized.
 * @param {number[]} digits 12,815 direct source symbols.
 * @param {'cyclic'|'sorted'} convention
 * @returns {number[][]}
 */
function rebuildSynthetic(digits, convention) {
  const out = [];
  let k = 0;
  for (const page of pages) {
    const source = page.indices;
    if (!source.length) { out.push([]); continue; }
    const generated = [source[0]];
    for (let i = 1; i < source.length; i++) {
      const prev = generated.at(-1);
      if (source[i] === source[i - 1]) {
        generated.push(prev);
      } else {
        const d = digits[k++];
        const current = convention === 'cyclic'
          ? (prev + d + 1) % 29
          : d < prev ? d : d + 1;
        assert.notEqual(current, prev);
        generated.push(current);
      }
    }
    out.push(generated);
  }
  assert.equal(k, digits.length);
  return out;
}

/** Deterministic 140-byte unrestricted-binary planted packet. */
function syntheticBlock(index) {
  const chunks = [];
  for (let k = 0; Buffer.concat(chunks).length < PACKET_BYTES; k++) {
    chunks.push(crypto.createHash('sha256').update('GP28-233-BINARY-PLANT-20261112|'+index+'|'+k).digest());
  }
  return Buffer.concat(chunks).subarray(0, PACKET_BYTES);
}

const originalPages = pages.map(p => p.indices);
const sources = {};
let syntheticRecovered = 0;
for (const convention of /** @type {const} */ (['cyclic', 'sorted'])) {
  const original = nonzeroStepDigits(originalPages, convention);
  assert.equal(original.doublets, 86);
  assert.equal(original.ivCount, 55);
  assert.equal(original.digits.length, 12815);
  sources[convention] = scan(original.digits);

  const truth = Array.from({ length: PACKETS }, (_, p) => syntheticBlock(p));
  const syntheticDigits = truth.flatMap(block => toDigits(fromBytes(block)));
  const reconstructed = rebuildSynthetic(syntheticDigits, convention);
  const derived = nonzeroStepDigits(reconstructed, convention);
  assert.deepEqual(derived.digits, syntheticDigits);
  assert.equal(derived.doublets, original.doublets);
  assert.equal(derived.ivCount, original.ivCount);
  assert.deepEqual(reconstructed.map(page => page.length), originalPages.map(page => page.length));
  const decoded = derived.digits;
  for (let p = 0; p < PACKETS; p++) {
    const integer = toInteger(decoded.slice(p * WIDTH, (p + 1) * WIDTH));
    assert.ok(integer < LIMIT);
    assert.deepEqual(toBytes(integer), truth[p]);
    syntheticRecovered += PACKET_BYTES;
  }
}
assert.equal(syntheticRecovered, 15400);
for (const variant of sources.cyclic.concat(sources.sorted)) assert.ok(variant.invalidPacketIndices0Based.length > 0);

const excessBits = WIDTH * Math.log2(28) - PACKET_BYTES * 8;
const randomOverflowProbability = 1 - 2 ** (-excessBits);
console.log(JSON.stringify({
  source: {
    path: 'resources/liber-primus/lp2-corpus.json',
    sha256: crypto.createHash('sha256').update(inputText).digest('hex')
  },
  model: {
    sourceKeyStatus: 'No Cicada instruction selects this decoding.',
    sourceGeometry: '55 page IVs and 86 original doublets excluded, then 55×233 nonzero differences',
    bytesPer233DigitPacket: PACKET_BYTES,
    maximum140ByteIntegerExclusive: '2^1120',
    radix28CapacityDigits: WIDTH,
    excessRadixCapacityBits: excessBits,
    randomUniformOverflowProbability: randomOverflowProbability,
    uniformExpectedInvalidPacketsPer55: 55 * randomOverflowProbability,
    secretAlphabetCaveat: 'A freely unknown 28-way global digit permutation is not ruled out.'
  },
  original: {
    runeCount: 12956, physicalPages: 56, runeBearingPages: 55,
    withheldPageInitializers: 55, removedOriginalDoubletEvents: 86,
    nonzeroSteps: 12815, originalCipherResults: sources
  },
  positivePlant: {
    bytesRecovered: syntheticRecovered,
    originalLengthAndDoubletMaskPreserved: true,
    bothSourceRankConventionsRecoverEveryByte: true
  },
  decision: 'All four fixed natural 233-digit to 140-byte modes overflow on at least three original packets. This is an exact finite impossibility for those direct fixed byte frames, not a general 28-rank cipher exclusion.'
}, null, 2));

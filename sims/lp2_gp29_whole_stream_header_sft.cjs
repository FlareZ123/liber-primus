"use strict";

/**
 * Original LP2 whole-stream GP29 binary-header inversion with any fixed
 * secret GP alphabet (all 29! bijections, without key enumeration).
 * A ciphertext letter's equality pattern must match every forced
 * leading base-29 digit's equality pattern.
 *
 * Scope: a single big-endian base-29 integer, optionally with one leading
 * zero digit, serialized to its exact minimal byte length. This does not
 * test page-wise integers, preprocessing, encryption, or padded transports.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
const source = pages.flatMap(p => p.indices);
const N = source.length;
assert.equal(N, 12956);
assert.notEqual(source[0], source[1]);
assert.deepEqual(source.slice(0, 9), [15, 8, 18, 3, 6, 19, 27, 0, 15]);

const RADIX = 29n;
const RADIX_N_MINUS_2 = RADIX ** BigInt(N - 2);
const RADIX_N_MINUS_1 = RADIX_N_MINUS_2 * RADIX;
const RADIX_N = RADIX_N_MINUS_1 * RADIX;
const LENGTHS = [7866, 7867, 7868];
const powers = Array.from({length: 32}, (_, i) =>
  i === 0 ? 0n : RADIX ** BigInt(N - i));

/**
 * Find all original-position base29 digits fixed by a mandatory binary
 * header, irrespective of the unknown suffix bytes. For a secret rune
 * permutation, at most the first digit can be zero, because the first
 * two source rune identities are different.
 *
 * @param {number[]} header Known leading bytes
 * @param {number} byteLength Minimal big-endian output byte count
 * @param {0|1} zeroPrefixes Number of leading zero radix29 digits
 * @returns {number[]|null} Forced digits or null if no integer can fit
 */
function forcedDigits(header, byteLength, zeroPrefixes) {
  assert(header.length <= byteLength);
  const loSignificant = zeroPrefixes ? RADIX_N_MINUS_2 : RADIX_N_MINUS_1;
  const upSignificant = zeroPrefixes ? RADIX_N_MINUS_1 : RADIX_N;
  let h = 0n;
  for (const b of header) {
    assert(Number.isInteger(b) && b >= 0 && b <= 255);
    h = (h << 8n) + BigInt(b);
  }
  const shift = BigInt((byteLength - header.length) * 8);
  let lo = h << shift;
  let hi = ((h + 1n) << shift) - 1n;
  if (lo < loSignificant) lo = loSignificant;
  if (hi >= upSignificant) hi = upSignificant - 1n;
  if (lo > hi) return null;

  const forced = [];
  for (let j = 1; j <= 31; j++) {
    const unit = powers[j];
    if (lo / unit !== hi / unit) break;
    forced.push(Number((lo / unit) % RADIX));
  }
  return forced;
}

/**
 * Equality and inequality of digits are invariant under all 29! secret
 * alphabet permutations. Return the earliest differing pair of positions.
 * @param {number[]} expected Forced base29 digit prefix
 * @param {number[]} actual Ciphertext rune indices
 * @returns {{first:number,second:number}|null}
 */
function firstConflict(expected, actual) {
  for (let i = 1; i < expected.length; i++) {
    for (let j = 0; j < i; j++) {
      if ((expected[i] === expected[j]) !== (actual[i] === actual[j])) {
        return {first: j, second: i};
      }
    }
  }
  return null;
}

/**
 * Exhaust all possible significant-digit cases and minimum byte lengths.
 * At least one candidate with no equality contradiction would be needed.
 * @param {number[]} header
 * @param {number[]} [ciphertext=source]
 */
function survivingCases(header, ciphertext = source) {
  const survivors = [];
  for (const zeroPrefixes of [0, 1]) {
    for (const byteLength of LENGTHS) {
      const digits = forcedDigits(header, byteLength, zeroPrefixes);
      if (digits && !firstConflict(digits, ciphertext)) {
        survivors.push({byteLength, zeroPrefixes, digits});
      }
    }
  }
  return survivors;
}

/** The LZ4 format's official xxHash32 2-byte descriptor checksum. */
function lz4HeaderChecksum(flg, bd) {
  const rol = (v, k) => (v << k) | (v >>> (32 - k));
  let h = (0x165667b1 + 2) >>> 0;
  for (const byte of [flg, bd]) {
    h = Math.imul(rol((h + Math.imul(byte, 0x165667b1)) >>> 0, 11),
      0x9e3779b1) >>> 0;
  }
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca77) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae3d) >>> 0;
  h ^= h >>> 16;
  return (h >>> 8) & 255;
}
assert.equal(lz4HeaderChecksum(0x40, 0x40), 192);
assert.equal(lz4HeaderChecksum(0x60, 0x70), 115);

/** @param {number} flg @param {number} bd */
function lz4Header(flg, bd) {
  return [4, 34, 77, 24, flg, bd, lz4HeaderChecksum(flg, bd)];
}

const jpegFirstMarkers = [1,
  ...Array.from({length: 0xfe - 0xc0 + 1}, (_, i) => 0xc0 + i),
  0xff]; // 0xff can be a fill byte preceding a normal first marker.
for (const firstMarker of jpegFirstMarkers) {
  assert.deepEqual(survivingCases([255, 216, 255, firstMarker]), []);
}
assert.equal(jpegFirstMarkers.length, 65);

// Representative exact witnesses at the only byte length permitting JPEG.
const jpegJfifDigits = forcedDigits([255, 216, 255, 0xe0], 7867, 0);
const jpegTemDigits = forcedDigits([255, 216, 255, 0x01], 7867, 0);
assert.deepEqual(jpegJfifDigits, [1, 23, 13, 15, 14, 14]);
assert.deepEqual(firstConflict(jpegJfifDigits, source),
  {first: 4, second: 5});
assert.deepEqual(jpegTemDigits, [1, 23, 13, 15, 14, 12, 12]);
assert.deepEqual(firstConflict(jpegTemDigits, source),
  {first: 5, second: 6});

// Ordinary one-block LZ4 frames: every legal no-extra-fields FLG/BD,
// compressed or uncompressed block, and both possible extra checksums.
const flags = [0x40, 0x60, 0x50, 0x44, 0x70, 0x64, 0x54, 0x74];
const bds = [0x40, 0x50, 0x60, 0x70];
let lz4Cases = 0;
let headerCompatible = 0;
for (const flg of flags) {
  for (const bd of bds) {
    const head = lz4Header(flg, bd);
    if (survivingCases(head).length > 0) headerCompatible++;
    for (const raw of [false, true]) {
      for (const byteLength of LENGTHS) {
        const payloadLength = byteLength - 7 - 4 - 4
          - ((flg & 0x10) ? 4 : 0) - ((flg & 0x04) ? 4 : 0);
        assert(payloadLength > 0 && payloadLength < 65536);
        const block = (payloadLength + (raw ? 0x80000000 : 0)) >>> 0;
        const sizeLE = [0, 8, 16, 24].map(k => (block >>> k) & 255);
        // Constrain the file to its own fixed byte length as well.
        for (const zeroPrefixes of [0, 1]) {
          const digits = forcedDigits([...head, ...sizeLE],
            byteLength, zeroPrefixes);
          assert(digits === null || firstConflict(digits, source) !== null);
        }
      }
      lz4Cases++;
    }
  }
}
assert.equal(lz4Cases, 64);
assert.equal(headerCompatible, 0);

// Constructive positive: a complete binary message with a standard JPEG
// header, and a valid uncompressed single-block LZ4 frame. Secret 29-way
// alphabets must preserve their header fingerprints and fully roundtrip.

/**
 * @param {Buffer} bytes
 * @param {number} byteLength
 * @param {number[]} prefix
 */
function positiveRoundTrip(bytes, byteLength, prefix) {
  assert.equal(bytes.length, byteLength);
  let value = BigInt("0x" + bytes.toString("hex"));
  assert(value >= RADIX_N_MINUS_1 && value < RADIX_N);
  const original = value;
  const digits = Array(N);
  for (let i = N - 1; i >= 0; i--) {
    digits[i] = Number(value % RADIX);
    value /= RADIX;
  }
  assert.equal(value, 0n);
  const privateMap = Array.from({length: 29}, (_, i) =>
    (17 * i + 3) % 29);
  assert.equal(new Set(privateMap).size, 29);
  const hiddenCipher = digits.map(d => privateMap[d]);
  assert(survivingCases(prefix, hiddenCipher).some(x =>
    x.byteLength === byteLength && x.zeroPrefixes === 0));
  const inverse = Array(29);
  for (let i = 0; i < 29; i++) inverse[privateMap[i]] = i;
  let rebuilt = 0n;
  for (const rune of hiddenCipher) {
    rebuilt = rebuilt * RADIX + BigInt(inverse[rune]);
  }
  assert.equal(rebuilt, original);
  assert.deepEqual(Buffer.from(rebuilt.toString(16)
    .padStart(2 * byteLength, "0"), "hex"), bytes);
}

const jpegHeader = Buffer.from("ffd8ffe000104a46494600010102", "hex");
const jpegPositive = Buffer.alloc(7867);
jpegHeader.copy(jpegPositive);
for (let i = jpegHeader.length; i < jpegPositive.length; i++) {
  jpegPositive[i] = (i * 37 + 11) & 255;
}
positiveRoundTrip(jpegPositive, 7867, [...jpegHeader]);

const lz4Head = lz4Header(0x60, 0x40);
const lz4RawSize = 7868 - 15;
const lz4Size = (lz4RawSize + 0x80000000) >>> 0;
const lz4SizeLE = Buffer.alloc(4);
lz4SizeLE.writeUInt32LE(lz4Size);
const lz4Payload = Buffer.alloc(lz4RawSize);
for (let i = 0; i < lz4RawSize; i++) lz4Payload[i] = (i * 73 + 5) & 255;
const lz4Positive = Buffer.concat([
  Buffer.from(lz4Head), lz4SizeLE, lz4Payload, Buffer.alloc(4)]);
positiveRoundTrip(lz4Positive, 7868, [...lz4Head, ...lz4SizeLE]);

console.log(JSON.stringify({
  source: "resources/liber-primus/lp2-corpus.json",
  originalUnknownRunes: N,
  possibleLeadingZeroDigits: [0, 1],
  possibleMinimumByteLengths: LENGTHS,
  jpeg: {validFirstMarkerOrFillCasesTested: jpegFirstMarkers.length,
    survivingSecretPermutations: 0,
    JFIF: {forcedDigits: jpegJfifDigits, witness: [4, 5]},
    TEM: {forcedDigits: jpegTemDigits, witness: [5, 6]}},
  lz4: {ordinaryOneBlockVariants: lz4Cases,
    rawHeaderCompatible: headerCompatible,
    completeOneBlockSurvivors: 0},
  positive: {jpegHeader: "exact binary roundtrip",
    validUncompressedLZ4: "exact binary roundtrip"},
  recoveredUnknownPlaintext: false,
}, null, 2));

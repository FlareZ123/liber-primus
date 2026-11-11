'use strict';

/**
 * Reproducible source-fixed five-bit packing of original unknown GP29 runes,
 * with exactly two declared representations: rune-only and one code 29
 * between each pair of canonical printed words. Does not search offsets,
 * padding rules, endianness, alternative alphabets, or compression keys.
 *
 * Run: node sims/lp2_fivebit_serialization_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const runeMap = new Map(corpus.runes.map((rune, index) => [rune, index]));
const rawUnsolvedPages = raw.split('%').slice(0, 55).join('%');
const runic = /[\u16A0-\u16FF]/u;

/** @type {string[]} Canonical words; slashes/spaces/page transitions do not end words. */
const words = [];
let word = '';
for (const character of rawUnsolvedPages) {
  if (runic.test(character)) {
    word += character;
  } else if (character === '%' || character === '/' || /\s/u.test(character)) {
    // Page and printed-line transitions are not word boundaries.
  } else if (word) {
    words.push(word);
    word = '';
  }
}
if (word) words.push(word);
assert.equal(words.length, 2896);

/** @type {number[]} */
const runeValues = [];
/** @type {number[]} */
const separatedValues = [];
words.forEach((runes, index) => {
  if (index) separatedValues.push(29);
  for (const rune of runes) {
    const value = runeMap.get(rune);
    assert.notEqual(value, undefined);
    runeValues.push(value);
    separatedValues.push(value);
  }
});
assert.equal(runeValues.length, 12956);
assert.equal(separatedValues.length, 15851);
const originalFromPages = corpus.pages.filter(page => page.status === 'unsolved').flatMap(page => page.indices);
assert.deepEqual(runeValues, originalFromPages);

/**
 * Continuous MSB-first 5-bit packing, zero padding only at final partial byte.
 * @param {number[]} values Symbol values in [0,29].
 * @returns {Buffer}
 */
function pack(values) {
  const bytes = [];
  let bits = 0;
  let count = 0;
  for (const value of values) {
    assert.ok(Number.isInteger(value) && value >= 0 && value < 32);
    bits = (bits << 5) | value;
    count += 5;
    while (count >= 8) {
      count -= 8;
      bytes.push((bits >>> count) & 255);
      bits &= (1 << count) - 1;
    }
  }
  if (count) bytes.push(bits << (8 - count));
  return Buffer.from(bytes);
}

/**
 * Unpack exactly n original symbols and check the excluded pad bits.
 * @param {Buffer} bytes
 * @param {number} numberOfSymbols
 * @returns {number[]}
 */
function unpack(bytes, numberOfSymbols) {
  const values = [];
  let bits = 0;
  let count = 0;
  for (const byte of bytes) {
    bits = (bits << 8) | byte;
    count += 8;
    while (count >= 5 && values.length < numberOfSymbols) {
      count -= 5;
      values.push((bits >>> count) & 31);
      bits &= (1 << count) - 1;
    }
  }
  assert.equal(bits, 0, 'only final zero padding is permitted');
  return values;
}
const signatures = new Map([
  ['PNG', '89504e470d0a1a0a'],
  ['JPEG', 'ffd8ff'],
  ['GIF87a', '474946383761'],
  ['GIF89a', '474946383961'],
  ['ZIP', '504b0304'],
  ['GZIP', '1f8b'],
  ['BZIP2', '425a68'],
  ['XZ', 'fd377a585a00'],
  ['7ZIP', '377abcaf271c'],
  ['PDF', '255044462d'],
  ['ELF', '7f454c46'],
  ['SQLite', '53514c69746520666f726d6174203300'],
  ['OGG', '4f676753'],
  ['RIFF', '52494646'],
  ['Zstandard', '28b52ffd']
]);

/**
 * @param {string} name
 * @param {number[]} input
 * @param {string} expectedDigest
 * @returns {object}
 */
function analyze(name, input, expectedDigest) {
  const bytes = pack(input);
  assert.deepEqual(unpack(bytes, input.length), input);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(hash, expectedDigest);
  const hex = bytes.toString('hex');
  const magic = Array.from(signatures).filter(([, prefix]) => hex.startsWith(prefix)).map(([name]) => name);
  assert.deepEqual(magic, []);

  // Wrapped compression uses its own header and checksum. A failed attempt
  // cannot be treated as evidence against arbitrary raw/compressed formats.
  const decodedFormats = [];
  for (const [format, inflate] of [['zlib', zlib.inflateSync], ['gzip', zlib.gunzipSync]]) {
    try {
      const decoded = inflate(bytes);
      decodedFormats.push({format, length: decoded.length});
    } catch (error) {
      assert.ok(error instanceof Error);
    }
  }
  assert.deepEqual(decodedFormats, []);

  const histogram = new Array(256).fill(0);
  let printable = 0;
  let currentPrintableRun = 0;
  let longestPrintableRun = 0;
  for (const byte of bytes) {
    histogram[byte] += 1;
    if (byte >= 32 && byte <= 126) {
      printable++;
      currentPrintableRun++;
      longestPrintableRun = Math.max(longestPrintableRun, currentPrintableRun);
    } else {
      currentPrintableRun = 0;
    }
  }
  const entropy = histogram.reduce((sum, count) => {
    if (!count) return sum;
    const p = count / bytes.length;
    return sum - p * Math.log2(p);
  }, 0);
  return {
    name, symbolCount: input.length, totalBits: input.length * 5,
    outputBytes: bytes.length, sha256: hash,
    first32Bytes: bytes.subarray(0, 32).toString('hex'),
    last16Bytes: bytes.subarray(-16).toString('hex'),
    finalZeroPadBits: (8 - (input.length * 5) % 8) % 8,
    entropyBitsPerByte: entropy,
    distinctBytes: histogram.filter(Boolean).length,
    printableAsciiFraction: printable / bytes.length,
    longestPrintableRun, validLeadingSignatures: magic,
    checksumVerifiedCompression: decodedFormats
  };
}

const output = [
  analyze('GP29 runes only', runeValues, '18cff7fcdd3b33c8f8c33156e18de8784a8ef7cfce1e74963a1a3e08b59b3591'),
  analyze('GP29 plus canonical word breaks as value 29', separatedValues, '42382165b2a4bdd94c62f90a564354e9c80046aa124c70ecb2ac0c75ff2736e1')
];
assert.equal(output[0].outputBytes, 8098);
assert.equal(output[1].outputBytes, 9907);
console.log(JSON.stringify(output, null, 2));

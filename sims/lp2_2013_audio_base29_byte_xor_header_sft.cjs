'use strict';

/**
 * Single-file original-input SFT: historically demonstrated 2013 BASE29
 * integer transport followed by byte-wise XOR with the historically used
 * 2013 AUDIO/761.MP3 byte stream. Test only packet-header fingerprints.
 *
 * The immutable 761.MP3 ID3v2.3.0 first 10 bytes and original MPEG sync
 * first four bytes at file offset 206 are independently source-pinned in
 * im-results/audio761-original-id3-frame-inventory.md. This does not infer
 * the remaining MP3 contents, decrypt a complete file, or test other keys.
 *
 * Original runes and packet boundaries: LP2 p0..p55, visual chapter cuts.
 * Node.js 22, read-only, no packages or external downloads.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);

const chapterSpans = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

const packets = [
  ['whole-book', pages.flatMap((p) => p.indices)],
  ...chapterSpans.map(([a, b]) => [
    'chapter-' + a + '-' + b,
    pages.filter((p) => p.page >= a && p.page <= b)
      .flatMap((p) => p.indices)
  ]),
  ...pages.map((p) => ['page-' + p.page, p.indices])
];
assert.equal(packets.length, 65);

/**
 * The authenticated 2013 BASE29 operation interprets a rune sequence as an
 * integer. This decoder emits its minimal or original mathematical fixed
 * byte width. Both are unambiguous, keyless original readouts.
 *
 * @param {number[]} runes
 * @param {boolean} fixedWidth
 * @returns {Buffer}
 */
function fromBase29(runes, fixedWidth) {
  let n = 0n;
  for (const r of runes) {
    assert(Number.isInteger(r) && r >= 0 && r < 29);
    n = n * 29n + BigInt(r);
  }
  let hex = n.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  if (fixedWidth) {
    hex = hex.padStart(2 * Math.ceil(
      runes.length * Math.log2(29) / 8), '0');
  }
  return Buffer.from(hex, 'hex');
}

/**
 * @param {Buffer} plain
 * @returns {number[]}
 */
function encodeBase29(plain) {
  let n = BigInt('0x' + plain.toString('hex'));
  const digits = [];
  while (n) {
    digits.push(Number(n % 29n));
    n /= 29n;
  }
  return digits.reverse();
}

/** @param {Buffer} a @param {Buffer} key @returns {Buffer} */
function xorPrefix(a, key) {
  assert(a.length >= key.length);
  return Buffer.from(key.map((value, i) => value ^ a[i]));
}

// Source-native SHA-256 of full 2013 MP3: 83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460.
// Published ID3v2.3 body length is 196 (206 total). No external bytes guessed.
const sourceHeaders = [
  { label: 'entire-mp3-from-byte-0', bytes: Buffer.from('49443303000000000144', 'hex') },
  { label: 'mpeg-audio-first-frame-byte-206', bytes: Buffer.from('fffbb064', 'hex') }
];

// Recognizable 2014-era raw unencrypted artifact containers.
const fileMagic = [
  ['gzip', '1f8b08'],
  ['bzip2', '425a68'],
  ['zip', '504b0304'],
  ['xz', 'fd377a585a00'],
  ['png', '89504e470d0a1a0a'],
  ['pdf', '255044462d'],
  ['7zip', '377abcaf271c'],
  ['pgp-armour', '2d2d2d2d2d424547494e']
];

const planting = Buffer.from('1f8b0800000000000003', 'hex');
assert.deepEqual(fromBase29(encodeBase29(planting), false), planting);
const plantedWithAudioHeader = xorPrefix(planting, sourceHeaders[0].bytes);
assert.deepEqual(xorPrefix(plantedWithAudioHeader, sourceHeaders[0].bytes), planting);

let trials = 0;
const matches = [];
for (const [unit, digits] of packets) {
  for (const fixedWidth of [true, false]) {
    const raw = fromBase29(digits, fixedWidth);
    for (const header of sourceHeaders) {
      const decoded = xorPrefix(raw, header.bytes);
      const h = decoded.toString('hex');
      trials++;
      for (const [format, magic] of fileMagic) {
        // A 4-byte MPEG header cannot test an 8-byte PNG signature.
        if (magic.length <= h.length && h.startsWith(magic)) {
          matches.push({ unit, fixedWidth, header: header.label, format, h });
        }
      }
    }
  }
}

const book = fromBase29(packets[0][1], true);
assert.equal(book.subarray(0, 10).toString('hex'), '08734843a55193dcbb72');
assert.equal(xorPrefix(book, sourceHeaders[0].bytes).toString('hex'),
  '41377b40a55193dcba36');
assert.equal(trials, 260);
assert.deepEqual(matches, []);

console.log(JSON.stringify({
  experiment: 'authentic 2013 BASE29 -> 761.MP3 XOR, original GP packet header only',
  source_packet_units: packets.length,
  tests: trials,
  source_headers: sourceHeaders.map((h) => ({
    label: h.label, inspected_bytes: h.bytes.length
  })),
  known_magic_matches: matches,
  whole_book_native_first10: book.subarray(0, 10).toString('hex'),
  whole_book_id3_xor_first10:
    xorPrefix(book, sourceHeaders[0].bytes).toString('hex'),
  caveat: 'header-only necessary-condition test, not complete-file decrypt'
}, null, 2));
